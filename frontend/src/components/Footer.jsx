import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Skill<span className="text-blue-500">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              SkillBridge connects learners with industry-leading mentors. Learn practical, high-demand skills, complete real projects, and earn accredited credentials.
            </p>
            <div className="text-xs text-slate-400 space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" /> support@skillbridge.edu
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" /> +1 (800) 555-SKILL
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/courses" className="hover:text-blue-400 transition">Browse Courses</Link></li>
              <li><Link to="/categories" className="hover:text-blue-400 transition">Popular Categories</Link></li>
              <li><Link to="/register?role=instructor" className="hover:text-blue-400 transition">Teach on SkillBridge</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-400 transition">Plans & Pricing</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Domains</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/courses?category=web-dev" className="hover:text-blue-400 transition">Web Development</Link></li>
              <li><Link to="/courses?category=ai-ml" className="hover:text-blue-400 transition">Data Science & AI</Link></li>
              <li><Link to="/courses?category=cloud" className="hover:text-blue-400 transition">Cloud & DevOps</Link></li>
              <li><Link to="/courses?category=security" className="hover:text-blue-400 transition">Cyber Security</Link></li>
            </ul>
          </div>

          {/* Legal / Trust */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Trust & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#terms" className="hover:text-blue-400 transition">Terms of Service</a></li>
              <li><a href="#privacy" className="hover:text-blue-400 transition">Privacy Policy</a></li>
              <li><a href="#certificates" className="hover:text-blue-400 transition">Certificate Verification</a></li>
              <li><a href="#security" className="hover:text-blue-400 transition">Security Standards</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillBridge Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with dedication for ambitious learners worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
