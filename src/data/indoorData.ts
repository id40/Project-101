import { BuildingFloorPlan } from '@/types/indoor';

export const INDOOR_FLOOR_PLANS: Record<string, BuildingFloorPlan> = {
  'loc-002': {
    building_id: 'loc-002',
    building_name: 'Academic Block A (Block 34)',
    block_code: '34',
    floors: [
      {
        floor_number: 0,
        floor_name: 'Ground Floor',
        rooms: [
          { id: '34-g-ent', room_number: 'Entrance', name: 'Main Lobby & Security', category: 'entrance', floor: 0, x: 50, y: 90, width: 20, height: 10, color: '#3B82F6' },
          { id: '34-g-101', room_number: 'Room 101', name: 'Lecture Hall 101 (Intro to CS)', category: 'classroom', floor: 0, x: 20, y: 70, width: 25, height: 20, color: '#635BFF' },
          { id: '34-g-102', room_number: 'Room 102', name: 'Lecture Hall 102 (Engineering Math)', category: 'classroom', floor: 0, x: 20, y: 40, width: 25, height: 20, color: '#635BFF' },
          { id: '34-g-lab1', room_number: 'Lab 1', name: 'Fundamental Programming Lab', category: 'lab', floor: 0, x: 75, y: 70, width: 25, height: 25, color: '#10B981' },
          { id: '34-g-cafe', room_number: 'Café', name: 'Express Snack Counter', category: 'cafeteria', floor: 0, x: 75, y: 35, width: 20, height: 15, color: '#F59E0B' },
          { id: '34-g-wash', room_number: 'Restrooms', name: 'Washrooms & Water Cooler', category: 'washroom', floor: 0, x: 20, y: 15, width: 15, height: 15, color: '#94A3B8' },
          { id: '34-g-stairs', room_number: 'Stairs', name: 'Central Staircase', category: 'stairs', floor: 0, x: 50, y: 50, width: 12, height: 15, color: '#EC4899' },
          { id: '34-g-lift', room_number: 'Lift', name: 'Passenger Elevator', category: 'lift', floor: 0, x: 45, y: 30, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-g-ent', floor: 0, x: 50, y: 88, type: 'entrance' },
          { id: 'n-g-corridor-1', floor: 0, x: 50, y: 70, type: 'hallway' },
          { id: 'n-g-101', floor: 0, x: 33, y: 70, type: 'room_door', room_id: '34-g-101' },
          { id: 'n-g-lab1', floor: 0, x: 75, y: 70, type: 'room_door', room_id: '34-g-lab1' },
          { id: 'n-g-stairs', floor: 0, x: 50, y: 50, type: 'stairs', room_id: '34-g-stairs' },
          { id: 'n-g-corridor-2', floor: 0, x: 50, y: 35, type: 'hallway' },
          { id: 'n-g-102', floor: 0, x: 33, y: 40, type: 'room_door', room_id: '34-g-102' },
          { id: 'n-g-cafe', floor: 0, x: 75, y: 35, type: 'room_door', room_id: '34-g-cafe' },
          { id: 'n-g-lift', floor: 0, x: 45, y: 30, type: 'lift', room_id: '34-g-lift' },
          { id: 'n-g-wash', floor: 0, x: 28, y: 15, type: 'room_door', room_id: '34-g-wash' },
        ],
        edges: [
          { from: 'n-g-ent', to: 'n-g-corridor-1', distance: 10 },
          { from: 'n-g-corridor-1', to: 'n-g-101', distance: 8 },
          { from: 'n-g-corridor-1', to: 'n-g-lab1', distance: 12 },
          { from: 'n-g-corridor-1', to: 'n-g-stairs', distance: 10 },
          { from: 'n-g-stairs', to: 'n-g-corridor-2', distance: 8 },
          { from: 'n-g-corridor-2', to: 'n-g-102', distance: 9 },
          { from: 'n-g-corridor-2', to: 'n-g-cafe', distance: 11 },
          { from: 'n-g-corridor-2', to: 'n-g-lift', distance: 6 },
          { from: 'n-g-corridor-2', to: 'n-g-wash', distance: 14 },
          // Inter-floor edge to floor 1
          { from: 'n-g-stairs', to: 'n-1-stairs', distance: 15, is_stair_transition: true },
          { from: 'n-g-lift', to: 'n-1-lift', distance: 15 },
        ]
      },
      {
        floor_number: 1,
        floor_name: '1st Floor',
        rooms: [
          { id: '34-1-201', room_number: 'Room 201', name: 'Software Architecture Hall', category: 'classroom', floor: 1, x: 20, y: 70, width: 25, height: 20, color: '#635BFF' },
          { id: '34-1-202', room_number: 'Room 202', name: 'Data Science & Big Data Room', category: 'classroom', floor: 1, x: 20, y: 40, width: 25, height: 20, color: '#635BFF' },
          { id: '34-1-lab2', room_number: 'AI Lab 203', name: 'Advanced AI & Deep Learning Lab', category: 'lab', floor: 1, x: 75, y: 70, width: 25, height: 25, color: '#10B981' },
          { id: '34-1-dean', room_number: 'Dean Office', name: 'School Dean & Faculty Suite', category: 'office', floor: 1, x: 75, y: 35, width: 20, height: 20, color: '#8B5CF6' },
          { id: '34-1-stairs', room_number: 'Stairs', name: 'Central Staircase', category: 'stairs', floor: 1, x: 50, y: 50, width: 12, height: 15, color: '#EC4899' },
          { id: '34-1-lift', room_number: 'Lift', name: 'Passenger Elevator', category: 'lift', floor: 1, x: 45, y: 30, width: 10, height: 10, color: '#06B6D4' },
          { id: '34-1-wash', room_number: 'Restrooms', name: 'Washrooms (1st Floor)', category: 'washroom', floor: 1, x: 20, y: 15, width: 15, height: 15, color: '#94A3B8' },
        ],
        nodes: [
          { id: 'n-1-stairs', floor: 1, x: 50, y: 50, type: 'stairs', room_id: '34-1-stairs' },
          { id: 'n-1-corridor-1', floor: 1, x: 50, y: 70, type: 'hallway' },
          { id: 'n-1-201', floor: 1, x: 33, y: 70, type: 'room_door', room_id: '34-1-201' },
          { id: 'n-1-lab2', floor: 1, x: 75, y: 70, type: 'room_door', room_id: '34-1-lab2' },
          { id: 'n-1-corridor-2', floor: 1, x: 50, y: 35, type: 'hallway' },
          { id: 'n-1-202', floor: 1, x: 33, y: 40, type: 'room_door', room_id: '34-1-202' },
          { id: 'n-1-dean', floor: 1, x: 75, y: 35, type: 'room_door', room_id: '34-1-dean' },
          { id: 'n-1-lift', floor: 1, x: 45, y: 30, type: 'lift', room_id: '34-1-lift' },
          { id: 'n-1-wash', floor: 1, x: 28, y: 15, type: 'room_door', room_id: '34-1-wash' },
        ],
        edges: [
          { from: 'n-1-stairs', to: 'n-1-corridor-1', distance: 10 },
          { from: 'n-1-stairs', to: 'n-1-corridor-2', distance: 8 },
          { from: 'n-1-corridor-1', to: 'n-1-201', distance: 8 },
          { from: 'n-1-corridor-1', to: 'n-1-lab2', distance: 12 },
          { from: 'n-1-corridor-2', to: 'n-1-202', distance: 9 },
          { from: 'n-1-corridor-2', to: 'n-1-dean', distance: 11 },
          { from: 'n-1-corridor-2', to: 'n-1-lift', distance: 6 },
          { from: 'n-1-corridor-2', to: 'n-1-wash', distance: 14 },
          // Inter-floor edge to floor 2
          { from: 'n-1-stairs', to: 'n-2-stairs', distance: 15, is_stair_transition: true },
          { from: 'n-1-lift', to: 'n-2-lift', distance: 15 },
        ]
      },
      {
        floor_number: 2,
        floor_name: '2nd Floor',
        rooms: [
          { id: '34-2-sem', room_number: 'Seminar Hall', name: 'Auditorium Seminar Hall 34-301', category: 'classroom', floor: 2, x: 30, y: 55, width: 35, height: 35, color: '#8B5CF6' },
          { id: '34-2-cloud', room_number: 'Cloud Center', name: 'High Performance Computing Lab', category: 'lab', floor: 2, x: 75, y: 65, width: 25, height: 25, color: '#10B981' },
          { id: '34-2-lounge', room_number: 'Lounge', name: 'Student Research Lounge', category: 'office', floor: 2, x: 75, y: 30, width: 20, height: 20, color: '#06B6D4' },
          { id: '34-2-stairs', room_number: 'Stairs', name: 'Central Staircase', category: 'stairs', floor: 2, x: 50, y: 50, width: 12, height: 15, color: '#EC4899' },
          { id: '34-2-lift', room_number: 'Lift', name: 'Passenger Elevator', category: 'lift', floor: 2, x: 45, y: 30, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-2-stairs', floor: 2, x: 50, y: 50, type: 'stairs', room_id: '34-2-stairs' },
          { id: 'n-2-corridor', floor: 2, x: 50, y: 35, type: 'hallway' },
          { id: 'n-2-sem', floor: 2, x: 40, y: 55, type: 'room_door', room_id: '34-2-sem' },
          { id: 'n-2-cloud', floor: 2, x: 75, y: 65, type: 'room_door', room_id: '34-2-cloud' },
          { id: 'n-2-lounge', floor: 2, x: 75, y: 30, type: 'room_door', room_id: '34-2-lounge' },
          { id: 'n-2-lift', floor: 2, x: 45, y: 30, type: 'lift', room_id: '34-2-lift' },
        ],
        edges: [
          { from: 'n-2-stairs', to: 'n-2-corridor', distance: 8 },
          { from: 'n-2-stairs', to: 'n-2-sem', distance: 10 },
          { from: 'n-2-corridor', to: 'n-2-cloud', distance: 12 },
          { from: 'n-2-corridor', to: 'n-2-lounge', distance: 11 },
          { from: 'n-2-corridor', to: 'n-2-lift', distance: 6 },
        ]
      }
    ]
  }
};
