import React, { useEffect } from 'react';
import { useSound } from '../context/SoundContext';
import { Clock } from 'lucide-react';

export default function TimerRing({ secondsLeft, maxSeconds = 20 }) {
  const { playWarning } = useSound();

  useEffect(() => {
    if (secondsLeft <= 4 && secondsLeft > 0) {
      playWarning();
    }
  }, [secondsLeft]);

  // Glowing timer colors
  let timerStyle = "bg-slate-900/80 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/20";
  if (secondsLeft <= 4) {
    timerStyle = "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-lg shadow-rose-500/40";
  }

  return (
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${timerStyle} transition-all font-sans`}>
      <Clock className={`w-4 h-4 shrink-0 ${secondsLeft <= 4 ? 'text-rose-400' : 'text-cyan-400'}`} />
      <div className="flex items-baseline gap-1">
        <span className="font-black text-lg tracking-tight">
          {secondsLeft}
        </span>
        <span className="text-[10px] uppercase font-bold opacity-75">
          sec
        </span>
      </div>
    </div>
  );
}
