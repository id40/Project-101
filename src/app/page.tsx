'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import CampusSearch from '@/components/ui/CampusSearch';
import BuildingInfoPanel from '@/components/ui/BuildingInfoPanel';
import NavigationPanel from '@/components/ui/NavigationPanel';
import MapLayersPanel from '@/components/ui/MapLayersPanel';
import { AIChatDrawer } from '@/components/ui/AIChatDrawer';
import { CampusIDCardModal } from '@/components/profile/CampusIDCardModal';
import { StudentProfileDrawer } from '@/components/profile/StudentProfileDrawer';
import { IndoorModal } from '@/components/indoor/IndoorModal';
import { VendorSheet } from '@/components/ui/VendorSheet';
import { UniMallBookingModal } from '@/components/unimall/UniMallBookingModal';
import { CampusDirectoryDrawer } from '@/components/ui/CampusDirectoryDrawer';
import { EmergencySOSModal } from '@/components/ui/EmergencySOSModal';
import { WhatsNearMeModal } from '@/components/ui/WhatsNearMeModal';
import ARNavigationModal from '@/components/ui/ARNavigationModal';
import CampusShuttleModal from '@/components/ui/CampusShuttleModal';
import CampusHeatmapModal from '@/components/ui/CampusHeatmapModal';
import { useCampusVoice } from '@/hooks/useCampusVoice';

import { 
  Layers, Navigation, Ruler, Compass, Map as MapIcon, 
  Box, RotateCcw, GraduationCap, X, LocateFixed, Footprints,
  Sparkles, User, Store, Globe, ShoppingBag, Building2, ShieldAlert, Radar,
  Camera, Bus, Flame, Volume2, VolumeX
} from 'lucide-react';

import type { GISBuildingProperties, GISPOIProperties, LayerVisibility, NavigationRoute } from '@/types/gis';
import type { CampusMap3DRef } from '@/components/map/CampusMap3D';
import type { ArchitecturalTwinViewerRef } from '@/components/map/ArchitecturalTwinViewer';
import type { CampusLocation, Vendor } from '@/types/campus';
import type { StudentProfile, AvatarConfig } from '@/types/profile';
import { LPU_LOCATIONS } from '@/data/lpuSeedData';
import { INDOOR_FLOOR_PLANS } from '@/data/indoorData';
import { formatDistance, formatWalkTime } from '@/lib/gisUtils';
import { useCampusGPS } from '@/hooks/useCampusGPS';
import lpuBuildingsData from '@/data/geojson/lpu_buildings.json';
import lpuPoisData from '@/data/geojson/lpu_pois.json';

// Dynamic import for CampusMap3D (SSR disabled - WebGL maplibre)
const CampusMap3D = dynamic(() => import('@/components/map/CampusMap3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-[#ff5e1e]/30 border-t-[#ff5e1e] rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-white/90 text-lg font-bold font-heading tracking-wider mb-1">NAVIA SPATIAL OS</h2>
        <p className="text-white/40 text-sm">Initializing 3D GIS WebGL Engine...</p>
      </div>
    </div>
  ),
});

// Dynamic import for ArchitecturalTwinViewer (SSR disabled - Three.js Masterplan)
const ArchitecturalTwinViewer = dynamic(() => import('@/components/map/ArchitecturalTwinViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-[#ff5e1e]/30 border-t-[#ff5e1e] rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-white/90 text-lg font-bold font-heading tracking-wider mb-1">NAVIA 3D TWIN</h2>
        <p className="text-white/40 text-sm">Constructing High-Detail 3D Masterplan...</p>
      </div>
    </div>
  ),
});

type ActivePanel = 'none' | 'navigation' | 'layers' | 'measure';

export default function CampusPage() {
  const mapRef = useRef<CampusMap3DRef>(null);
  const twinRef = useRef<ArchitecturalTwinViewerRef>(null);
  
  // Dual Engine Mode: 'twin' (3D Architectural Masterplan) vs 'gis' (MapLibre GIS Navigator)
  const [engineMode, setEngineMode] = useState<'twin' | 'gis'>('twin');
  const [focusTarget, setFocusTarget] = useState<{ id?: string; lng: number; lat: number } | null>(null);
  const [activeRouteCoords, setActiveRouteCoords] = useState<[number, number][]>([]);

  // View mode: 3D or 2D & Basemap mode (Dark vs Satellite)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [basemapMode, setBasemapMode] = useState<'dark' | 'satellite'>('satellite');
  
  // UI Panels
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isIDCardOpen, setIsIDCardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVendorSheetOpen, setIsVendorSheetOpen] = useState(false);
  const [indoorBuildingId, setIndoorBuildingId] = useState<string | null>(null);
  const [isUniMallBookingOpen, setIsUniMallBookingOpen] = useState(false);
  const [uniMallInitialShopId, setUniMallInitialShopId] = useState<string | null>(null);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [directoryCategory, setDirectoryCategory] = useState<string>('all');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isNearMeOpen, setIsNearMeOpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [isShuttleOpen, setIsShuttleOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);

  // Audio Voice Guidance Hook
  const { speak, supported: isVoiceSupported, isMuted: isVoiceMuted, toggleMute: toggleVoiceMute } = useCampusVoice();

  // Building selection
  const [selectedBuilding, setSelectedBuilding] = useState<GISBuildingProperties | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  // Navigation
  const [navOrigin, setNavOrigin] = useState<{ id: string; name: string; lng: number; lat: number } | null>(null);
  const [navDestination, setNavDestination] = useState<{ id: string; name: string; lng: number; lat: number } | null>(null);

  // Real-Time GPS Tracking & Walk Navigation
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);

  const {
    location: gpsLocation,
    isTracking: isGpsTracking,
    isOnCampus,
    isSimulating,
    error: gpsError,
    startTracking: startGpsTracking,
    requestCompassPermission,
  } = useCampusGPS({
    activeRouteCoords,
    isNavigating,
  });

  // Layer visibility
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    buildings: true,
    roads: true,
    pedestrianPaths: true,
    parks: true,
    parking: true,
    food: true,
    academic: true,
    residential: true,
    sports: true,
    landmarks: true,
    pois: true,
  });

  // Measurement
  const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [totalMeasureDistance, setTotalMeasureDistance] = useState(0);

  // Student Profile: Shekh Imamul
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
        courseCode: 'INT404',
        courseName: 'Artificial Intelligence Systems',
        roomNumber: '34-105',
        buildingId: 'b-33-34',
        startTime: '11:00',
        endTime: '12:00',
        day: 'Monday',
        instructor: 'Prof. Verma',
      },
      {
        id: 'c3',
        courseCode: 'MGT101',
        courseName: 'Tech Entrepreneurship',
        roomNumber: '13-302',
        buildingId: 'b-13-14',
        startTime: '14:00',
        endTime: '15:00',
        day: 'Monday',
        instructor: 'Dr. Kaur',
      },
    ],
  });

  // Helper to map building id/alias to indoor data keys
  const resolveIndoorId = useCallback((id: string): string | null => {
    if (INDOOR_FLOOR_PLANS[id]) return id;
    const lower = id.toLowerCase();
    if (lower.includes('unimall') || lower === 'b-15' || lower === 'b-15-unimall' || lower.includes('mall')) return 'b-15-unimall';
    if (lower.includes('33') || lower.includes('34') || lower === 'block-34' || lower === 'b-34') return 'b-33-34';
    if (lower.includes('36') || lower.includes('37') || lower.includes('38') || lower.includes('library')) return 'b-36-38';
    return null;
  }, []);

  // Check if current selected building has an indoor map
  const hasIndoorMap = useMemo(() => {
    if (!selectedBuilding?.id) return false;
    return !!resolveIndoorId(selectedBuilding.id) || selectedBuilding.has_indoor_map === true;
  }, [selectedBuilding, resolveIndoorId]);

  // Handlers for Map interactions
  const handleBuildingClick = useCallback((props: GISBuildingProperties, coords: [number, number]) => {
    setSelectedBuilding(props);
    setSelectedCoords(coords);
    mapRef.current?.highlightBuilding(props.id);
    mapRef.current?.flyTo(coords[0], coords[1], 17.5);
  }, []);

  const handlePOIClick = useCallback((props: GISPOIProperties, coords: [number, number]) => {
    setSelectedBuilding({
      id: props.id,
      name: props.name,
      block_code: (props as any).block_code || '',
      category: props.category as any,
      height: 0,
      min_height: 0,
      building_levels: 0,
      color: '#F59E0B',
      confidence: 'high',
      source: 'manual',
      description: props.description,
      badge: (props as any).badge,
    } as any);
    setSelectedCoords(coords);
    mapRef.current?.flyTo(coords[0], coords[1], 17.5);
  }, []);

  const handleMapClick = useCallback((lng: number, lat: number) => {
    if (isMeasuring) {
      const newPoints = [...measurementPoints, [lng, lat] as [number, number]];
      setMeasurementPoints(newPoints);
      
      if (newPoints.length >= 2) {
        let total = 0;
        for (let i = 1; i < newPoints.length; i++) {
          const [lng1, lat1] = newPoints[i - 1];
          const [lng2, lat2] = newPoints[i];
          const R = 6371000;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
          total += 2 * R * Math.asin(Math.sqrt(a));
        }
        setTotalMeasureDistance(total);
      }

      // Update map measurement layer
      const map = mapRef.current?.getMap();
      if (map) {
        const features: GeoJSON.Feature[] = [];
        if (newPoints.length >= 2) {
          features.push({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: newPoints },
          });
        }
        for (const pt of newPoints) {
          features.push({
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: pt },
          });
        }
        const source = map.getSource('measurement') as any;
        source?.setData({ type: 'FeatureCollection', features });
      }
      return;
    }

    if (selectedBuilding) {
      setSelectedBuilding(null);
      setSelectedCoords(null);
      mapRef.current?.clearHighlight();
    }
  }, [isMeasuring, measurementPoints, selectedBuilding]);

  const handleSearchSelect = useCallback((id: string, name: string, lng: number, lat: number) => {
    setFocusTarget({ id, lng, lat });
    mapRef.current?.flyTo(lng, lat, 17.5);
    setTimeout(() => mapRef.current?.highlightBuilding(id), 600);

    const bFeature = (lpuBuildingsData as any).features?.find((f: any) => f.properties?.id === id);
    if (bFeature) {
      setSelectedBuilding(bFeature.properties);
      setSelectedCoords([lng, lat]);
      return;
    }
    const poiFeature = (lpuPoisData as any).features?.find((f: any) => f.properties?.id === id);
    if (poiFeature) {
      setSelectedBuilding({
        id: poiFeature.properties.id,
        name: poiFeature.properties.name,
        block_code: poiFeature.properties.block_code || '',
        category: poiFeature.properties.category as any,
        height: 0,
        min_height: 0,
        building_levels: 0,
        color: '#F59E0B',
        confidence: 'high',
        source: 'manual',
        description: poiFeature.properties.description,
        badge: poiFeature.properties.badge,
        photo: poiFeature.properties.photo,
      } as any);
      setSelectedCoords([lng, lat]);
      return;
    }
    setSelectedBuilding({
      id,
      name,
      block_code: '',
      category: 'academic',
      height: 18,
      min_height: 0,
      building_levels: 4,
      color: '#38bdf8',
      confidence: 'high',
      source: 'manual',
    } as any);
    setSelectedCoords([lng, lat]);
  }, []);

  const handleNavigateTo = useCallback((id: string, lng: number, lat: number) => {
    setNavDestination({ id, name: selectedBuilding?.name || 'Destination', lng, lat });
    if (!navOrigin) {
      setNavOrigin({ id: 'gate-01', name: 'Main Gate 1 (GT Road NH-44)', lng: 75.7065, lat: 31.2515 });
    }
    setActivePanel('navigation');
  }, [selectedBuilding, navOrigin]);

  const handleNavigateFrom = useCallback((id: string, lng: number, lat: number) => {
    setNavOrigin({ id, name: selectedBuilding?.name || 'Origin', lng, lat });
    setActivePanel('navigation');
  }, [selectedBuilding]);

  const handleRouteFound = useCallback((route: NavigationRoute) => {
    setActiveRoute(route);
    setActiveRouteCoords(route.coordinates as [number, number][]);
    mapRef.current?.addRouteLayer(route.coordinates as [number, number][]);
    if (route.coordinates.length >= 2) {
      const lngs = route.coordinates.map(c => c[0]);
      const lats = route.coordinates.map(c => c[1]);
      const map = mapRef.current?.getMap();
      if (map) {
        map.fitBounds(
          [[Math.min(...lngs) - 0.001, Math.min(...lats) - 0.001],
           [Math.max(...lngs) + 0.001, Math.max(...lats) + 0.001]],
          { padding: 80, pitch: viewMode === '3d' ? 55 : 0, duration: 1500 }
        );
      }
    }
  }, [viewMode]);

  const handleStartWalkNavigation = useCallback(async (route: NavigationRoute) => {
    setActiveRoute(route);
    setIsNavigating(true);
    await requestCompassPermission();

    speak(`Starting route to ${route.destination_name}. Total distance is ${formatDistance(route.total_distance_m)}, estimated walking time ${formatWalkTime(route.estimated_time_min)}. Follow the highlighted path.`);

    if (engineMode === 'twin') {
      const startCoord = route.coordinates[0];
      twinRef.current?.startWalkNavigation(startCoord[0], startCoord[1]);
      setViewMode('3d');
    }
  }, [engineMode, requestCompassPermission, speak]);

  const handleStopWalkNavigation = useCallback(() => {
    setIsNavigating(false);
    speak('Navigation ended.');
    if (engineMode === 'twin') {
      twinRef.current?.setViewMode('isometric');
    }
  }, [engineMode, speak]);

  const handleClearRoute = useCallback(() => {
    setActiveRoute(null);
    setIsNavigating(false);
    setActiveRouteCoords([]);
    mapRef.current?.clearRoute();
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === '2d' ? '3d' : '2d';
    setViewMode(newMode);
    mapRef.current?.setViewMode(newMode);
  };

  const togglePanel = (panel: ActivePanel) => {
    if (panel === 'measure') {
      const newMeasuring = !isMeasuring;
      setIsMeasuring(newMeasuring);
      if (!newMeasuring) {
        setMeasurementPoints([]);
        setTotalMeasureDistance(0);
        const map = mapRef.current?.getMap();
        const source = map?.getSource('measurement') as any;
        source?.setData({ type: 'FeatureCollection', features: [] });
      }
      setActivePanel(newMeasuring ? 'measure' : 'none');
      return;
    }
    setActivePanel(activePanel === panel ? 'none' : panel);
  };

  const handleLayerToggle = (layer: keyof LayerVisibility) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // AI Chat integration handlers
  const handleChatFocusLocation = useCallback((locId: string) => {
    const loc = LPU_LOCATIONS.find(l => l.id === locId);
    if (loc) {
      mapRef.current?.flyTo(loc.longitude, loc.latitude, 18);
      mapRef.current?.highlightBuilding(loc.id);
    }
  }, []);

  const handleChatNavigate = useCallback((loc: CampusLocation) => {
    setNavDestination({ id: loc.id, name: loc.name, lng: loc.longitude, lat: loc.latitude });
    setActivePanel('navigation');
    setIsChatOpen(false);
  }, []);

  const handleOpenIndoorMap = useCallback((locId: string) => {
    const targetId = resolveIndoorId(locId) || 'b-33-34';
    setIndoorBuildingId(targetId);
  }, [resolveIndoorId]);

  const handleVendorSelect = useCallback((ven: Vendor) => {
    const loc = LPU_LOCATIONS.find(l => l.id === ven.location_id);
    if (loc) {
      mapRef.current?.flyTo(loc.longitude, loc.latitude, 18);
      mapRef.current?.highlightBuilding(loc.id);
    }
    setIsVendorSheetOpen(false);
  }, []);

  const handleVendorNavigate = useCallback((ven: Vendor) => {
    const loc = LPU_LOCATIONS.find(l => l.id === ven.location_id);
    if (loc) {
      setNavDestination({ id: loc.id, name: `${ven.name} (${loc.name})`, lng: loc.longitude, lat: loc.latitude });
      setActivePanel('navigation');
    }
    setIsVendorSheetOpen(false);
  }, []);

  const handleNavigateToHospital = useCallback(() => {
    const hosp = LPU_LOCATIONS.find(l => l.id === 'uni-hospital');
    if (hosp) {
      setNavDestination({ id: hosp.id, name: hosp.name, lng: hosp.longitude, lat: hosp.latitude });
      setActivePanel('navigation');
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Dual Engine Viewport */}
      {engineMode === 'gis' ? (
        <CampusMap3D
          ref={mapRef}
          onBuildingClick={handleBuildingClick}
          onPOIClick={handlePOIClick}
          onMapClick={handleMapClick}
          layerVisibility={layerVisibility}
          basemapMode={basemapMode}
          className="w-full h-full"
        />
      ) : (
        <ArchitecturalTwinViewer
          ref={twinRef}
          onSelectBuilding={handleBuildingClick}
          onSelectPOI={handlePOIClick}
          selectedBuildingId={selectedBuilding?.id}
          focusTarget={focusTarget}
          routeCoordinates={activeRouteCoords}
          layerVisibility={layerVisibility}
          userLocation={gpsLocation}
          isNavigating={isNavigating}
          className="w-full h-full"
        />
      )}

      {/* ── NAVIA HEADER (INTEGRATED SEARCH BAR & CHIPS) ── */}
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 sm:gap-4 border-b border-white/10 bg-[#0c0e14]/95 px-3 sm:px-5 lg:px-6 py-2 backdrop-blur-2xl pointer-events-auto shadow-2xl">
        {/* NAVIA Brand & Monogram Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#1e1f26] to-[#0c0e14] border border-[#ff5e1e]/30 shadow-lg shadow-orange-500/15 flex items-center justify-center">
            <Image
              src="/navia-monogram.png"
              alt="NAVIA Monogram"
              width={40}
              height={40}
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-white font-heading">
                NAVIA
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#ff5e1e]/20 text-[#ffb59d] border border-[#ff5e1e]/40">
                OS
              </span>
            </div>
            <span className="text-[9px] font-medium tracking-tight text-slate-400 -mt-0.5 hidden xs:block">
              LPU Spatial Campus
            </span>
          </div>
        </div>

        {/* Shifted Search Bar and Elements inside Header */}
        <div className="flex-1 max-w-xl mx-auto min-w-0">
          <CampusSearch onSelectLocation={handleSearchSelect} variant="header" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* 3D / 2D Toggle */}
          <button
            onClick={() => {
              if (engineMode === 'twin') {
                twinRef.current?.toggleViewMode();
              } else {
                toggleViewMode();
              }
            }}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1e1f26] text-slate-200 hover:bg-[#282a30] hover:text-white border border-white/10 text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
            title="Toggle 3D / 2D perspective"
          >
            <Box size={13} className="text-[#7bd0ff]" />
            <span>3D</span>
          </button>

          {/* Engine Switcher */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[#111319] border border-white/10 rounded-lg">
            <button
              onClick={() => setEngineMode('twin')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${
                engineMode === 'twin'
                  ? 'bg-gradient-to-r from-[#ff5e1e] to-amber-600 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3D Architectural Digital Twin"
            >
              TWIN
            </button>
            <button
              onClick={() => setEngineMode('gis')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${
                engineMode === 'gis'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite GIS Navigator"
            >
              GIS
            </button>
          </div>

          {/* Emergency SOS */}
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-xs font-medium transition-all active:scale-95"
            title="Campus Emergency SOS & Rapid Medical"
          >
            <ShieldAlert size={14} className="text-red-400" />
            <span className="hidden sm:inline font-semibold">SOS</span>
          </button>

          {/* Student ID & Profile */}
          <button
            onClick={() => setIsIDCardOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-orange-500/50 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            title="Digital Student ID Card"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">12204589</span>
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-white/20 text-white shadow-md transition-all active:scale-95"
            title="Student Profile & Schedule"
          >
            <User size={15} />
          </button>
        </div>
      </header>

      {/* ── RIGHT FLOATING CONTROLS (STITCH GLASS PILLS) ── */}
      <div className="absolute top-20 right-4 sm:right-6 z-30 flex flex-col items-center gap-2 pointer-events-auto">
        {/* 3D / 2D Switch Pill */}
        <div className="flex flex-col rounded-xl bg-[#0c0e14]/85 border border-white/10 p-1 shadow-xl backdrop-blur-md">
          <button
            onClick={() => {
              if (viewMode !== '3d') {
                setViewMode('3d');
                if (engineMode === 'twin') {
                  twinRef.current?.setViewMode('isometric');
                } else {
                  mapRef.current?.setViewMode('3d');
                }
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === '3d' ? 'bg-[#ff5e1e] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D
          </button>
          <button
            onClick={() => {
              if (viewMode !== '2d') {
                setViewMode('2d');
                if (engineMode === 'twin') {
                  twinRef.current?.setViewMode('topdown');
                } else {
                  mapRef.current?.setViewMode('2d');
                }
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === '2d' ? 'bg-[#ff5e1e] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D
          </button>
        </div>

        {/* Control Stack */}
        <div className="flex flex-col rounded-xl bg-[#0c0e14]/85 border border-white/10 shadow-xl backdrop-blur-md overflow-hidden">
          {/* GPS Locate Me Button */}
          <button
            onClick={() => {
              if (gpsLocation) {
                if (engineMode === 'twin') {
                  twinRef.current?.centerOnUser();
                } else {
                  mapRef.current?.flyTo(gpsLocation.longitude, gpsLocation.latitude, 18);
                }
              } else {
                startGpsTracking();
              }
            }}
            className={`p-2.5 flex items-center justify-center border-b border-white/10 transition-colors ${
              isGpsTracking ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-[#1e1f26]'
            }`}
            title={gpsLocation ? `GPS Active (±${Math.round(gpsLocation.accuracy)}m)` : 'Locate My Position'}
          >
            <LocateFixed size={16} className={isGpsTracking ? 'animate-pulse text-emerald-400' : ''} />
          </button>
          {/* Satellite Toggle */}
          <button
            onClick={() => {
              if (engineMode === 'twin') {
                twinRef.current?.toggleBasemap();
              } else {
                const nextMode = basemapMode === 'dark' ? 'satellite' : 'dark';
                setBasemapMode(nextMode);
                mapRef.current?.setBasemapMode(nextMode);
              }
            }}
            className={`p-2.5 flex items-center justify-center border-b border-white/10 transition-colors ${
              basemapMode === 'satellite' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white hover:bg-[#1e1f26]'
            }`}
            title="Toggle Satellite"
          >
            <Globe size={16} />
          </button>
          {/* Reset View */}
          <button
            onClick={() => {
              if (engineMode === 'twin') twinRef.current?.resetView();
              else mapRef.current?.resetView();
            }}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-[#1e1f26] transition-colors border-b border-white/10 flex items-center justify-center"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
          {/* Compass North */}
          <button
            onClick={() => {
              if (engineMode === 'twin') twinRef.current?.orientNorth();
              else {
                const map = mapRef.current?.getMap();
                map?.easeTo({ bearing: 0, duration: 1000 });
              }
            }}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-[#1e1f26] transition-colors flex items-center justify-center"
            title="Orient North"
          >
            <Compass size={16} />
          </button>
        </div>

        {/* Layer Filters, Shuttle & Heatmap Pill */}
        <div className="flex flex-col rounded-xl bg-[#0c0e14]/85 border border-white/10 shadow-xl backdrop-blur-md overflow-hidden">
          {/* What's Near Me Radar Button */}
          <button
            onClick={() => setIsNearMeOpen(true)}
            className={`p-2.5 flex items-center justify-center border-b border-white/10 transition-colors ${
              isNearMeOpen ? 'text-[#ff5e1e] bg-[#ff5e1e]/15' : 'text-[#ffb59d] hover:text-[#ff5e1e] hover:bg-[#1e1f26]'
            }`}
            title="What's Near Me"
          >
            <Radar size={16} className={isNearMeOpen ? 'animate-spin' : ''} />
          </button>
          {/* E-Rickshaw & Shuttle Tracking Button */}
          <button
            onClick={() => setIsShuttleOpen(true)}
            className={`p-2.5 flex items-center justify-center border-b border-white/10 transition-colors ${
              isShuttleOpen ? 'text-cyan-300 bg-cyan-500/20' : 'text-cyan-400 hover:bg-[#1e1f26]'
            }`}
            title="Campus E-Rickshaw & Shuttle Tracker"
          >
            <Bus size={16} />
          </button>
          {/* Crowd & Study Heatmap Button */}
          <button
            onClick={() => setIsHeatmapOpen(true)}
            className={`p-2.5 flex items-center justify-center border-b border-white/10 transition-colors ${
              isHeatmapOpen ? 'text-amber-300 bg-amber-500/20' : 'text-amber-400 hover:bg-[#1e1f26]'
            }`}
            title="Crowd Density & Study Space Heatmap"
          >
            <Flame size={16} />
          </button>
          <button
            onClick={() => togglePanel('layers')}
            className={`p-2.5 flex items-center justify-center border-b border-white/10 transition-colors ${
              activePanel === 'layers' ? 'text-white bg-[#1e1f26]' : 'text-[#7bd0ff] hover:bg-[#1e1f26]'
            }`}
            title="Map Layers"
          >
            <Layers size={16} />
          </button>
          <button
            onClick={() => togglePanel('navigation')}
            className={`p-2.5 flex items-center justify-center transition-colors ${
              activePanel === 'navigation' ? 'text-white bg-[#1e1f26]' : 'text-[#4edea3] hover:bg-[#1e1f26]'
            }`}
            title="Navigation"
          >
            <Navigation size={16} />
          </button>
        </div>

        {/* Weather Badge */}
        <div className="px-2.5 py-1.5 rounded-xl bg-[#0c0e14]/85 border border-white/10 shadow-xl backdrop-blur-md flex flex-col items-center text-center">
          <span className="text-[10px] font-mono text-white font-bold">24°C</span>
          <span className="text-[8px] font-mono text-[#4edea3]">AQI 42</span>
        </div>
      </div>

      {/* ── BOTTOM COMPACT ACTION BAR ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {/* What's Near Me Quick Trigger */}
          <button
            onClick={() => setIsNearMeOpen(true)}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isNearMeOpen
                ? 'bg-[#ff5e1e] text-white shadow-lg shadow-orange-500/30'
                : 'text-[#ffb59d] hover:text-white hover:bg-[#1e1f26]'
            }`}
            title="What's Near Me (Radar)"
          >
            <Radar size={16} />
          </button>
          {/* Measure */}
          <button
            onClick={() => togglePanel('measure')}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isMeasuring
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1e1f26]'
            }`}
            title="Measure Distance"
          >
            <Ruler size={16} />
          </button>
          {/* Directory */}
          <button
            onClick={() => setIsDirectoryOpen(true)}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isDirectoryOpen
                ? 'bg-[#ff5e1e] text-white shadow-lg shadow-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1e1f26]'
            }`}
            title="Campus Directory"
          >
            <Building2 size={16} />
          </button>
          {/* Vendors */}
          <button
            onClick={() => setIsVendorSheetOpen(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e1f26] transition-all active:scale-95"
            title="Campus Vendors"
          >
            <Store size={16} />
          </button>
          {/* Campus Shuttles / E-Rickshaw */}
          <button
            onClick={() => setIsShuttleOpen(true)}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isShuttleOpen
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-cyan-400 hover:text-white hover:bg-[#1e1f26]'
            }`}
            title="Campus E-Rickshaw & Shuttle Tracker"
          >
            <Bus size={16} />
          </button>
          {/* Study Space Heatmap */}
          <button
            onClick={() => setIsHeatmapOpen(true)}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isHeatmapOpen
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-amber-400 hover:text-white hover:bg-[#1e1f26]'
            }`}
            title="Live Study Space Heatmap"
          >
            <Flame size={16} />
          </button>
          {/* UniMall */}
          <button
            onClick={() => {
              setUniMallInitialShopId(null);
              setIsUniMallBookingOpen(true);
            }}
            className="p-2.5 rounded-xl bg-[#ff5e1e]/15 border border-[#ff5e1e]/30 text-[#ffb59d] hover:bg-[#ff5e1e]/25 transition-all active:scale-95"
            title="UniMall Booking"
          >
            <ShoppingBag size={16} />
          </button>
          {/* AI Assistant */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            title="AI Assistant"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>

      {/* ── MEASUREMENT HUD OVERLAY ── */}
      {isMeasuring && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/90 text-slate-950 rounded-full shadow-2xl font-semibold text-xs border border-amber-300">
            <Ruler size={14} />
            <span>
              {measurementPoints.length === 0
                ? 'Click on the map to measure real distance'
                : `${totalMeasureDistance < 1000 
                    ? `${Math.round(totalMeasureDistance)} m` 
                    : `${(totalMeasureDistance / 1000).toFixed(2)} km`
                  } (${measurementPoints.length} vertices)`}
            </span>
            {measurementPoints.length > 0 && (
              <button
                onClick={() => {
                  setMeasurementPoints([]);
                  setTotalMeasureDistance(0);
                  const map = mapRef.current?.getMap();
                  const source = map?.getSource('measurement') as any;
                  source?.setData({ type: 'FeatureCollection', features: [] });
                }}
                className="p-1 rounded-full bg-slate-950/20 hover:bg-slate-950/30 transition-colors text-slate-950"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── PANELS & MODALS ── */}
      {activePanel === 'navigation' && (
        <NavigationPanel
          origin={navOrigin}
          destination={navDestination}
          onRouteFound={handleRouteFound}
          onClearRoute={handleClearRoute}
          onClose={() => setActivePanel('none')}
          onSelectOrigin={(loc) => setNavOrigin(loc)}
          onSelectDestination={(loc) => setNavDestination(loc)}
          onSearchOrigin={() => {}}
          onSearchDestination={() => {}}
          onStartNavigation={handleStartWalkNavigation}
          isNavigating={isNavigating}
          onStopNavigation={handleStopWalkNavigation}
          gpsLocation={gpsLocation}
        />
      )}

      {/* ── LIVE FIRST-PERSON WALK MODE GPS HUD (WHEN NAVIGATING) ── */}
      {isNavigating && activeRoute && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-md w-[92%] animate-slide-down">
          <div className="bg-[#0c0e14]/95 backdrop-blur-2xl border border-[#ff5e1e]/60 rounded-2xl p-3.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#ff5e1e]/20 border border-[#ff5e1e]/40 flex items-center justify-center text-[#ff5e1e] flex-shrink-0">
                <Footprints size={20} className="animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff5e1e]">
                    WALK MODE · GPS ACTIVE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isSimulating && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Virtual Follower
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">
                  To: {activeRoute.destination_name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{formatDistance(activeRoute.total_distance_m)}</span>
                  <span>·</span>
                  <span>~{formatWalkTime(activeRoute.estimated_time_min)} walk</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Voice Mute / Unmute */}
              <button
                onClick={toggleVoiceMute}
                className={`p-2 rounded-xl border transition-all ${
                  isVoiceMuted
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
                title={isVoiceMuted ? 'Unmute Audio Voice Guide' : 'Mute Audio Voice Guide'}
              >
                {isVoiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              {/* AR Live Camera View */}
              <button
                onClick={() => setIsAROpen(true)}
                className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/30 transition-all active:scale-95 border border-indigo-400/30"
                title="Launch Live AR Camera Overlay"
              >
                <Camera size={14} />
                <span className="hidden xs:inline">AR</span>
              </button>
              {/* Exit Walk Mode */}
              <button
                onClick={handleStopWalkNavigation}
                className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 flex-shrink-0"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {activePanel === 'layers' && (
        <MapLayersPanel
          visibility={layerVisibility}
          onToggle={handleLayerToggle}
          onClose={() => setActivePanel('none')}
        />
      )}

      <BuildingInfoPanel
        building={selectedBuilding}
        coordinates={selectedCoords}
        hasIndoorMap={hasIndoorMap}
        onOpenIndoor={handleOpenIndoorMap}
        onOpenBooking={(shopId) => {
          setUniMallInitialShopId(shopId || null);
          setIsUniMallBookingOpen(true);
        }}
        onClose={() => {
          setSelectedBuilding(null);
          setSelectedCoords(null);
          mapRef.current?.clearHighlight();
        }}
        onNavigateTo={handleNavigateTo}
        onNavigateFrom={handleNavigateFrom}
      />

      {/* Multi-Floor Indoor Blueprint Modal */}
      {indoorBuildingId && (
        <IndoorModal
          buildingId={indoorBuildingId}
          onClose={() => setIndoorBuildingId(null)}
          onOpenBooking={(shopId) => {
            setUniMallInitialShopId(shopId || null);
            setIsUniMallBookingOpen(true);
          }}
        />
      )}

      {/* UniMall Booking Hub Modal */}
      <UniMallBookingModal
        isOpen={isUniMallBookingOpen}
        onClose={() => setIsUniMallBookingOpen(false)}
        initialShopId={uniMallInitialShopId}
        onNavigateToShop={(shopId) => {
          // Open Indoor blueprint for UniMall and highlight the shop
          setIsUniMallBookingOpen(false);
          setIndoorBuildingId('b-15-unimall');
        }}
      />

      {/* Campus Spatial Directory Drawer (from Stitch) */}
      <CampusDirectoryDrawer
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        initialCategory={directoryCategory}
        onSelectBuilding={(bId) => {
          const loc = LPU_LOCATIONS.find(l => l.id === bId);
          if (loc) {
            handleSearchSelect(loc.id, loc.name, loc.longitude, loc.latitude);
          }
        }}
        onOpenIndoor={(bId) => {
          handleOpenIndoorMap(bId);
        }}
      />

      {/* What's Near Me Modal (Live Proximity Radar) */}
      <WhatsNearMeModal
        isOpen={isNearMeOpen}
        onClose={() => setIsNearMeOpen(false)}
        userLocation={gpsLocation}
        onSelectLocation={(id, name, lng, lat) => {
          handleSearchSelect(id, name, lng, lat);
        }}
        onNavigateTo={(id, lng, lat, name) => {
          setNavDestination({ id, name, lng, lat });
          if (!navOrigin) {
            if (gpsLocation) {
              setNavOrigin({ id: 'user-gps', name: 'My Current Location', lng: gpsLocation.longitude, lat: gpsLocation.latitude });
            } else {
              setNavOrigin({ id: 'gate-01', name: 'Main Gate 1 (GT Road NH-44)', lng: 75.7065, lat: 31.2515 });
            }
          }
          setActivePanel('navigation');
        }}
        onRequestGPS={() => {
          startGpsTracking();
        }}
      />

      {/* Augmented Reality Live Camera Navigation Modal */}
      <ARNavigationModal
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        route={activeRoute}
        currentCoord={gpsLocation ? [gpsLocation.longitude, gpsLocation.latitude] : undefined}
        targetName={activeRoute?.destination_name || 'Destination'}
        isMuted={isVoiceMuted}
        onToggleMute={toggleVoiceMute}
      />

      {/* Live Campus E-Rickshaw & Shuttle Tracking Modal */}
      <CampusShuttleModal
        isOpen={isShuttleOpen}
        onClose={() => setIsShuttleOpen(false)}
        onTrackShuttle={(coord, name) => {
          if (engineMode === 'twin') {
            twinRef.current?.flyTo(coord[0], coord[1], 120);
          } else {
            mapRef.current?.flyTo(coord[0], coord[1], 18);
          }
        }}
      />

      {/* Real-time Crowd Density & Study Space Heatmap Modal */}
      <CampusHeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        onNavigateToZone={(zone) => {
          setNavDestination({ id: zone.locationId, name: zone.name, lng: zone.lng, lat: zone.lat });
          if (!navOrigin) {
            if (gpsLocation) {
              setNavOrigin({ id: 'user-gps', name: 'My Current Location', lng: gpsLocation.longitude, lat: gpsLocation.latitude });
            } else {
              setNavOrigin({ id: 'gate-01', name: 'Main Gate 1 (GT Road NH-44)', lng: 75.7065, lat: 31.2515 });
            }
          }
          setActivePanel('navigation');
        }}
      />

      {/* Campus Emergency Rapid SOS Modal (from Stitch) */}
      <EmergencySOSModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onNavigateToHospital={handleNavigateToHospital}
      />

      {/* Holographic Campus ID Card */}
      {isIDCardOpen && (
        <CampusIDCardModal
          profile={profile}
          onClose={() => setIsIDCardOpen(false)}
        />
      )}

      {/* Student Profile & Timetable Drawer */}
      {isProfileOpen && (
        <StudentProfileDrawer
          profile={profile}
          onUpdateAvatar={(newAvatar: AvatarConfig) => {
            setProfile(p => ({ ...p, avatar: newAvatar }));
          }}
          onNavigateToBuilding={(buildingId: string) => {
            const loc = LPU_LOCATIONS.find(l => l.id === buildingId);
            if (loc) {
              mapRef.current?.flyTo(loc.longitude, loc.latitude, 18);
              mapRef.current?.highlightBuilding(loc.id);
            }
            setIsProfileOpen(false);
          }}
          onOpenIDCard={() => {
            setIsProfileOpen(false);
            setIsIDCardOpen(true);
          }}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Campus Vendors Drawer */}
      {isVendorSheetOpen && (
        <VendorSheet
          userPosition={[0, 0, 0]}
          onSelectVendor={handleVendorSelect}
          onNavigateToVendor={handleVendorNavigate}
          onOpenBooking={(shopId) => {
            setUniMallInitialShopId(shopId || null);
            setIsUniMallBookingOpen(true);
          }}
          onClose={() => setIsVendorSheetOpen(false)}
        />
      )}

      {/* Gemini AI Assistant Drawer */}
      {isChatOpen && (
        <AIChatDrawer
          onClose={() => setIsChatOpen(false)}
          onFocusLocation={handleChatFocusLocation}
          onNavigateToLocation={handleChatNavigate}
          onOpenIndoorMap={handleOpenIndoorMap}
          locations={LPU_LOCATIONS}
        />
      )}

      {/* ── STITCH BASE CANVAS LIVE STATUS INDICATOR ── */}
      <div className="absolute bottom-4 left-6 z-20 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#0c0e14]/85 border border-white/10 backdrop-blur-md text-xs shadow-xl pointer-events-none">
        <span className="flex items-center gap-1.5 text-[#4edea3] font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
          Spatial Engine Active · LPU Phagwara Campus
        </span>
        <span className="text-white/20">|</span>
        <span className="text-slate-400 font-mono text-[11px]">Lat: 31.2536° N, Long: 75.7037° E</span>
        <span className="text-white/20">|</span>
        <span className="text-[#ffb59d] font-mono text-[11px]">600+ Acres · 50+ Blocks</span>
      </div>

      {/* GIS badge removed — info consolidated in bottom-left status bar */}
    </div>
  );
}
