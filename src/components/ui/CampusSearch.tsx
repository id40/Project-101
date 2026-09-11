'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, MapPin, BookOpen, Building2, Utensils, ShoppingBag, Heart, Dumbbell, Car, DoorOpen, TreePine } from 'lucide-react';
import lpuBuildingsData from '@/data/geojson/lpu_buildings.json';
import lpuPoisData from '@/data/geojson/lpu_pois.json';

interface CampusSearchProps {
  onSelectLocation: (id: string, name: string, lng: number, lat: number) => void;
  onClose?: () => void;
  className?: string;
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

export default function CampusSearch({ onSelectLocation, onClose, className = '' }: CampusSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allLocations] = useState<SearchResult[]>(STATIC_LOCATIONS);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const showResults = isFocused && (query.length > 0 || activeFilter);

  return (
    <div className={`w-full max-w-lg ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl shadow-indigo-500/10 transition-all focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/20">
          <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search LPU campus..."
            className="bg-transparent text-white placeholder-slate-500 text-sm w-full outline-none font-sans"
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="p-1 text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar px-1">
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip.value}
            onClick={() => {
              setActiveFilter(activeFilter === chip.value ? '' : chip.value);
              setIsFocused(true);
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === chip.value
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-white/5'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelectLocation(result.id, result.name, result.lng, result.lat);
                    setQuery(result.name);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-colors group"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${CATEGORY_COLORS[result.category] || 'bg-slate-500/20 text-slate-300'}`}>
                    {CATEGORY_ICONS[result.category] || <MapPin size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm text-white font-medium truncate group-hover:text-indigo-300 transition-colors">
                        {result.name}
                      </span>
                      {result.badge && (
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded font-mono font-medium flex-shrink-0">
                          {result.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      {result.block_code && <span className="font-mono">{result.block_code}</span>}
                      <span className="capitalize">{result.category}</span>
                    </div>
                  </div>
                  <MapPin size={14} className="text-slate-600 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
