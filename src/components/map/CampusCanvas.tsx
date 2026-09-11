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
  avatarHeading: number;
  cameraMode: 'orbit' | 'street';
}

function CameraController({
  targetLocation,
  recenterTrigger,
  avatarPosition,
  avatarHeading,
  cameraMode,
}: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsType>(null);
  const isTransitioning = useRef<boolean>(false);
  const isUserInteracting = useRef<boolean>(false);

  // Smooth camera target positions for Orbit mode
  const desiredTarget = useRef<THREE.Vector3>(new THREE.Vector3(avatarPosition[0], 0, avatarPosition[2]));
  const desiredCamPos = useRef<THREE.Vector3>(new THREE.Vector3(avatarPosition[0] + 35, 45, avatarPosition[2] + 45));

  // Switch to Street View Chase Cam
  useEffect(() => {
    if (cameraMode === 'street') {
      isUserInteracting.current = false;
      isTransitioning.current = true;
    } else {
      // Switched back to drone/orbit: smoothly lift camera to overhead view
      if (controlsRef.current) {
        desiredTarget.current.set(avatarPosition[0], 0, avatarPosition[2]);
        desiredCamPos.current.set(avatarPosition[0] + 30, 45, avatarPosition[2] + 40);
        isTransitioning.current = true;
      }
    }
  }, [cameraMode, avatarPosition]);

  // Focus on selected location with smooth transition in orbit mode
  useEffect(() => {
    if (targetLocation && controlsRef.current && cameraMode === 'orbit') {
      desiredTarget.current.set(targetLocation.map_x, 0, targetLocation.map_z);
      desiredCamPos.current.set(
        targetLocation.map_x + 35,
        Math.max(35, (targetLocation.height || 18) * 2.2),
        targetLocation.map_z + 40
      );
      isTransitioning.current = true;
    }
  }, [targetLocation, cameraMode]);

  // Recenter camera on Avatar
  useEffect(() => {
    if (recenterTrigger > 0 && controlsRef.current) {
      if (cameraMode === 'street') {
        isUserInteracting.current = false;
      } else {
        desiredTarget.current.set(avatarPosition[0], 0, avatarPosition[2]);
        desiredCamPos.current.set(avatarPosition[0] + 30, 35, avatarPosition[2] + 35);
        isTransitioning.current = true;
      }
    }
  }, [recenterTrigger, avatarPosition, cameraMode]);

  // User interaction detection: let user orbit freely around avatar or campus
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const handleStart = () => {
      isTransitioning.current = false;
      isUserInteracting.current = true;
    };
    const handleEnd = () => {
      if (cameraMode === 'street') {
        // In street view, smoothly resume follow-cam tracking after user finishes looking around
        setTimeout(() => {
          isUserInteracting.current = false;
        }, 1500);
      }
    };
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);
    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, [cameraMode]);

  // Frame update
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (cameraMode === 'street') {
      // Pokemon Go style 3rd-person follow cam
      const chaseDist = 8.5;
      const chaseHeight = 3.8;

      const targetX = avatarPosition[0] + Math.sin(avatarHeading) * 3.5;
      const targetY = avatarPosition[1] + 1.8;
      const targetZ = avatarPosition[2] + Math.cos(avatarHeading) * 3.5;

      const camX = avatarPosition[0] - Math.sin(avatarHeading) * chaseDist;
      const camY = avatarPosition[1] + chaseHeight;
      const camZ = avatarPosition[2] - Math.cos(avatarHeading) * chaseDist;

      if (!isUserInteracting.current) {
        const followSpeed = Math.min(1, delta * 5.0);
        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), followSpeed);
        controlsRef.current.target.lerp(new THREE.Vector3(targetX, targetY, targetZ), followSpeed);
      } else {
        // While user is manual orbiting around avatar in Street View, center orbit on avatar
        controlsRef.current.target.set(avatarPosition[0], avatarPosition[1] + 1.8, avatarPosition[2]);
      }
    } else {
      // Birds-Eye Drone Orbit Mode
      if (isTransitioning.current) {
        const lerpSpeed = Math.min(1, delta * 3.5);
        controlsRef.current.target.lerp(desiredTarget.current, lerpSpeed);
        camera.position.lerp(desiredCamPos.current, lerpSpeed);

        const distCam = camera.position.distanceTo(desiredCamPos.current);
        const distTarget = controlsRef.current.target.distanceTo(desiredTarget.current);
        if (distCam < 0.25 && distTarget < 0.25) {
          isTransitioning.current = false;
        }
      }
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.85}
      zoomSpeed={1.2}
      panSpeed={cameraMode === 'orbit' ? 0.8 : 0.2}
      screenSpacePanning={true}
      maxPolarAngle={Math.PI / 2.05}
      minPolarAngle={cameraMode === 'street' ? 0.15 : 0.05}
      minDistance={cameraMode === 'street' ? 4 : 8}
      maxDistance={cameraMode === 'street' ? 25 : 500}
    />
  );
}

interface CampusCanvasProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation | null) => void;
  avatarPosition: [number, number, number];
  avatarHeading: number;
  isMoving: boolean;
  avatarConfig: AvatarConfig;
  activeRoute: NavigationRoute | null;
  recenterTrigger: number;
  cameraMode?: 'orbit' | 'street';
}

export const CampusCanvas: React.FC<CampusCanvasProps> = (props) => {
  const mode = props.cameraMode || 'orbit';

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
          avatarHeading={props.avatarHeading}
          cameraMode={mode}
        />

        <Campus3DScene {...props} cameraMode={mode} />
      </Canvas>
    </div>
  );
};
