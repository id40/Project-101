'use client';

import React, { useState, useMemo } from 'react';
import { CampusLocation, Vendor } from '@/types/campus';
import { Search, MapPin, Store, X } from 'lucide-react';

interface SearchBarProps {
  locations: CampusLocation[];
  vendors: Vendor[];
  onSelectLocation: (loc: CampusLocation) => void;
  onSelectVendor: (ven: Vendor) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  locations,
  vendors,
  onSelectLocation,
  onSelectVendor,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return { locations: [], vendors: [] };
    const q = query.toLowerCase();

    const matchedLocations = locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.block_code.toLowerCase().includes(q) ||
        l.facilities.some((f) => f.toLowerCase().includes(q))
    );

    const matchedVendors = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );

    return { locations: matchedLocations, vendors: matchedVendors };
  }, [query, locations, vendors]);

  const hasResults = results.locations.length > 0 || results.vendors.length > 0;

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl px-3 py-2 text-white">
        <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Where do you want to go? (e.g. Block 34, UniMall, Library)"
          className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-50 p-2 space-y-1">
          {hasResults ? (
            <>
              {results.locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#635BFF]/20 flex items-center justify-center text-[#635BFF] shrink-0 font-bold text-[10px]">
                    {loc.block_code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{loc.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{loc.short_description}</p>
                  </div>
                </div>
              ))}

              {results.vendors.map((ven) => (
                <div
                  key={ven.id}
                  onClick={() => {
                    onSelectVendor(ven);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{ven.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{ven.category} • {ven.opening_hours}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              Couldn't find that place.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
