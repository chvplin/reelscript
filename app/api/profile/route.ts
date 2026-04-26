import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ProfileUpdateSchema = z.object({
  artist_name: z.string().min(1).max(80),
  genre: z.string().min(1).max(60),
  personality_settings: z
    .object({
      tone: z.string().optional(),
      emojiLevel: z.string().optional(),
      lengthPreference: z.string().optional(),
      vibe: z.string().optional(),
    })
    .optional(),
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json({ profile: { ...data, email: user.email } });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });

  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: use service role admin API to delete auth user account as well.
  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return NextResponse.json({ error: "Failed to delete account data" }, { status: 500 });

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
