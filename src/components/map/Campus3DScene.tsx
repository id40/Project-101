'use client';

import React, { useMemo, useRef, useState } from 'react';
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

  // Trees generation around walkways and parks
  const trees = useMemo(() => {
    const list: { x: number; z: number; scale: number }[] = [];
    // Plant trees along edges
    const positions = [
      [-20, -40], [10, -50], [70, -60], [30, 20], [-10, 40], [-80, 10], [-90, -30],
      [140, -50], [130, -110], [-30, -80], [90, 80], [-120, 40], [-60, 80]
    ];
    positions.forEach(([x, z]) => {
      list.push({ x, z, scale: 0.8 + Math.random() * 0.4 });
    });
    return list;
  }, []);

  // Curve for active 3D navigation route
  const routeCurve = useMemo(() => {
    if (!activeRoute || activeRoute.coordinates.length < 2) return null;
    const points = activeRoute.coordinates.map(
      (c) => new THREE.Vector3(c[0], 0.25, c[2])
    );
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
  }, [activeRoute]);

  return (
    <group>
      {/* Sun & Ambient Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[80, 120, 50]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={400}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <directionalLight position={[-60, 80, -50]} intensity={0.4} color="#93C5FD" />

      {/* Main Ground & Green Lawns (#A7C7A1) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
      </mesh>

      {/* Campus Central Green Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[45, 64]} />
        <meshStandardMaterial color="#A7C7A1" roughness={0.8} />
      </mesh>

      {/* North & South Garden Zones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[80, 0.01, -30]} receiveShadow>
        <planeGeometry args={[70, 50]} />
        <meshStandardMaterial color="#A7C7A1" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-80, 0.01, -30]} receiveShadow>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color="#A7C7A1" roughness={0.8} />
      </mesh>

      {/* Red Running Track at Sports Complex */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-110, 0.02, -55]}>
        <ringGeometry args={[26, 32, 48]} />
        <meshStandardMaterial color="#EF4444" roughness={0.7} />
      </mesh>

      {/* Central Fountain / Water Mirror */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Campus Main Walkways & Avenues */}
      {/* North-South Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 260]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>
      {/* East-West Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[320, 10]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>
      {/* Library Promenade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, 0.02, -80]} receiveShadow>
        <planeGeometry args={[130, 8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      {/* Hostels Promenade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.02, 60]} receiveShadow>
        <planeGeometry args={[120, 8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* 3D Buildings */}
      {locations.map((loc) => {
        const isSelected = selectedLocation?.id === loc.id;
        const isHovered = hoveredId === loc.id;
        const w = loc.width || 30;
        const d = loc.depth || 25;
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
                color={isSelected ? '#635BFF' : isHovered ? '#818CF8' : '#F1F5F9'}
                roughness={0.35}
                metalness={0.1}
              />
            </mesh>

            {/* Architectural Glass Facade Strip */}
            <mesh position={[0, h / 2, d / 2 + 0.1]}>
              <planeGeometry args={[w * 0.85, h * 0.65]} />
              <meshStandardMaterial
                color={isSelected ? '#38BDF8' : '#0284C7'}
                roughness={0.1}
                metalness={0.7}
              />
            </mesh>

            {/* Roof Canopy & Trim */}
            <mesh position={[0, h + 0.4, 0]}>
              <boxGeometry args={[w + 1.2, 0.8, d + 1.2]} />
              <meshStandardMaterial color={baseColor} roughness={0.3} />
            </mesh>

            {/* Ground Selection Ring if Selected */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <ringGeometry args={[Math.max(w, d) * 0.6, Math.max(w, d) * 0.68, 32]} />
                <meshBasicMaterial color="#635BFF" side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Floating 3D Badge with Block Code & Name */}
            <Html position={[0, h + 3.5, 0]} center distanceFactor={140}>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg transition-all duration-200 pointer-events-none select-none ${
                  isSelected
                    ? 'bg-[#635BFF] text-white ring-4 ring-[#635BFF]/30 scale-110'
                    : isHovered
                    ? 'bg-slate-900 text-cyan-300 scale-105'
                    : 'bg-white/95 text-slate-800 border border-slate-200'
                }`}
              >
                <span className="font-bold text-xs bg-black/10 px-1.5 py-0.5 rounded">
                  {loc.block_code}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {loc.name}
                </span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Decorative Campus Trees */}
      {trees.map((t, idx) => (
        <group key={`tree-${idx}`} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Trunk */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.45, 2.4, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[1.8, 3.2, 8]} />
            <meshStandardMaterial color="#15803D" roughness={0.7} />
          </mesh>
          <mesh position={[0, 4.4, 0]} castShadow>
            <coneGeometry args={[1.4, 2.4, 8]} />
            <meshStandardMaterial color="#16A34A" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3D Navigation Route Glow Path */}
      {routeCurve && (
        <mesh position={[0, 0.05, 0]}>
          <tubeGeometry args={[routeCurve, 64, 0.45, 8, false]} />
          <meshBasicMaterial color="#06B6D4" />
        </mesh>
      )}

      {/* 3D Avatar (Boy or Girl) */}
      <CampusAvatar3D
        position={avatarPosition}
        heading={avatarHeading}
        isMoving={isMoving}
        config={avatarConfig}
      />
    </group>
  );
};
