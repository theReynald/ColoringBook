import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 20MB." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured on the server." },
        { status: 500 }
      );
    }

    // Read file as buffer and convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseAdmin = getSupabaseAdmin();

    // Upload original to Supabase Storage
    const fileId = uuidv4();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";

    const { error: uploadError } = await supabaseAdmin.storage
      .from("images")
      .upload(`originals/${fileId}.${ext}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload original image." },
        { status: 500 }
      );
    }

    const { data: originalUrlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(`originals/${fileId}.${ext}`);

    // Call OpenAI gpt-image-1
    const openaiFormData = new FormData();
    openaiFormData.append("model", "gpt-image-1");
    openaiFormData.append(
      "prompt",
      "Convert this photo into a black and white coloring book page with clean outlines, no shading, suitable for children to color in. Keep all major shapes and objects recognizable."
    );
    const imageBlob = new Blob([buffer], { type: file.type });
    openaiFormData.append("image[]", imageBlob, `image.${ext}`);
    openaiFormData.append("n", "1");
    openaiFormData.append("size", "1024x1024");

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.json().catch(() => null);
      const errMsg = errBody?.error?.message || `OpenAI API error: ${openaiRes.status}`;
      console.error("OpenAI error:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    const openaiData = await openaiRes.json();
    const resultB64 = openaiData.data?.[0]?.b64_json;
    const resultUrl = openaiData.data?.[0]?.url;

    let coloringPageBuffer: Buffer;

    if (resultB64) {
      coloringPageBuffer = Buffer.from(resultB64, "base64");
    } else if (resultUrl) {
      const imgRes = await fetch(resultUrl);
      const imgArrayBuffer = await imgRes.arrayBuffer();
      coloringPageBuffer = Buffer.from(imgArrayBuffer);
    } else {
      return NextResponse.json(
        { error: "No image returned from OpenAI." },
        { status: 502 }
      );
    }

    // Upload coloring page to Supabase Storage
    const { error: coloringUploadError } = await supabaseAdmin.storage
      .from("images")
      .upload(`coloring-pages/${fileId}.png`, coloringPageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (coloringUploadError) {
      console.error("Supabase coloring upload error:", coloringUploadError);
      return NextResponse.json(
        { error: "Failed to save coloring page." },
        { status: 500 }
      );
    }

    const { data: coloringUrlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(`coloring-pages/${fileId}.png`);

    // Insert record into database
    const { data: dbRecord, error: dbError } = await supabaseAdmin.from("images").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      original_url: originalUrlData.publicUrl,
      coloring_page_url: coloringUrlData.publicUrl,
      name: file.name,
      status: "completed",
    }).select("id").single();

    if (dbError) {
      console.error("Supabase DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to save record." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: dbRecord.id,
      originalUrl: originalUrlData.publicUrl,
      coloringPageUrl: coloringUrlData.publicUrl,
    });
  } catch (err) {
    console.error("Convert API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
