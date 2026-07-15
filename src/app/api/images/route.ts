import { NextRequest, NextResponse } from "next/server";
import { isAllowedCatalogImageUrl } from "@/lib/catalog-image";

const ONE_YEAR = 31_536_000;

/**
 * Serves verified catalogue images from a same-origin URL. Some manufacturers
 * reject Vercel's built-in image optimizer and direct hotlinking, so this proxy
 * fetches with a standard browser user agent and keeps successful assets cached.
 */
export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url");

  if (!sourceUrl || !isAllowedCatalogImageUrl(sourceUrl)) {
    return NextResponse.json({ error: "Unsupported image URL." }, { status: 400 });
  }

  try {
    const upstream = await fetch(sourceUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; RedlineIndex/1.0)",
      },
      cache: "force-cache",
      redirect: "follow",
    });
    const contentType = upstream.headers.get("content-type") ?? "";

    if (!upstream.ok || !contentType.startsWith("image/") || !upstream.body) {
      return NextResponse.json(
        { error: "Image is temporarily unavailable." },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Image is temporarily unavailable." },
      { status: 502 },
    );
  }
}
