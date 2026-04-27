export type ExamLevel = "GCSE" | "A-Level" | "University" | "Other";

export type Flashcard = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export type RevisionDay = {
  day: number;
  focus: string;
  tasks: string[];
};

export type GeneratedMaterials = {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  revision_plan: RevisionDay[];
};

export type RevisionSet = {
  id: string;
  subject: string;
  examLevel: ExamLevel;
  topic: string;
  notes: string;
  createdAt: string;
  materials: GeneratedMaterials;
};

export type GenerateRequest = {
  subject: string;
  examLevel: ExamLevel;
  topic: string;
  notes: string;
};
