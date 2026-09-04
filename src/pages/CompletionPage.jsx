import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Home, Trophy, Sparkles, RefreshCw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useNavigate } from 'react-router-dom';

export default function CompletionPage() {
  const { participantName, resetQuizSession } = useAuth();
  const { playFinish } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    playFinish();

    // Trigger celebration confetti
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#fbbf24']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleReturnHome = () => {
    resetQuizSession();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg glass-card-glow rounded-3xl p-7 sm:p-9 text-center relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400" />

        {/* Celebration Trophy Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/40">
          <Trophy className="w-10 h-10 stroke-[2.2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Challenge Completed!
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Awesome Job, <span className="gradient-text-gold">{participantName || 'Candidate'}</span>!
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
          Your answers have been securely logged and uploaded to the administrator audit server.
        </p>

        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 text-slate-300 text-xs leading-relaxed mb-7 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white font-bold">Official Session Recorded:</strong> Test attempts and proctoring audit details are available in the administrator dashboard.
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReturnHome}
          className="w-full py-3.5 px-6 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-600 hover:to-pink-600 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-cyan-500/30"
        >
          <Home className="w-4 h-4" />
          <span>Return to Quiz Home</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
