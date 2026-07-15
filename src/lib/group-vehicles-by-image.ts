import type { VehicleCardData } from "@/features/catalog/queries";

export type VehicleImageGroup = {
  primary: VehicleCardData;
  siblings: VehicleCardData[];
};

function displayNameLength(vehicle: VehicleCardData) {
  return vehicle.name.trim().length;
}

function pickPrimary(vehicles: VehicleCardData[]) {
  return [...vehicles].sort((a, b) => {
    const byName = displayNameLength(a) - displayNameLength(b);
    if (byName !== 0) return byName;

    const aTitle = `${a.modelYear.generation.model.name} ${a.name}`;
    const bTitle = `${b.modelYear.generation.model.name} ${b.name}`;
    const byTitle = aTitle.length - bTitle.length;
    if (byTitle !== 0) return byTitle;

    return a.slug.localeCompare(b.slug);
  })[0]!;
}

/** Collapse vehicles that share the same lead image onto one card. */
export function groupVehiclesByImage(
  vehicles: VehicleCardData[],
): VehicleImageGroup[] {
  const groups = new Map<string, VehicleCardData[]>();

  for (const vehicle of vehicles) {
    const imageUrl = vehicle.images[0]?.url?.trim();
    const key = imageUrl ? `image:${imageUrl}` : `vehicle:${vehicle.id}`;
    const existing = groups.get(key);
    if (existing) existing.push(vehicle);
    else groups.set(key, [vehicle]);
  }

  const result: VehicleImageGroup[] = [];

  for (const members of groups.values()) {
    const primary = pickPrimary(members);
    const siblings = members
      .filter((vehicle) => vehicle.id !== primary.id)
      .sort((a, b) => {
        const byName = displayNameLength(a) - displayNameLength(b);
        if (byName !== 0) return byName;
        return a.name.localeCompare(b.name);
      });

    result.push({ primary, siblings });
  }

  // Preserve first-seen order from the input list.
  const order = new Map(vehicles.map((vehicle, index) => [vehicle.id, index]));
  return result.sort((a, b) => {
    const aMin = Math.min(
      ...[a.primary, ...a.siblings].map((vehicle) => order.get(vehicle.id) ?? 0),
    );
    const bMin = Math.min(
      ...[b.primary, ...b.siblings].map((vehicle) => order.get(vehicle.id) ?? 0),
    );
    return aMin - bMin;
  });
}
