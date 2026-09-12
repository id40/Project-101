import { NavNode, NavEdge } from '@/types/gis';
import networkData from '@/data/lpuWalkableNetwork.json';

export const NAVIGATION_NODES: NavNode[] = [
  ...networkData.entranceNodes.map(e => ({
    id: e.nodeKey,
    name: e.name,
    lng: e.lng,
    lat: e.lat,
    type: 'building_entrance' as const,
    location_id: e.id,
  })),
  ...networkData.nodes.map(n => ({
    id: n.id,
    name: 'Campus Walkway',
    lng: n.lng,
    lat: n.lat,
    type: 'intersection' as const,
  }))
];

export const NAVIGATION_EDGES: NavEdge[] = (networkData.edges as any[]).map(e => ({
  id: e.id,
  from_id: e.from,
  to_id: e.to,
  distance_m: Math.round(e.dist),
  walk_time_min: Math.max(1, Math.round(e.dist / 80)),
  mode: ['walking', 'cycling', 'vehicle'],
  geometry: e.geometry,
}));

