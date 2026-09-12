'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { haversineDistance, bearingBetween } from '@/lib/gisUtils';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  heading: number | null; // degrees 0-360, 0 is North
  accuracy: number; // in meters
  speed: number | null; // in m/s
  timestamp: number;
}

export interface UseCampusGPSOptions {
  activeRouteCoords?: [number, number][]; // [lng, lat][]
  isNavigating?: boolean;
}

const LPU_CENTER = {
  lat: 31.2533,
  lng: 75.7032,
};

export function useCampusGPS({ activeRouteCoords, isNavigating }: UseCampusGPSOptions = {}) {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isOnCampus, setIsOnCampus] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const prevLocationRef = useRef<GPSLocation | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simIndexRef = useRef<number>(0);
  const simFractionRef = useRef<number>(0);

  // Check if coordinates are within LPU campus boundary (within ~2.5km of center)
  const checkCampusBounds = useCallback((lat: number, lng: number) => {
    const dist = haversineDistance(lat, lng, LPU_CENTER.lat, LPU_CENTER.lng);
    return dist <= 2500;
  }, []);

  // Request compass permission (required for iOS Safari 13+)
  const requestCompassPermission = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('Orientation permission error:', err);
        return false;
      }
    }
    return true;
  }, []);

  // Device orientation / Compass listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;
      // webkitCompassHeading is available on iOS Safari (0 = North)
      if ((e as any).webkitCompassHeading !== undefined) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Standard Android / Chrome (alpha 0 is North if absolute is true)
        heading = (360 - e.alpha) % 360;
      }
      if (heading !== null && !isNaN(heading)) {
        setCompassHeading(Math.round(heading));
      }
    };

    const win = window as any;
    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', handleOrientation);
    } else if ('ondeviceorientation' in win) {
      win.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      win.removeEventListener('deviceorientationabsolute', handleOrientation);
      win.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Real Geolocation Tracking
  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setError(null);
    setIsTracking(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, accuracy, speed } = position.coords;
        const inCampus = checkCampusBounds(latitude, longitude);
        setIsOnCampus(inCampus);

        // Derive heading from movement if phone compass is null
        let effectiveHeading = heading;
        if (effectiveHeading === null || isNaN(effectiveHeading)) {
          if (compassHeading !== null) {
            effectiveHeading = compassHeading;
          } else if (prevLocationRef.current) {
            const d = haversineDistance(prevLocationRef.current.latitude, prevLocationRef.current.longitude, latitude, longitude);
            if (d > 2) {
              effectiveHeading = bearingBetween(prevLocationRef.current.latitude, prevLocationRef.current.longitude, latitude, longitude);
            } else {
              effectiveHeading = prevLocationRef.current.heading;
            }
          }
        }

        const newLoc: GPSLocation = {
          latitude,
          longitude,
          heading: effectiveHeading,
          accuracy: accuracy || 5,
          speed: speed || 0,
          timestamp: position.timestamp,
        };

        prevLocationRef.current = newLoc;
        setLocation(newLoc);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        if (err.code === 1) {
          setError('Location access denied. Enable GPS in browser settings.');
        } else {
          setError('Searching for GPS satellites...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000,
      }
    );
  }, [checkCampusBounds, compassHeading]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Virtual Route Simulation: Moves along active route when navigating & off-campus/testing
  const startSimulation = useCallback((routeCoords: [number, number][]) => {
    if (!routeCoords || routeCoords.length < 2) return;
    setIsSimulating(true);
    simIndexRef.current = 0;
    simFractionRef.current = 0;

    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

    // Step every 400ms along the route
    simulationTimerRef.current = setInterval(() => {
      simFractionRef.current += 0.08;
      if (simFractionRef.current >= 1.0) {
        simFractionRef.current = 0;
        simIndexRef.current += 1;
      }

      if (simIndexRef.current >= routeCoords.length - 1) {
        const last = routeCoords[routeCoords.length - 1];
        setLocation({
          latitude: last[1],
          longitude: last[0],
          heading: compassHeading ?? 0,
          accuracy: 3,
          speed: 0,
          timestamp: Date.now(),
        });
        setIsSimulating(false);
        if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
        return;
      }

      const p1 = routeCoords[simIndexRef.current];
      const p2 = routeCoords[simIndexRef.current + 1];
      const t = simFractionRef.current;

      const lng = p1[0] + (p2[0] - p1[0]) * t;
      const lat = p1[1] + (p2[1] - p1[1]) * t;
      const heading = bearingBetween(p1[1], p1[0], p2[1], p2[0]);

      setLocation({
        latitude: lat,
        longitude: lng,
        heading: compassHeading !== null ? compassHeading : heading,
        accuracy: 3,
        speed: 1.4, // ~5 km/h walking speed
        timestamp: Date.now(),
      });
    }, 400);
  }, [compassHeading]);

  const stopSimulation = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // When navigation begins with active route coords
  useEffect(() => {
    if (isNavigating && activeRouteCoords && activeRouteCoords.length >= 2) {
      if (!location || !isOnCampus) {
        startSimulation(activeRouteCoords);
      }
    } else {
      if (isSimulating) {
        stopSimulation();
      }
    }
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isNavigating, activeRouteCoords, isOnCampus, startSimulation, stopSimulation]);

  // Initial GPS start
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return {
    location,
    isTracking,
    isOnCampus,
    isSimulating,
    error,
    compassHeading,
    startTracking,
    stopTracking,
    startSimulation,
    stopSimulation,
    requestCompassPermission,
  };
}
