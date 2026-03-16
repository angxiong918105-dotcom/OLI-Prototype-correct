export type JournalEntry = {
  id: string;
  moduleId: string;
  moduleTitle?: string;
  createdAt: string;
  meaningRating?: number;
  selectedSignals?: string[];
  reflectionText?: string;
  aiResponse?: string;
};

export type ReflectionPayload = {
  moduleId: string;
  moduleTitle?: string;
  meaningRating?: number;
  selectedSignals?: string[];
  reflectionText?: string;
};
