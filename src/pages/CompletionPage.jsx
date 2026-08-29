import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Home } from 'lucide-react';
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

    const duration = 1.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 45,
        origin: { x: 0 },
        colors: ['#1E3A5F', '#495057', '#6C757D']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 45,
        origin: { x: 1 },
        colors: ['#1E3A5F', '#495057', '#6C757D']
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
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-6 bg-[#F8F9FA]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg bg-white border border-[#DEE2E6] rounded-[6px] p-6 sm:p-8 text-center"
      >
        {/* Apex Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src="/apex-logo.png" 
            alt="APEX IT SOLUTION" 
            className="h-10 w-auto object-contain" 
          />
        </div>

        {/* Checkmark Badge */}
        <div className="w-10 h-10 rounded-[6px] bg-[#EBF2FA] border border-[#B8D1E5] text-[#1E3A5F] flex items-center justify-center mx-auto mb-4">
          <Check className="w-5 h-5 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Assessment Submitted
        </h1>
        <p className="text-[#6C757D] text-xs leading-relaxed mb-6">
          Thank you, <strong className="text-[#1A1A1A]">{participantName || 'Candidate'}</strong>. Your examination answers have been securely transmitted to the grading server.
        </p>

        {/* Confidentiality Notice */}
        <div className="p-4 rounded-[6px] bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C757D] text-xs leading-relaxed mb-6 flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-5 h-5 text-[#1E3A5F] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#1A1A1A]">Official Notice:</strong> Detailed score evaluations are confidential and accessible solely through the administration dashboard.
          </span>
        </div>

        <button
          onClick={handleReturnHome}
          className="w-full py-2.5 px-4 rounded-[6px] text-xs font-semibold text-white navy-button flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Examination Homepage</span>
        </button>
      </motion.div>
    </div>
  );
}
