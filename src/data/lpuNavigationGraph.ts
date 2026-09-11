import { NavNode, NavEdge, NavigationMode } from '@/types/gis';

export const NAVIGATION_NODES: NavNode[] = [
  // South Entrance & GT Road
  { id: 'n-gate-1', name: 'Main Gate 1 Entry (GT Road)', lat: 31.247140, lng: 75.703490, type: 'gate' },
  { id: 'n-parking', name: 'Main Parking & Security Hub', lat: 31.246720, lng: 75.703750, type: 'landmark' },
  { id: 'n-b01', name: 'Block 1 Fashion Porch', lat: 31.247930, lng: 75.703280, type: 'building_entrance' },
  
  // Southeast Academic & Cultural
  { id: 'n-b02', name: 'Baldev Raj Mittal Auditorium Entry', lat: 31.251020, lng: 75.704740, type: 'building_entrance' },
  { id: 'n-library', name: 'Central University Library Entry', lat: 31.251990, lng: 75.703730, type: 'building_entrance' },
  { id: 'n-b03', name: 'Block 3 Physiotherapy Walk', lat: 31.252100, lng: 75.703980, type: 'building_entrance' },
  { id: 'n-gh', name: 'Girls Hostels Security Gate', lat: 31.251920, lng: 75.704710, type: 'building_entrance' },
  
  // UniMall, Unipolis & Commercial Spine
  { id: 'n-b13', name: 'Block 13/14 Business & DSW Entry', lat: 31.254540, lng: 75.705500, type: 'building_entrance' },
  { id: 'n-unipolis', name: 'Unipolis Grand Amphitheatre Plaza', lat: 31.255010, lng: 75.704710, type: 'building_entrance' },
  { id: 'n-unimall', name: 'UniMall Main Entry Plaza', lat: 31.255610, lng: 75.704980, type: 'building_entrance' },
  { id: 'n-b18', name: 'Block 18 School of Education', lat: 31.255270, lng: 75.703310, type: 'building_entrance' },
  { id: 'n-b20', name: 'Block 20 Law & LIT Market', lat: 31.255230, lng: 75.704040, type: 'building_entrance' },

  // Central Academic Quad (Blocks 25-38)
  { id: 'n-b29', name: 'Block 29 Central Admin Entry', lat: 31.253650, lng: 75.701320, type: 'building_entrance' },
  { id: 'n-b30', name: 'Block 30 Pro-Chancellor Office', lat: 31.253670, lng: 75.700420, type: 'building_entrance' },
  { id: 'n-b31', name: 'Block 31 Chancellor Secretariat', lat: 31.253660, lng: 75.701160, type: 'building_entrance' },
  { id: 'n-b32', name: 'Block 32 Career Services & Placement', lat: 31.253880, lng: 75.701330, type: 'building_entrance' },
  { id: 'n-b34', name: 'Block 34 Computer Science (Apple Academy)', lat: 31.253900, lng: 75.700430, type: 'building_entrance' },
  { id: 'n-b33', name: 'Block 33 Computer Applications', lat: 31.253900, lng: 75.700530, type: 'building_entrance' },
  { id: 'n-b35', name: 'Block 35 Shanti Devi Auditorium Quad', lat: 31.253670, lng: 75.700630, type: 'building_entrance' },
  { id: 'n-b36', name: 'Block 36 Electronics & Electrical', lat: 31.253880, lng: 75.701020, type: 'building_entrance' },
  { id: 'n-b37', name: 'Block 37 Research & Patents Wing', lat: 31.253880, lng: 75.700880, type: 'building_entrance' },
  { id: 'n-b38', name: 'Block 38 Civil Engineering', lat: 31.253870, lng: 75.701270, type: 'building_entrance' },
  { id: 'n-b25', name: 'Block 25/26 Agriculture & Life Sciences', lat: 31.253420, lng: 75.700420, type: 'building_entrance' },

  // Residential & Sports (North)
  { id: 'n-b47', name: 'Block 47 Indoor Sports Stadium', lat: 31.256290, lng: 75.704670, type: 'building_entrance' },
  { id: 'n-apt', name: 'Apartments 41-44 Complex Entry', lat: 31.256070, lng: 75.703930, type: 'building_entrance' },
  { id: 'n-bh1', name: 'BH-1 & BH-2 Dining Plaza', lat: 31.256860, lng: 75.704720, type: 'building_entrance' },
  { id: 'n-bh3', name: 'BH-3 & BH-4 Resident Gate', lat: 31.256630, lng: 75.704640, type: 'building_entrance' },
  { id: 'n-bh5', name: 'BH-5 to BH-8 Hostels Plaza', lat: 31.256920, lng: 75.705430, type: 'building_entrance' },

  // West Engineering & Workshops
  { id: 'n-b55', name: 'Block 55/56 Mechanical & Formula Student', lat: 31.254690, lng: 75.700990, type: 'building_entrance' },
  { id: 'n-b57', name: 'Block 57/58 Polytechnic & Student Labs', lat: 31.255050, lng: 75.701460, type: 'building_entrance' },

  // Key Intersections along Main Boulevard
  { id: 'n-j-gate', lat: 31.247500, lng: 75.703400, type: 'intersection' },
  { id: 'n-j-lib', lat: 31.251500, lng: 75.704200, type: 'intersection' },
  { id: 'n-j-quad-east', lat: 31.253700, lng: 75.701800, type: 'intersection' },
  { id: 'n-j-quad-mid', lat: 31.253700, lng: 75.700800, type: 'intersection' },
  { id: 'n-j-mall', lat: 31.255200, lng: 75.704600, type: 'intersection' },
  { id: 'n-j-hostel', lat: 31.256400, lng: 75.704500, type: 'intersection' },
];

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function createEdge(from_id: string, to_id: string, mode: NavigationMode[] = ['walking', 'cycling', 'vehicle']): NavEdge {
  const fromNode = NAVIGATION_NODES.find(n => n.id === from_id);
  const toNode = NAVIGATION_NODES.find(n => n.id === to_id);
  if (!fromNode || !toNode) throw new Error('Node not found: ' + from_id + ' to ' + to_id);
  
  const dist = Math.round(calcDistance(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng));
  
  return {
    id: `e-${from_id}-${to_id}`,
    from_id,
    to_id,
    distance_m: dist,
    walk_time_min: Math.max(1, Math.round(dist / 80)),
    mode,
    geometry: [[fromNode.lng, fromNode.lat], [toNode.lng, toNode.lat]]
  };
}

export const NAVIGATION_EDGES: NavEdge[] = [
  // South Entrance Spine
  createEdge('n-parking', 'n-gate-1', ['walking', 'cycling', 'vehicle']),
  createEdge('n-gate-1', 'n-j-gate', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-gate', 'n-b01', ['walking', 'cycling']),
  createEdge('n-j-gate', 'n-j-lib', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-lib', 'n-b02', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-lib', 'n-library', ['walking', 'cycling']),
  createEdge('n-j-lib', 'n-b03', ['walking', 'cycling']),
  createEdge('n-j-lib', 'n-gh', ['walking', 'cycling']),
  
  // Southeast to UniMall Boulevard
  createEdge('n-j-lib', 'n-j-mall', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-mall', 'n-unipolis', ['walking', 'cycling']),
  createEdge('n-j-mall', 'n-unimall', ['walking', 'cycling']),
  createEdge('n-j-mall', 'n-b13', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-mall', 'n-b20', ['walking', 'cycling']),
  createEdge('n-j-mall', 'n-b18', ['walking', 'cycling']),

  // UniMall to Academic Quad Spine
  createEdge('n-j-mall', 'n-j-quad-east', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-quad-east', 'n-b29', ['walking', 'cycling']),
  createEdge('n-j-quad-east', 'n-b32', ['walking', 'cycling']),
  createEdge('n-j-quad-east', 'n-b31', ['walking', 'cycling']),
  createEdge('n-j-quad-east', 'n-j-quad-mid', ['walking', 'cycling']),

  // Academic Quad Internal Walkways
  createEdge('n-j-quad-mid', 'n-b35', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b34', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b33', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b36', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b37', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b38', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b30', ['walking', 'cycling']),
  createEdge('n-j-quad-mid', 'n-b25', ['walking', 'cycling']),
  createEdge('n-b34', 'n-b33', ['walking']),
  createEdge('n-b33', 'n-b35', ['walking']),
  createEdge('n-b34', 'n-b30', ['walking']),
  createEdge('n-b32', 'n-b38', ['walking']),
  createEdge('n-b36', 'n-b37', ['walking']),

  // Academic Quad to West Engineering Blocks
  createEdge('n-j-quad-mid', 'n-b55', ['walking', 'cycling', 'vehicle']),
  createEdge('n-b55', 'n-b57', ['walking', 'cycling', 'vehicle']),

  // UniMall to North Residential & Stadium
  createEdge('n-j-mall', 'n-j-hostel', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-hostel', 'n-b47', ['walking', 'cycling', 'vehicle']),
  createEdge('n-j-hostel', 'n-apt', ['walking', 'cycling']),
  createEdge('n-j-hostel', 'n-bh1', ['walking', 'cycling']),
  createEdge('n-j-hostel', 'n-bh3', ['walking', 'cycling']),
  createEdge('n-j-hostel', 'n-bh5', ['walking', 'cycling']),
  createEdge('n-bh1', 'n-bh3', ['walking', 'cycling']),
  createEdge('n-bh3', 'n-bh5', ['walking', 'cycling']),
];
