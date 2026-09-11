'use client';

import React from 'react';
import { StudentProfile, AvatarConfig } from '@/types/profile';
import { X, User, Calendar, CheckCircle2, Navigation, Palette, Award } from 'lucide-react';

interface StudentProfileDrawerProps {
  profile: StudentProfile;
  onUpdateAvatar: (config: AvatarConfig) => void;
  onNavigateToBuilding: (buildingId: string) => void;
  onOpenIDCard: () => void;
  onClose: () => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  profile,
  onUpdateAvatar,
  onNavigateToBuilding,
  onOpenIDCard,
  onClose,
}) => {
  const colorOptions = [
    { name: 'Electric Indigo', hex: '#635BFF' },
    { name: 'Cyan Tech', hex: '#06B6D4' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Rose Pink', hex: '#EC4899' },
    { name: 'Midnight', hex: '#0F172A' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-800 text-white h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#635BFF]/20 flex items-center justify-center text-[#635BFF]">
              <User className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Student Dashboard</h3>
              <p className="text-[11px] text-slate-400">Reg No: {profile.registrationNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {/* Quick ID Card Banner */}
          <div
            onClick={onOpenIDCard}
            className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#312E81] border border-[#635BFF]/30 flex items-center justify-between hover:border-cyan-400 transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white font-bold shadow">
                ID
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                  Digital Campus ID Card
                </h4>
                <p className="text-[11px] text-slate-300">Tap to inspect QR & barcode</p>
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          {/* Attendance Meter */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Overall Attendance</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                {profile.attendancePercentage}% (Safe)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#635BFF] to-emerald-400 rounded-full"
                style={{ width: `${profile.attendancePercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Requirement: 75% minimum to sit in end-term exams.</p>
          </div>

          {/* 3D Avatar Customizer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs text-white">3D Avatar Customizer</h4>
            </div>

            {/* Gender Toggle */}
            <div className="mb-4">
              <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Avatar Model:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateAvatar({ ...profile.avatar, gender: 'boy' })}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    profile.avatar.gender === 'boy'
                      ? 'bg-[#635BFF] text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Boy Avatar
                </button>
                <button
                  onClick={() => onUpdateAvatar({ ...profile.avatar, gender: 'girl' })}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    profile.avatar.gender === 'girl'
                      ? 'bg-[#EC4899] text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Girl Avatar
                </button>
              </div>
            </div>

            {/* Hoodie / Clothing Color */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Outfit Color:</label>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateAvatar({ ...profile.avatar, clothingColor: c.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      profile.avatar.clothingColor === c.hex ? 'border-white scale-110 shadow' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Today's Timetable with Route Trigger */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#635BFF]" />
              <h4 className="font-bold text-xs text-white">Today's Class Schedule</h4>
            </div>

            <div className="space-y-2.5">
              {profile.schedule.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-cyan-300">{session.courseCode}</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                        {session.roomNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-medium line-clamp-1">{session.courseName}</p>
                    <p className="text-[10px] text-slate-400">
                      {session.startTime} - {session.endTime} • Prof. {session.instructor}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateToBuilding(session.buildingId)}
                    className="px-2.5 py-1.5 bg-[#635BFF] hover:bg-[#5248E5] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Walk
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
