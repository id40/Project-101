'use client';

import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, HeartPulse, Navigation, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToHospital: () => void;
}

export function EmergencySOSModal({ isOpen, onClose, onNavigateToHospital }: EmergencySOSModalProps) {
  const [alertTriggered, setAlertTriggered] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c0e14] border border-red-500/50 rounded-2xl p-6 shadow-2xl shadow-red-950/40 text-white overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500 text-red-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                Campus Emergency SOS
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono font-bold uppercase">
                  24/7 Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">LPU Phagwara Security & Medical Rapid Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Emergency Contacts Grid */}
        <div className="mt-5 space-y-2.5 relative z-10">
          {/* Uni-Hospital */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 hover:border-red-500/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <HeartPulse size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Uni-Hospital & Ambulance</p>
                <p className="text-[11px] text-red-200/80 font-mono">Dial: +91 1824 404404 · Ext: 108</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onNavigateToHospital();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-red-500/40"
              >
                <Navigation size={13} />
                <span>Navigate</span>
              </button>
              <a
                href="tel:108"
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
              >
                <PhoneCall size={13} />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Campus Security */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Main Security Control Room</p>
                <p className="text-[11px] text-slate-400 font-mono">Gate 1 Desk: +91 98721 99999</p>
              </div>
            </div>
            <a
              href="tel:+919872199999"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <PhoneCall size={13} />
              <span>Call</span>
            </a>
          </div>

          {/* Women Helpline */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Women’s Safety & Girls Hostel Helpline</p>
                <p className="text-[11px] text-slate-400 font-mono">GH Warden Office: +91 1824 517000</p>
              </div>
            </div>
            <a
              href="tel:+911824517000"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <PhoneCall size={13} />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Instant Rapid Alert Dispatch Button */}
        <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
          {!alertTriggered ? (
            <button
              onClick={() => setAlertTriggered(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-red-600/40 transition-all active:scale-[0.98]"
            >
              <ShieldAlert size={18} />
              <span>TRIGGER RAPID CAMPUS ALERT DISPATCH</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>Security patrol dispatched to your GPS location (Block BH-1, Room 412). Help is on the way!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
