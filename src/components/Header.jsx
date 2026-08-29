import React from 'react';
import { Volume2, VolumeX, Shield, User } from 'lucide-react';
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
    <header className="w-full border-b border-[#DEE2E6] bg-white sticky top-0 z-40 px-4 py-3 sm:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Institutional Header Logo */}
        <div 
          onClick={() => { playClick(); navigate('/'); }} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/apex-logo.png" 
            alt="APEX IT SOLUTION" 
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
          <div className="hidden sm:block h-6 w-[1px] bg-[#DEE2E6]" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-sans font-semibold tracking-wider text-[#1E3A5F] bg-[#EBF2FA] border border-[#B8D1E5] px-2 py-0.5 rounded-[4px] uppercase">
              Examination Portal
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {participantName && !isAdminRoute && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#F8F9FA] border border-[#DEE2E6] text-xs font-medium text-[#1A1A1A]">
              <User className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <span>{participantName}</span>
            </div>
          )}

          {isAdminRoute && isAdminLoggedIn && (
            <button
              onClick={() => { playClick(); logoutAdmin(); navigate('/admin'); }}
              className="px-3 py-1 rounded-[6px] bg-[#EBF2FA] border border-[#B8D1E5] text-xs font-semibold text-[#1E3A5F] hover:bg-[#D5E4F5] transition"
            >
              Sign Out Admin
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-1.5 rounded-[6px] bg-white border border-[#DEE2E6] text-[#6C757D] hover:text-[#1A1A1A] hover:border-[#CED4DA] transition flex items-center justify-center"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-[#6C757D]" /> : <Volume2 className="w-4 h-4 text-[#1E3A5F]" />}
          </button>
        </div>
      </div>
    </header>
  );
}
