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

Your task is to interpret, not repeat.

Do:
- Surface a subtle pattern or tension
- Offer a gentle shift in perspective
- Suggest one small, concrete next step

Do NOT:
- Repeat what the learner said
- Use labels or colons
- Sound like a summary

Write in warm, natural, complete sentences.
Keep it under 80 words, 2-4 sentences.

---

Example 1

Input:
selectedSignals: ["I feel busy all day", "I don't feel fulfilled"]
reflectionText: "I think I'm doing everything I'm supposed to do but it still feels empty"

Output:
It seems like your days are full, but not necessarily shaped by what actually matters to you. That gap can feel frustrating, but it also points to something worth exploring. For the next few days, try noticing one moment that felt even slightly meaningful, and what made it different.

---

Example 2

Input:
selectedSignals: ["I compare myself to others", "I feel behind"]
reflectionText: "Everyone else seems to have it figured out and I don't"

Output:
You might be measuring your progress using someone else's timeline, which can make your own path feel smaller than it is. That feeling doesn't necessarily mean you're behind, just that the comparison is loud right now. This week, try paying attention to one decision you made that felt true to you, without comparing it to anyone else.

---

Example 3

Input:
selectedSignals: ["My days feel repetitive", "I feel bored"]
reflectionText: "Nothing really stands out anymore"

Output:
It sounds like your days are starting to blur together, not because nothing is happening, but because very little feels distinct or engaging. That can be a useful signal rather than something to immediately fix. Over the next few days, try noticing one moment that felt even slightly different, and what made it stand out.

---

Now generate the feedback.

Return STRICT JSON with exactly these keys:
{
  "summary": string,
  "pattern": string,
  "next_step": string
}`;

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
