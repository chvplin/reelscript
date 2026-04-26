import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contentType = url.searchParams.get("contentType");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = supabase.from("generations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  if (q) query = query.or(`visual_description.ilike.%${q}%`);
  if (contentType && contentType !== "all") query = query.eq("content_type", contentType);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  return NextResponse.json({ generations: data || [] });
}
