import type { FeedbackResponse, ReflectionPayload } from '../types/journal';

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

export async function generateReflectionFeedback(payload: ReflectionPayload): Promise<string> {
  const sourceText = payload.reflectionText?.trim() || buildUserPrompt(payload);
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

  return `Summary: ${data.summary}\nPattern: ${data.pattern}\nNext step: ${data.next_step}`;
}
