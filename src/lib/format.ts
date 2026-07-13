export function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function formatNumber(value: number | null | undefined, unit: string) {
  return value === null || value === undefined
    ? "—"
    : `${value.toLocaleString()} ${unit}`;
}

export function formatEngineDisplacement(displacementCc: number | null) {
  if (!displacementCc) return "—";
  return `${(displacementCc / 1000).toFixed(1)} L`;
}
