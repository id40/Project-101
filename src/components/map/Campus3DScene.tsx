'use client';

import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { CampusLocation, NavigationRoute } from '@/types/campus';
import { AvatarConfig } from '@/types/profile';
import { CampusAvatar3D } from '@/components/avatar/CampusAvatar3D';

interface Campus3DSceneProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  avatarPosition: [number, number, number];
  avatarHeading: number;
  isMoving: boolean;
  avatarConfig: AvatarConfig;
  activeRoute: NavigationRoute | null;
}

// Major landmarks that get minimalist tier-1 pin labels
const TIER1_LANDMARKS = new Set([
  'gate-01',
  'unipolis',
  'b-15-unimall',
  'b-33-34',
  'b-36-38',
  'cricket-stadium',
  'olympic-pool',
  'bh-1-2',
  'gh-cluster',
  'uni-hospital'
]);

export const Campus3DScene: React.FC<Campus3DSceneProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  avatarPosition,
  avatarHeading,
  isMoving,
  avatarConfig,
  activeRoute,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Procedural tree planting along avenues, parks, and around hostels
  const trees = useMemo(() => {
    const list: { x: number; z: number; scale: number; type: 'round' | 'conical' }[] = [];
    const treeCoords: [number, number, 'round' | 'conical'][] = [
      // Entry Avenue Trees
      [190, 195, 'round'], [175, 180, 'conical'], [160, 160, 'round'], [145, 140, 'conical'], [130, 120, 'round'],
      [175, 210, 'round'], [155, 190, 'conical'], [140, 170, 'round'], [120, 145, 'conical'],
      // Unipolis Gardens & Central Promenade
      [35, 15, 'round'], [5, 15, 'round'], [-5, -15, 'conical'], [35, -35, 'round'], [5, 45, 'conical'],
      [20, 48, 'round'], [45, 0, 'round'], [45, -20, 'conical'],
      // Academic Avenue & Central Library Park
      [-45, 25, 'round'], [-65, 15, 'conical'], [-85, -5, 'round'], [-105, -25, 'conical'], [-55, -20, 'round'],
      [-40, -45, 'conical'], [-90, -45, 'round'], [-50, 5, 'conical'],
      // Sports Complex & Swimming Pool Perimeter
      [-100, -70, 'conical'], [-125, -75, 'round'], [-150, -40, 'conical'], [-70, -105, 'round'],
      [-140, -15, 'round'], [-100, -15, 'conical'],
      // Hostels Green Zones (West)
      [-15, -115, 'round'], [-40, -130, 'conical'], [-80, -140, 'round'], [-120, -150, 'conical'],
      [-30, -90, 'round'], [-60, -115, 'conical'],
      // Girls Hostels & Uni-Hospital Gardens (East)
      [115, 65, 'round'], [145, 45, 'conical'], [90, -50, 'round'], [120, -75, 'conical'],
      [80, 45, 'round'], [140, 10, 'conical'], [100, -25, 'round']
    ];

    treeCoords.forEach(([x, z, type]) => {
      list.push({ x, z, scale: 0.9 + (Math.sin(x * 13 + z) * 0.25), type });
    });
    return list;
  }, []);

  // Curve for active 3D navigation route
  const routeCurve = useMemo(() => {
    if (!activeRoute || activeRoute.coordinates.length < 2) return null;
    const points = activeRoute.coordinates.map(
      (c) => new THREE.Vector3(c[0], 0.45, c[2])
    );
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.15);
  }, [activeRoute]);

  // Find location object helper
  const locMap = useMemo(() => {
    const m = new Map<string, CampusLocation>();
    locations.forEach((l) => m.set(l.id, l));
    return m;
  }, [locations]);

  return (
    <group>
      {/* ========================================= */}
      {/* ATMOSPHERIC LIGHTING */}
      {/* ========================================= */}
      <ambientLight intensity={0.65} color="#F1F5F9" />
      <hemisphereLight args={['#BAE6FD', '#334155', 0.55]} />
      <directionalLight
        position={[150, 180, 90]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={700}
        shadow-camera-left={-350}
        shadow-camera-right={350}
        shadow-camera-top={350}
        shadow-camera-bottom={-350}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-120, 100, -120]} intensity={0.35} color="#93C5FD" />

      {/* ========================================= */}
      {/* BASE GROUND & LANDSCAPING COURTYARDS */}
      {/* ========================================= */}

      {/* 1. Main Lush Campus Green Grass Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color="#166534" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* 2. Central Academic District Paved Plaza (Unipolis to CSE) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, -0.04, 10]} receiveShadow>
        <planeGeometry args={[260, 200]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
      </mesh>

      {/* 3. UniMall & Commercial Promenade Plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -0.035, 20]} receiveShadow>
        <planeGeometry args={[140, 120]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.75} />
      </mesh>

      {/* 4. Hostels Residential Sector Courtyards */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-60, -0.04, -120]} receiveShadow>
        <planeGeometry args={[200, 90]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, -0.04, 40]} receiveShadow>
        <planeGeometry args={[90, 110]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>

      {/* ========================================= */}
      {/* ROADS & INFRASTRUCTURE */}
      {/* ========================================= */}

      {/* Grand Trunk Road (NH-1) Highway Spine */}
      <group position={[225, 0, 230]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[65, 480]} />
          <meshStandardMaterial color="#1E293B" roughness={0.75} />
        </mesh>
        {/* Road shoulders / concrete curbs */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-32, 0.03, 0]}>
          <planeGeometry args={[2, 480]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[32, 0.03, 0]}>
          <planeGeometry args={[2, 480]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        {/* Yellow dashed center divider */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <planeGeometry args={[1.5, 470]} />
          <meshBasicMaterial color="#FBBF24" />
        </mesh>
      </group>

      {/* Main Gate 1 Welcome Promenade (From Gate 1 to UniMall) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.65]} position={[110, 0.025, 110]} receiveShadow>
        <planeGeometry args={[18, 280]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>

      {/* Academic Spine Avenue (From UniMall through Blocks 25 to 38) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[-40, 0.025, -10]} receiveShadow>
        <planeGeometry args={[16, 210]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>

      {/* West Ring Road (Connecting Heavy Engg, Hostels & Sports) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.025, -100]} receiveShadow>
        <planeGeometry args={[240, 14]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* ========================================= */}
      {/* CUSTOM BESPOKE LANDMARKS (DEDUPLICATED) */}
      {/* ========================================= */}

      {/* 1. Main Gate 1 Entrance Monument Archway */}
      {(() => {
        const loc = locMap.get('gate-01');
        const isSelected = selectedLocation?.id === 'gate-01';
        const isHovered = hoveredId === 'gate-01';

        return (
          <group
            position={[200, 0, 215]}
            onClick={(e) => {
              e.stopPropagation();
              if (loc) onSelectLocation(loc);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId('gate-01');
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredId(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Monument Left Pillar */}
            <mesh position={[-9, 7, 0]} castShadow>
              <boxGeometry args={[4, 14, 5]} />
              <meshStandardMaterial color={isSelected ? '#635BFF' : '#F59E0B'} roughness={0.25} />
            </mesh>
            {/* Monument Right Pillar */}
            <mesh position={[9, 7, 0]} castShadow>
              <boxGeometry args={[4, 14, 5]} />
              <meshStandardMaterial color={isSelected ? '#635BFF' : '#F59E0B'} roughness={0.25} />
            </mesh>
            {/* Monument Header Beam */}
            <mesh position={[0, 14.5, 0]} castShadow>
              <boxGeometry args={[26, 3.5, 6]} />
              <meshStandardMaterial color={isSelected ? '#4F46E5' : '#D97706'} roughness={0.25} />
            </mesh>
            {/* Welcome Signboard Panel */}
            <mesh position={[0, 14.5, 3.1]}>
              <planeGeometry args={[22, 2.4]} />
              <meshStandardMaterial color="#1E1B4B" />
            </mesh>
            {/* Security Guard Booths */}
            <mesh position={[-16, 2.5, 0]} castShadow>
              <boxGeometry args={[6, 5, 6]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
            <mesh position={[16, 2.5, 0]} castShadow>
              <boxGeometry args={[6, 5, 6]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>

            {/* Landmark Label */}
            {(isSelected || isHovered || TIER1_LANDMARKS.has('gate-01')) && (
              <Html position={[0, 18.5, 0]} center distanceFactor={170}>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-black shadow-2xl transition-all duration-200 pointer-events-none select-none flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#635BFF] text-white border-white scale-110'
                      : isHovered
                      ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105'
                      : 'bg-slate-950/85 text-amber-400 border-amber-500/40 backdrop-blur'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>GATE 1 (NH-1)</span>
                </div>
              </Html>
            )}
          </group>
        );
      })()}

      {/* 2. Baldev Raj Mittal Unipolis Amphitheater Canopy */}
      {(() => {
        const loc = locMap.get('unipolis');
        const isSelected = selectedLocation?.id === 'unipolis';
        const isHovered = hoveredId === 'unipolis';

        return (
          <group
            position={[20, 0, -10]}
            onClick={(e) => {
              e.stopPropagation();
              if (loc) onSelectLocation(loc);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId('unipolis');
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredId(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Amphitheater Stepped Tier Seating Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]} receiveShadow>
              <circleGeometry args={[26, 48]} />
              <meshStandardMaterial color={isSelected ? '#635BFF' : '#475569'} roughness={0.8} />
            </mesh>
            {/* Grand Concert Stage Platform */}
            <mesh position={[0, 1.2, -14]} castShadow receiveShadow>
              <boxGeometry args={[28, 1.8, 10]} />
              <meshStandardMaterial color="#1E293B" roughness={0.4} />
            </mesh>
            {/* Canopy Translucent Tensile Vault */}
            <mesh position={[0, 16, 0]}>
              <cylinderGeometry args={[28, 30, 2.5, 36, 1, false, 0, Math.PI]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : '#F8FAFC'}
                roughness={0.15}
                metalness={0.35}
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
              />
            </mesh>
            {/* Heavy Structural Support Arches */}
            <mesh position={[-27, 8, -12]}><cylinderGeometry args={[0.8, 0.8, 16]} /><meshStandardMaterial color="#635BFF" metalness={0.8} /></mesh>
            <mesh position={[27, 8, -12]}><cylinderGeometry args={[0.8, 0.8, 16]} /><meshStandardMaterial color="#635BFF" metalness={0.8} /></mesh>
            <mesh position={[-27, 8, 12]}><cylinderGeometry args={[0.8, 0.8, 16]} /><meshStandardMaterial color="#635BFF" metalness={0.8} /></mesh>
            <mesh position={[27, 8, 12]}><cylinderGeometry args={[0.8, 0.8, 16]} /><meshStandardMaterial color="#635BFF" metalness={0.8} /></mesh>

            {/* Landmark Label */}
            {(isSelected || isHovered || TIER1_LANDMARKS.has('unipolis')) && (
              <Html position={[0, 20.5, 0]} center distanceFactor={170}>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-black shadow-2xl transition-all duration-200 pointer-events-none select-none flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#635BFF] text-white border-white scale-110'
                      : isHovered
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 scale-105'
                      : 'bg-slate-950/85 text-cyan-300 border-cyan-500/40 backdrop-blur'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>UNIPOLIS AMPHITHEATRE</span>
                </div>
              </Html>
            )}
          </group>
        );
      })()}

      {/* 3. Main Cricket & Football Stadium Oval */}
      {(() => {
        const loc = locMap.get('cricket-stadium');
        const isSelected = selectedLocation?.id === 'cricket-stadium';
        const isHovered = hoveredId === 'cricket-stadium';

        return (
          <group
            position={[-120, 0, -40]}
            onClick={(e) => {
              e.stopPropagation();
              if (loc) onSelectLocation(loc);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId('cricket-stadium');
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredId(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Lush Green Outfield Turf */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[1.3, 1, 1]}>
              <circleGeometry args={[30, 48]} />
              <meshStandardMaterial color={isSelected ? '#22C55E' : '#15803D'} roughness={0.85} />
            </mesh>
            {/* Synthetic 400m Running Track Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} scale={[1.3, 1, 1]}>
              <ringGeometry args={[29, 35, 48]} />
              <meshStandardMaterial color="#DC2626" roughness={0.7} />
            </mesh>
            {/* White Track Lane Striping */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]} scale={[1.3, 1, 1]}>
              <ringGeometry args={[32, 32.2, 48]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Cricket Center Pitch Strip */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <planeGeometry args={[4.5, 18]} />
              <meshStandardMaterial color="#FEF08A" roughness={0.95} />
            </mesh>
            {/* Stadium Pavilion Seating Grandstand */}
            <mesh position={[0, 4, -36]} castShadow>
              <boxGeometry args={[44, 8, 10]} />
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>

            {/* Landmark Label */}
            {(isSelected || isHovered || TIER1_LANDMARKS.has('cricket-stadium')) && (
              <Html position={[0, 10, 0]} center distanceFactor={170}>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-black shadow-2xl transition-all duration-200 pointer-events-none select-none flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#635BFF] text-white border-white scale-110'
                      : isHovered
                      ? 'bg-emerald-400 text-slate-950 border-emerald-300 scale-105'
                      : 'bg-slate-950/85 text-emerald-400 border-emerald-500/40 backdrop-blur'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>CRICKET & ATHLETIC STADIUM</span>
                </div>
              </Html>
            )}
          </group>
        );
      })()}

      {/* 4. Olympic Swimming Pool Complex */}
      {(() => {
        const loc = locMap.get('olympic-pool');
        const isSelected = selectedLocation?.id === 'olympic-pool';
        const isHovered = hoveredId === 'olympic-pool';

        return (
          <group
            position={[-80, 0, -85]}
            onClick={(e) => {
              e.stopPropagation();
              if (loc) onSelectLocation(loc);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId('olympic-pool');
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredId(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Olympic Water Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <planeGeometry args={[30, 18]} />
              <meshStandardMaterial color={isSelected ? '#38BDF8' : '#0284C7'} roughness={0.08} metalness={0.9} />
            </mesh>
            {/* Pool Deck Concrete Border */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
              <planeGeometry args={[36, 24]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
            </mesh>
            {/* Diving Board Tower */}
            <mesh position={[-16, 5, 0]} castShadow>
              <boxGeometry args={[2, 10, 3]} />
              <meshStandardMaterial color="#64748B" roughness={0.3} />
            </mesh>

            {/* Landmark Label */}
            {(isSelected || isHovered || TIER1_LANDMARKS.has('olympic-pool')) && (
              <Html position={[0, 8, 0]} center distanceFactor={170}>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-black shadow-2xl transition-all duration-200 pointer-events-none select-none flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#635BFF] text-white border-white scale-110'
                      : isHovered
                      ? 'bg-sky-400 text-slate-950 border-sky-300 scale-105'
                      : 'bg-slate-950/85 text-sky-400 border-sky-500/40 backdrop-blur'
                  }`}
                >
                  <span>OLYMPIC POOL (50M)</span>
                </div>
              </Html>
            )}
          </group>
        );
      })()}

      {/* ========================================= */}
      {/* CAMPUS BUILDINGS (ACADEMIC, RESIDENTIAL, COMMERCIAL) */}
      {/* ========================================= */}
      {locations.map((loc) => {
        // Skip custom procedural landmarks to prevent double-mesh clashing
        if (['gate-01', 'unipolis', 'cricket-stadium', 'olympic-pool'].includes(loc.id)) {
          return null;
        }

        const isSelected = selectedLocation?.id === loc.id;
        const isHovered = hoveredId === loc.id;
        const w = loc.width || 32;
        const d = loc.depth || 24;
        const h = loc.height || 18;
        const baseColor = loc.color || '#635BFF';

        const isAcademic = loc.type === 'academic';
        const isHostel = loc.type === 'hostel';
        const isCommerce = loc.id === 'b-15-unimall';
        const isTier1 = TIER1_LANDMARKS.has(loc.id);

        return (
          <group
            key={loc.id}
            position={[loc.map_x, 0, loc.map_z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectLocation(loc);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(loc.id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredId(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Ground Pedestal / Foundation Slab */}
            <mesh position={[0, 0.4, 0]} receiveShadow>
              <boxGeometry args={[w + 2, 0.8, d + 2]} />
              <meshStandardMaterial color="#64748B" roughness={0.9} />
            </mesh>

            {/* Main Building Structure */}
            <mesh position={[0, h / 2 + 0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial
                color={
                  isSelected
                    ? '#635BFF'
                    : isHovered
                    ? '#818CF8'
                    : isHostel
                    ? '#E2E8F0'
                    : '#F8FAFC'
                }
                roughness={isAcademic ? 0.3 : 0.6}
                metalness={isAcademic ? 0.15 : 0.05}
              />
            </mesh>

            {/* Architectural Glass Curtain Wall (Front Facade) */}
            <mesh position={[0, h / 2 + 0.4, d / 2 + 0.14]}>
              <planeGeometry args={[w * 0.86, h * 0.72]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : isCommerce ? '#0284C7' : '#0369A1'}
                roughness={0.1}
                metalness={0.85}
              />
            </mesh>

            {/* Architectural Glass Curtain Wall (Rear Facade) */}
            <mesh position={[0, h / 2 + 0.4, -d / 2 - 0.14]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[w * 0.86, h * 0.72]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : '#0369A1'}
                roughness={0.1}
                metalness={0.85}
              />
            </mesh>

            {/* Roof Parapet & University Brand Accent Trim */}
            <mesh position={[0, h + 0.85, 0]}>
              <boxGeometry args={[w + 1.2, 0.9, d + 1.2]} />
              <meshStandardMaterial color={baseColor} roughness={0.25} />
            </mesh>

            {/* Rooftop Mechanical Penthouse / HVAC Unit */}
            <mesh position={[0, h + 2.2, 0]} castShadow>
              <boxGeometry args={[w * 0.4, 1.8, d * 0.35]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.7} />
            </mesh>

            {/* Ground Selection Spotlight Ring */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
                <ringGeometry args={[Math.max(w, d) * 0.65, Math.max(w, d) * 0.78, 36]} />
                <meshBasicMaterial color="#635BFF" side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Smart LOD Badge: Shown on Select, Hover, or for Tier-1 Key Hubs */}
            {(isSelected || isHovered || isTier1) && (
              <Html position={[0, h + 4.2, 0]} center distanceFactor={160}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-2xl transition-all duration-200 pointer-events-none select-none border ${
                    isSelected
                      ? 'bg-[#635BFF] text-white border-white scale-110 shadow-[#635BFF]/50'
                      : isHovered
                      ? 'bg-slate-950 text-cyan-300 border-cyan-400 scale-105'
                      : 'bg-slate-950/85 text-slate-100 border-slate-700/80 backdrop-blur'
                  }`}
                >
                  <span
                    className={`font-black text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#635BFF] text-white'
                    }`}
                  >
                    {loc.block_code}
                  </span>
                  <span className="text-[11px] font-bold whitespace-nowrap">
                    {loc.name.length > 22 ? loc.name.substring(0, 20) + '…' : loc.name}
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Decorative Campus Trees */}
      {trees.map((t, idx) => (
        <group key={`tree-${idx}`} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Tree Trunk */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.5, 2.8, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Foliage Clusters */}
          {t.type === 'conical' ? (
            <mesh position={[0, 3.8, 0]} castShadow>
              <coneGeometry args={[2.2, 4.2, 8]} />
              <meshStandardMaterial color="#15803D" roughness={0.7} />
            </mesh>
          ) : (
            <group position={[0, 3.5, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[2.0, 8, 8]} />
                <meshStandardMaterial color="#16A34A" roughness={0.75} />
              </mesh>
              <mesh position={[0, 1.2, 0]} castShadow>
                <sphereGeometry args={[1.4, 8, 8]} />
                <meshStandardMaterial color="#22C55E" roughness={0.7} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* 3D Glowing Walking Route Tube */}
      {routeCurve && (
        <group>
          <mesh position={[0, 0.15, 0]}>
            <tubeGeometry args={[routeCurve, 128, 0.7, 8, false]} />
            <meshBasicMaterial color="#06B6D4" />
          </mesh>
        </group>
      )}

      {/* 3D Character Avatar (Boy or Girl) */}
      <CampusAvatar3D
        position={avatarPosition}
        heading={avatarHeading}
        isMoving={isMoving}
        config={avatarConfig}
      />
    </group>
  );
};
