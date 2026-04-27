import { GenerateRequest, GeneratedRevision, QuizQuestion } from "@/types/revision";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomizeQuizOptions(quiz: QuizQuestion[]): QuizQuestion[] {
  return quiz.map((question) => {
    const options = shuffle(question.options);
    return {
      ...question,
      options,
    };
  });
}

function splitNotes(notes: string): string[] {
  const bulletLines = notes
    .split(/\n+/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, ""))
    .filter((line) => line.length > 10);

  const sourceLines =
    bulletLines.length >= 3
      ? bulletLines
      : notes
          .split(/[.!?\n]+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 15);

  return sourceLines.slice(0, 12);
}

function makeGroupedPoints(lines: string[]): string[] {
  const groups: string[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    const first = lines[i];
    const second = lines[i + 1];
    groups.push(second ? `${first}; ${second}` : first);
  }
  return groups.slice(0, 6);
}

function noteKeywords(notes: string): string[] {
  return Array.from(
    new Set(
      notes
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 5),
    ),
  ).slice(0, 8);
}

export function buildMockMaterials(input: GenerateRequest): GeneratedRevision {
  const topic = input.topic.trim();
  const noteLines = splitNotes(input.notes);
  const groupedPoints = makeGroupedPoints(noteLines);
  const keywords = noteKeywords(input.notes);
  const primary = groupedPoints[0] ?? `${topic} is an important part of ${input.subject}.`;
  const secondary = groupedPoints[1] ?? `Focus on core terminology and exam-style application for ${topic}.`;
  const tertiary = groupedPoints[2] ?? `Compare key ideas, processes, and examples linked to ${topic}.`;
  const keyA = keywords[0] ?? topic;
  const keyB = keywords[1] ?? input.subject.toLowerCase();
  const keyC = keywords[2] ?? "process";

  const quiz: QuizQuestion[] = [
    {
      question: `Based on your notes, which statement about ${topic} is most accurate?`,
      options: [
        primary,
        `It mainly depends on ${keyB} without considering ${keyA}.`,
        `It excludes ${keyC} from revision priorities.`,
        `It is unrelated to exam-level ${input.examLevel} outcomes.`,
      ],
      correctAnswer: primary,
      explanation: `Your notes directly state this, so it is the best-supported answer.`,
    },
    {
      question: `Which point is explicitly supported by your notes on ${topic}?`,
      options: [
        secondary,
        `Your notes reject ${keyA} as unimportant.`,
        `Your notes do not mention ${input.subject} at all.`,
        `Your notes say to ignore comparisons and examples.`,
      ],
      correctAnswer: secondary,
      explanation: "This option matches a direct claim from your submitted notes.",
    },
    {
      question: `What is a realistic medium-difficulty task from your notes?`,
      options: [
        `Explain how ${keyA} links to ${keyB} in your own words.`,
        "Memorize one sentence and stop revising.",
        "Skip all examples and applications.",
        "Only read headings without content.",
      ],
      correctAnswer: `Explain how ${keyA} links to ${keyB} in your own words.`,
      explanation: "This reflects note-driven active recall and concept linkage.",
    },
    {
      question: `Which advanced revision action best matches your notes content?`,
      options: [
        `Use ${tertiary} to build a structured long-answer response.`,
        "Ignore terminology and focus on guesswork.",
        "Avoid process explanations completely.",
        "Remove all evidence from your answers.",
      ],
      correctAnswer: `Use ${tertiary} to build a structured long-answer response.`,
      explanation: "This uses explicit note content and turns it into exam technique.",
    },
  ];

  return {
    summary: `Your ${input.examLevel} notes on ${topic} emphasize: ${primary} ${secondary} Prioritize these ideas first, then practise applying them with exam-style questions.`,
    flashcards: [
      { question: `According to your notes, what is the key idea in ${topic}?`, answer: primary },
      { question: `What second key point did your notes highlight?`, answer: secondary },
      { question: `Which comparison or process appears in your notes?`, answer: tertiary },
      { question: `Define the term "${keyA}" in the context of your notes.`, answer: `In your notes, ${keyA} is tied to ${keyB} and should be explained with examples.` },
      { question: `What should you revise first based on your notes?`, answer: `Start with: ${primary} Then review: ${secondary}` },
    ],
    quiz: randomizeQuizOptions(quiz),
    revisionPlan: [
      { day: 1, task: `Read your notes and highlight lines about: ${keyA}, ${keyB}.`, estimatedTime: "35 min" },
      { day: 2, task: `Turn the first 3 note points into short recall prompts.`, estimatedTime: "40 min" },
      { day: 3, task: `Revise and explain: ${primary}`, estimatedTime: "35 min" },
      { day: 4, task: `Practise one medium and one hard question from your note topics.`, estimatedTime: "50 min" },
      { day: 5, task: `Review weak note areas and rewrite unclear terms in your own words.`, estimatedTime: "45 min" },
      { day: 6, task: `Retake quiz and focus on errors linked to ${topic}.`, estimatedTime: "40 min" },
      { day: 7, task: `Final recap of your original notes plus a timed response.`, estimatedTime: "45 min" },
    ],
  };
}
