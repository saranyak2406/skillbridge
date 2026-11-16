import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Award, 
  Settings, 
  LogOut, 
  Bell, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  DollarSign, 
  Layers, 
  ChevronRight, 
  Menu, 
  X,
  ExternalLink,
  Shield,
  Activity,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dbStatus, setDbStatus] = useState('connected');

  // Load notifications & health
  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
      })
      .catch(() => {});

    api.get('/health')
      .then((res) => setDbStatus(res.data.database))
      .catch(() => setDbStatus('offline'));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define sidebar navigation items based on current user role
  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Browse Courses', path: '/courses', icon: BookOpen },
        { label: 'Add Category', path: '/admin/dashboard?tab=categories', icon: Layers },
        { label: 'My Profile', path: '/profile', icon: Settings },
      ];
    }

    if (user.role === 'instructor') {
      return [
        { label: 'Studio Overview', path: '/instructor/dashboard', icon: LayoutDashboard },
        { label: 'Create New Course', path: '/instructor/courses/new', icon: PlusCircle },
        { label: 'Grade Submissions', path: '/instructor/submissions', icon: FileText },
        { label: 'Browse Catalog', path: '/courses', icon: BookOpen },
        { label: 'My Profile', path: '/profile', icon: Settings },
      ];
    }

    // Default: Student
    return [
      { label: 'Learning Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Browse Courses', path: '/courses', icon: BookOpen },
      { label: 'My Profile', path: '/profile', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-400/30">Administrator</span>;
      case 'instructor':
        return <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400/30">Instructor</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/30">Student</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Skill<span className="text-blue-500">Bridge</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Navigation
            </div>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 mb-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {getRoleBadge(user?.role)}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
        ></div>
      )}

      {/* 2. RIGHT MAIN VIEW AREA */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                {title || 'Dashboard'}
              </h1>
              {subtitle && <p className="text-[11px] text-slate-400 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            
            {/* Live Database status pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              dbStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="hidden sm:inline">PostgreSQL:</span> {dbStatus}
            </span>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 animate-in fade-in"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} new)</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3.5 text-xs hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/40' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-800">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications to display.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View Catalog Shortcut */}
            <Link
              to="/courses"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Site
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
