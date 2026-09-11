'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/types/profile';
import { X, QrCode, ShieldCheck, Phone, RefreshCw } from 'lucide-react';

interface CampusIDCardModalProps {
  profile: StudentProfile;
  onClose: () => void;
}

export const CampusIDCardModal: React.FC<CampusIDCardModalProps> = ({ profile, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tap to Flip Instruction */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-full mb-3 shadow hover:bg-cyan-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tap card to flip ({isFlipped ? 'Show Front' : 'Show Back'})</span>
        </button>

        {/* 3D Flappable Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full aspect-[1/1.58] cursor-pointer perspective"
        >
          <div
            className={`w-full h-full duration-500 transform-style-3d relative transition-transform ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT SIDE */}
            <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F172A] text-white p-5 flex flex-col justify-between">
              {/* Top University Brand Bar */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center font-black text-slate-900 text-sm shadow">
                      LPU
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs tracking-wider uppercase">LOVELY PROFESSIONAL UNIVERSITY</h3>
                      <p className="text-[9px] text-cyan-300 font-medium">Smart Campus Digital Identity</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* Middle Student Information & Photo */}
              <div className="flex items-center gap-4 my-auto">
                {/* Photo with Hologram Badge */}
                <div className="relative">
                  <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-md bg-slate-800">
                    <img
                      src={
                        profile.avatar.gender === 'boy'
                          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
                          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-cyan-400 to-[#635BFF] text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded shadow">
                    VERIFIED
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-sm text-white leading-tight">{profile.name}</h4>
                  <p className="text-[11px] font-semibold text-cyan-300">Reg: {profile.registrationNumber}</p>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{profile.program}</p>
                  <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-400">
                    <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                      Blood: <strong className="text-rose-400">{profile.bloodGroup}</strong>
                    </span>
                    <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                      {profile.term}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Barcode & Security Hologram */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  {/* Fake Barcode Lines */}
                  <div className="h-6 flex items-center gap-[2px] opacity-80">
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-2 h-full bg-white"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-1.5 h-full bg-white"></div>
                    <div className="w-[2px] h-full bg-white"></div>
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-2.5 h-full bg-white"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-1.5 h-full bg-white"></div>
                  </div>
                  <span className="text-[8px] tracking-widest text-slate-400 mt-0.5">
                    LPU-{profile.registrationNumber}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/20">
                  <QrCode className="w-full h-full text-cyan-300" />
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E1B4B] text-white p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
                  Emergency & Residential Details
                </h4>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Hostel Residence:</span>
                    <p className="font-semibold text-slate-200">{profile.hostelBlock}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">School / Department:</span>
                    <p className="font-semibold text-slate-200">{profile.school}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Student Email:</span>
                    <p className="font-mono text-[11px] text-cyan-300">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Emergency Contact:</span>
                    <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {profile.emergencyContact}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 leading-relaxed border-t border-white/10 pt-2">
                This digital card is property of Lovely Professional University. If found, please return to Student Services Centre (Block SSC).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
