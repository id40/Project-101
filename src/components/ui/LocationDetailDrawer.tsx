'use client';

import React from 'react';
import { CampusLocation } from '@/types/campus';
import { X, Navigation, Clock, Check, Layers } from 'lucide-react';

interface LocationDetailDrawerProps {
  location: CampusLocation | null;
  onClose: () => void;
  onNavigateHere: (loc: CampusLocation) => void;
  onOpenIndoorMap: (buildingId: string) => void;
}

export const LocationDetailDrawer: React.FC<LocationDetailDrawerProps> = ({
  location,
  onClose,
  onNavigateHere,
  onOpenIndoorMap,
}) => {
  if (!location) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto p-3 animate-in slide-in-from-bottom duration-200 select-none">
      <div className="bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-4 text-white overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#635BFF] flex items-center justify-center font-black text-white text-xs shadow-md">
              {location.block_code}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">{location.name}</h3>
              <p className="text-[11px] text-cyan-300 font-medium">{location.short_description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Facilities Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3 max-h-16 overflow-y-auto">
          {location.facilities.map((fac, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1"
            >
              <Check className="w-2.5 h-2.5 text-emerald-400" />
              {fac}
            </span>
          ))}
        </div>

        {/* Timing Information */}
        {location.opening_hours && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mon - Fri: {location.opening_hours.monday || '08:00 - 18:00'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {location.has_indoor_map ? (
            <button
              onClick={() => onOpenIndoorMap(location.id)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Indoor Floors
            </button>
          ) : (
            <div className="py-2.5 px-3 bg-slate-800/40 text-slate-500 text-xs font-medium rounded-xl text-center">
              Outdoor Only
            </div>
          )}

          <button
            onClick={() => onNavigateHere(location)}
            className="py-2.5 px-3 bg-gradient-to-r from-[#635BFF] to-[#4338CA] hover:from-[#5248E5] hover:to-[#3730A3] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#635BFF]/30 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            Walk Here
          </button>
        </div>
      </div>
    </div>
  );
};
