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

export function catalogPathForSourceUrl(sourceUrl: string) {
  if (isSelfHostedCatalogImagePath(sourceUrl)) return sourceUrl;

  const digest = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 20);
  return `${catalogPathPrefix}${digest}.${extensionForUrl(sourceUrl)}`;
}

async function fileExists(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function downloadImage(sourceUrl: string, localPath: string) {
  const destination = path.join(catalogDirectory, path.basename(localPath));
  if (await fileExists(destination)) return false;

  const response = await fetch(sourceUrl, {
    headers: browserHeaders,
    redirect: "follow",
  });
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Could not download image (${response.status} ${contentType}): ${sourceUrl}`);
  }

  const temporaryDestination = `${destination}.partial`;
  await writeFile(temporaryDestination, Buffer.from(await response.arrayBuffer()));
  await rename(temporaryDestination, destination);
  return true;
}

export async function selfHostVehicleImages(prisma: PrismaClient) {
  const images = await prisma.vehicleImage.findMany({ select: { id: true, url: true } });
  const externalSources = Array.from(
    new Set(images.map((image) => image.url).filter((url) => !isSelfHostedCatalogImagePath(url))),
  );

  await mkdir(catalogDirectory, { recursive: true });

  let downloaded = 0;
  const failed = new Set<string>();
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
          return await downloadImage(sourceUrl, catalogPathForSourceUrl(sourceUrl));
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
    const localPath = catalogPathForSourceUrl(sourceUrl);
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
