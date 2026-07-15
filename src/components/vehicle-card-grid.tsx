"use client";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { VehicleCard } from "@/components/vehicle-card";
import type { VehicleCardData } from "@/features/catalog/queries";
import { groupVehiclesByImage } from "@/lib/group-vehicles-by-image";

export function VehicleCardGrid({
  vehicles,
  showTopSpeed = false,
  className = "mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3",
  delay = 0.05,
}: {
  vehicles: VehicleCardData[];
  showTopSpeed?: boolean;
  className?: string;
  delay?: number;
}) {
  const groups = groupVehiclesByImage(vehicles);

  return (
    <Stagger className={className} delay={delay}>
      {groups.map(({ primary, siblings }) => (
        <StaggerItem key={primary.id}>
          <VehicleCard
            vehicle={primary}
            siblings={siblings}
            showTopSpeed={showTopSpeed}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
