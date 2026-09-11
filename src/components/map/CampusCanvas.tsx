'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import { CampusLocation, NavigationRoute } from '@/types/campus';
import { AvatarConfig } from '@/types/profile';
import { Campus3DScene } from './Campus3DScene';

interface CameraControllerProps {
  targetLocation: CampusLocation | null;
  recenterTrigger: number;
  avatarPosition: [number, number, number];
}

function CameraController({ targetLocation, recenterTrigger, avatarPosition }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsType>(null);

  // Smooth camera target positions
  const desiredTarget = useRef<THREE.Vector3>(new THREE.Vector3(avatarPosition[0], 0, avatarPosition[2]));
  const desiredCamPos = useRef<THREE.Vector3>(new THREE.Vector3(avatarPosition[0] + 35, 45, avatarPosition[2] + 45));

  // Focus on selected location
  useEffect(() => {
    if (targetLocation && controlsRef.current) {
      desiredTarget.current.set(targetLocation.map_x, 0, targetLocation.map_z);
      desiredCamPos.current.set(
        targetLocation.map_x + 40,
        Math.max(40, (targetLocation.height || 18) * 2.2),
        targetLocation.map_z + 45
      );
    }
  }, [targetLocation]);

  // Recenter camera on Avatar
  useEffect(() => {
    if (recenterTrigger > 0 && controlsRef.current) {
      desiredTarget.current.set(avatarPosition[0], 0, avatarPosition[2]);
      desiredCamPos.current.set(avatarPosition[0] + 30, 35, avatarPosition[2] + 35);
    }
  }, [recenterTrigger, avatarPosition]);

  // Smooth lerp camera on each frame
  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const lerpSpeed = Math.min(1, delta * 3.5);

    controlsRef.current.target.lerp(desiredTarget.current, lerpSpeed);
    camera.position.lerp(desiredCamPos.current, lerpSpeed);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={12}
      maxDistance={350}
    />
  );
}

interface CampusCanvasProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  avatarPosition: [number, number, number];
  avatarHeading: number;
  isMoving: boolean;
  avatarConfig: AvatarConfig;
  activeRoute: NavigationRoute | null;
  recenterTrigger: number;
}

export const CampusCanvas: React.FC<CampusCanvasProps> = (props) => {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [180, 85, 230], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
        {/* Realistic Sky and Atmospheric Fog */}
        <Sky
          distance={450000}
          sunPosition={[150, 60, 100]}
          inclination={0.55}
          azimuth={0.25}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
          rayleigh={0.6}
          turbidity={6}
        />
        <fog attach="fog" args={['#BAE6FD', 180, 520]} />

        <CameraController
          targetLocation={props.selectedLocation}
          recenterTrigger={props.recenterTrigger}
          avatarPosition={props.avatarPosition}
        />

        <Campus3DScene {...props} />
      </Canvas>
    </div>
  );
};
