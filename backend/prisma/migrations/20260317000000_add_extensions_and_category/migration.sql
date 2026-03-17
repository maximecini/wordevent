-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_tiger_geocoder";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SPORT', 'MUSIC', 'FOOD', 'PARTY', 'ART', 'OTHER');

-- AlterTable
ALTER TABLE "events" ADD COLUMN "category" "EventCategory" NOT NULL DEFAULT 'OTHER';
