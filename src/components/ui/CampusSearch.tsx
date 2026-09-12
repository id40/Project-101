'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, BookOpen, Building2, Utensils, ShoppingBag, Heart, Dumbbell, Car, DoorOpen, TreePine, ArrowRight, Sparkles } from 'lucide-react';
import lpuBuildingsData from '@/data/geojson/lpu_buildings.json';
import lpuPoisData from '@/data/geojson/lpu_pois.json';

interface CampusSearchProps {
  onSelectLocation: (id: string, name: string, lng: number, lat: number) => void;
  onClose?: () => void;
  className?: string;
  variant?: 'header' | 'hero';
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
  block_code: string;
  lng: number;
  lat: number;
  description?: string;
  is_highlight?: boolean;
  badge?: string;
}

// Category icon mapping
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
  academic: 'bg-indigo-500/20 text-indigo-300',
  hostel: 'bg-teal-500/20 text-teal-300',
  food: 'bg-amber-500/20 text-amber-300',
  shopping: 'bg-orange-500/20 text-orange-300',
  library: 'bg-purple-500/20 text-purple-300',
  medical: 'bg-red-500/20 text-red-300',
  sports: 'bg-green-500/20 text-green-300',
  parking: 'bg-slate-500/20 text-slate-300',
  gate: 'bg-amber-500/20 text-amber-300',
  auditorium: 'bg-purple-500/20 text-purple-300',
  park: 'bg-emerald-500/20 text-emerald-300',
  administration: 'bg-teal-500/20 text-teal-300',
  residential: 'bg-slate-500/20 text-slate-300',
};

// Quick filter chips
const FILTER_CHIPS = [
  { label: 'All', value: '' },
  { label: '⭐ Top Spots', value: 'highlight' },
  { label: '🔬 Tech Labs', value: 'labs' },
  { label: '🎓 Academic', value: 'academic' },
  { label: '🏠 Hostels', value: 'hostel' },
  { label: '🍔 Food', value: 'food' },
  { label: '📚 Library', value: 'library' },
  { label: '🏥 Medical', value: 'medical' },
  { label: '⚽ Sports', value: 'sports' },
  { label: '🅿️ Parking', value: 'parking' },
  { label: '🚪 Gates', value: 'gate' },
];

function buildStaticLocations(): SearchResult[] {
  const locations: SearchResult[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const feature of (lpuBuildingsData as any).features || []) {
    const props = feature.properties;
    if (!props?.id || seenIds.has(props.id)) continue;
    if (props.name?.startsWith('Campus Facility')) continue;
    const normName = (props.name || '').trim().toLowerCase();
    if (normName && seenNames.has(normName)) continue;
    seenIds.add(props.id);
    if (normName) seenNames.add(normName);
    const center = getCenterOfPolygon(feature.geometry?.coordinates);
    locations.push({
      id: props.id,
      name: props.name || 'Unknown Building',
      category: props.category || 'other',
      block_code: props.block_code || '',
      lng: center[0],
      lat: center[1],
      description: props.description,
      is_highlight: props.is_highlight,
      badge: props.badge,
    });
  }

  for (const feature of (lpuPoisData as any).features || []) {
    const props = feature.properties;
    if (!props?.id || seenIds.has(props.id)) continue;
    if (props.name?.startsWith('Campus Facility')) continue;
    const normName = (props.name || '').trim().toLowerCase();
    if (normName && seenNames.has(normName)) continue;
    seenIds.add(props.id);
    if (normName) seenNames.add(normName);
    const coords = feature.geometry?.coordinates || [75.7032, 31.2535];
    locations.push({
      id: props.id,
      name: props.name || 'Unknown POI',
      category: props.category || 'other',
      block_code: props.block_code || '',
      lng: coords[0],
      lat: coords[1],
      description: props.description,
      is_highlight: props.is_highlight,
      badge: props.badge,
    });
  }

  return locations;
}

const STATIC_LOCATIONS = buildStaticLocations();

export default function CampusSearch({
  onSelectLocation,
  onClose,
  className = '',
  variant = 'header',
}: CampusSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allLocations] = useState<SearchResult[]>(STATIC_LOCATIONS);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search logic
  useEffect(() => {
    const q = query.toLowerCase().trim();
    let filtered = allLocations;

    if (activeFilter === 'highlight') {
      filtered = filtered.filter(loc => loc.is_highlight);
    } else if (activeFilter === 'labs') {
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes('lab') || 
        loc.name.toLowerCase().includes('academy') ||
        loc.name.toLowerCase().includes('workshop')
      );
    } else if (activeFilter) {
      filtered = filtered.filter(loc => loc.category === activeFilter);
    }

    if (q) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(q) ||
        loc.block_code.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q) ||
        (loc.description && loc.description.toLowerCase().includes(q))
      );
    }

    // Sort: exact matches first, then by name
    filtered.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bExact = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return a.name.localeCompare(b.name);
    });

    setResults(filtered.slice(0, 20));
  }, [query, activeFilter, allLocations]);

  const showResults = isFocused && (query.length > 0 || activeFilter !== '');

  const handleChipClick = (value: string) => {
    const nextFilter = activeFilter === value ? '' : value;
    setActiveFilter(nextFilter);
    setIsFocused(true);

    if (nextFilter) {
      let matched: SearchResult[] = [];
      if (nextFilter === 'highlight') {
        matched = allLocations.filter(loc => loc.is_highlight);
      } else if (nextFilter === 'labs') {
        matched = allLocations.filter(loc => 
          loc.name.toLowerCase().includes('lab') || 
          loc.name.toLowerCase().includes('academy') ||
          loc.name.toLowerCase().includes('workshop')
        );
      } else {
        matched = allLocations.filter(loc => loc.category === nextFilter);
      }
      if (matched.length > 0 && onSelectLocation) {
        const prime = matched.find(m => m.is_highlight) || matched[0];
        onSelectLocation(prime.id, prime.name, prime.lng, prime.lat);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Header Search Bar Container */}
      <div className="flex flex-col gap-1.5">
        {/* Main Search Input */}
        <div className="relative flex items-center rounded-xl bg-[#1e1f26]/90 border border-white/15 focus-within:border-[#ff5e1e]/70 focus-within:bg-[#1e1f26] transition-all shadow-inner px-2.5 py-1">
          <div className="text-slate-400 flex items-center pointer-events-none pr-2">
            <Search size={14} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            placeholder="Search NAVIA campus (e.g. Block 34 CSE, UniMall, GH, Gates)..."
            className="w-full bg-transparent py-1 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 border-none"
          />
          {query ? (
            <button 
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }} 
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="p-1 rounded-md bg-[#ff5e1e] text-white hover:brightness-110 active:scale-95 transition-all shadow-sm"
              title="Search"
            >
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {/* Filter Chips Strip in Header */}
        <div 
          className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
              onClick={() => handleChipClick(chip.value)}
              className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all select-none active:scale-95 ${
                activeFilter === chip.value
                  ? 'bg-[#ff5e1e] text-white shadow-sm font-semibold'
                  : 'bg-[#1e1f26]/80 hover:bg-[#282a30] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0e14] border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] max-h-80 overflow-y-auto z-50 animate-fade-in divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelectLocation(result.id, result.name, result.lng, result.lat);
                    setQuery(result.name);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-[#1e1f26] transition-colors group"
                >
                  <div className={`mt-0.5 p-1 rounded-md flex-shrink-0 ${CATEGORY_COLORS[result.category] || 'bg-slate-500/20 text-slate-300'}`}>
                    {CATEGORY_ICONS[result.category] || <MapPin size={13} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-white font-medium truncate group-hover:text-[#ffb59d] transition-colors">
                        {result.name}
                      </span>
                      {result.badge && (
                        <span className="text-[9px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded font-mono flex-shrink-0">
                          {result.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                      {result.block_code && <span className="font-mono text-slate-400">{result.block_code}</span>}
                      <span className="capitalize">{result.category}</span>
                      {result.description && (
                        <span className="truncate text-slate-600 hidden sm:inline">· {result.description}</span>
                      )}
                    </div>
                  </div>
                  <MapPin size={13} className="text-slate-600 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper: Get center of a polygon
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
