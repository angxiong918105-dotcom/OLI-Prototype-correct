import type { ReflectionPayload } from '../types/journal';

const SYSTEM_PROMPT = `You are a reflective learning companion helping a learner notice patterns in their reflections.

Do not diagnose mental health conditions.
Do not give dramatic life advice.
Do not tell users to quit jobs, change relationships, or make major life decisions.

Your job:
1. Briefly summarize what the learner seems to be noticing.
2. Normalize the experience without sounding generic.
3. Offer one small reflective thought or observation to carry forward.

Style:
- warm but restrained
- concise
- thoughtful
- non-judgmental
- no clichés
- 2 to 4 sentences maximum`;

function buildUserPrompt(payload: ReflectionPayload): string {
  const parts: string[] = [];

  if (payload.moduleTitle) {
    parts.push(`Module: ${payload.moduleTitle}`);
  }

  if (payload.meaningRating !== undefined) {
    parts.push(`Current sense of meaning and purpose (0-100): ${payload.meaningRating}`);
  }

  if (payload.selectedSignals && payload.selectedSignals.length > 0) {
    parts.push(`Signals they noticed:\n${payload.selectedSignals.map(s => `- ${s}`).join('\n')}`);
  }

  if (payload.reflectionText) {
    parts.push(`Their reflection:\n"${payload.reflectionText}"`);
  }

  return parts.join('\n\n');
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateReflectionFeedback(payload: ReflectionPayload): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Check your .env file and restart the dev server.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserPrompt(payload) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error('No text in Gemini response');
  }

  return text;
}
