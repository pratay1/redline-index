# BMW / Mercedes series seed modules — agent playbook

See also: `CATALOGUE-HIERARCHY.md` (Manufacturer → Model → Generation → Year → Trim).

## Goal
Add missing US-market production trims for your assigned series into Redline Index via an **idempotent** Prisma seed module.

## Hard requirements (non-negotiable)
1. **Every vehicle must have a unique real exterior image** (never interiors; never reuse the same road/color shot).
   - BMW: PressClub / mediapool  
     `https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P#########`  
     HEAD 200 `image/jpeg`. Never reuse `RESERVED_BMW_IMAGE_IDS`.
   - Mercedes: unique exterior press/MBUSA/media URL; HEAD 200 `image/*`. Never reuse `RESERVED_MERCEDES_IMAGE_URLS`.
2. **Complete usable public records** for each trim: manufacturer, model, generation, model year, vehicle (name/market/bodyStyle/drivetrain/status PUBLISHED), engine, transmission, dimensions, performance, fuelEconomy, prices (BASE_MSRP + DESTINATION_FEE), ≥1 image with alt/credit/source, Source + SourceCitation, AuditLog `vehicle.seeded`.
3. **Source-backed data only.** Do not invent HP, MPG, MSRP, dimensions, or 0–60. Skip incomplete trims.
4. Prefer US MY 2025 (or current US MY) when available.

## Best sources
| Brand | Specs / FE | Photos |
|-------|------------|--------|
| BMW | EPA + press.bmwgroup.com | mediapool dokNo |
| Mercedes | EPA make=Mercedes-Benz + media.mercedes-benz.com / MBUSA | Unique exterior stills |

## Implementation rules
- Export `seedBmw{Series}` or `seedMercedes{Series}(ctx): Promise<{ seeded; skipped }>`.
- Import `./bmw-shared` or `./mercedes-shared`.
- Upsert hierarchy — do not flatten.
- Slugs: `2025-bmw-…-us` / `2025-mercedes-…-us`.
- **Do not edit `prisma/seed.ts`** — parent wires modules.
- **Do not run `npm run prisma:seed`** unless asked.
