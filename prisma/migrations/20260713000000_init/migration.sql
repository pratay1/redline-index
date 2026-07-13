-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'EDITOR', 'ADMIN');
CREATE TYPE "VehicleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "BodyStyle" AS ENUM ('CABRIOLET', 'COUPE', 'CROSSOVER', 'HATCHBACK', 'ROADSTER', 'SEDAN', 'SUV', 'TRUCK', 'VAN', 'WAGON');
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'ELECTRIC', 'FLEX_FUEL', 'HYBRID', 'HYDROGEN', 'PETROL', 'PLUG_IN_HYBRID');
CREATE TYPE "Drivetrain" AS ENUM ('FWD', 'RWD', 'AWD', 'FOUR_WD');
CREATE TYPE "TransmissionType" AS ENUM ('AUTOMATIC', 'CVT', 'DUAL_CLUTCH', 'MANUAL', 'SINGLE_SPEED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "clerkId" TEXT NOT NULL, "email" TEXT, "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER', "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "country" TEXT,
    "foundedIn" INTEGER, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "manufacturerId" TEXT NOT NULL, "modelName" TEXT NOT NULL,
    "trimName" TEXT, "generation" TEXT, "year" INTEGER NOT NULL, "bodyStyle" "BodyStyle",
    "fuelType" "FuelType", "drivetrain" "Drivetrain", "transmission" "TransmissionType",
    "engineName" TEXT, "engineDisplacementCc" INTEGER, "cylinderCount" INTEGER, "induction" TEXT,
    "powerHp" INTEGER, "torqueLbFt" INTEGER, "zeroToSixtySeconds" DOUBLE PRECISION, "topSpeedMph" INTEGER,
    "curbWeightKg" INTEGER, "msrpCents" INTEGER, "description" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMP(3), "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VehicleImage" (
    "id" TEXT NOT NULL, "vehicleId" TEXT NOT NULL, "url" TEXT NOT NULL, "alt" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VehicleReference" (
    "id" TEXT NOT NULL, "vehicleId" TEXT NOT NULL, "sourceName" TEXT NOT NULL, "sourceUrl" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleReference_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL, "actorId" TEXT NOT NULL, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE UNIQUE INDEX "Manufacturer_slug_key" ON "Manufacturer"("slug");
CREATE INDEX "Manufacturer_name_idx" ON "Manufacturer"("name");
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");
CREATE INDEX "Vehicle_status_publishedAt_idx" ON "Vehicle"("status", "publishedAt");
CREATE INDEX "Vehicle_manufacturerId_modelName_year_idx" ON "Vehicle"("manufacturerId", "modelName", "year");
CREATE INDEX "Vehicle_year_idx" ON "Vehicle"("year");
CREATE INDEX "Vehicle_bodyStyle_idx" ON "Vehicle"("bodyStyle");
CREATE INDEX "Vehicle_fuelType_idx" ON "Vehicle"("fuelType");
CREATE INDEX "Vehicle_powerHp_idx" ON "Vehicle"("powerHp");
CREATE UNIQUE INDEX "VehicleImage_vehicleId_position_key" ON "VehicleImage"("vehicleId", "position");
CREATE UNIQUE INDEX "VehicleReference_vehicleId_sourceUrl_key" ON "VehicleReference"("vehicleId", "sourceUrl");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VehicleReference" ADD CONSTRAINT "VehicleReference_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
