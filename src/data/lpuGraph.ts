import { RouteNode, RouteEdge } from '@/types/campus';

export const CAMPUS_ROUTE_NODES: RouteNode[] = [
  { id: 'node-lib-ent', name: 'Library Main Gate', x: 105, y: 0, z: -84.2, node_type: 'building_entrance', location_id: 'loc-001' },
  { id: 'node-a-ent', name: 'Block 34 North Gate', x: 45, y: 0, z: -5, node_type: 'building_entrance', location_id: 'loc-002' },
  { id: 'node-fc-ent', name: 'Uni-Mall Main Plaza', x: -45, y: 0, z: 31.7, node_type: 'building_entrance', location_id: 'loc-003' },
  { id: 'node-ssc-ent', name: 'Student Centre Porch', x: 15.8, y: 0, z: 58, node_type: 'building_entrance', location_id: 'loc-004' },
  { id: 'node-sports-ent', name: 'Sports Arena Pavilion', x: -85, y: 0, z: -55.6, node_type: 'building_entrance', location_id: 'loc-005' },
  { id: 'node-aud-ent', name: 'Auditorium Foyer', x: 65, y: 0, z: 40, node_type: 'building_entrance', location_id: 'loc-006' },
  { id: 'node-hosp-ent', name: 'Uni-Hospital Emergency Entry', x: 80, y: 0, z: -110, node_type: 'building_entrance', location_id: 'loc-007' },
  { id: 'node-bh1-ent', name: 'BH-1 Reception Gate', x: -120, y: 0, z: 80, node_type: 'building_entrance', location_id: 'loc-008' },
  { id: 'node-gh1-ent', name: 'GH-1 Security Gate', x: -120, y: 0, z: -80, node_type: 'building_entrance', location_id: 'loc-009' },

  // Walkway Junctions
  { id: 'junc-central', name: 'Grand Central Circle', x: 0, y: 0, z: 0, node_type: 'junction' },
  { id: 'junc-north-east', name: 'Academic North Cross', x: 50, y: 0, z: -80, node_type: 'junction' },
  { id: 'junc-east', name: 'Auditorium Avenue', x: 60, y: 0, z: 20, node_type: 'junction' },
  { id: 'junc-south', name: 'Student Union Walkway', x: 0, y: 0, z: 60, node_type: 'junction' },
  { id: 'junc-west', name: 'Mall Promenade', x: -60, y: 0, z: 0, node_type: 'junction' },
  { id: 'junc-north-west', name: 'Sports Boulevard', x: -60, y: 0, z: -60, node_type: 'junction' },
  { id: 'junc-south-west', name: 'Hostel Crossway', x: -100, y: 0, z: 60, node_type: 'junction' },
  { id: 'junc-far-north', name: 'Hospital Access Road', x: 80, y: 0, z: -80, node_type: 'junction' },
];

export const CAMPUS_ROUTE_EDGES: RouteEdge[] = [
  // Center connections
  { id: 'e1', from_node_id: 'junc-central', to_node_id: 'node-a-ent', distance_meters: 50, is_walkable: true },
  { id: 'e2', from_node_id: 'junc-central', to_node_id: 'junc-east', distance_meters: 65, is_walkable: true },
  { id: 'e3', from_node_id: 'junc-central', to_node_id: 'junc-south', distance_meters: 60, is_walkable: true },
  { id: 'e4', from_node_id: 'junc-central', to_node_id: 'junc-west', distance_meters: 60, is_walkable: true },
  { id: 'e5', from_node_id: 'junc-central', to_node_id: 'junc-north-west', distance_meters: 85, is_walkable: true },

  // North-East / Academic / Library / Hospital
  { id: 'e6', from_node_id: 'node-a-ent', to_node_id: 'junc-north-east', distance_meters: 75, is_walkable: true },
  { id: 'e7', from_node_id: 'junc-north-east', to_node_id: 'node-lib-ent', distance_meters: 55, is_walkable: true },
  { id: 'e8', from_node_id: 'junc-north-east', to_node_id: 'junc-far-north', distance_meters: 30, is_walkable: true },
  { id: 'e9', from_node_id: 'junc-far-north', to_node_id: 'node-hosp-ent', distance_meters: 30, is_walkable: true },
  { id: 'e10', from_node_id: 'node-lib-ent', to_node_id: 'node-hosp-ent', distance_meters: 35, is_walkable: true },

  // East / Auditorium / SSC
  { id: 'e11', from_node_id: 'junc-east', to_node_id: 'node-aud-ent', distance_meters: 22, is_walkable: true },
  { id: 'e12', from_node_id: 'junc-east', to_node_id: 'node-ssc-ent', distance_meters: 60, is_walkable: true },
  { id: 'e13', from_node_id: 'junc-south', to_node_id: 'node-ssc-ent', distance_meters: 18, is_walkable: true },

  // West / Food Court / Sports / Hostels
  { id: 'e14', from_node_id: 'junc-west', to_node_id: 'node-fc-ent', distance_meters: 35, is_walkable: true },
  { id: 'e15', from_node_id: 'junc-west', to_node_id: 'junc-north-west', distance_meters: 60, is_walkable: true },
  { id: 'e16', from_node_id: 'junc-north-west', to_node_id: 'node-sports-ent', distance_meters: 25, is_walkable: true },
  { id: 'e17', from_node_id: 'junc-north-west', to_node_id: 'node-gh1-ent', distance_meters: 65, is_walkable: true },
  
  // South-West / BH-1
  { id: 'e18', from_node_id: 'junc-south', to_node_id: 'junc-south-west', distance_meters: 100, is_walkable: true },
  { id: 'e19', from_node_id: 'node-fc-ent', to_node_id: 'junc-south-west', distance_meters: 60, is_walkable: true },
  { id: 'e20', from_node_id: 'junc-south-west', to_node_id: 'node-bh1-ent', distance_meters: 28, is_walkable: true },
];
