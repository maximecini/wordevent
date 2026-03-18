export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Construit le fragment SQL PostGIS pour créer un point géographique WGS84.
 * Retourne le placeholder SQL et les paramètres à insérer dans le tableau existant.
 *
 * @param lng - Longitude du point
 * @param lat - Latitude du point
 * @param startIndex - Index de départ des paramètres ($startIndex, $startIndex+1)
 * @returns Fragment SQL et les deux paramètres associés
 */
export function makePointSQL(
  lng: number,
  lat: number,
  startIndex: number,
): { sql: string; params: [number, number] } {
  return {
    sql: `ST_SetSRID(ST_MakePoint($${startIndex}, $${startIndex + 1}), 4326)`,
    params: [lng, lat],
  };
}

/**
 * Construit le fragment SQL ST_DWithin pour filtrer par rayon géographique.
 *
 * @param lng - Longitude du centre de recherche
 * @param lat - Latitude du centre de recherche
 * @param radiusMeters - Rayon en mètres
 * @param startIndex - Index de départ des paramètres
 * @returns Fragment SQL et les trois paramètres associés
 */
export function dwithinSQL(
  lng: number,
  lat: number,
  radiusMeters: number,
  startIndex: number,
): { sql: string; params: [number, number, number] } {
  return {
    sql: `ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($${startIndex}, $${startIndex + 1}), 4326)::geography, $${startIndex + 2})`,
    params: [lng, lat, radiusMeters],
  };
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
