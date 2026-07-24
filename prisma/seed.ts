import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { SeedCtx } from "./seed/bmw-shared";
import { seedAudiALine } from "./seed/audi-a-line";
import { seedAudiEtron } from "./seed/audi-etron";
import { seedAudiQLine } from "./seed/audi-q-line";
import { seedAudiRsSport } from "./seed/audi-rs-sport";
import { ensureAudiManufacturer } from "./seed/audi-shared";
import { seedAudiSLine } from "./seed/audi-s-line";
import { seedBmw2Series } from "./seed/bmw-2-series";
import { seedBmw3Series } from "./seed/bmw-3-series";
import { seedBmw4Series } from "./seed/bmw-4-series";
import { seedBmw5Series } from "./seed/bmw-5-series";
import { seedBmw7Series } from "./seed/bmw-7-series";
import { seedBmwISeries } from "./seed/bmw-i-series";
import { seedBmwXSeries } from "./seed/bmw-x-series";
import { seedBmwZSeries } from "./seed/bmw-z-series";
import { seedMercedesACla } from "./seed/mercedes-a-cla";
import { seedMercedesAmgGt } from "./seed/mercedes-amg-gt";
import { seedMercedesCClass } from "./seed/mercedes-c-class";
import { seedMercedesEClass } from "./seed/mercedes-e-class";
import { seedMercedesEqCompact } from "./seed/mercedes-eq-compact";
import { seedMercedesEqFlagship } from "./seed/mercedes-eq-flagship";
import { seedMercedesGClass } from "./seed/mercedes-g-class";
import { seedMercedesGlaGlb } from "./seed/mercedes-gla-glb";
import { seedMercedesGlc } from "./seed/mercedes-glc";
import { seedMercedesGleGls } from "./seed/mercedes-gle-gls";
import { seedMercedesOther } from "./seed/mercedes-other";
import { seedMercedesRoadstersCle } from "./seed/mercedes-roadsters-cle";
import { seedMercedesSClass } from "./seed/mercedes-s-class";
import { ensureMercedesManufacturer } from "./seed/mercedes-shared";
import { seedPorsche718 } from "./seed/porsche-718";
import { seedPorsche911 } from "./seed/porsche-911";
import { seedPorsche918 } from "./seed/porsche-918";
import { seedPorscheSuv } from "./seed/porsche-suv";
import { ensurePorscheManufacturer } from "./seed/porsche-shared";
import { seedPorscheSedanEv } from "./seed/porsche-sedan-ev";
import { seedFerrari458 } from "./seed/ferrari-458";
import { seedFerrari488 } from "./seed/ferrari-488";
import { seedFerrari812Monza } from "./seed/ferrari-812-monza";
import { seedFerrariCaliforniaFf } from "./seed/ferrari-california-ff";
import { seedFerrariCurrent } from "./seed/ferrari-current";
import { seedFerrariF12LaFerrari } from "./seed/ferrari-f12-laferrari";
import { seedFerrariF8Sf90 } from "./seed/ferrari-f8-sf90";
import { seedFerrariGtc4PortofinoRoma } from "./seed/ferrari-gtc4-portofino-roma";
import { ensureFerrariManufacturer } from "./seed/ferrari-shared";
import { seedHondaAccord } from "./seed/honda-accord";
import { seedHondaCivic } from "./seed/honda-civic";
import { seedHondaCompact } from "./seed/honda-compact";
import { ensureHondaManufacturer } from "./seed/honda-shared";
import { seedHondaSuv } from "./seed/honda-suv";
import { seedHondaVanTruck } from "./seed/honda-van-truck";
import { seedLamborghiniAventador } from "./seed/lamborghini-aventador";
import { seedLamborghiniHuracanEarly } from "./seed/lamborghini-huracan-early";
import { seedLamborghiniHuracanLate } from "./seed/lamborghini-huracan-late";
import { seedLamborghiniHypercars } from "./seed/lamborghini-hypercars";
import { seedLamborghiniRevueltoTemerario } from "./seed/lamborghini-revuelto-temerario";
import { ensureLamborghiniManufacturer } from "./seed/lamborghini-shared";
import { seedLamborghiniUrus } from "./seed/lamborghini-urus";
import { seedTeslaCurrentLineup } from "./seed/tesla-current-lineup";
import { ensureTeslaManufacturer } from "./seed/tesla-shared";
import { seedToyotaSedans } from "./seed/toyota-sedans";
import { ensureToyotaManufacturer } from "./seed/toyota-shared";
import { seedToyotaSports } from "./seed/toyota-sports";
import { seedToyotaSuvCompact } from "./seed/toyota-suv-compact";
import { seedToyotaSuvLarge } from "./seed/toyota-suv-large";
import { seedToyotaTrucksVans } from "./seed/toyota-trucks-vans";
import { selfHostVehicleImages } from "./catalog-images";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString)
  throw new Error("Set DIRECT_URL or DATABASE_URL before running the seed script.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PRICING_DATE = new Date("2024-05-29T00:00:00.000Z");

async function main() {
  const importer = await prisma.user.upsert({
    where: { clerkId: "system_redline_catalog_importer" },
    create: {
      clerkId: "system_redline_catalog_importer",
      name: "Redline Index catalog importer",
      role: "EDITOR",
    },
    update: { name: "Redline Index catalog importer", role: "EDITOR", deletedAt: null },
  });

  const bmw = await prisma.manufacturer.upsert({
    where: { slug: "bmw" },
    create: { name: "BMW", slug: "bmw", country: "Germany", foundedIn: 1916 },
    update: { name: "BMW", country: "Germany", foundedIn: 1916 },
  });

  const mercedes = await ensureMercedesManufacturer(prisma);
  const audi = await ensureAudiManufacturer(prisma);
  const porsche = await ensurePorscheManufacturer(prisma);
  const toyota = await ensureToyotaManufacturer(prisma);
  const honda = await ensureHondaManufacturer(prisma);
  const ferrari = await ensureFerrariManufacturer(prisma);
  const lamborghini = await ensureLamborghiniManufacturer(prisma);
  const tesla = await ensureTeslaManufacturer(prisma);

  const bmwCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: bmw.id,
    pricingDate: PRICING_DATE,
  };

  const mercedesCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: mercedes.id,
    pricingDate: PRICING_DATE,
  };

  const audiCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: audi.id,
    pricingDate: PRICING_DATE,
  };

  const porscheCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: porsche.id,
    pricingDate: PRICING_DATE,
  };

  const toyotaCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: toyota.id,
    pricingDate: PRICING_DATE,
  };

  const hondaCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: honda.id,
    pricingDate: PRICING_DATE,
  };

  const ferrariCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: ferrari.id,
    pricingDate: PRICING_DATE,
  };

  const lamborghiniCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: lamborghini.id,
    pricingDate: PRICING_DATE,
  };

  const teslaCtx: SeedCtx = {
    prisma,
    importerId: importer.id,
    manufacturerId: tesla.id,
    pricingDate: PRICING_DATE,
  };

  // Hierarchy: Manufacturer → Model → Generation → Year → Trim (see CATALOGUE-HIERARCHY.md)
  const bmwJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["2", () => seedBmw2Series(bmwCtx)],
    ["3", () => seedBmw3Series(bmwCtx)],
    ["4", () => seedBmw4Series(bmwCtx)],
    ["5", () => seedBmw5Series(bmwCtx)],
    ["7", () => seedBmw7Series(bmwCtx)],
    ["i", () => seedBmwISeries(bmwCtx)],
    ["X", () => seedBmwXSeries(bmwCtx)],
    ["Z", () => seedBmwZSeries(bmwCtx)],
  ];

  for (const [name, run] of bmwJobs) {
    const result = await run();
    console.log(
      `BMW ${name} Series: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const mercedesJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["A/CLA", () => seedMercedesACla(mercedesCtx)],
    ["C-Class", () => seedMercedesCClass(mercedesCtx)],
    ["E-Class", () => seedMercedesEClass(mercedesCtx)],
    ["S/Maybach", () => seedMercedesSClass(mercedesCtx)],
    ["GLA/GLB", () => seedMercedesGlaGlb(mercedesCtx)],
    ["GLC", () => seedMercedesGlc(mercedesCtx)],
    ["GLE/GLS", () => seedMercedesGleGls(mercedesCtx)],
    ["G-Class", () => seedMercedesGClass(mercedesCtx)],
    ["SL/CLE", () => seedMercedesRoadstersCle(mercedesCtx)],
    ["AMG GT", () => seedMercedesAmgGt(mercedesCtx)],
    ["EQ compact", () => seedMercedesEqCompact(mercedesCtx)],
    ["EQ flagship", () => seedMercedesEqFlagship(mercedesCtx)],
    ["Other", () => seedMercedesOther(mercedesCtx)],
  ];

  for (const [name, run] of mercedesJobs) {
    const result = await run();
    console.log(
      `Mercedes ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const audiJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["A-line", () => seedAudiALine(audiCtx)],
    ["Q-line", () => seedAudiQLine(audiCtx)],
    ["e-tron", () => seedAudiEtron(audiCtx)],
    ["S/SQ", () => seedAudiSLine(audiCtx)],
    ["RS/sport", () => seedAudiRsSport(audiCtx)],
  ];

  for (const [name, run] of audiJobs) {
    const result = await run();
    console.log(
      `Audi ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const porscheJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["718", () => seedPorsche718(porscheCtx)],
    ["911", () => seedPorsche911(porscheCtx)],
    ["Cayenne/Macan", () => seedPorscheSuv(porscheCtx)],
    ["Panamera/Taycan", () => seedPorscheSedanEv(porscheCtx)],
    ["918", () => seedPorsche918(porscheCtx)],
  ];

  for (const [name, run] of porscheJobs) {
    const result = await run();
    console.log(
      `Porsche ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const toyotaJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["Sedans/hatch", () => seedToyotaSedans(toyotaCtx)],
    ["Sports", () => seedToyotaSports(toyotaCtx)],
    ["SUV compact", () => seedToyotaSuvCompact(toyotaCtx)],
    ["SUV large", () => seedToyotaSuvLarge(toyotaCtx)],
    ["Trucks/vans", () => seedToyotaTrucksVans(toyotaCtx)],
  ];

  for (const [name, run] of toyotaJobs) {
    const result = await run();
    console.log(
      `Toyota ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const hondaJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["Accord", () => seedHondaAccord(hondaCtx)],
    ["Civic", () => seedHondaCivic(hondaCtx)],
    ["Compact", () => seedHondaCompact(hondaCtx)],
    ["SUV", () => seedHondaSuv(hondaCtx)],
    ["Van/truck", () => seedHondaVanTruck(hondaCtx)],
  ];

  for (const [name, run] of hondaJobs) {
    const result = await run();
    console.log(
      `Honda ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const ferrariJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["458", () => seedFerrari458(ferrariCtx)],
    ["California/FF", () => seedFerrariCaliforniaFf(ferrariCtx)],
    ["F12/LaFerrari", () => seedFerrariF12LaFerrari(ferrariCtx)],
    ["488", () => seedFerrari488(ferrariCtx)],
    ["GTC4/Portofino/Roma", () => seedFerrariGtc4PortofinoRoma(ferrariCtx)],
    ["812/Monza", () => seedFerrari812Monza(ferrariCtx)],
    ["F8/SF90", () => seedFerrariF8Sf90(ferrariCtx)],
    ["Current", () => seedFerrariCurrent(ferrariCtx)],
  ];

  for (const [name, run] of ferrariJobs) {
    const result = await run();
    console.log(
      `Ferrari ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const lamborghiniJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["Huracan early", () => seedLamborghiniHuracanEarly(lamborghiniCtx)],
    ["Huracan late", () => seedLamborghiniHuracanLate(lamborghiniCtx)],
    ["Aventador", () => seedLamborghiniAventador(lamborghiniCtx)],
    ["Hypercars", () => seedLamborghiniHypercars(lamborghiniCtx)],
    ["Urus", () => seedLamborghiniUrus(lamborghiniCtx)],
    ["Revuelto/Temerario", () => seedLamborghiniRevueltoTemerario(lamborghiniCtx)],
  ];

  for (const [name, run] of lamborghiniJobs) {
    const result = await run();
    console.log(
      `Lamborghini ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const teslaJobs: Array<[string, () => Promise<{ seeded: string[]; skipped: string[] }>]> = [
    ["Current lineup", () => seedTeslaCurrentLineup(teslaCtx)],
  ];

  for (const [name, run] of teslaJobs) {
    const result = await run();
    console.log(
      `Tesla ${name}: seeded ${result.seeded.length}, skipped ${result.skipped.length}`,
    );
    if (result.seeded.length > 0) console.log(`  Seeded: ${result.seeded.join(", ")}`);
    if (result.skipped.length > 0) console.log(`  Skipped: ${result.skipped.join("; ")}`);
  }

  const imageResult = await selfHostVehicleImages(prisma);
  console.log(
    `Self-hosted ${imageResult.localized}/${imageResult.total} vehicle images; downloaded ${imageResult.downloaded} new assets.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
