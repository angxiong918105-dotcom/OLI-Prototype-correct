import type { FeedbackResponse, ReflectionPayload } from '../types/journal';

export async function generateReflectionFeedback(payload: ReflectionPayload): Promise<string> {
  const sourceText = payload.reflectionText?.trim() ||
    'The learner shared short signal notes and wants reflective coaching. Offer a gentle pattern insight, one perspective shift, and one small next step.';

  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      journalEntry: sourceText,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Reflection API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as Partial<FeedbackResponse>;

  if (
    typeof data.summary !== 'string' ||
    typeof data.pattern !== 'string' ||
    typeof data.next_step !== 'string'
  ) {
    throw new Error('Invalid feedback response shape');
  }

  console.info('Frontend feedback payload:', {
    summary: data.summary,
    pattern: data.pattern,
    next_step: data.next_step,
  });

  const feedbackLines = [data.summary, data.pattern, data.next_step]
    .map((line) => line.trim())
    .filter(Boolean);

  return feedbackLines.join('\n');
}
