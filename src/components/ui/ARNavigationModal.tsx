'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Compass, Navigation, X, Volume2, VolumeX, Maximize2, AlertCircle, RefreshCw } from 'lucide-react';
import type { NavigationRoute } from '@/types/gis';

interface ARNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: NavigationRoute | null;
  currentCoord?: [number, number];
  targetName?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function ARNavigationModal({
  isOpen,
  onClose,
  route,
  currentCoord,
  targetName = 'Destination',
  isMuted = false,
  onToggleMute,
}: ARNavigationModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [bearingToTarget, setBearingToTarget] = useState<number>(0);
  const [distanceToTarget, setDistanceToTarget] = useState<number>(0);

  // Target waypoint coords
  const targetCoord = route && route.coordinates.length > 0
    ? route.coordinates[route.coordinates.length - 1]
    : null;

  // Calculate bearing from user location to target
  const calculateBearing = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return (toDeg(θ) + 360) % 360;
  }, []);

  // Update distance and bearing
  useEffect(() => {
    if (!currentCoord || !targetCoord) return;
    const [userLon, userLat] = currentCoord;
    const [targetLon, targetLat] = targetCoord;

    const b = calculateBearing(userLat, userLon, targetLat, targetLon);
    setBearingToTarget(b);

    // Approximate distance in meters
    const R = 6371000;
    const dLat = ((targetLat - userLat) * Math.PI) / 180;
    const dLon = ((targetLon - userLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((targetLat * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistanceToTarget(Math.round(R * c));
  }, [currentCoord, targetCoord, calculateBearing]);

  // Device orientation / compass
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading on iOS, or alpha on Android
      let compass = (e as any).webkitCompassHeading;
      if (compass === undefined || compass === null) {
        compass = e.alpha !== null ? 360 - e.alpha : 0;
      }
      setHeading(Math.round(compass));
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isOpen]);

  // Start Camera Feed
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setStreamActive(false);
      return;
    }

    let isMounted = true;
    async function startCamera() {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported on this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Camera access error (simulating AR backdrop):', err.message);
          setCameraError(err.message || 'Camera permission denied or device not found.');
          setStreamActive(false);
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Relative heading difference between device direction and destination
  const relativeAngle = ((bearingToTarget - heading + 540) % 360) - 180;
  // Map relative angle to a horizontal screen offset (-100px to +100px)
  const clampedAngle = Math.max(-45, Math.min(45, relativeAngle));
  const screenXPercent = 50 + (clampedAngle / 45) * 35; // 15% to 85%

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden animate-fade-in">
      {/* ── REAL REAR CAMERA VIDEO FEED ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          streamActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Simulated camera viewfinder backdrop if camera is unavailable or denied */}
      {!streamActive && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#07111e] to-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="size-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 animate-pulse">
            <Camera size={36} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">AR Viewfinder Simulation Mode</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {cameraError
              ? `Real camera unavailable: ${cameraError}. Showing live sensor compass HUD.`
              : 'Initializing camera sensor feed...'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
            <RefreshCw size={12} className="animate-spin" /> Live Spatial Sensors Connected
          </div>
        </div>
      )}

      {/* ── AUGMENTED REALITY HUD OVERLAYS ── */}
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#ff5e1e] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Camera size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                NAVIA AR LIVE VISION
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs">{targetName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-xl border backdrop-blur-xl transition-all ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-black/60 border-white/15 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/15 text-white transition-all active:scale-95"
            title="Exit AR Mode"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Floating 3D Navigation Waypoint Arrow In Viewfinder */}
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 flex flex-col items-center"
        style={{ left: `${screenXPercent}%`, transform: 'translate(-50%, -50%)' }}
      >
        {/* Floating Destination Billboard */}
        <div className="px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-cyan-400 shadow-2xl shadow-cyan-500/40 text-center mb-4 animate-bounce">
          <div className="flex items-center gap-2 justify-center">
            <Navigation size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-white">{targetName}</span>
          </div>
          <div className="text-[11px] font-mono font-bold text-cyan-300 mt-0.5">
            {distanceToTarget > 0 ? `${distanceToTarget}m away` : 'Direct Path'}
          </div>
        </div>

        {/* 3D Directional Pulsing Neon Arrow */}
        <div
          className="size-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-2xl shadow-cyan-500/50 backdrop-blur-sm transition-transform duration-200"
          style={{ transform: `rotate(${relativeAngle}deg)` }}
        >
          <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[20px] border-b-cyan-300 -translate-y-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
      </div>

      {/* Grid Alignment Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="size-48 rounded-full border border-dashed border-white/40" />
        <div className="absolute w-64 h-px bg-white/20" />
        <div className="absolute h-64 w-px bg-white/20" />
      </div>

      {/* Bottom AR HUD Status Strip */}
      <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 max-w-lg mx-auto p-4 rounded-2xl bg-[#0c0e14]/90 backdrop-blur-2xl border border-white/15 shadow-2xl pointer-events-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-gradient-to-br from-[#ff5e1e] to-orange-600 flex flex-col items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <span className="text-xs font-black font-mono leading-none">
              {distanceToTarget > 0 ? `${distanceToTarget}` : '0'}
            </span>
            <span className="text-[9px] font-mono text-orange-100 uppercase">meters</span>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">NEXT CHECKPOINT</div>
            <div className="text-xs sm:text-sm font-bold text-white">
              {Math.abs(relativeAngle) < 15
                ? 'Head straight along paved walkway'
                : relativeAngle > 0
                ? `Bear right (${Math.round(relativeAngle)}°)`
                : `Bear left (${Math.abs(Math.round(relativeAngle))}°)`}
            </div>
          </div>
        </div>

        {/* Compass Dial Indicator */}
        <div className="flex flex-col items-center">
          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
            <Compass
              size={18}
              style={{ transform: `rotate(${heading}deg)` }}
              className="text-[#ff5e1e] transition-transform duration-100"
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">{heading}° N</span>
        </div>
      </div>
    </div>
  );
}
