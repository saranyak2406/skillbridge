import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Layers, 
  Database, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Award,
  Users
} from 'lucide-react';
import api from './services/api';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);

  useEffect(() => {
    // Check backend health
    api.get('/health')
      .then((res) => {
        setBackendStatus('connected');
        setDbStatus(res.data.database);
        setServerInfo(res.data);
      })
      .catch((err) => {
        setBackendStatus('offline');
        setDbStatus('offline');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">Skill<span className="text-blue-600">Bridge</span></span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-widest uppercase">Learning Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              backendStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              Backend: {backendStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
            <ShieldCheck className="h-4 w-4" />
            Phase 1: Project Initialization Complete
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
            Learn New Skills. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Build Your Future.
            </span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            SkillBridge is an industry-grade full-stack online learning and skill development platform connecting learners with top instructors.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
            >
              Explore Architecture <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="http://localhost:5000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              View API Status
            </a>
          </div>
        </div>

        {/* System Architecture Grid */}
        <div id="architecture" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Frontend Layer</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              React 18 + Vite + Tailwind CSS with React Router DOM, Axios interceptors, Lucide icons, and Recharts analytics.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Vite Dev Server Ready (Port 5173)
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Backend REST API</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Node.js & Express REST architecture with JWT auth, bcrypt hashing, Helmet security, rate limiting, and Multer uploads.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Express App Ready (Port 5000)
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">PostgreSQL Database</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              20 relational tables (Users, Courses, Lessons, Quizzes, Assignments, Certificates, Payments) with constraints and indexes.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> PostgreSQL Schema & Seed Ready
            </div>
          </div>
        </div>

        {/* Roles Preview */}
        <div className="mt-12 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-card">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">Role-Based Access Architecture</h2>
            <p className="mt-2 text-slate-400 text-sm">
              Engineered with granular permissions across three distinct user roles.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                <Users className="h-4 w-4" /> Student
              </div>
              <p className="text-xs text-slate-300">Enroll courses, watch lessons, take timed quizzes, submit assignments & earn verified certificates.</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                <BookOpen className="h-4 w-4" /> Instructor
              </div>
              <p className="text-xs text-slate-300">Create curriculum, upload video lessons, build quizzes, grade student submissions & track revenue.</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                <Award className="h-4 w-4" /> Administrator
              </div>
              <p className="text-xs text-slate-300">Approve courses, manage categories, moderate users, monitor transactions & view platform analytics.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SkillBridge Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with React, Express & PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
