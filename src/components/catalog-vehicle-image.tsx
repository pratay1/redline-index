"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { catalogImageUrl } from "@/lib/catalog-image";

type CatalogVehicleImageProps = {
  url: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

type BarEdges = {
  /** Top/bottom empty bands from object-contain */
  vertical: boolean;
  /** Left/right empty bands from object-contain */
  horizontal: boolean;
};

/** Full vehicle photo with blurred edge fill (letterbox always; pillarbox only when needed). */
export function CatalogVehicleImage({
  url,
  alt,
  sizes,
  preload = false,
  className = "",
}: CatalogVehicleImageProps) {
  const src = catalogImageUrl(url);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState<BarEdges>({
    vertical: true,
    horizontal: false,
  });

  const measure = useCallback((naturalWidth: number, naturalHeight: number) => {
    const container = containerRef.current;
    if (!container || naturalWidth <= 0 || naturalHeight <= 0) return;

    const boxAspect = container.clientWidth / Math.max(container.clientHeight, 1);
    const imageAspect = naturalWidth / naturalHeight;
    const epsilon = 0.02;

    setBars({
      // Image wider than the box → bars on top/bottom
      vertical: imageAspect > boxAspect + epsilon,
      // Image taller/narrower than the box → bars on left/right
      horizontal: imageAspect < boxAspect - epsilon,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const img = container.querySelector("img:last-of-type");
      if (img instanceof HTMLImageElement && img.naturalWidth) {
        measure(img.naturalWidth, img.naturalHeight);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [measure, src]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden bg-[#080808] ${className}`}
    >
      {/* Soft base wash so empty regions never read as hard black */}
      <div
        className="pointer-events-none absolute -inset-[18%]"
        aria-hidden
      >
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes={sizes}
          className="scale-125 object-cover object-center opacity-40 blur-3xl"
        />
      </div>

      {/* Top / bottom fill when letterboxed */}
      {bars.vertical ? (
        <div
          className="pointer-events-none absolute -inset-y-[22%] inset-x-0"
          aria-hidden
        >
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes={sizes}
            className="scale-150 object-cover object-center opacity-65 blur-3xl"
          />
        </div>
      ) : null}

      {/* Left / right fill only when pillarboxed */}
      {bars.horizontal ? (
        <div
          className="pointer-events-none absolute inset-y-0 -inset-x-[22%]"
          aria-hidden
        >
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes={sizes}
            className="scale-150 object-cover object-center opacity-65 blur-3xl"
          />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[#080808]/35" aria-hidden />

      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        preload={preload}
        sizes={sizes}
        onLoad={(event) => {
          const img = event.currentTarget;
          measure(img.naturalWidth, img.naturalHeight);
        }}
        className="relative z-[1] object-contain object-center"
      />
    </div>
  );
}
