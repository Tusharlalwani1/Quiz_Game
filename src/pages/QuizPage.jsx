import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock, Eye, X, HelpCircle, ShieldCheck, Zap, Sparkles } from 'lucide-react';
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
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

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
          const answeredQuestionIds = new Set(sData.answers.map((a) => a.question_id));
          const nextIndex = loadedQuestions.findIndex((q) => !answeredQuestionIds.has(q.id));

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

    setSecondsLeft(20);
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
    submitAnswer(null, 20);
  };

  const handleOptionSelect = (optionKey) => {
    if (isSubmitting || selectedOption !== null) return;

    playSelect();
    setSelectedOption(optionKey);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.min(20, Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000)));

    setTimeout(() => {
      submitAnswer(optionKey, timeTaken);
    }, 400);
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
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-cyan-400 rounded-full animate-spin mb-4 shadow-lg" />
        <p className="text-cyan-300 text-xs font-black tracking-widest uppercase">Initializing Live Question Arena...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="p-6 rounded-3xl glass-card border border-rose-500/40 text-rose-300 max-w-md shadow-2xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="font-black text-base text-white mb-1">Assessment Warning</h3>
          <p className="text-xs text-slate-300 font-medium">{error || 'No quiz questions available.'}</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const OPTION_STYLES = {
    A: {
      badge: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30',
      normal: 'bg-slate-900/80 border-white/10 hover:border-cyan-400 hover:bg-cyan-950/40 text-slate-200',
      selected: 'bg-gradient-to-r from-cyan-900/90 to-blue-900/90 border-cyan-400 text-white ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20'
    },
    B: {
      badge: 'bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white shadow-fuchsia-500/30',
      normal: 'bg-slate-900/80 border-white/10 hover:border-fuchsia-400 hover:bg-fuchsia-950/40 text-slate-200',
      selected: 'bg-gradient-to-r from-purple-900/90 to-fuchsia-900/90 border-fuchsia-400 text-white ring-2 ring-fuchsia-400 shadow-xl shadow-fuchsia-500/20'
    },
    C: {
      badge: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
      normal: 'bg-slate-900/80 border-white/10 hover:border-emerald-400 hover:bg-emerald-950/40 text-slate-200',
      selected: 'bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-emerald-400 text-white ring-2 ring-emerald-400 shadow-xl shadow-emerald-500/20'
    },
    D: {
      badge: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-amber-500/30',
      normal: 'bg-slate-900/80 border-white/10 hover:border-amber-400 hover:bg-amber-950/40 text-slate-200',
      selected: 'bg-gradient-to-r from-amber-900/90 to-orange-900/90 border-amber-400 text-white ring-2 ring-amber-400 shadow-xl shadow-amber-500/20'
    }
  };

  return (
    <AntiCheatGuard isActive={true}>
      <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 sm:p-8 max-w-3xl mx-auto font-sans">
        {/* Top Header & Progress */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" /> LIVE QUIZ ARENA
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Question</span>
                <span className="px-3 py-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 font-extrabold text-base sm:text-xl">
                  {currentIndex + 1}
                </span>
                <span className="text-slate-400 font-medium text-sm sm:text-base">of {questions.length}</span>
              </h2>
            </div>

            <TimerRing secondsLeft={secondsLeft} maxSeconds={20} />
          </div>

          {/* Dynamic Candy Progress Bar */}
          <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 via-fuchsia-500 to-pink-500 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question & Options Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -14 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center my-2"
          >
            {/* Question Card */}
            <div className="glass-card-glow rounded-3xl p-6 sm:p-8 mb-5 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-cyan-500/30">
                  {currentIndex + 1}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-tight">
                  {currentQ.text}
                </h3>
              </div>

              {/* Question Visual Image Attachment */}
              {currentQ.image_url && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/70 flex items-center justify-center p-2 relative group shadow-xl">
                  <img
                    src={currentQ.image_url}
                    alt="Question Visual"
                    className="max-h-64 sm:max-h-80 w-auto object-contain rounded-xl cursor-pointer transition-transform group-hover:scale-[1.02]"
                    onClick={() => setZoomedImage(currentQ.image_url)}
                  />
                  <button
                    onClick={() => setZoomedImage(currentQ.image_url)}
                    className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/20 text-cyan-300 text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md opacity-90 group-hover:opacity-100 transition cursor-pointer shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Expand Diagram</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4 MCQ Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {['A', 'B', 'C', 'D'].map((key) => {
                const optionText = currentQ.options[key];
                const isSelected = selectedOption === key;
                const optStyle = OPTION_STYLES[key] || OPTION_STYLES.A;

                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    onClick={() => handleOptionSelect(key)}
                    disabled={isSubmitting}
                    className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 cursor-pointer group shadow-lg ${
                      isSelected ? optStyle.selected : optStyle.normal
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-md ${optStyle.badge}`}
                    >
                      {key}
                    </span>
                    <span className="text-xs sm:text-sm font-bold leading-relaxed pt-1 flex-1">
                      {optionText}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Candidate Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Answers saved automatically</span>
          </div>
          <div>
            Candidate: <strong className="text-white font-extrabold">{participantName}</strong>
          </div>
        </div>

        {/* Image Zoom Lightbox */}
        <AnimatePresence>
          {zoomedImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md cursor-pointer"
              onClick={() => setZoomedImage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-white/20 p-3 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setZoomedImage(null)}
                  className="absolute top-5 right-5 p-2.5 rounded-2xl bg-black/70 text-white hover:bg-rose-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <img src={zoomedImage} alt="Zoomed Visual" className="max-h-[80vh] w-auto object-contain rounded-2xl" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AntiCheatGuard>
  );
}
