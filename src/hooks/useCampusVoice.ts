'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseCampusVoiceOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useCampusVoice(options: UseCampusVoiceOptions = {}) {
  const { rate = 1.05, pitch = 1.0, volume = 1.0 } = options;
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');
  const lastSpokenTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, priority = false) => {
    if (!text || isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const now = Date.now();
    if (!priority && now - lastSpokenTimeRef.current < 2500) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      lastSpokenTimeRef.current = now;
      setLastAnnouncement(text);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [isMuted, rate, pitch, volume]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    speak,
    stop,
    isMuted,
    toggleMute,
    isSpeaking,
    supported,
    lastAnnouncement,
  };
}
