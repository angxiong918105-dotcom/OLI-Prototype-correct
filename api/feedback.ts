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
    const parsed = JSON.parse(jsonText) as Partial<FeedbackPayload>;
    if (
      typeof parsed.summary === 'string' &&
      typeof parsed.pattern === 'string' &&
      typeof parsed.next_step === 'string'
    ) {
      return {
        summary: parsed.summary.trim(),
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
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 220,
      temperature: 0.7,
      response_format: {
        type: 'json_object',
      },
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const journalEntry = typeof req.body?.journalEntry === 'string' ? req.body.journalEntry : '';
  if (!journalEntry.trim()) {
    return res.status(400).json({ error: 'Missing or invalid journalEntry' });
  }

  const systemPrompt = `You are a reflective coach helping a learner make sense of their experience.

Your task is to respond to what they shared — not summarize it generically.

Return STRICT JSON with exactly these keys:
{
  "summary": string,   // 1 sentence. Start with what the learner actually expressed. Reference their specific words or situation. Must feel personalized.
  "pattern": string,    // 1-2 sentences. Surface a subtle insight, tension, or reframe based on what they shared. Supportive tone, not judgmental.
  "next_step": string   // 1 sentence. A small, concrete action or question to try next. Specific enough to do today.
}

Rules:
- summary must reference the learner's actual input (use phrases like "You described..." or "You noticed that...")
- pattern should offer a perspective shift, not repeat what was said
- next_step should be a single small action or reflective question
- Keep total under 80 words
- Warm, calm, coach-like tone
- Do NOT use labels, bullet points, or colons in the values

---

Example 1

Input:
selectedSignals: ["I feel busy all day", "I don't feel fulfilled"]
reflectionText: "I think I'm doing everything I'm supposed to do but it still feels empty"

Output:
{
  "summary": "You described doing everything right yet still feeling a sense of emptiness.",
  "pattern": "That gap between effort and meaning often signals that your days are shaped by expectations rather than by what actually matters to you.",
  "next_step": "Over the next few days, notice one moment that felt even slightly meaningful and ask yourself what made it different."
}

---

Example 2

Input:
selectedSignals: ["I compare myself to others", "I feel behind"]
reflectionText: "Everyone else seems to have it figured out and I don't"

Output:
{
  "summary": "You noticed a pattern of comparing your progress to others and feeling behind.",
  "pattern": "That feeling may come from measuring your path against someone else's timeline, which can make your own choices feel smaller than they are.",
  "next_step": "This week, try identifying one recent decision you made that felt true to you, without comparing it to anyone else."
}

---

Now generate the feedback.`;

  const userPrompt = `Journal entry:\n${journalEntry.trim()}`;

  try {
    const raw = await requestOpenAI(systemPrompt, userPrompt);
    const parsed = parseFeedbackPayload(raw);

    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return valid feedback JSON' });
    }

    console.info('/api/feedback response', parsed);
    return res.status(200).json(parsed);
  } catch (err) {
    if (err instanceof ProviderError) {
      console.error('/api/feedback provider error:', err.message);
      return res.status(err.status).json({ error: err.message });
    }

    console.error('Error generating feedback:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
