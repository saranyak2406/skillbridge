import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Destination route after login
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Redirect based on role or original intended location
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (result.user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setErrorMessage(result.message);
    }
  };

  // Quick Demo Login Helper
  const setDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Log in to continue your learning journey on SkillBridge
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Quick Demo Accounts:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoCredentials('student@skillbridge.com', 'Student@123')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('instructor@skillbridge.com', 'Instructor@123')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
            >
              Instructor
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@skillbridge.com', 'Admin@123')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & terms */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
