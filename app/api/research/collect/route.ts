import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResearchCollectSchema } from "@/lib/schemas";
import { collectResearchEntries } from "@/lib/research";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = ResearchCollectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid research query" }, { status: 400 });

  const entries = await collectResearchEntries(parsed.data.sourceType, parsed.data.query);
  return NextResponse.json({ entries });
}
