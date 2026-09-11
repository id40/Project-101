'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { CampusLocation, NavigationRoute, Vendor } from '@/types/campus';
import { StudentProfile, AvatarConfig } from '@/types/profile';
import { LPU_LOCATIONS } from '@/data/lpuSeedData';
import { LPU_VENDORS } from '@/data/lpuVendors';
import { findShortestOutdoorRoute, findNearestNode } from '@/lib/dijkstra';
import { gpsToCampusCoords } from '@/lib/geoMath';

// Dynamic import for Three.js Canvas to prevent SSR issues
const CampusCanvas = dynamic(
  () => import('@/components/map/CampusCanvas').then((mod) => mod.CampusCanvas),
  { ssr: false }
);
import { Campus2DView } from '@/components/map/Campus2DView';
import { AndroidBottomNav, NavTab } from '@/components/ui/AndroidBottomNav';
import { SearchBar } from '@/components/ui/SearchBar';
import { LocationDetailDrawer } from '@/components/ui/LocationDetailDrawer';
import { IndoorModal } from '@/components/indoor/IndoorModal';
import { CampusIDCardModal } from '@/components/profile/CampusIDCardModal';
import { StudentProfileDrawer } from '@/components/profile/StudentProfileDrawer';
import { VendorSheet } from '@/components/ui/VendorSheet';
import { AIChatDrawer } from '@/components/ui/AIChatDrawer';
import { VirtualJoystick } from '@/components/ui/VirtualJoystick';
import { Layers, Crosshair, User, X, Navigation, Compass, MapPin } from 'lucide-react';

export default function CampusNavigatorPage() {
  // View mode: 3D or 2D
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [currentTab, setCurrentTab] = useState<NavTab>('explore');

  // Locations & Selection
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [indoorBuildingId, setIndoorBuildingId] = useState<string | null>(null);

  // Modals & Drawers
  const [isIDCardOpen, setIsIDCardOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isVendorSheetOpen, setIsVendorSheetOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Avatar & Location: Start at Main Gate 1 Welcome Plaza
  const [avatarPosition, setAvatarPosition] = useState<[number, number, number]>([180, 0, 190]);
  const [avatarHeading, setAvatarHeading] = useState<number>(-2.4);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

  // Navigation Route
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);

  // GPS & Simulation
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simulationStep = useRef<number>(0);

  // Student Profile
  const [profile, setProfile] = useState<StudentProfile>({
    registrationNumber: '12204589',
    name: 'Shekh Imamul',
    email: 'shekh.imamul@lpu.in',
    school: 'School of Computer Science and Engineering',
    program: 'B.Tech CSE (AI & Data Science)',
    term: 'Term 6',
    bloodGroup: 'O+',
    hostelBlock: 'Boys Hostel BH-1, Room 412',
    emergencyContact: '+91 98721 99999',
    attendancePercentage: 88.5,
    avatar: {
      gender: 'boy',
      accentColor: '#635BFF',
      hairColor: '#1E293B',
      clothingColor: '#635BFF',
    },
    schedule: [
      {
        id: 'c1',
        courseCode: 'CSE326',
        courseName: 'Internet Programming & Web Apps',
        roomNumber: '34-201',
        buildingId: 'b-33-34',
        startTime: '09:00',
        endTime: '10:00',
        day: 'Monday',
        instructor: 'Dr. Sharma',
      },
      {
        id: 'c2',
        courseCode: 'CSE408',
        courseName: 'Advanced Artificial Intelligence',
        roomNumber: '34-Lab 203',
        buildingId: 'b-33-34',
        startTime: '11:00',
        endTime: '13:00',
        day: 'Monday',
        instructor: 'Prof. Verma',
      },
      {
        id: 'c3',
        courseCode: 'LIB101',
        courseName: 'Research & Library Study Session',
        roomNumber: 'LIB-Reading Hall',
        buildingId: 'b-36-38',
        startTime: '15:00',
        endTime: '16:30',
        day: 'Monday',
        instructor: 'Central Library Staff',
      },
    ],
  });

  // Handle Tab changes from Android Bottom Dock
  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'explore') {
      setIsVendorSheetOpen(false);
      setIsChatOpen(false);
      setIsIDCardOpen(false);
      setIsProfileOpen(false);
    } else if (tab === 'vendors') {
      setIsVendorSheetOpen(true);
      setIsChatOpen(false);
    } else if (tab === 'idcard') {
      setIsIDCardOpen(true);
      setIsChatOpen(false);
    } else if (tab === 'chat') {
      setIsChatOpen(true);
      setIsVendorSheetOpen(false);
    } else if (tab === 'navigate') {
      if (selectedLocation) {
        handleNavigateToLocation(selectedLocation);
      } else {
        const cse = LPU_LOCATIONS.find((l) => l.id === 'b-33-34') || LPU_LOCATIONS[0];
        handleNavigateToLocation(cse);
      }
    }
  };

  // Joystick move handler
  const handleJoystickMove = useCallback((dx: number, dz: number) => {
    setAvatarPosition(([px, py, pz]) => {
      const nx = Math.max(-210, Math.min(230, px + dx));
      const nz = Math.max(-170, Math.min(240, pz + dz));
      return [nx, py, nz];
    });

    const angle = Math.atan2(dx, dz);
    setAvatarHeading(angle);
    setIsMoving(true);

    const timer = setTimeout(() => setIsMoving(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // GPS Real-time tracking
  useEffect(() => {
    let watchId: number | null = null;
    if (isGpsActive && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { x, z } = gpsToCampusCoords(pos.coords.latitude, pos.coords.longitude);
          if (Math.hypot(x, z) < 450) {
            setAvatarPosition([x, 0, z]);
            if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
              setAvatarHeading((pos.coords.heading * Math.PI) / 180);
            }
          }
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isGpsActive]);

  // Grand Automated Simulation Tour across the whole 600 acres
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      const tourWaypoints: [number, number][] = [
        [200, 215],   // Gate 1 Entry
        [160, 180],   // Block 1 Fashion
        [130, 160],   // Baldev Raj Auditorium
        [100, 90],    // Pharmacy
        [20, 30],     // UniMall & Unipolis
        [-10, 50],    // Mittal School of Business
        [-80, 0],     // Block 34 Computer Science
        [-70, -40],   // Central Library
        [-120, -40],  // Cricket Stadium
        [-80, -85],   // Olympic Pool
        [-60, -120],  // BH-1 & BH-2 Food Square
        [100, -50],   // Uni-Hospital
        [200, 215],   // Return to Gate 1
      ];

      interval = setInterval(() => {
        simulationStep.current = (simulationStep.current + 1) % tourWaypoints.length;
        const target = tourWaypoints[simulationStep.current];

        setAvatarPosition(([px, , pz]) => {
          const dx = target[0] - px;
          const dz = target[1] - pz;
          const angle = Math.atan2(dx, dz);
          setAvatarHeading(angle);
          setIsMoving(true);
          setTimeout(() => setIsMoving(false), 1400);
          return [target[0], 0, target[1]];
        });
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  // Navigate to building via Dijkstra
  const handleNavigateToLocation = (loc: CampusLocation) => {
    setSelectedLocation(loc);
    const startNode = findNearestNode(avatarPosition[0], avatarPosition[2]);
    const destNode = findNearestNode(loc.map_x, loc.map_z);

    const route = findShortestOutdoorRoute(
      startNode.id,
      destNode.id,
      'Your Location',
      loc.name
    );

    setActiveRoute(route);
  };

  // Navigate to Vendor
  const handleNavigateToVendor = (ven: Vendor) => {
    const parentLoc = LPU_LOCATIONS.find((l) => l.id === ven.location_id) || LPU_LOCATIONS[0];
    setSelectedLocation(parentLoc);
    const startNode = findNearestNode(avatarPosition[0], avatarPosition[2]);
    const destNode = findNearestNode(ven.map_x, ven.map_z);

    const route = findShortestOutdoorRoute(
      startNode.id,
      destNode.id,
      'Your Location',
      ven.name
    );

    setActiveRoute(route);
  };

  const handleUpdateAvatar = (newConfig: AvatarConfig) => {
    setProfile((prev) => ({ ...prev, avatar: newConfig }));
  };

  // Quick Camera Presets
  const handleFlyToDistrict = (locId: string) => {
    const loc = LPU_LOCATIONS.find((l) => l.id === locId);
    if (loc) {
      setSelectedLocation(loc);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090D16]">
      {/* Top Floating App Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 max-w-2xl mx-auto pointer-events-auto">
        <SearchBar
          locations={LPU_LOCATIONS}
          vendors={LPU_VENDORS}
          onSelectLocation={(loc) => {
            // Smoothly fly camera to selected location without resetting back to avatar!
            setSelectedLocation(loc);
          }}
          onSelectVendor={handleNavigateToVendor}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setViewMode((m) => (m === '3d' ? '2d' : '3d'))}
            className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold border shadow-xl transition-all ${
              viewMode === '3d'
                ? 'bg-[#635BFF] text-white border-[#635BFF] shadow-[#635BFF]/30'
                : 'bg-slate-900/90 text-cyan-300 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{viewMode === '3d' ? '3D View' : '2D Map'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedLocation(null);
              setRecenterTrigger((t) => t + 1);
            }}
            title="Recenter on My Avatar"
            className="w-9 h-9 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            title="Student Profile & ID"
            className="w-9 h-9 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 relative"
          >
            <User className="w-4 h-4 text-[#635BFF]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>
        </div>
      </div>

      {/* Quick District Presets (Floating under search) */}
      <div className="absolute top-16 left-3 right-3 z-20 max-w-xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
        {[
          { label: 'Gate 1', id: 'gate-01' },
          { label: 'Block 34 (CSE)', id: 'b-33-34' },
          { label: 'UniMall & Food Court', id: 'b-15-unimall' },
          { label: 'Unipolis', id: 'unipolis' },
          { label: 'Central Library', id: 'b-36-38' },
          { label: 'Cricket Stadium', id: 'cricket-stadium' },
          { label: 'Boys Hostels', id: 'bh-1-2' },
          { label: 'Girls Hostels', id: 'gh-cluster' },
        ].map((dist) => (
          <button
            key={dist.id}
            onClick={() => handleFlyToDistrict(dist.id)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-[#635BFF]/50 whitespace-nowrap shadow-md transition-all"
          >
            {dist.label}
          </button>
        ))}
      </div>

      {/* Main Map Viewport (3D or 2D) */}
      <div className="w-full h-full">
        {viewMode === '3d' ? (
          <CampusCanvas
            locations={LPU_LOCATIONS}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            avatarPosition={avatarPosition}
            avatarHeading={avatarHeading}
            isMoving={isMoving}
            avatarConfig={profile.avatar}
            activeRoute={activeRoute}
            recenterTrigger={recenterTrigger}
          />
        ) : (
          <Campus2DView
            locations={LPU_LOCATIONS}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            avatarPosition={avatarPosition}
            avatarHeading={avatarHeading}
            avatarConfig={profile.avatar}
            activeRoute={activeRoute}
          />
        )}
      </div>

      {/* Active Navigation HUD Banner */}
      {activeRoute && (
        <div className="absolute top-28 left-3 right-3 z-30 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-top duration-300">
          <div className="bg-[#090D16]/95 backdrop-blur-xl border border-[#635BFF]/60 rounded-3xl p-3.5 text-white shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-[#635BFF]/30 shrink-0">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold px-1.5 py-0.2 rounded">
                    OUTDOOR ROUTE
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight truncate max-w-[180px]">
                    {activeRoute.destination_name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  <strong className="text-cyan-300">{activeRoute.total_distance}m</strong> distance • ~
                  <strong className="text-emerald-400">{activeRoute.estimated_time_min} min</strong> walk
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveRoute(null)}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Virtual Joystick & GPS Controls */}
      <div className="absolute bottom-20 left-4 z-30">
        <VirtualJoystick
          onMove={handleJoystickMove}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating((s) => !s)}
          isGpsActive={isGpsActive}
          onToggleGps={() => setIsGpsActive((g) => !g)}
        />
      </div>

      {/* Location Detail Drawer */}
      <LocationDetailDrawer
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        onNavigateHere={handleNavigateToLocation}
        onOpenIndoorMap={(buildingId) => setIndoorBuildingId(buildingId)}
      />

      {/* Indoor Blueprint Modal */}
      {indoorBuildingId && (
        <IndoorModal
          buildingId={indoorBuildingId}
          onClose={() => setIndoorBuildingId(null)}
        />
      )}

      {/* Campus ID Card Modal */}
      {isIDCardOpen && (
        <CampusIDCardModal
          profile={profile}
          onClose={() => setIsIDCardOpen(false)}
        />
      )}

      {/* Student Profile Dashboard */}
      {isProfileOpen && (
        <StudentProfileDrawer
          profile={profile}
          onUpdateAvatar={handleUpdateAvatar}
          onNavigateToBuilding={(bId) => {
            const b = LPU_LOCATIONS.find((l) => l.id === bId);
            if (b) handleNavigateToLocation(b);
            setIsProfileOpen(false);
          }}
          onOpenIDCard={() => {
            setIsIDCardOpen(true);
            setIsProfileOpen(false);
          }}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Vendor Directory Drawer */}
      {isVendorSheetOpen && (
        <VendorSheet
          onSelectVendor={(v) => {
            const loc = LPU_LOCATIONS.find((l) => l.id === v.location_id);
            if (loc) setSelectedLocation(loc);
          }}
          onNavigateToVendor={handleNavigateToVendor}
          onClose={() => setIsVendorSheetOpen(false)}
          userPosition={avatarPosition}
        />
      )}

      {/* AI Chatbot Drawer */}
      {isChatOpen && (
        <AIChatDrawer
          onClose={() => setIsChatOpen(false)}
          onFocusLocation={(locId) => {
            const loc = LPU_LOCATIONS.find((l) => l.id === locId);
            if (loc) setSelectedLocation(loc);
          }}
          onNavigateToLocation={(loc) => {
            handleNavigateToLocation(loc);
          }}
          onOpenIndoorMap={(locId) => {
            setIndoorBuildingId(locId);
          }}
          locations={LPU_LOCATIONS}
        />
      )}

      {/* Android Bottom Navigation Dock */}
      <AndroidBottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        hasActiveRoute={activeRoute !== null}
      />
    </div>
  );
}
