'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarConfig } from '@/types/profile';

interface CampusAvatarProps {
  position: [number, number, number]; // [x, y, z]
  heading: number; // in radians
  isMoving: boolean;
  config: AvatarConfig;
}

export const CampusAvatar3D: React.FC<CampusAvatarProps> = ({
  position,
  heading,
  isMoving,
  config,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation (lerp)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0], 0.15);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2], 0.15);
    groupRef.current.position.y = position[1];

    // Smooth rotation towards heading
    const currentRot = groupRef.current.rotation.y;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, heading, 0.15);

    // Walking bob animation
    if (bodyRef.current) {
      if (isMoving) {
        bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 12) * 0.15 + 0.9;
        bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.08;
      } else {
        bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03 + 0.9;
        bodyRef.current.rotation.z = 0;
      }
    }
  });

  const isBoy = config.gender === 'boy';
  const clothColor = config.clothingColor || (isBoy ? '#635BFF' : '#EC4899');
  const hairColor = config.hairColor || '#1E293B';
  const skinColor = '#FBD38D';

  return (
    <group ref={groupRef} position={position}>
      {/* Ground Location Pulse Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1.1, 32]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Heading Directional Arrow Cone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.06, 1.4]}>
        <coneGeometry args={[0.35, 0.7, 16]} />
        <meshBasicMaterial color="#06B6D4" />
      </mesh>

      {/* Animated Character Body */}
      <group ref={bodyRef} position={[0, 0.9, 0]}>
        {/* Torso / Hoodie */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.65, 0.75, 0.45]} />
          <meshStandardMaterial color={clothColor} roughness={0.4} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </mesh>

        {/* Hair Styling based on Gender */}
        {isBoy ? (
          // Boy Modern Spiky / Crew Cut Hair
          <mesh position={[0, 1.25, -0.05]}>
            <boxGeometry args={[0.55, 0.25, 0.55]} />
            <meshStandardMaterial color={hairColor} roughness={0.8} />
          </mesh>
        ) : (
          // Girl Ponytail / Long Hair
          <group position={[0, 1.1, 0]}>
            <mesh position={[0, 0.15, -0.05]}>
              <boxGeometry args={[0.58, 0.35, 0.58]} />
              <meshStandardMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, -0.32]}>
              <cylinderGeometry args={[0.12, 0.18, 0.6, 16]} />
              <meshStandardMaterial color={hairColor} roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* Legs / Jeans */}
        <mesh position={[-0.18, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.75, 0.25]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
        <mesh position={[0.18, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.75, 0.25]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>

        {/* Shoes */}
        <mesh position={[-0.18, -0.75, 0.08]}>
          <boxGeometry args={[0.24, 0.15, 0.38]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.18, -0.75, 0.08]}>
          <boxGeometry args={[0.24, 0.15, 0.38]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>

        {/* Student Backpack */}
        <mesh position={[0, 0.4, -0.3]} castShadow>
          <boxGeometry args={[0.48, 0.6, 0.22]} />
          <meshStandardMaterial color="#0F172A" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
