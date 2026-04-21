export type JournalEntry = {
  id: string;
  moduleId: string;
  moduleTitle?: string;
  createdAt: string;
  meaningRating?: number;
  selectedSignals?: string[];
  reflectionText?: string;
  aiResponse?: string;
  mcqResults?: Record<string, boolean>;
};

export type ReflectionPayload = {
  moduleId: string;
  moduleTitle?: string;
  meaningRating?: number;
  selectedSignals?: string[];
  reflectionText?: string;
  mcqResults?: Record<string, boolean>;
};

export type FeedbackResponse = {
  summary: string;
  pattern: string;
  next_step: string;
};

// Cross-entry pattern insight — only generated when ≥3 entries from ≥2 modules exist.
// Not persisted to Firestore; computed fresh per session when a new entry is added.
export type PatternInsight = {
  pattern: string;    // 2-3 sentences about the recurring pattern/tension
  next_step: string;  // 1 sentence reflective next step
  generatedAt: string;           // ISO timestamp
  basedOnEntryIds: string[];     // which entry IDs were used
};
