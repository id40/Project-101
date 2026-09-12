export interface ShuttleStop {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

export interface ShuttleVehicle {
  id: string;
  name: string;
  driverName: string;
  batteryPct: number;
  capacity: number;
  passengers: number;
  speedKmH: number;
  routeId: string;
  color: string;
  progress: number; // 0 to 1
  currentCoord: [number, number];
}

export interface ShuttleRoute {
  id: string;
  name: string;
  color: string;
  accentHex: number;
  stops: ShuttleStop[];
  path: [number, number][]; // [lng, lat][]
  intervalMin: number;
  vehicles: ShuttleVehicle[];
}

export const CAMPUS_SHUTTLE_ROUTES: ShuttleRoute[] = [
  {
    id: 'route-spine',
    name: 'Spine Line (Gate 1 ⇄ UniMall ⇄ Block 34 CSE)',
    color: '#10b981', // Emerald
    accentHex: 0x10b981,
    intervalMin: 5,
    stops: [
      { id: 'stop-gate1', name: 'Main Gate 1 Terminal', lng: 75.706500, lat: 31.251520 },
      { id: 'stop-promenade', name: 'Baldev Raj Mittal Porch', lng: 75.705121, lat: 31.252314 },
      { id: 'stop-unipolis', name: 'Unipolis Grand Amphitheatre', lng: 75.705395, lat: 31.254995 },
      { id: 'stop-unimall', name: 'UniMall Central Plaza', lng: 75.705682, lat: 31.255597 },
      { id: 'stop-cse', name: 'Block 34 CSE Plaza', lng: 75.701509, lat: 31.253238 },
    ],
    path: [
      [75.706500, 31.251520],
      [75.705800, 31.251900],
      [75.705121, 31.252314],
      [75.704600, 31.253000],
      [75.705395, 31.254995],
      [75.705682, 31.255597],
      [75.704200, 31.254500],
      [75.702800, 31.253800],
      [75.701509, 31.253238],
    ],
    vehicles: [
      {
        id: 'shuttle-01',
        name: 'E-Rickshaw 01',
        driverName: 'Sukhwinder Singh',
        batteryPct: 92,
        capacity: 6,
        passengers: 4,
        speedKmH: 18,
        routeId: 'route-spine',
        color: '#10b981',
        progress: 0.15,
        currentCoord: [75.705800, 31.251900],
      },
      {
        id: 'shuttle-02',
        name: 'E-Rickshaw 02',
        driverName: 'Gurpreet Sharma',
        batteryPct: 78,
        capacity: 6,
        passengers: 5,
        speedKmH: 16,
        routeId: 'route-spine',
        color: '#10b981',
        progress: 0.65,
        currentCoord: [75.705682, 31.255597],
      },
    ],
  },
  {
    id: 'route-hostel',
    name: 'Hostel Express (UniMall ⇄ BH-1/2 ⇄ BH-5/8)',
    color: '#06b6d4', // Cyan
    accentHex: 0x06b6d4,
    intervalMin: 4,
    stops: [
      { id: 'stop-unimall', name: 'UniMall Central Plaza', lng: 75.705682, lat: 31.255597 },
      { id: 'stop-bh1', name: 'BH-1 & BH-2 Food Square', lng: 75.705221, lat: 31.257083 },
      { id: 'stop-bh3', name: 'BH-3 & BH-4 Resident Gate', lng: 75.704200, lat: 31.257800 },
      { id: 'stop-bh5', name: 'BH-5 to BH-8 North Terminal', lng: 75.703200, lat: 31.258500 },
    ],
    path: [
      [75.705682, 31.255597],
      [75.705500, 31.256200],
      [75.705221, 31.257083],
      [75.704700, 31.257500],
      [75.704200, 31.257800],
      [75.703700, 31.258200],
      [75.703200, 31.258500],
    ],
    vehicles: [
      {
        id: 'shuttle-03',
        name: 'E-Rickshaw 03',
        driverName: 'Harjit Verma',
        batteryPct: 84,
        capacity: 6,
        passengers: 6,
        speedKmH: 20,
        routeId: 'route-hostel',
        color: '#06b6d4',
        progress: 0.4,
        currentCoord: [75.705221, 31.257083],
      },
      {
        id: 'shuttle-04',
        name: 'E-Rickshaw 04',
        driverName: 'Mohinder Paul',
        batteryPct: 65,
        capacity: 6,
        passengers: 2,
        speedKmH: 15,
        routeId: 'route-hostel',
        color: '#06b6d4',
        progress: 0.85,
        currentCoord: [75.703700, 31.258200],
      },
    ],
  },
  {
    id: 'route-sports',
    name: 'Health & Sports Line (UniMall ⇄ Hospital ⇄ Stadium)',
    color: '#f59e0b', // Amber
    accentHex: 0xf59e0b,
    intervalMin: 8,
    stops: [
      { id: 'stop-unimall', name: 'UniMall Central Plaza', lng: 75.705682, lat: 31.255597 },
      { id: 'stop-hosp', name: 'Uni-Hospital 24/7 Center', lng: 75.701612, lat: 31.255193 },
      { id: 'stop-indoor', name: 'Block 47 Sports Stadium', lng: 75.704336, lat: 31.255991 },
      { id: 'stop-stadium', name: 'Cricket Stadium Ground', lng: 75.702184, lat: 31.246302 },
    ],
    path: [
      [75.705682, 31.255597],
      [75.703800, 31.255300],
      [75.701612, 31.255193],
      [75.700500, 31.254500],
      [75.699869, 31.254580],
      [75.702184, 31.246302],
    ],
    vehicles: [
      {
        id: 'shuttle-05',
        name: 'E-Rickshaw 05',
        driverName: 'Manpreet Singh',
        batteryPct: 89,
        capacity: 6,
        passengers: 3,
        speedKmH: 17,
        routeId: 'route-sports',
        color: '#f59e0b',
        progress: 0.3,
        currentCoord: [75.701612, 31.255193],
      },
    ],
  },
];

// Helper to calculate interpolated position along path given progress 0..1
export function getInterpolatedCoord(path: [number, number][], progress: number): [number, number] {
  if (path.length === 0) return [75.7032, 31.2535];
  if (path.length === 1) return path[0];

  const totalSegments = path.length - 1;
  const scaledProgress = Math.max(0, Math.min(1, progress)) * totalSegments;
  const index = Math.floor(scaledProgress);
  const frac = scaledProgress - index;

  if (index >= totalSegments) return path[totalSegments];

  const p1 = path[index];
  const p2 = path[index + 1];

  return [
    p1[0] + (p2[0] - p1[0]) * frac,
    p1[1] + (p2[1] - p1[1]) * frac,
  ];
}
