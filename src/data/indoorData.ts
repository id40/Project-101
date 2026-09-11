import { BuildingFloorPlan } from '@/types/indoor';

export const INDOOR_FLOOR_PLANS: Record<string, BuildingFloorPlan> = {
  // =======================================================
  // 1. BLOCK 33 & 34: SCHOOL OF COMPUTER SCIENCE & ENGG
  // =======================================================
  'b-33-34': {
    building_id: 'b-33-34',
    building_name: 'Academic Block 33 & 34 (Computer Science & Engineering)',
    block_code: 'B-33/34',
    floors: [
      {
        floor_number: 0,
        floor_name: 'Ground Floor',
        rooms: [
          { id: '34-g-ent', room_number: 'Entrance', name: 'Main CS Atrium & Helpdesk', category: 'entrance', floor: 0, x: 50, y: 90, width: 22, height: 10, color: '#3B82F6' },
          { id: '34-g-101', room_number: 'Room 101', name: 'Lecture Hall 101 (Data Structures)', category: 'classroom', floor: 0, x: 20, y: 70, width: 25, height: 20, color: '#635BFF' },
          { id: '34-g-102', room_number: 'Room 102', name: 'Lecture Hall 102 (Discrete Math)', category: 'classroom', floor: 0, x: 20, y: 40, width: 25, height: 20, color: '#635BFF' },
          { id: '34-g-lab1', room_number: 'Lab 105', name: 'Systems Programming Lab', category: 'lab', floor: 0, x: 75, y: 70, width: 25, height: 25, color: '#10B981' },
          { id: '34-g-cafe', room_number: 'Café', name: 'CS Snack Kiosk & Nescafe', category: 'cafeteria', floor: 0, x: 75, y: 35, width: 20, height: 15, color: '#F59E0B' },
          { id: '34-g-wash', room_number: 'Washrooms', name: 'Washrooms & RO Water', category: 'washroom', floor: 0, x: 20, y: 15, width: 15, height: 15, color: '#94A3B8' },
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
          { id: '34-1-lab2', room_number: 'AI Lab 203', name: 'Advanced AI & Deep Learning Center', category: 'lab', floor: 1, x: 75, y: 70, width: 25, height: 25, color: '#10B981' },
          { id: '34-1-dean', room_number: 'Dean Office', name: 'HOD CSE & Senior Faculty Suite', category: 'office', floor: 1, x: 75, y: 35, width: 20, height: 20, color: '#8B5CF6' },
          { id: '34-1-stairs', room_number: 'Stairs', name: 'Central Staircase', category: 'stairs', floor: 1, x: 50, y: 50, width: 12, height: 15, color: '#EC4899' },
          { id: '34-1-lift', room_number: 'Lift', name: 'Passenger Elevator', category: 'lift', floor: 1, x: 45, y: 30, width: 10, height: 10, color: '#06B6D4' },
          { id: '34-1-wash', room_number: 'Washrooms', name: 'Washrooms (1st Floor)', category: 'washroom', floor: 1, x: 20, y: 15, width: 15, height: 15, color: '#94A3B8' },
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
          { from: 'n-1-stairs', to: 'n-2-stairs', distance: 15, is_stair_transition: true },
          { from: 'n-1-lift', to: 'n-2-lift', distance: 15 },
        ]
      },
      {
        floor_number: 2,
        floor_name: '2nd Floor',
        rooms: [
          { id: '34-2-sem', room_number: 'Auditorium', name: 'CS Seminar Hall 34-301', category: 'classroom', floor: 2, x: 30, y: 55, width: 35, height: 35, color: '#8B5CF6' },
          { id: '34-2-cloud', room_number: 'Cloud Center', name: 'High Performance Computing Cluster', category: 'lab', floor: 2, x: 75, y: 65, width: 25, height: 25, color: '#10B981' },
          { id: '34-2-lounge', room_number: 'Lounge', name: 'Graduate Research Innovation Lounge', category: 'office', floor: 2, x: 75, y: 30, width: 20, height: 20, color: '#06B6D4' },
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
  },

  // =======================================================
  // 2. UNIMALL & UNICENTRE (BLOCK 15)
  // =======================================================
  'b-15-unimall': {
    building_id: 'b-15-unimall',
    building_name: 'UniMall & Central Shopping Centre',
    block_code: 'UNIMALL',
    floors: [
      {
        floor_number: 0,
        floor_name: 'Ground Floor (Food Court)',
        rooms: [
          { id: 'um-g-ent', room_number: 'Entrance', name: 'Grand Mall Entrance & Security', category: 'entrance', floor: 0, x: 50, y: 90, width: 24, height: 10, color: '#F59E0B' },
          { id: 'um-g-dominos', room_number: 'G-01', name: "Domino's Pizza", category: 'cafeteria', floor: 0, x: 20, y: 70, width: 25, height: 20, color: '#EF4444' },
          { id: 'um-g-subway', room_number: 'G-02', name: 'Subway Fresh', category: 'cafeteria', floor: 0, x: 20, y: 40, width: 25, height: 20, color: '#10B981' },
          { id: 'um-g-ccd', room_number: 'G-03', name: 'Café Coffee Day (CCD)', category: 'cafeteria', floor: 0, x: 75, y: 70, width: 25, height: 20, color: '#8B5CF6' },
          { id: 'um-g-dosa', room_number: 'G-04', name: 'Dosa Plaza South Indian', category: 'cafeteria', floor: 0, x: 75, y: 40, width: 25, height: 20, color: '#F59E0B' },
          { id: 'um-g-stairs', room_number: 'Escalator', name: 'Central Escalator & Stairs', category: 'stairs', floor: 0, x: 50, y: 50, width: 14, height: 16, color: '#EC4899' },
          { id: 'um-g-lift', room_number: 'Glass Lift', name: 'Panoramic Elevator', category: 'lift', floor: 0, x: 45, y: 25, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-um-g-ent', floor: 0, x: 50, y: 88, type: 'entrance' },
          { id: 'n-um-g-plaza', floor: 0, x: 50, y: 70, type: 'hallway' },
          { id: 'n-um-g-dominos', floor: 0, x: 33, y: 70, type: 'room_door', room_id: 'um-g-dominos' },
          { id: 'n-um-g-ccd', floor: 0, x: 67, y: 70, type: 'room_door', room_id: 'um-g-ccd' },
          { id: 'n-um-g-stairs', floor: 0, x: 50, y: 50, type: 'stairs', room_id: 'um-g-stairs' },
          { id: 'n-um-g-subway', floor: 0, x: 33, y: 40, type: 'room_door', room_id: 'um-g-subway' },
          { id: 'n-um-g-dosa', floor: 0, x: 67, y: 40, type: 'room_door', room_id: 'um-g-dosa' },
          { id: 'n-um-g-lift', floor: 0, x: 45, y: 25, type: 'lift', room_id: 'um-g-lift' },
        ],
        edges: [
          { from: 'n-um-g-ent', to: 'n-um-g-plaza', distance: 10 },
          { from: 'n-um-g-plaza', to: 'n-um-g-dominos', distance: 8 },
          { from: 'n-um-g-plaza', to: 'n-um-g-ccd', distance: 8 },
          { from: 'n-um-g-plaza', to: 'n-um-g-stairs', distance: 10 },
          { from: 'n-um-g-stairs', to: 'n-um-g-subway', distance: 9 },
          { from: 'n-um-g-stairs', to: 'n-um-g-dosa', distance: 9 },
          { from: 'n-um-g-stairs', to: 'n-um-g-lift', distance: 12 },
          { from: 'n-um-g-stairs', to: 'n-um-1-stairs', distance: 15, is_stair_transition: true },
          { from: 'n-um-g-lift', to: 'n-um-1-lift', distance: 15 },
        ]
      },
      {
        floor_number: 1,
        floor_name: '1st Floor (Retail & Stationers)',
        rooms: [
          { id: 'um-1-smith', room_number: '1-01', name: 'WH Smith University Bookstore', category: 'classroom', floor: 1, x: 20, y: 65, width: 25, height: 25, color: '#3B82F6' },
          { id: 'um-1-print', room_number: '1-02', name: 'Campus High-Speed Printing & Bindery', category: 'office', floor: 1, x: 20, y: 35, width: 25, height: 20, color: '#10B981' },
          { id: 'um-1-apparel', room_number: '1-03', name: 'LPU Official Merchandise & Apparel', category: 'classroom', floor: 1, x: 75, y: 65, width: 25, height: 25, color: '#635BFF' },
          { id: 'um-1-electronics', room_number: '1-04', name: 'Gadgets & Laptop Accessories', category: 'lab', floor: 1, x: 75, y: 35, width: 25, height: 20, color: '#F97316' },
          { id: 'um-1-stairs', room_number: 'Escalator', name: 'Central Escalator & Stairs', category: 'stairs', floor: 1, x: 50, y: 50, width: 14, height: 16, color: '#EC4899' },
          { id: 'um-1-lift', room_number: 'Glass Lift', name: 'Panoramic Elevator', category: 'lift', floor: 1, x: 45, y: 25, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-um-1-stairs', floor: 1, x: 50, y: 50, type: 'stairs', room_id: 'um-1-stairs' },
          { id: 'n-um-1-hall', floor: 1, x: 50, y: 65, type: 'hallway' },
          { id: 'n-um-1-smith', floor: 1, x: 33, y: 65, type: 'room_door', room_id: 'um-1-smith' },
          { id: 'n-um-1-apparel', floor: 1, x: 67, y: 65, type: 'room_door', room_id: 'um-1-apparel' },
          { id: 'n-um-1-print', floor: 1, x: 33, y: 35, type: 'room_door', room_id: 'um-1-print' },
          { id: 'n-um-1-electronics', floor: 1, x: 67, y: 35, type: 'room_door', room_id: 'um-1-electronics' },
          { id: 'n-um-1-lift', floor: 1, x: 45, y: 25, type: 'lift', room_id: 'um-1-lift' },
        ],
        edges: [
          { from: 'n-um-1-stairs', to: 'n-um-1-hall', distance: 8 },
          { from: 'n-um-1-hall', to: 'n-um-1-smith', distance: 9 },
          { from: 'n-um-1-hall', to: 'n-um-1-apparel', distance: 9 },
          { from: 'n-um-1-stairs', to: 'n-um-1-print', distance: 10 },
          { from: 'n-um-1-stairs', to: 'n-um-1-electronics', distance: 10 },
          { from: 'n-um-1-stairs', to: 'n-um-1-lift', distance: 12 },
          { from: 'n-um-1-stairs', to: 'n-um-2-stairs', distance: 15, is_stair_transition: true },
          { from: 'n-um-1-lift', to: 'n-um-2-lift', distance: 15 },
        ]
      },
      {
        floor_number: 2,
        floor_name: '2nd Floor (Post Office & Banking)',
        rooms: [
          { id: 'um-2-post', room_number: '2-01', name: 'Campus Post Office & Parcel Hub', category: 'office', floor: 2, x: 20, y: 60, width: 30, height: 30, color: '#F59E0B' },
          { id: 'um-2-sbi', room_number: '2-02', name: 'State Bank of India (SBI Branch)', category: 'office', floor: 2, x: 75, y: 65, width: 25, height: 25, color: '#3B82F6' },
          { id: 'um-2-hdfc', room_number: '2-03', name: 'HDFC Bank & 24/7 ATM Bay', category: 'office', floor: 2, x: 75, y: 35, width: 25, height: 20, color: '#1E40AF' },
          { id: 'um-2-optics', room_number: '2-04', name: 'Titan Eye+ & Optical Care', category: 'classroom', floor: 2, x: 20, y: 30, width: 25, height: 18, color: '#10B981' },
          { id: 'um-2-stairs', room_number: 'Escalator', name: 'Central Escalator & Stairs', category: 'stairs', floor: 2, x: 50, y: 50, width: 14, height: 16, color: '#EC4899' },
          { id: 'um-2-lift', room_number: 'Glass Lift', name: 'Panoramic Elevator', category: 'lift', floor: 2, x: 45, y: 25, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-um-2-stairs', floor: 2, x: 50, y: 50, type: 'stairs', room_id: 'um-2-stairs' },
          { id: 'n-um-2-post', floor: 2, x: 36, y: 60, type: 'room_door', room_id: 'um-2-post' },
          { id: 'n-um-2-sbi', floor: 2, x: 66, y: 65, type: 'room_door', room_id: 'um-2-sbi' },
          { id: 'n-um-2-hdfc', floor: 2, x: 66, y: 35, type: 'room_door', room_id: 'um-2-hdfc' },
          { id: 'n-um-2-optics', floor: 2, x: 34, y: 30, type: 'room_door', room_id: 'um-2-optics' },
          { id: 'n-um-2-lift', floor: 2, x: 45, y: 25, type: 'lift', room_id: 'um-2-lift' },
        ],
        edges: [
          { from: 'n-um-2-stairs', to: 'n-um-2-post', distance: 10 },
          { from: 'n-um-2-stairs', to: 'n-um-2-sbi', distance: 10 },
          { from: 'n-um-2-stairs', to: 'n-um-2-hdfc', distance: 11 },
          { from: 'n-um-2-stairs', to: 'n-um-2-optics', distance: 12 },
          { from: 'n-um-2-stairs', to: 'n-um-2-lift', distance: 10 },
        ]
      }
    ]
  },

  // =======================================================
  // 3. CENTRAL LIBRARY (BLOCKS 36-38)
  // =======================================================
  'b-36-38': {
    building_id: 'b-36-38',
    building_name: 'Central Library & Knowledge Hub',
    block_code: 'B-36-38',
    floors: [
      {
        floor_number: 0,
        floor_name: 'Ground Floor (Circulation & Issues)',
        rooms: [
          { id: 'lib-g-ent', room_number: 'Entrance', name: 'RFID Security Turnstiles & Bag Counter', category: 'entrance', floor: 0, x: 50, y: 90, width: 25, height: 10, color: '#3B82F6' },
          { id: 'lib-g-circ', room_number: 'Circulation', name: 'Book Issue & Return Helpdesk', category: 'office', floor: 0, x: 20, y: 65, width: 25, height: 25, color: '#635BFF' },
          { id: 'lib-g-opac', room_number: 'OPAC Bay', name: 'Digital Library Catalogue Terminals', category: 'lab', floor: 0, x: 75, y: 65, width: 25, height: 25, color: '#10B981' },
          { id: 'lib-g-news', room_number: 'Periodicals', name: 'Newspapers & Current Magazines', category: 'classroom', floor: 0, x: 75, y: 35, width: 25, height: 20, color: '#F59E0B' },
          { id: 'lib-g-stairs', room_number: 'Marble Stairs', name: 'Grand Central Staircase', category: 'stairs', floor: 0, x: 50, y: 50, width: 14, height: 16, color: '#EC4899' },
          { id: 'lib-g-lift', room_number: 'Elevator', name: 'Quiet Lift', category: 'lift', floor: 0, x: 45, y: 25, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-lib-g-ent', floor: 0, x: 50, y: 88, type: 'entrance' },
          { id: 'n-lib-g-foyer', floor: 0, x: 50, y: 65, type: 'hallway' },
          { id: 'n-lib-g-circ', floor: 0, x: 33, y: 65, type: 'room_door', room_id: 'lib-g-circ' },
          { id: 'n-lib-g-opac', floor: 0, x: 67, y: 65, type: 'room_door', room_id: 'lib-g-opac' },
          { id: 'n-lib-g-stairs', floor: 0, x: 50, y: 50, type: 'stairs', room_id: 'lib-g-stairs' },
          { id: 'n-lib-g-news', floor: 0, x: 67, y: 35, type: 'room_door', room_id: 'lib-g-news' },
          { id: 'n-lib-g-lift', floor: 0, x: 45, y: 25, type: 'lift', room_id: 'lib-g-lift' },
        ],
        edges: [
          { from: 'n-lib-g-ent', to: 'n-lib-g-foyer', distance: 10 },
          { from: 'n-lib-g-foyer', to: 'n-lib-g-circ', distance: 8 },
          { from: 'n-lib-g-foyer', to: 'n-lib-g-opac', distance: 8 },
          { from: 'n-lib-g-foyer', to: 'n-lib-g-stairs', distance: 10 },
          { from: 'n-lib-g-stairs', to: 'n-lib-g-news', distance: 11 },
          { from: 'n-lib-g-stairs', to: 'n-lib-g-lift', distance: 12 },
          { from: 'n-lib-g-stairs', to: 'n-lib-1-stairs', distance: 15, is_stair_transition: true },
          { from: 'n-lib-g-lift', to: 'n-lib-1-lift', distance: 15 },
        ]
      },
      {
        floor_number: 1,
        floor_name: '1st Floor (Silent Reading Hall)',
        rooms: [
          { id: 'lib-1-read1', room_number: 'Hall A', name: 'Silent Reading Hall (500 Seats)', category: 'classroom', floor: 1, x: 25, y: 55, width: 35, height: 45, color: '#635BFF' },
          { id: 'lib-1-stacks', room_number: 'Stacks', name: 'Engineering & Science Book Vault', category: 'lab', floor: 1, x: 75, y: 65, width: 25, height: 25, color: '#10B981' },
          { id: 'lib-1-ref', room_number: 'Reference', name: 'Encyclopedias & Standards Desk', category: 'office', floor: 1, x: 75, y: 35, width: 25, height: 20, color: '#8B5CF6' },
          { id: 'lib-1-stairs', room_number: 'Marble Stairs', name: 'Grand Central Staircase', category: 'stairs', floor: 1, x: 50, y: 50, width: 14, height: 16, color: '#EC4899' },
          { id: 'lib-1-lift', room_number: 'Elevator', name: 'Quiet Lift', category: 'lift', floor: 1, x: 45, y: 25, width: 10, height: 10, color: '#06B6D4' },
        ],
        nodes: [
          { id: 'n-lib-1-stairs', floor: 1, x: 50, y: 50, type: 'stairs', room_id: 'lib-1-stairs' },
          { id: 'n-lib-1-read1', floor: 1, x: 35, y: 55, type: 'room_door', room_id: 'lib-1-read1' },
          { id: 'n-lib-1-stacks', floor: 1, x: 67, y: 65, type: 'room_door', room_id: 'lib-1-stacks' },
          { id: 'n-lib-1-ref', floor: 1, x: 67, y: 35, type: 'room_door', room_id: 'lib-1-ref' },
          { id: 'n-lib-1-lift', floor: 1, x: 45, y: 25, type: 'lift', room_id: 'lib-1-lift' },
        ],
        edges: [
          { from: 'n-lib-1-stairs', to: 'n-lib-1-read1', distance: 10 },
          { from: 'n-lib-1-stairs', to: 'n-lib-1-stacks', distance: 10 },
          { from: 'n-lib-1-stairs', to: 'n-lib-1-ref', distance: 11 },
          { from: 'n-lib-1-stairs', to: 'n-lib-1-lift', distance: 10 },
        ]
      }
    ]
  }
};
