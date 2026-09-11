'use client';

import React, { useState, useMemo } from 'react';
import { BuildingFloorPlan, IndoorRoom, IndoorRoute } from '@/types/indoor';
import { INDOOR_FLOOR_PLANS } from '@/data/indoorData';
import { calculateIndoorRoute } from '@/lib/indoorDijkstra';
import { X, Navigation, Layers, ChevronRight, CornerDownRight, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

interface IndoorModalProps {
  buildingId: string;
  onClose: () => void;
}

export const IndoorModal: React.FC<IndoorModalProps> = ({ buildingId, onClose }) => {
  const plan: BuildingFloorPlan | undefined = INDOOR_FLOOR_PLANS[buildingId];
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [destRoomId, setDestRoomId] = useState<string>('');
  const [activeIndoorRoute, setActiveIndoorRoute] = useState<IndoorRoute | null>(null);

  // Default start room is entrance on Ground floor
  const currentFloorData = useMemo(() => {
    if (!plan) return null;
    return plan.floors.find((f) => f.floor_number === selectedFloor) || plan.floors[0];
  }, [plan, selectedFloor]);

  const handleCalculateRoute = (targetRoomId: string) => {
    setDestRoomId(targetRoomId);
    if (!targetRoomId) {
      setActiveIndoorRoute(null);
      return;
    }

    // Default start room: entrance of building
    const entranceRoom = plan?.floors[0].rooms.find((r) => r.category === 'entrance') || plan?.floors[0].rooms[0];
    if (!entranceRoom) return;

    const route = calculateIndoorRoute(buildingId, entranceRoom.id, targetRoomId);
    setActiveIndoorRoute(route);

    // Auto switch floor to show where the room is
    const targetRoom = plan?.floors.flatMap((f) => f.rooms).find((r) => r.id === targetRoomId);
    if (targetRoom) {
      setSelectedFloor(targetRoom.floor);
    }
  };

  if (!plan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full text-center">
          <p className="text-slate-300 mb-4">Indoor blueprint not available for this building yet.</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#635BFF] text-white rounded-xl font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F172A] text-white animate-in fade-in select-none">
      {/* Top App Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#635BFF]/20 border border-[#635BFF]/40 flex items-center justify-center text-[#635BFF]">
            <Compass className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm tracking-tight text-white">{plan.building_name}</h2>
              <span className="text-[10px] bg-[#635BFF] text-white font-bold px-1.5 py-0.5 rounded">
                [{plan.block_code}]
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Indoor Turn-by-Turn Blueprint</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content: Floor Blueprint + Navigation Panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Interactive Floor SVG Canvas */}
        <div className="flex-1 relative bg-[#090D16] p-4 flex flex-col items-center justify-center overflow-auto">
          {/* Floor Level Tabs */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 p-1 rounded-xl shadow-lg">
            <Layers className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            {plan.floors.map((fl) => (
              <button
                key={fl.floor_number}
                onClick={() => setSelectedFloor(fl.floor_number)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFloor === fl.floor_number
                    ? 'bg-[#635BFF] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fl.floor_name}
              </button>
            ))}
          </div>

          {/* SVG Floor Blueprint */}
          <svg viewBox="0 0 100 100" className="w-full max-w-lg aspect-square drop-shadow-xl bg-slate-900 border border-slate-800 rounded-2xl p-2">
            {/* Outer Wall Boundary */}
            <rect x="5" y="5" width="90" height="90" rx="4" fill="none" stroke="#334155" strokeWidth="2.5" />

            {/* Central Corridor */}
            <rect x="42" y="10" width="16" height="80" fill="#1E293B" opacity="0.6" />

            {/* Rooms */}
            {currentFloorData?.rooms.map((room) => {
              const isTarget = destRoomId === room.id;
              return (
                <g
                  key={room.id}
                  onClick={() => handleCalculateRoute(room.id)}
                  className="cursor-pointer transition-all hover:opacity-90"
                >
                  <rect
                    x={room.x - room.width / 2}
                    y={room.y - room.height / 2}
                    width={room.width}
                    height={room.height}
                    rx="3"
                    fill={isTarget ? '#635BFF' : room.color || '#334155'}
                    opacity={isTarget ? 0.95 : 0.75}
                    stroke={isTarget ? '#38BDF8' : '#475569'}
                    strokeWidth={isTarget ? '1.5' : '0.75'}
                  />
                  <text
                    x={room.x}
                    y={room.y - 1}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="3.2"
                    fontWeight="bold"
                  >
                    {room.room_number}
                  </text>
                  <text
                    x={room.x}
                    y={room.y + 3}
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="2.2"
                  >
                    {room.name.length > 14 ? room.name.substring(0, 12) + '…' : room.name}
                  </text>
                </g>
              );
            })}

            {/* Indoor Route Polyline for Current Floor */}
            {activeIndoorRoute && (
              <polyline
                points={activeIndoorRoute.path_points
                  .filter((p) => p.floor === selectedFloor)
                  .map((p) => `${p.x},${p.y}`)
                  .join(' ')}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="2,1.5"
                className="animate-pulse"
              />
            )}
          </svg>
        </div>

        {/* Right / Bottom Sheet: Destination & Turn-by-Turn Steps */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-[#111827] flex flex-col max-h-[45vh] md:max-h-full overflow-y-auto p-4">
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Indoor Destination:
            </label>
            <select
              value={destRoomId}
              onChange={(e) => handleCalculateRoute(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-[#635BFF]"
            >
              <option value="">-- Choose Classroom / Lab / Office --</option>
              {plan.floors.flatMap((f) => f.rooms).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_number} — {r.name} ({fName(r.floor)})
                </option>
              ))}
            </select>
          </div>

          {/* Turn-by-Turn Navigation Steps */}
          {activeIndoorRoute ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between bg-[#635BFF]/10 border border-[#635BFF]/30 p-2.5 rounded-xl mb-3">
                <div>
                  <span className="text-xs font-bold text-white">Indoor Route Ready</span>
                  <p className="text-[11px] text-cyan-300 font-medium">
                    {activeIndoorRoute.total_distance}m • ~{activeIndoorRoute.estimated_time_seconds}s walk
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center text-white">
                  <Navigation className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2.5 overflow-y-auto pr-1">
                {activeIndoorRoute.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      {step.direction === 'stairs_up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : step.direction === 'stairs_down' ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <CornerDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{step.instruction}</p>
                      <span className="text-[10px] text-slate-400">
                        Floor {step.floor} {step.distance > 0 ? `• ${step.distance}m` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Navigation className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-300">No Destination Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click any room on the blueprint or select above to get turn-by-turn guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function fName(floor: number) {
  if (floor === 0) return 'Ground';
  if (floor === 1) return '1st Floor';
  if (floor === 2) return '2nd Floor';
  if (floor === 3) return '3rd Floor';
  return `${floor}th Floor`;
}
