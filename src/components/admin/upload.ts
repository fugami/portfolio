/** Uploads a file via /api/upload (Supabase Storage or local /public/uploads). */
export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
  return (await res.json()).url as string;
}
