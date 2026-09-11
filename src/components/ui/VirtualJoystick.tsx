'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, Compass } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (dx: number, dz: number) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  isGpsActive: boolean;
  onToggleGps: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  isSimulating,
  onToggleSimulation,
  isGpsActive,
  onToggleGps,
}) => {
  const activeKeys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      activeKeys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Keyboard loop
    const interval = setInterval(() => {
      let dx = 0;
      let dz = 0;
      const speed = 1.2;

      if (activeKeys.current['w'] || activeKeys.current['ArrowUp']) dz -= speed;
      if (activeKeys.current['s'] || activeKeys.current['ArrowDown']) dz += speed;
      if (activeKeys.current['a'] || activeKeys.current['ArrowLeft']) dx -= speed;
      if (activeKeys.current['d'] || activeKeys.current['ArrowRight']) dx += speed;

      if (dx !== 0 || dz !== 0) {
        onMove(dx, dz);
      }
    }, 40);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [onMove]);

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* Simulation & GPS Pills */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl shadow-xl">
        <button
          onClick={onToggleGps}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
            isGpsActive
              ? 'bg-emerald-500 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-800/80'
          }`}
        >
          <Compass className="w-3 h-3" />
          {isGpsActive ? 'Live GPS Active' : 'Virtual Walk'}
        </button>

        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
            isSimulating
              ? 'bg-[#635BFF] text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-800/80'
          }`}
        >
          {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isSimulating ? 'Pause Tour' : 'Auto Tour'}
        </button>
      </div>

      {/* On-screen D-Pad */}
      {!isGpsActive && (
        <div className="relative w-28 h-28 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/80 shadow-2xl p-1 flex items-center justify-center">
          {/* UP */}
          <button
            onMouseDown={() => onMove(0, -2.5)}
            onTouchStart={() => onMove(0, -2.5)}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-800 hover:bg-[#635BFF] text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* DOWN */}
          <button
            onMouseDown={() => onMove(0, 2.5)}
            onTouchStart={() => onMove(0, 2.5)}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-800 hover:bg-[#635BFF] text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* LEFT */}
          <button
            onMouseDown={() => onMove(-2.5, 0)}
            onTouchStart={() => onMove(-2.5, 0)}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 hover:bg-[#635BFF] text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* RIGHT */}
          <button
            onMouseDown={() => onMove(2.5, 0)}
            onTouchStart={() => onMove(2.5, 0)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 hover:bg-[#635BFF] text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>
        </div>
      )}
    </div>
  );
};
