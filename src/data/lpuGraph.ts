import { RouteNode, RouteEdge } from '@/types/campus';

export const CAMPUS_ROUTE_NODES: RouteNode[] = [
  // Gate 1 & Entry Avenue
  { id: 'n-gate-1', name: 'Main Gate 1 Entry', x: 200, y: 0, z: 205, node_type: 'gate', location_id: 'gate-01' },
  { id: 'n-b01', name: 'Block 1 Fashion Porch', x: 160, y: 0, z: 165, node_type: 'building_entrance', location_id: 'b-01' },
  { id: 'n-b02', name: 'Baldev Raj Auditorium Entry', x: 130, y: 0, z: 145, node_type: 'building_entrance', location_id: 'b-02' },
  { id: 'n-b03', name: 'Block 3 Physiotherapy Walk', x: 120, y: 0, z: 105, node_type: 'building_entrance', location_id: 'b-03' },
  { id: 'n-b04', name: 'Blocks 4 & 7 Pharmacy Gate', x: 100, y: 0, z: 75, node_type: 'building_entrance', location_id: 'b-04-07' },
  { id: 'n-b06', name: 'Block 6 Architecture Entrance', x: 70, y: 0, z: 95, node_type: 'building_entrance', location_id: 'b-06' },
  { id: 'n-b08', name: 'Block 8 Animation Gate', x: 80, y: 0, z: 125, node_type: 'building_entrance', location_id: 'b-08' },
  { id: 'n-gh', name: 'Girls Hostels Security Gate', x: 130, y: 0, z: 30, node_type: 'building_entrance', location_id: 'gh-cluster' },

  // Central Hub (UniMall, Unipolis, DSW)
  { id: 'n-unimall', name: 'UniMall Main Plaza', x: 20, y: 0, z: 15, node_type: 'building_entrance', location_id: 'b-15-unimall' },
  { id: 'n-unipolis', name: 'Unipolis Grand Amphitheatre', x: 20, y: 0, z: -25, node_type: 'building_entrance', location_id: 'unipolis' },
  { id: 'n-b13', name: 'Block 13/14 Business & DSW', x: -10, y: 0, z: 35, node_type: 'building_entrance', location_id: 'b-13-14' },
  { id: 'n-b18', name: 'Block 18/20 Law & LIT Market', x: 60, y: 0, z: -25, node_type: 'building_entrance', location_id: 'b-18-20' },

  // Academic Spine (CSE, Library, Admin)
  { id: 'n-b25', name: 'Blocks 25-28 Bio & Agri Foyer', x: -30, y: 0, z: -5, node_type: 'building_entrance', location_id: 'b-25-28' },
  { id: 'n-b29', name: 'Blocks 29-32 Admissions & Admin', x: -60, y: 0, z: 5, node_type: 'building_entrance', location_id: 'b-29-32' },
  { id: 'n-b34', name: 'Block 34 Computer Science Porch', x: -80, y: 0, z: -15, node_type: 'building_entrance', location_id: 'b-33-34' },
  { id: 'n-b35', name: 'Block 35 Shanti Devi Auditorium', x: -95, y: 0, z: -30, node_type: 'building_entrance', location_id: 'b-35' },
  { id: 'n-b37', name: 'Central Library Knowledge Portal', x: -70, y: 0, z: -55, node_type: 'building_entrance', location_id: 'b-36-38' },

  // Residential & Sports
  { id: 'n-b47', name: 'Indoor Sports Stadium Entrance', x: -30, y: 0, z: -50, node_type: 'building_entrance', location_id: 'b-47-indoor-stadium' },
  { id: 'n-apt', name: 'Apartments 41-44 Complex Gate', x: 10, y: 0, z: -65, node_type: 'building_entrance', location_id: 'apartments-41-44' },
  { id: 'n-hosp', name: 'Uni-Hospital Emergency Entry', x: 100, y: 0, z: -55, node_type: 'building_entrance', location_id: 'uni-hospital' },
  { id: 'n-bh1', name: 'BH-1 & BH-2 Food Square Hub', x: -20, y: 0, z: -100, node_type: 'building_entrance', location_id: 'bh-1-2' },
  { id: 'n-bh3', name: 'BH-3 & BH-4 Playground Portal', x: -60, y: 0, z: -110, node_type: 'building_entrance', location_id: 'bh-3-4' },
  { id: 'n-bh5', name: 'BH-5 to BH-8 Residential Gate', x: -100, y: 0, z: -120, node_type: 'building_entrance', location_id: 'bh-5-8' },

  // West Sports & Heavy Engineering
  { id: 'n-stadium', name: 'Cricket Stadium Grand Stand', x: -120, y: 0, z: -20, node_type: 'building_entrance', location_id: 'cricket-stadium' },
  { id: 'n-pool', name: 'Olympic Pool Aquatic Gate', x: -80, y: 0, z: -70, node_type: 'building_entrance', location_id: 'olympic-pool' },
  { id: 'n-b55', name: 'Block 55/56 Mechanical Workshop', x: -150, y: 0, z: -75, node_type: 'building_entrance', location_id: 'b-55-56' },
  { id: 'n-b57', name: 'Block 57/58 Student Project Labs', x: -170, y: 0, z: -105, node_type: 'building_entrance', location_id: 'b-57-58' },

  // Major Walkway Junctions
  { id: 'j-entry-spine', name: 'GT Road Entry Promenade', x: 175, y: 0, z: 185, node_type: 'junction' },
  { id: 'j-auditorium-cross', name: 'Baldev Raj Crossroad', x: 130, y: 0, z: 125, node_type: 'junction' },
  { id: 'j-pharmacy-cross', name: 'Health Science Junction', x: 90, y: 0, z: 95, node_type: 'junction' },
  { id: 'j-central-circle', name: 'Grand Central Circle', x: 20, y: 0, z: 60, node_type: 'junction' },
  { id: 'j-unimall-plaza', name: 'UniMall Central Junction', x: 20, y: 0, z: 0, node_type: 'junction' },
  { id: 'j-academic-cross', name: 'Computer Science Crossroads', x: -50, y: 0, z: 10, node_type: 'junction' },
  { id: 'j-library-circle', name: 'Library & Sports Crossway', x: -50, y: 0, z: -40, node_type: 'junction' },
  { id: 'j-stadium-hub', name: 'Athletics & Stadium Hub', x: -100, y: 0, z: -40, node_type: 'junction' },
  { id: 'j-hostel-avenue', name: 'Hostel Main Promenade', x: -40, y: 0, z: -90, node_type: 'junction' },
  { id: 'j-west-ring', name: 'West Engineering Ring Road', x: -140, y: 0, z: -60, node_type: 'junction' },
  { id: 'j-east-ring', name: 'East Hospital Access Way', x: 80, y: 0, z: -30, node_type: 'junction' },
];

export const CAMPUS_ROUTE_EDGES: RouteEdge[] = [
  // Entry Spine: Gate 1 -> Block 1 -> Block 2 -> Block 3
  { id: 'e1', from_node_id: 'n-gate-1', to_node_id: 'j-entry-spine', distance_meters: 30, is_walkable: true },
  { id: 'e2', from_node_id: 'j-entry-spine', to_node_id: 'n-b01', distance_meters: 25, is_walkable: true },
  { id: 'e3', from_node_id: 'j-entry-spine', to_node_id: 'j-auditorium-cross', distance_meters: 65, is_walkable: true },
  { id: 'e4', from_node_id: 'j-auditorium-cross', to_node_id: 'n-b02', distance_meters: 20, is_walkable: true },
  { id: 'e5', from_node_id: 'j-auditorium-cross', to_node_id: 'n-b03', distance_meters: 22, is_walkable: true },
  { id: 'e6', from_node_id: 'j-auditorium-cross', to_node_id: 'j-pharmacy-cross', distance_meters: 50, is_walkable: true },

  // Pharmacy / Architecture / Animation / Girls Hostels
  { id: 'e7', from_node_id: 'j-pharmacy-cross', to_node_id: 'n-b04', distance_meters: 22, is_walkable: true },
  { id: 'e8', from_node_id: 'j-pharmacy-cross', to_node_id: 'n-b06', distance_meters: 20, is_walkable: true },
  { id: 'e9', from_node_id: 'j-pharmacy-cross', to_node_id: 'n-b08', distance_meters: 32, is_walkable: true },
  { id: 'e10', from_node_id: 'j-pharmacy-cross', to_node_id: 'n-gh', distance_meters: 75, is_walkable: true },
  { id: 'e11', from_node_id: 'j-pharmacy-cross', to_node_id: 'j-central-circle', distance_meters: 75, is_walkable: true },

  // Central Circle -> Business (Block 13/14) -> UniMall
  { id: 'e12', from_node_id: 'j-central-circle', to_node_id: 'n-b13', distance_meters: 35, is_walkable: true },
  { id: 'e13', from_node_id: 'j-central-circle', to_node_id: 'j-unimall-plaza', distance_meters: 60, is_walkable: true },
  { id: 'e14', from_node_id: 'j-unimall-plaza', to_node_id: 'n-unimall', distance_meters: 15, is_walkable: true },
  { id: 'e15', from_node_id: 'j-unimall-plaza', to_node_id: 'n-unipolis', distance_meters: 25, is_walkable: true },
  { id: 'e16', from_node_id: 'j-unimall-plaza', to_node_id: 'j-east-ring', distance_meters: 65, is_walkable: true },
  { id: 'e17', from_node_id: 'j-east-ring', to_node_id: 'n-b18', distance_meters: 22, is_walkable: true },
  { id: 'e18', from_node_id: 'j-east-ring', to_node_id: 'n-hosp', distance_meters: 32, is_walkable: true },
  { id: 'e19', from_node_id: 'n-gh', to_node_id: 'j-east-ring', distance_meters: 80, is_walkable: true },

  // UniMall -> Academic CS Spine
  { id: 'e20', from_node_id: 'j-unimall-plaza', to_node_id: 'j-academic-cross', distance_meters: 70, is_walkable: true },
  { id: 'e21', from_node_id: 'j-academic-cross', to_node_id: 'n-b25', distance_meters: 25, is_walkable: true },
  { id: 'e22', from_node_id: 'j-academic-cross', to_node_id: 'n-b29', distance_meters: 20, is_walkable: true },
  { id: 'e23', from_node_id: 'j-academic-cross', to_node_id: 'n-b34', distance_meters: 35, is_walkable: true },
  { id: 'e24', from_node_id: 'n-b34', to_node_id: 'n-b35', distance_meters: 22, is_walkable: true },

  // Academic Spine -> Library & Stadium Hub
  { id: 'e25', from_node_id: 'j-academic-cross', to_node_id: 'j-library-circle', distance_meters: 50, is_walkable: true },
  { id: 'e26', from_node_id: 'j-library-circle', to_node_id: 'n-b37', distance_meters: 25, is_walkable: true },
  { id: 'e27', from_node_id: 'j-library-circle', to_node_id: 'n-b47', distance_meters: 30, is_walkable: true },
  { id: 'e28', from_node_id: 'j-library-circle', to_node_id: 'n-apt', distance_meters: 65, is_walkable: true },
  { id: 'e29', from_node_id: 'n-apt', to_node_id: 'n-hosp', distance_meters: 90, is_walkable: true },
  { id: 'e30', from_node_id: 'j-library-circle', to_node_id: 'j-stadium-hub', distance_meters: 50, is_walkable: true },
  { id: 'e31', from_node_id: 'j-stadium-hub', to_node_id: 'n-stadium', distance_meters: 28, is_walkable: true },
  { id: 'e32', from_node_id: 'j-stadium-hub', to_node_id: 'n-pool', distance_meters: 35, is_walkable: true },

  // Library & Stadium -> Boys Hostels Sector
  { id: 'e33', from_node_id: 'j-library-circle', to_node_id: 'j-hostel-avenue', distance_meters: 50, is_walkable: true },
  { id: 'e34', from_node_id: 'j-hostel-avenue', to_node_id: 'n-bh1', distance_meters: 25, is_walkable: true },
  { id: 'e35', from_node_id: 'j-hostel-avenue', to_node_id: 'n-bh3', distance_meters: 30, is_walkable: true },
  { id: 'e36', from_node_id: 'n-bh3', to_node_id: 'n-bh5', distance_meters: 42, is_walkable: true },

  // Heavy Engineering & Polytechnic (Far West)
  { id: 'e37', from_node_id: 'j-stadium-hub', to_node_id: 'j-west-ring', distance_meters: 45, is_walkable: true },
  { id: 'e38', from_node_id: 'j-west-ring', to_node_id: 'n-b55', distance_meters: 20, is_walkable: true },
  { id: 'e39', from_node_id: 'j-west-ring', to_node_id: 'n-b57', distance_meters: 50, is_walkable: true },
  { id: 'e40', from_node_id: 'n-b57', to_node_id: 'n-bh5', distance_meters: 75, is_walkable: true },
];
