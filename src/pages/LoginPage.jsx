import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, UserCheck, Key, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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
        setError(data.error || 'Authentication failed. Invalid username or password.');
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
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-6 bg-[#F8F9FA]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white border border-[#DEE2E6] rounded-[6px] p-6 sm:p-8"
      >
        {/* Header Section */}
        <div className="mb-6 pb-5 border-b border-[#DEE2E6]">
          <div className="flex items-center justify-center sm:justify-start mb-4">
            <img 
              src="/apex-logo.png" 
              alt="APEX IT SOLUTION" 
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
          <h1 className="font-sans text-xl font-bold text-[#1A1A1A]">
            Candidate Login
          </h1>
          <p className="text-[#6C757D] text-xs mt-1">
            Please enter your candidate details and authorization credentials to begin.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-[6px] bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Candidate Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#495057] mb-1">
              Candidate Full Name <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] placeholder-[#6C757D] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] font-sans"
                required
              />
            </div>
          </div>

          {/* Access Username */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#495057] mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter assigned username"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] placeholder-[#6C757D] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] font-sans"
                required
              />
            </div>
          </div>

          {/* Access Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#495057] mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter assigned password"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] placeholder-[#6C757D] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] font-sans"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full py-2.5 px-4 rounded-[6px] text-xs font-semibold text-white navy-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all mt-4"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
