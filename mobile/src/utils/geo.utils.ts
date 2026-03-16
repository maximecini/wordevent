import { Region } from 'react-native-maps';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/** 1 degré de latitude ≈ 111 km */
const METERS_PER_DEGREE_LAT = 111_000;

/**
 * Convertit une Region react-native-maps en rayon de recherche en mètres.
 * Utilise la moitié du delta de latitude pour couvrir la zone visible.
 *
 * @param region - La région courante de la MapView
 * @returns Rayon en mètres
 */
export function regionToRadiusMeters(region: Region): number {
  return Math.round((region.latitudeDelta / 2) * METERS_PER_DEGREE_LAT);
}
const SNAP_RADIUS_M = 50;
const SNAP_TIMEOUT_MS = 3000;

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function distanceSquared(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return (lat1 - lat2) ** 2 + (lng1 - lng2) ** 2;
}

function elementCoords(el: OverpassElement): { lat: number; lng: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

/**
 * Cherche le bâtiment OSM le plus proche du point donné dans un rayon de 50m.
 * Retourne ses coordonnées centrales si trouvé, sinon retourne les coordonnées d'origine.
 *
 * @param lat - Latitude du tap utilisateur
 * @param lng - Longitude du tap utilisateur
 * @returns Coordonnées snappées au bâtiment ou coordonnées d'origine en fallback
 */
export async function snapToNearestBuilding(
  lat: number,
  lng: number,
): Promise<{ lat: number; lng: number }> {
  const fallback = { lat, lng };
  const query = `[out:json][timeout:5];(node["building"](around:${SNAP_RADIUS_M},${lat},${lng});way["building"](around:${SNAP_RADIUS_M},${lat},${lng}););out center;`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SNAP_TIMEOUT_MS);

    const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return fallback;

    const data: OverpassResponse = await res.json();
    if (!data.elements.length) return fallback;

    let nearest = fallback;
    let minDist = Infinity;

    for (const el of data.elements) {
      const coords = elementCoords(el);
      if (!coords) continue;
      const d = distanceSquared(lat, lng, coords.lat, coords.lng);
      if (d < minDist) {
        minDist = d;
        nearest = coords;
      }
    }

    return nearest;
  } catch {
    return fallback;
  }
}
