'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Clock,
  MapPin,
  Star,
  Plus,
  Minus,
  CheckCircle2,
  QrCode,
  Search,
  Ticket,
  Printer,
  CreditCard,
  AlertCircle,
  TrendingUp,
  ReceiptText
} from 'lucide-react';
import { UNIMALL_SHOPS } from '@/data/unimallCatalog';
import {
  UniMallShop,
  UniMallShopItem,
  CartItem,
  BookingTicket,
  UniMallShopCategory,
  PrintOrderSpecs
} from '@/types/unimallBooking';

interface UniMallBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialShopId?: string | null;
  onNavigateToShop?: (shopId: string) => void;
}

const STORAGE_KEY = 'lpu_unimall_bookings';

export const UniMallBookingModal: React.FC<UniMallBookingModalProps> = ({
  isOpen,
  onClose,
  initialShopId,
  onNavigateToShop
}) => {
  const [activeTab, setActiveTab] = useState<'shops' | 'active_tokens'>('shops');
  const [categoryFilter, setCategoryFilter] = useState<UniMallShopCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<UniMallShop | null>(UNIMALL_SHOPS[0] || null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(UNIMALL_SHOPS[0]?.availableSlots[0] || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Campus Card / RMS' | 'Pay at Counter'>('UPI');

  const [printSpecs, setPrintSpecs] = useState<PrintOrderSpecs>({
    documentName: 'Assignment_Term_Paper.pdf',
    pageCount: 15,
    copies: 1,
    printType: 'black_white',
    paperSize: 'A4',
    binding: 'spiral',
    doubleSided: true,
  });

  const [confirmedBookings, setConfirmedBookings] = useState<BookingTicket[]>([]);
  const [activeSuccessTicket, setActiveSuccessTicket] = useState<BookingTicket | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfirmedBookings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveBookings = (updated: BookingTicket[]) => {
    setConfirmedBookings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (initialShopId) {
      const target = UNIMALL_SHOPS.find((s) => s.id === initialShopId);
      if (target) {
        setSelectedShop(target);
        if (target.availableSlots && target.availableSlots.length > 0) {
          setSelectedTimeSlot(target.availableSlots[0]);
        }
      }
    }
  }, [initialShopId, isOpen]);

  useEffect(() => {
    if (selectedShop && selectedShop.availableSlots && selectedShop.availableSlots.length > 0) {
      setSelectedTimeSlot(selectedShop.availableSlots[0]);
    }
  }, [selectedShop]);

  if (!isOpen) return null;

  const filteredShops = UNIMALL_SHOPS.filter((shop) => {
    const matchesCategory = categoryFilter === 'all' || shop.category === categoryFilter;
    const matchesQuery =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleAddToCart = (item: UniMallShopItem) => {
    if (!selectedShop) return;
    setCart((prev) => {
      const currentShopId = prev.length > 0 ? prev[0].shopId : selectedShop.id;
      let cleanPrev = prev;
      if (currentShopId !== selectedShop.id) {
        cleanPrev = [];
      }
      const existing = cleanPrev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return cleanPrev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      } else {
        return [...cleanPrev, { shopId: selectedShop.id, item, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const calculatePrintTotal = () => {
    const ratePerPage = printSpecs.printType === 'black_white' ? 2 : 8;
    const pagesCost = printSpecs.pageCount * ratePerPage * printSpecs.copies;
    let bindingCost = 0;
    if (printSpecs.binding === 'spiral') bindingCost = 35 * printSpecs.copies;
    if (printSpecs.binding === 'hardbound') bindingCost = 350 * printSpecs.copies;
    return pagesCost + bindingCost;
  };

  const cartSubtotal =
    selectedShop?.serviceType === 'print_upload'
      ? calculatePrintTotal()
      : cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const tax = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + tax;

  const handleCheckout = () => {
    if (!selectedShop) return;

    const tokenNumber = `UM-${selectedShop.name.slice(0, 3).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newTicket: BookingTicket = {
      id: `ticket-${Date.now()}`,
      tokenNumber,
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      shopCategory: selectedShop.category,
      floor: selectedShop.floor,
      studentId: '12204589',
      studentName: 'Shekh Imamul',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pickupSlot: selectedTimeSlot || 'Next Available (10-15m)',
      serviceType: selectedShop.serviceType,
      items:
        selectedShop.serviceType === 'print_upload'
          ? [
              {
                name: `${printSpecs.documentName} (${printSpecs.pageCount} pgs, ${printSpecs.printType})`,
                quantity: printSpecs.copies,
                price: calculatePrintTotal(),
              },
            ]
          : cart.map((ci) => ({
              name: ci.item.name,
              quantity: ci.quantity,
              price: ci.item.price,
            })),
      printSpecs: selectedShop.serviceType === 'print_upload' ? printSpecs : undefined,
      subtotal: cartSubtotal,
      tax: tax,
      totalAmount: grandTotal,
      paymentMethod,
      status: 'confirmed',
      qrCodeData: `LPU-PASS-${tokenNumber}-STUDENT-12204589`,
    };

    const updated = [newTicket, ...confirmedBookings];
    saveBookings(updated);
    setActiveSuccessTicket(newTicket);
    setCart([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">UniMall Booking Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Block 15 Express
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pre-order meals, reserve print slots & grab service queue tokens to skip waiting lines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => {
                  setActiveTab('shops');
                  setActiveSuccessTicket(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'shops'
                    ? 'bg-[#635BFF] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mall Outlets
              </button>
              <button
                onClick={() => {
                  setActiveTab('active_tokens');
                  setActiveSuccessTicket(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'active_tokens'
                    ? 'bg-[#635BFF] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                Active Tokens
                {confirmedBookings.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                    {confirmedBookings.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTAINER */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* TAB 1: OUTLETS & BOOKING ENGINE */}
          {activeTab === 'shops' && (
            <>
              {/* LEFT SIDEBAR: OUTLETS LISTING */}
              <div className="w-72 md:w-80 border-r border-slate-800 flex flex-col bg-[#0c1322] shrink-0">
                <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Domino's, Prints, Bank, Subway..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#635BFF]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    {[
                      { id: 'all', label: 'All (12)' },
                      { id: 'food', label: '🍔 Food' },
                      { id: 'print', label: '🖨️ Prints' },
                      { id: 'retail', label: '🛍️ Retail' },
                      { id: 'banking', label: '🏦 Banks' },
                      { id: 'services', label: '📦 Services' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategoryFilter(c.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          categoryFilter === c.id
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredShops.map((shop) => {
                    const isSelected = selectedShop?.id === shop.id;
                    return (
                      <div
                        key={shop.id}
                        onClick={() => {
                          setSelectedShop(shop);
                          setActiveSuccessTicket(null);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e293b] border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                              {shop.logoEmoji}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                {shop.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Floor {shop.floor === 0 ? 'Ground' : `${shop.floor}F`} • {shop.categoryLabel}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              shop.queueStatus === 'Low'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : shop.queueStatus === 'Moderate'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {shop.queueStatus} Queue (~{shop.avgWaitMins}m)
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                          {shop.tagline}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-slate-200">{shop.rating}</span>
                            <span>({shop.totalReviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{shop.openingHours}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredShops.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-medium">No UniMall shops found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT MAIN PANEL */}
              <div className="flex-1 flex overflow-hidden bg-[#0A0F1D] min-w-0">
                {selectedShop ? (
                  <>
                    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-5 border-r border-slate-800 min-w-0">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${selectedShop.bannerColor} border border-slate-700/60 mb-5 relative overflow-hidden`}>
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{selectedShop.logoEmoji}</span>
                              <h3 className="text-lg font-extrabold text-white">{selectedShop.name}</h3>
                            </div>
                            <p className="text-xs text-slate-300 max-w-md">{selectedShop.tagline}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-300">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                {selectedShop.locationDetails}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                Avg prep: {selectedShop.avgWaitMins} mins
                              </span>
                            </div>
                          </div>

                          {onNavigateToShop && (
                            <button
                              onClick={() => onNavigateToShop(selectedShop.id)}
                              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                            >
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              Locate on Blueprint
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedShop.serviceType === 'print_upload' ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                              <Printer className="w-4 h-4 text-emerald-400" />
                              Fast Document Print & Bindery Specifier
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Document Name / Title</label>
                                <input
                                  type="text"
                                  value={printSpecs.documentName}
                                  onChange={(e) =>
                                    setPrintSpecs({ ...printSpecs, documentName: e.target.value })
                                  }
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Total Page Count</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={500}
                                  value={printSpecs.pageCount}
                                  onChange={(e) =>
                                    setPrintSpecs({
                                      ...printSpecs,
                                      pageCount: Math.max(1, parseInt(e.target.value) || 1),
                                    })
                                  }
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Color Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => setPrintSpecs({ ...printSpecs, printType: 'black_white' })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center ${
                                      printSpecs.printType === 'black_white'
                                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                        : 'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    B&W (₹2/page)
                                  </button>
                                  <button
                                    onClick={() => setPrintSpecs({ ...printSpecs, printType: 'color' })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center ${
                                      printSpecs.printType === 'color'
                                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                        : 'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    Color (₹8/page)
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Binding Requirement</label>
                                <select
                                  value={printSpecs.binding}
                                  onChange={(e) =>
                                    setPrintSpecs({ ...printSpecs, binding: e.target.value as any })
                                  }
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                                >
                                  <option value="none">No Binding (Loose Sheets)</option>
                                  <option value="staple">Corner Staple (+₹0)</option>
                                  <option value="spiral">Spiral Wire Ring (+₹35)</option>
                                  <option value="hardbound">LPU Thesis Hardbound Gold (+₹350)</option>
                                </select>
                              </div>
                            </div>

                            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center justify-between text-xs">
                              <span className="text-slate-300">
                                Calculated Print Fee ({printSpecs.pageCount} pgs × ₹{printSpecs.printType === 'black_white' ? 2 : 8}):
                              </span>
                              <span className="text-emerald-400 font-bold text-sm">
                                ₹{calculatePrintTotal()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                            <span>Available Items & Slots</span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {selectedShop.items.length} options
                            </span>
                          </h4>

                          <div className="grid grid-cols-1 gap-3">
                            {selectedShop.items.map((item) => {
                              const inCart = cart.find((ci) => ci.item.id === item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition-all"
                                >
                                  <div className="flex items-start gap-3 flex-1">
                                    <span className="text-2xl p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                                      {item.imageEmoji || selectedShop.logoEmoji}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-xs font-bold text-white">{item.name}</h5>
                                        {item.isPopular && (
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            Popular
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                                        {item.description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs font-extrabold text-amber-400">
                                          {item.price === 0 ? 'Free Slot' : `₹${item.price}`}
                                        </span>
                                        {item.prepTimeMinutes && (
                                          <span className="text-[10px] text-slate-400">
                                            • {item.prepTimeMinutes}m prep
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    {inCart ? (
                                      <div className="flex items-center gap-2 bg-[#635BFF]/20 border border-[#635BFF]/50 rounded-lg p-1">
                                        <button
                                          onClick={() => handleUpdateQuantity(item.id, -1)}
                                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold px-1.5 text-white">
                                          {inCart.quantity}
                                        </span>
                                        <button
                                          onClick={() => handleUpdateQuantity(item.id, 1)}
                                          className="w-6 h-6 rounded bg-[#635BFF] hover:bg-[#5248e5] text-white flex items-center justify-center"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAddToCart(item)}
                                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        {item.price === 0 ? 'Book Token' : 'Add'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CHECKOUT SUMMARY */}
                    <div className="w-full md:w-80 p-5 flex flex-col bg-[#0b101c] shrink-0 justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <ReceiptText className="w-4 h-4 text-amber-400" />
                            Booking Summary
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Reg #12204589
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            Select Pickup / Arrival Slot:
                          </label>
                          <select
                            value={selectedTimeSlot}
                            onChange={(e) => setSelectedTimeSlot(e.target.value)}
                            className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-[#635BFF]"
                          >
                            {selectedShop.availableSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                          {selectedShop.serviceType === 'print_upload' ? (
                            <div className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                              <p className="font-bold text-white">{printSpecs.documentName}</p>
                              <p className="text-[11px] text-slate-400">
                                {printSpecs.pageCount} Pages • {printSpecs.printType} • {printSpecs.binding}
                              </p>
                              <p className="text-right font-semibold text-amber-400">₹{calculatePrintTotal()}</p>
                            </div>
                          ) : cart.length > 0 ? (
                            cart.map((ci) => (
                              <div
                                key={ci.item.id}
                                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
                              >
                                <div>
                                  <span className="font-medium text-white">{ci.item.name}</span>
                                  <span className="text-[10px] text-slate-400 block">
                                    ₹{ci.item.price} × {ci.quantity}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-200">
                                  ₹{ci.item.price * ci.quantity}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-slate-500 text-xs">
                              Select items or slots to prepare token
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                            Payment Mode:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            {(['UPI', 'Campus Card / RMS', 'Pay at Counter'] as const).map((pm) => (
                              <button
                                key={pm}
                                onClick={() => setPaymentMethod(pm)}
                                className={`p-1.5 rounded-lg font-medium text-center border transition-all ${
                                  paymentMethod === pm
                                    ? 'bg-[#635BFF] text-white border-[#635BFF]'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                              >
                                {pm}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Subtotal:</span>
                            <span>₹{cartSubtotal}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Campus GST (5%):</span>
                            <span>₹{tax}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800/80">
                            <span>Grand Total:</span>
                            <span className="text-amber-400">₹{grandTotal}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          disabled={
                            selectedShop.serviceType !== 'print_upload' &&
                            cart.length === 0 &&
                            selectedShop.category !== 'services' &&
                            selectedShop.category !== 'banking'
                          }
                          onClick={handleCheckout}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Generate Digital Token & Confirm
                        </button>
                        <p className="text-[10px] text-center text-slate-500 mt-2">
                          Instant QR token issued to your student ID. Skip in-store queue.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                    <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-semibold text-slate-400">Select an outlet from the left</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Choose any shop to browse menu items, print options, or book bank slots.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ACTIVE DIGITAL TOKENS / PASSES */}
          {activeTab === 'active_tokens' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#0A0F1D]">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-amber-400" />
                      Active UniMall Service Passes & Food Tokens
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Show this digital pass at the shop pickup counter or scan at the express turnstile.
                    </p>
                  </div>

                  {confirmedBookings.length > 0 && (
                    <button
                      onClick={() => saveBookings([])}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {confirmedBookings.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-5 rounded-2xl bg-[#111827] border border-amber-500/30 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-500 text-slate-950 tracking-wider">
                            {ticket.tokenNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {ticket.shopName}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            Floor {ticket.floor === 0 ? 'Ground' : `${ticket.floor}F`}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 space-y-1">
                          <p className="text-slate-400 text-[11px]">
                            Pickup Window: <strong className="text-emerald-400">{ticket.pickupSlot}</strong>
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Student: {ticket.studentName} ({ticket.studentId}) • Booked at {ticket.timestamp}
                          </p>
                        </div>

                        {ticket.items && ticket.items.length > 0 && (
                          <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
                            {ticket.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span>{it.quantity}x {it.name}</span>
                                <span className="text-slate-300 font-medium">₹{it.price}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between font-bold text-amber-400 pt-1 border-t border-slate-800/50 mt-1">
                              <span>Total Paid via {ticket.paymentMethod}:</span>
                              <span>₹{ticket.totalAmount}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-slate-950 shrink-0 shadow-md">
                        <QrCode className="w-24 h-24" />
                        <span className="text-[9px] font-mono tracking-widest font-black mt-1 uppercase text-slate-700">
                          {ticket.tokenNumber}
                        </span>
                      </div>
                    </div>
                  ))}

                  {confirmedBookings.length === 0 && (
                    <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-300">No active bookings yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Select food, print jobs, or tokens in the Outlets tab to skip the line.
                      </p>
                      <button
                        onClick={() => setActiveTab('shops')}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-semibold hover:bg-[#5248e5] transition-all"
                      >
                        Explore UniMall Outlets
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* POPUP CONFIRMATION MODAL OVERLAY (when order succeeds) */}
        {activeSuccessTicket && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="bg-[#0F172A] border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto text-slate-950 shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Order Confirmed!</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Token #{activeSuccessTicket.tokenNumber}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your request has been beamed directly to {activeSuccessTicket.shopName}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <div className="bg-white p-3 rounded-lg shadow">
                  <QrCode className="w-32 h-32 text-slate-950" />
                </div>
                <div className="mt-3 text-xs text-slate-300">
                  <p className="font-semibold text-white">Pickup Window: {activeSuccessTicket.pickupSlot}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Floor {activeSuccessTicket.floor === 0 ? 'Ground' : `${activeSuccessTicket.floor}F`} Express Counter</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveSuccessTicket(null);
                    setActiveTab('active_tokens');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5248e5] text-white text-xs font-bold transition-colors"
                >
                  View in Active Passes
                </button>
                <button
                  onClick={() => setActiveSuccessTicket(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

