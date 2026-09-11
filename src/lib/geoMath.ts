import { LPU_CAMPUS_CENTER } from '@/data/lpuSeedData';

// 1 degree latitude ~ 111,320 meters
const METERS_PER_DEGREE_LAT = 111320;

export function gpsToCampusCoords(lat: number, lon: number): { x: number; z: number } {
  const dLat = lat - LPU_CAMPUS_CENTER.latitude;
  const dLon = lon - LPU_CAMPUS_CENTER.longitude;

  // Meters per degree longitude at LPU's latitude (~31.25 deg)
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((LPU_CAMPUS_CENTER.latitude * Math.PI) / 180);

  // In Three.js:
  // +X points East (Longitude increases)
  // -Z points North (Latitude increases)
  const x = dLon * metersPerDegreeLon;
  const z = -(dLat * METERS_PER_DEGREE_LAT);

  return { x, z };
}

export function campusCoordsToGps(x: number, z: number): { latitude: number; longitude: number } {
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((LPU_CAMPUS_CENTER.latitude * Math.PI) / 180);

  const dLat = -z / METERS_PER_DEGREE_LAT;
  const dLon = x / metersPerDegreeLon;

  return {
    latitude: LPU_CAMPUS_CENTER.latitude + dLat,
    longitude: LPU_CAMPUS_CENTER.longitude + dLon,
  };
}

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
