type GiphyImage = { url: string; width: string; height: string };
type GiphyGif = {
  id: string;
  title: string;
  images: { fixed_width: GiphyImage; fixed_width_small?: GiphyImage };
};

// Proxies GIPHY so the API key never reaches the browser.
export async function GET(request: Request) {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GIF search isn't set up yet.", gifs: [] }, { status: 503 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 50) ?? "";
  const endpoint = q
    ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}&`
    : "https://api.giphy.com/v1/gifs/trending?";
  const res = await fetch(`${endpoint}api_key=${apiKey}&limit=24&rating=pg`, {
    next: { revalidate: q ? 3600 : 600 },
  });
  if (!res.ok) return Response.json({ error: "GIF search failed.", gifs: [] }, { status: 502 });

  const { data } = (await res.json()) as { data: GiphyGif[] };
  const gifs = data.map((gif) => ({
    id: gif.id,
    title: gif.title,
    url: gif.images.fixed_width.url,
    preview: (gif.images.fixed_width_small ?? gif.images.fixed_width).url,
    width: Number(gif.images.fixed_width.width),
    height: Number(gif.images.fixed_width.height),
  }));
  return Response.json({ gifs });
}
