export type ExamLevel = "GCSE" | "A-Level" | "University" | "Other";

export type Flashcard = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type RevisionPlanItem = {
  day: number;
  task: string;
  estimatedTime: string;
};

export type GeneratedRevision = {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  revisionPlan: RevisionPlanItem[];
};

export type RevisionSet = {
  id: string;
  subject: string;
  examLevel: ExamLevel;
  topic: string;
  notes: string;
  createdAt: string;
  summary: string;
  materials: GeneratedRevision;
};

export type GenerateRequest = {
  subject: string;
  examLevel: ExamLevel;
  topic: string;
  notes: string;
};

export type RevisionSetSummary = Pick<RevisionSet, "id" | "subject" | "topic" | "createdAt">;
