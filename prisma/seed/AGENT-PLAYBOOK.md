# BMW series seed modules — agent playbook

## Goal
Add missing US-market BMW production trims for your assigned series into Redline Index via an **idempotent** Prisma seed module.

## Hard requirements (non-negotiable)
1. **Every vehicle must have a unique real BMW PressClub / mediapool image.**
   - URL form: `https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P#########`
   - Verify with HTTP HEAD → must be 200 `image/jpeg`.
   - Never reuse an ID in `RESERVED_BMW_IMAGE_IDS` (`prisma/seed/bmw-shared.ts`) or another trim in your module.
2. **Complete usable public records** for each trim: manufacturer, model, generation, model year, vehicle (name/market/bodyStyle/drivetrain/status PUBLISHED), engine, transmission, dimensions (fill applicable fields), performance, fuelEconomy, prices (BASE_MSRP + DESTINATION_FEE $1,175 = 117500 cents), ≥1 image with alt/credit/source, Source + SourceCitation rows, AuditLog `vehicle.seeded`.
3. **Source-backed data only.** Do not invent HP, MPG, MSRP, dimensions, or 0–60. If a complete sourced trim cannot be found, skip that trim and document it — do not pad.
4. Prefer US MY 2025 (or current US MY) when available.

## Best sources
| Data | Source |
|------|--------|
| Fuel economy / drivetrain / engine size | EPA `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=YYYY&make=BMW` then `/vehicle/{id}` |
| MSRP, HP, torque, 0–60, dimensions | BMW PressClub USA `https://www.press.bmwgroup.com/usa/` press releases + fact sheets |
| Photos | BMW PressClub photo detail pages (`P90…` IDs) → mediapool download URL above |
| Cross-check | BMW USA model pages (secondary) |

## Implementation rules
- Create **only** your module file under `prisma/seed/` (see assignment). Export:
  `export async function seedBmw{Series}(ctx: SeedCtx): Promise<{ seeded: string[]; skipped: string[] }>`
- Import helpers from `./bmw-shared`.
- Upsert everything (idempotent). Respect unique constraints (`Vehicle.slug`, `Engine` manufacturerId+code, `Source.url`, etc.).
- Use normalized relations — do not flatten into one giant table.
- Reuse manufacturer `bmw` (passed via `ctx.manufacturerId`).
- Body styles: SEDAN, COUPE, CABRIOLET (convertibles), SUV, WAGON (Touring), etc. per schema enums.
- Drivetrain: RWD / AWD / FWD / FOUR_WD as applicable.
- Fuel types: PETROL, PLUG_IN_HYBRID, ELECTRIC, HYBRID as applicable.
- Slugs: `2025-bmw-{trim-slug}-us` (kebab-case).
- **Do not edit `prisma/seed.ts`** — the parent agent wires modules.
- **Do not run `npm run prisma:seed`** unless asked — parent seeds after merge.
- After writing the module, verify TypeScript compiles conceptually; list each seeded trim + dokNo image ID + EPA id used.

## Already in catalogue (skip if complete; fill gaps only)
See assignment prompt for your series’ existing slugs.
