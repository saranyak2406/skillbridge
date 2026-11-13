import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, Layers, DollarSign, Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch users for admin management
    api.get('/users?limit=5')
      .then((res) => {
        if (res.data && res.data.data) {
          setUsersList(res.data.data.users);
        }
      })
      .catch((err) => console.error('Failed to load users list:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full">
            Admin Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            SkillBridge Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Manage registered users, review pending courses, oversee payments, and monitor site analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            System Operational
          </span>
        </div>
      </div>

      {/* Admin Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Users</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">3</div>
          <div className="text-[11px] text-slate-400 mt-1">1 Admin, 1 Instructor, 1 Student</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Courses</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">3</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Published across categories</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Categories</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">6</div>
          <div className="text-[11px] text-slate-400 mt-1">Web, AI, Cloud, Mobile, UI, Sec</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Volume</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">$24,920</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Processed transactions</div>
        </div>
      </div>

      {/* User Management Quick Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Management</h2>
            <p className="text-xs text-slate-500">Live PostgreSQL registered users</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.length > 0 ? (
                usersList.map((u) => (
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    {loading ? 'Loading user data from PostgreSQL...' : 'No users found.'}
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

export default AdminDashboard;
