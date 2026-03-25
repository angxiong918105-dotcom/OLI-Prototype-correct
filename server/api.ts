import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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

function buildFallbackFeedback(journalEntry: string): FeedbackPayload {
  const text = journalEntry.trim().replace(/\s+/g, ' ');
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const first = sentences[0] || text;
  const summary = first.length > 220 ? `${first.slice(0, 217)}...` : first;

  return {
    summary,
    pattern:
      'A tension is showing up between what you feel responsible for and what feels meaningful to you.',
    next_step:
      'For the next 3 days, write down one moment that gave you energy and one that drained you, then compare what they have in common.',
  };
}

async function requestGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
      throw new ProviderError(429, 'Gemini quota exceeded. Please try again shortly.');
    }
    if (response.status === 401 || response.status === 403) {
      throw new ProviderError(401, 'Gemini API key is invalid or unauthorized.');
    }
    throw new ProviderError(502, `Gemini request failed with status ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/reflect', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'No API key configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.' });
  }

  const { systemPrompt, userPrompt } = req.body;

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
  }

  try {
    const message = await requestGemini(systemPrompt, userPrompt);

    if (!message) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    return res.json({ message });
  } catch (err) {
    console.error('Error calling Gemini:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/feedback', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'No API key configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.' });
  }

  const { journalEntry } = req.body;

  if (typeof journalEntry !== 'string' || !journalEntry.trim()) {
    return res.status(400).json({ error: 'Missing or invalid journalEntry' });
  }

  const systemPrompt = `You are an expert reflective learning coach for a meaning-design course.

Generate feedback grounded only in the user's reflection text.
Avoid generic encouragement and avoid motivational cliches.

Return STRICT JSON with exactly these keys:
{
  "summary": string,
  "pattern": string,
  "next_step": string
}

Quality rules:
- summary: 1-2 sentences capturing what matters most in the reflection
- pattern: identify exactly one meaningful pattern or tension from the text
- next_step: one small, concrete, actionable next step the learner can do soon
- concise, specific, and text-grounded`;

  const userPrompt = `Journal entry:\n${journalEntry.trim()}`;

  try {
    const raw = await requestGemini(systemPrompt, userPrompt);
    const parsed = parseFeedbackPayload(raw);

    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return valid feedback JSON' });
    }

    console.info('/api/feedback response', parsed);

    return res.json(parsed);
  } catch (err) {
    if (err instanceof ProviderError) {
      console.warn('/api/feedback provider error, returning fallback:', err.message);
      const fallback = buildFallbackFeedback(journalEntry);
      console.info('/api/feedback fallback response', fallback);
      return res.json(fallback);
    }
    console.error('Error generating feedback:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Reflection API server running on port ${PORT}`);
});