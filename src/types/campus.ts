export type LocationType = 
  | 'academic' 
  | 'facility' 
  | 'food' 
  | 'administrative' 
  | 'sports' 
  | 'hostel' 
  | 'hospital' 
  | 'auditorium';

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  [key: string]: string | undefined;
}

export interface CampusLocation {
  id: string; // e.g. 'loc-001'
  name: string;
  slug: string;
  type: LocationType;
  description: string;
  short_description: string;
  block_code: string; // e.g. 'LIB', 'A', '34', 'FC'
  latitude: number;
  longitude: number;
  map_x: number;
  map_y: number;
  map_z: number;
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
  model_object_id: string;
  image_url?: string;
  opening_hours?: OpeningHours;
  facilities: string[];
  is_active: boolean;
  has_indoor_map?: boolean;
}

export interface Vendor {
  id: string;
  location_id: string;
  name: string;
  category: 'food' | 'pharmacy' | 'stationery' | 'atm' | 'services';
  description: string;
  phone?: string;
  image_url?: string;
  rating: number;
  opening_hours?: string;
  is_open?: boolean;
  discount_info?: string;
  map_x: number;
  map_z: number;
}

export interface RouteNode {
  id: string;
  name?: string;
  x: number;
  y: number;
  z: number;
  node_type: 'walkway' | 'building_entrance' | 'junction' | 'gate';
  location_id?: string;
}

export interface RouteEdge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  distance_meters: number;
  is_walkable: boolean;
}

export interface NavigationRoute {
  path_nodes: RouteNode[];
  coordinates: [number, number, number][]; // [x, y, z]
  total_distance: number; // in meters
  estimated_time_min: number; // walking time in minutes
  start_name: string;
  destination_name: string;
}
