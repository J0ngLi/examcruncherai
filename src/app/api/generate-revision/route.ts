import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { buildMockMaterials } from "@/lib/mock-ai";
import { GenerateRequest, GeneratedRevision, QuizQuestion } from "@/types/revision";

function parseRequest(body: unknown): GenerateRequest | null {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Partial<GenerateRequest>;
  if (!candidate.subject?.trim() || !candidate.topic?.trim() || !candidate.notes?.trim() || !candidate.examLevel) {
    return null;
  }

  return {
    subject: candidate.subject.trim(),
    topic: candidate.topic.trim(),
    notes: candidate.notes.trim(),
    examLevel: candidate.examLevel,
  };
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalizeQuiz(quiz: QuizQuestion[]): QuizQuestion[] {
  const seenQuestions = new Set<string>();

  const cleaned = quiz
    .map((question) => {
      const rawOptions = Array.from(new Set(question.options.map((option) => option.trim())));
      if (rawOptions.length < 4 || !rawOptions.includes(question.correctAnswer)) {
        return null;
      }

      const uniqueWrong = rawOptions.filter((option) => option !== question.correctAnswer).slice(0, 3);
      if (uniqueWrong.length < 3) return null;

      const options = shuffle([question.correctAnswer, ...uniqueWrong]);

      return {
        ...question,
        question: question.question.trim(),
        options,
        correctAnswer: question.correctAnswer.trim(),
        explanation: question.explanation.trim(),
      };
    })
    .filter((item): item is QuizQuestion => Boolean(item))
    .filter((item) => {
      const key = item.question.toLowerCase();
      if (seenQuestions.has(key)) return false;
      seenQuestions.add(key);
      return true;
    });

  return cleaned;
}

function isValidQuizQuestion(question: QuizQuestion): boolean {
  return (
    Boolean(question.question) &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    new Set(question.options).size === 4 &&
    question.options.every((option) => typeof option === "string" && option.length > 0) &&
    typeof question.correctAnswer === "string" &&
    question.options.includes(question.correctAnswer) &&
    typeof question.explanation === "string" &&
    question.explanation.length > 0
  );
}

function isValidGeneratedRevision(payload: unknown): payload is GeneratedRevision {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as GeneratedRevision;

  return (
    typeof data.summary === "string" &&
    Array.isArray(data.flashcards) &&
    data.flashcards.length > 0 &&
    data.flashcards.every((card) => card.question && card.answer) &&
    Array.isArray(data.quiz) &&
    data.quiz.length > 0 &&
    data.quiz.every(isValidQuizQuestion) &&
    Array.isArray(data.revisionPlan) &&
    data.revisionPlan.length === 7 &&
    data.revisionPlan.every((day) => Number.isInteger(day.day) && day.day >= 1 && day.day <= 7 && day.task && day.estimatedTime)
  );
}

function extractJsonBlock(rawText: string): string {
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const match = rawText.match(/\{[\s\S]*\}/);
  return match?.[0] ?? rawText;
}

function getTopKeywords(text: string): string[] {
  const stopWords = new Set([
    "about", "after", "again", "also", "because", "before", "being", "between", "could", "exam",
    "from", "have", "into", "notes", "other", "should", "student", "their", "there", "these", "this",
    "topic", "using", "with", "would",
  ]);

  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 4 && !stopWords.has(word)),
    ),
  ).slice(0, 40);
}

function estimateGroundingScore(notes: string, output: GeneratedRevision): number {
  const keywords = getTopKeywords(notes);
  if (keywords.length === 0) return 0;

  const combined = [
    output.summary,
    ...output.flashcards.flatMap((card) => [card.question, card.answer]),
    ...output.quiz.flatMap((q) => [q.question, q.correctAnswer, q.explanation]),
    ...output.revisionPlan.flatMap((day) => [day.task, day.estimatedTime]),
  ]
    .join(" ")
    .toLowerCase();

  const matched = keywords.filter((key) => combined.includes(key)).length;
  return matched / keywords.length;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseRequest(body);

    if (!input) {
      return NextResponse.json({ error: "Please add subject, topic, exam level, and notes." }, { status: 400 });
    }

    const isShortNotes = input.notes.length < 100;
    const warning = isShortNotes
      ? "Your notes are quite short, so materials were generated mostly from the topic. Add more notes for stronger personalization."
      : null;

    const effectiveNotes = isShortNotes
      ? `Topic-focused fallback notes for ${input.topic} (${input.subject}, ${input.examLevel}). Build study materials from core principles and likely exam points.`
      : input.notes;

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(buildMockMaterials(input));
    }

    const client = new OpenAI({ apiKey: key });

    const prompt = `You are ExamCrunch AI.

Read the provided notes carefully.
Use the notes as the highest-priority source material.
Only generate materials from the supplied notes/topic.
Do not invent random unrelated content.
If notes are short, use topic only to lightly supplement.
Preserve terminology from the notes whenever possible.
Use student-friendly wording.
Match exam level difficulty.

Return strict JSON only (no markdown, no code fences, no extra text) with exactly this shape:
{
  "summary": "...",
  "flashcards": [{ "question": "...", "answer": "..." }],
  "quiz": [{
    "question": "...",
    "options": ["...","...","...","..."],
    "correctAnswer": "...",
    "explanation": "..."
  }],
  "revisionPlan": [{ "day": 1, "task": "...", "estimatedTime": "..." }]
}

Quality rules:
- Summary: concise, accurate, based on notes.
- Flashcards: directly test note facts/concepts; include definitions/processes/comparisons where relevant.
- Quiz: questions must come from notes; wrong answers plausible; explanation references note content.
- Revision plan: based on amount/complexity of notes; realistic daily tasks.
- Exactly 7 revisionPlan items.
- Quiz options must be 4 unique options per question.
- No duplicate quiz questions.
- correctAnswer must match one option exactly.

Context:
Subject: ${input.subject}
Exam Level: ${input.examLevel}
Topic: ${input.topic}
Notes:
${effectiveNotes}`;

    // Temporary verification logs for beta hardening.
    console.log("[generate-revision] notes_length=", input.notes.length);
    console.log("[generate-revision] subject=", input.subject, "examLevel=", input.examLevel, "topic=", input.topic);
    console.log("[generate-revision] prompt=", prompt.slice(0, 1800));

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      input: [
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.output_text;
    const parsed = JSON.parse(extractJsonBlock(raw)) as GeneratedRevision;

    parsed.quiz = normalizeQuiz(parsed.quiz);

    if (!isValidGeneratedRevision(parsed)) {
      throw new Error("Invalid AI response");
    }

    const groundingScore = estimateGroundingScore(effectiveNotes, parsed);
    console.log("[generate-revision] grounding_score=", groundingScore.toFixed(3));
    console.log(
      "[generate-revision] quality_checks=",
      JSON.stringify({
        flashcards: parsed.flashcards.length,
        quiz: parsed.quiz.length,
        revisionPlan: parsed.revisionPlan.length,
        uniqueQuizQuestions: new Set(parsed.quiz.map((q) => q.question.toLowerCase())).size,
      }),
    );

    return NextResponse.json(warning ? { ...parsed, warning } : parsed);
  } catch {
    return NextResponse.json({ error: "We could not generate your revision pack right now. Please try again." }, { status: 500 });
  }
}
