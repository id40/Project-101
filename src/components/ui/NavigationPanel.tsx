'use client';

import React, { useState, useCallback } from 'react';
import { Navigation, MapPin, X, Route, Clock, Ruler, Footprints, Bike, Car, ArrowRight, Loader2 } from 'lucide-react';
import { findRouteByCoords } from '@/lib/campusRouter';
import { formatDistance, formatWalkTime } from '@/lib/gisUtils';
import type { NavigationRoute, NavigationMode } from '@/types/gis';

interface NavigationPanelProps {
  origin: { id: string; name: string; lng: number; lat: number } | null;
  destination: { id: string; name: string; lng: number; lat: number } | null;
  onRouteFound: (route: NavigationRoute) => void;
  onClearRoute: () => void;
  onClose: () => void;
  onSearchOrigin: () => void;
  onSearchDestination: () => void;
}

const MODE_OPTIONS: { mode: NavigationMode; label: string; icon: React.ReactNode; speed: string }[] = [
  { mode: 'walking', label: 'Walk', icon: <Footprints size={16} />, speed: '5 km/h' },
  { mode: 'cycling', label: 'Cycle', icon: <Bike size={16} />, speed: '15 km/h' },
  { mode: 'vehicle', label: 'Drive', icon: <Car size={16} />, speed: '25 km/h' },
];

export default function NavigationPanel({
  origin,
  destination,
  onRouteFound,
  onClearRoute,
  onClose,
  onSearchOrigin,
  onSearchDestination,
}: NavigationPanelProps) {
  const [activeMode, setActiveMode] = useState<NavigationMode>('walking');
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(() => {
    if (!origin || !destination) return;

    setIsCalculating(true);
    setError(null);

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      try {
        const result = findRouteByCoords(
          origin.lng, origin.lat,
          destination.lng, destination.lat,
          activeMode
        );

        if (result) {
          setRoute(result);
          onRouteFound(result);
        } else {
          setError('No route found between these locations');
        }
      } catch {
        setError('Failed to calculate route');
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  }, [origin, destination, activeMode, onRouteFound]);

  const handleClear = () => {
    setRoute(null);
    setError(null);
    onClearRoute();
  };

  return (
    <div className="absolute top-20 left-4 z-40 w-80 animate-slide-right">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Route size={16} className="text-indigo-400" />
            Campus Navigation
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Origin / Destination */}
        <div className="p-4 space-y-2">
          {/* Origin */}
          <button
            onClick={onSearchOrigin}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className={`text-sm truncate ${origin ? 'text-white' : 'text-slate-500'}`}>
              {origin?.name || 'Choose starting point...'}
            </span>
          </button>

          {/* Connector dots */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-1.5 bg-white/10 rounded-full" />
              <div className="w-0.5 h-1.5 bg-white/10 rounded-full" />
            </div>
          </div>

          {/* Destination */}
          <button
            onClick={onSearchDestination}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0">
              <MapPin size={12} className="text-indigo-400" />
            </div>
            <span className={`text-sm truncate ${destination ? 'text-white' : 'text-slate-500'}`}>
              {destination?.name || 'Choose destination...'}
            </span>
          </button>
        </div>

        {/* Mode selector */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
            {MODE_OPTIONS.map(opt => (
              <button
                key={opt.mode}
                onClick={() => { setActiveMode(opt.mode); setRoute(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeMode === opt.mode
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Find Route Button */}
        <div className="px-4 pb-4">
          <button
            onClick={calculateRoute}
            disabled={!origin || !destination || isCalculating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
          >
            {isCalculating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Navigation size={16} />
                Find Route
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          </div>
        )}

        {/* Route Result */}
        {route && (
          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5 text-white">
                <Ruler size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold">{formatDistance(route.total_distance_m)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <Clock size={14} className="text-amber-400" />
                <span className="text-sm font-semibold">{formatWalkTime(route.estimated_time_min)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate">{route.origin_name}</span>
              <ArrowRight size={12} className="flex-shrink-0 text-indigo-400" />
              <span className="truncate">{route.destination_name}</span>
            </div>

            <button
              onClick={handleClear}
              className="mt-3 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium transition-colors"
            >
              Clear Route
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
