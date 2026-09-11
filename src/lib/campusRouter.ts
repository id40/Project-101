import { NavNode, NavEdge, NavigationRoute, NavigationMode } from '@/types/gis';
import { NAVIGATION_NODES, NAVIGATION_EDGES } from '@/data/lpuNavigationGraph';

// Helper to calculate edge cost based on mode
function calculateEdgeCost(edge: NavEdge, mode: NavigationMode): number {
  if (mode === 'walking') {
    return edge.distance_m;
  } else if (mode === 'cycling') {
    return edge.distance_m * 0.4; // Faster than walking
  } else {
    // Vehicle
    return edge.distance_m * 0.2; 
  }
}

export function findNearestNavNode(lng: number, lat: number): NavNode {
  let nearestNode = NAVIGATION_NODES[0];
  let minDistance = Infinity;
  
  for (const node of NAVIGATION_NODES) {
    // Basic euclidean distance approximation for finding nearest node
    const dLat = node.lat - lat;
    const dLng = node.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    
    if (distSq < minDistance) {
      minDistance = distSq;
      nearestNode = node;
    }
  }
  
  return nearestNode;
}

export function findRoute(
  originId: string,
  destinationId: string, 
  mode: NavigationMode
): NavigationRoute | null {
  // Build adjacency list for Dijkstra's
  const adjacencyList = new Map<string, { nodeId: string, edge: NavEdge }[]>();
  
  // Initialize with nodes
  for (const node of NAVIGATION_NODES) {
    adjacencyList.set(node.id, []);
  }
  
  // Populate edges (assume bidirectional for simple routing)
  for (const edge of NAVIGATION_EDGES) {
    // Check mode restrictions
    if (!edge.mode.includes(mode)) continue;
    
    if (adjacencyList.has(edge.from_id)) {
      adjacencyList.get(edge.from_id)!.push({ nodeId: edge.to_id, edge });
    }
    if (adjacencyList.has(edge.to_id)) {
      adjacencyList.get(edge.to_id)!.push({ nodeId: edge.from_id, edge });
    }
  }
  
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string, edge: NavEdge } | null>();
  const unvisited = new Set<string>();
  
  for (const node of NAVIGATION_NODES) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }
  
  distances.set(originId, 0);
  
  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let minDistance = Infinity;
    
    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        currentId = nodeId;
      }
    }
    
    if (currentId === null) break;
    if (currentId === destinationId) break;
    
    unvisited.delete(currentId);
    
    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.nodeId)) continue;
      
      const cost = calculateEdgeCost(neighbor.edge, mode);
      const alternativeDistance = distances.get(currentId)! + cost;
      
      if (alternativeDistance < distances.get(neighbor.nodeId)!) {
        distances.set(neighbor.nodeId, alternativeDistance);
        previous.set(neighbor.nodeId, { nodeId: currentId, edge: neighbor.edge });
      }
    }
  }
  
  if (distances.get(destinationId) === Infinity) return null;
  
  // Reconstruct path
  const path: NavNode[] = [];
  const edges: NavEdge[] = [];
  
  let current = destinationId;
  while (current !== originId) {
    const node = NAVIGATION_NODES.find(n => n.id === current)!;
    path.unshift(node);
    
    const prev = previous.get(current)!;
    edges.unshift(prev.edge);
    
    current = prev.nodeId;
  }
  
  const originNode = NAVIGATION_NODES.find(n => n.id === originId)!;
  path.unshift(originNode);
  
  // Extract full coordinate list
  const coordinates: [number, number][] = [];
  coordinates.push([originNode.lng, originNode.lat]);
  
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const targetNode = path[i + 1];
    if (edge.geometry && edge.geometry.length >= 2) {
      // Determine if geometry should be reversed
      const lastCoord = edge.geometry[edge.geometry.length - 1] as [number, number];
      const isReversed = Math.abs(lastCoord[0] - targetNode.lng) > 0.00001 || 
                         Math.abs(lastCoord[1] - targetNode.lat) > 0.00001;
      
      const geom = isReversed ? [...edge.geometry].reverse() : edge.geometry;
      // Skip the first coordinate as it should be the same as the last added coordinate
      for (let j = 1; j < geom.length; j++) {
        coordinates.push(geom[j] as [number, number]);
      }
    } else {
      coordinates.push([targetNode.lng, targetNode.lat]);
    }
  }
  
  let totalDistance = 0;
  for (const edge of edges) {
    totalDistance += edge.distance_m;
  }
  
  // Calculate time based on mode
  let timeMin = 0;
  if (mode === 'walking') {
    timeMin = totalDistance / 80; // 80 m/min ~ 4.8 km/h
  } else if (mode === 'cycling') {
    timeMin = totalDistance / 250; // 250 m/min ~ 15 km/h
  } else {
    timeMin = totalDistance / 333; // 333 m/min ~ 20 km/h
  }
  
  return {
    path,
    edges,
    coordinates,
    total_distance_m: totalDistance,
    estimated_time_min: timeMin,
    origin_name: path[0].name || 'Start',
    destination_name: path[path.length - 1].name || 'Destination',
    mode
  };
}

export function findRouteByCoords(
  originLng: number, originLat: number,
  destLng: number, destLat: number,
  mode: NavigationMode
): NavigationRoute | null {
  const originNode = findNearestNavNode(originLng, originLat);
  const destNode = findNearestNavNode(destLng, destLat);
  
  if (originNode.id === destNode.id) {
    return null; // Same location
  }
  
  return findRoute(originNode.id, destNode.id, mode);
}
