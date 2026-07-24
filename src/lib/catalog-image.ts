export function catalogImageUrl(sourceUrl: string) {
  return /^\/catalog-images\/[a-z0-9][a-z0-9._-]*\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(
    sourceUrl,
  )
    ? sourceUrl
    : "/catalog-images/vehicle-placeholder.svg";
}
