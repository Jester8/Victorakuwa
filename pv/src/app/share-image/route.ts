import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
// Only the site's own images and blog uploads, so this can't be used as an open proxy.
const LOCAL = /^\/(books|photos|hero|uploads)\/[\w./-]+\.(webp|png|jpe?g|avif|gif)$/i;
const BLOB = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i;

async function load(src: string) {
  if (LOCAL.test(src) && !src.includes("..")) {
    return readFile(path.join(process.cwd(), "public", src));
  }
  if (BLOB.test(src)) {
    const res = await fetch(src);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  return null;
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src") ?? "";
  const input = await load(src).catch(() => null);
  if (!input) return new Response("Not found", { status: 404 });

  const { width = 1, height = 1 } = await sharp(input).metadata();
  let output: Buffer;

  if (width / height < 1.3) {
    // Portrait art (book covers): whole cover on a soft blurred backdrop of itself.
    const backdrop = await sharp(input)
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .blur(40)
      .modulate({ brightness: 0.55 })
      .toBuffer();
    const front = await sharp(input).resize({ height: HEIGHT - 70 }).toBuffer();
    output = await sharp(backdrop)
      .composite([{ input: front, gravity: "center" }])
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  } else {
    output = await sharp(input)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  }

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    },
  });
}
