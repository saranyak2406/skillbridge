import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  PlayCircle,
  FileText,
  Loader2,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student')
      .then((res) => {
        setDashboardData(res.data.data);
      })
      .catch((err) => console.error('Failed to load student dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Your Student Dashboard...</p>
      </div>
    );
  }

  const enrolled = dashboardData?.enrolled_courses || [];
  const assignments = dashboardData?.upcoming_assignments || [];

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
          Explore More Courses
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
          <div className="text-2xl font-black text-slate-900 mt-2">{dashboardData?.total_enrolled || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {dashboardData?.in_progress_count || 0} in progress, {dashboardData?.completed_count || 0} completed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Completed Lessons</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {enrolled.reduce((sum, c) => sum + parseInt(c.completed_lessons || 0, 10), 0)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Across active courses
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Quiz Score</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dashboardData?.average_quiz_score || 0}%
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            Passed {dashboardData?.passed_quizzes_count || 0} examinations
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Certificates</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dashboardData?.certificates_count || 0}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            Verified credentials earned
          </div>
        </div>
      </div>

      {/* Courses in Progress Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enrolled Courses & Progress</h2>
            <p className="text-xs text-slate-500">Pick up right where you left off</p>
          </div>
        </div>

        <div className="space-y-4">
          {enrolled.length > 0 ? (
            enrolled.map((c) => {
              const progressPct = parseFloat(c.progress_percentage || 0);
              return (
                <div
                  key={c.course_id}
                  className="border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <PlayCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Instructor: {c.instructor_name}</p>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-36 sm:w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {progressPct}% ({c.completed_lessons}/{c.total_lessons} lessons)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/learn/${c.course_id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                    >
                      Continue Learning <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500">You are not enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-block"
              >
                Browse Course Catalog
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Assignments */}
      {assignments.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Assignments</h2>
          <div className="divide-y divide-slate-100">
            {assignments.map((a) => (
              <div key={a.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                  <p className="text-[11px] text-slate-500">{a.course_title} • Due {new Date(a.due_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    a.submission_status === 'graded' ? 'bg-emerald-100 text-emerald-800' :
                    a.submission_status ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {a.submission_status || 'Pending'}
                  </span>
                  <Link
                    to={`/learn/${a.course_id}/assignment/${a.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
