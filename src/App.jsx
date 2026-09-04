import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import InstructionsPage from './pages/InstructionsPage';
import QuizPage from './pages/QuizPage';
import CompletionPage from './pages/CompletionPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-100 font-sans selection:bg-fuchsia-500 selection:text-white relative overflow-hidden">
            {/* Ambient Background Glow Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

            <Header />
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/instructions" element={<InstructionsPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/complete" element={<CompletionPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SoundProvider>
    </AuthProvider>
  );
}
