import { RouteNode, RouteEdge, NavigationRoute } from '@/types/campus';
import { CAMPUS_ROUTE_NODES, CAMPUS_ROUTE_EDGES } from '@/data/lpuGraph';

export function findShortestOutdoorRoute(
  startNodeId: string,
  destNodeId: string,
  startLabel = 'Start',
  destLabel = 'Destination'
): NavigationRoute | null {
  const nodesMap = new Map<string, RouteNode>();
  CAMPUS_ROUTE_NODES.forEach((node) => nodesMap.set(node.id, node));

  // Build adjacency list
  const adj = new Map<string, { to: string; weight: number }[]>();
  CAMPUS_ROUTE_NODES.forEach((n) => adj.set(n.id, []));

  CAMPUS_ROUTE_EDGES.forEach((e) => {
    if (e.is_walkable) {
      adj.get(e.from_node_id)?.push({ to: e.to_node_id, weight: e.distance_meters });
      adj.get(e.to_node_id)?.push({ to: e.from_node_id, weight: e.distance_meters });
    }
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  CAMPUS_ROUTE_NODES.forEach((node) => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let current: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        current = nodeId;
      }
    }

    if (current === null || minDistance === Infinity) break;
    if (current === destNodeId) break;

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (unvisited.has(edge.to)) {
        const alt = distances.get(current)! + edge.weight;
        if (alt < distances.get(edge.to)!) {
          distances.set(edge.to, alt);
          previous.set(edge.to, current);
        }
      }
    }
  }

  // Backtrack path
  const path: RouteNode[] = [];
  let curr: string | null = destNodeId;

  if (distances.get(destNodeId) === Infinity) return null;

  while (curr !== null) {
    const node = nodesMap.get(curr);
    if (node) path.unshift(node);
    curr = previous.get(curr) || null;
  }

  if (path.length === 0 || path[0].id !== startNodeId) return null;

  const totalDist = distances.get(destNodeId) || 0;
  // Standard walking speed: ~1.2 m/s or 72 meters per minute
  const walkingMinutes = Math.max(1, Math.round(totalDist / 72));

  return {
    path_nodes: path,
    coordinates: path.map((n) => [n.x, n.y + 0.3, n.z]),
    total_distance: totalDist,
    estimated_time_min: walkingMinutes,
    start_name: startLabel,
    destination_name: destLabel,
  };
}

export function findNearestNode(x: number, z: number): RouteNode {
  let nearest = CAMPUS_ROUTE_NODES[0];
  let minDist = Infinity;

  CAMPUS_ROUTE_NODES.forEach((node) => {
    const dist = Math.hypot(node.x - x, node.z - z);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  });

  return nearest;
}
