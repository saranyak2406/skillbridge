import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
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
  Calendar,
  ExternalLink,
  Download,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('courses');
  const [dashboardData, setDashboardData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/student'),
      api.get('/certificates'),
    ])
      .then(([dashRes, certRes]) => {
        setDashboardData(dashRes.data.data);
        setCertificates(certRes.data.data.certificates || []);
      })
      .catch((err) => console.error('Failed to load student dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Student Learning Portal">
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium">Synchronizing Your Learning Records & Progress...</p>
        </div>
      </DashboardLayout>
    );
  }

  const enrolled = dashboardData?.enrolled_courses || [];
  const assignments = dashboardData?.upcoming_assignments || [];

  // Mock Study Hours for the Recharts BarChart
  const studyHoursData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 4.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 3.5 },
    { day: 'Fri', hours: 5.0 },
    { day: 'Sat', hours: 6.5 },
    { day: 'Sun', hours: 3.0 },
  ];

  const quizTrendData = [
    { exam: 'Quiz 1', score: 70 },
    { exam: 'Quiz 2', score: 85 },
    { exam: 'Quiz 3', score: 90 },
    { exam: 'Assessment 4', score: dashboardData?.average_quiz_score || 88 },
  ];

  return (
    <DashboardLayout
      title="Student Learning Portal"
      subtitle="Track your enrolled lectures, quiz assessments, capstone projects, and certified achievements"
    >
      <div className="space-y-8">
        
        {/* Tab Navigation Pill Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-soft flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Learning ({enrolled.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Study Analytics & Exams
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'certificates'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Certificates ({certificates.length})
          </button>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Courses</span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{dashboardData?.total_enrolled || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {dashboardData?.in_progress_count || 0} active, {dashboardData?.completed_count || 0} completed
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Completed Lessons</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {enrolled.reduce((sum, c) => sum + parseInt(c.completed_lessons || 0, 10), 0)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Progress verified in database
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Average Quiz Score</span>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {dashboardData?.average_quiz_score || 0}%
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">
              Passed {dashboardData?.passed_quizzes_count || 0} examinations
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Verified Credentials</span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {certificates.length}
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">
              Accredited certificates
            </div>
          </div>
        </div>

        {/* 1. TAB: MY LEARNING */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Active Course Progress</h2>
                  <p className="text-xs text-slate-500">Pick up right where you left off</p>
                </div>
                <Link
                  to="/courses"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Explore Catalog →
                </Link>
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
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
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
                          View Deliverable
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. TAB: STUDY ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Study Hours BarChart (7 Cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Weekly Study Effort</h3>
                    <p className="text-xs text-slate-400">Hours spent watching lessons and completing exercises</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                    26.0 hrs this week
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyHoursData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(val) => [`${val} hours`, 'Study Time']} />
                      <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quiz Examination Trend LineChart (5 Cols) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
                <h3 className="text-base font-bold text-slate-900 mb-1">Exam Scores Progression</h3>
                <p className="text-xs text-slate-400 mb-6">Historical test performance percentages</p>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quizTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="exam" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 100]} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. TAB: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verified Certificates & Credentials</h2>
              <p className="text-xs text-slate-500">Official digital credentials verifying your skill mastery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div key={cert.id} className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{cert.course_title}</h4>
                        <p className="text-xs text-slate-500">Instructor: {cert.instructor_name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {cert.certificate_number}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400">
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/certificates/${cert.certificate_number}`}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                        >
                          View
                        </Link>
                        <a
                          href={`http://localhost:5000/api/certificates/${cert.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                        >
                          <Download className="h-3 w-3" /> PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <Award className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Certificates Earned Yet</p>
                  <p className="text-xs text-slate-400 mt-1">Complete 100% of course lectures and pass the assessments to unlock your verified credential.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
