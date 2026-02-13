import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json({ error: "Failed to load gallery." }, { status: 500 });
  }

  return NextResponse.json(data);
}
