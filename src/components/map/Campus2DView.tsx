'use client';

import React from 'react';
import { CampusLocation, NavigationRoute } from '@/types/campus';
import { AvatarConfig } from '@/types/profile';

interface Campus2DViewProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
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
  // World bounds to SVG viewBox mapping
  // Map world x in [-180, 180] and z in [-160, 160] -> SVG (0,0) to (800, 700)
  const toSvgX = (x: number) => ((x + 180) / 360) * 800;
  const toSvgY = (z: number) => ((z + 160) / 320) * 700;

  const avatarSvgX = toSvgX(avatarPosition[0]);
  const avatarSvgY = toSvgY(avatarPosition[2]);
  const headingDeg = (avatarHeading * 180) / Math.PI;

  return (
    <div className="w-full h-full bg-[#0F172A] relative overflow-hidden flex items-center justify-center select-none p-4">
      <svg
        viewBox="0 0 800 700"
        className="w-full h-full max-w-4xl max-h-[85vh] drop-shadow-2xl rounded-2xl bg-[#1E293B] border border-slate-700"
      >
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
          </pattern>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#635BFF" />
          </linearGradient>
        </defs>

        <rect width="800" height="700" fill="url(#grid)" />

        {/* Central Fountain / Water feature */}
        <circle cx={toSvgX(0)} cy={toSvgY(0)} r="26" fill="#0284C7" opacity="0.4" />
        <circle cx={toSvgX(0)} cy={toSvgY(0)} r="18" fill="#38BDF8" opacity="0.8" />

        {/* Main Avenues / Roads */}
        <line x1={toSvgX(-180)} y1={toSvgY(0)} x2={toSvgX(180)} y2={toSvgY(0)} stroke="#475569" strokeWidth="18" strokeLinecap="round" />
        <line x1={toSvgX(0)} y1={toSvgY(-160)} x2={toSvgX(0)} y2={toSvgY(160)} stroke="#475569" strokeWidth="18" strokeLinecap="round" />

        {/* Secondary Walkways */}
        <line x1={toSvgX(45)} y1={toSvgY(-20)} x2={toSvgX(120)} y2={toSvgY(-84)} stroke="#64748B" strokeWidth="8" strokeDasharray="6,4" />
        <line x1={toSvgX(-62)} y1={toSvgY(31)} x2={toSvgX(-140)} y2={toSvgY(90)} stroke="#64748B" strokeWidth="8" strokeDasharray="6,4" />
        <line x1={toSvgX(0)} y1={toSvgY(60)} x2={toSvgX(80)} y2={toSvgY(40)} stroke="#64748B" strokeWidth="8" strokeDasharray="6,4" />

        {/* Sports Arena Track */}
        <ellipse cx={toSvgX(-110)} cy={toSvgY(-55)} rx="45" ry="35" fill="none" stroke="#EF4444" strokeWidth="10" opacity="0.7" />
        <text x={toSvgX(-110)} y={toSvgY(-55)} textAnchor="middle" fill="#FCA5A5" fontSize="10" fontWeight="bold">
          ATHLETIC TURF
        </text>

        {/* Active Walk Route Line */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <polyline
            points={activeRoute.coordinates.map((c) => `${toSvgX(c[0])},${toSvgY(c[2])}`).join(' ')}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8,6"
            className="animate-pulse"
          />
        )}

        {/* Campus Buildings */}
        {locations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          const cx = toSvgX(loc.map_x);
          const cy = toSvgY(loc.map_z);
          const bw = (loc.width || 30) * 1.8;
          const bh = (loc.depth || 25) * 1.8;

          return (
            <g
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className="cursor-pointer transition-transform duration-150 hover:scale-105"
            >
              <rect
                x={cx - bw / 2}
                y={cy - bh / 2}
                width={bw}
                height={bh}
                rx="8"
                fill={isSelected ? '#635BFF' : '#1E293B'}
                stroke={isSelected ? '#38BDF8' : '#475569'}
                strokeWidth={isSelected ? '4' : '2'}
                className="transition-all"
              />

              {/* Block Code & Name */}
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                fill={isSelected ? '#FFFFFF' : '#38BDF8'}
                fontSize="12"
                fontWeight="bold"
              >
                [{loc.block_code}]
              </text>
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fill={isSelected ? '#E2E8F0' : '#94A3B8'}
                fontSize="9.5"
                fontWeight="500"
              >
                {loc.name.length > 18 ? loc.name.substring(0, 16) + '…' : loc.name}
              </text>

              {loc.has_indoor_map && (
                <rect
                  x={cx + bw / 2 - 18}
                  y={cy - bh / 2 + 4}
                  width="14"
                  height="14"
                  rx="3"
                  fill="#06B6D4"
                />
              )}
            </g>
          );
        })}

        {/* Live Avatar Marker */}
        <g transform={`translate(${avatarSvgX}, ${avatarSvgY})`}>
          {/* Radar Pulse Ring */}
          <circle r="22" fill="#06B6D4" opacity="0.25" className="animate-ping" />
          <circle r="14" fill="#06B6D4" opacity="0.4" />

          {/* Heading Arrow */}
          <g transform={`rotate(${headingDeg})`}>
            <polygon points="0,-18 -7, -6 7, -6" fill="#06B6D4" />
          </g>

          {/* Avatar Dot */}
          <circle
            r="8"
            fill={avatarConfig.clothingColor || (avatarConfig.gender === 'boy' ? '#635BFF' : '#EC4899')}
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <text y="24" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" className="drop-shadow">
            YOU
          </text>
        </g>
      </svg>
    </div>
  );
};
