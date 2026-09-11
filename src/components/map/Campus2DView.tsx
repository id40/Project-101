'use client';

import React, { useState, useRef } from 'react';
import { CampusLocation, NavigationRoute } from '@/types/campus';
import { AvatarConfig } from '@/types/profile';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Campus2DViewProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation | null) => void;
  avatarPosition: [number, number, number];
  avatarHeading: number;
  avatarConfig: AvatarConfig;
  activeRoute: NavigationRoute | null;
}

export const Campus2DView: React.FC<Campus2DViewProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  avatarPosition,
  avatarHeading,
  avatarConfig,
  activeRoute,
}) => {
  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [activeFilter, setActiveFilter] = useState<'all' | 'academic' | 'hostel' | 'food' | 'sports'>('all');

  // Map coordinate conversion: world x in [-200, 220] & z in [-160, 240] -> SVG (0,0) to (1000, 850)
  const toSvgX = (x: number) => ((x + 200) / 420) * 1000;
  const toSvgY = (z: number) => ((z + 160) / 400) * 850;

  const avatarSvgX = toSvgX(avatarPosition[0]);
  const avatarSvgY = toSvgY(avatarPosition[2]);
  const headingDeg = (avatarHeading * 180) / Math.PI;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Mobile Touch Panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Mouse Wheel Smooth Zoom
  const handleWheel = (e: React.WheelEvent) => {
    setZoom((z) => Math.max(0.65, Math.min(2.8, z - e.deltaY * 0.0012)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredLocations = locations.filter((loc) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'academic') return loc.type === 'academic' || loc.type === 'auditorium';
    if (activeFilter === 'hostel') return loc.type === 'hostel';
    if (activeFilter === 'food') return loc.type === 'food';
    if (activeFilter === 'sports') return loc.type === 'sports' || loc.id === 'cricket-stadium' || loc.id === 'olympic-pool';
    return true;
  });

  return (
    <div
      className="w-full h-full bg-[#090D16] relative overflow-hidden flex items-center justify-center select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Sector Filter Bar */}
      <div className="absolute top-16 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All 600 Acres' },
          { id: 'academic', label: 'Academics' },
          { id: 'hostel', label: 'Hostels' },
          { id: 'food', label: 'Dining' },
          { id: 'sports', label: 'Sports' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              activeFilter === f.id
                ? 'bg-[#635BFF] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Floating Zoom & Reset HUD */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
          title="Zoom In"
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset Map View"
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas Container with Smooth Transform */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="w-full h-full max-w-6xl flex items-center justify-center p-4"
      >
        <svg
          viewBox="0 0 1000 850"
          className="w-full h-full max-h-[85vh] drop-shadow-2xl rounded-3xl bg-[#0F172A] border border-slate-800"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#635BFF" />
            </linearGradient>
          </defs>

          {/* Blueprint Grid Background */}
          <rect
            width="1000"
            height="850"
            fill="url(#grid)"
            onClick={() => onSelectLocation(null)}
            className="cursor-pointer"
          />

          {/* Grand Trunk Road (NH-1) */}
          <line
            x1={toSvgX(240)}
            y1={toSvgY(250)}
            x2={toSvgX(180)}
            y2={toSvgY(160)}
            stroke="#1E293B"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <line
            x1={toSvgX(240)}
            y1={toSvgY(250)}
            x2={toSvgX(180)}
            y2={toSvgY(160)}
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeDasharray="12,8"
          />
          <text
            x={toSvgX(225)}
            y={toSvgY(240)}
            fill="#94A3B8"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="2"
            transform={`rotate(-50, ${toSvgX(225)}, ${toSvgY(240)})`}
          >
            GT ROAD (NH-1)
          </text>

          {/* Main Campus Promenade (Gate 1 to UniMall) */}
          <line
            x1={toSvgX(200)}
            y1={toSvgY(215)}
            x2={toSvgX(20)}
            y2={toSvgY(15)}
            stroke="#334155"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Academic Spine Road */}
          <line
            x1={toSvgX(20)}
            y1={toSvgY(15)}
            x2={toSvgX(-90)}
            y2={toSvgY(-20)}
            stroke="#334155"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* West Ring Road */}
          <line
            x1={toSvgX(-180)}
            y1={toSvgY(-105)}
            x2={toSvgX(-15)}
            y2={toSvgY(-105)}
            stroke="#1E293B"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Landmarks: Cricket Stadium */}
          <ellipse
            cx={toSvgX(-120)}
            cy={toSvgY(-40)}
            rx="56"
            ry="44"
            fill="#14532D"
            stroke="#16A34A"
            strokeWidth="3"
            opacity="0.8"
          />
          <ellipse
            cx={toSvgX(-120)}
            cy={toSvgY(-40)}
            rx="46"
            ry="36"
            fill="none"
            stroke="#DC2626"
            strokeWidth="4"
            strokeDasharray="6,4"
          />
          <text
            x={toSvgX(-120)}
            y={toSvgY(-40)}
            textAnchor="middle"
            fill="#86EFAC"
            fontSize="10"
            fontWeight="black"
          >
            CRICKET STADIUM
          </text>

          {/* Landmarks: Olympic Swimming Pool */}
          <rect
            x={toSvgX(-98)}
            y={toSvgY(-96)}
            width="38"
            height="24"
            rx="5"
            fill="#0284C7"
            stroke="#38BDF8"
            strokeWidth="2"
            opacity="0.9"
          />
          <text
            x={toSvgX(-79)}
            y={toSvgY(-82)}
            textAnchor="middle"
            fill="#E0F2FE"
            fontSize="9"
            fontWeight="bold"
          >
            50M POOL
          </text>

          {/* Landmarks: Unipolis Amphitheater */}
          <ellipse
            cx={toSvgX(20)}
            cy={toSvgY(-10)}
            rx="52"
            ry="38"
            fill="#635BFF"
            fillOpacity="0.25"
            stroke="#635BFF"
            strokeWidth="2.5"
            strokeDasharray="6,3"
          />
          <text
            x={toSvgX(20)}
            y={toSvgY(-10)}
            textAnchor="middle"
            fill="#A5B4FC"
            fontSize="11"
            fontWeight="bold"
          >
            UNIPOLIS CANOPY
          </text>

          {/* Active Walk Route Polyline */}
          {activeRoute && activeRoute.coordinates.length > 1 && (
            <polyline
              points={activeRoute.coordinates.map((c) => `${toSvgX(c[0])},${toSvgY(c[2])}`).join(' ')}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10,6"
              className="animate-pulse"
            />
          )}

          {/* Buildings */}
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            const cx = toSvgX(loc.map_x);
            const cy = toSvgY(loc.map_z);
            const bw = Math.max(38, (loc.width || 32) * 1.35);
            const bh = Math.max(26, (loc.depth || 24) * 1.35);

            return (
              <g
                key={loc.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(loc);
                }}
                className="cursor-pointer transition-all duration-150"
              >
                <rect
                  x={cx - bw / 2}
                  y={cy - bh / 2}
                  width={bw}
                  height={bh}
                  rx="7"
                  fill={isSelected ? '#635BFF' : '#1E293B'}
                  stroke={isSelected ? '#38BDF8' : loc.color || '#475569'}
                  strokeWidth={isSelected ? '3.5' : '1.5'}
                  filter={isSelected ? 'drop-shadow(0 0 8px #635BFF)' : 'none'}
                />
                <text
                  x={cx}
                  y={cy - 2}
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : '#38BDF8'}
                  fontSize="10"
                  fontWeight="black"
                >
                  {loc.block_code}
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fill={isSelected ? '#E2E8F0' : '#94A3B8'}
                  fontSize="8"
                  fontWeight="600"
                >
                  {loc.name.length > 16 ? loc.name.substring(0, 14) + '…' : loc.name}
                </text>
              </g>
            );
          })}

          {/* Live Avatar Marker */}
          <g transform={`translate(${avatarSvgX}, ${avatarSvgY})`}>
            <circle r="24" fill="#06B6D4" opacity="0.25" className="animate-ping" />
            <circle r="14" fill="#06B6D4" opacity="0.4" />
            {/* Heading Arrow */}
            <g transform={`rotate(${headingDeg})`}>
              <polygon points="0,-18 -7,-6 7,-6" fill="#06B6D4" />
            </g>
            {/* Avatar Dot */}
            <circle
              r="8"
              fill={avatarConfig.clothingColor || (avatarConfig.gender === 'boy' ? '#635BFF' : '#EC4899')}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <text y="24" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="black">
              YOU
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
