import * as turf from '@turf/turf';

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return turf.distance(
    turf.point([lng1, lat1]),
    turf.point([lng2, lat2]),
    { units: 'meters' }
  );
}

export function bearingBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return turf.bearing(
    turf.point([lng1, lat1]),
    turf.point([lng2, lat2])
  );
}

export function findNearestFeature(lng: number, lat: number, features: GeoJSON.FeatureCollection): GeoJSON.Feature | null {
  if (!features.features || features.features.length === 0) return null;
  
  const point = turf.point([lng, lat]);
  let nearest: GeoJSON.Feature | null = null;
  let minDist = Infinity;
  
  for (const feature of features.features) {
    let dist = Infinity;
    if (feature.geometry.type === 'Point') {
      dist = turf.distance(point, feature as GeoJSON.Feature<GeoJSON.Point>, { units: 'meters' });
    } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      const center = turf.center(feature);
      dist = turf.distance(point, center, { units: 'meters' });
    }
    
    if (dist < minDist) {
      minDist = dist;
      nearest = feature;
    }
  }
  
  return nearest;
}

export function lineLength(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;
  return turf.length(turf.lineString(coordinates), { units: 'meters' });
}

export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)} m`;
  }
  return `${(metres / 1000).toFixed(1)} km`;
}

export function formatWalkTime(minutes: number): string {
  const mins = Math.round(minutes);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} hr ${remMins} min`;
}

export function polygonCenter(coordinates: number[][][]): [number, number] {
  const poly = turf.polygon(coordinates);
  const center = turf.centerOfMass(poly);
  return center.geometry.coordinates as [number, number];
}
