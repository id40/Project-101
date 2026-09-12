'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, Radar, MapPin, Footprints, ArrowRight, Compass,
  Utensils, BookOpen, Building2, ShoppingBag, Heart, Dumbbell, Car,
  DoorOpen, TreePine, Sparkles, Navigation, Layers
} from 'lucide-react';
import type { GPSLocation } from '@/hooks/useCampusGPS';
import { haversineDistance, formatDistance, formatWalkTime } from '@/lib/gisUtils';
import lpuBuildingsData from '@/data/geojson/lpu_buildings.json';
import lpuPoisData from '@/data/geojson/lpu_pois.json';

interface NearbyLocation {
  id: string;
  name: string;
  category: string;
  block_code: string;
  lng: number;
  lat: number;
  distance_m: number;
  walk_time_min: number;
  description?: string;
  badge?: string;
}

interface WhatsNearMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: GPSLocation | null;
  onSelectLocation: (id: string, name: string, lng: number, lat: number) => void;
  onNavigateTo: (id: string, lng: number, lat: number, name: string) => void;
  onRequestGPS: () => void;
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  academic: <BookOpen size={14} />,
  hostel: <Building2 size={14} />,
  food: <Utensils size={14} />,
  shopping: <ShoppingBag size={14} />,
  library: <BookOpen size={14} />,
  medical: <Heart size={14} />,
  sports: <Dumbbell size={14} />,
  parking: <Car size={14} />,
  gate: <DoorOpen size={14} />,
  auditorium: <Building2 size={14} />,
  park: <TreePine size={14} />,
  administration: <Building2 size={14} />,
  residential: <Building2 size={14} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  hostel: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  food: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  shopping: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  library: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  medical: 'bg-red-500/20 text-red-300 border-red-500/30',
  sports: 'bg-green-500/20 text-green-300 border-green-500/30',
  parking: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  gate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  auditorium: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  park: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  administration: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  residential: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const NEARBY_FILTERS = [
  { id: 'all', label: 'All Nearby', icon: null },
  { id: 'food', label: '🍔 Food & Cafes', icon: null },
  { id: 'academic', label: '🎓 Blocks', icon: null },
  { id: 'hostel', label: '🏠 Hostels', icon: null },
  { id: 'shopping', label: '🛍️ UniMall & Shops', icon: null },
  { id: 'medical', label: '🏥 Medical & SOS', icon: null },
  { id: 'library', label: '📚 Study & Library', icon: null },
  { id: 'sports', label: '⚽ Sports', icon: null },
  { id: 'gate', label: '🚪 Gates', icon: null },
];

function getCenterOfPolygon(coordinates: number[][][] | undefined): [number, number] {
  if (!coordinates || !coordinates[0]) return [75.7032, 31.2535];
  const ring = coordinates[0];
  let sumLng = 0, sumLat = 0;
  for (const coord of ring) {
    sumLng += coord[0];
    sumLat += coord[1];
  }
  return [sumLng / ring.length, sumLat / ring.length];
}

export const WhatsNearMeModal: React.FC<WhatsNearMeModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSelectLocation,
  onNavigateTo,
  onRequestGPS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [radiusFilter, setRadiusFilter] = useState<number>(500); // meters

  // Current reference coordinates: real GPS if available, else UniMall campus center
  const centerCoord = useMemo<[number, number]>(() => {
    if (userLocation) {
      return [userLocation.longitude, userLocation.latitude];
    }
    // Default reference is LPU UniMall central hub
    return [75.7032, 31.2533];
  }, [userLocation]);

  // Calculate and sort all campus items by distance
  const nearbyItems = useMemo<NearbyLocation[]>(() => {
    const list: NearbyLocation[] = [];
    const seenNames = new Set<string>();

    const [uLng, uLat] = centerCoord;

    // 1. Major Buildings
    for (const feature of (lpuBuildingsData as any).features || []) {
      const props = feature.properties;
      if (!props?.id || props.name?.startsWith('Campus Facility')) continue;
      const normName = (props.name || '').trim().toLowerCase();
      if (normName && seenNames.has(normName)) continue;
      if (normName) seenNames.add(normName);

      const [bLng, bLat] = getCenterOfPolygon(feature.geometry?.coordinates);
      const dist = haversineDistance(uLat, uLng, bLat, bLng);

      list.push({
        id: props.id,
        name: props.name || 'Building',
        category: props.category || 'academic',
        block_code: props.block_code || '',
        lng: bLng,
        lat: bLat,
        distance_m: Math.round(dist),
        walk_time_min: Math.max(1, Math.round(dist / 80)),
        description: props.description,
        badge: props.badge,
      });
    }

    // 2. POIs (food, ATMs, clinics, gates)
    for (const feature of (lpuPoisData as any).features || []) {
      const props = feature.properties;
      if (!props?.id || props.name?.startsWith('Campus Facility')) continue;
      const normName = (props.name || '').trim().toLowerCase();
      if (normName && seenNames.has(normName)) continue;
      if (normName) seenNames.add(normName);

      const [pLng, pLat] = feature.geometry?.coordinates || [75.7032, 31.2535];
      const dist = haversineDistance(uLat, uLng, pLat, pLng);

      list.push({
        id: props.id,
        name: props.name || 'POI',
        category: props.category || 'other',
        block_code: props.block_code || '',
        lng: pLng,
        lat: pLat,
        distance_m: Math.round(dist),
        walk_time_min: Math.max(1, Math.round(dist / 80)),
        description: props.description,
        badge: props.badge,
      });
    }

    // Sort ascending by distance
    list.sort((a, b) => a.distance_m - b.distance_m);

    return list;
  }, [centerCoord]);

  // Filtered items based on category and distance
  const filteredItems = useMemo(() => {
    return nearbyItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesRadius = item.distance_m <= radiusFilter;
      return matchesCategory && matchesRadius;
    });
  }, [nearbyItems, selectedCategory, radiusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-lg bg-[#0c0e14]/95 border border-[#ff5e1e]/40 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[85vh] text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5e1e] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Radar size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0c0e14] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading text-white tracking-tight">
                  What&apos;s Near Me
                </h2>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ff5e1e]/20 text-[#ffb59d] border border-[#ff5e1e]/40 uppercase tracking-widest">
                  NAVIA RADAR
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin size={11} className={userLocation ? 'text-emerald-400' : 'text-amber-400'} />
                <span>
                  {userLocation
                    ? `Live Phone GPS (Accuracy ±${Math.round(userLocation.accuracy)}m)`
                    : 'Campus Center Reference (UniMall Hub)'}
                </span>
                {!userLocation && (
                  <button
                    onClick={onRequestGPS}
                    className="ml-1 text-[10px] text-[#ffb59d] hover:text-white underline"
                  >
                    Enable GPS
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Distance Range Slider & Preset Pills */}
        <div className="px-5 py-2.5 border-b border-white/10 bg-[#12141c]/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>Radius:</span>
            <span className="font-bold text-white bg-[#1e1f26] px-2 py-0.5 rounded-md border border-white/10">
              {radiusFilter < 1000 ? `${radiusFilter} m` : `${(radiusFilter / 1000).toFixed(1)} km`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[250, 500, 1000, 1500].map((dist) => (
              <button
                key={dist}
                onClick={() => setRadiusFilter(dist)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  radiusFilter === dist
                    ? 'bg-[#ff5e1e] text-white shadow-sm'
                    : 'bg-[#1e1f26] text-slate-400 hover:text-white hover:bg-[#282a30]'
                }`}
              >
                {dist < 1000 ? `${dist}m` : `${dist / 1000}km`}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b border-white/10 bg-white/[0.01] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {NEARBY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#ff5e1e] text-white shadow-sm font-semibold'
                  : 'bg-[#1e1f26] hover:bg-[#282a30] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Nearby List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Compass size={32} className="mx-auto text-slate-600 animate-pulse" />
              <p className="text-sm">No locations found within {radiusFilter}m for this category.</p>
              <button
                onClick={() => setRadiusFilter(1500)}
                className="text-xs text-[#ffb59d] hover:text-white underline font-mono"
              >
                Expand radius to 1.5 km
              </button>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const icon = CATEGORY_ICONS[item.category] || <MapPin size={14} />;
              const colorClass = CATEGORY_COLORS[item.category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

              return (
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between p-3 rounded-xl bg-[#151720] hover:bg-[#1e212d] border border-white/10 hover:border-orange-500/40 transition-all shadow-md gap-3"
                >
                  {/* Left Icon & Index Badge */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorClass}`}>
                      {icon}
                    </div>
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#0c0e14] border border-white/20 text-[9px] font-mono font-bold flex items-center justify-center text-slate-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Center Details */}
                  <div
                    onClick={() => {
                      onSelectLocation(item.id, item.name, item.lng, item.lat);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#ffb59d] transition-colors">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[9px] text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      {item.block_code && (
                        <span className="font-mono text-slate-300 bg-white/5 px-1 rounded">
                          {item.block_code}
                        </span>
                      )}
                      <span className="capitalize">{item.category}</span>
                      {item.description && (
                        <span className="truncate hidden sm:inline text-slate-500">
                          · {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Distance & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-emerald-400">
                        {formatDistance(item.distance_m)}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 flex items-center justify-end gap-0.5">
                        <Footprints size={10} />
                        <span>~{formatWalkTime(item.walk_time_min)}</span>
                      </div>
                    </div>

                    {/* Quick Navigate Button */}
                    <button
                      onClick={() => {
                        onNavigateTo(item.id, item.lng, item.lat, item.name);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-[#ff5e1e]/20 hover:bg-[#ff5e1e] text-[#ffb59d] hover:text-white transition-all border border-[#ff5e1e]/30 active:scale-95"
                      title={`Navigate to ${item.name}`}
                    >
                      <Navigation size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-white/10 bg-[#0c0e14] flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">
            Showing <strong className="text-white">{filteredItems.length}</strong> nearby spots
          </span>
          <span className="text-[10px] text-[#ffb59d]">Click any location to zoom & highlight</span>
        </div>

      </div>
    </div>
  );
};
