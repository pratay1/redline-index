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
  try {
    const url = new URL(sourceUrl);
    const encycarpediaImage = url.pathname.match(/^\/ci\/(\d+)\.jpg$/);

    if (url.hostname === "c.encycarpedia.com" && encycarpediaImage) {
      return `/catalog-images/${encycarpediaImage[1]}.jpg`;
    }

    if (
      url.hostname === "www.auto-data.net" &&
      url.pathname ===
        "/images/f65/Mercedes-Benz-Vito-W447-facelift-2019-Extra-Long.jpg"
    ) {
      return "/catalog-images/mercedes-vito-w447-extra-long.jpg";
    }
  } catch {
    // The proxy below returns a safe error response for malformed source URLs.
  }

  return `/api/images?url=${encodeURIComponent(sourceUrl)}`;
}
