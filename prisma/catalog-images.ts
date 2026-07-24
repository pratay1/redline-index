import { createHash } from "node:crypto";
import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "../src/generated/prisma/client";

const catalogDirectory = path.join(process.cwd(), "public", "catalog-images");
const catalogPathPrefix = "/catalog-images/";
const browserHeaders = {
  Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "User-Agent": "Mozilla/5.0 (compatible; RedlineIndexCatalog/1.0)",
};

export function isSelfHostedCatalogImagePath(value: string) {
  return /^\/catalog-images\/[a-z0-9][a-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i.test(
    value,
  );
}

function extensionForUrl(sourceUrl: string) {
  try {
    const extension = new URL(sourceUrl).pathname.match(/\.([a-z0-9]+)$/i)?.[1];
    if (extension && /^(?:avif|gif|jpe?g|png|webp)$/i.test(extension)) {
      return extension.toLowerCase() === "jpeg" ? "jpg" : extension.toLowerCase();
    }
  } catch {
    // A malformed source is rejected by selfHostVehicleImages before this runs.
  }

  return "jpg";
}

function extensionForContentType(contentType: string) {
  if (contentType.includes("image/avif")) return "avif";
  if (contentType.includes("image/gif")) return "gif";
  if (contentType.includes("image/jpeg")) return "jpg";
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  return null;
}

function extensionForBuffer(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "jpg";
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  if (
    buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
    buffer.subarray(8, 12).toString("ascii").startsWith("avif")
  ) {
    return "avif";
  }
  return null;
}

export function catalogPathForSourceUrl(sourceUrl: string) {
  if (isSelfHostedCatalogImagePath(sourceUrl)) return sourceUrl;

  const digest = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 20);
  return `${catalogPathPrefix}${digest}.${extensionForUrl(sourceUrl)}`;
}

function catalogPathForSourceUrlAndBuffer(
  sourceUrl: string,
  buffer: Buffer,
  contentType: string,
) {
  if (isSelfHostedCatalogImagePath(sourceUrl)) return sourceUrl;

  const digest = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 20);
  const extension =
    extensionForBuffer(buffer) ?? extensionForContentType(contentType) ?? extensionForUrl(sourceUrl);
  return `${catalogPathPrefix}${digest}.${extension}`;
}

async function fileExists(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function downloadImage(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: browserHeaders,
    redirect: "follow",
  });
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Could not download image (${response.status} ${contentType}): ${sourceUrl}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const localPath = catalogPathForSourceUrlAndBuffer(sourceUrl, buffer, contentType);
  const destination = path.join(catalogDirectory, path.basename(localPath));
  if (await fileExists(destination)) return { downloaded: false, localPath };

  const temporaryDestination = `${destination}.partial`;
  await writeFile(temporaryDestination, buffer);
  await rename(temporaryDestination, destination);
  return { downloaded: true, localPath };
}

export async function selfHostVehicleImages(prisma: PrismaClient) {
  const images = await prisma.vehicleImage.findMany({ select: { id: true, url: true } });
  const externalSources = Array.from(
    new Set(images.map((image) => image.url).filter((url) => !isSelfHostedCatalogImagePath(url))),
  );

  await mkdir(catalogDirectory, { recursive: true });

  let downloaded = 0;
  const failed = new Set<string>();
  const localPaths = new Map<string, string>();
  for (let index = 0; index < externalSources.length; index += 4) {
    const batch = externalSources.slice(index, index + 4);
    const results = await Promise.all(
      batch.map(async (sourceUrl) => {
        if (!URL.canParse(sourceUrl)) {
          console.warn(`[catalog-images] skip invalid URL: ${sourceUrl}`);
          failed.add(sourceUrl);
          return false;
        }

        try {
          const result = await downloadImage(sourceUrl);
          localPaths.set(sourceUrl, result.localPath);
          return result.downloaded;
        } catch (error) {
          console.warn(
            `[catalog-images] skip download: ${sourceUrl} (${error instanceof Error ? error.message : error})`,
          );
          failed.add(sourceUrl);
          return false;
        }
      }),
    );
    downloaded += results.filter(Boolean).length;
  }

  let localized = 0;
  for (const sourceUrl of externalSources) {
    if (failed.has(sourceUrl)) continue;
    const localPath = localPaths.get(sourceUrl) ?? catalogPathForSourceUrl(sourceUrl);
    const destination = path.join(catalogDirectory, path.basename(localPath));
    if (!(await fileExists(destination))) {
      failed.add(sourceUrl);
      continue;
    }
    const result = await prisma.vehicleImage.updateMany({
      where: { url: sourceUrl },
      data: { url: localPath },
    });
    localized += result.count;
  }

  return { downloaded, localized, failed: failed.size, total: images.length };
}
