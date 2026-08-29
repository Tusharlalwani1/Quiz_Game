import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Participant State
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('quiz_session_id') || null);
  const [participantName, setParticipantName] = useState(() => localStorage.getItem('quiz_participant_name') || '');
  const [isQuizCompleted, setIsQuizCompleted] = useState(() => localStorage.getItem('quiz_completed') === 'true');

  // Admin State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || null);

  useEffect(() => {
    if (sessionId) localStorage.setItem('quiz_session_id', sessionId);
    else localStorage.removeItem('quiz_session_id');
  }, [sessionId]);

  useEffect(() => {
    if (participantName) localStorage.setItem('quiz_participant_name', participantName);
    else localStorage.removeItem('quiz_participant_name');
  }, [participantName]);

  useEffect(() => {
    localStorage.setItem('quiz_completed', isQuizCompleted ? 'true' : 'false');
  }, [isQuizCompleted]);

  useEffect(() => {
    if (adminToken) localStorage.setItem('admin_token', adminToken);
    else localStorage.removeItem('admin_token');
  }, [adminToken]);

  const startQuizSession = (sessionData) => {
    setSessionId(sessionData.sessionId);
    setParticipantName(sessionData.participantName);
    setIsQuizCompleted(false);
  };

  const completeQuizSession = () => {
    setIsQuizCompleted(true);
  };

  const resetQuizSession = () => {
    setSessionId(null);
    setParticipantName('');
    setIsQuizCompleted(false);
    localStorage.removeItem('quiz_session_id');
    localStorage.removeItem('quiz_participant_name');
    localStorage.removeItem('quiz_completed');
  };

  const loginAdmin = (token) => {
    setAdminToken(token);
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        sessionId,
        participantName,
        isQuizCompleted,
        adminToken,
        isAdminLoggedIn: Boolean(adminToken),
        startQuizSession,
        completeQuizSession,
        resetQuizSession,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
