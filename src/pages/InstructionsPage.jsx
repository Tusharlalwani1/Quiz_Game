import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, FastForward, ArrowRight, CheckCircle2, UserCheck, Sparkles, Image as ImageIcon, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export default function InstructionsPage() {
  const { participantName, sessionId } = useAuth();
  const { playSelect } = useSound();
  const navigate = useNavigate();

  if (!sessionId) {
    navigate('/');
    return null;
  }

  const handleStartQuiz = () => {
    playSelect();
    navigate('/quiz');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl glass-card-glow rounded-3xl p-7 sm:p-9 relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-cyan-300 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-black uppercase tracking-wider mb-0.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Candidate Authenticated</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Arena Rules: <span className="gradient-text-fun">{participantName}</span>
              </h1>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black shrink-0 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" /> 20s Per Question
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-3.5 hover:border-cyan-500/40 transition">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white mb-1">20-Second Timer</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Each question features a strict 20s countdown. The test auto-advances when time expires!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-3.5 hover:border-purple-500/40 transition">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white mb-1">Sequential Progress</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Navigating back is locked. Your answer choice registers immediately upon click.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-3.5 hover:border-emerald-500/40 transition">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white mb-1">Visual Diagrams & Images</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Questions may include image visuals. Click any image thumbnail to expand it to full size!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-3.5 hover:border-rose-500/40 transition">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white mb-1">Proctored Anti-Cheat</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Tab switches and window focus loss are recorded and logged for administrator audit.
              </p>
            </div>
          </div>
        </div>

        {/* Start Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 font-medium text-center sm:text-left">
            Countdown starts immediately upon clicking begin.
          </p>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartQuiz}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-600 hover:to-pink-600 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-cyan-500/20 shrink-0"
          >
            <span>Begin Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
