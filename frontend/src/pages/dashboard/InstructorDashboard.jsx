import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const InstructorDashboard = () => {
  const { user } = useAuth();
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Instructor Studio...</p>
      </div>
    );
  }

  const courses = dashboardData?.courses || [];
  const pendingSubmissions = dashboardData?.pending_submissions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full">
            Instructor Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Manage your courses, curriculum sections, quiz question banks, and evaluate student project submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Create New Course
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">My Courses</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{dashboardData?.total_courses || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {dashboardData?.published_courses || 0} published, {dashboardData?.pending_courses || 0} pending review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Students</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{dashboardData?.total_students || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Active enrollments</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Submissions</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{dashboardData?.pending_submissions_count || 0}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            <Link to="/instructor/submissions" className="underline">Awaiting evaluation</Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${parseFloat(dashboardData?.total_revenue || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Direct course earnings</div>
        </div>
      </div>

      {/* Courses Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Created Courses</h2>
            <p className="text-xs text-slate-500">Edit curriculum, sections, and pricing</p>
          </div>
          <Link
            to="/instructor/submissions"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Review Submissions Queue ({pendingSubmissions.length}) →
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

    </div>
  );
};

export default InstructorDashboard;
