"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { VehicleCardData } from "@/features/catalog/queries";
import { formatEngineDisplacement, humanize } from "@/lib/format";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const { modelYear, engine, performance } = vehicle;
  const manufacturer = modelYear.generation.model.manufacturer;
  const image = vehicle.images[0];
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0e0e0e] transition-[border-color,background-color] duration-300 hover:border-white/25 hover:bg-[#141414]"
    >
      <Link
        href={`/vehicles/${vehicle.slug}`}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
        aria-label={`View ${modelYear.year} ${manufacturer.name} ${modelYear.generation.model.name} ${vehicle.name}`}
      />
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-black">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[0.64rem] tracking-[0.15em] text-white/35 uppercase">
              Verified record
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080808] to-[#08080800]" />
        <span className="absolute right-3 bottom-3 font-mono text-[0.6rem] tracking-[0.13em] text-white/80 uppercase">
          {vehicle.market}
        </span>
      </div>
      <div className="relative p-5 sm:p-6">
        <p className="font-mono text-[0.62rem] tracking-[0.13em] text-white/45 uppercase">
          {manufacturer.name} · {modelYear.year} · {modelYear.generation.code}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
          {modelYear.generation.model.name}{" "}
          <span className="text-brand">{vehicle.name}</span>
        </h3>
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
          <span>
            <strong className="block text-sm font-medium tracking-normal text-white">
              {formatEngineDisplacement(engine.displacementCc)}
            </strong>
            {humanize(vehicle.drivetrain)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
