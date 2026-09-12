import { NavNode, NavEdge, NavigationRoute, NavigationMode } from '@/types/gis';
import networkData from '@/data/lpuWalkableNetwork.json';
import { haversineDistance } from '@/lib/gisUtils';

interface RawEdge {
  id: string;
  from: string;
  to: string;
  dist: number;
  type: string;
  isPed: boolean;
  geometry: [number, number][];
}

interface AdjItem {
  targetKey: string;
  dist: number;
  edge: RawEdge;
}

// Build static adjacency list once in memory
const adjacencyMap = new Map<string, AdjItem[]>();
const nodeMap = new Map<string, { id: string; lat: number; lng: number; x: number; y: number }>();
const entranceMap = new Map<string, typeof networkData.entranceNodes[0]>();

// Initialize maps
for (const node of networkData.nodes) {
  nodeMap.set(node.id, node);
  adjacencyMap.set(node.id, []);
}

for (const edge of (networkData.edges as RawEdge[])) {
  if (adjacencyMap.has(edge.from)) {
    adjacencyMap.get(edge.from)!.push({ targetKey: edge.to, dist: edge.dist, edge });
  }
  if (adjacencyMap.has(edge.to)) {
    adjacencyMap.get(edge.to)!.push({ targetKey: edge.from, dist: edge.dist, edge });
  }
}

for (const ent of networkData.entranceNodes) {
  entranceMap.set(ent.id, ent);
}

// Find nearest node on walkable network
export function findNearestNavNode(lng: number, lat: number): NavNode {
  // First check if within 40m of a known entrance
  for (const ent of networkData.entranceNodes) {
    const d = haversineDistance(lat, lng, ent.lat, ent.lng);
    if (d < 35) {
      return {
        id: ent.nodeKey,
        name: ent.name,
        lng: ent.lng,
        lat: ent.lat,
        type: 'building_entrance',
        location_id: ent.id,
      };
    }
  }

  let bestNode = networkData.nodes[0];
  let minD = Infinity;

  for (const node of networkData.nodes) {
    const dLat = node.lat - lat;
    const dLng = node.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minD) {
      minD = distSq;
      bestNode = node;
    }
  }

  return {
    id: bestNode.id,
    name: 'Campus Walkway',
    lng: bestNode.lng,
    lat: bestNode.lat,
    type: 'intersection',
  };
}

export function findRoute(
  originId: string,
  destinationId: string,
  mode: NavigationMode = 'walking'
): NavigationRoute | null {
  // Check if originId or destinationId is an entrance ID
  const originEntrance = entranceMap.get(originId);
  const destEntrance = entranceMap.get(destinationId);

  const startKey = originEntrance ? originEntrance.nodeKey : originId;
  const targetKey = destEntrance ? destEntrance.nodeKey : destinationId;

  if (!nodeMap.has(startKey) || !nodeMap.has(targetKey)) {
    return null;
  }

  if (startKey === targetKey) {
    const n = nodeMap.get(startKey)!;
    return {
      path: [{ id: n.id, name: originEntrance?.name || 'Current Location', lng: n.lng, lat: n.lat, type: 'building_entrance' }],
      edges: [],
      coordinates: [[n.lng, n.lat]],
      total_distance_m: 0,
      estimated_time_min: 0,
      origin_name: originEntrance?.name || 'Origin',
      destination_name: destEntrance?.name || 'Destination',
      mode,
    };
  }

  // Dijkstra algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, { prevKey: string; edge: RawEdge } | null>();
  const unvisited = new Set<string>();

  for (const k of nodeMap.keys()) {
    distances.set(k, Infinity);
    previous.set(k, null);
    unvisited.add(k);
  }

  distances.set(startKey, 0);

  while (unvisited.size > 0) {
    let currentKey: string | null = null;
    let minDist = Infinity;

    for (const key of unvisited) {
      const dist = distances.get(key)!;
      if (dist < minDist) {
        minDist = dist;
        currentKey = key;
      }
    }

    if (currentKey === null || minDist === Infinity) break;
    if (currentKey === targetKey) break;

    unvisited.delete(currentKey);

    const neighbors = adjacencyMap.get(currentKey) || [];
    for (const n of neighbors) {
      if (!unvisited.has(n.targetKey)) continue;

      let cost = n.dist;
      if (mode === 'cycling') cost *= 0.4;
      else if (mode === 'vehicle') {
        if (n.edge.type === 'footway') cost *= 10.0;
        else cost *= 0.25;
      }

      const alt = minDist + cost;
      if (alt < distances.get(n.targetKey)!) {
        distances.set(n.targetKey, alt);
        previous.set(n.targetKey, { prevKey: currentKey, edge: n.edge });
      }
    }
  }

  if (distances.get(targetKey) === Infinity) return null;

  // Backtrack path
  const pathKeys: string[] = [];
  const edges: RawEdge[] = [];
  let curr = targetKey;

  while (curr !== startKey) {
    pathKeys.unshift(curr);
    const prev = previous.get(curr)!;
    edges.unshift(prev.edge);
    curr = prev.prevKey;
  }
  pathKeys.unshift(startKey);

  // Construct coordinates list following all road curve geometries
  const coordinates: [number, number][] = [];
  let totalDistance = 0;

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    totalDistance += edge.dist;
    const fromNode = nodeMap.get(pathKeys[i])!;
    const toNode = nodeMap.get(pathKeys[i + 1])!;

    if (i === 0) {
      coordinates.push([fromNode.lng, fromNode.lat]);
    }

    if (edge.geometry && edge.geometry.length >= 2) {
      const g0 = edge.geometry[0];
      const gN = edge.geometry[edge.geometry.length - 1];
      const d0 = Math.hypot(g0[0] - fromNode.lng, g0[1] - fromNode.lat);
      const dN = Math.hypot(gN[0] - fromNode.lng, gN[1] - fromNode.lat);

      const geom = d0 <= dN ? edge.geometry : [...edge.geometry].reverse();
      for (let j = 1; j < geom.length; j++) {
        coordinates.push(geom[j]);
      }
    } else {
      coordinates.push([toNode.lng, toNode.lat]);
    }
  }

  const pathNodes: NavNode[] = pathKeys.map(k => {
    const n = nodeMap.get(k)!;
    return {
      id: k,
      name: k === startKey ? (originEntrance?.name || 'Start') : k === targetKey ? (destEntrance?.name || 'Destination') : 'Campus Walkway',
      lng: n.lng,
      lat: n.lat,
      type: k === startKey || k === targetKey ? 'building_entrance' : 'intersection',
    };
  });

  const timeMin = mode === 'walking'
    ? Math.max(1, Math.round(totalDistance / 80))
    : mode === 'cycling'
    ? Math.max(1, Math.round(totalDistance / 250))
    : Math.max(1, Math.round(totalDistance / 350));

  return {
    path: pathNodes,
    edges: edges.map(e => ({
      id: e.id,
      from_id: e.from,
      to_id: e.to,
      distance_m: e.dist,
      walk_time_min: Math.max(1, Math.round(e.dist / 80)),
      mode: ['walking', 'cycling', 'vehicle'],
      geometry: e.geometry,
    })),
    coordinates,
    total_distance_m: Math.round(totalDistance),
    estimated_time_min: timeMin,
    origin_name: originEntrance?.name || 'Start Point',
    destination_name: destEntrance?.name || 'Destination',
    mode,
  };
}

export function findRouteByCoords(
  originLng: number, originLat: number,
  destLng: number, destLat: number,
  mode: NavigationMode = 'walking'
): NavigationRoute | null {
  const originNode = findNearestNavNode(originLng, originLat);
  const destNode = findNearestNavNode(destLng, destLat);

  const route = findRoute(originNode.id, destNode.id, mode);
  if (!route) return null;

  return route;
}

