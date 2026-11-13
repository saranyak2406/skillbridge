import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  PlayCircle, 
  Award, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Layers,
  Code2,
  Brain,
  Smartphone,
  Cloud,
  Palette,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const categories = [
    { name: 'Web Development', count: '45+ Courses', icon: Code2, color: 'text-blue-600 bg-blue-50' },
    { name: 'Data Science & AI', count: '38+ Courses', icon: Brain, color: 'text-purple-600 bg-purple-50' },
    { name: 'Mobile App Dev', count: '29+ Courses', icon: Smartphone, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Cloud & DevOps', count: '24+ Courses', icon: Cloud, color: 'text-amber-600 bg-amber-50' },
    { name: 'UI/UX Design', count: '19+ Courses', icon: Palette, color: 'text-rose-600 bg-rose-50' },
    { name: 'Cyber Security', count: '16+ Courses', icon: ShieldAlert, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const featuredCourses = [
    {
      id: 1,
      title: 'Full Stack Modern Web Architecture with React & Node.js',
      instructor: 'Dr. Sarah Mitchell',
      category: 'Web Development',
      rating: 4.9,
      reviewsCount: 340,
      duration: '42 hours',
      level: 'Intermediate',
      price: '$49.99',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Applied Machine Learning & Neural Networks in Python',
      instructor: 'Prof. David Chen',
      category: 'Data Science & AI',
      rating: 4.8,
      reviewsCount: 285,
      duration: '38 hours',
      level: 'Advanced',
      price: '$59.99',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      title: 'Cloud Infrastructure & Kubernetes DevOps Bootcamp',
      instructor: 'Elena Rostova',
      category: 'Cloud & DevOps',
      rating: 4.9,
      reviewsCount: 198,
      duration: '30 hours',
      level: 'Intermediate',
      price: '$44.99',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const testimonials = [
    {
      quote: "SkillBridge transformed my programming skills. The quizzes and hands-on assignments pushed me from reading theory to actually building scalable apps.",
      author: "Marcus Vance",
      role: "Frontend Engineer at TechCorp",
      avatar: "M",
    },
    {
      quote: "As an instructor, the course builder and student evaluation tools give me everything I need to organize curriculum and track student progress.",
      author: "Dr. Sarah Mitchell",
      role: "Senior Cloud Architect & Instructor",
      avatar: "S",
    },
    {
      quote: "The verified certificates and portfolio projects were instrumental during my job interviews. Highly recommended platform!",
      author: "Priya Sharma",
      role: "Full Stack Developer",
      avatar: "P",
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Industry-Level Online Learning & Skill Development
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Learn New Skills. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Build Your Future.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                SkillBridge connects ambitious students with verified expert instructors. Stream video lessons, complete graded assignments, conquer timed quizzes, and earn industry-recognized credentials.
              </p>

              {/* Search Courses Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg mx-auto lg:mx-0">
                <div className="relative flex items-center shadow-lg shadow-slate-200/50 rounded-2xl bg-white border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-blue-600 transition">
                  <Search className="h-5 w-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, skills, or topics..."
                    className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition"
                >
                  Explore All Courses <ArrowRight className="h-4 w-4" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition"
                  >
                    Join as Student or Instructor
                  </Link>
                )}
              </div>

              {/* Quick Trust Checks */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free & Paid Courses</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verifiable Certificates</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time Quizzes</span>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80"
                    alt="Students collaborating"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 text-white text-xs font-bold backdrop-blur-sm">
                      <PlayCircle className="h-3.5 w-3.5" /> Interactive Lessons
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Featured Path</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" /> 4.9 (1.2k reviews)
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base leading-snug">
                    Full-Stack Software Engineering Career Track
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>12 Modules • 140 Lessons</span>
                    <span className="font-extrabold text-slate-900 text-sm">$89.99</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-blue-400">12,500+</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">Active Students</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-400">250+</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">Accredited Courses</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">98%</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">Quiz Pass Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-purple-400">8,900+</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">Certificates Issued</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Domains</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Explore Top Categories</h2>
          </div>
          <Link to="/categories" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 mt-2 sm:mt-0 flex items-center gap-1">
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card hover:border-blue-200 transition group flex flex-col items-center text-center"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition ${cat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{cat.name}</h3>
                <span className="text-xs text-slate-400 font-medium mt-1">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Handpicked</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Featured Courses</h2>
          </div>
          <Link to="/courses" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 mt-2 sm:mt-0 flex items-center gap-1">
            Browse All Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden hover:shadow-hover transition duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-video overflow-hidden">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
                    {c.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-2">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{c.rating}</span>
                    <span className="text-slate-400">({c.reviewsCount} reviews)</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500">Instructor: <span className="font-semibold text-slate-700">{c.instructor}</span></p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold">{c.level}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">{c.price}</span>
                <Link
                  to={`/courses/${c.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE SKILLBRIDGE */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Why Choose SkillBridge</h2>
            <p className="text-sm text-slate-600 mt-2">
              We engineered a complete pedagogy that balances high-definition lessons with hands-on practice and automated evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Timed Quizzes with Immediate Grading</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Evaluate your mastery with timed multiple-choice assessments calculated directly on our backend to avoid client manipulation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verifiable Digital Certificates</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Upon meeting course requirements, unlock cryptographically verifiable certificates with unique serial numbers for your resume.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hands-on Assignment Submissions</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Submit project files and code solutions for direct instructor evaluation, qualitative feedback, and grade tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Loved by Students & Mentors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.author}</h4>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl shadow-blue-500/15">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Accelerate Your Career?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Join SkillBridge today. Gain unlimited access to high-demand skills, build real projects, and earn verified certificates.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm shadow hover:bg-slate-50 transition"
            >
              Get Started for Free
            </Link>
            <Link
              to="/register?role=instructor"
              className="px-6 py-3 rounded-xl bg-blue-700/50 hover:bg-blue-700 text-white font-bold text-sm border border-white/20 transition"
            >
              Teach on SkillBridge
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

