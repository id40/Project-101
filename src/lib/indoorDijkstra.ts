import { BuildingFloorPlan, IndoorRoom, IndoorRoute, IndoorStep } from '@/types/indoor';
import { INDOOR_FLOOR_PLANS } from '@/data/indoorData';

export function calculateIndoorRoute(
  buildingId: string,
  startRoomId: string,
  destRoomId: string
): IndoorRoute | null {
  const plan: BuildingFloorPlan | undefined = INDOOR_FLOOR_PLANS[buildingId];
  if (!plan) return null;

  // Flatten all rooms and nodes across floors
  const allRooms: IndoorRoom[] = [];
  const allNodesMap = new Map<string, { id: string; floor: number; x: number; y: number; type: string; room_id?: string }>();
  const adj = new Map<string, { to: string; distance: number; is_stair?: boolean }[]>();

  plan.floors.forEach((f) => {
    f.rooms.forEach((r) => allRooms.push(r));
    f.nodes.forEach((n) => {
      allNodesMap.set(n.id, n);
      if (!adj.has(n.id)) adj.set(n.id, []);
    });
    f.edges.forEach((e) => {
      adj.get(e.from)?.push({ to: e.to, distance: e.distance, is_stair: e.is_stair_transition });
      adj.get(e.to)?.push({ to: e.from, distance: e.distance, is_stair: e.is_stair_transition });
    });
  });

  const startRoom = allRooms.find((r) => r.id === startRoomId);
  const destRoom = allRooms.find((r) => r.id === destRoomId);

  if (!startRoom || !destRoom) return null;

  // Find door nodes for start and destination
  let startNodeId: string | null = null;
  let destNodeId: string | null = null;

  for (const [id, node] of allNodesMap.entries()) {
    if (node.room_id === startRoomId) startNodeId = id;
    if (node.room_id === destRoomId) destNodeId = id;
  }

  // Fallback to closest nodes if explicit door not found
  if (!startNodeId) {
    let minDist = Infinity;
    for (const [id, node] of allNodesMap.entries()) {
      if (node.floor === startRoom.floor) {
        const d = Math.hypot(node.x - startRoom.x, node.y - startRoom.y);
        if (d < minDist) {
          minDist = d;
          startNodeId = id;
        }
      }
    }
  }

  if (!destNodeId) {
    let minDist = Infinity;
    for (const [id, node] of allNodesMap.entries()) {
      if (node.floor === destRoom.floor) {
        const d = Math.hypot(node.x - destRoom.x, node.y - destRoom.y);
        if (d < minDist) {
          minDist = d;
          destNodeId = id;
        }
      }
    }
  }

  if (!startNodeId || !destNodeId) return null;

  // Dijkstra on indoor graph
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const id of allNodesMap.keys()) {
    distances.set(id, Infinity);
    previous.set(id, null);
    unvisited.add(id);
  }

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let curr: string | null = null;
    let minD = Infinity;
    for (const id of unvisited) {
      const d = distances.get(id)!;
      if (d < minD) {
        minD = d;
        curr = id;
      }
    }

    if (curr === null || minD === Infinity) break;
    if (curr === destNodeId) break;

    unvisited.delete(curr);

    const neighbors = adj.get(curr) || [];
    for (const edge of neighbors) {
      if (unvisited.has(edge.to)) {
        const alt = distances.get(curr)! + edge.distance;
        if (alt < distances.get(edge.to)!) {
          distances.set(edge.to, alt);
          previous.set(edge.to, curr);
        }
      }
    }
  }

  if (distances.get(destNodeId) === Infinity) return null;

  // Backtrack path
  const pathNodeIds: string[] = [];
  let tracer: string | null = destNodeId;
  while (tracer !== null) {
    pathNodeIds.unshift(tracer);
    tracer = previous.get(tracer) || null;
  }

  // Generate Turn-by-Turn Steps
  const steps: IndoorStep[] = [];
  steps.push({
    instruction: `Start from ${startRoom.name} (${startRoom.room_number})`,
    distance: 0,
    direction: 'straight',
    floor: startRoom.floor,
    icon: 'start',
  });

  let currentFloor = startRoom.floor;
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const fromNode = allNodesMap.get(pathNodeIds[i])!;
    const toNode = allNodesMap.get(pathNodeIds[i + 1])!;
    const segDist = Math.round(Math.hypot(fromNode.x - toNode.x, fromNode.y - toNode.y));

    if (fromNode.floor !== toNode.floor) {
      const isUp = toNode.floor > fromNode.floor;
      steps.push({
        instruction: isUp 
          ? `Take stairs/elevator up to Floor ${toNode.floor}` 
          : `Take stairs/elevator down to Floor ${toNode.floor}`,
        distance: 15,
        direction: isUp ? 'stairs_up' : 'stairs_down',
        floor: toNode.floor,
        icon: 'stairs',
      });
      currentFloor = toNode.floor;
    } else if (segDist > 3) {
      steps.push({
        instruction: `Walk down the corridor (${segDist}m)`,
        distance: segDist,
        direction: 'straight',
        floor: currentFloor,
        icon: 'walk',
      });
    }
  }

  steps.push({
    instruction: `You have arrived at ${destRoom.name} (${destRoom.room_number})`,
    distance: 0,
    direction: 'arrive',
    floor: destRoom.floor,
    icon: 'flag',
  });

  const pathPoints = pathNodeIds.map((id) => {
    const n = allNodesMap.get(id)!;
    return { x: n.x, y: n.y, floor: n.floor };
  });

  const totalDist = distances.get(destNodeId) || 0;
  const timeSeconds = Math.round(totalDist * 1.1);

  return {
    building_id: buildingId,
    start_room: startRoom,
    dest_room: destRoom,
    steps,
    path_points: pathPoints,
    total_distance: totalDist,
    estimated_time_seconds: timeSeconds,
  };
}
