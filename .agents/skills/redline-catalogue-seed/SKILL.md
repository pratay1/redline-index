---
name: redline-catalogue-seed
description: Add, extend, verify, or gap-fill Redline Index vehicle catalogue data in Prisma seed modules. Use when asked to add a manufacturer, model family, generation, model-year range, or individual US-market trim; to seed cars; or to complete partial vehicle catalogue data. This skill covers sourced, idempotent records under prisma/seed and their seed.ts wiring, not UI work.
---

# Redline Catalogue Seed

Build source-backed US-market catalogue records. Treat a vehicle as a trim for one model year, not as the model line.

## Start with the live project rules

Before changing data, read:

- `prisma/seed/CATALOGUE-HIERARCHY.md`
- `prisma/seed/AGENT-PLAYBOOK.md`
- The existing `{brand}-shared.ts`, if present
- A comparable series module such as `porsche-718.ts`, `toyota-sedans.ts`, or `audi-a-line.ts`
- `prisma/schema.prisma` when an enum or relation is uncertain

Use project files as the authority if they conflict with this skill.

## Choose the smallest correct scope

| Request | Implement |
| --- | --- |
| New brand with several lines | Create `{brand}-shared.ts`, separate series modules, and parent-owned `seed.ts` wiring. |
| Existing brand, new series | Add one or more modules using its shared helper; wire the job in `seed.ts`. |
| Model with a year range | Seed the current US model year, or the last US year if discontinued, with representative trims. Do not seed every year by default. |
| One trim | Add one complete `TrimSeed` to the appropriate module, or a small focused module. |
| New generation | Add a new generation, model year, and trims; retain already-seeded older generations. |

Use the US market unless explicitly told otherwise. Prefer the latest US model year with both EPA and pricing data. For a range request, choose 2–4 distinct representative trims (for example base, hybrid/EV/PHEV, and a fully sourced halo trim), rather than appearance packages with the same powertrain. Put intentional omissions in `STATIC_SKIPPED` or `skipped`.

## Preserve the hierarchy

Upsert, in order:

`Manufacturer -> VehicleModel -> VehicleGeneration -> ModelYear -> Vehicle`

A `Vehicle` must be a `PUBLISHED`, `US` trim with its engine, transmission, dimensions, performance, fuel economy, `BASE_MSRP` and `DESTINATION_FEE` prices, at least one exterior image, sources/citations, and `vehicle.seeded` audit log. Make every write idempotent.

Keep generation codes distinct (for example `W206`, `992`, or `XV80`); never flatten them into model or trim names. Follow existing slug conventions, such as `2025-toyota-camry-le-us`.

## Source and normalize data

- Source EPA fuel economy, range, drivetrain, fuel type, and EPA vehicle ID from fueleconomy.gov.
- Source MSRP, power, dimensions, cargo, seating, and manufacturer claims from OEM material first; use a reputable secondary source only when necessary.
- Cite a source for every factual value. Never fill a missing specification by guesswork.
- Store money in cents. Store dimensions in inches, weight in kg, and cargo in liters; make conversions explicit in code/comments.
- Use the correct enum. Map 4MATIC, xDrive, and quattro to `AWD`; use `FOUR_WD` only for true 4WD. Set catalogue trim status to `PUBLISHED`.
- Reuse an engine row when a factory code matches the same manufacturer; respect the schema uniqueness constraint.

If a trim cannot be made complete and source-backed, do not seed it. Record why it was skipped.

## Images are required data

- Assign each trim a different, real exterior image. Never use an interior, detail shot, or a reused/near-duplicate hero photo.
- Prefer OEM media. Use the brand helper's supported exterior source fallback when needed; avoid Wikimedia for bulk work.
- Register each URL through the shared helper's reserved-image set and `assertImageUrlOk`; verify `HEAD` returns success and `image/*` before committing.
- Create the linked image `Source` and citation. Let the project's image self-hosting step soft-fail individual downloads rather than fail a complete seed.

## Implement safely

Mirror the closest established module. Define typed `TRIMS` and `STATIC_SKIPPED`; include source URLs and EPA IDs next to the trim data. Return `{ seeded, skipped }` and include enough identifier detail for the parent log.

For a new brand, make the shared helper own manufacturer upsert, source/citation helpers, image validation, audit helper, destination-fee constants, and engine reuse. Only the parent edits `prisma/seed.ts`: import the jobs, create the manufacturer/context, run jobs, log results, and leave `selfHostVehicleImages(prisma)` at the end.

When work is split across agents, assign one series module per agent. Each agent edits only its assigned module, must reserve unique image URLs, and must not edit `seed.ts` or run the full seed. The parent wires modules and runs the seed once.

## Finish and verify

After parent wiring, run `npx prisma db seed` when the task authorizes it. Then verify:

- Seed logs show the expected created/skipped counts.
- The manufacturer has the expected `PUBLISHED` vehicles.
- Every seeded vehicle has an image and all requested models are present.
- No image URL is duplicated within the brand.
- Image self-hosting reports localized files or intentional soft-skips.

Only perform a documented gap-fill after the seed run. Mark any derived quarter-mile estimate as an estimate, and never invent source data to make a record look complete.

## Report succinctly

State the number of seeded vehicles, models/generations covered, intentional skips, verification results, and any source/image uncertainty needing review.
