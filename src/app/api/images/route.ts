/**
 * Legacy image-proxy endpoint. Vehicle images are now shipped from
 * /public/catalog-images, so this endpoint deliberately never fetches or
 * redirects to a third-party host.
 */
export function GET() {
  return Response.json(
    { error: "Catalog images are served from self-hosted static assets." },
    { status: 410 },
  );
}
