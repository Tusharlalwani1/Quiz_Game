import React from 'react';
import { Volume2, VolumeX, Shield, User, Sparkles, LogOut, Flame } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { muted, toggleMute, playClick } = useSound();
  const { participantName, isAdminLoggedIn, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSoundToggle = () => {
    playClick();
    toggleMute();
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 px-4 py-3 sm:px-8 font-sans shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Header Brand Logo */}
        <div
          onClick={() => {
            playClick();
            navigate('/');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative p-1.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/apex-icon.png"
              alt="APEX"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                APEX <span className="gradient-text-fun">QUIZ RUN</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-black uppercase tracking-wider">
                <Flame className="w-3 h-3 text-fuchsia-400" /> LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {participantName && !isAdminRoute && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-bold text-slate-200 shadow-inner">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{participantName}</span>
            </div>
          )}

          {isAdminRoute && isAdminLoggedIn && (
            <button
              onClick={() => {
                playClick();
                logoutAdmin();
                navigate('/admin');
              }}
              className="px-4 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs font-extrabold text-rose-300 hover:bg-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/20 transition flex items-center justify-center cursor-pointer shadow-md"
            title={muted ? 'Unmute Audio Effects' : 'Mute Audio Effects'}
          >
            {muted ? <VolumeX className="w-4.5 h-4.5 text-slate-400" /> : <Volume2 className="w-4.5 h-4.5 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
