import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import AntiCheatGuard from '../components/AntiCheatGuard';
import TimerRing from '../components/TimerRing';

export default function QuizPage() {
  const { sessionId, participantName, completeQuizSession } = useAuth();
  const { playSelect } = useSound();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!sessionId) return;

    async function loadQuizData() {
      try {
        setLoading(true);
        const qRes = await fetch('/api/quiz/questions');
        const qData = await qRes.json();

        if (!qRes.ok || !qData.questions) {
          throw new Error('Failed to load examination questions.');
        }

        const sRes = await fetch(`/api/quiz/session/${sessionId}`);
        const sData = await sRes.json();

        const loadedQuestions = qData.questions;
        setQuestions(loadedQuestions);

        if (sData && sData.answers) {
          const answeredQuestionIds = new Set(sData.answers.map(a => a.question_id));
          const nextIndex = loadedQuestions.findIndex(q => !answeredQuestionIds.has(q.id));
          
          if (nextIndex === -1 && loadedQuestions.length > 0) {
            await completeQuizSession();
            navigate('/complete');
            return;
          }
          if (nextIndex > 0) {
            setCurrentIndex(nextIndex);
          }
        }

        setLoading(false);
        questionStartTimeRef.current = Date.now();
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error loading examination.');
        setLoading(false);
      }
    }

    loadQuizData();
  }, [sessionId]);

  useEffect(() => {
    if (loading || questions.length === 0 || isSubmitting) return;

    setSecondsLeft(15);
    questionStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, loading, isSubmitting, questions.length]);

  const handleTimeExpired = () => {
    if (isSubmitting) return;
    submitAnswer(null, 15);
  };

  const handleOptionSelect = (optionKey) => {
    if (isSubmitting || selectedOption !== null) return;
    
    playSelect();
    setSelectedOption(optionKey);
    
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.min(15, Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000)));

    setTimeout(() => {
      submitAnswer(optionKey, timeTaken);
    }, 450);
  };

  const submitAnswer = async (option, timeTaken) => {
    setIsSubmitting(true);
    const currentQ = questions[currentIndex];

    try {
      await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQ.id,
          selectedOption: option,
          timeTakenSeconds: timeTaken
        })
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitting(false);
    } else {
      try {
        await fetch('/api/quiz/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (e) {}

      completeQuizSession();
      navigate('/complete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center p-6 bg-[#F8F9FA] text-center">
        <div className="w-8 h-8 border-2 border-[#DEE2E6] border-t-[#1E3A5F] rounded-full animate-spin mb-3" />
        <p className="text-[#6C757D] text-xs font-medium">Loading examination paper...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center p-6 bg-[#F8F9FA] text-center">
        <div className="p-4 rounded-[6px] bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] max-w-md">
          <AlertCircle className="w-5 h-5 text-[#DC2626] mx-auto mb-1.5" />
          <h3 className="font-bold text-xs mb-1">Assessment Error</h3>
          <p className="text-xs text-[#6C757D]">{error || 'No examination questions available.'}</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <AntiCheatGuard isActive={true}>
      <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 sm:p-8 max-w-3xl mx-auto bg-[#F8F9FA]">
        {/* Top Header & Progress */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                Examination Progress
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Question <span className="text-[#1E3A5F]">{currentIndex + 1}</span> of {questions.length}
              </h2>
            </div>

            <TimerRing secondsLeft={secondsLeft} maxSeconds={15} />
          </div>

          {/* Progress Bar Fill: Solid Navy */}
          <div className="w-full bg-[#DEE2E6] h-2 rounded-[4px] overflow-hidden">
            <motion.div
              className="h-full bg-[#1E3A5F] rounded-[4px]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Question & Options Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col justify-center my-2"
          >
            {/* Question Card */}
            <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-6 mb-4 shadow-xs">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-[4px] bg-[#EBF2FA] border border-[#B8D1E5] text-[#1E3A5F] font-bold text-xs shrink-0 mt-0.5">
                  {currentIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-[#1A1A1A] leading-snug">
                  {currentQ.text}
                </h3>
              </div>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map((key) => {
                const optionText = currentQ.options[key];
                const isSelected = selectedOption === key;

                let cardStyle = "bg-white border-[#DEE2E6] text-[#1A1A1A] hover:border-[#1E3A5F]";
                if (isSelected) {
                  cardStyle = "bg-[#EBF2FA] border-[#1E3A5F] text-[#1A1A1A] ring-1 ring-[#1E3A5F]";
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleOptionSelect(key)}
                    disabled={isSubmitting}
                    className={`p-3.5 rounded-[6px] border text-left transition-colors duration-150 flex items-start gap-3 cursor-pointer group ${cardStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-[4px] font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C757D] group-hover:border-[#1E3A5F] group-hover:text-[#1E3A5F]'
                      }`}
                    >
                      {key}
                    </span>
                    <span className="text-xs font-medium leading-relaxed pt-0.5 text-[#1A1A1A]">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs text-[#6C757D]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span>Responses stored automatically</span>
          </div>
          <span>Candidate: <strong className="text-[#1A1A1A] font-semibold">{participantName}</strong></span>
        </div>
      </div>
    </AntiCheatGuard>
  );
}
