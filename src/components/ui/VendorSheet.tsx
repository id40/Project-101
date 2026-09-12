'use client';

import React, { useState } from 'react';
import { Vendor } from '@/types/campus';
import { LPU_VENDORS } from '@/data/lpuVendors';
import { X, Store, Star, Navigation, Phone, Tag, ShoppingBag, Utensils, Pill, Printer, DollarSign } from 'lucide-react';

interface VendorSheetProps {
  onSelectVendor: (ven: Vendor) => void;
  onNavigateToVendor: (ven: Vendor) => void;
  onClose: () => void;
  userPosition: [number, number, number];
  onOpenBooking?: (shopId?: string) => void;
}

export const VendorSheet: React.FC<VendorSheetProps> = ({
  onSelectVendor,
  onNavigateToVendor,
  onClose,
  userPosition,
  onOpenBooking,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Shops', icon: Store },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'stationery', label: 'Books & Printing', icon: Printer },
    { id: 'pharmacy', label: 'Pharmacy & Health', icon: Pill },
    { id: 'atm', label: 'Banks & ATMs', icon: DollarSign },
  ];

  const filtered = LPU_VENDORS.filter((v) => filter === 'all' || v.category === filter);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-800 text-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Campus Vendors & Services</h3>
              <p className="text-[11px] text-slate-400">Essential shops & student discounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#635BFF] text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Vendors List */}
        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {filtered.map((vendor) => {
            // Distance from avatar
            const dist = Math.round(
              Math.hypot(vendor.map_x - userPosition[0], vendor.map_z - userPosition[2])
            );

            return (
              <div
                key={vendor.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-white leading-tight">{vendor.name}</h4>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {vendor.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{vendor.description}</p>
                  </div>
                </div>

                {vendor.discount_info && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-lg">
                    <Tag className="w-3 h-3 shrink-0" />
                    <span>{vendor.discount_info}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>
                    <strong>{dist}m</strong> away • {vendor.opening_hours}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {vendor.location_id === 'b-15-unimall' && onOpenBooking && (
                      <button
                        onClick={() => {
                          onOpenBooking();
                          onClose();
                        }}
                        className="px-2 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Book / Order
                      </button>
                    )}
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors"
                        title="Call Vendor"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        onNavigateToVendor(vendor);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-[#635BFF] hover:bg-[#5248E5] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      Walk Here
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
