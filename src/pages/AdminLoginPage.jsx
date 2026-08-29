import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-6 bg-[#F8F9FA]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white border border-[#DEE2E6] rounded-[6px] p-6 sm:p-8"
      >
        <div className="mb-6 pb-5 border-b border-[#DEE2E6]">
          <div className="flex items-center justify-center sm:justify-start mb-4">
            <img 
              src="/apex-logo.png" 
              alt="APEX IT SOLUTION" 
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            Administrator Login
          </h1>
          <p className="text-[#6C757D] text-xs mt-1">
            Restricted portal access for exam administrators only.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-[6px] bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#495057] mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="w-full px-3 py-2 bg-white border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] placeholder-[#6C757D] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#495057] mb-1">
              Secret Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secret key"
              className="w-full px-3 py-2 bg-white border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] placeholder-[#6C757D] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] font-sans"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-[6px] text-xs font-semibold text-white navy-button flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In Administrator</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
