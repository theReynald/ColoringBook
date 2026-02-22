import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { pageId, imageData } = await req.json();

    if (!pageId || !imageData) {
      return NextResponse.json(
        { error: "Missing pageId or imageData" },
        { status: 400 }
      );
    }

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/png;base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { error: "Invalid image data format" },
        { status: 400 }
      );
    }

    const base64Data = base64Match[1];
    const buffer = Buffer.from(base64Data, "base64");

    const supabaseAdmin = getSupabaseAdmin();

    // Get the existing record to find the file path
    const { data: record, error: fetchError } = await supabaseAdmin
      .from("images")
      .select("*")
      .eq("id", pageId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: "Coloring page not found" },
        { status: 404 }
      );
    }

    // Upload the colored version with upsert to overwrite existing
    const filePath = `colored/${pageId}.png`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to save colored image" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(filePath);

    // Update the record with the colored URL (add timestamp to bust cache)
    const coloredUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    
    const { error: updateError } = await supabaseAdmin
      .from("images")
      .update({ colored_url: coloredUrl })
      .eq("id", pageId);

    if (updateError) {
      console.error("Database update error:", updateError);
      // Still return success since the image was uploaded
    }

    return NextResponse.json({
      success: true,
      coloredUrl,
    });
  } catch (err) {
    console.error("Save colored API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
