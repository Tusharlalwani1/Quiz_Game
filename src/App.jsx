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
          <div className="min-h-screen flex flex-col bg-cyber-dark text-slate-100 selection:bg-indigo-500 selection:text-white">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/instructions" element={<InstructionsPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/complete" element={<CompletionPage />} />
                
                {/* Hidden Admin Routes */}
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
