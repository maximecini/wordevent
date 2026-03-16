import { Prisma } from '@prisma/client';

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Génère un fragment SQL PostGIS pour créer un point géographique WGS84.
 *
 * @param lng - Longitude
 * @param lat - Latitude
 * @returns Fragment SQL Prisma utilisable dans $queryRaw / $executeRaw
 */
export function makePoint(lng: number, lat: number): Prisma.Sql {
  return Prisma.sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
}

/**
 * Sérialise les coordonnées brutes retournées par PostGIS en { lat, lng }.
 * PostGIS peut retourner lat/lng comme string ou number selon le driver.
 *
 * @param raw - Objet avec lat et lng bruts
 * @returns Coordonnées typées
 */
export function serializeCoords(raw: { lat: unknown; lng: unknown }): Coords {
  return { lat: Number(raw.lat), lng: Number(raw.lng) };
}
