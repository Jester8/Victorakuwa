import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { isAdmin } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  if (!TYPES.includes(file.type)) {
    return Response.json({ error: "Use a JPG, PNG, WebP, AVIF or GIF image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Images must be under 8 MB." }, { status: 400 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const isGif = file.type === "image/gif";
  // Shrink large photos to a web-friendly WebP; keep GIFs as-is so they stay animated.
  const output = isGif
    ? input
    : await sharp(input)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
  const ext = isGif ? "gif" : "webp";
  const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "image";
  const filename = `blog/${base}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    const blob = await put(filename, output, {
      access: "public",
      addRandomSuffix: true,
      contentType: isGif ? "image/gif" : "image/webp",
    });
    return Response.json({ url: blob.url });
  }

  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Image storage isn't connected. Add a Vercel Blob store to the project." },
      { status: 503 }
    );
  }

  // Local development fallback: save into public/uploads (git-ignored).
  const dir = path.join(process.cwd(), "public", "uploads", "blog");
  await mkdir(dir, { recursive: true });
  const localName = `${base}-${Date.now().toString(36)}.${ext}`;
  await writeFile(path.join(dir, localName), output);
  return Response.json({ url: `/uploads/blog/${localName}` });
}
