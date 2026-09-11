'use client';

import React from 'react';
import { Compass, Navigation, Store, CreditCard, Sparkles } from 'lucide-react';

export type NavTab = 'explore' | 'navigate' | 'vendors' | 'idcard' | 'chat';

interface AndroidBottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveRoute: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onTabChange,
  hasActiveRoute,
}) => {
  const tabs = [
    { id: 'explore' as NavTab, label: 'Explore', icon: Compass },
    { id: 'navigate' as NavTab, label: 'Route', icon: Navigation, badge: hasActiveRoute },
    { id: 'vendors' as NavTab, label: 'Vendors', icon: Store },
    { id: 'idcard' as NavTab, label: 'Campus ID', icon: CreditCard },
    { id: 'chat' as NavTab, label: 'AI Buddy', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 safe-area-pb select-none">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative group focus:outline-none transition-colors"
            >
              <div
                className={`relative w-11 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#635BFF] text-white shadow-md' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.badge && (
                  <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0F172A]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
