'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

  // Animate camera to focus on selected location
  useEffect(() => {
    if (targetLocation && controlsRef.current) {
      const targetPos = new THREE.Vector3(targetLocation.map_x, 0, targetLocation.map_z);
      const camPos = new THREE.Vector3(
        targetLocation.map_x + 40,
        50,
        targetLocation.map_z + 45
      );

      controlsRef.current.target.copy(targetPos);
      camera.position.copy(camPos);
      controlsRef.current.update();
    }
  }, [targetLocation, camera]);

  // Recenter camera on Avatar
  useEffect(() => {
    if (recenterTrigger > 0 && controlsRef.current) {
      const avatarPos = new THREE.Vector3(avatarPosition[0], 0, avatarPosition[2]);
      const camPos = new THREE.Vector3(avatarPosition[0] + 25, 30, avatarPosition[2] + 30);
      controlsRef.current.target.copy(avatarPos);
      camera.position.copy(camPos);
      controlsRef.current.update();
    }
  }, [recenterTrigger, avatarPosition, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={10}
      maxDistance={280}
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
        camera={{ position: [0, 95, 120], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
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
