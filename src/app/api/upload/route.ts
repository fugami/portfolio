import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  isSupabaseConfigured,
  getSupabaseWriteClient,
  SUPABASE_BUCKET,
} from "@/lib/supabase";

export const runtime = "nodejs";

function safeName(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${Date.now()}-${base || "image"}${ext || ".png"}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const filename = safeName(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  // Supabase Storage path
  if (isSupabaseConfigured()) {
    const sb = getSupabaseWriteClient();
    if (!sb) {
      return NextResponse.json({ error: "Supabase write client unavailable." }, { status: 500 });
    }
    const { error } = await sb.storage
      .from(SUPABASE_BUCKET)
      .upload(filename, bytes, { contentType: file.type, upsert: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  }

  // Local fallback: write into /public/uploads
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
