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

  // Procedural tree planting along main avenues and parks
  const trees = useMemo(() => {
    const list: { x: number; z: number; scale: number }[] = [];
    const treeCoords = [
      // Along Entry Boulevard
      [180, 200], [150, 170], [140, 130], [110, 100], [80, 80],
      // Around Central Unipolis & Gardens
      [35, 10], [5, 10], [-5, -10], [35, -30], [0, 45],
      // Academic Corridor Trees
      [-45, 20], [-65, 10], [-85, -10], [-105, -30], [-55, -25],
      // Around Sports Stadium & Pool
      [-100, -65], [-120, -70], [-145, -35], [-70, -100],
      // Hostel Zones
      [-10, -105], [-35, -125], [-75, -135], [-115, -145],
      // Girls Hostels & Hospital Gardens
      [115, 60], [145, 40], [85, -55], [115, -80]
    ];
    treeCoords.forEach(([x, z]) => {
      list.push({ x, z, scale: 0.85 + (Math.sin(x * z) * 0.3) });
    });
    return list;
  }, []);

  // Curve for active 3D navigation route
  const routeCurve = useMemo(() => {
    if (!activeRoute || activeRoute.coordinates.length < 2) return null;
    const points = activeRoute.coordinates.map(
      (c) => new THREE.Vector3(c[0], 0.3, c[2])
    );
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
  }, [activeRoute]);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[120, 180, 80]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={600}
        shadow-camera-left={-280}
        shadow-camera-right={280}
        shadow-camera-top={280}
        shadow-camera-bottom={-280}
      />
      <directionalLight position={[-100, 120, -100]} intensity={0.4} color="#93C5FD" />

      {/* Main Ground Surface (#F8FAFC / Slate-100) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
      </mesh>

      {/* ========================================= */}
      {/* ROADS & INFRASTRUCTURE */}
      {/* ========================================= */}

      {/* Grand Trunk Road (NH-1) Highway Spine */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[220, 0.01, 230]} receiveShadow>
        <planeGeometry args={[60, 450]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Highway divider line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[220, 0.02, 230]}>
        <planeGeometry args={[1.5, 440]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>

      {/* Main Gate 1 Entry Monument Archway */}
      <group position={[200, 0, 215]}>
        <mesh position={[-8, 6, 0]} castShadow>
          <boxGeometry args={[3, 12, 4]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.3} />
        </mesh>
        <mesh position={[8, 6, 0]} castShadow>
          <boxGeometry args={[3, 12, 4]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.3} />
        </mesh>
        <mesh position={[0, 12, 0]} castShadow>
          <boxGeometry args={[22, 3, 5]} />
          <meshStandardMaterial color="#D97706" roughness={0.3} />
        </mesh>
      </group>

      {/* Campus Central Spine Promenade (From Gate 1 to UniMall) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.65]} position={[110, 0.02, 110]} receiveShadow>
        <planeGeometry args={[14, 280]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>

      {/* Academic Spine Avenue (From UniMall through Blocks 25 to 38) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[-40, 0.02, -10]} receiveShadow>
        <planeGeometry args={[14, 180]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>

      {/* West Ring Road (Connecting Heavy Engg, Hostels & Sports) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.02, -100]} receiveShadow>
        <planeGeometry args={[220, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* ========================================= */}
      {/* LANDMARK FEATURES: STADIUM, POOL, UNIPOLIS */}
      {/* ========================================= */}

      {/* Cricket Stadium Turf Oval (North-West) */}
      <group position={[-120, 0, -40]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1.25, 1, 1]}>
          <circleGeometry args={[28, 48]} />
          <meshStandardMaterial color="#16A34A" roughness={0.8} />
        </mesh>
        {/* Synthetic 400m Running Track Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} scale={[1.25, 1, 1]}>
          <ringGeometry args={[26, 31, 48]} />
          <meshStandardMaterial color="#EF4444" roughness={0.7} />
        </mesh>
        {/* Cricket Pitch Strip */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[4, 16]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.9} />
        </mesh>
      </group>

      {/* Olympic Swimming Pool Complex */}
      <group position={[-80, 0, -85]}>
        {/* Blue Water Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[28, 18]} />
          <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Concrete Border Deck */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[32, 22]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
        </mesh>
      </group>

      {/* Baldev Raj Mittal Unipolis Canopy Structure */}
      <group position={[20, 0, -10]}>
        {/* Canopy Curved Roof Structure */}
        <mesh position={[0, 14, 0]}>
          <cylinderGeometry args={[26, 28, 2, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Supporting Pillars */}
        <mesh position={[-24, 7, -10]}><cylinderGeometry args={[0.6, 0.6, 14]} /><meshStandardMaterial color="#635BFF" /></mesh>
        <mesh position={[24, 7, -10]}><cylinderGeometry args={[0.6, 0.6, 14]} /><meshStandardMaterial color="#635BFF" /></mesh>
        <mesh position={[-24, 7, 10]}><cylinderGeometry args={[0.6, 0.6, 14]} /><meshStandardMaterial color="#635BFF" /></mesh>
        <mesh position={[24, 7, 10]}><cylinderGeometry args={[0.6, 0.6, 14]} /><meshStandardMaterial color="#635BFF" /></mesh>
      </group>

      {/* ========================================= */}
      {/* 3D BUILDINGS (ACADEMIC, RESIDENTIAL, COMMERCIAL) */}
      {/* ========================================= */}
      {locations.map((loc) => {
        const isSelected = selectedLocation?.id === loc.id;
        const isHovered = hoveredId === loc.id;
        const w = loc.width || 32;
        const d = loc.depth || 24;
        const h = loc.height || 18;
        const baseColor = loc.color || '#635BFF';

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
            {/* Building Main Body */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial
                color={isSelected ? '#635BFF' : isHovered ? '#818CF8' : '#F8FAFC'}
                roughness={0.35}
                metalness={0.08}
              />
            </mesh>

            {/* Architectural Glass Facade Panel */}
            <mesh position={[0, h / 2, d / 2 + 0.12]}>
              <planeGeometry args={[w * 0.82, h * 0.68]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : '#0369A1'}
                roughness={0.15}
                metalness={0.8}
              />
            </mesh>

            {/* Roof Canopy & Brand Accent Trim */}
            <mesh position={[0, h + 0.45, 0]}>
              <boxGeometry args={[w + 1.4, 0.9, d + 1.4]} />
              <meshStandardMaterial color={baseColor} roughness={0.3} />
            </mesh>

            {/* Ground Selection Ring */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <ringGeometry args={[Math.max(w, d) * 0.62, Math.max(w, d) * 0.72, 32]} />
                <meshBasicMaterial color="#635BFF" side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Floating 3D Badge with Block Code & Name */}
            <Html position={[0, h + 3.8, 0]} center distanceFactor={160}>
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg transition-all duration-200 pointer-events-none select-none ${
                  isSelected
                    ? 'bg-[#635BFF] text-white ring-4 ring-[#635BFF]/30 scale-110'
                    : isHovered
                    ? 'bg-slate-900 text-cyan-300 scale-105'
                    : 'bg-white/95 text-slate-800 border border-slate-200'
                }`}
              >
                <span className="font-extrabold text-xs bg-black/10 px-1.5 py-0.5 rounded">
                  {loc.block_code}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {loc.name.length > 20 ? loc.name.substring(0, 18) + '…' : loc.name}
                </span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Decorative Campus Trees */}
      {trees.map((t, idx) => (
        <group key={`tree-${idx}`} position={[t.x, 0, t.z]} scale={t.scale}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.45, 2.4, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[1.8, 3.2, 8]} />
            <meshStandardMaterial color="#15803D" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3D Glowing Walking Route Tube */}
      {routeCurve && (
        <mesh position={[0, 0.08, 0]}>
          <tubeGeometry args={[routeCurve, 96, 0.5, 8, false]} />
          <meshBasicMaterial color="#06B6D4" />
        </mesh>
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
