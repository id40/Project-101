'use client';

import React, { useState, useEffect } from 'react';
import { Bus, BatteryCharging, Users, Gauge, Clock, X, ChevronRight, Navigation, Sparkles, ShieldCheck } from 'lucide-react';
import { CAMPUS_SHUTTLE_ROUTES, ShuttleRoute, ShuttleVehicle, getInterpolatedCoord } from '@/data/shuttleRoutes';

interface CampusShuttleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackShuttle?: (coord: [number, number], name: string) => void;
  onSelectRoute?: (route: ShuttleRoute) => void;
}

export default function CampusShuttleModal({
  isOpen,
  onClose,
  onTrackShuttle,
  onSelectRoute,
}: CampusShuttleModalProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-spine');
  const [ticker, setTicker] = useState<number>(0);

  // Periodic position update simulation for smooth live movement
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTicker(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRoute = CAMPUS_SHUTTLE_ROUTES.find(r => r.id === selectedRouteId) || CAMPUS_SHUTTLE_ROUTES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-xl bg-[#0c0e14]/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Bus size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  LIVE SPATIAL TRANSIT · LPU FLEET
                </span>
              </div>
              <h2 className="text-base font-bold text-white">Campus E-Rickshaw & Shuttle Tracker</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Route Selector Tabs */}
        <div className="px-5 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5">
          {CAMPUS_SHUTTLE_ROUTES.map(route => {
            const isSelected = route.id === selectedRouteId;
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-white/15 text-white border-white/30 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: route.color }} />
                <span>{route.name.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {/* Active Route Overview Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">CURRENT ROUTE</div>
              <div className="text-sm font-bold text-white">{currentRoute.name}</div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-emerald-400" />
                  Every {currentRoute.intervalMin} mins
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-cyan-400" />
                  Free Student Service
                </span>
              </div>
            </div>
            {onSelectRoute && (
              <button
                onClick={() => {
                  onSelectRoute(currentRoute);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#ff5e1e] text-white text-xs font-semibold shadow-md shadow-orange-500/30 hover:bg-[#ff723b] transition-all flex items-center gap-1"
              >
                <Navigation size={12} />
                <span>Hop On</span>
              </button>
            )}
          </div>

          {/* Active Vehicles List */}
          <div>
            <div className="text-[11px] font-mono uppercase text-[#ffb59d] font-bold tracking-wider mb-2">
              ACTIVE VEHICLES ON ROUTE ({currentRoute.vehicles.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentRoute.vehicles.map((v, i) => {
                // Slightly cycle progress over time for live effect
                const dynamicProgress = (v.progress + (ticker * 0.04 * (i + 1))) % 1.0;
                const liveCoord = getInterpolatedCoord(currentRoute.path, dynamicProgress);

                return (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-[#161822] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-white">{v.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                          {v.driverName.split(' ')[0]}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center gap-1">
                            <BatteryCharging size={10} className="text-emerald-400" /> Batt
                          </div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">{v.batteryPct}%</div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center gap-1">
                            <Users size={10} className="text-cyan-400" /> Seats
                          </div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">
                            {v.passengers}/{v.capacity}
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center gap-1">
                            <Gauge size={10} className="text-amber-400" /> Speed
                          </div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">{v.speedKmH} km/h</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400">Arriving in ~2 min</span>
                      {onTrackShuttle && (
                        <button
                          onClick={() => {
                            onTrackShuttle(liveCoord, v.name);
                            onClose();
                          }}
                          className="text-xs font-semibold text-[#ffb59d] hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Track 3D</span>
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Stops Sequence */}
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider mb-2">
              SCHEDULED ROUTE STOPS ({currentRoute.stops.length})
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
              {currentRoute.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-2.5 rounded-full bg-emerald-400 border border-white" />
                    {index < currentRoute.stops.length - 1 && (
                      <div className="w-0.5 h-4 bg-white/20 my-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{stop.name}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Stop #{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
