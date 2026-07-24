# Catalogue hierarchy & Mercedes seed playbook

## Hierarchy (required for BMW and Mercedes)

```
Manufacturer  (BMW | Mercedes-Benz)
└── VehicleModel  (C-Class | 3 Series | GLC | X5 | …)
    └── VehicleGeneration  (W206 | G20 | …)
        └── ModelYear  (2025)
            └── Vehicle  (trim: C 300, AMG C 63 S, …)
                ├── Engine / Transmission
                ├── Dimensions / Performance / FuelEconomy / Prices
                └── Image (unique EXTERIOR only)
```

Never flatten trims into a single table. Upsert model → generation → year → vehicle.

BMW modules already follow this (`bmw-*-series.ts` → models like `bmw-3-series`, `bmw-x5`). Keep that shape.

## Mercedes goal
Seed US-market (prefer MY 2025 / current) Mercedes-Benz production trims into Redline Index via **idempotent** Prisma modules under `prisma/seed/mercedes-*.ts`.

## Hard requirements (non-negotiable)
1. **Unique exterior image per trim**
   - Official Mercedes media / press / MBUSA assets preferred.
   - Wikimedia Commons only if clearly **exterior**, high-res, and not reused.
   - **No interiors.** No cabin/dashboard shots.
   - Each trim must differ in **color and/or angle/road** — never the same photo or near-duplicates across trims.
   - `HEAD` → 200 + `image/*`. Register URL in module; do not collide with `RESERVED_MERCEDES_IMAGE_URLS`.
2. **Complete sourced records only** — manufacturer, model, generation, model year, vehicle (PUBLISHED), engine, transmission, dimensions, performance, fuelEconomy, prices (BASE_MSRP + DESTINATION_FEE `MERCEDES_DESTINATION_CENTS`), ≥1 image + Source/SourceCitation, AuditLog `vehicle.seeded`.
3. **Source-backed.** EPA + Mercedes press/MBUSA. Skip EU-only / discontinued / unsourced trims (e.g. many `A 180`, historic SLK) — document in skipped[].
4. Prefer US MY 2025 (or latest US MY with EPA data).

## Sources
| Data | Source |
|------|--------|
| FE / drivetrain / engine | EPA `make=Mercedes-Benz` → `/vehicle/{id}` |
| MSRP / HP / dims / 0–60 | media.mercedes-benz.com, MBUSA, press kits |
| Photos | Mercedes media library exterior stills (unique per trim) |

## Implementation
- One module file per assignment. Export:
  `export async function seedMercedes{Name}(ctx: SeedCtx): Promise<{ seeded: string[]; skipped: string[] }>`
- Import from `./mercedes-shared` (and `SeedCtx` from there).
- Model slugs: `mercedes-{c-class|e-class|glc|…}`  
  Vehicle slugs: `2025-mercedes-{c-300|amg-c-63-s|…}-us` (kebab-case).
- Body: SEDAN, COUPE, CABRIOLET, SUV, WAGON, VAN, etc.
- Drivetrain: RWD / AWD / FWD / FOUR_WD (`4MATIC` → AWD).
- Fuel: PETROL, DIESEL, PLUG_IN_HYBRID, ELECTRIC, HYBRID.
- **Do not edit `prisma/seed.ts`** — parent wires modules.
- **Do not run `prisma:seed`** unless asked.
- After module: list seeded slugs + image URL + EPA id; list skipped with reason.

## Parallel safety
- Only write your assigned file(s).
- Claim unique image URLs; if unsure another agent might use a URL, pick another exterior.
