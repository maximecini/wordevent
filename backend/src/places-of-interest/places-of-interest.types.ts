/** Résultat brut d'une requête PostGIS — lat/lng extraits via ST_Y/ST_X. */
export interface RawPlace {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lat: unknown;
  lng: unknown;
}

/** Réponse sérialisée d'un POI avec coordonnées typées. */
export interface PlaceResponse {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  lat: number;
  lng: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Sérialise un RawPlace PostGIS en PlaceResponse. */
export function serializePlace(raw: RawPlace): PlaceResponse {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    icon: raw.icon,
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    userId: raw.userId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
