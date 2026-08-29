import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { exportAttemptsToCSV } from '../utils/csvExport';

export default function AdminDashboardPage() {
  const { adminToken, isAdminLoggedIn, logoutAdmin } = useAuth();
  const { playClick } = useSound();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin');
      return;
    }
    fetchAttempts();
  }, [isAdminLoggedIn]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/attempts', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logoutAdmin();
          navigate('/admin');
          return;
        }
        throw new Error(data.error || 'Failed to fetch assessment records.');
      }

      setAttempts(data.attempts || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading administration data.');
      setLoading(false);
    }
  };

  const handleDeleteAttempt = async (id) => {
    if (!window.confirm('Are you sure you want to remove this candidate record?')) return;
    playClick();

    try {
      const res = await fetch(`/api/admin/attempts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setAttempts(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    playClick();
    try {
      const res = await fetch('/api/admin/attempts-all', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setAttempts([]);
        setShowClearModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.status === 'completed').length;
  const avgScore = completedAttempts > 0
    ? (attempts.filter(a => a.status === 'completed').reduce((acc, a) => acc + a.total_score, 0) / completedAttempts).toFixed(1)
    : '0';
  const avgTimeSeconds = completedAttempts > 0
    ? Math.round(attempts.filter(a => a.status === 'completed').reduce((acc, a) => acc + (a.durationSeconds || 0), 0) / completedAttempts)
    : 0;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filteredAttempts = attempts.filter(a =>
    a.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.started_at) - new Date(a.started_at);
    if (sortBy === 'score_desc') return b.total_score - a.total_score;
    if (sortBy === 'score_asc') return a.total_score - b.total_score;
    if (sortBy === 'time_desc') return (b.durationSeconds || 0) - (a.durationSeconds || 0);
    return 0;
  });

  return (
    <div className="min-h-[calc(100vh-60px)] p-4 sm:p-8 max-w-6xl mx-auto bg-[#F8F9FA]">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#DEE2E6]">
        <div className="flex items-center gap-3">
          <img 
            src="/apex-icon.png" 
            alt="APEX IT SOLUTION" 
            className="h-9 w-auto object-contain shrink-0" 
          />
          <div>
            <div className="flex items-center gap-1.5 text-[#1E3A5F] text-xs font-semibold uppercase tracking-wider mb-0.5">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Administrative Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
              Assessment Analytics & Audit Records
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { playClick(); fetchAttempts(); }}
            className="px-3 py-1.5 rounded-[6px] bg-white border border-[#DEE2E6] text-[#1A1A1A] hover:bg-[#F8F9FA] text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => { playClick(); exportAttemptsToCSV(attempts); }}
            disabled={attempts.length === 0}
            className="px-3.5 py-1.5 rounded-[6px] bg-[#1E3A5F] hover:bg-[#162C48] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {attempts.length > 0 && (
            <button
              onClick={() => { playClick(); setShowClearModal(true); }}
              className="px-3 py-1.5 rounded-[6px] bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-[6px] bg-[#EBF2FA] text-[#1E3A5F]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider">Total Candidates</p>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{totalAttempts}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-[6px] bg-[#F0FDF4] text-[#166534]">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider">Completed</p>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{completedAttempts}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-[6px] bg-[#EBF2FA] text-[#1E3A5F]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider">Average Score</p>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{avgScore} <span className="text-xs font-normal text-[#6C757D]">/ 15</span></h3>
          </div>
        </div>

        <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-[6px] bg-[#FFFBEB] text-[#B45309]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider">Avg Duration</p>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{formatDuration(avgTimeSeconds)}</h3>
          </div>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] placeholder-[#6C757D] focus:outline-none focus:border-[#1E3A5F] font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6C757D] font-medium shrink-0">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[6px] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1E3A5F] font-sans"
          >
            <option value="newest">Most Recent</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
            <option value="time_desc">Longest Time</option>
          </select>
        </div>
      </div>

      {/* Attempts Table */}
      {loading ? (
        <div className="p-12 text-center text-[#6C757D]">
          <div className="w-6 h-6 border-2 border-[#DEE2E6] border-t-[#1E3A5F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading candidate records...</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="bg-white border border-[#DEE2E6] rounded-[6px] p-8 text-center">
          <Users className="w-8 h-8 text-[#6C757D] mx-auto mb-2" />
          <h3 className="font-bold text-sm text-[#1A1A1A] mb-1">No Records Found</h3>
          <p className="text-xs text-[#6C757D]">
            {searchTerm ? 'No candidate names match your query.' : 'No assessment attempts have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#DEE2E6] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6] text-[11px] font-bold uppercase tracking-wider text-[#495057]">
                  <th className="p-3 pl-4">Candidate Name</th>
                  <th className="p-3">Score (X/15)</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3 text-center">Proctored Audit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE2E6] text-xs">
                {filteredAttempts.map((attempt) => {
                  const isExpanded = expandedId === attempt.id;
                  const score = attempt.total_score;
                  let scoreBadge = "bg-[#EBF2FA] text-[#1E3A5F] border-[#B8D1E5]";
                  if (score >= 12) scoreBadge = "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]";
                  else if (score >= 8) scoreBadge = "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]";

                  return (
                    <React.Fragment key={attempt.id}>
                      <tr className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="p-3 pl-4 font-semibold text-[#1A1A1A]">
                          {attempt.participant_name}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-[4px] border text-xs font-bold ${scoreBadge}`}>
                            {score} / 15
                          </span>
                        </td>
                        <td className="p-3 text-[#6C757D] font-mono">
                          {formatDuration(attempt.durationSeconds || 0)}
                        </td>
                        <td className="p-3 text-[#6C757D]">
                          {new Date(attempt.started_at).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {attempt.tab_switch_count > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FDF2F2] text-[#DC2626] border border-[#F87171] text-[10px] font-bold">
                              <ShieldAlert className="w-3 h-3" />
                              {attempt.tab_switch_count} Tab Switch{attempt.tab_switch_count > 1 ? 'es' : ''}
                            </span>
                          ) : (
                            <span className="text-[#6C757D] text-[11px]">Clean</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                              attempt.status === 'completed'
                                ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                            }`}
                          >
                            {attempt.status}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-right space-x-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
                            className="px-2.5 py-1 rounded-[4px] bg-[#F8F9FA] border border-[#DEE2E6] text-[#1A1A1A] hover:border-[#1E3A5F] font-medium text-xs inline-flex items-center gap-1 transition"
                          >
                            <span>{isExpanded ? 'Hide' : 'View Answers'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-[#1E3A5F]" /> : <ChevronDown className="w-3 h-3 text-[#6C757D]" />}
                          </button>

                          <button
                            onClick={() => handleDeleteAttempt(attempt.id)}
                            className="p-1 rounded-[4px] bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C757D] hover:text-[#DC2626] hover:border-[#F87171] transition inline-flex items-center"
                            title="Delete candidate attempt"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Breakdown */}
                      {isExpanded && (
                        <tr className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                          <td colSpan="7" className="p-4">
                            <h4 className="font-bold text-xs text-[#1A1A1A] mb-3">
                              Answer Breakdown for {attempt.participant_name}
                            </h4>
                            {attempt.answers && attempt.answers.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {attempt.answers.map((ans, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-[6px] border text-xs leading-relaxed ${
                                      ans.isCorrect
                                        ? 'bg-white border-[#BBF7D0]'
                                        : 'bg-white border-[#F87171]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <span className="font-semibold text-[#1A1A1A]">
                                        Q{ans.questionOrder}. {ans.questionText}
                                      </span>
                                      {ans.isCorrect ? (
                                        <CheckCircle className="w-4 h-4 text-[#166534] shrink-0" />
                                      ) : (
                                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-[#6C757D] pt-1 border-t border-[#DEE2E6]">
                                      <span>
                                        Selected: <strong className={ans.isCorrect ? 'text-[#166534]' : 'text-[#DC2626]'}>{ans.selectedOption || 'Unanswered'}</strong>
                                      </span>
                                      <span>
                                        Correct: <strong className="text-[#166534]">{ans.correctOption}</strong>
                                      </span>
                                      <span className="font-mono text-[#6C757D]">
                                        {ans.timeTakenSeconds}s
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#6C757D]">No answer details logged.</p>
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

      {/* Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="w-full max-w-md bg-white border border-[#DEE2E6] rounded-[6px] p-6 text-center shadow-sm">
            <div className="p-2 rounded-full bg-[#FDF2F2] text-[#DC2626] inline-block mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1A1A1A] mb-1">Purge All Candidate Records?</h3>
            <p className="text-xs text-[#6C757D] mb-5 leading-relaxed">
              This action will permanently delete all candidate assessment records and question log entries.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-1.5 rounded-[6px] bg-[#F8F9FA] border border-[#DEE2E6] text-[#1A1A1A] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-1.5 rounded-[6px] bg-[#DC2626] text-white text-xs font-semibold"
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
