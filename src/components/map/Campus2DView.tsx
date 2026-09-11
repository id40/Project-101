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
  // Map world x in [-200, 220] and z in [-160, 240] -> SVG (0,0) to (950, 850)
  const toSvgX = (x: number) => ((x + 200) / 420) * 950;
  const toSvgY = (z: number) => ((z + 160) / 400) * 850;

  const avatarSvgX = toSvgX(avatarPosition[0]);
  const avatarSvgY = toSvgY(avatarPosition[2]);
  const headingDeg = (avatarHeading * 180) / Math.PI;

  return (
    <div className="w-full h-full bg-[#0F172A] relative overflow-hidden flex items-center justify-center select-none p-2 sm:p-4">
      <svg
        viewBox="0 0 950 850"
        className="w-full h-full max-w-5xl max-h-[85vh] drop-shadow-2xl rounded-2xl bg-[#1E293B] border border-slate-700"
      >
        {/* Grids and Gradients */}
        <defs>
          <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#334155" strokeWidth="0.75" />
          </pattern>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#635BFF" />
          </linearGradient>
        </defs>

        <rect width="950" height="850" fill="url(#grid)" />

        {/* Grand Trunk Road (NH-1) Highway */}
        <line x1={toSvgX(240)} y1={toSvgY(250)} x2={toSvgX(170)} y2={toSvgY(150)} stroke="#475569" strokeWidth="24" strokeLinecap="round" />
        <line x1={toSvgX(240)} y1={toSvgY(250)} x2={toSvgX(170)} y2={toSvgY(150)} stroke="#FBBF24" strokeWidth="2" strokeDasharray="10,6" />
        <text x={toSvgX(215)} y={toSvgY(240)} fill="#94A3B8" fontSize="10" fontWeight="bold" transform={`rotate(-50, ${toSvgX(215)}, ${toSvgY(240)})`}>
          JALANDHAR-DELHI GT ROAD (NH-1)
        </text>

        {/* Main Campus Promenade (Gate 1 to UniMall) */}
        <line x1={toSvgX(200)} y1={toSvgY(205)} x2={toSvgX(20)} y2={toSvgY(15)} stroke="#334155" strokeWidth="16" strokeLinecap="round" />

        {/* Academic Spine (UniMall to CS Block 34) */}
        <line x1={toSvgX(20)} y1={toSvgY(15)} x2={toSvgX(-80)} y2={toSvgY(-15)} stroke="#334155" strokeWidth="14" strokeLinecap="round" />

        {/* West Ring Road */}
        <line x1={toSvgX(-170)} y1={toSvgY(-105)} x2={toSvgX(-20)} y2={toSvgY(-105)} stroke="#475569" strokeWidth="12" strokeLinecap="round" />

        {/* Sports Complex: Cricket Stadium Oval */}
        <ellipse cx={toSvgX(-120)} cy={toSvgY(-40)} rx="55" ry="42" fill="#15803D" opacity="0.3" stroke="#16A34A" strokeWidth="3" />
        <ellipse cx={toSvgX(-120)} cy={toSvgY(-40)} rx="45" ry="34" fill="none" stroke="#EF4444" strokeWidth="5" strokeDasharray="6,4" />
        <text x={toSvgX(-120)} y={toSvgY(-40)} textAnchor="middle" fill="#86EFAC" fontSize="11" fontWeight="bold">
          MAIN CRICKET STADIUM
        </text>

        {/* Olympic Swimming Pool */}
        <rect x={toSvgX(-95)} y={toSvgY(-95)} width="36" height="24" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" opacity="0.8" />
        <text x={toSvgX(-77)} y={toSvgY(-80)} textAnchor="middle" fill="#E0F2FE" fontSize="9" fontWeight="bold">
          50M POOL
        </text>

        {/* Baldev Raj Mittal Unipolis Canopy */}
        <ellipse cx={toSvgX(20)} cy={toSvgY(-10)} rx="48" ry="36" fill="#635BFF" opacity="0.25" stroke="#635BFF" strokeWidth="2" strokeDasharray="5,3" />
        <text x={toSvgX(20)} y={toSvgY(-10)} textAnchor="middle" fill="#A5B4FC" fontSize="11" fontWeight="bold">
          UNIPOLIS AMPHITHEATRE
        </text>

        {/* Active Walk Route Line */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <polyline
            points={activeRoute.coordinates.map((c) => `${toSvgX(c[0])},${toSvgY(c[2])}`).join(' ')}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="7"
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
          const bw = (loc.width || 32) * 1.5;
          const bh = (loc.depth || 24) * 1.5;

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
                rx="6"
                fill={isSelected ? '#635BFF' : '#1E293B'}
                stroke={isSelected ? '#38BDF8' : loc.color || '#475569'}
                strokeWidth={isSelected ? '3.5' : '1.8'}
                className="transition-all"
              />

              {/* Block Code & Name */}
              <text
                x={cx}
                y={cy - 3}
                textAnchor="middle"
                fill={isSelected ? '#FFFFFF' : '#38BDF8'}
                fontSize="11"
                fontWeight="bold"
              >
                [{loc.block_code}]
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fill={isSelected ? '#E2E8F0' : '#94A3B8'}
                fontSize="8.5"
                fontWeight="500"
              >
                {loc.name.length > 18 ? loc.name.substring(0, 16) + '…' : loc.name}
              </text>
            </g>
          );
        })}

        {/* Live Avatar Marker */}
        <g transform={`translate(${avatarSvgX}, ${avatarSvgY})`}>
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
