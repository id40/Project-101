'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Navigation, MapPin, X, Route, Clock, Ruler, 
  Footprints, Bike, Car, ArrowRight, ArrowUpDown, 
  Loader2, Search, Check, ChevronDown 
} from 'lucide-react';
import { findRouteByCoords } from '@/lib/campusRouter';
import { formatDistance, formatWalkTime } from '@/lib/gisUtils';
import type { NavigationRoute, NavigationMode } from '@/types/gis';
import { LPU_LOCATIONS } from '@/data/lpuSeedData';

interface NavigationPanelProps {
  origin: { id: string; name: string; lng: number; lat: number } | null;
  destination: { id: string; name: string; lng: number; lat: number } | null;
  onRouteFound: (route: NavigationRoute) => void;
  onClearRoute: () => void;
  onClose: () => void;
  onSelectOrigin?: (origin: { id: string; name: string; lng: number; lat: number }) => void;
  onSelectDestination?: (destination: { id: string; name: string; lng: number; lat: number }) => void;
  onSearchOrigin?: () => void;
  onSearchDestination?: () => void;
  onStartNavigation?: (route: NavigationRoute) => void;
  isNavigating?: boolean;
  onStopNavigation?: () => void;
  gpsLocation?: { latitude: number; longitude: number; heading?: number | null; accuracy?: number } | null;
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
  onSelectOrigin,
  onSelectDestination,
  onSearchOrigin,
  onSearchDestination,
  onStartNavigation,
  isNavigating = false,
  onStopNavigation,
  gpsLocation,
}: NavigationPanelProps) {
  const [activeMode, setActiveMode] = useState<NavigationMode>('walking');
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick-picker dropdown state ('origin' | 'destination' | null)
  const [pickerTarget, setPickerTarget] = useState<'origin' | 'destination' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const filteredLocations = useMemo(() => {
    if (!pickerSearch.trim()) return LPU_LOCATIONS.slice(0, 12);
    const q = pickerSearch.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    return LPU_LOCATIONS.filter(l => {
      const targetStr = `${l.name} ${l.block_code || ''} ${l.type} ${l.description || ''}`.toLowerCase();
      return tokens.every(t => 
        targetStr.includes(t) || 
        (t.endsWith('s') && targetStr.includes(t.slice(0, -1))) ||
        targetStr.includes(t + 's')
      );
    }).slice(0, 12);
  }, [pickerSearch]);

  const calculateRoute = useCallback(() => {
    if (!origin || !destination) return;

    setIsCalculating(true);
    setError(null);

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
      } catch (err) {
        console.error('Route calculation error:', err);
        setError('Failed to calculate route');
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  }, [origin, destination, activeMode, onRouteFound]);

  // Auto-calculate route whenever origin, destination, or mode changes
  useEffect(() => {
    if (origin && destination) {
      calculateRoute();
    }
  }, [origin?.id, origin?.lng, origin?.lat, destination?.id, destination?.lng, destination?.lat, activeMode, calculateRoute]);

  const handleClear = () => {
    setRoute(null);
    setError(null);
    onClearRoute();
  };

  const handleSwap = () => {
    if (!origin || !destination) return;
    if (onSelectOrigin && onSelectDestination) {
      const prevOrigin = origin;
      const prevDest = destination;
      onSelectOrigin(prevDest);
      onSelectDestination(prevOrigin);
    }
  };

  const handleSelectLocation = (loc: typeof LPU_LOCATIONS[0]) => {
    const locItem = { id: loc.id, name: loc.name, lng: loc.longitude, lat: loc.latitude };
    if (pickerTarget === 'origin') {
      if (onSelectOrigin) onSelectOrigin(locItem);
    } else if (pickerTarget === 'destination') {
      if (onSelectDestination) onSelectDestination(locItem);
    }
    setPickerTarget(null);
    setPickerSearch('');
  };

  return (
    <div className="absolute top-16 left-4 sm:left-6 z-40 w-84 sm:w-96 animate-slide-right">
      <div className="bg-[#0c0e14]/95 backdrop-blur-2xl border border-orange-500/40 hover:border-orange-500/70 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden transition-all text-white">
        {/* Stitch Header: Live Route Preview */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5e1e] animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#ff5e1e]">
              LIVE ROUTE PREVIEW
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Dijkstra
            </span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Origin / Destination Waypoints */}
        <div className="p-4 space-y-2 relative">
          {/* Origin */}
          <div className="relative">
            <button
              onClick={() => {
                if (onSelectOrigin) {
                  setPickerTarget(pickerTarget === 'origin' ? null : 'origin');
                  setPickerSearch('');
                } else if (onSearchOrigin) {
                  onSearchOrigin();
                }
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#1e1f26] hover:bg-[#282a30] border border-white/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Origin</div>
                  <div className={`text-xs font-semibold truncate ${origin ? 'text-white' : 'text-slate-400'}`}>
                    {origin?.name || 'Choose starting point...'}
                  </div>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Connector and Swap Button */}
          <div className="flex items-center justify-between px-6 py-0.5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-1.5 bg-[#ff5e1e]/40 rounded-full" />
              <div className="w-0.5 h-1.5 bg-[#ff5e1e]/40 rounded-full" />
            </div>
            {origin && destination && onSelectOrigin && onSelectDestination && (
              <button
                type="button"
                onClick={handleSwap}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all flex items-center gap-1 text-[10px] font-mono"
                title="Swap Origin & Destination"
              >
                <ArrowUpDown size={12} className="text-[#ff5e1e]" />
                <span>Swap</span>
              </button>
            )}
          </div>

          {/* Destination */}
          <div className="relative">
            <button
              onClick={() => {
                if (onSelectDestination) {
                  setPickerTarget(pickerTarget === 'destination' ? null : 'destination');
                  setPickerSearch('');
                } else if (onSearchDestination) {
                  onSearchDestination();
                }
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#1e1f26] hover:bg-[#282a30] border border-white/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-full bg-[#ff5e1e]/20 border-2 border-[#ff5e1e] flex items-center justify-center flex-shrink-0">
                  <MapPin size={12} className="text-[#ff5e1e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase text-[#ffb59d]">Destination</div>
                  <div className={`text-xs font-semibold truncate ${destination ? 'text-white' : 'text-slate-400'}`}>
                    {destination?.name || 'Select destination (e.g. Block 34 CSE)...'}
                  </div>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Inline Location Picker Dropdown */}
          {pickerTarget && (
            <div className="p-2 mt-2 rounded-xl bg-[#12141c] border border-white/15 shadow-2xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase text-[#ffb59d] font-bold">
                  Choose {pickerTarget === 'origin' ? 'Starting Point' : 'Destination'}
                </span>
                <button onClick={() => setPickerTarget(null)} className="p-0.5 text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campus blocks, hostels, gates..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#1e1f26] text-xs text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:border-[#ff5e1e]"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
                {filteredLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 text-left transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-white truncate">{loc.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 capitalize">{loc.block_code || loc.type}</div>
                    </div>
                    {((pickerTarget === 'origin' && origin?.id === loc.id) || 
                      (pickerTarget === 'destination' && destination?.id === loc.id)) && (
                      <Check size={14} className="text-emerald-400 ml-2 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stitch Mode Selectors */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {MODE_OPTIONS.map(opt => {
              const isActive = activeMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => { setActiveMode(opt.mode); setRoute(null); }}
                  className={`px-2 py-2 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-[#ff5e1e]/20 border-[#ff5e1e] text-white shadow-md shadow-[#ff5e1e]/20'
                      : 'bg-[#1e1f26] text-slate-400 hover:text-white border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </div>
                  <div className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-[#ffb59d]' : 'text-slate-400'}`}>
                    {opt.speed}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Walk Navigation CTA Button */}
        <div className="px-4 pb-4">
          {isNavigating ? (
            <button
              onClick={onStopNavigation}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-500/25 active:scale-[0.98]"
            >
              <span>Exit Walk Mode</span>
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (route && onStartNavigation) {
                  onStartNavigation(route);
                } else {
                  calculateRoute();
                }
              }}
              disabled={!origin || !destination || isCalculating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ff5e1e] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 active:scale-[0.98]"
            >
              {isCalculating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Routing Dijkstra Path...</span>
                </>
              ) : route ? (
                <>
                  <Footprints size={16} />
                  <span>Start Walk Navigation</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Calculate Route</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="px-4 pb-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          </div>
        )}

        {/* Live Route Calculated Result */}
        {route && (
          <div className="border-t border-white/10 p-4 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#ff5e1e]/20 text-[#ff5e1e]">
                  {activeMode === 'walking' ? <Footprints size={18} /> : activeMode === 'cycling' ? <Bike size={18} /> : <Car size={18} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{formatWalkTime(route.estimated_time_min)}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-400">{formatDistance(route.total_distance_m)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Via Campus Spine Promenade</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Optimal
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#1e1f26] p-2.5 rounded-xl border border-white/5">
              <span className="truncate font-medium">{route.origin_name}</span>
              <ArrowRight size={13} className="flex-shrink-0 text-[#ff5e1e]" />
              <span className="truncate font-medium">{route.destination_name}</span>
            </div>

            {/* Turn by turn waypoint route steps */}
            {route.path.length > 2 && (
              <div className="mt-3 p-2 rounded-xl bg-[#1e1f26]/50 border border-white/5 max-h-28 overflow-y-auto no-scrollbar space-y-1">
                <div className="text-[9px] font-mono text-slate-400 uppercase mb-1">Waypoints ({route.path.length} checkpoints)</div>
                {route.path.map((node, idx) => (
                  <div key={node.id + idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5e1e]" />
                    <span className="truncate">{node.name || `Junction ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleClear}
              className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors border border-white/5"
            >
              Clear Navigation Path
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
