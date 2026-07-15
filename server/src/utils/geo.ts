// =============================================================================
// Geo Utilities — Haversine Distance Calculation
// Calculates the great-circle distance between two lat/lng points.
// Used for nearby provider search with bounding box pre-filter.
// =============================================================================

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the Haversine distance between two points in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate a bounding box around a point at a given radius.
 * Used as a SQL pre-filter before applying Haversine for exact distance.
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const lngDelta = radiusKm / (111.32 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
