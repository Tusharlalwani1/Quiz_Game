import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AntiCheatGuard({ isActive = false, children }) {
  const { sessionId } = useAuth();
  const [warningMessage, setWarningMessage] = useState(null);

  useEffect(() => {
    if (!isActive || !sessionId) return;

    // 1. Prevent Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      showToast('Right-click context menu is disabled during the assessment.');
    };

    // 2. Prevent Keyboard Shortcuts for DevTools / Copying
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        showToast('Developer tools shortcut is disabled.');
      }
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'u' || key === 's' || (e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))) {
          e.preventDefault();
          showToast('Source inspection and save shortcuts are disabled.');
        }
      }
    };

    // 3. Detect Tab Switch / Window Blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordTabSwitch();
      }
    };

    const handleBlur = () => {
      recordTabSwitch();
    };

    let lastRecordTime = 0;
    const recordTabSwitch = async () => {
      const now = Date.now();
      if (now - lastRecordTime < 3000) return;
      lastRecordTime = now;

      showToast('Assessment Warning: Window switch detected and logged for evaluation review.');

      try {
        await fetch('/api/quiz/tab-switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (err) {
        console.error('Failed to log tab switch:', err);
      }
    };

    const showToast = (msg) => {
      setWarningMessage(msg);
      setTimeout(() => {
        setWarningMessage(prev => prev === msg ? null : prev);
      }, 4000);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, sessionId]);

  return (
    <div className="relative w-full min-h-screen select-none">
      {/* Toast Alert */}
      {warningMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white border border-[#1E3A5F] text-[#1A1A1A] px-4 py-2.5 rounded-[6px] shadow-sm flex items-center gap-2.5 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#1E3A5F] shrink-0" />
            <span>{warningMessage}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
