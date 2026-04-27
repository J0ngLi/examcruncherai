import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { buildMockMaterials } from "@/lib/mock-ai";
import { GenerateRequest, GeneratedMaterials } from "@/types/revision";

function parseAndValidate(body: unknown): GenerateRequest | null {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Partial<GenerateRequest>;
  if (!candidate.subject || !candidate.topic || !candidate.notes || !candidate.examLevel) {
    return null;
  }

  return {
    subject: candidate.subject,
    topic: candidate.topic,
    notes: candidate.notes,
    examLevel: candidate.examLevel,
  } as GenerateRequest;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseAndValidate(body);

    if (!input) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openAiKey) {
      return NextResponse.json(buildMockMaterials(input));
    }

    const client = new OpenAI({ apiKey: openAiKey });

    const prompt = `You are a revision assistant. Return only JSON with keys: summary, flashcards, quiz, revision_plan.
- summary: short student-friendly paragraph.
- flashcards: array of 5+ {question, answer}.
- quiz: array of 4+ {question, options (4 strings), correctAnswer}.
- revision_plan: exactly 7 items, each {day, focus, tasks}.

Subject: ${input.subject}
Exam level: ${input.examLevel}
Topic: ${input.topic}
Notes:\n${input.notes}`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.6,
    });

    const text = completion.output_text;
    const parsed = JSON.parse(text) as GeneratedMaterials;

    if (!parsed.summary || !Array.isArray(parsed.flashcards) || !Array.isArray(parsed.quiz) || !Array.isArray(parsed.revision_plan)) {
      throw new Error("Invalid AI response shape.");
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
