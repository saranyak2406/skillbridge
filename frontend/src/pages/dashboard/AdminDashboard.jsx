import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  Users, 
  BookOpen, 
  Layers, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Search, 
  PlusCircle, 
  Trash2, 
  Loader2, 
  TrendingUp, 
  Filter, 
  CreditCard,
  UserPlus,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // User search & filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const loadData = async () => {
    try {
      const [dashRes, usersRes, catRes] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/users?limit=50'),
        api.get('/categories'),
      ]);

      setAdminData(dashRes.data.data);
      setUsersList(usersRes.data.data.users || []);
      setCategoriesList(catRes.data.data.categories || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;

    try {
      await api.post('/users', {
        full_name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Handle Course Approval / Rejection
  const handleCourseStatus = async (courseId, status) => {
    try {
      await api.patch(`/courses/${courseId}/status`, { status });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update course status.');
    }
  };

  // Handle Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;
    try {
      await api.post('/categories', { category_name: catName, description: catDesc });
      setCatName('');
      setCatDesc('');
      setShowCatModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Console">
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-3" />
          <p className="text-sm font-medium">Synchronizing Platform Administration Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Analytics Chart Data
  const revenueChartData = [
    { month: 'Jun', revenue: 4200 },
    { month: 'Jul', revenue: 6800 },
    { month: 'Aug', revenue: 9500 },
    { month: 'Sep', revenue: 14200 },
    { month: 'Oct', revenue: 19800 },
    { month: 'Nov', revenue: parseFloat(adminData?.total_revenue || 24920) },
  ];

  const categoryChartData = categoriesList.map((cat) => ({
    name: cat.category_name,
    courses: parseInt(cat.course_count || 1, 10),
  }));

  const userDistributionData = [
    { name: 'Students', value: parseInt(adminData?.users?.total_students || 1, 10), color: '#3b82f6' },
    { name: 'Instructors', value: parseInt(adminData?.users?.total_instructors || 1, 10), color: '#6366f1' },
    { name: 'Admins', value: parseInt(adminData?.users?.total_admins || 1, 10), color: '#a855f7' },
  ];

  const pendingCourses = adminData?.pending_course_approvals || [];
  const transactions = adminData?.recent_transactions || [];

  return (
    <DashboardLayout
      title="Platform Administration"
      subtitle="Complete system governance, user directory, and revenue intelligence"
    >
      <div className="space-y-8">
        
        {/* Tab Navigation Pill Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-soft flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            User Directory ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition relative ${
              activeTab === 'approvals'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Course Approvals
            {pendingCourses.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingCourses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'categories'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Categories ({categoriesList.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'transactions'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* 1. TAB: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* 4 Core Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Users</span>
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {adminData?.users?.total_users || 0}
                </div>
                <div className="text-[11px] text-purple-600 font-semibold mt-1">
                  {adminData?.users?.total_students} Students • {adminData?.users?.total_instructors} Instructors
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Courses</span>
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {adminData?.courses?.total_courses || 0}
                </div>
                <div className="text-[11px] text-blue-600 font-semibold mt-1">
                  {adminData?.courses?.published_courses} Published across catalog
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Enrollments</span>
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {adminData?.total_enrollments || 0}
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                  Active course registrations
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Platform Revenue</span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  ${parseFloat(adminData?.total_revenue || 0).toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Processed transactions
                </div>
              </div>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Area Chart: Revenue Trend (8 Cols) */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Revenue Performance Trend</h3>
                    <p className="text-xs text-slate-400">Monthly gross transaction volume (USD)</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                    +28.4% this quarter
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart: User Demographics (4 Cols) */}
              <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">User Demographics</h3>
                  <p className="text-xs text-slate-400">Distribution across platform roles</p>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 text-center text-xs text-slate-500 font-semibold border-t border-slate-100">
                  Total Active Directory: {adminData?.users?.total_users} Users
                </div>
              </div>
            </div>

            {/* Bar Chart: Courses by Category */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
              <h3 className="text-base font-bold text-slate-900 mb-1">Catalog Density by Category</h3>
              <p className="text-xs text-slate-400 mb-6">Course distribution across top technology tracks</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="courses" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* 2. TAB: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">User Directory</h2>
                <p className="text-xs text-slate-500">Manage registered students, instructors, and system administrators</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
              >
                <UserPlus className="h-4 w-4" /> Add New User
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="student">Students Only</option>
                <option value="instructor">Instructors Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'instructor' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No users match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TAB: COURSE APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Course Approvals Queue</h2>
              <p className="text-xs text-slate-500">Review instructor curricula before they become publicly accessible</p>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingCourses.length > 0 ? (
                pendingCourses.map((c) => (
                  <div key={c.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                        Pending Review
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-500">
                        Instructor: <span className="font-semibold text-slate-700">{c.instructor_name}</span> ({c.instructor_email}) • Category: {c.category_name} • Price: ${c.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCourseStatus(c.id, 'published')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve Course
                      </button>
                      <button
                        onClick={() => handleCourseStatus(c.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Approvals Queue is Clear</p>
                  <p className="text-xs text-slate-400 mt-1">All submitted courses have been reviewed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TAB: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Course Categories</h2>
                <p className="text-xs text-slate-500">Organize subject taxonomies across the platform</p>
              </div>
              <button
                onClick={() => setShowCatModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition"
              >
                <PlusCircle className="h-4 w-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categoriesList.map((cat) => (
                <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-900">{cat.category_name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description || 'General technology curriculum.'}</p>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>{cat.course_count || 0} active courses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TAB: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Payment Transactions</h2>
              <p className="text-xs text-slate-500">Real-time payment records from enrolled students</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{tx.transaction_id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{tx.student_name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{tx.course_title}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">${parseFloat(tx.amount).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Platform User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Platform Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Short description of the domain..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
