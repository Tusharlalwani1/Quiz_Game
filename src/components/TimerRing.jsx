import React, { useEffect } from 'react';
import { useSound } from '../context/SoundContext';
import { Clock } from 'lucide-react';

export default function TimerRing({ secondsLeft, maxSeconds = 15 }) {
  const { playWarning } = useSound();

  useEffect(() => {
    if (secondsLeft <= 4 && secondsLeft > 0) {
      playWarning();
    }
  }, [secondsLeft]);

  // Clean testing platform timer colors
  let timerStyle = "bg-[#EBF2FA] border-[#1E3A5F] text-[#1E3A5F]";
  if (secondsLeft <= 4) {
    timerStyle = "bg-[#FDF2F2] border-[#DC2626] text-[#DC2626]";
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border ${timerStyle} transition-colors font-sans`}>
      <Clock className="w-4 h-4 shrink-0" />
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-base font-sans tracking-tight">
          {secondsLeft}
        </span>
        <span className="text-[10px] uppercase font-semibold text-[#6C757D]">
          sec
        </span>
      </div>
    </div>
  );
}
