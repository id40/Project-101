import type { Feature, FeatureCollection, Point, Polygon, LineString, Position } from 'geojson';

// Building properties in GeoJSON
export interface GISBuildingProperties {
  id: string;
  name: string;
  block_code: string;
  category: BuildingCategory;
  height: number;
  min_height: number;
  building_levels: number;
  color: string;
  confidence: 'high' | 'medium' | 'low' | 'estimated';
  source: 'osm' | 'manual' | 'satellite';
  description?: string;
  facilities?: string[];
  has_indoor_map?: boolean;
  photo?: string;
  badge?: string;
}

export type BuildingCategory = 
  | 'academic' | 'hostel' | 'food' | 'shopping' | 'library' 
  | 'medical' | 'sports' | 'parking' | 'gate' | 'auditorium' 
  | 'park' | 'administration' | 'residential' | 'other';

// Road properties
export interface GISRoadProperties {
  id: string;
  name: string;
  highway_type: 'primary' | 'secondary' | 'tertiary' | 'service' | 'pedestrian' | 'footway' | 'cycleway';
  width_m: number;
  walkable: boolean;
  vehicle_access: boolean;
  surface: 'asphalt' | 'paved' | 'unpaved';
  length_m?: number;
}

// POI properties
export interface GISPOIProperties {
  id: string;
  name: string;
  category: POICategory;
  description?: string;
  icon: string;
  building_id?: string;
}

export type POICategory = 
  | 'academic' | 'hostel' | 'food' | 'shopping' | 'library' 
  | 'medical' | 'sports' | 'parking' | 'gate' | 'auditorium' 
  | 'park' | 'administration' | 'atm' | 'other';

// Park properties
export interface GISParkProperties {
  name: string;
  type: 'park' | 'garden' | 'lawn' | 'sports_ground' | 'playground';
}

// Navigation graph
export interface NavNode {
  id: string;
  name?: string;
  lng: number;
  lat: number;
  type: 'intersection' | 'building_entrance' | 'gate' | 'crossing' | 'landmark';
  location_id?: string;
}

export interface NavEdge {
  id: string;
  from_id: string;
  to_id: string;
  distance_m: number;
  walk_time_min: number;
  mode: NavigationMode[];
  geometry?: Position[];
}

export type NavigationMode = 'walking' | 'cycling' | 'vehicle';

export interface NavigationRoute {
  path: NavNode[];
  edges: NavEdge[];
  coordinates: Position[]; // [lng, lat] pairs for the route line
  total_distance_m: number;
  estimated_time_min: number;
  origin_name: string;
  destination_name: string;
  mode: NavigationMode;
}

// Map interaction state
export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface SelectedFeature {
  type: 'building' | 'poi' | 'road';
  id: string;
  properties: GISBuildingProperties | GISPOIProperties | GISRoadProperties;
  coordinates: Position;
}

// Layer visibility
export interface LayerVisibility {
  buildings: boolean;
  roads: boolean;
  pedestrianPaths: boolean;
  parks: boolean;
  parking: boolean;
  food: boolean;
  academic: boolean;
  residential: boolean;
  sports: boolean;
  landmarks: boolean;
  pois: boolean;
}

// Measurement
export interface MeasurementPoint {
  lng: number;
  lat: number;
  index: number;
}

export interface MeasurementState {
  points: MeasurementPoint[];
  totalDistance_m: number;
  isActive: boolean;
}
