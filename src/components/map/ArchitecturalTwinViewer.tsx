'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Sun, Moon, Compass, Eye, Map as MapIcon, 
  Layers, Footprints, Video, Sliders, ChevronDown
} from 'lucide-react';
import type { GISBuildingProperties, GISPOIProperties, LayerVisibility } from '@/types/gis';

export interface ArchitecturalTwinViewerRef {
  toggleBasemap: () => void;
  setBasemapMode: (mode: 'dark' | 'satellite') => void;
  toggleViewMode: () => void;
  setViewMode: (mode: 'isometric' | 'topdown' | 'walk' | 'tour') => void;
  resetView: () => void;
  orientNorth: () => void;
  flyTo: (lng: number, lat: number, distance?: number) => void;
  centerOnUser: () => void;
  startWalkNavigation: (startLng: number, startLat: number) => void;
}

export interface ArchitecturalTwinViewerProps {
  onSelectBuilding?: (building: GISBuildingProperties, coords: [number, number]) => void;
  onSelectPOI?: (poi: GISPOIProperties, coords: [number, number]) => void;
  selectedBuildingId?: string | null;
  focusTarget?: { id?: string; lng: number; lat: number } | null;
  routeCoordinates?: [number, number][];
  layerVisibility?: LayerVisibility;
  userLocation?: { latitude: number; longitude: number; heading?: number | null; accuracy?: number } | null;
  isNavigating?: boolean;
  className?: string;
}

const CENTER_LAT = 31.2535;
const CENTER_LON = 75.7025;
const COS_LAT = Math.cos(CENTER_LAT * Math.PI / 180);

function latLonToWorld(lat: number, lon: number): [number, number] {
  const x = (lon - CENTER_LON) * 111139.0 * COS_LAT;
  const y = (lat - CENTER_LAT) * 111139.0;
  return [x, -y]; // Three.js Z = -y
}

function worldToLatLon(x: number, z: number): [number, number] {
  const lat = CENTER_LAT + (-z) / 111139.0;
  const lon = CENTER_LON + x / (111139.0 * COS_LAT);
  return [lon, lat];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Architectural World-Scaled UV Generator for ExtrudeGeometry
const ArchitecturalUVGenerator = {
  generateTopUV(geometry: any, vertices: number[], indexA: number, indexB: number, indexC: number) {
    const scale = 1.0 / 8.0; // 1 paver tile sequence per 8m
    return [
      new THREE.Vector2(vertices[indexA * 3] * scale, vertices[indexA * 3 + 1] * scale),
      new THREE.Vector2(vertices[indexB * 3] * scale, vertices[indexB * 3 + 1] * scale),
      new THREE.Vector2(vertices[indexC * 3] * scale, vertices[indexC * 3 + 1] * scale),
    ];
  },
  generateSideWallUV(geometry: any, vertices: number[], indexA: number, indexB: number, indexC: number, indexD: number) {
    const ax = vertices[indexA * 3], ay = vertices[indexA * 3 + 1], az = vertices[indexA * 3 + 2];
    const bx = vertices[indexB * 3], by = vertices[indexB * 3 + 1], bz = vertices[indexB * 3 + 2];
    const cx = vertices[indexC * 3], cy = vertices[indexC * 3 + 1], cz = vertices[indexC * 3 + 2];
    const dx = vertices[indexD * 3], dy = vertices[indexD * 3 + 1], dz = vertices[indexD * 3 + 2];

    const edgeLen = Math.hypot(bx - ax, by - ay);
    const uRepeat = edgeLen / 3.6; // Exactly 1 architectural window bay per 3.6m width!
    const vScale = 1.0 / 3.2;     // Exactly 1 floor per 3.2m height!

    return [
      new THREE.Vector2(0, az * vScale),
      new THREE.Vector2(uRepeat, bz * vScale),
      new THREE.Vector2(uRepeat, cz * vScale),
      new THREE.Vector2(0, dz * vScale),
    ];
  }
};

// Procedural high-detail architectural textures with bump maps
function createProceduralTextures() {
  // 1. High-Detail Terracotta Red Brick Facade Texture (1024x1024)
  const brickCanvas = document.createElement('canvas');
  brickCanvas.width = 1024;
  brickCanvas.height = 1024;
  const bCtx = brickCanvas.getContext('2d')!;

  // Terracotta base
  bCtx.fillStyle = '#b45309';
  bCtx.fillRect(0, 0, 1024, 1024);

  // Brick coursing with mortar joints
  for (let y = 0; y < 1024; y += 12) {
    bCtx.fillStyle = (y % 24 === 0) ? '#9a3412' : '#c2410c';
    bCtx.fillRect(0, y, 1024, 10);
    bCtx.fillStyle = '#d6d3d1'; // Light mortar
    bCtx.fillRect(0, y + 10, 1024, 2);

    const shift = (y % 24 === 0) ? 0 : 20;
    for (let x = shift; x < 1024; x += 40) {
      bCtx.fillRect(x, y, 2, 10);
    }
  }

  // 4 Architectural stories per texture tile (each 256px)
  for (let f = 0; f < 4; f++) {
    const y = f * 256;

    // Sandstone floor cornice / stringcourse band
    bCtx.fillStyle = '#e0a96d';
    bCtx.fillRect(0, y, 1024, 36);
    bCtx.fillStyle = '#b45309';
    bCtx.fillRect(0, y + 34, 1024, 2);

    // 4 Window bays per floor (each 256px wide)
    for (let bay = 0; bay < 4; bay++) {
      const bx = bay * 256;
      // 36px brick pier on left and right, 184px window in center
      const wx = bx + 36;
      const wy = y + 54;
      const ww = 184;
      const wh = 148;

      // Sandstone lintel above window
      bCtx.fillStyle = '#e0a96d';
      bCtx.fillRect(wx - 4, wy - 8, ww + 8, 8);

      // White/sandstone architectural window frame
      bCtx.fillStyle = '#f8fafc';
      bCtx.fillRect(wx, wy, ww, wh);

      // Dark window opening with double glazing
      bCtx.fillStyle = '#0f172a';
      bCtx.fillRect(wx + 6, wy + 6, ww - 12, wh - 12);

      // Left pane & Right pane with soft sky reflection
      const paneW = (ww - 18) / 2;
      const paneH = wh - 12;

      const grad1 = bCtx.createLinearGradient(wx + 6, wy + 6, wx + 6 + paneW, wy + 6 + paneH);
      grad1.addColorStop(0, 'rgba(147, 197, 253, 0.48)');
      grad1.addColorStop(0.5, 'rgba(59, 130, 246, 0.22)');
      grad1.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

      bCtx.fillStyle = grad1;
      bCtx.fillRect(wx + 6, wy + 6, paneW, paneH);
      bCtx.fillRect(wx + 12 + paneW, wy + 6, paneW, paneH);

      // Center aluminum mullion
      bCtx.fillStyle = '#64748b';
      bCtx.fillRect(wx + 6 + paneW, wy + 6, 6, paneH);

      // Projecting sandstone windowsill below
      bCtx.fillStyle = '#d4a373';
      bCtx.fillRect(wx - 8, wy + wh, ww + 16, 12);
      bCtx.fillStyle = '#78350f';
      bCtx.fillRect(wx - 8, wy + wh + 10, ww + 16, 2);
    }
  }

  const brickFacadeTexture = new THREE.CanvasTexture(brickCanvas);
  brickFacadeTexture.wrapS = THREE.RepeatWrapping;
  brickFacadeTexture.wrapT = THREE.RepeatWrapping;
  brickFacadeTexture.anisotropy = 8;

  // Brick Bump Map (512x512) for tactile relief under directional light
  const brickBumpCanvas = document.createElement('canvas');
  brickBumpCanvas.width = 512;
  brickBumpCanvas.height = 512;
  const bbCtx = brickBumpCanvas.getContext('2d')!;
  bbCtx.fillStyle = '#808080';
  bbCtx.fillRect(0, 0, 512, 512);

  for (let f = 0; f < 4; f++) {
    const y = f * 128;
    bbCtx.fillStyle = '#e0e0e0'; // Protruding cornice
    bbCtx.fillRect(0, y, 512, 18);

    for (let bay = 0; bay < 4; bay++) {
      const bx = bay * 128;
      // Window recess (dark = deep)
      bbCtx.fillStyle = '#181818';
      bbCtx.fillRect(bx + 18, y + 27, 92, 74);
      // Window sill
      bbCtx.fillStyle = '#d0d0d0';
      bbCtx.fillRect(bx + 14, y + 101, 100, 6);
    }
  }
  const brickBumpMap = new THREE.CanvasTexture(brickBumpCanvas);
  brickBumpMap.wrapS = THREE.RepeatWrapping;
  brickBumpMap.wrapT = THREE.RepeatWrapping;

  // 2. High-Detail Sandstone & Ashlar Cladding Texture (1024x1024)
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = 1024;
  stoneCanvas.height = 1024;
  const sCtx = stoneCanvas.getContext('2d')!;

  // Warm sandstone buff
  sCtx.fillStyle = '#d4a373';
  sCtx.fillRect(0, 0, 1024, 1024);

  // Stone panel joints
  sCtx.strokeStyle = 'rgba(120, 53, 15, 0.2)';
  sCtx.lineWidth = 2;
  for (let y = 0; y < 1024; y += 64) {
    sCtx.beginPath();
    sCtx.moveTo(0, y);
    sCtx.lineTo(1024, y);
    sCtx.stroke();
  }
  for (let x = 0; x < 1024; x += 128) {
    sCtx.beginPath();
    sCtx.moveTo(x, 0);
    sCtx.lineTo(x, 1024);
    sCtx.stroke();
  }

  for (let f = 0; f < 4; f++) {
    const y = f * 256;
    // Limestone band
    sCtx.fillStyle = '#e2bc9b';
    sCtx.fillRect(0, y, 1024, 32);

    for (let bay = 0; bay < 4; bay++) {
      const bx = bay * 256;
      const wx = bx + 28;
      const wy = y + 50;
      const ww = 200;
      const wh = 156;

      sCtx.fillStyle = '#334155';
      sCtx.fillRect(wx, wy, ww, wh);

      sCtx.fillStyle = '#0f172a';
      sCtx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);

      const grad = sCtx.createLinearGradient(wx, wy, wx + ww, wy + wh);
      grad.addColorStop(0, 'rgba(186, 230, 253, 0.45)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

      sCtx.fillStyle = grad;
      sCtx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);

      // Aluminum mullion grid
      sCtx.fillStyle = '#64748b';
      sCtx.fillRect(wx + ww * 0.5 - 2, wy + 4, 4, wh - 8);
      sCtx.fillRect(wx + 4, wy + wh * 0.4 - 2, ww - 8, 4);

      // Sandstone sill
      sCtx.fillStyle = '#f5e6d3';
      sCtx.fillRect(wx - 4, wy + wh, ww + 8, 8);
    }
  }

  const stoneFacadeTexture = new THREE.CanvasTexture(stoneCanvas);
  stoneFacadeTexture.wrapS = THREE.RepeatWrapping;
  stoneFacadeTexture.wrapT = THREE.RepeatWrapping;
  stoneFacadeTexture.anisotropy = 8;

  const stoneBumpCanvas = document.createElement('canvas');
  stoneBumpCanvas.width = 512;
  stoneBumpCanvas.height = 512;
  const sbCtx = stoneBumpCanvas.getContext('2d')!;
  sbCtx.fillStyle = '#909090';
  sbCtx.fillRect(0, 0, 512, 512);

  for (let f = 0; f < 4; f++) {
    const y = f * 128;
    sbCtx.fillStyle = '#c0c0c0';
    sbCtx.fillRect(0, y, 512, 16);
    for (let bay = 0; bay < 4; bay++) {
      const bx = bay * 128;
      sbCtx.fillStyle = '#202020';
      sbCtx.fillRect(bx + 14, y + 25, 100, 78);
    }
  }
  const stoneBumpMap = new THREE.CanvasTexture(stoneBumpCanvas);
  stoneBumpMap.wrapS = THREE.RepeatWrapping;
  stoneBumpMap.wrapT = THREE.RepeatWrapping;

  // 3. High-Tech Reflective Curtain Glass Wall Texture (1024x1024 for CS Block 34 / UniMall)
  const glassCanvas = document.createElement('canvas');
  glassCanvas.width = 1024;
  glassCanvas.height = 1024;
  const gCtx = glassCanvas.getContext('2d')!;

  gCtx.fillStyle = '#0f172a';
  gCtx.fillRect(0, 0, 1024, 1024);

  for (let f = 0; f < 4; f++) {
    const y = f * 256;
    // Metallic transom
    gCtx.fillStyle = '#334155';
    gCtx.fillRect(0, y, 1024, 20);

    for (let bay = 0; bay < 4; bay++) {
      const bx = bay * 256;
      const wx = bx + 6;
      const wy = y + 24;
      const ww = 244;
      const wh = 226;

      const gGrad = gCtx.createLinearGradient(wx, wy, wx + ww, wy + wh);
      gGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      gGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.35)');
      gGrad.addColorStop(0.7, 'rgba(30, 58, 138, 0.45)');
      gGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

      gCtx.fillStyle = gGrad;
      gCtx.fillRect(wx, wy, ww, wh);

      // Stainless steel structural mullions
      gCtx.fillStyle = '#94a3b8';
      gCtx.fillRect(bx, y, 6, 256);
      gCtx.fillRect(bx + 128 - 2, wy, 4, wh);

      // Horizontal solar shading louver
      gCtx.fillStyle = '#cbd5e1';
      gCtx.fillRect(wx, wy + 40, ww, 6);
    }
  }

  const glassCurtainTexture = new THREE.CanvasTexture(glassCanvas);
  glassCurtainTexture.wrapS = THREE.RepeatWrapping;
  glassCurtainTexture.wrapT = THREE.RepeatWrapping;
  glassCurtainTexture.anisotropy = 8;

  const glassBumpCanvas = document.createElement('canvas');
  glassBumpCanvas.width = 512;
  glassBumpCanvas.height = 512;
  const gbCtx = glassBumpCanvas.getContext('2d')!;
  gbCtx.fillStyle = '#404040';
  gbCtx.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) {
    gbCtx.fillStyle = '#d0d0d0'; // Mullions stick out
    gbCtx.fillRect(x, 0, 3, 512);
  }
  for (let y = 0; y < 512; y += 128) {
    gbCtx.fillStyle = '#e0e0e0';
    gbCtx.fillRect(0, y, 512, 10);
  }
  const glassBumpMap = new THREE.CanvasTexture(glassBumpCanvas);
  glassBumpMap.wrapS = THREE.RepeatWrapping;
  glassBumpMap.wrapT = THREE.RepeatWrapping;

  // 4. High-Detail Terrace Pavers & Service Walkways Texture (512x512)
  const roofCanvas = document.createElement('canvas');
  roofCanvas.width = 512;
  roofCanvas.height = 512;
  const rCtx = roofCanvas.getContext('2d')!;
  rCtx.fillStyle = '#88929b'; // Medium stone grey terrace pavers
  rCtx.fillRect(0, 0, 512, 512);

  // Paver tile seams
  rCtx.strokeStyle = '#52525b';
  rCtx.lineWidth = 2;
  for (let p = 0; p <= 512; p += 64) {
    rCtx.beginPath();
    rCtx.moveTo(p, 0);
    rCtx.lineTo(p, 512);
    rCtx.stroke();
    rCtx.beginPath();
    rCtx.moveTo(0, p);
    rCtx.lineTo(512, p);
    rCtx.stroke();
  }

  // Cross concrete maintenance walkways with yellow safety border
  rCtx.fillStyle = '#eab308'; // Yellow safety border
  rCtx.fillRect(228, 0, 56, 512);
  rCtx.fillRect(0, 228, 512, 56);
  rCtx.fillStyle = '#cbd5e1'; // Light concrete walking surface
  rCtx.fillRect(232, 0, 48, 512);
  rCtx.fillRect(0, 232, 512, 48);

  const roofTexture = new THREE.CanvasTexture(roofCanvas);
  roofTexture.wrapS = THREE.RepeatWrapping;
  roofTexture.wrapT = THREE.RepeatWrapping;
  roofTexture.anisotropy = 8;

  const roofBumpCanvas = document.createElement('canvas');
  roofBumpCanvas.width = 256;
  roofBumpCanvas.height = 256;
  const rbCtx = roofBumpCanvas.getContext('2d')!;
  rbCtx.fillStyle = '#808080';
  rbCtx.fillRect(0, 0, 256, 256);
  rbCtx.strokeStyle = '#202020';
  rbCtx.lineWidth = 3;
  for (let p = 0; p <= 256; p += 32) {
    rbCtx.strokeRect(p, 0, 32, 256);
  }
  rbCtx.fillStyle = '#c0c0c0';
  rbCtx.fillRect(116, 0, 24, 256);
  rbCtx.fillRect(0, 116, 256, 24);

  const roofBumpMap = new THREE.CanvasTexture(roofBumpCanvas);
  roofBumpMap.wrapS = THREE.RepeatWrapping;
  roofBumpMap.wrapT = THREE.RepeatWrapping;

  // 5. Polycrystalline Solar PV Texture
  const solarCanvas = document.createElement('canvas');
  solarCanvas.width = 256;
  solarCanvas.height = 256;
  const solCtx = solarCanvas.getContext('2d')!;
  solCtx.fillStyle = '#1e3a8a';
  solCtx.fillRect(0, 0, 256, 256);
  solCtx.strokeStyle = '#60a5fa';
  solCtx.lineWidth = 1.2;
  for (let x = 0; x <= 256; x += 32) {
    solCtx.beginPath();
    solCtx.moveTo(x, 0);
    solCtx.lineTo(x, 256);
    solCtx.stroke();
  }
  for (let y = 0; y <= 256; y += 48) {
    solCtx.beginPath();
    solCtx.moveTo(0, y);
    solCtx.lineTo(256, y);
    solCtx.stroke();
  }
  const solarTexture = new THREE.CanvasTexture(solarCanvas);
  solarTexture.wrapS = THREE.RepeatWrapping;
  solarTexture.wrapT = THREE.RepeatWrapping;

  // 6. Rich Charcoal Road Texture
  const roadCanvas = document.createElement('canvas');
  roadCanvas.width = 128;
  roadCanvas.height = 256;
  const rdCtx = roadCanvas.getContext('2d')!;
  rdCtx.fillStyle = '#1e293b';
  rdCtx.fillRect(0, 0, 128, 256);
  rdCtx.fillStyle = '#64748b';
  rdCtx.fillRect(0, 0, 5, 256);
  rdCtx.fillRect(123, 0, 5, 256);
  rdCtx.fillStyle = '#e2e8f0';
  for (let y = 16; y < 256; y += 48) {
    rdCtx.fillRect(62, y, 4, 24);
  }
  const roadTexture = new THREE.CanvasTexture(roadCanvas);
  roadTexture.wrapS = THREE.RepeatWrapping;
  roadTexture.wrapT = THREE.RepeatWrapping;

  return {
    brickFacadeTexture,
    brickBumpMap,
    stoneFacadeTexture,
    stoneBumpMap,
    glassCurtainTexture,
    glassBumpMap,
    roofTexture,
    roofBumpMap,
    solarTexture,
    roadTexture
  };
}

function getNaturalBuildingPalette(b: any): { 
  wallColor: THREE.Color; 
  roofColor: THREE.Color; 
  isBrick: boolean;
  facadeType: 'brick' | 'stone' | 'glass';
} {
  const cat = (b.category || '').toLowerCase();
  const name = (b.name || '').toLowerCase();
  const block = (b.block || '').toLowerCase();

  // Flagship: UniMall (Modern Glass & Titanium)
  if (block.includes('unimall') || name.includes('unimall')) {
    return {
      wallColor: new THREE.Color('#b45309'),
      roofColor: new THREE.Color('#88929b'),
      isBrick: false,
      facadeType: 'glass',
    };
  }
  // Flagship: Unipolis (Sandstone Buff & Ivory)
  if (block.includes('unipolis') || name.includes('unipolis')) {
    return {
      wallColor: new THREE.Color('#d4a373'),
      roofColor: new THREE.Color('#88929b'),
      isBrick: false,
      facadeType: 'stone',
    };
  }
  // Admissions & Central Admin (Block 32 / 31 / Chancellor)
  if (block === '32' || block === '31' || name.includes('admissions') || name.includes('chancellor') || name.includes('secretariat')) {
    return {
      wallColor: new THREE.Color('#e0a96d'),
      roofColor: new THREE.Color('#788596'),
      isBrick: true,
      facadeType: 'brick',
    };
  }
  // Computer Science (Block 34) & Mittal Business (Block 13-14)
  if (block === '34' || block === '13' || block === '14' || name.includes('computer science') || name.includes('business')) {
    return {
      wallColor: new THREE.Color('#b45309'),
      roofColor: new THREE.Color('#788596'),
      isBrick: true,
      facadeType: block === '34' ? 'glass' : 'brick',
    };
  }
  // Central Library & Research (Block 36-38)
  if (name.includes('library') || block.includes('36') || block.includes('38')) {
    return {
      wallColor: new THREE.Color('#c2410c'),
      roofColor: new THREE.Color('#788596'),
      isBrick: true,
      facadeType: 'brick',
    };
  }
  // Healthcare / Uni-Hospital
  if (cat.includes('hospital') || cat.includes('healthcare') || name.includes('hospital')) {
    return {
      wallColor: new THREE.Color('#e7e5e4'),
      roofColor: new THREE.Color('#88929b'),
      isBrick: false,
      facadeType: 'stone',
    };
  }
  // Hostels & Residential (Boys & Girls Hostels, Apartments)
  if (cat.includes('residential') || block.includes('bh') || block.includes('gh') || name.includes('hostel') || name.includes('apartment')) {
    const hostelTones = ['#b45309', '#c2410c', '#a16207', '#be6546', '#c97b5d', '#9a3412'];
    const idx = Math.abs(hashString(b.id || b.name)) % hostelTones.length;
    return {
      wallColor: new THREE.Color(hostelTones[idx]),
      roofColor: new THREE.Color('#88929b'),
      isBrick: true,
      facadeType: 'brick',
    };
  }
  // Academic Blocks (Block 1-8, 18-28, etc.)
  if (cat.includes('academic') || cat.includes('admin')) {
    const academicTones = ['#b45309', '#c2410c', '#d97736', '#d4a373', '#be6546', '#cd853f'];
    const idx = Math.abs(hashString(b.id || b.name)) % academicTones.length;
    return {
      wallColor: new THREE.Color(academicTones[idx]),
      roofColor: new THREE.Color('#88929b'),
      isBrick: true,
      facadeType: 'brick',
    };
  }
  // Sports Facility & Stadium (Block 47, Indoor Stadium)
  if (cat.includes('sports') || block === '47' || name.includes('stadium') || name.includes('sports')) {
    return {
      wallColor: new THREE.Color('#64748b'),
      roofColor: new THREE.Color('#718096'),
      isBrick: false,
      facadeType: 'stone',
    };
  }
  // Labs & Workshops / Heavy Engineering (Block 55-58)
  if (cat.includes('labs') || cat.includes('workshops')) {
    const labTones = ['#78716c', '#a8a29e', '#9ca3af', '#854d0e', '#b45309'];
    const idx = Math.abs(hashString(b.id || b.name)) % labTones.length;
    return {
      wallColor: new THREE.Color(labTones[idx]),
      roofColor: new THREE.Color('#788596'),
      isBrick: false,
      facadeType: 'stone',
    };
  }

  // General campus building fallback - natural warm terracotta / sandstone
  const generalTones = ['#b45309', '#c2410c', '#d4a373', '#a8a29e', '#d97736', '#854d0e'];
  const idx = Math.abs(hashString(b.id || b.name || 'bldg')) % generalTones.length;
  return {
    wallColor: new THREE.Color(generalTones[idx]),
    roofColor: new THREE.Color('#88929b'),
    isBrick: true,
    facadeType: 'brick',
  };
}

const ArchitecturalTwinViewer = forwardRef<ArchitecturalTwinViewerRef, ArchitecturalTwinViewerProps>(function ArchitecturalTwinViewer({
  onSelectBuilding,
  onSelectPOI,
  selectedBuildingId,
  focusTarget,
  routeCoordinates,
  layerVisibility,
  userLocation,
  isNavigating = false,
  className = '',
}: ArchitecturalTwinViewerProps, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [viewMode, setViewMode] = useState<'isometric' | 'topdown' | 'walk' | 'tour'>('isometric');
  const viewModeRef = useRef<'isometric' | 'topdown' | 'walk' | 'tour'>('isometric');
  viewModeRef.current = viewMode;

  const userLocationRef = useRef(userLocation);
  userLocationRef.current = userLocation;
  const isNavigatingRef = useRef(isNavigating);
  isNavigatingRef.current = isNavigating;

  const [sprintActive, setSprintActive] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<number>(14.0);
  const [satelliteBasemap, setSatelliteBasemap] = useState<boolean>(false);
  const [hudExpanded, setHudExpanded] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; title: string; subtitle: string } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const perspectiveCamRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCamRef = useRef<THREE.OrthographicCamera | null>(null);
  const currentCamRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const satelliteMeshRef = useRef<THREE.Mesh | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const solarGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const routeGroupRef = useRef<THREE.Group | null>(null);
  const userMarkerGroupRef = useRef<THREE.Group | null>(null);
  const roadsGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const nightLightsGroupRef = useRef<THREE.Group | null>(null);

  const camTransition = useRef<{
    active: boolean;
    startCamPos: THREE.Vector3;
    endCamPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    startTime: number;
    duration: number;
  } | null>(null);

  const walkControls = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
    sprint: false,
    yaw: 0,
    pitch: 0,
    isMouseDown: false,
    prevX: 0,
    prevY: 0
  });

  const tourAngle = useRef<number>(0);

  const animateCameraTo = useCallback((targetX: number, targetZ: number, distance: number = 180, duration: number = 1200) => {
    if (!controlsRef.current || !perspectiveCamRef.current) return;
    const endTarget = new THREE.Vector3(targetX, 0, targetZ);
    const endCamPos = new THREE.Vector3(
      targetX + distance * 0.85,
      distance * 0.95,
      targetZ + distance * 1.1
    );

    camTransition.current = {
      active: true,
      startCamPos: perspectiveCamRef.current.position.clone(),
      endCamPos,
      startTarget: controlsRef.current.target.clone(),
      endTarget,
      startTime: performance.now(),
      duration
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x93c5fd);
    scene.fog = new THREE.FogExp2(0xbfe0fb, 0.00028);
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    rendererRef.current = renderer;

    const aspect = width / height;
    const perspectiveCam = new THREE.PerspectiveCamera(45, aspect, 1, 6000);
    perspectiveCam.position.set(250, 480, 520);
    perspectiveCamRef.current = perspectiveCam;

    const orthoD = 750;
    const orthoCam = new THREE.OrthographicCamera(-orthoD * aspect, orthoD * aspect, orthoD, -orthoD, 1, 6000);
    orthoCam.position.set(0, 1100, 0);
    orthoCam.up.set(0, 0, -1);
    orthoCam.lookAt(0, 0, 0);
    orthoCamRef.current = orthoCam;

    currentCamRef.current = perspectiveCam;

    const controls = new OrbitControls(perspectiveCam, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 30;
    controls.maxDistance = 2500;
    controlsRef.current = controls;

    // 1. Ambient Light - soft natural fill
    const ambLight = new THREE.AmbientLight(0xffffff, 0.62);
    scene.add(ambLight);

    // 2. Hemispheric Sky Light - sky blue to lush grass green bounce
    const hemiLight = new THREE.HemisphereLight(0xbfe0fb, 0x3d7a44, 0.60);
    hemiLight.position.set(0, 600, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // 3. Sun Directional Light - warm natural golden sunlight
    const dirLight = new THREE.DirectionalLight(0xfff8ea, 1.20);
    dirLight.position.set(-500, 700, -400);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 2400;
    const sd = 900;
    dirLight.shadow.camera.left = -sd;
    dirLight.shadow.camera.right = sd;
    dirLight.shadow.camera.top = sd;
    dirLight.shadow.camera.bottom = -sd;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 4. Fill Directional Light from opposite side for natural shadow detailing
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.48);
    fillLight.position.set(500, 450, 450);
    scene.add(fillLight);

    const nightGroup = new THREE.Group();
    nightGroup.visible = false;
    scene.add(nightGroup);
    nightLightsGroupRef.current = nightGroup;

    const treeGroup = new THREE.Group();
    const solarGroup = new THREE.Group();
    const pinsGroup = new THREE.Group();
    const routeGroup = new THREE.Group();
    const userMarkerGroup = new THREE.Group();
    userMarkerGroup.visible = false;

    // 3D GPS Avatar Construction
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), coreMat);
    coreMesh.position.y = 1.0;

    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const haloMesh = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.2, 32), haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.y = 0.3;

    const radarMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const radarMesh = new THREE.Mesh(new THREE.RingGeometry(2.4, 4.2, 32), radarMat);
    radarMesh.rotation.x = -Math.PI / 2;
    radarMesh.position.y = 0.25;
    userMarkerGroup.userData.radarRing = radarMesh;

    const coneGeo = new THREE.ConeGeometry(3.5, 9, 3);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.translate(0, 0, -4.5);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const headingCone = new THREE.Mesh(coneGeo, coneMat);
    headingCone.position.y = 0.3;

    userMarkerGroup.add(coreMesh, haloMesh, radarMesh, headingCone);
    scene.add(treeGroup, solarGroup, pinsGroup, routeGroup, userMarkerGroup);
    treeGroupRef.current = treeGroup;
    solarGroupRef.current = solarGroup;
    pinsGroupRef.current = pinsGroup;
    routeGroupRef.current = routeGroup;
    userMarkerGroupRef.current = userMarkerGroup;

    const textures = createProceduralTextures();

    const groundGeo = new THREE.PlaneGeometry(3600, 3600);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x38783d });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    groundMeshRef.current = groundMesh;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/map/satellite_ortho.jpg', (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      const satGeo = new THREE.PlaneGeometry(1596.0, 2660.0);
      const satMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.rotation.x = -Math.PI / 2;
      satMesh.position.set(-28.9, -0.02, 415.4);
      satMesh.visible = false;
      scene.add(satMesh);
      satelliteMeshRef.current = satMesh;
    });

    fetch('/map/campus_data.json')
      .then(res => res.json())
      .then(campusData => {
        const roadsGroup = new THREE.Group();
        scene.add(roadsGroup);
        roadsGroupRef.current = roadsGroup;

        const roadMat = new THREE.MeshLambertMaterial({ map: textures.roadTexture });
        const walkMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });

        (campusData.highways || []).forEach((hw: any) => {
          const pts = hw.path;
          if (!pts || pts.length < 2) return;

          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const dx = p2[0] - p1[0];
            const dz = -(p2[1] - p1[1]);
            const len = Math.hypot(dx, dz);
            if (len < 0.5) continue;

            const angle = Math.atan2(dz, dx);
            const midX = (p1[0] + p2[0]) / 2;
            const midZ = -(p1[1] + p2[1]) / 2;

            const width = hw.width || (hw.is_primary ? 14 : 7);
            const segGeo = new THREE.PlaneGeometry(len, width);
            const segMesh = new THREE.Mesh(segGeo, hw.is_pedestrian ? walkMat : roadMat);
            segMesh.rotation.x = -Math.PI / 2;
            segMesh.rotation.z = -angle;
            segMesh.position.set(midX, hw.is_pedestrian ? 0.05 : 0.04, midZ);
            segMesh.receiveShadow = true;
            roadsGroup.add(segMesh);
          }
        });

        const medianGeo = new THREE.PlaneGeometry(12, 450);
        const medianMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
        const median = new THREE.Mesh(medianGeo, medianMat);
        median.rotation.x = -Math.PI / 2;
        median.position.set(160, 0.06, -380);
        roadsGroup.add(median);

        const bldgGroup = new THREE.Group();
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.25 });

        (campusData.buildings || []).forEach((b: any) => {
          const poly = b.polygon;
          if (!poly || poly.length < 3) return;

          const shape = new THREE.Shape();
          shape.moveTo(poly[0][0], poly[0][1]);
          for (let i = 1; i < poly.length; i++) {
            shape.lineTo(poly[i][0], poly[i][1]);
          }
          shape.closePath();

          const extrudeSettings = {
            depth: b.height || 18,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.4,
            bevelThickness: 0.4,
            UVGenerator: ArchitecturalUVGenerator,
          };

          const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          geo.rotateX(-Math.PI / 2);
          geo.computeVertexNormals();

          const palette = getNaturalBuildingPalette(b);
          const isFlagship = b.block === '32' || b.block === 'UniMall' || b.block === '34' || (b.name && b.name.includes('Admissions'));
          
          // Select facade color map and corresponding bump map based on facadeType
          let facadeMap = textures.brickFacadeTexture;
          let facadeBump = textures.brickBumpMap;
          let facadeRoughness = 0.55;
          let facadeMetalness = 0.08;

          if (palette.facadeType === 'glass') {
            facadeMap = textures.glassCurtainTexture;
            facadeBump = textures.glassBumpMap;
            facadeRoughness = 0.2;
            facadeMetalness = 0.65;
          } else if (palette.facadeType === 'stone') {
            facadeMap = textures.stoneFacadeTexture;
            facadeBump = textures.stoneBumpMap;
            facadeRoughness = 0.6;
            facadeMetalness = 0.05;
          }

          // Realistic Natural Roof & Wall materials for ExtrudeGeometry with bump relief
          const roofMat = new THREE.MeshStandardMaterial({
            color: palette.roofColor,
            map: textures.roofTexture,
            bumpMap: textures.roofBumpMap,
            bumpScale: 0.06,
            roughness: 0.72,
            metalness: 0.08,
          });

          const wallMat = new THREE.MeshStandardMaterial({
            color: palette.wallColor,
            map: facadeMap,
            bumpMap: facadeBump,
            bumpScale: palette.facadeType === 'glass' ? 0.04 : 0.08,
            roughness: facadeRoughness,
            metalness: facadeMetalness,
          });

          // ExtrudeGeometry: Index 0 = Caps (Roof), Index 1 = Sides (Walls)
          const mesh = new THREE.Mesh(geo, [roofMat, wallMat]);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData = {
            isBuilding: true,
            data: b,
            originalRoofColor: roofMat.color.clone(),
            originalWallColor: wallMat.color.clone(),
          };

          bldgGroup.add(mesh);
          buildingMeshesRef.current.set(b.id, mesh);

          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 22), edgeMat);
          bldgGroup.add(edges);

          const bCenterX = b.center[0];
          const bCenterZ = -b.center[1];
          const bTopY = (b.height || 18) + 0.4;

          const roofWidth = Math.min(Math.sqrt(b.area || 1200) * 0.5, 40);
          if (roofWidth > 12) {
            // Elevator penthouse
            const pentGeo = new THREE.BoxGeometry(roofWidth * 0.35, 3.2, roofWidth * 0.3);
            const pentMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
            const penthouse = new THREE.Mesh(pentGeo, pentMat);
            penthouse.position.set(bCenterX + 4, bTopY + 1.6, bCenterZ - 3);
            penthouse.castShadow = true;
            bldgGroup.add(penthouse);

            // Rooftop HVAC chiller unit
            const hvacGeo = new THREE.BoxGeometry(roofWidth * 0.22, 1.8, roofWidth * 0.22);
            const hvacMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4, roughness: 0.5 });
            const hvac = new THREE.Mesh(hvacGeo, hvacMat);
            hvac.position.set(bCenterX - roofWidth * 0.2, bTopY + 0.9, bCenterZ + roofWidth * 0.15);
            hvac.castShadow = true;
            bldgGroup.add(hvac);

            // Industrial water tanks (dual cylinders)
            const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 16);
            const tankMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.3, roughness: 0.4 });
            const tank1 = new THREE.Mesh(tankGeo, tankMat);
            tank1.position.set(bCenterX + 3, bTopY + 4.3, bCenterZ - 2);
            tank1.castShadow = true;
            const tank2 = new THREE.Mesh(tankGeo, tankMat);
            tank2.position.set(bCenterX + 5.6, bTopY + 4.3, bCenterZ - 2);
            tank2.castShadow = true;
            bldgGroup.add(tank1, tank2);

            // Communications mast / telecommunication tower on major / tall buildings
            if ((b.height || 18) >= 22 || isFlagship) {
              const mastGeo = new THREE.CylinderGeometry(0.12, 0.4, 8.5, 8);
              const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85 });
              const mast = new THREE.Mesh(mastGeo, mastMat);
              mast.position.set(bCenterX, bTopY + 4.25, bCenterZ);
              mast.castShadow = true;
              
              // Red aviation beacon light at top
              const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
              const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
              const beacon = new THREE.Mesh(beaconGeo, beaconMat);
              beacon.position.set(bCenterX, bTopY + 8.5, bCenterZ);
              
              bldgGroup.add(mast, beacon);
            }

            // Ground floor architectural entrance canopy
            const canopyW = Math.min(roofWidth * 0.45, 16);
            const canopyD = 5.5;
            const canopyGeo = new THREE.BoxGeometry(canopyW, 0.4, canopyD);
            const canopyMat = new THREE.MeshStandardMaterial({ 
              color: 0x0284c7, 
              metalness: 0.5, 
              roughness: 0.2, 
              transparent: true, 
              opacity: 0.85 
            });
            const entranceCanopy = new THREE.Mesh(canopyGeo, canopyMat);
            entranceCanopy.position.set(bCenterX, 3.8, bCenterZ + roofWidth * 0.45);
            entranceCanopy.castShadow = true;
            bldgGroup.add(entranceCanopy);
          }

          if (b.has_solar || isFlagship) {
            const solW = Math.min(Math.sqrt(b.area || 1000) * 0.65, 55);
            const solGeo = new THREE.PlaneGeometry(solW, solW * 0.6, 6, 4);
            const solMat = new THREE.MeshStandardMaterial({
              map: textures.solarTexture,
              color: 0x3b82f6,
              metalness: 0.7,
              roughness: 0.25,
            });
            const solMesh = new THREE.Mesh(solGeo, solMat);
            solMesh.rotation.x = -Math.PI / 2;
            solMesh.position.set(bCenterX, bTopY + 0.6, bCenterZ);
            solMesh.castShadow = true;
            solarGroup.add(solMesh);
          }
        });
        scene.add(bldgGroup);

        // Monuments
        const samadhiCenter = [136.2, -285.2];
        const samadhiPlinthGeo = new THREE.CylinderGeometry(14, 18, 1.6, 32);
        const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.2 });
        const plinth = new THREE.Mesh(samadhiPlinthGeo, marbleMat);
        plinth.position.set(samadhiCenter[0], 0.8, samadhiCenter[1]);
        plinth.castShadow = true;
        scene.add(plinth);

        const monumentGeo = new THREE.CylinderGeometry(5, 7, 5, 32);
        const monument = new THREE.Mesh(monumentGeo, marbleMat);
        monument.position.set(samadhiCenter[0], 3.6, samadhiCenter[1]);
        monument.castShadow = true;
        scene.add(monument);

        const pondGeo = new THREE.RingGeometry(20, 29, 32);
        const pondMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8 });
        const pond = new THREE.Mesh(pondGeo, pondMat);
        pond.rotation.x = -Math.PI / 2;
        pond.position.set(samadhiCenter[0], 0.1, samadhiCenter[1]);
        scene.add(pond);

        const unipolisCenter = [160, -165];
        const canopyGeo = new THREE.ConeGeometry(38, 14, 32, 1, true);
        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.25,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92
        });
        const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
        canopyMesh.position.set(unipolisCenter[0], 22, unipolisCenter[1]);
        canopyMesh.castShadow = true;
        scene.add(canopyMesh);

        const cricketCenter = [-199.1, 651.8];
        const cricketR = 78;

        const ovalGeo = new THREE.CircleGeometry(cricketR, 64);
        const grassMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
        const oval = new THREE.Mesh(ovalGeo, grassMat);
        oval.rotation.x = -Math.PI / 2;
        oval.position.set(cricketCenter[0], 0.07, cricketCenter[1]);
        oval.receiveShadow = true;
        scene.add(oval);

        const trackGeo = new THREE.RingGeometry(cricketR, cricketR + 10, 64);
        const trackMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 });
        const track = new THREE.Mesh(trackGeo, trackMat);
        track.rotation.x = -Math.PI / 2;
        track.position.set(cricketCenter[0], 0.06, cricketCenter[1]);
        scene.add(track);

        const pitchGeo = new THREE.PlaneGeometry(6, 26);
        const pitchMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
        const pitch = new THREE.Mesh(pitchGeo, pitchMat);
        pitch.rotation.x = -Math.PI / 2;
        pitch.position.set(cricketCenter[0], 0.08, cricketCenter[1]);
        scene.add(pitch);

        const standMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const seatMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 });
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * Math.PI * 2;
          const sx = cricketCenter[0] + Math.cos(ang) * (cricketR + 8);
          const sz = cricketCenter[1] + Math.sin(ang) * (cricketR + 8);

          const standGroup = new THREE.Group();
          const stepsGeo = new THREE.BoxGeometry(20, 5, 8);
          const steps = new THREE.Mesh(stepsGeo, seatMat);
          steps.position.y = 2.5;
          steps.castShadow = true;
          standGroup.add(steps);

          const canopyRoofGeo = new THREE.BoxGeometry(22, 0.4, 11);
          const canopyRoof = new THREE.Mesh(canopyRoofGeo, standMat);
          canopyRoof.position.set(0, 7.5, 0);
          canopyRoof.rotation.x = -0.15;
          canopyRoof.castShadow = true;
          standGroup.add(canopyRoof);

          standGroup.position.set(sx, 0, sz);
          standGroup.rotation.y = -ang + Math.PI / 2;
          scene.add(standGroup);
        }

        const pylonCorners = [
          [cricketCenter[0] - 85, cricketCenter[1] - 85],
          [cricketCenter[0] + 85, cricketCenter[1] - 85],
          [cricketCenter[0] - 85, cricketCenter[1] + 85],
          [cricketCenter[0] + 85, cricketCenter[1] + 85]
        ];
        pylonCorners.forEach(([px, pz]) => {
          const poleGeo = new THREE.CylinderGeometry(0.6, 1.2, 38, 8);
          const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
          const pole = new THREE.Mesh(poleGeo, poleMat);
          pole.position.set(px, 19, pz);
          pole.castShadow = true;
          scene.add(pole);

          const headGeo = new THREE.BoxGeometry(6, 3, 2);
          const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.4 });
          const head = new THREE.Mesh(headGeo, headMat);
          head.position.set(px, 38, pz);
          scene.add(head);

          const spot = new THREE.PointLight(0xfef08a, 0.8, 180);
          spot.position.set(px, 37, pz);
          nightGroup.add(spot);
        });

        const treeList = campusData.trees || [];
        if (treeList.length > 0) {
          const foliageGeo = new THREE.ConeGeometry(3.3, 8.5, 7);
          foliageGeo.translate(0, 5.2, 0);
          const foliageMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
          const treeInst = new THREE.InstancedMesh(foliageGeo, foliageMat, treeList.length);
          treeInst.castShadow = true;

          const dummy = new THREE.Object3D();
          const treeColors = [0x15803d, 0x166534, 0x22c55e, 0x14532d];

          treeList.forEach((t: any, i: number) => {
            const [tx, tz, h] = t;
            const s = Math.max(1.2, (h / 4.5) * 1.35);
            dummy.position.set(tx, 0, -tz);
            dummy.scale.set(s, s, s);
            dummy.rotation.y = (tx * tz) % (Math.PI * 2);
            dummy.updateMatrix();
            treeInst.setMatrixAt(i, dummy.matrix);
            treeInst.setColorAt(i, new THREE.Color(treeColors[i % treeColors.length]));
          });
          treeInst.instanceMatrix.needsUpdate = true;
          if (treeInst.instanceColor) treeInst.instanceColor.needsUpdate = true;
          treeGroup.add(treeInst);
        }

        (campusData.landmarks || []).forEach((lm: any) => {
          const [lx, lz] = latLonToWorld(lm.lat, lm.lon);
          const pinGeo = new THREE.OctahedronGeometry(3.8, 0);
          const pinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.set(lx, (lm.height || 18) + 14, lz);
          pinMesh.userData = { isLandmarkPin: true, data: lm };

          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(lx, lm.height || 18, lz),
            new THREE.Vector3(lx, (lm.height || 18) + 12, lz)
          ]);
          const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
          const line = new THREE.Line(lineGeo, lineMat);

          pinsGroup.add(pinMesh, line);
        });
      })
      .catch(err => console.error('Failed loading campus_data.json:', err));

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (walkControls.current.isMouseDown && viewModeRef.current === 'walk') {
        const dx = e.clientX - walkControls.current.prevX;
        const dy = e.clientY - walkControls.current.prevY;
        walkControls.current.yaw -= dx * 0.0035;
        walkControls.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, walkControls.current.pitch - dy * 0.0035));
        walkControls.current.prevX = e.clientX;
        walkControls.current.prevY = e.clientY;
      }

      const activeCam = currentCamRef.current;
      if (activeCam && viewModeRef.current !== 'walk') {
        raycaster.setFromCamera(mouse, activeCam);
        const meshes = Array.from(buildingMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const b = hit.userData.data;
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY - 12,
            title: b.name,
            subtitle: `${b.category || 'Academic'} • ${b.height}m height • ${b.building_levels || b.levels || 4} floors`
          });
        } else {
          setTooltip(prev => prev ? { ...prev, visible: false } : null);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (viewModeRef.current === 'walk') {
        walkControls.current.isMouseDown = true;
        walkControls.current.prevX = e.clientX;
        walkControls.current.prevY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      walkControls.current.isMouseDown = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (viewModeRef.current === 'walk') return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const activeCam = currentCamRef.current;
      if (!activeCam) return;
      raycaster.setFromCamera(mouse, activeCam);

      const pinIntersects = raycaster.intersectObjects(pinsGroup.children, false);
      if (pinIntersects.length > 0) {
        const pinHit = pinIntersects[0].object;
        if (pinHit.userData.data) {
          const lm = pinHit.userData.data;
          const [lx, lz] = latLonToWorld(lm.lat, lm.lon);
          animateCameraTo(lx, lz, Math.max(70, (lm.height || 18) * 2.2));
          if (onSelectPOI) {
            onSelectPOI(lm, [lm.lon, lm.lat]);
          }
          return;
        }
      }

      const meshes = Array.from(buildingMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const b = hit.userData.data;
        const [wLon, wLat] = worldToLatLon(b.center[0], -b.center[1]);

        animateCameraTo(b.center[0], -b.center[1], Math.max(80, (b.height || 18) * 2.5));

        meshes.forEach(m => {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          if (mats[0] instanceof THREE.MeshStandardMaterial && m.userData.originalRoofColor) {
            mats[0].color.copy(m.userData.originalRoofColor);
          }
          if (mats[1] instanceof THREE.MeshStandardMaterial && m.userData.originalWallColor) {
            mats[1].color.copy(m.userData.originalWallColor);
          }
        });
        const hitMats = Array.isArray(hit.material) ? hit.material : [hit.material];
        if (hitMats[0] instanceof THREE.MeshStandardMaterial) {
          hitMats[0].color.set(0x38bdf8);
        }
        if (hitMats[1] instanceof THREE.MeshStandardMaterial) {
          hitMats[1].color.set(0x0284c7);
        }

        if (onSelectBuilding) {
          onSelectBuilding({
            id: b.id,
            name: b.name,
            block_code: b.block ? `Block ${b.block}` : '',
            category: b.category || 'academic',
            height: b.height || 18,
            min_height: 0,
            building_levels: b.levels || b.building_levels || 4,
            color: b.wall_color || '#f8fafc',
            confidence: 'high',
            source: 'satellite',
            description: b.description || b.desc,
            photo: b.photo,
          }, [wLon, wLat]);
        }
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('click', handleClick);

    let animId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const delta = clock.getDelta();

      if (camTransition.current && camTransition.current.active) {
        const t = (performance.now() - camTransition.current.startTime) / camTransition.current.duration;
        if (t >= 1) {
          perspectiveCam.position.copy(camTransition.current.endCamPos);
          controls.target.copy(camTransition.current.endTarget);
          perspectiveCam.lookAt(controls.target);
          controls.update();
          camTransition.current.active = false;
        } else {
          const ease = 1 - Math.pow(1 - t, 3);
          perspectiveCam.position.lerpVectors(camTransition.current.startCamPos, camTransition.current.endCamPos, ease);
          controls.target.lerpVectors(camTransition.current.startTarget, camTransition.current.endTarget, ease);
          perspectiveCam.lookAt(controls.target);
          controls.update();
        }
      }

      if (viewModeRef.current === 'walk') {
        const uLoc = userLocationRef.current;
        if (uLoc && isNavigatingRef.current) {
          // Real-Time GPS Tracking in First-Person Walk Mode
          const [wx, wz] = latLonToWorld(uLoc.latitude, uLoc.longitude);
          const targetPos = new THREE.Vector3(wx, 2.2, wz);
          perspectiveCam.position.lerp(targetPos, Math.min(1.0, 6.0 * delta));

          if (uLoc.heading !== null && uLoc.heading !== undefined) {
            const targetYaw = -THREE.MathUtils.degToRad(uLoc.heading);
            let diff = targetYaw - walkControls.current.yaw;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            walkControls.current.yaw += diff * Math.min(1.0, 5.0 * delta);
          }

          if (userMarkerGroupRef.current) userMarkerGroupRef.current.visible = false;
        } else {
          if (walkControls.current.turnLeft) walkControls.current.yaw += 2.0 * delta;
          if (walkControls.current.turnRight) walkControls.current.yaw -= 2.0 * delta;

          const baseSpeed = 22; // Natural campus exploration speed
          const speed = (walkControls.current.sprint ? 44 : baseSpeed) * delta;

          const forward = new THREE.Vector3(
            -Math.sin(walkControls.current.yaw),
            0,
            -Math.cos(walkControls.current.yaw)
          );
          const right = new THREE.Vector3(
            Math.cos(walkControls.current.yaw),
            0,
            -Math.sin(walkControls.current.yaw)
          );

          if (walkControls.current.forward) perspectiveCam.position.addScaledVector(forward, speed);
          if (walkControls.current.backward) perspectiveCam.position.addScaledVector(forward, -speed);
          if (walkControls.current.left) perspectiveCam.position.addScaledVector(right, -speed);
          if (walkControls.current.right) perspectiveCam.position.addScaledVector(right, speed);
        }

        // Keep pedestrian eye height strictly at human eye level
        perspectiveCam.position.y = 2.2;

        // Campus boundary safety clamp
        perspectiveCam.position.x = Math.max(-1400, Math.min(1400, perspectiveCam.position.x));
        perspectiveCam.position.z = Math.max(-1600, Math.min(1600, perspectiveCam.position.z));

        const lookTarget = perspectiveCam.position.clone().add(
          new THREE.Vector3(
            -Math.sin(walkControls.current.yaw) * Math.cos(walkControls.current.pitch),
            Math.sin(walkControls.current.pitch),
            -Math.cos(walkControls.current.yaw) * Math.cos(walkControls.current.pitch)
          )
        );
        perspectiveCam.lookAt(lookTarget);
      } else if (viewModeRef.current === 'tour') {
        tourAngle.current += delta * 0.12;
        const tourR = 600;
        perspectiveCam.position.set(
          Math.cos(tourAngle.current) * tourR,
          320 + Math.sin(tourAngle.current * 0.5) * 80,
          Math.sin(tourAngle.current) * tourR
        );
        controls.target.set(0, 0, 0);
        controls.update();
      } else {
        if (!camTransition.current || !camTransition.current.active) {
          controls.update();
        }
      }

      // Update 3D User GPS Marker Avatar in non-walk modes
      if (viewModeRef.current !== 'walk' && userMarkerGroupRef.current) {
        const uLoc = userLocationRef.current;
        if (uLoc) {
          userMarkerGroupRef.current.visible = true;
          const [wx, wz] = latLonToWorld(uLoc.latitude, uLoc.longitude);
          userMarkerGroupRef.current.position.set(wx, 1.2, wz);
          if (uLoc.heading !== null && uLoc.heading !== undefined) {
            userMarkerGroupRef.current.rotation.y = -THREE.MathUtils.degToRad(uLoc.heading);
          }
          const radarRing = userMarkerGroupRef.current.userData.radarRing as THREE.Mesh;
          if (radarRing) {
            const pulse = (performance.now() % 1600) / 1600;
            radarRing.scale.set(1 + pulse * 2.0, 1 + pulse * 2.0, 1);
            (radarRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 * (1 - pulse));
          }
        } else {
          userMarkerGroupRef.current.visible = false;
        }
      }

      pinsGroup.children.forEach((c, idx) => {
        if (c instanceof THREE.Mesh && c.userData.isLandmarkPin) {
          c.rotation.y += delta * 1.5;
          c.position.y += Math.sin(performance.now() * 0.003 + idx) * 0.05;
        }
      });

      const camToRender = currentCamRef.current || perspectiveCam;
      renderer.render(scene, camToRender);
    };

    render();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      const asp = w / h;
      perspectiveCam.aspect = asp;
      perspectiveCam.updateProjectionMatrix();

      orthoCam.left = -orthoD * asp;
      orthoCam.right = orthoD * asp;
      orthoCam.top = orthoD;
      orthoCam.bottom = -orthoD;
      orthoCam.updateProjectionMatrix();

      renderer.setSize(w, h);
    });

    resizeObserver.observe(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewModeRef.current !== 'walk') return;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') walkControls.current.forward = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') walkControls.current.backward = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') walkControls.current.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') walkControls.current.right = true;
      if (e.key === 'q' || e.key === 'Q') walkControls.current.turnLeft = true;
      if (e.key === 'e' || e.key === 'E') walkControls.current.turnRight = true;
      if (e.key === 'Shift') {
        walkControls.current.sprint = true;
        setSprintActive(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (viewModeRef.current !== 'walk') return;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') walkControls.current.forward = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') walkControls.current.backward = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') walkControls.current.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') walkControls.current.right = false;
      if (e.key === 'q' || e.key === 'Q') walkControls.current.turnLeft = false;
      if (e.key === 'e' || e.key === 'E') walkControls.current.turnRight = false;
      if (e.key === 'Shift') {
        walkControls.current.sprint = false;
        setSprintActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
    };
  }, [onSelectBuilding, onSelectPOI, animateCameraTo]);

  useEffect(() => {
    if (satelliteMeshRef.current && groundMeshRef.current) {
      satelliteMeshRef.current.visible = satelliteBasemap;
      groundMeshRef.current.visible = !satelliteBasemap;
      if (roadsGroupRef.current) roadsGroupRef.current.visible = !satelliteBasemap;
    }
  }, [satelliteBasemap]);

  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;
    const sunAngle = ((timeOfDay - 6) / 12) * Math.PI;
    const isDay = timeOfDay >= 6.5 && timeOfDay <= 18.5;

    if (isDay) {
      const sunHeight = Math.sin(sunAngle) * 750;
      const sunX = -Math.cos(sunAngle) * 650;
      dirLightRef.current.position.set(sunX, Math.max(80, sunHeight), -380);
      dirLightRef.current.intensity = Math.max(0.55, Math.sin(sunAngle) * 1.25);
      hemiLightRef.current.intensity = Math.max(0.40, Math.sin(sunAngle) * 0.70);
      sceneRef.current.background = new THREE.Color(0x93c5fd);
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.set(0xbfe0fb);
      }
      if (nightLightsGroupRef.current) nightLightsGroupRef.current.visible = false;
    } else {
      dirLightRef.current.intensity = 0.12;
      hemiLightRef.current.intensity = 0.22;
      sceneRef.current.background = new THREE.Color(0x020617);
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.set(0x020617);
      }
      if (nightLightsGroupRef.current) nightLightsGroupRef.current.visible = true;
    }
  }, [timeOfDay]);

  useEffect(() => {
    if (!routeGroupRef.current) return;
    while (routeGroupRef.current.children.length > 0) {
      routeGroupRef.current.remove(routeGroupRef.current.children[0]);
    }

    if (!routeCoordinates || routeCoordinates.length < 2) return;

    const points: THREE.Vector3[] = routeCoordinates.map(([lon, lat]) => {
      const [wx, wz] = latLonToWorld(lat, lon);
      return new THREE.Vector3(wx, 1.2, wz);
    });

    // Centripetal Catmull-Rom prevents overshoot at road intersections
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.15);
    const tubeSegments = Math.max(points.length * 8, 80);
    const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 1.8, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Neon cyan
      depthTest: true,
      depthWrite: false,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    routeGroupRef.current.add(tube);

    // Glowing outline ribbon for crisp visibility
    const innerTubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.9, 8, false);
    const innerTubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerTube = new THREE.Mesh(innerTubeGeo, innerTubeMat);
    innerTube.position.y += 0.15;
    routeGroupRef.current.add(innerTube);

    const startMesh = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    startMesh.position.copy(points[0]);
    const endMesh = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    endMesh.position.copy(points[points.length - 1]);
    routeGroupRef.current.add(startMesh, endMesh);

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minZ = Math.min(...points.map(p => p.z));
    const maxZ = Math.max(...points.map(p => p.z));
    const midX = (minX + maxX) / 2;
    const midZ = (minZ + maxZ) / 2;
    const dist = Math.max(Math.hypot(maxX - minX, maxZ - minZ) * 1.3, 160);

    animateCameraTo(midX, midZ, dist);
  }, [routeCoordinates, animateCameraTo]);

  useEffect(() => {
    if (!focusTarget) return;
    const [wx, wz] = latLonToWorld(focusTarget.lat, focusTarget.lng);
    animateCameraTo(wx, wz, 120);

    if (focusTarget.id && buildingMeshesRef.current.has(focusTarget.id)) {
      const mesh = buildingMeshesRef.current.get(focusTarget.id)!;
      buildingMeshesRef.current.forEach(m => {
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        if (mats[0] instanceof THREE.MeshStandardMaterial && m.userData.originalRoofColor) {
          mats[0].color.copy(m.userData.originalRoofColor);
        }
        if (mats[1] instanceof THREE.MeshStandardMaterial && m.userData.originalWallColor) {
          mats[1].color.copy(m.userData.originalWallColor);
        }
      });
      const hitMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      if (hitMats[0] instanceof THREE.MeshStandardMaterial) {
        hitMats[0].color.set(0x38bdf8);
      }
      if (hitMats[1] instanceof THREE.MeshStandardMaterial) {
        hitMats[1].color.set(0x0284c7);
      }
    }
  }, [focusTarget, animateCameraTo]);

  useEffect(() => {
    if (!selectedBuildingId || !buildingMeshesRef.current.has(selectedBuildingId)) return;
    const mesh = buildingMeshesRef.current.get(selectedBuildingId)!;
    buildingMeshesRef.current.forEach(m => {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      if (mats[0] instanceof THREE.MeshStandardMaterial && m.userData.originalRoofColor) {
        mats[0].color.copy(m.userData.originalRoofColor);
      }
      if (mats[1] instanceof THREE.MeshStandardMaterial && m.userData.originalWallColor) {
        mats[1].color.copy(m.userData.originalWallColor);
      }
    });
    const hitMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (hitMats[0] instanceof THREE.MeshStandardMaterial) {
      hitMats[0].color.set(0x38bdf8);
    }
    if (hitMats[1] instanceof THREE.MeshStandardMaterial) {
      hitMats[1].color.set(0x0284c7);
    }
  }, [selectedBuildingId]);

  const handleSwitchView = (mode: 'isometric' | 'topdown' | 'walk' | 'tour') => {
    setViewMode(mode);
    viewModeRef.current = mode;
    if (!controlsRef.current || !perspectiveCamRef.current) return;

    if (camTransition.current) {
      camTransition.current.active = false;
    }

    currentCamRef.current = perspectiveCamRef.current;

    if (mode === 'topdown') {
      controlsRef.current.enabled = true;
      controlsRef.current.maxPolarAngle = Math.PI / 2.05;
      
      // Smoothly transition perspective camera straight above current target or campus center
      const curTarget = controlsRef.current.target.clone();
      const targetX = Math.abs(curTarget.x) > 10 ? curTarget.x : 0;
      const targetZ = Math.abs(curTarget.z) > 10 ? curTarget.z : 0;
      
      // Set camera looking directly down with a tiny 0.1 offset to prevent Euler gimbal singularity in OrbitControls
      const topDownCamPos = new THREE.Vector3(targetX, 950, targetZ + 0.5);
      const topDownTarget = new THREE.Vector3(targetX, 0, targetZ);

      camTransition.current = {
        active: true,
        startCamPos: perspectiveCamRef.current.position.clone(),
        endCamPos: topDownCamPos,
        startTarget: controlsRef.current.target.clone(),
        endTarget: topDownTarget,
        startTime: performance.now(),
        duration: 900
      };
    } else if (mode === 'walk') {
      controlsRef.current.enabled = false;

      // Determine pedestrian spawn point: if user GPS is available, spawn directly at GPS position!
      let spawnX = 160;
      let spawnZ = -380;
      const uLoc = userLocationRef.current;
      if (uLoc) {
        const [wx, wz] = latLonToWorld(uLoc.latitude, uLoc.longitude);
        spawnX = wx;
        spawnZ = wz;
      } else {
        const curTarget = controlsRef.current.target;
        if (curTarget && Math.hypot(curTarget.x, curTarget.z) > 15) {
          spawnX = curTarget.x;
          spawnZ = curTarget.z + 25;
        }
      }

      perspectiveCamRef.current.position.set(spawnX, 2.2, spawnZ);
      walkControls.current.yaw = (uLoc && uLoc.heading !== null && uLoc.heading !== undefined)
        ? -THREE.MathUtils.degToRad(uLoc.heading)
        : 0;
      walkControls.current.pitch = 0;
      walkControls.current.forward = false;
      walkControls.current.backward = false;
      walkControls.current.left = false;
      walkControls.current.right = false;
      walkControls.current.turnLeft = false;
      walkControls.current.turnRight = false;
      walkControls.current.sprint = false;
      walkControls.current.isMouseDown = false;
      setSprintActive(false);
    } else if (mode === 'tour') {
      controlsRef.current.enabled = false;
      tourAngle.current = 0;
    } else {
      // 'isometric'
      controlsRef.current.enabled = true;
      controlsRef.current.maxPolarAngle = Math.PI / 2.05;
      const curTarget = controlsRef.current.target.clone();
      const isoDist = 580;
      const isoTargetPos = new THREE.Vector3(
        curTarget.x + isoDist * 0.82,
        isoDist * 0.95,
        curTarget.z + isoDist * 1.05
      );
      camTransition.current = {
        active: true,
        startCamPos: perspectiveCamRef.current.position.clone(),
        endCamPos: isoTargetPos,
        startTarget: curTarget.clone(),
        endTarget: curTarget.clone(),
        startTime: performance.now(),
        duration: 800
      };
    }
  };

  useImperativeHandle(ref, () => ({
    toggleBasemap: () => {
      setSatelliteBasemap(prev => !prev);
    },
    setBasemapMode: (mode: 'dark' | 'satellite') => {
      setSatelliteBasemap(mode === 'satellite');
    },
    toggleViewMode: () => {
      const nextMode = viewModeRef.current === 'topdown' ? 'isometric' : 'topdown';
      handleSwitchView(nextMode);
    },
    setViewMode: (mode: 'isometric' | 'topdown' | 'walk' | 'tour') => {
      handleSwitchView(mode);
    },
    resetView: () => {
      if (viewModeRef.current === 'walk' || viewModeRef.current === 'tour') {
        handleSwitchView('isometric');
      }
      animateCameraTo(0, 0, 800);
    },
    orientNorth: () => {
      if (!controlsRef.current || !perspectiveCamRef.current) return;
      const target = controlsRef.current.target;
      const currentDist = perspectiveCamRef.current.position.distanceTo(target);
      const elevAngle = Math.PI / 4.5;
      const targetCamPos = new THREE.Vector3(
        target.x,
        target.y + currentDist * Math.sin(elevAngle),
        target.z + currentDist * Math.cos(elevAngle)
      );
      camTransition.current = {
        active: true,
        startCamPos: perspectiveCamRef.current.position.clone(),
        endCamPos: targetCamPos,
        startTarget: target.clone(),
        endTarget: target.clone(),
        startTime: performance.now(),
        duration: 900
      };
    },
    flyTo: (lng: number, lat: number, distance: number = 140) => {
      const [wx, wz] = latLonToWorld(lat, lng);
      animateCameraTo(wx, wz, distance);
    },
    centerOnUser: () => {
      const uLoc = userLocationRef.current;
      if (uLoc) {
        const [wx, wz] = latLonToWorld(uLoc.latitude, uLoc.longitude);
        animateCameraTo(wx, wz, 120);
      }
    },
    startWalkNavigation: (startLng: number, startLat: number) => {
      const [wx, wz] = latLonToWorld(startLat, startLng);
      handleSwitchView('walk');
      if (perspectiveCamRef.current) {
        perspectiveCamRef.current.position.set(wx, 2.2, wz);
      }
    },
  }), [animateCameraTo]);

  const handleJumpToSector = (sector: string) => {
    const sectorData: Record<string, {
      coords: [number, number, number];
      buildingProps?: GISBuildingProperties;
      poiCoords?: [number, number];
    }> = {
      maingate: {
        coords: [66, -522, 240],
        poiCoords: [75.7065, 31.2515],
        buildingProps: {
          id: 'gate-01',
          name: 'Main Gate 1 (GT Road NH-44)',
          block_code: 'GATE-1',
          category: 'gate',
          height: 12,
          min_height: 0,
          building_levels: 2,
          color: '#F59E0B',
          confidence: 'high',
          source: 'satellite',
          description: 'Grand architectural entrance portal connecting Lovely Professional University directly to Grand Trunk Road (National Highway 44).',
          facilities: ['Visitor Registration', 'Security Post', 'Drop-off Zone', 'Bus Terminus'],
          photo: '/photos/gate1.jpg'
        }
      },
      block32: {
        coords: [146, -192, 160],
        poiCoords: [75.7013, 31.2536],
        buildingProps: {
          id: 'b-29-32',
          name: 'Block 32 - Central Administration & Executive Offices',
          block_code: 'B-29-32',
          category: 'administration',
          height: 24,
          min_height: 0,
          building_levels: 6,
          color: '#0F766E',
          confidence: 'high',
          source: 'satellite',
          description: 'The monumental administrative core of LPU housing the Chancellor & Vice-Chancellor offices, Registrar, Academic Affairs, and International Relations.',
          facilities: ['Registrar Office', 'Executive Boardrooms', 'Student Help Desk', 'Examination Cell'],
          has_indoor_map: false,
          photo: '/photos/block32.jpg'
        }
      },
      amphitheater: {
        coords: [65, -33, 140],
        poiCoords: [75.7032, 31.2537],
        buildingProps: {
          id: 'unipolis',
          name: 'Unipolis Grand Amphitheatre',
          block_code: 'UNIPOLIS',
          category: 'auditorium',
          height: 22,
          min_height: 0,
          building_levels: 3,
          color: '#8B5CF6',
          confidence: 'high',
          source: 'satellite',
          description: 'Colossal open-air amphitheatre covered by high-tensile canopy membrane accommodating up to 10,000 students for concerts, summits, and festivals.',
          facilities: ['Main Stage', 'Acoustic Sound System', 'Terrace Seating', 'Green Rooms'],
          photo: '/photos/unipolis.jpg'
        }
      },
      cricket: {
        coords: [-199, 652, 240],
        poiCoords: [75.6998, 31.2546],
        buildingProps: {
          id: 'cricket-stadium',
          name: 'LPU Cricket Stadium & Athletic Track',
          block_code: 'STADIUM',
          category: 'sports',
          height: 14,
          min_height: 0,
          building_levels: 2,
          color: '#16A34A',
          confidence: 'high',
          source: 'satellite',
          description: 'BCCI-standard 80m boundary cricket oval featuring natural turf pitches, floodlit match towers, pavilions, and an Olympic 400m synthetic running track.',
          facilities: ['Turf Pitches', 'Olympic Running Track', 'Pavilion Stands', 'Floodlights'],
          photo: '/photos/cricket.jpg'
        }
      },
      hostel: {
        coords: [210, -370, 260],
        poiCoords: [75.7025, 31.2552],
        buildingProps: {
          id: 'bh-1-2',
          name: 'Boys Hostels BH-1 & BH-2 Complex',
          block_code: 'BH-1/2',
          category: 'hostel',
          height: 32,
          min_height: 0,
          building_levels: 9,
          color: '#0D9488',
          confidence: 'high',
          source: 'satellite',
          description: 'High-capacity 9-story residential hostel towers featuring student dining mess, late-night food plazas, study lounges, gymnasium, and sports courts.',
          facilities: ['Student Mess', '24/7 Security', 'High-Speed Wi-Fi', 'Gymnasium', 'Laundry'],
          photo: '/photos/hostel.jpg'
        }
      }
    };

    const targetInfo = sectorData[sector];
    if (targetInfo) {
      animateCameraTo(targetInfo.coords[0], targetInfo.coords[1], targetInfo.coords[2]);
      if (targetInfo.buildingProps && onSelectBuilding && targetInfo.poiCoords) {
        onSelectBuilding(targetInfo.buildingProps, targetInfo.poiCoords);
      }
    } else {
      animateCameraTo(0, 0, 800);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-grab active:cursor-grabbing" />

      {/* Sleek Collapsible Bottom-Left Twin HUD Dock */}
      <div className="absolute bottom-16 left-6 z-20 flex flex-col gap-1.5 max-w-sm pointer-events-none">
        {/* Main Compact Camera Modes Pill */}
        <div className="flex items-center gap-1 p-1 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
          <button
            data-testid="btn-isometric"
            onClick={() => handleSwitchView('isometric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'isometric'
                ? 'bg-[#ff5e1e] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye size={13} />
            <span>Isometric</span>
          </button>
          <button
            data-testid="btn-topdown"
            onClick={() => handleSwitchView('topdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'topdown'
                ? 'bg-[#ff5e1e] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapIcon size={13} />
            <span>Top-Down</span>
          </button>
          <button
            onClick={() => handleSwitchView('walk')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'walk'
                ? 'bg-[#ff5e1e] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Footprints size={13} />
            <span>Walk</span>
          </button>
          <button
            onClick={() => handleSwitchView('tour')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'tour'
                ? 'bg-[#ff5e1e] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video size={13} />
            <span>Tour</span>
          </button>
          {/* Expand/Collapse More Controls Toggle */}
          <button
            onClick={() => setHudExpanded(prev => !prev)}
            className={`p-1.5 rounded-xl text-xs transition-all border ${
              hudExpanded 
                ? 'bg-white/10 text-white border-white/20' 
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
            title={hudExpanded ? 'Hide Sector & Lighting Controls' : 'Show Sector & Lighting Controls'}
          >
            <Sliders size={13} />
          </button>
        </div>

        {/* Collapsible Sector Shortcuts & Sun Slider (Clean by default) */}
        {hudExpanded && (
          <div className="flex flex-col gap-1.5 p-2 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Sector Shortcuts */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'maingate', label: '🚪 Gate 1' },
                { id: 'block32', label: '🏛️ Block 32' },
                { id: 'amphitheater', label: '🎭 Amphitheatre' },
                { id: 'cricket', label: '🏏 Cricket' },
                { id: 'hostel', label: '🏠 Hostels' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToSector(s.id)}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-medium text-slate-300 hover:text-white transition-all active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Daylight Sun Slider */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              {timeOfDay >= 6.5 && timeOfDay <= 18.5 ? (
                <Sun size={13} className="text-amber-400 flex-shrink-0" />
              ) : (
                <Moon size={13} className="text-indigo-400 flex-shrink-0" />
              )}
              <input
                type="range"
                min="6"
                max="22"
                step="0.5"
                value={timeOfDay}
                onChange={e => setTimeOfDay(parseFloat(e.target.value))}
                className="w-24 accent-[#ff5e1e] h-1 bg-white/20 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono font-semibold text-slate-300">
                {Math.floor(timeOfDay).toString().padStart(2, '0')}:{(timeOfDay % 1) * 60 === 0 ? '00' : '30'}
              </span>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'walk' && (
        <>
          {/* Top Center Walk Mode HUD Header */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl text-xs text-slate-200 pointer-events-auto">
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <Footprints size={16} />
              <span>WALK MODE</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 border-l border-white/10 pl-3 text-[11px]">
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-white text-[10px]">W A S D</kbd> Move</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-white text-[10px]">Drag</kbd> Look</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-white text-[10px]">Q / E</kbd> Turn</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-white text-[10px]">Shift</kbd> Sprint</span>
            </div>
            <button
              onClick={() => handleSwitchView('isometric')}
              className="ml-2 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl font-medium transition-all text-[11px]"
            >
              Exit
            </button>
          </div>

          {/* Bottom-Right On-Screen D-Pad & Action Buttons (Touch/Mouse support) */}
          <div className="absolute bottom-24 right-4 z-30 flex flex-col items-center gap-1.5 p-3 bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl pointer-events-auto select-none">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Controls</div>
            {/* Forward */}
            <button
              onPointerDown={(e) => { e.preventDefault(); walkControls.current.forward = true; }}
              onPointerUp={(e) => { e.preventDefault(); walkControls.current.forward = false; }}
              onPointerLeave={(e) => { e.preventDefault(); walkControls.current.forward = false; }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold shadow-md active:scale-95 transition-all text-sm"
              title="Walk Forward (W / Up)"
            >
              ▲
            </button>
            {/* Turn Left, Strafe Left, Strafe Right, Turn Right */}
            <div className="flex items-center gap-1.5">
              <button
                onPointerDown={(e) => { e.preventDefault(); walkControls.current.turnLeft = true; }}
                onPointerUp={(e) => { e.preventDefault(); walkControls.current.turnLeft = false; }}
                onPointerLeave={(e) => { e.preventDefault(); walkControls.current.turnLeft = false; }}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-400 flex items-center justify-center text-xs active:scale-95 transition-all font-bold"
                title="Turn Left (Q)"
              >
                ↺
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); walkControls.current.left = true; }}
                onPointerUp={(e) => { e.preventDefault(); walkControls.current.left = false; }}
                onPointerLeave={(e) => { e.preventDefault(); walkControls.current.left = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold shadow-md active:scale-95 transition-all text-sm"
                title="Strafe Left (A / Left)"
              >
                ◄
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); walkControls.current.right = true; }}
                onPointerUp={(e) => { e.preventDefault(); walkControls.current.right = false; }}
                onPointerLeave={(e) => { e.preventDefault(); walkControls.current.right = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold shadow-md active:scale-95 transition-all text-sm"
                title="Strafe Right (D / Right)"
              >
                ►
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); walkControls.current.turnRight = true; }}
                onPointerUp={(e) => { e.preventDefault(); walkControls.current.turnRight = false; }}
                onPointerLeave={(e) => { e.preventDefault(); walkControls.current.turnRight = false; }}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-400 flex items-center justify-center text-xs active:scale-95 transition-all font-bold"
                title="Turn Right (E)"
              >
                ↻
              </button>
            </div>
            {/* Backward & Sprint */}
            <div className="flex items-center gap-1.5">
              <button
                onPointerDown={(e) => { e.preventDefault(); walkControls.current.backward = true; }}
                onPointerUp={(e) => { e.preventDefault(); walkControls.current.backward = false; }}
                onPointerLeave={(e) => { e.preventDefault(); walkControls.current.backward = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold shadow-md active:scale-95 transition-all text-sm"
                title="Walk Backward (S / Down)"
              >
                ▼
              </button>
              <button
                onClick={() => {
                  walkControls.current.sprint = !walkControls.current.sprint;
                  setSprintActive(walkControls.current.sprint);
                }}
                className={`px-2.5 h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                  sprintActive ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Toggle Sprint (Shift)"
              >
                {sprintActive ? 'RUN ⚡' : 'WALK'}
              </button>
            </div>
          </div>
        </>
      )}

      {tooltip && tooltip.visible && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 bg-slate-950/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl max-w-xs -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-xs font-bold text-white leading-tight">{tooltip.title}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{tooltip.subtitle}</div>
        </div>
      )}
    </div>
  );
});

export default ArchitecturalTwinViewer;
