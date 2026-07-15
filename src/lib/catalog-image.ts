const allowedImageHosts = new Set([
  "mediapool.bmwgroup.com",
  "media.mercedes-benz.com",
  "www.mercedes-benz.com",
  "www.mbusa.com",
  "media.oneweb.mercedes-benz.com",
  "upload.wikimedia.org",
  "file.kelleybluebookimages.com",
  "web.archive.org",
  "mercedes-benz-media.co.uk",
  "hips.hearstapps.com",
  "s1.cdn.autoevolution.com",
  "www.auto-data.net",
  "c.encycarpedia.com",
]);

export function isAllowedCatalogImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedImageHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export function catalogImageUrl(sourceUrl: string) {
  return `/api/images?url=${encodeURIComponent(sourceUrl)}`;
}
