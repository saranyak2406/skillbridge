import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  PlusCircle, 
  CheckCircle, 
  FileText, 
  ArrowRight,
  ExternalLink,
  Edit,
  Loader2,
  Trash2,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const InstructorDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    api.get('/dashboard/instructor')
      .then((res) => setDashboardData(res.data.data))
      .catch((err) => console.error('Failed to load instructor dashboard:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Instructor Studio">
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading Instructor Studio & Analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const courses = dashboardData?.courses || [];
  const pendingSubmissions = dashboardData?.pending_submissions || [];

  // Chart Data
  const monthlyEarningsData = [
    { month: 'Jun', earnings: 1200 },
    { month: 'Jul', earnings: 2100 },
    { month: 'Aug', earnings: 3400 },
    { month: 'Sep', earnings: 5100 },
    { month: 'Oct', earnings: 6900 },
    { month: 'Nov', earnings: parseFloat(dashboardData?.total_revenue || 8450) },
  ];

  const courseEnrollmentChartData = courses.map((c) => ({
    name: c.title.length > 20 ? c.title.substring(0, 18) + '...' : c.title,
    students: parseInt(c.enrolled_students || 1, 10),
  }));

  return (
    <DashboardLayout
      title="Instructor Studio"
      subtitle="Manage your courses, curriculum content, student evaluations, and royalty revenues"
    >
      <div className="space-y-8">
        
        {/* Tab Navigation Pill Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-soft flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition relative ${
              activeTab === 'submissions'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Submissions Queue
            {pendingSubmissions.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* 1. TAB: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">My Courses</span>
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {dashboardData?.total_courses || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {dashboardData?.published_courses} Published • {dashboardData?.pending_courses} Pending
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Students</span>
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {dashboardData?.total_students || 0}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Enrolled across all courses
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Awaiting Review</span>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {dashboardData?.pending_submissions_count || 0}
                </div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">
                  Student assignments to grade
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Revenue</span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  ${parseFloat(dashboardData?.total_revenue || 0).toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Cumulative earnings
                </div>
              </div>
            </div>

            {/* Recharts Analytics: Earnings & Student Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Monthly Earnings AreaChart (7 Cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Instructor Earnings Growth</h3>
                    <p className="text-xs text-slate-400">Monthly gross revenues received</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
                    Direct Payouts Active
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyEarningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                      <Area type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Student Enrollments BarChart (5 Cols) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
                <h3 className="text-base font-bold text-slate-900 mb-1">Enrollment by Course</h3>
                <p className="text-xs text-slate-400 mb-6">Total students per published course</p>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseEnrollmentChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={100} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#6366f1" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. TAB: MY COURSES */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Published & Draft Courses</h2>
                <p className="text-xs text-slate-500">Edit curriculum sections, lectures, and exams</p>
              </div>
              <Link
                to="/instructor/courses/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                <PlusCircle className="h-4 w-4" /> Create New Course
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Enrolled</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.length > 0 ? (
                    courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <Link to={`/courses/${c.id}`} className="hover:text-indigo-600 transition">
                            {c.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{c.category_name || 'General'}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">${parseFloat(c.price).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-slate-600">{c.enrolled_students || 0} students</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            c.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            to={`/instructor/courses/${c.id}/curriculum`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] transition"
                          >
                            <Edit className="h-3 w-3" /> Curriculum
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Delete Course"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No courses created yet. Click "+ Create New Course" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TAB: SUBMISSIONS QUEUE */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Assignment Submissions</h2>
                <p className="text-xs text-slate-500">Submissions awaiting your evaluation and qualitative remarks</p>
              </div>
              <Link
                to="/instructor/submissions"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
              >
                Go to Dedicated Grading Studio <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingSubmissions.length > 0 ? (
                pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{sub.student_name}</h4>
                      <p className="text-[11px] text-slate-500">{sub.assignment_title} • {sub.course_title}</p>
                    </div>
                    <Link
                      to="/instructor/submissions"
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition"
                    >
                      Grade Now
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Submissions Queue Clear</p>
                  <p className="text-xs text-slate-400 mt-1">All student assignments are up to date.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
