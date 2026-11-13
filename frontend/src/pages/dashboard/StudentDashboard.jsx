import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Award, CheckCircle, Clock, BarChart3, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-lg">
            Track your ongoing courses, complete quizzes, submit assignments, and download certificates.
          </p>
        </div>
        <Link
          to="/courses"
          className="px-5 py-2.5 rounded-xl bg-white text-blue-600 font-bold text-xs shadow hover:bg-slate-50 transition shrink-0"
        >
          Explore New Courses
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Courses</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">3</div>
          <div className="text-[11px] text-slate-400 mt-1">2 in progress, 1 completed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Completed Lessons</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">24</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">75% overall completion</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Quiz Score</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">88%</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">Passed 4/4 assessments</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Certificates</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">1</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Ready for PDF download</div>
        </div>
      </div>

      {/* Courses in progress preview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Courses in Progress</h2>
          <Link to="/courses" className="text-xs font-bold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        <div className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Full Stack Modern Web Architecture with React & Node.js
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Instructor: Dr. Sarah Mitchell</p>
              <div className="w-48 bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>

          <Link
            to="/learn/1"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            Continue Learning <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
