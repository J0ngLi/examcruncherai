import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { getRequestUser } from "@/lib/server/auth";
import { GeneratedRevision, RevisionSet } from "@/types/revision";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in to access this revision set." }, { status: 401 });
  }

  const { id } = await params;

  const [{ data: setRow, error: setError }, { data: flashcards, error: flashError }, { data: quiz, error: quizError }, { data: plan, error: planError }] =
    await Promise.all([
      supabase
        .from("revision_sets")
        .select("id, user_id, subject, exam_level, topic, notes, summary, created_at")
        .eq("id", id)
        .single(),
      supabase.from("flashcards").select("question, answer").eq("revision_set_id", id),
      supabase.from("quiz_questions").select("question, options, correct_answer, explanation").eq("revision_set_id", id),
      supabase.from("revision_plans").select("day, task, estimated_time").eq("revision_set_id", id).order("day", { ascending: true }),
    ]);

  if (setError || flashError || quizError || planError || !setRow) {
    return NextResponse.json({ error: "Could not fetch revision set." }, { status: 404 });
  }

  if (setRow.user_id !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "You do not have access to this revision set." }, { status: 403 });
  }

  const materials: GeneratedRevision = {
    summary: setRow.summary,
    flashcards: (flashcards ?? []).map((card) => ({ question: card.question, answer: card.answer })),
    quiz: (quiz ?? []).map((q) => ({
      question: q.question,
      options: Array.isArray(q.options) ? q.options.map((item) => String(item)) : [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation ?? "",
    })),
    revisionPlan: (plan ?? []).map((day) => ({ day: day.day, task: day.task, estimatedTime: day.estimated_time })),
  };

  const response: RevisionSet = {
    id: setRow.id,
    subject: setRow.subject,
    examLevel: setRow.exam_level,
    topic: setRow.topic,
    notes: setRow.notes,
    summary: setRow.summary,
    createdAt: setRow.created_at,
    materials,
  };

  return NextResponse.json(response);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in to delete this revision set." }, { status: 401 });
  }

  const { id } = await params;
  const { data: setRow, error: setError } = await supabase
    .from("revision_sets")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (setError || !setRow) {
    return NextResponse.json({ error: "Revision set not found." }, { status: 404 });
  }

  if (setRow.user_id !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "You do not have access to delete this set." }, { status: 403 });
  }

  const { error: deleteError } = await supabase.from("revision_sets").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: "Could not delete revision set." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
