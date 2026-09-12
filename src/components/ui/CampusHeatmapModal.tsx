'use client';

import React, { useState } from 'react';
import { Flame, BookOpen, Coffee, Cpu, Users, Sparkles, Navigation, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface StudyZone {
  id: string;
  name: string;
  building: string;
  locationId: string;
  category: 'library' | 'food' | 'lab' | 'lounge';
  totalSeats: number;
  occupiedSeats: number;
  occupancyPct: number;
  status: 'quiet' | 'moderate' | 'busy' | 'full';
  floor: string;
  noiseLevel: 'Silent' | 'Whisper' | 'Moderate' | 'Lively';
  powerOutlets: boolean;
  wifiSpeedMbps: number;
  lat: number;
  lng: number;
}

export const CAMPUS_STUDY_ZONES: StudyZone[] = [
  // Central Library
  {
    id: 'lib-f2',
    name: '2nd Floor Reference & Research Desks',
    building: 'Central Library (Block 36-38)',
    locationId: 'b-36-38',
    category: 'library',
    totalSeats: 220,
    occupiedSeats: 58,
    occupancyPct: 26,
    status: 'quiet',
    floor: 'Level 2',
    noiseLevel: 'Silent',
    powerOutlets: true,
    wifiSpeedMbps: 250,
    lat: 31.252355,
    lng: 75.703679,
  },
  {
    id: 'lib-f1',
    name: '1st Floor Silent Reading Reading Hall',
    building: 'Central Library (Block 36-38)',
    locationId: 'b-36-38',
    category: 'library',
    totalSeats: 350,
    occupiedSeats: 154,
    occupancyPct: 44,
    status: 'quiet',
    floor: 'Level 1',
    noiseLevel: 'Silent',
    powerOutlets: true,
    wifiSpeedMbps: 220,
    lat: 31.252355,
    lng: 75.703679,
  },
  {
    id: 'lib-f0',
    name: 'Ground Floor Digital Commons',
    building: 'Central Library (Block 36-38)',
    locationId: 'b-36-38',
    category: 'library',
    totalSeats: 180,
    occupiedSeats: 158,
    occupancyPct: 88,
    status: 'busy',
    floor: 'Ground Floor',
    noiseLevel: 'Moderate',
    powerOutlets: true,
    wifiSpeedMbps: 300,
    lat: 31.252355,
    lng: 75.703679,
  },

  // Block 34 CSE Labs
  {
    id: 'cse-lab-4',
    name: 'Lab 34-408 Cloud Computing Bay',
    building: 'Block 34 (Computer Science)',
    locationId: 'b-33-34',
    category: 'lab',
    totalSeats: 90,
    occupiedSeats: 18,
    occupancyPct: 20,
    status: 'quiet',
    floor: 'Level 4',
    noiseLevel: 'Whisper',
    powerOutlets: true,
    wifiSpeedMbps: 450,
    lat: 31.253238,
    lng: 75.701509,
  },
  {
    id: 'cse-lab-ios',
    name: 'Apple iOS Development Center',
    building: 'Block 34 (Computer Science)',
    locationId: 'b-33-34',
    category: 'lab',
    totalSeats: 60,
    occupiedSeats: 29,
    occupancyPct: 48,
    status: 'moderate',
    floor: 'Level 3',
    noiseLevel: 'Moderate',
    powerOutlets: true,
    wifiSpeedMbps: 400,
    lat: 31.253238,
    lng: 75.701509,
  },
  {
    id: 'cse-ai-super',
    name: 'NVIDIA AI Supercomputing Lab',
    building: 'Block 34 (Computer Science)',
    locationId: 'b-33-34',
    category: 'lab',
    totalSeats: 80,
    occupiedSeats: 64,
    occupancyPct: 80,
    status: 'busy',
    floor: 'Level 2',
    noiseLevel: 'Moderate',
    powerOutlets: true,
    wifiSpeedMbps: 500,
    lat: 31.253238,
    lng: 75.701509,
  },

  // Dining & Social
  {
    id: 'unimall-lounge',
    name: 'UniMall 4th Floor Study Cafe',
    building: 'UniMall (Block 15)',
    locationId: 'b-15-unimall',
    category: 'food',
    totalSeats: 140,
    occupiedSeats: 42,
    occupancyPct: 30,
    status: 'quiet',
    floor: 'Level 4',
    noiseLevel: 'Whisper',
    powerOutlets: true,
    wifiSpeedMbps: 180,
    lat: 31.255597,
    lng: 75.705682,
  },
  {
    id: 'unimall-food',
    name: 'UniMall Ground Multi-Cuisine Food Court',
    building: 'UniMall (Block 15)',
    locationId: 'b-15-unimall',
    category: 'food',
    totalSeats: 450,
    occupiedSeats: 382,
    occupancyPct: 85,
    status: 'busy',
    floor: 'Ground Floor',
    noiseLevel: 'Lively',
    powerOutlets: false,
    wifiSpeedMbps: 120,
    lat: 31.255597,
    lng: 75.705682,
  },
];

interface CampusHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToZone?: (zone: StudyZone) => void;
}

export default function CampusHeatmapModal({
  isOpen,
  onClose,
  onNavigateToZone,
}: CampusHeatmapModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredZones = activeCategory === 'all'
    ? CAMPUS_STUDY_ZONES
    : CAMPUS_STUDY_ZONES.filter(z => z.category === activeCategory);

  const quietestZone = [...CAMPUS_STUDY_ZONES].sort((a, b) => a.occupancyPct - b.occupancyPct)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-xl bg-[#0c0e14]/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
              <Flame size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffb59d]">
                  LIVE SPATIAL OCCUPANCY & STUDY RADAR
                </span>
              </div>
              <h2 className="text-base font-bold text-white">Crowd Density & Study Spaces</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quietest Space Recommendation Banner */}
        <div className="mx-5 mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">RECOMMENDED QUIET SPACE</div>
              <div className="text-xs font-bold text-white truncate">{quietestZone.name}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Only <span className="text-emerald-300 font-bold">{quietestZone.occupancyPct}% full</span> · {quietestZone.noiseLevel} · {quietestZone.totalSeats - quietestZone.occupiedSeats} open seats
              </div>
            </div>
          </div>
          {onNavigateToZone && (
            <button
              onClick={() => {
                onNavigateToZone(quietestZone);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 flex-shrink-0"
            >
              <span>Go Now</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="px-5 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5">
          {[
            { id: 'all', label: 'All Zones' },
            { id: 'library', label: '📖 Libraries' },
            { id: 'lab', label: '💻 Tech Labs' },
            { id: 'food', label: '☕ Dining & Cafes' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveCategory(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === chip.id
                  ? 'bg-[#ff5e1e] text-white border-orange-500/50 shadow-md shadow-orange-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-transparent'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Zones List */}
        <div className="p-5 overflow-y-auto space-y-3 no-scrollbar flex-1">
          {filteredZones.map(zone => {
            const isQuiet = zone.occupancyPct <= 40;
            const isModerate = zone.occupancyPct > 40 && zone.occupancyPct <= 75;
            const barColor = isQuiet ? 'bg-emerald-400' : isModerate ? 'bg-amber-400' : 'bg-rose-500';
            const badgeColor = isQuiet
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : isModerate
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

            return (
              <div
                key={zone.id}
                className="p-4 rounded-xl bg-[#161822] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">{zone.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {zone.building} · {zone.floor}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg border ${badgeColor}`}>
                      {zone.occupancyPct}% Full
                    </span>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${zone.occupancyPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                      <span>{zone.occupiedSeats} / {zone.totalSeats} seats taken</span>
                      <span>{zone.totalSeats - zone.occupiedSeats} available</span>
                    </div>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                      Noise: {zone.noiseLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                      Wi-Fi: {zone.wifiSpeedMbps} Mbps
                    </span>
                    {zone.powerOutlets && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                        ⚡ Power Outlets
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-end">
                  {onNavigateToZone && (
                    <button
                      onClick={() => {
                        onNavigateToZone(zone);
                        onClose();
                      }}
                      className="text-xs font-semibold text-[#ffb59d] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Navigate Here</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
