import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, Key, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAdmin } = useAuth();
  const { playClick, playSelect } = useSound();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playClick();

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError(data.error || 'Invalid administrator credentials.');
        setLoading(false);
        return;
      }

      playSelect();
      loginAdmin(data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Connection error. Server not responding.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card-glow rounded-3xl p-7 sm:p-9 relative overflow-hidden"
      >
        {/* Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

        <div className="mb-7 pb-5 border-b border-white/10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-300 shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> RESTRICTED ACCESS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin <span className="gradient-text-fun">Dashboard Login</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
            Authorized management credentials for exam control and question bank CRUD.
          </p>
        </div>

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
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 font-medium transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4 text-fuchsia-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secret key"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/40 font-medium transition-all"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: !loading ? 1.02 : 1, y: !loading ? -1 : 0 }}
            whileTap={{ scale: !loading ? 0.98 : 1 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all shadow-xl shadow-purple-600/30 mt-6"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In Administrator</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
