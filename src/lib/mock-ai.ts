import { GenerateRequest, GeneratedMaterials } from "@/types/revision";

export function buildMockMaterials(input: GenerateRequest): GeneratedMaterials {
  const topicLabel = input.topic || input.subject || "this topic";
  const notesSnippet = input.notes.slice(0, 240).trim();

  return {
    summary:
      notesSnippet.length > 0
        ? `This ${input.examLevel} overview of ${topicLabel} focuses on the key ideas in your notes. Prioritize understanding core concepts, then practise applying them in exam-style questions.`
        : `This ${input.examLevel} summary of ${topicLabel} introduces the core ideas, links between concepts, and what to revise first for exam success.`,
    flashcards: [
      { question: `What is the main idea behind ${topicLabel}?`, answer: "It explains the core concept and why it matters in exam contexts." },
      { question: `Give one real exam use-case of ${topicLabel}.`, answer: "Use it to solve structured questions by identifying definitions, process, and interpretation." },
      { question: `What is one common mistake students make in ${topicLabel}?`, answer: "Memorizing terms without understanding how to apply them." },
      { question: `How should you structure a top-mark answer for ${topicLabel}?`, answer: "Define, explain with detail, provide an example, then conclude clearly." },
      { question: `What should you revise first in ${topicLabel}?`, answer: "Foundational definitions and high-frequency past-paper patterns." },
    ],
    quiz: [
      {
        question: `Which approach best improves marks in ${topicLabel}?`,
        options: [
          "Only reading notes once",
          "Practising active recall and timed questions",
          "Skipping weak areas",
          "Revising without checking mistakes",
        ],
        correctAnswer: "Practising active recall and timed questions",
      },
      {
        question: `What should come first in a strong answer about ${topicLabel}?`,
        options: ["A long opinion", "A precise definition", "An unrelated example", "A random formula"],
        correctAnswer: "A precise definition",
      },
      {
        question: "What is the most effective revision cycle?",
        options: ["Read only", "Watch only", "Recall, test, review errors", "Highlight without testing"],
        correctAnswer: "Recall, test, review errors",
      },
      {
        question: `Why review mistakes in ${topicLabel}?`,
        options: ["To avoid learning", "To identify weak patterns", "To reduce practice", "To ignore feedback"],
        correctAnswer: "To identify weak patterns",
      },
    ],
    revision_plan: [
      { day: 1, focus: "Foundations", tasks: ["Read summary", "Learn key terms", "Create baseline flashcard review"] },
      { day: 2, focus: "Core Concepts", tasks: ["Revise flashcards set 1", "Answer 5 short questions", "Correct errors"] },
      { day: 3, focus: "Application", tasks: ["Do mixed quiz", "Explain answers aloud", "Update weak flashcards"] },
      { day: 4, focus: "Exam Technique", tasks: ["Timed practice", "Structure full answers", "Review mark-scheme language"] },
      { day: 5, focus: "Weak Topics", tasks: ["Target lowest quiz areas", "Re-learn mistakes", "Retest quickly"] },
      { day: 6, focus: "Mock Sprint", tasks: ["Sit mini mock", "Mark and annotate", "Summarize common errors"] },
      { day: 7, focus: "Final Review", tasks: ["Rapid flashcard run", "Final mixed quiz", "Confidence checklist"] },
    ],
  };
}
