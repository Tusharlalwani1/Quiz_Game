import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trophy,
  Clock,
  ShieldAlert,
  Search,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  BarChart2,
  Plus,
  Edit3,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Check,
  X,
  Eye,
  FileQuestion,
  Sparkles,
  Layers,
  CheckCircle2,
  Flame,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSound } from "../context/SoundContext";
import { exportAttemptsToCSV } from "../utils/csvExport";

// Sample visual presets for quick testing
const SAMPLE_PRESET_IMAGES = [
  {
    name: "Data Flow Diagram",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Code Snippet Syntax",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Logic Circuit Board",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
];

export default function AdminDashboardPage() {
  const { adminToken, isAdminLoggedIn, logoutAdmin } = useAuth();
  const { playClick, playSelect } = useSound();
  const navigate = useNavigate();

  // Active Tab: 'attempts' or 'questions'
  const [activeTab, setActiveTab] = useState("attempts");

  // Attempts State
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [attemptsError, setAttemptsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState("");
  const [qSearchTerm, setQSearchTerm] = useState("");

  // Question Form Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    question_order: 1,
    image_url: "",
  });
  const [formError, setFormError] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [imageMode, setImageMode] = useState("file"); // 'file' | 'url' | 'preset'
  const [previewZoomImage, setPreviewZoomImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/admin");
      return;
    }
    fetchAttempts();
    fetchQuestions();
  }, [isAdminLoggedIn]);

  // Fetch Attempts
  const fetchAttempts = async () => {
    try {
      setLoadingAttempts(true);
      setAttemptsError("");
      const res = await fetch("/api/admin/attempts", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logoutAdmin();
          navigate("/admin");
          return;
        }
        throw new Error(data.error || "Failed to fetch assessment records.");
      }
      setAttempts(data.attempts || []);
      setLoadingAttempts(false);
    } catch (err) {
      console.error(err);
      setAttemptsError(err.message || "Error loading candidate attempts.");
      setLoadingAttempts(false);
    }
  };

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setQuestionsError("");
      const res = await fetch("/api/admin/questions", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logoutAdmin();
          navigate("/admin");
          return;
        }
        throw new Error(data.error || "Failed to fetch question bank.");
      }
      setQuestions(data.questions || []);
      setLoadingQuestions(false);
    } catch (err) {
      console.error(err);
      setQuestionsError(err.message || "Error loading question list.");
      setLoadingQuestions(false);
    }
  };

  // Delete Attempt
  const handleDeleteAttempt = async (id) => {
    if (
      !window.confirm("Are you sure you want to remove this candidate record?")
    )
      return;
    playClick();
    try {
      const res = await fetch(`/api/admin/attempts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setAttempts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear All Attempts
  const handleClearAllAttempts = async () => {
    playClick();
    try {
      const res = await fetch("/api/admin/attempts-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setAttempts([]);
        setShowClearModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    playClick();
    const nextOrder = questions.length + 1;
    setEditingQuestion(null);
    setFormData({
      text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      question_order: nextOrder,
      image_url: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (q) => {
    playClick();
    setEditingQuestion(q);
    setFormData({
      text: q.text || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_option: (q.correct_option || "A").toUpperCase(),
      question_order: q.question_order || 1,
      image_url: q.image_url || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  // Handle Image File Upload (Base64 conversion)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        "Image size exceeds 5MB limit. Please choose a smaller image.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({
        ...prev,
        image_url: uploadEvent.target.result,
      }));
      setFormError("");
    };
    reader.onerror = () => {
      setFormError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // Save Question (Create or Edit)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (
      !formData.text.trim() ||
      !formData.option_a.trim() ||
      !formData.option_b.trim() ||
      !formData.option_c.trim() ||
      !formData.option_d.trim()
    ) {
      setFormError("Question text and all 4 options are required.");
      return;
    }

    setIsSavingQuestion(true);
    setFormError("");
    playClick();

    const isEdit = Boolean(editingQuestion);
    const endpoint = isEdit
      ? `/api/admin/questions/${editingQuestion.id}`
      : "/api/admin/questions";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save question.");
      }

      playSelect();
      await fetchQuestions();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Error saving question.");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this question? Existing test logs for this question will also be updated.",
      )
    )
      return;
    playClick();

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        await fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete question.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI Calculations
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(
    (a) => a.status === "completed",
  ).length;
  const totalQuestionCount = questions.length;
  const avgScore =
    completedAttempts > 0
      ? (
          attempts
            .filter((a) => a.status === "completed")
            .reduce((acc, a) => acc + a.total_score, 0) / completedAttempts
        ).toFixed(1)
      : "0";
  const avgTimeSeconds =
    completedAttempts > 0
      ? Math.round(
          attempts
            .filter((a) => a.status === "completed")
            .reduce((acc, a) => acc + (a.durationSeconds || 0), 0) /
            completedAttempts,
        )
      : 0;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Filtered Attempts
  const filteredAttempts = attempts
    .filter((a) =>
      a.participant_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.started_at) - new Date(a.started_at);
      if (sortBy === "score_desc") return b.total_score - a.total_score;
      if (sortBy === "score_asc") return a.total_score - b.total_score;
      if (sortBy === "time_desc")
        return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      return 0;
    });

  // Filtered Questions
  const filteredQuestions = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(qSearchTerm.toLowerCase()) ||
      q.option_a.toLowerCase().includes(qSearchTerm.toLowerCase()) ||
      q.option_b.toLowerCase().includes(qSearchTerm.toLowerCase()) ||
      q.option_c.toLowerCase().includes(qSearchTerm.toLowerCase()) ||
      q.option_d.toLowerCase().includes(qSearchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-[calc(100vh-65px)] p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="glass-card-glow rounded-3xl p-5 sm:p-7 mb-7 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" /> ADMIN CONTROL CENTER
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Apex Quiz{" "}
              <span className="gradient-text-fun">Management Hub</span>
            </h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              playClick();
              fetchAttempts();
              fetchQuestions();
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-cyan-400 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Refresh</span>
          </button>

          {activeTab === "attempts" && (
            <>
              <button
                onClick={() => {
                  playClick();
                  exportAttemptsToCSV(attempts);
                }}
                disabled={attempts.length === 0}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              {attempts.length > 0 && (
                <button
                  onClick={() => {
                    playClick();
                    setShowClearModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </>
          )}

          {activeTab === "questions" && (
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black flex items-center gap-2 transition shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 mb-7 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            playClick();
            setActiveTab("attempts");
          }}
          className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === "attempts"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/60 text-slate-300 hover:bg-slate-900 border border-white/10"
          }`}
        >
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span>Candidate Audits ({totalAttempts})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveTab("questions");
          }}
          className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === "questions"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/60 text-slate-300 hover:bg-slate-900 border border-white/10"
          }`}
        >
          <FileQuestion className="w-4 h-4 text-purple-400" />
          <span>Question Bank Manager ({totalQuestionCount})</span>
        </button>
      </div>

      {/* TAB 1: CANDIDATE ATTEMPTS */}
      {activeTab === "attempts" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Total Candidates
                </p>
                <h3 className="text-2xl font-black text-white">
                  {totalAttempts}
                </h3>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Completed Tests
                </p>
                <h3 className="text-2xl font-black text-white">
                  {completedAttempts}
                </h3>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Average Score
                </p>
                <h3 className="text-2xl font-black text-white">
                  {avgScore}{" "}
                  <span className="text-xs font-medium text-slate-400">
                    / {totalQuestionCount}
                  </span>
                </h3>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Avg Duration
                </p>
                <h3 className="text-2xl font-black text-white">
                  {formatDuration(avgTimeSeconds)}
                </h3>
              </div>
            </div>
          </div>

          {/* Search & Sort Bar */}
          <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate by name..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold shrink-0">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-cyan-400"
              >
                <option value="newest">Most Recent</option>
                <option value="score_desc">Highest Score</option>
                <option value="score_asc">Lowest Score</option>
                <option value="time_desc">Longest Duration</option>
              </select>
            </div>
          </div>

          {/* Candidate Table */}
          {loadingAttempts ? (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
              <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">
                Loading candidate attempt records...
              </p>
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-white mb-1">
                No Attempt Records Found
              </h3>
              <p className="text-xs text-slate-400">
                {searchTerm
                  ? "No candidate names match your query."
                  : "No assessment attempts have been completed yet."}
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="p-4 pl-6">Candidate</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Submitted At</th>
                      <th className="p-4 text-center">Proctor Audit</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-medium">
                    {filteredAttempts.map((attempt) => {
                      const isExpanded = expandedAttemptId === attempt.id;
                      const score = attempt.total_score;
                      let scoreBadge =
                        "bg-slate-800 text-slate-300 border-slate-700";
                      if (score >= totalQuestionCount * 0.8)
                        scoreBadge =
                          "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                      else if (score >= totalQuestionCount * 0.5)
                        scoreBadge =
                          "bg-amber-500/20 text-amber-300 border-amber-500/40";

                      return (
                        <React.Fragment key={attempt.id}>
                          <tr className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-4 pl-6 font-bold text-white">
                              {attempt.participant_name}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-xl border text-xs font-extrabold ${scoreBadge}`}
                              >
                                {score} / {totalQuestionCount}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 font-mono">
                              {formatDuration(attempt.durationSeconds || 0)}
                            </td>
                            <td className="p-4 text-slate-400">
                              {new Date(attempt.started_at).toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              {attempt.tab_switch_count > 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  {attempt.tab_switch_count} Switch
                                  {attempt.tab_switch_count > 1 ? "es" : ""}
                                </span>
                              ) : (
                                <span className="text-emerald-400 text-xs font-bold inline-flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Clean
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                  attempt.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                }`}
                              >
                                {attempt.status}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right space-x-2">
                              <button
                                onClick={() =>
                                  setExpandedAttemptId(
                                    isExpanded ? null : attempt.id,
                                  )
                                }
                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-slate-200 hover:border-cyan-400 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>
                                  {isExpanded ? "Hide Log" : "Review Log"}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteAttempt(attempt.id)}
                                className="p-2 rounded-xl bg-slate-900 border border-white/15 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition inline-flex items-center cursor-pointer"
                                title="Delete candidate record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>

                          {/* Expandable Breakdown */}
                          {isExpanded && (
                            <tr className="bg-slate-950/90 border-b border-white/10">
                              <td colSpan="7" className="p-6">
                                <h4 className="font-extrabold text-xs text-white mb-4 flex items-center gap-2">
                                  <span>
                                    Question Log for {attempt.participant_name}
                                  </span>
                                </h4>
                                {attempt.answers &&
                                attempt.answers.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {attempt.answers.map((ans, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                                          ans.isCorrect
                                            ? "bg-slate-900/90 border-emerald-500/40"
                                            : "bg-slate-900/90 border-rose-500/40"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-3 mb-2.5">
                                          <span className="font-bold text-white">
                                            Q{ans.questionOrder}.{" "}
                                            {ans.questionText}
                                          </span>
                                          {ans.isCorrect ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                          )}
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-white/10">
                                          <span>
                                            Selected:{" "}
                                            <strong
                                              className={
                                                ans.isCorrect
                                                  ? "text-emerald-400 font-bold"
                                                  : "text-rose-400 font-bold"
                                              }
                                            >
                                              {ans.selectedOption ||
                                                "Unanswered"}
                                            </strong>
                                          </span>
                                          <span>
                                            Correct:{" "}
                                            <strong className="text-emerald-400 font-bold">
                                              {ans.correctOption}
                                            </strong>
                                          </span>
                                          <span className="font-mono text-slate-400">
                                            {ans.timeTakenSeconds}s
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500 italic">
                                    No individual question details logged.
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 2: QUESTION MANAGER (CRUD + IMAGES) */}
      {activeTab === "questions" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Question Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Total Questions
                </p>
                <h3 className="text-2xl font-black text-white">
                  {totalQuestionCount}
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
                <FileQuestion className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  With Images Attached
                </p>
                <h3 className="text-2xl font-black text-white">
                  {questions.filter((q) => Boolean(q.image_url)).length}
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ImageIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Format
                </p>
                <h3 className="text-2xl font-black text-white">
                  4 Options MCQ
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Question Search */}
          <div className="glass-card rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={qSearchTerm}
                onChange={(e) => setQSearchTerm(e.target.value)}
                placeholder="Search question text or options..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>
            <span className="text-xs text-slate-400 font-bold shrink-0 hidden sm:inline">
              Showing {filteredQuestions.length} of {totalQuestionCount}{" "}
              questions
            </span>
          </div>

          {/* Question List */}
          {loadingQuestions ? (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
              <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">
                Loading question bank...
              </p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-white mb-1">
                No Questions Found
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                {qSearchTerm
                  ? "No questions match your search."
                  : "Your question bank is currently empty."}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Question</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="glass-card rounded-3xl p-6 relative hover:border-indigo-500/40 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                        {q.question_order || idx + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-white leading-snug">
                          {q.text}
                        </h3>
                        {q.image_url && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Visual Diagram Attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/15 hover:border-cyan-400 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Display Thumbnail if attached */}
                  {q.image_url && (
                    <div className="mb-4 relative rounded-2xl border border-white/15 bg-slate-950/80 overflow-hidden max-w-sm p-1 shadow-lg">
                      <img
                        src={q.image_url}
                        alt="Question Visual"
                        className="w-full h-40 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewZoomImage(q.image_url)}
                      />
                      <button
                        onClick={() => setPreviewZoomImage(q.image_url)}
                        className="absolute bottom-2.5 right-2.5 p-1.5 rounded-xl bg-slate-900/80 text-cyan-300 hover:bg-slate-900 text-xs flex items-center gap-1 backdrop-blur-md border border-white/15"
                      >
                        <Eye className="w-3.5 h-3.5" /> Expand
                      </button>
                    </div>
                  )}

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d },
                    ].map((opt) => {
                      const isCorrect =
                        (q.correct_option || "").toUpperCase() === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-2xl border text-xs flex items-center gap-3 transition-colors ${
                            isCorrect
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold"
                              : "bg-slate-950/60 border-white/10 text-slate-300"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                                : "bg-slate-900 border border-white/15 text-slate-400"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1 leading-snug">
                            {opt.text}
                          </span>
                          {isCorrect && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* QUESTION ADD / EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-2xl glass-card-glow rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-600/30 text-cyan-300 border border-indigo-400/30">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {editingQuestion
                        ? "Edit Question Details"
                        : "Add New Question"}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Configure text, multiple choice options, correct key, and
                      image attachments.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                {/* Question Order & Text */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Order No.
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.question_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          question_order: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 rounded-2xl text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Question Text <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.text}
                      onChange={(e) =>
                        setFormData({ ...formData, text: e.target.value })
                      }
                      placeholder="e.g. Which HTML5 tag defines main navigation links?"
                      className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-2xl text-xs text-white font-medium placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Question Image Section */}
                <div className="p-4.5 rounded-2xl bg-slate-950/60 border border-white/15 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Question Image (Optional Visual)</span>
                    </label>
                    {formData.image_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, image_url: "" })
                        }
                        className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Image
                      </button>
                    )}
                  </div>

                  {/* Image Source Mode Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImageMode("file")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        imageMode === "file"
                          ? "bg-cyan-500 text-slate-950 font-black"
                          : "bg-slate-900 text-slate-300 border border-white/15 hover:bg-slate-800"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        imageMode === "url"
                          ? "bg-cyan-500 text-slate-950 font-black"
                          : "bg-slate-900 text-slate-300 border border-white/15 hover:bg-slate-800"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Image URL
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageMode("preset")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        imageMode === "preset"
                          ? "bg-cyan-500 text-slate-950 font-black"
                          : "bg-slate-900 text-slate-300 border border-white/15 hover:bg-slate-800"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Presets
                    </button>
                  </div>

                  {/* Input by File */}
                  {imageMode === "file" && (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-white hover:border-cyan-400 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Choose Image File</span>
                      </button>
                      <span className="text-[11px] text-slate-400 font-medium">
                        PNG, JPG, WebP (max 5MB)
                      </span>
                    </div>
                  )}

                  {/* Input by URL */}
                  {imageMode === "url" && (
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="Paste image web URL (e.g. https://example.com/diagram.png)"
                      className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    />
                  )}

                  {/* Input by Presets */}
                  {imageMode === "preset" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, image_url: preset.url })
                          }
                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 text-xs font-bold transition cursor-pointer ${
                            formData.image_url === preset.url
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                              : "bg-slate-900 border-white/15 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-8 h-8 rounded-xl object-cover"
                          />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Image Live Preview */}
                  {formData.image_url && (
                    <div className="mt-2.5 relative rounded-2xl border border-white/15 overflow-hidden bg-slate-950 p-2 flex items-center justify-center">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="max-h-44 w-auto object-contain rounded-xl"
                        onError={() =>
                          setFormError(
                            "Failed to load image from provided URL.",
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                {/* 4 Options Inputs */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Multiple Choice Options{" "}
                    <span className="text-pink-400">*</span>
                  </label>

                  {[
                    {
                      key: "A",
                      field: "option_a",
                      color: "bg-cyan-500 text-slate-950",
                    },
                    {
                      key: "B",
                      field: "option_b",
                      color: "bg-purple-500 text-white",
                    },
                    {
                      key: "C",
                      field: "option_c",
                      color: "bg-emerald-500 text-slate-950",
                    },
                    {
                      key: "D",
                      field: "option_d",
                      color: "bg-amber-500 text-slate-950",
                    },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-2xl ${opt.color} font-black text-xs flex items-center justify-center shrink-0 shadow-md`}
                      >
                        {opt.key}
                      </span>
                      <input
                        type="text"
                        value={formData[opt.field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [opt.field]: e.target.value,
                          })
                        }
                        placeholder={`Enter Option ${opt.key}`}
                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-2xl text-xs text-white font-medium placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Option Selector */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2">
                    Select Correct Answer Key{" "}
                    <span className="text-pink-400">*</span>
                  </label>

                  <div className="grid grid-cols-4 gap-2.5">
                    {["A", "B", "C", "D"].map((key) => {
                      const isSelected = formData.correct_option === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, correct_option: key })
                          }
                          className={`py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/15"
                          }`}
                        >
                          <span>Option {key}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingQuestion}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-black transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    {isSavingQuestion ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>
                          {editingQuestion
                            ? "Update Question"
                            : "Save Question"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMAGE ZOOM LIGHTBOX MODAL */}
      <AnimatePresence>
        {previewZoomImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md cursor-pointer"
            onClick={() => setPreviewZoomImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-white/20 p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewZoomImage(null)}
                className="absolute top-5 right-5 p-2.5 rounded-2xl bg-black/70 text-white hover:bg-rose-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewZoomImage}
                alt="Zoom Visual"
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLEAR ALL ATTEMPTS MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md glass-card-glow rounded-3xl p-7 text-center shadow-2xl">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 inline-block mb-3 border border-rose-500/40">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-black text-lg text-white mb-2">
              Purge All Candidate Records?
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed font-medium">
              This action will permanently wipe all candidate attempt records
              and question logs.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllAttempts}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-lg"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
