import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { getRequestUser } from "@/lib/server/auth";
import { GeneratedRevision, RevisionSet } from "@/types/revision";

type SavePayload = {
  subject: string;
  examLevel: string;
  topic: string;
  notes: string;
  generated: GeneratedRevision;
};

const freePlanLimit = Number(process.env.FREE_PLAN_LIMIT ?? 3);

function ensurePayload(body: unknown): SavePayload | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as Partial<SavePayload>;

  if (!candidate.subject || !candidate.examLevel || !candidate.topic || !candidate.notes || !candidate.generated) {
    return null;
  }

  return candidate as SavePayload;
}

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in to view your revision sets." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("revision_sets")
    .select("id, subject, topic, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not fetch revision sets." }, { status: 500 });
  }

  const payload = (data ?? []).map((item) => ({
    id: item.id,
    subject: item.subject,
    topic: item.topic,
    createdAt: item.created_at,
  }));

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in before generating a revision set." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = ensurePayload(body);

    if (!payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!user.isAdmin && user.plan !== "pro") {
      const { count, error: countError } = await supabase
        .from("revision_sets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) {
        return NextResponse.json({ error: "Could not verify your plan limits." }, { status: 500 });
      }

      if ((count ?? 0) >= freePlanLimit) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${freePlanLimit} revision sets). Upgrade to continue.`,
            code: "FREE_PLAN_LIMIT",
          },
          { status: 403 },
        );
      }
    }

    const { data: setRow, error: setError } = await supabase
      .from("revision_sets")
      .insert({
        user_id: user.id,
        subject: payload.subject,
        exam_level: payload.examLevel,
        topic: payload.topic,
        notes: payload.notes,
        summary: payload.generated.summary,
      })
      .select("id, subject, exam_level, topic, notes, summary, created_at")
      .single();

    if (setError || !setRow) {
      return NextResponse.json({ error: "Could not save revision set." }, { status: 500 });
    }

    const setId = setRow.id;

    const flashcards = payload.generated.flashcards.map((card) => ({
      revision_set_id: setId,
      question: card.question,
      answer: card.answer,
    }));

    const quizQuestions = payload.generated.quiz.map((q) => ({
      revision_set_id: setId,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
    }));

    const planRows = payload.generated.revisionPlan.map((day) => ({
      revision_set_id: setId,
      day: day.day,
      task: day.task,
      estimated_time: day.estimatedTime,
    }));

    const [{ error: flashError }, { error: quizError }, { error: planError }] = await Promise.all([
      supabase.from("flashcards").insert(flashcards),
      supabase.from("quiz_questions").insert(quizQuestions),
      supabase.from("revision_plans").insert(planRows),
    ]);

    if (flashError || quizError || planError) {
      await supabase.from("revision_sets").delete().eq("id", setId);
      return NextResponse.json({ error: "Saved set, but failed to save generated content." }, { status: 500 });
    }

    const response: RevisionSet = {
      id: setId,
      subject: setRow.subject,
      examLevel: setRow.exam_level,
      topic: setRow.topic,
      notes: setRow.notes,
      summary: setRow.summary,
      createdAt: setRow.created_at,
      materials: payload.generated,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Could not save revision set." }, { status: 500 });
  }
}
