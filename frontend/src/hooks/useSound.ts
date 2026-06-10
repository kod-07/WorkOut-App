import { useCallback } from 'react';

export const useSound = () => {
  const playTimerDoneSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const playBeep = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration);
      };
      
      playBeep(now, 880, 0.15);
      playBeep(now + 0.2, 880, 0.25);
    } catch (err) {
      console.warn('Audio Web API failed or was blocked:', err);
    }
  }, []);

  return { playTimerDoneSound };
};
