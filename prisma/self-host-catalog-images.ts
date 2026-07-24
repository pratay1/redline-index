import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { selfHostVehicleImages } from "./catalog-images";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set DIRECT_URL or DATABASE_URL before self-hosting catalog images.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const result = await selfHostVehicleImages(prisma);
  console.log(
    `Catalog image localization complete: ${result.localized}/${result.total} records updated; ${result.downloaded} assets downloaded.`,
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
