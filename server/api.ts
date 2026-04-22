import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedbackPayload = {
  summary: string;
  pattern: string;
  next_step: string;
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
      max_tokens: 350,
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

function parseFeedbackPayload(raw: string): FeedbackPayload | null {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const summary =
      typeof parsed.summary === 'string'
        ? parsed.summary
        : typeof parsed.journal_summary === 'string'
          ? parsed.journal_summary
          : null;
    const pattern =
      typeof parsed.pattern === 'string'
        ? parsed.pattern
        : typeof parsed.analysis === 'string'
          ? parsed.analysis
          : null;
    const next_step =
      typeof parsed.next_step === 'string'
        ? parsed.next_step
        : typeof parsed.ai_question === 'string'
          ? parsed.ai_question
          : null;

    if (summary && pattern && next_step) {
      return {
        summary: summary.trim(),
        pattern: pattern.trim(),
        next_step: next_step.trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── System prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a warm, thoughtful reflective coach. Read the learner's journal reflection and produce three short pieces of feedback.

Tone: curious, human, specific. Never clinical, never performative. Do not use phrases like "it sounds like" or "it seems like". Do not give advice as commands.

Return STRICT JSON with exactly these three string fields:
{
  "summary": "1-2 sentences in third person synthesizing the most reflective moment in what they wrote. Distill meaning, do not paraphrase their words verbatim. Example: 'The learner noticed that slowing down changed how present they felt.'",
  "pattern": "1-2 sentences naming a pattern, tension, or underlying signal you see in their reflection. Stay grounded in what they wrote. Avoid generic platitudes.",
  "next_step": "ONE question or gentle invitation (1-2 sentences) that nudges them one level deeper — toward a feeling, cause, insight, or small experiment they could try. Phrase as a question when possible."
}

Rules:
1. Base all three fields on what the learner actually wrote.
2. Never mention frameworks, stages, or coaching jargon.
3. Keep each field short and specific.
4. Return JSON only — no preamble, no code fences.`;

// ─── User prompt builder ─────────────────────────────────────────────────────

function buildUserPrompt(
  moduleId: string | undefined,
  moduleTitle: string | undefined,
  selectedSignals: string[],
  reflectionText: string,
): string {
  const lines: string[] = [];
  if (moduleTitle || moduleId) {
    lines.push(`Module: ${moduleTitle ?? moduleId}${moduleId && moduleTitle ? ` (${moduleId})` : ''}`);
  }
  if (selectedSignals.length > 0) {
    lines.push(`Selected signals: ${selectedSignals.join(', ')}`);
  }
  lines.push(`Reflection: ${reflectionText.trim()}`);
  return lines.join('\n');
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/feedback', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Accept both legacy ({ journalEntry }) and richer ({ moduleId, reflectionText, ... }) payloads.
  const reflectionRaw =
    typeof body.reflectionText === 'string' && body.reflectionText.trim()
      ? body.reflectionText
      : typeof body.journalEntry === 'string'
        ? body.journalEntry
        : '';

  if (!reflectionRaw.trim()) {
    return res.status(400).json({ error: 'Missing reflection text.' });
  }

  const moduleId = typeof body.moduleId === 'string' && body.moduleId.trim() ? body.moduleId : undefined;
  const moduleTitle = typeof body.moduleTitle === 'string' ? body.moduleTitle : undefined;
  const selectedSignals: string[] = Array.isArray(body.selectedSignals)
    ? (body.selectedSignals as unknown[]).filter((v): v is string => typeof v === 'string')
    : [];

  const userPrompt = buildUserPrompt(moduleId, moduleTitle, selectedSignals, reflectionRaw);

  try {
    const raw = await requestOpenAI(SYSTEM_PROMPT, userPrompt);
    const parsed = parseFeedbackPayload(raw);

    if (!parsed) {
      console.error('/api/feedback: invalid model output', raw);
      return res.status(502).json({ error: 'Model did not return valid feedback JSON' });
    }

    console.info('/api/feedback ok', {
      moduleId,
      summary: parsed.summary.slice(0, 80),
    });
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

// ─── /api/pattern — cross-entry pattern insight ──────────────────────────────

type PatternEntry = {
  moduleId: string;
  moduleTitle?: string;
  selectedSignals?: string[];
  reflectionText?: string;
};

const PATTERN_SYSTEM_PROMPT = `You are a reflective coach reading multiple recent journal entries from the same learner across different modules.

Look for a cross-entry pattern — a recurring tension, stance, or underlying signal that shows up in more than one entry. Do not summarize each entry. Do not give advice.

Return STRICT JSON with two string fields:
{
  "pattern": "2-3 sentences naming the recurring pattern or tension you see across entries. Ground it in specifics from what they wrote, without quoting long passages.",
  "next_step": "1 sentence — a gentle reflective question or invitation that points at the pattern."
}

Rules: return JSON only. No preamble, no code fences. Keep it concrete and specific to this learner.`;

app.post('/api/pattern', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const entries = Array.isArray(body.entries) ? (body.entries as PatternEntry[]) : [];

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No entries provided.' });
  }

  const lines: string[] = [];
  entries.forEach((entry, idx) => {
    const title = entry.moduleTitle || entry.moduleId || `Entry ${idx + 1}`;
    lines.push(`— Entry ${idx + 1} (${title}) —`);
    if (Array.isArray(entry.selectedSignals) && entry.selectedSignals.length > 0) {
      lines.push(`Selected signals: ${entry.selectedSignals.join(', ')}`);
    }
    if (typeof entry.reflectionText === 'string' && entry.reflectionText.trim()) {
      lines.push(`Reflection: ${entry.reflectionText.trim()}`);
    }
    lines.push('');
  });
  const userPrompt = lines.join('\n');

  try {
    const raw = await requestOpenAI(PATTERN_SYSTEM_PROMPT, userPrompt);
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    const parsed = JSON.parse(jsonText) as { pattern?: unknown; next_step?: unknown };

    if (typeof parsed.pattern !== 'string' || typeof parsed.next_step !== 'string') {
      return res.status(502).json({ error: 'Model did not return valid pattern JSON' });
    }

    return res.json({
      pattern: parsed.pattern.trim(),
      next_step: parsed.next_step.trim(),
    });
  } catch (err) {
    if (err instanceof ProviderError) {
      console.error('/api/pattern provider error:', err.message);
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Error generating pattern insight:', err);
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
