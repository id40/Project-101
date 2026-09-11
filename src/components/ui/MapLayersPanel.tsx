'use client';

import React from 'react';
import { Layers, Building2, MapPin, TreePine, Car, Utensils, BookOpen, Building, Dumbbell, Landmark, Eye, EyeOff, X } from 'lucide-react';
import type { LayerVisibility } from '@/types/gis';

interface MapLayersPanelProps {
  visibility: LayerVisibility;
  onToggle: (layer: keyof LayerVisibility) => void;
  onClose: () => void;
}

interface LayerItem {
  key: keyof LayerVisibility;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const LAYERS: LayerItem[] = [
  { key: 'buildings', label: '3D Buildings', icon: <Building2 size={14} />, color: 'text-indigo-400' },
  { key: 'roads', label: 'Roads', icon: <MapPin size={14} />, color: 'text-slate-400' },
  { key: 'parks', label: 'Parks & Green', icon: <TreePine size={14} />, color: 'text-green-400' },
  { key: 'pois', label: 'POI Labels', icon: <MapPin size={14} />, color: 'text-amber-400' },
  { key: 'academic', label: 'Academic', icon: <BookOpen size={14} />, color: 'text-indigo-400' },
  { key: 'residential', label: 'Hostels', icon: <Building size={14} />, color: 'text-teal-400' },
  { key: 'food', label: 'Food & Dining', icon: <Utensils size={14} />, color: 'text-amber-400' },
  { key: 'sports', label: 'Sports', icon: <Dumbbell size={14} />, color: 'text-green-400' },
  { key: 'parking', label: 'Parking', icon: <Car size={14} />, color: 'text-slate-400' },
  { key: 'landmarks', label: 'Landmarks', icon: <Landmark size={14} />, color: 'text-purple-400' },
];

export default function MapLayersPanel({ visibility, onToggle, onClose }: MapLayersPanelProps) {
  return (
    <div className="absolute top-20 right-16 z-40 w-56 animate-slide-left">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Layers size={14} className="text-indigo-400" />
            Map Layers
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Layer toggles */}
        <div className="p-2">
          {LAYERS.map(layer => {
            const isVisible = visibility[layer.key];
            return (
              <button
                key={layer.key}
                onClick={() => onToggle(layer.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isVisible ? 'bg-white/5 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <span className={`${isVisible ? layer.color : 'text-slate-600'} transition-colors`}>
                  {layer.icon}
                </span>
                <span className="text-xs font-medium flex-1 text-left">{layer.label}</span>
                {isVisible ? (
                  <Eye size={12} className="text-indigo-400" />
                ) : (
                  <EyeOff size={12} className="text-slate-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
