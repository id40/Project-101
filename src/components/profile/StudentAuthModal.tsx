'use client';

import React, { useState } from 'react';
import { 
  Lock, User, Mail, ShieldCheck, KeyRound, Eye, EyeOff, 
  X, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, GraduationCap 
} from 'lucide-react';
import type { StudentProfile } from '@/types/profile';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: StudentProfile) => void;
  initialMode?: 'login' | 'register';
}

export function StudentAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}: StudentAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regNumber, setRegNumber] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProgram, setRegProgram] = useState('B.Tech CSE (AI & Data Science)');
  const [regSchool, setRegSchool] = useState('School of Computer Science and Engineering');
  const [regHostel, setRegHostel] = useState('Boys Hostel BH-1, Room 412');
  const [regEmergency, setRegEmergency] = useState('+91 98721 99999');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');

  if (!isOpen) return null;

  // Fill seeded student credentials for quick testing
  const handleFillDemo = () => {
    setLoginIdentifier('12204589');
    setLoginPassword('LpuCampus@2026!');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Please enter your registration number and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Authentication verified! Loading encrypted vault profile...');
      setTimeout(() => {
        onLoginSuccess(data.profile);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage('Network error connecting to local secure vault.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: regNumber.trim(),
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          school: regSchool,
          program: regProgram,
          hostelBlock: regHostel,
          emergencyContact: regEmergency,
          bloodGroup: regBloodGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Registration successful! Session securely created.');
      setTimeout(() => {
        onLoginSuccess(data.profile);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage('Network error during registration.');
      setIsLoading(false);
    }
  };

  // Password criteria verification helper
  const hasMinLen = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasDigit = /[0-9]/.test(regPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(regPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg bg-[#0c0e14]/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up text-white">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-[#ff5e1e]/20 to-amber-500/20 border border-[#ff5e1e]/40 flex items-center justify-center text-[#ff5e1e] shadow-lg shadow-orange-500/10">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#ffb59d]">
                  LOCAL SECURE VAULT · AES-256
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold font-heading text-white">Student Security Portal</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center p-1 bg-[#161822] border border-white/10 rounded-xl">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#ff5e1e] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Existing Student)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-[#ff5e1e] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="px-6 pt-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="px-6 py-4 overflow-y-auto no-scrollbar flex-1 space-y-4">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Demo Account Quick-Fill */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-[#ffb59d]">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">Pre-Seeded Demo Student</div>
                    <div className="text-[10px] font-mono text-slate-400">Reg: 12204589 · Shekh Imamul</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-[#ff5e1e] hover:bg-[#ff5e1e]/90 text-white text-[11px] font-bold tracking-wide transition-all shadow-sm active:scale-95 flex-shrink-0"
                >
                  Fill Demo
                </button>
              </div>

              {/* Registration Number or Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1.5">
                  Registration Number or University Email
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 12204589 or student@lpu.in"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Security Features Info */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Scrypt GPU-resistant password hashing with salt</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <KeyRound size={13} className="text-cyan-400" />
                  <span>Brute-force defense: auto-locks after 5 failed tries</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#ff5e1e] hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Student Vault</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Registration Number */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. 12208899"
                    required
                    className="w-full px-3 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    required
                    className="w-full px-3 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1">
                  University Email *
                </label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name.id@lpu.in"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password with Strength Indicators */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1">
                  Vault Password *
                </label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    required
                    className="w-full pl-9 pr-10 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Strength Indicators */}
                <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded ${hasMinLen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
                    {hasMinLen ? '✓ 8+ chars' : '8+ chars'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${hasUpper ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
                    {hasUpper ? '✓ Uppercase' : 'Uppercase'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${hasLower ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
                    {hasLower ? '✓ Lowercase' : 'Lowercase'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${hasDigit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
                    {hasDigit ? '✓ Number' : 'Number'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${hasSpecial ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
                    {hasSpecial ? '✓ Symbol' : 'Symbol'}
                  </span>
                </div>
              </div>

              {/* Program & Hostel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1">
                    Academic Program
                  </label>
                  <input
                    type="text"
                    value={regProgram}
                    onChange={(e) => setRegProgram(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1">
                    Hostel Block / Room
                  </label>
                  <input
                    type="text"
                    value={regHostel}
                    onChange={(e) => setRegHostel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contact (AES Encrypted) */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Emergency Contact (Encrypted at Rest)</span>
                  <span className="text-cyan-400 text-[9px]">AES-256-GCM</span>
                </label>
                <input
                  type="text"
                  value={regEmergency}
                  onChange={(e) => setRegEmergency(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-[#161822] border border-white/15 focus:border-[#ff5e1e] rounded-xl text-xs text-white outline-none font-mono"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#ff5e1e] hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Encrypting & Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Create Secure Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
