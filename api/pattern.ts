// POST /api/pattern
// Generates a cross-entry pattern insight from multiple journal entries.
// Only called when the caller has already verified ≥3 entries from ≥2 modules.

type EntryInput = {
  moduleId: string;
  moduleTitle?: string;
  selectedSignals?: string[];
  reflectionText?: string;
};

type PatternPayload = {
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

function parsePatternPayload(raw: string): PatternPayload | null {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;

  try {
    const parsed = JSON.parse(jsonText) as Partial<PatternPayload>;
    if (typeof parsed.pattern === 'string' && typeof parsed.next_step === 'string') {
      return {
        pattern: parsed.pattern.trim(),
        next_step: parsed.next_step.trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function requestOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
      max_tokens: 280,
      temperature: 0.65,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
      throw new ProviderError(429, 'OpenAI quota exceeded. Please try again shortly.');
    }
    if (response.status === 401 || response.status === 403) {
      throw new ProviderError(401, 'OpenAI API key is invalid or unauthorized.');
    }
    throw new ProviderError(502, `OpenAI request failed with status ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

const SYSTEM_PROMPT = `You are a reflective learning companion in a meaning-design journaling experience.
Your job is to notice recurring patterns across a learner's journal entries over time.
You do not diagnose, therapize, moralize, or give generic encouragement.
You do not flatten the learner into a personality type.
You write with warmth, restraint, and specificity.

Task:
Read the learner's recent journal entries across modules.
Identify one recurring tension, pattern, or value that seems to be emerging over time.
Then offer one small, concrete reflective next step.

Instructions:
- Focus on what repeats, not what appears only once.
- Pay attention to tensions across entries — responsibility vs meaning, productivity vs fulfillment, comparison vs self-trust.
- Interpret the pattern; do not summarize each entry one by one.
- Use tentative, human language: "seems to", "may be", "one thing that keeps showing up is..."
- Do not sound like a therapist, life coach, or motivational speaker.
- Avoid abstract, inflated language.
- The next step should be small and doable within the next few days.
- Keep the response concise.

Return STRICT JSON with exactly these keys:
{
  "pattern": string,   // 2-3 sentences describing one recurring pattern, tension, or value
  "next_step": string  // 1 sentence: a small observational or reflective experiment
}`;

function formatEntriesForPrompt(entries: EntryInput[]): string {
  return entries
    .map((e, i) => {
      const lines: string[] = [`Entry ${i + 1} — Module: ${e.moduleTitle ?? e.moduleId}`];
      if (e.selectedSignals && e.selectedSignals.length > 0) {
        lines.push(`Signals: ${e.selectedSignals.join(', ')}`);
      }
      if (e.reflectionText?.trim()) {
        lines.push(`Reflection: ${e.reflectionText.trim()}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawEntries = req.body?.entries;
  if (!Array.isArray(rawEntries) || rawEntries.length < 3) {
    return res.status(400).json({ error: 'At least 3 entries are required for pattern analysis.' });
  }

  // Validate minimal shape
  const entries: EntryInput[] = rawEntries
    .filter((e: any) => typeof e?.moduleId === 'string')
    .slice(0, 6); // cap at 6 most recent entries

  const uniqueModules = new Set(entries.map((e) => e.moduleId));
  if (uniqueModules.size < 2) {
    return res.status(400).json({ error: 'Entries must span at least 2 different modules.' });
  }

  const userPrompt = `Here are the learner's recent journal entries:\n\n${formatEntriesForPrompt(entries)}`;

  try {
    const raw = await requestOpenAI(SYSTEM_PROMPT, userPrompt);
    const parsed = parsePatternPayload(raw);

    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return valid pattern JSON' });
    }

    console.info('/api/pattern response', parsed);
    return res.status(200).json(parsed);
  } catch (err) {
    if (err instanceof ProviderError) {
      console.error('/api/pattern provider error:', err.message);
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Error generating pattern insight:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
