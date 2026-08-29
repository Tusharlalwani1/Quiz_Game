import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, FastForward, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-6 bg-[#F8F9FA]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-2xl bg-white border border-[#DEE2E6] rounded-[6px] p-6 sm:p-8"
      >
        {/* Top welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DEE2E6] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="/apex-icon.png" 
              alt="APEX IT SOLUTION" 
              className="h-8 w-auto object-contain shrink-0" 
            />
            <div>
              <div className="flex items-center gap-1.5 text-[#1E3A5F] text-xs font-semibold uppercase tracking-wider mb-0.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Candidate Verified</span>
              </div>
              <h1 className="font-sans text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Assessment Rules: <span className="text-[#1E3A5F]">{participantName}</span>
              </h1>
            </div>
          </div>
          <div className="px-3 py-1 rounded-[6px] bg-[#EBF2FA] border border-[#B8D1E5] text-[#1E3A5F] text-xs font-semibold shrink-0">
            15 Questions • 15 Seconds Per Item
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-[6px] bg-white border border-[#DEE2E6] flex items-start gap-3">
            <div className="p-2 rounded-[6px] bg-[#EBF2FA] text-[#1E3A5F] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1A1A1A] mb-1">15-Second Item Timer</h3>
              <p className="text-xs text-[#6C757D] leading-relaxed">
                Each question has a strict 15-second timer. The exam auto-advances when time expires.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-white border border-[#DEE2E6] flex items-start gap-3">
            <div className="p-2 rounded-[6px] bg-[#EBF2FA] text-[#1E3A5F] shrink-0">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1A1A1A] mb-1">Sequential Progression</h3>
              <p className="text-xs text-[#6C757D] leading-relaxed">
                Navigating back to previous questions is locked. Answers are registered immediately upon selection.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-white border border-[#DEE2E6] flex items-start gap-3">
            <div className="p-2 rounded-[6px] bg-[#EBF2FA] text-[#1E3A5F] shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1A1A1A] mb-1">Session Synchronization</h3>
              <p className="text-xs text-[#6C757D] leading-relaxed">
                Progress is stored on the server. If your page reloads, your test will resume on the current question.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-white border border-[#DEE2E6] flex items-start gap-3">
            <div className="p-2 rounded-[6px] bg-[#EBF2FA] text-[#1E3A5F] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1A1A1A] mb-1">Proctored Audit</h3>
              <p className="text-xs text-[#6C757D] leading-relaxed">
                Window focus and tab switches are logged for administrative compliance review.
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DEE2E6]">
          <p className="text-xs text-[#6C757D] text-center sm:text-left">
            Timer commences upon starting the examination.
          </p>
          <button
            onClick={handleStartQuiz}
            className="w-full sm:w-auto py-2.5 px-5 rounded-[6px] text-xs font-semibold text-white navy-button flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Begin Examination</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
