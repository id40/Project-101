'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarConfig } from '@/types/profile';

interface CampusAvatarProps {
  position: [number, number, number]; // [x, y, z]
  heading: number; // in radians
  isMoving: boolean;
  config: AvatarConfig;
  isStreetView?: boolean;
}

// ==========================================
// 3D GUY MODEL COMPONENT (Ivan_1304)
// ==========================================
function IvanGuyModel({
  clothColor,
  isMoving,
  scaleFactor,
}: {
  clothColor: string;
  isMoving: boolean;
  scaleFactor: number;
}) {
  const { scene } = useGLTF('/models/ivan.glb');
  const modelRef = useRef<THREE.Group>(null);

  // Clone scene to allow instance-specific transforms and materials
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = new THREE.MeshStandardMaterial({
          color: clothColor || '#635BFF',
          roughness: 0.55,
          metalness: 0.15,
        });
      }
    });
    return c;
  }, [scene, clothColor]);

  useFrame((state) => {
    if (!modelRef.current) return;

    // Walking stride bob
    if (isMoving) {
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 14) * 0.08 * scaleFactor;
      modelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 7) * 0.04;
    } else {
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 2.5) * 0.02 * scaleFactor;
      modelRef.current.rotation.z = 0;
    }
  });

  // Base human scale: 1884.64 mm height -> 0.001 = 1.88m height
  const baseScale = 0.001 * scaleFactor;

  return (
    <group ref={modelRef} scale={[baseScale, baseScale, baseScale]}>
      <primitive object={clone} />
    </group>
  );
}

// ==========================================
// PROCEDURAL FALLBACK / GIRL AVATAR MODEL
// ==========================================
function ProceduralStudentModel({
  isBoy,
  clothColor,
  hairColor,
  isMoving,
  scaleFactor,
}: {
  isBoy: boolean;
  clothColor: string;
  hairColor: string;
  isMoving: boolean;
  scaleFactor: number;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const skinColor = '#FBD38D';

  useFrame((state) => {
    if (!bodyRef.current) return;
    if (isMoving) {
      bodyRef.current.position.y = (Math.sin(state.clock.elapsedTime * 12) * 0.12 + 0.9) * scaleFactor;
      bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.06;
    } else {
      bodyRef.current.position.y = (Math.sin(state.clock.elapsedTime * 2) * 0.02 + 0.9) * scaleFactor;
      bodyRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={bodyRef} scale={[scaleFactor, scaleFactor, scaleFactor]}>
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
        <mesh position={[0, 1.25, -0.05]}>
          <boxGeometry args={[0.55, 0.25, 0.55]} />
          <meshStandardMaterial color={hairColor} roughness={0.8} />
        </mesh>
      ) : (
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

      {/* Legs */}
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

      {/* Backpack */}
      <mesh position={[0, 0.4, -0.3]} castShadow>
        <boxGeometry args={[0.48, 0.6, 0.22]} />
        <meshStandardMaterial color="#0F172A" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ==========================================
// MAIN CAMPUS AVATAR 3D
// ==========================================
export const CampusAvatar3D: React.FC<CampusAvatarProps> = ({
  position,
  heading,
  isMoving,
  config,
  isStreetView = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef<number>(isStreetView ? 2.2 : 1.1);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0], 0.18);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2], 0.18);
    groupRef.current.position.y = position[1];

    // Smooth rotation towards heading (Pokemon Go street direction)
    const currentRot = groupRef.current.rotation.y;
    let diff = (heading - currentRot) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    groupRef.current.rotation.y = currentRot + diff * Math.min(1, delta * 8);

    // Smooth hero scale interpolation (Pokemon Go scale-up)
    const targetScale = isStreetView ? 2.2 : 1.1;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, Math.min(1, delta * 4));
  });

  const isBoy = config.gender === 'boy';
  const clothColor = config.clothingColor || (isBoy ? '#635BFF' : '#EC4899');
  const hairColor = config.hairColor || '#1E293B';

  return (
    <group ref={groupRef} position={position}>
      {/* Pokemon Go Style Ground Radar Pulse Rings */}
      <group position={[0, 0.04, 0]}>
        {/* Inner Core Pulse Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9 * scaleRef.current, 1.25 * scaleRef.current, 36]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>

        {/* Outer Radar Exploration Perimeter */}
        {isStreetView && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <ringGeometry args={[2.0 * scaleRef.current, 2.3 * scaleRef.current, 36]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Forward Heading Navigation Chevron / Beacon */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 1.55 * scaleRef.current]}>
          <coneGeometry args={[0.38 * scaleRef.current, 0.75 * scaleRef.current, 16]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* Avatar Model: 3D Guy Model for Boy, Procedural for Girl */}
      {isBoy ? (
        <Suspense
          fallback={
            <ProceduralStudentModel
              isBoy={true}
              clothColor={clothColor}
              hairColor={hairColor}
              isMoving={isMoving}
              scaleFactor={scaleRef.current}
            />
          }
        >
          <IvanGuyModel
            clothColor={clothColor}
            isMoving={isMoving}
            scaleFactor={scaleRef.current}
          />
        </Suspense>
      ) : (
        <ProceduralStudentModel
          isBoy={false}
          clothColor={clothColor}
          hairColor={hairColor}
          isMoving={isMoving}
          scaleFactor={scaleRef.current}
        />
      )}
    </group>
  );
};

// Pre-warm the 3D Guy GLTF in cache
useGLTF.preload('/models/ivan.glb');
