import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryFeedbackPayload = {
  journal_summary: string;
  ai_question: string;
  gibbs_stage: string;
};

class ProviderError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ─── OpenAI helper ───────────────────────────────────────────────────────────

async function requestOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new ProviderError(500, 'No API key configured. Set OPENAI_API_KEY.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 250,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new ProviderError(429, 'OpenAI quota exceeded. Please try again shortly.');
    if (response.status === 401 || response.status === 403) throw new ProviderError(401, 'OpenAI API key is invalid or unauthorized.');
    throw new ProviderError(502, `OpenAI request failed with status ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─── Response parser ─────────────────────────────────────────────────────────

function parseEntryFeedbackPayload(raw: string): EntryFeedbackPayload | null {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;

  try {
    const parsed = JSON.parse(jsonText) as Partial<EntryFeedbackPayload>;
    if (
      typeof parsed.journal_summary === 'string' &&
      typeof parsed.ai_question === 'string' &&
      typeof parsed.gibbs_stage === 'string'
    ) {
      return {
        journal_summary: parsed.journal_summary.trim(),
        ai_question: parsed.ai_question.trim(),
        gibbs_stage: parsed.gibbs_stage.trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── System prompt (Gibbs Reflective Cycle) ──────────────────────────────────

const SYSTEM_PROMPT = `You are a thoughtful, warm reflective coach. Your only job is to read what the user wrote and ask ONE question that helps them think one level deeper. You do not summarize, advise, or evaluate. You ask questions. Your tone is curious and human, never clinical or performative.

You use the Gibbs Reflective Cycle as a hidden diagnostic framework. The user never sees "Gibbs" mentioned. Use it only to determine what question to ask.

Gibbs Stages and what they look like:
- description: User describes facts, situations, what happened — push toward Feelings ("How did you feel?" / "What was your reaction?")
- feelings: User mentions emotions, reactions, discomfort — push toward Evaluation ("What worked or didn't?")
- evaluation: User notes what felt good or bad — push toward Analysis ("Why do you think that is?")
- analysis: User explains reasons, patterns, causes — push toward Conclusion ("What are you taking away?")
- conclusion: User articulates a learning or insight — push toward Action Plan ("What will you do or notice differently?")
- action_plan: User identifies a next step or experiment — affirm and anchor the specificity of their intention with a question

Rules for the question:
1. Classify the user's reflection into one Gibbs stage. Choose the deepest stage their writing clearly reaches.
2. Write ONE question (1–2 sentences) that moves them one stage deeper.
3. Do not reference the user's words back verbatim. Do not paraphrase their response as a preamble.
4. Do not use phrases like "it sounds like" or "it seems like."
5. Do not give advice. Ask only.
6. The question should feel like it came from a curious human, not a chatbot.

For journal_summary:
- Write 1–2 sentences synthesizing the most reflective moment in the user's response.
- Write in third person ("The learner noticed...", "They described...").
- Do not repeat the user's exact words. Distill the meaning.

Return STRICT JSON:
{
  "journal_summary": "1–2 sentence third-person synthesis of the most reflective response",
  "ai_question": "The single question to show the user",
  "gibbs_stage": "one of: description | feelings | evaluation | analysis | conclusion | action_plan"
}`;

// ─── Per-module Gibbs calibration hints (PRD §3) ─────────────────────────────

type ModuleGibbsContext = {
  expectedStageRange: string;
  pushDirection: string;
  questionStyle: string;
};

const MODULE_GIBBS_CONTEXT: Record<string, ModuleGibbsContext> = {
  reframe: {
    expectedStageRange: 'description to feelings',
    pushDirection: 'feelings toward evaluation — probe whether the feeling lasts or fades',
    questionStyle:
      'Probe the durability or reliability of the feeling. E.g. "When you notice that feeling fading, what do you usually do next?"',
  },
  observe: {
    expectedStageRange: 'description to evaluation',
    pushDirection: 'evaluation toward analysis — ask what was actually happening inside them',
    questionStyle:
      'Surface the internal mechanism, not the external event. E.g. "What do you think was happening in you during that moment — not around you, but inside?"',
  },
  branching: {
    expectedStageRange: 'evaluation to analysis',
    pushDirection: 'analysis toward conclusion — ask what it would mean about them if this worked',
    questionStyle:
      'Connect the hypothetical to identity, not logistics. E.g. "If this actually worked out — not just the outcome, but the version of you that did it — what would that tell you about yourself?"',
  },
  ideate: {
    expectedStageRange: 'conclusion to action_plan',
    pushDirection: 'action_plan — anchor their intention to a specific upcoming moment',
    questionStyle:
      'Make the intention concrete and near-term without being prescriptive. E.g. "When in the next week might you actually have a chance to choose that — even in a small way?"',
  },
};

// ─── User prompt builder ─────────────────────────────────────────────────────

function buildUserPrompt(
  moduleId: string,
  moduleTitle: string,
  selectedSignals: string[],
  reflectionText: string,
): string {
  const lines: string[] = [`Module: ${moduleTitle} (${moduleId})`];
  if (selectedSignals.length > 0) {
    lines.push(`Selected signals: ${selectedSignals.join(', ')}`);
  }
  if (reflectionText.trim()) {
    lines.push(`Reflection: ${reflectionText.trim()}`);
  }

  const ctx = MODULE_GIBBS_CONTEXT[moduleId];
  if (ctx) {
    lines.push('');
    lines.push('Calibration hint (not visible to user):');
    lines.push(`- Users at this module typically write at the ${ctx.expectedStageRange} stage.`);
    lines.push(`- Push direction: ${ctx.pushDirection}.`);
    lines.push(`- Question style: ${ctx.questionStyle}`);
  }

  return lines.join('\n');
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/feedback', async (req, res) => {
  const { moduleId, moduleTitle, selectedSignals, reflectionText } = req.body ?? {};

  if (typeof moduleId !== 'string' || !moduleId.trim()) {
    return res.status(400).json({ error: 'Missing or invalid moduleId.' });
  }
  if (typeof reflectionText !== 'string' || !reflectionText.trim()) {
    return res.status(400).json({ error: 'Missing or invalid reflectionText.' });
  }

  const moduleTitleStr = typeof moduleTitle === 'string' ? moduleTitle : moduleId;
  const signals: string[] = Array.isArray(selectedSignals) ? selectedSignals : [];
  const reflection = reflectionText.trim();

  const userPrompt = buildUserPrompt(moduleId, moduleTitleStr, signals, reflection);

  try {
    const raw = await requestOpenAI(SYSTEM_PROMPT, userPrompt);
    const parsed = parseEntryFeedbackPayload(raw);

    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return valid feedback JSON' });
    }

    console.info('/api/feedback gibbs_stage:', parsed.gibbs_stage);
    return res.json(parsed);
  } catch (err) {
    if (err instanceof ProviderError) {
      console.error('/api/feedback provider error:', err.message);
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Error generating feedback:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

export { app };

// Only start a standalone HTTP listener when this file is executed directly
// (e.g. `tsx server/api.ts`). During `vite dev` the app is mounted as
// middleware on the Vite dev server (see vite.config.ts), so no separate
// port is opened.
const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  /server[\\/]api\.ts$/.test(process.argv[1]);

if (isDirectRun) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Reflection API server running on port ${PORT}`);
  });
}
