import Image from "next/image";
import Link from "next/link";
import type { VehicleCardData } from "@/features/catalog/queries";
import { formatEngineDisplacement, humanize } from "@/lib/format";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const { modelYear, engine, performance } = vehicle;
  const manufacturer = modelYear.generation.model.manufacturer;
  const image = vehicle.images[0];

  return (
    <article className="group relative flex min-w-0 flex-col border border-white/10 bg-[#101214] transition-colors hover:border-[var(--signal)]">
      <Link
        href={`/vehicles/${vehicle.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${modelYear.year} ${manufacturer.name} ${modelYear.generation.model.name} ${vehicle.name}`}
      />
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_50%_15%,#2a2d30,transparent_55%)]">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[0.64rem] tracking-[0.15em] text-white/35 uppercase">
              Verified record
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute right-3 bottom-3 font-mono text-[0.6rem] tracking-[0.13em] text-white/70 uppercase">
          {vehicle.market}
        </span>
      </div>
      <div className="relative p-5">
        <p className="font-mono text-[0.62rem] tracking-[0.13em] text-[var(--muted)] uppercase">
          {manufacturer.name} · {modelYear.year} · {modelYear.generation.code}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">
          {modelYear.generation.model.name}{" "}
          <span className="text-[var(--signal)]">{vehicle.name}</span>
        </h3>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 font-mono text-[0.59rem] tracking-[0.08em] uppercase">
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
    </article>
  );
}
