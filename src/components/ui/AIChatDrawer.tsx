'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, MapPin } from 'lucide-react';
import { CampusLocation } from '@/types/campus';

interface Message {
  role: 'assistant' | 'user';
  text: string;
  actionLocationId?: string;
}

interface AIChatDrawerProps {
  onClose: () => void;
  onFocusLocation: (locId: string) => void;
  locations: CampusLocation[];
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  onClose,
  onFocusLocation,
  locations,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hey! I'm your LPU Campus AI Buddy. Need directions, block details, or vendor info? Ask away!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'Where is Saarsh Unisex Salon?',
    'What are the Central Library hours?',
    'Where is Academic Block 34?',
    'Where can I get medicine or emergency help?',
  ];

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
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I don't have verified information about that yet.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-800 text-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center text-white shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">LPU AI Campus Buddy</h3>
              <p className="text-[11px] text-cyan-300 font-medium">Verified Campus Knowledge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 px-3 py-1 rounded-full whitespace-nowrap border border-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#635BFF]/20 flex items-center justify-center text-[#635BFF] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-cyan-300" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-[82%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#635BFF] text-white rounded-br-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>
                {m.actionLocationId && (
                  <button
                    onClick={() => {
                      onFocusLocation(m.actionLocationId!);
                      onClose();
                    }}
                    className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg hover:bg-cyan-900 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    Show on 3D Map
                  </button>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Checking campus directory…</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-[#1E293B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about blocks, timings, services..."
              className="flex-1 bg-transparent text-xs text-white px-3 py-1.5 focus:outline-none placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-[#635BFF] hover:bg-[#5248E5] text-white flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
