'use client';

import React from 'react';
import { X, MapPin, Clock, Building2, Navigation, Layers, Star, ChevronRight } from 'lucide-react';
import type { GISBuildingProperties } from '@/types/gis';

interface BuildingInfoPanelProps {
  building: GISBuildingProperties | null;
  coordinates: [number, number] | null;
  onClose: () => void;
  onNavigateTo: (id: string, lng: number, lat: number) => void;
  onNavigateFrom: (id: string, lng: number, lat: number) => void;
  onOpenIndoor?: (id: string) => void;
  hasIndoorMap?: boolean;
}

const CATEGORY_BADGES: Record<string, { label: string; color: string; emoji: string }> = {
  academic: { label: 'Academic', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', emoji: '🎓' },
  hostel: { label: 'Hostel', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', emoji: '🏠' },
  food: { label: 'Food & Dining', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', emoji: '🍔' },
  shopping: { label: 'Shopping', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', emoji: '🛍️' },
  library: { label: 'Library', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', emoji: '📚' },
  medical: { label: 'Medical', color: 'bg-red-500/20 text-red-300 border-red-500/30', emoji: '🏥' },
  sports: { label: 'Sports', color: 'bg-green-500/20 text-green-300 border-green-500/30', emoji: '⚽' },
  parking: { label: 'Parking', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', emoji: '🅿️' },
  gate: { label: 'Gate', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', emoji: '🚪' },
  auditorium: { label: 'Auditorium', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', emoji: '🎭' },
  administration: { label: 'Administration', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', emoji: '🏛️' },
  residential: { label: 'Residential', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', emoji: '🏘️' },
};

export default function BuildingInfoPanel({
  building,
  coordinates,
  onClose,
  onNavigateTo,
  onNavigateFrom,
  hasIndoorMap,
  onOpenIndoor,
}: BuildingInfoPanelProps) {
  if (!building) return null;

  const badge = CATEGORY_BADGES[building.category] || { label: building.category, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', emoji: '📍' };
  const facilities = typeof building.facilities === 'string' 
    ? (() => { try { return JSON.parse(building.facilities); } catch { return []; } })()
    : building.facilities || [];

  return (
    <div className="absolute bottom-0 left-0 right-0 md:right-auto md:left-4 md:bottom-4 md:w-96 z-40 animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 pt-2 md:pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Category & Landmark badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                  <span>{badge.emoji}</span>
                  <span>{badge.label}</span>
                </div>
                {(building as any).badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⭐ {(building as any).badge}
                  </span>
                )}
              </div>

              {/* Building name */}
              <h3 className="text-lg font-bold text-white leading-tight truncate">
                {building.name}
              </h3>

              {/* Block code */}
              {building.block_code && (
                <p className="text-xs font-mono text-slate-400 mt-1">
                  {building.block_code}
                </p>
              )}
            </div>

            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Description */}
        {building.description && (
          <div className="px-5 pb-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              {building.description}
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="px-5 pb-3 flex items-center gap-4 text-xs text-slate-400">
          {building.height > 0 && (
            <div className="flex items-center gap-1.5">
              <Building2 size={12} />
              <span>{building.height}m height</span>
            </div>
          )}
          {building.building_levels > 0 && (
            <div className="flex items-center gap-1.5">
              <Layers size={12} />
              <span>{building.building_levels} floors</span>
            </div>
          )}
          {building.confidence && (
            <div className="flex items-center gap-1.5">
              <Star size={12} />
              <span className="capitalize">{building.confidence} confidence</span>
            </div>
          )}
        </div>

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="px-5 pb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Facilities</p>
            <div className="flex flex-wrap gap-1.5">
              {facilities.map((facility: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-300 border border-white/5">
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 pb-5 pt-2 flex flex-col gap-2">
          {(hasIndoorMap || building.has_indoor_map) && onOpenIndoor && (
            <button
              onClick={() => onOpenIndoor(building.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500/20 to-indigo-500/20 hover:from-teal-500/30 hover:to-indigo-500/30 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-all active:scale-[0.98]"
            >
              <Layers size={14} />
              View Multi-Floor Indoor Blueprint
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => coordinates && onNavigateTo(building.id, coordinates[0], coordinates[1])}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              <Navigation size={16} />
              Navigate Here
            </button>
            <button
              onClick={() => coordinates && onNavigateFrom(building.id, coordinates[0], coordinates[1])}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium border border-white/10 transition-all active:scale-[0.98]"
            >
              <MapPin size={16} />
              From
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
