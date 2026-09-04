import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, UserCheck, Key, ArrowRight, Sparkles, AlertCircle, Gamepad2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { startQuizSession } = useAuth();
  const { playClick, playSelect } = useSound();
  const navigate = useNavigate();

  const isFormValid = username.trim() !== '' && password.trim() !== '' && participantName.trim().length >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setError('');
    setLoading(true);
    playClick();

    try {
      const response = await fetch('/api/quiz/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          participantName: participantName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Authentication failed. Invalid credentials.');
        setLoading(false);
        return;
      }

      playSelect();
      startQuizSession({
        sessionId: data.sessionId,
        attemptId: data.attemptId,
        participantName: data.participantName
      });

      navigate('/instructions');
    } catch (err) {
      console.error(err);
      setError('Connection error. Server is unreachable.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-card-glow rounded-3xl p-7 sm:p-9 relative overflow-hidden"
      >
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />

        {/* Header Section */}
        <div className="mb-7 pb-5 border-b border-white/10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-cyan-300 shadow-md">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-400/30 text-cyan-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> TIMED ASSESSMENT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Candidate <span className="gradient-text-fun">Arena</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
            Enter your display name and login key to begin your live test.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-2.5 shadow-lg"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Candidate Name */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Display Name <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g. Alex Dev"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 font-medium transition-all"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 font-medium transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4 text-fuchsia-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/40 font-medium transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isFormValid && !loading ? 1.02 : 1, y: isFormValid && !loading ? -1 : 0 }}
            whileTap={{ scale: isFormValid && !loading ? 0.98 : 1 }}
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full py-3.5 px-5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xl shadow-indigo-600/30 mt-6"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Launch Quiz Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
