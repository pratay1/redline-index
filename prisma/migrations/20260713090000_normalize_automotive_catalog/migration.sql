-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('BASE_MSRP', 'DESTINATION_FEE', 'OPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('MANUFACTURER', 'GOVERNMENT', 'PRESS_RELEASE', 'OWNER_MANUAL', 'THIRD_PARTY');

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleReference" DROP CONSTRAINT "VehicleReference_vehicleId_fkey";

-- DropIndex
DROP INDEX "Vehicle_bodyStyle_idx";

-- DropIndex
DROP INDEX "Vehicle_fuelType_idx";

-- DropIndex
DROP INDEX "Vehicle_manufacturerId_modelName_year_idx";

-- DropIndex
DROP INDEX "Vehicle_powerHp_idx";

-- DropIndex
DROP INDEX "Vehicle_year_idx";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "curbWeightKg",
DROP COLUMN "cylinderCount",
DROP COLUMN "engineDisplacementCc",
DROP COLUMN "engineName",
DROP COLUMN "fuelType",
DROP COLUMN "generation",
DROP COLUMN "induction",
DROP COLUMN "manufacturerId",
DROP COLUMN "modelName",
DROP COLUMN "msrpCents",
DROP COLUMN "powerHp",
DROP COLUMN "topSpeedMph",
DROP COLUMN "torqueLbFt",
DROP COLUMN "transmission",
DROP COLUMN "trimName",
DROP COLUMN "year",
DROP COLUMN "zeroToSixtySeconds",
ADD COLUMN     "engineId" TEXT NOT NULL,
ADD COLUMN     "market" TEXT NOT NULL,
ADD COLUMN     "modelYearId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "transmissionId" TEXT NOT NULL,
ALTER COLUMN "bodyStyle" SET NOT NULL,
ALTER COLUMN "drivetrain" SET NOT NULL;

-- AlterTable
ALTER TABLE "VehicleImage" ADD COLUMN     "credit" TEXT,
ADD COLUMN     "sourceId" TEXT;

-- DropTable
DROP TABLE "VehicleReference";

-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleGeneration" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelYear" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "fuelType" "FuelType" NOT NULL,
    "displacementCc" INTEGER,
    "cylinderCount" INTEGER,
    "configuration" TEXT,
    "induction" TEXT,
    "electrification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transmission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransmissionType" NOT NULL,
    "gearCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDimensions" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "lengthIn" DOUBLE PRECISION,
    "widthIn" DOUBLE PRECISION,
    "heightIn" DOUBLE PRECISION,
    "wheelbaseIn" DOUBLE PRECISION,
    "frontTrackIn" DOUBLE PRECISION,
    "rearTrackIn" DOUBLE PRECISION,
    "groundClearanceIn" DOUBLE PRECISION,
    "curbWeightKg" INTEGER,
    "grossVehicleWeightKg" INTEGER,
    "cargoVolumeLiters" DOUBLE PRECISION,
    "seatingCapacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleDimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePerformance" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "powerHp" INTEGER,
    "torqueLbFt" INTEGER,
    "zeroToSixtySeconds" DOUBLE PRECISION,
    "quarterMileSeconds" DOUBLE PRECISION,
    "topSpeedMph" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehiclePerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleFuelEconomy" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "cityMpg" DOUBLE PRECISION,
    "highwayMpg" DOUBLE PRECISION,
    "combinedMpg" DOUBLE PRECISION,
    "electricRangeMiles" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleFuelEconomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePrice" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "type" "PriceType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehiclePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCitation" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "locator" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceCitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_slug_key" ON "VehicleModel"("slug");

-- CreateIndex
CREATE INDEX "VehicleModel_manufacturerId_idx" ON "VehicleModel"("manufacturerId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_manufacturerId_name_key" ON "VehicleModel"("manufacturerId", "name");

-- CreateIndex
CREATE INDEX "VehicleGeneration_modelId_startYear_idx" ON "VehicleGeneration"("modelId", "startYear");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleGeneration_modelId_code_key" ON "VehicleGeneration"("modelId", "code");

-- CreateIndex
CREATE INDEX "ModelYear_year_idx" ON "ModelYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ModelYear_generationId_year_key" ON "ModelYear"("generationId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Engine_slug_key" ON "Engine"("slug");

-- CreateIndex
CREATE INDEX "Engine_manufacturerId_fuelType_idx" ON "Engine"("manufacturerId", "fuelType");

-- CreateIndex
CREATE INDEX "Engine_displacementCc_idx" ON "Engine"("displacementCc");

-- CreateIndex
CREATE UNIQUE INDEX "Engine_manufacturerId_code_key" ON "Engine"("manufacturerId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Transmission_slug_key" ON "Transmission"("slug");

-- CreateIndex
CREATE INDEX "Transmission_type_idx" ON "Transmission"("type");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleDimensions_vehicleId_key" ON "VehicleDimensions"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "VehiclePerformance_vehicleId_key" ON "VehiclePerformance"("vehicleId");

-- CreateIndex
CREATE INDEX "VehiclePerformance_powerHp_idx" ON "VehiclePerformance"("powerHp");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleFuelEconomy_vehicleId_key" ON "VehicleFuelEconomy"("vehicleId");

-- CreateIndex
CREATE INDEX "VehiclePrice_market_currency_idx" ON "VehiclePrice"("market", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "VehiclePrice_vehicleId_market_type_effectiveAt_key" ON "VehiclePrice"("vehicleId", "market", "type", "effectiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "Source_slug_key" ON "Source"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");

-- CreateIndex
CREATE INDEX "Source_publisher_type_idx" ON "Source"("publisher", "type");

-- CreateIndex
CREATE INDEX "SourceCitation_entityType_entityId_idx" ON "SourceCitation"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceCitation_sourceId_entityType_entityId_fieldName_key" ON "SourceCitation"("sourceId", "entityType", "entityId", "fieldName");

-- CreateIndex
CREATE INDEX "Vehicle_modelYearId_idx" ON "Vehicle"("modelYearId");

-- CreateIndex
CREATE INDEX "Vehicle_engineId_idx" ON "Vehicle"("engineId");

-- CreateIndex
CREATE INDEX "Vehicle_transmissionId_idx" ON "Vehicle"("transmissionId");

-- CreateIndex
CREATE INDEX "Vehicle_market_bodyStyle_drivetrain_idx" ON "Vehicle"("market", "bodyStyle", "drivetrain");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_modelYearId_name_market_bodyStyle_drivetrain_engine_key" ON "Vehicle"("modelYearId", "name", "market", "bodyStyle", "drivetrain", "engineId", "transmissionId");

-- CreateIndex
CREATE INDEX "VehicleImage_sourceId_idx" ON "VehicleImage"("sourceId");

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGeneration" ADD CONSTRAINT "VehicleGeneration_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelYear" ADD CONSTRAINT "ModelYear_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "VehicleGeneration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engine" ADD CONSTRAINT "Engine_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_modelYearId_fkey" FOREIGN KEY ("modelYearId") REFERENCES "ModelYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_transmissionId_fkey" FOREIGN KEY ("transmissionId") REFERENCES "Transmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDimensions" ADD CONSTRAINT "VehicleDimensions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePerformance" ADD CONSTRAINT "VehiclePerformance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFuelEconomy" ADD CONSTRAINT "VehicleFuelEconomy_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePrice" ADD CONSTRAINT "VehiclePrice_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation" ADD CONSTRAINT "SourceCitation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
