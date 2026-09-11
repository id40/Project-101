'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, MapPin, Navigation, Layers, Cpu } from 'lucide-react';
import { CampusLocation } from '@/types/campus';

interface Message {
  role: 'assistant' | 'user';
  text: string;
  actionLocationId?: string;
  actionType?: 'navigate' | 'indoor' | 'focus';
  poweredBy?: string;
}

interface AIChatDrawerProps {
  onClose: () => void;
  onFocusLocation: (locId: string) => void;
  onNavigateToLocation: (loc: CampusLocation) => void;
  onOpenIndoorMap: (locId: string) => void;
  locations: CampusLocation[];
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  onClose,
  onFocusLocation,
  onNavigateToLocation,
  onOpenIndoorMap,
  locations,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "👋 **Hello! I'm your LPU Campus Assistant powered by Google Gemini.**\nAsk me about any academic block, classroom, food court, hostel curfew, salon services, or emergency help!",
      poweredBy: 'gemini-2.5-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuickReplies, setActiveQuickReplies] = useState<string[]>([
    'Where is Lovely Sweets (UniMall)?',
    'What are the Central Library hours?',
    'Where is Academic Block 34 (CSE)?',
    'What are the hostel curfew timings?',
    'Where is Uni-Hospital or Emergency?',
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || "I don't have verified information about that yet.",
          actionLocationId: data.actionLocationId,
          actionType: data.actionType,
          poweredBy: data.poweredBy,
        },
      ]);
      if (data.quickReplies && data.quickReplies.length > 0) {
        setActiveQuickReplies(data.quickReplies);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Campus directory is temporarily busy. Emergency helpline: **01824-517000**.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render basic markdown (bold and bullets)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      // Parse bold segments
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className={line.startsWith('•') ? 'pl-2 text-slate-300' : 'text-slate-200'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#090D16] border-l border-slate-800/80 text-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0F172A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#635BFF] via-[#38BDF8] to-pink-500 flex items-center justify-center text-white shadow-lg shadow-[#635BFF]/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                LPU Campus Assistant
                <span className="flex items-center gap-1 text-[9px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 font-semibold px-2 py-0.5 rounded-full">
                  <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                  Gemini AI
                </span>
              </h3>
              <p className="text-[11px] text-cyan-300 font-medium">All 40+ Blocks, Hostels, Food & Timings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Suggestion Chips */}
        <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
          {activeQuickReplies.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-slate-900 hover:bg-[#635BFF]/20 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-full whitespace-nowrap border border-slate-800 hover:border-[#635BFF]/40 transition-all shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
          {messages.map((m, idx) => {
            const loc = m.actionLocationId ? locations.find((l) => l.id === m.actionLocationId) : null;

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#635BFF]/20 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-[#635BFF] to-[#4F46E5] text-white rounded-br-none shadow-lg'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow'
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(m.text)}</div>

                  {/* Powered By pill */}
                  {m.role === 'assistant' && (
                    <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{m.poweredBy === 'gemini-2.5-flash' ? 'Google Gemini 2.5 Flash' : 'LPU Verified Knowledge Engine'}</span>
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  {m.actionLocationId && loc && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          onFocusLocation(loc.id);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1.5 rounded-xl hover:bg-cyan-900 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        Show on 3D Map
                      </button>

                      <button
                        onClick={() => {
                          onNavigateToLocation(loc);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#635BFF] hover:bg-[#5248E5] px-2.5 py-1.5 rounded-xl transition-colors shadow"
                      >
                        <Navigation className="w-3 h-3" />
                        Walk Route
                      </button>

                      {loc.has_indoor_map && (
                        <button
                          onClick={() => {
                            onOpenIndoorMap(loc.id);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1.5 rounded-xl hover:bg-amber-900 transition-colors"
                        >
                          <Layers className="w-3 h-3 text-amber-400" />
                          Indoor Floors
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-900/60 rounded-xl border border-slate-800/60 w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Gemini is thinking…</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-[#0F172A]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-[#635BFF] transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about blocks, curfew, salon, meals, fees..."
              className="flex-1 bg-transparent text-xs text-white px-3 py-1.5 focus:outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#4F46E5] hover:from-[#5248E5] hover:to-[#4338CA] text-white flex items-center justify-center disabled:opacity-40 transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
