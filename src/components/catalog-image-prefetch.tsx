"use client";

import { useEffect } from "react";

const prefetchedImageUrls = new Set<string>();

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

function shouldPrefetchImages() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;

  return (
    !connection?.saveData &&
    connection?.effectiveType !== "slow-2g" &&
    connection?.effectiveType !== "2g"
  );
}

async function enablePersistentImageCache() {
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("/image-cache-worker.js", { scope: "/" });
    await navigator.serviceWorker.ready;
  } catch {
    // Browser prefetch remains useful if service workers are unavailable.
  }
}

/**
 * Warms the browser cache with the publisher-hosted assets rendered by the catalogue.
 * Work starts only after initial rendering is idle and remains low priority.
 */
export function CatalogImagePrefetch({ imageUrls }: { imageUrls: string[] }) {
  useEffect(() => {
    if (!shouldPrefetchImages()) return;

    const addPrefetchLinks = () => {
      for (const imageUrl of new Set(imageUrls)) {
        if (prefetchedImageUrls.has(imageUrl)) continue;
        prefetchedImageUrls.add(imageUrl);

        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "image";
        link.href = imageUrl;
        link.fetchPriority = "low";
        document.head.append(link);
      }
    };

    const browserWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
    };

    let cancelled = false;
    let timeout: number | undefined;

    void enablePersistentImageCache().finally(() => {
      if (cancelled) return;

      if (browserWindow.requestIdleCallback) {
        browserWindow.requestIdleCallback(addPrefetchLinks, { timeout: 3_000 });
        return;
      }

      timeout = window.setTimeout(addPrefetchLinks, 1_500);
    });

    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [imageUrls]);

  return null;
}
