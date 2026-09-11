export interface IndoorRoom {
  id: string;
  room_number: string; // e.g. '34-102', 'LIB-204'
  name: string;
  category: 'classroom' | 'lab' | 'office' | 'washroom' | 'lift' | 'stairs' | 'cafeteria' | 'entrance';
  floor: number; // 0 = Ground, 1 = 1st Floor, 2 = 2nd Floor
  x: number; // relative 2D coordinate on floor map
  y: number;
  width: number;
  height: number;
  color?: string;
  icon?: string;
}

export interface IndoorNode {
  id: string;
  floor: number;
  x: number;
  y: number;
  type: 'hallway' | 'room_door' | 'stairs' | 'lift' | 'entrance';
  room_id?: string;
}

export interface IndoorEdge {
  from: string;
  to: string;
  distance: number;
  is_stair_transition?: boolean;
}

export interface IndoorStep {
  instruction: string;
  distance: number; // meters
  direction: 'straight' | 'left' | 'right' | 'stairs_up' | 'stairs_down' | 'lift' | 'arrive';
  floor: number;
  icon: string;
}

export interface IndoorRoute {
  building_id: string;
  start_room: IndoorRoom;
  dest_room: IndoorRoom;
  steps: IndoorStep[];
  path_points: { x: number; y: number; floor: number }[];
  total_distance: number;
  estimated_time_seconds: number;
}

export interface BuildingFloorPlan {
  building_id: string;
  building_name: string;
  block_code: string;
  floors: {
    floor_number: number;
    floor_name: string;
    rooms: IndoorRoom[];
    nodes: IndoorNode[];
    edges: IndoorEdge[];
  }[];
}
