import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (Array.isArray(body.tags)) update.tags = body.tags;
  if (body.incrementCopy === true) update.copy_count = (body.copyCount ?? 0) + 1;

  const { error } = await supabase.from("favorites").update(update).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabase.from("favorites").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 });
  return NextResponse.json({ success: true });
}
