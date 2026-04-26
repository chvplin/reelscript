import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FavoriteSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contentType = url.searchParams.get("contentType");
  const sort = url.searchParams.get("sort") || "newest";

  let query = supabase.from("favorites").select("*").eq("user_id", user.id);
  if (q) query = query.or(`caption_text.ilike.%${q}%,tags.cs.{${q}}`);
  if (contentType && contentType !== "all") query = query.eq("content_type", contentType);
  if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "most") query = query.order("copy_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  return NextResponse.json({ favorites: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = FavoriteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid favorite payload" }, { status: 400 });

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    caption_text: parsed.data.captionText,
    tags: parsed.data.tags,
    content_type: parsed.data.contentType,
  });
  if (error) return NextResponse.json({ error: "Failed to save favorite" }, { status: 500 });
  return NextResponse.json({ success: true });
}
