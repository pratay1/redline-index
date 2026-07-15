"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CatalogVehicleImage } from "@/components/catalog-vehicle-image";
import type { VehicleCardData } from "@/features/catalog/queries";
import { formatEngineDisplacement, humanize } from "@/lib/format";

function trimLabel(vehicle: VehicleCardData, primary: VehicleCardData) {
  const sameModel =
    vehicle.modelYear.generation.model.id ===
    primary.modelYear.generation.model.id;
  const sameYear = vehicle.modelYear.year === primary.modelYear.year;

  if (sameModel && sameYear) return vehicle.name;
  if (sameModel) return `${vehicle.modelYear.year} · ${vehicle.name}`;
  return `${vehicle.modelYear.generation.model.name} ${vehicle.name}`;
}

export function VehicleCard({
  vehicle,
  siblings = [],
  showTopSpeed = false,
}: {
  vehicle: VehicleCardData;
  siblings?: VehicleCardData[];
  showTopSpeed?: boolean;
}) {
  const variants = [vehicle, ...siblings];
  const [selectedId, setSelectedId] = useState(vehicle.id);
  const selected = variants.find((item) => item.id === selectedId) ?? vehicle;

  const { modelYear, engine, performance } = selected;
  const manufacturer = modelYear.generation.model.manufacturer;
  const image = selected.images[0] ?? vehicle.images[0];
  const reduceMotion = useReducedMotion();
  const hasSiblings = siblings.length > 0;

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0e0e0e] transition-[border-color,background-color] duration-300 hover:border-white/25 hover:bg-[#141414]"
    >
      {!hasSiblings ? (
        <Link
          href={`/vehicles/${selected.slug}`}
          className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
          aria-label={`View ${modelYear.year} ${manufacturer.name} ${modelYear.generation.model.name} ${selected.name}`}
        />
      ) : null}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#080808]">
        {hasSiblings ? (
          <Link
            href={`/vehicles/${selected.slug}`}
            className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
            aria-label={`View ${modelYear.year} ${manufacturer.name} ${modelYear.generation.model.name} ${selected.name}`}
          />
        ) : null}
        {image ? (
          <CatalogVehicleImage
            url={image.url}
            alt={image.alt}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[0.64rem] tracking-[0.15em] text-white/35 uppercase">
              Verified record
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 z-[2] h-1/3 bg-gradient-to-t from-[#080808] to-[#08080800]" />
        <span className="absolute right-3 bottom-3 z-[11] font-mono text-[0.6rem] tracking-[0.13em] text-white/80 uppercase">
          {selected.market}
        </span>
      </div>
      <div className="relative z-[11] p-5 sm:p-6">
        <p className="font-mono text-[0.62rem] tracking-[0.13em] text-white/45 uppercase">
          {manufacturer.name} · {modelYear.year} · {modelYear.generation.code}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
          {hasSiblings ? (
            <Link
              href={`/vehicles/${selected.slug}`}
              className="transition-colors hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {modelYear.generation.model.name}{" "}
              <span className="text-brand">{selected.name}</span>
            </Link>
          ) : (
            <>
              {modelYear.generation.model.name}{" "}
              <span className="text-brand">{selected.name}</span>
            </>
          )}
        </h3>
        {hasSiblings ? (
          <ul className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-white/10 pt-2.5">
            {variants.map((variant, index) => {
              const isSelected = variant.id === selected.id;
              return (
                <li
                  key={variant.id}
                  className="inline-flex min-w-0 items-center gap-1.5"
                >
                  {index > 0 ? (
                    <span className="text-white/20" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setSelectedId(variant.id)}
                    aria-pressed={isSelected}
                    className={`font-mono text-[0.58rem] leading-4 tracking-[0.06em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      isSelected
                        ? "text-white"
                        : "text-white/45 hover:text-white"
                    }`}
                  >
                    {trimLabel(variant, vehicle)}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 font-mono text-[0.59rem] tracking-[0.08em] text-white/45 uppercase">
          <span>
            <strong className="block text-sm font-medium tracking-normal text-white">
              {performance?.powerHp ?? "—"}
            </strong>
            HP
          </span>
          <span>
            <strong className="block text-sm font-medium tracking-normal text-white">
              {performance?.zeroToSixtySeconds ?? "—"}
            </strong>
            0–60 SEC
          </span>
          {showTopSpeed ? (
            <span>
              <strong className="block text-sm font-medium tracking-normal text-white">
                {performance?.topSpeedMph ?? "—"}
              </strong>
              MPH TOP SPEED
            </span>
          ) : (
            <span>
              <strong className="block text-sm font-medium tracking-normal text-white">
                {formatEngineDisplacement(engine.displacementCc)}
              </strong>
              {humanize(selected.drivetrain)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
