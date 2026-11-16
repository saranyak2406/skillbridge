import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  PlayCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  FileText, 
  Award, 
  Lock, 
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    // 1. Fetch Course details
    api.get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data.data.course);
      })
      .catch((err) => {
        console.error('Failed to load course details:', err);
      })
      .finally(() => setLoading(false));

    // 2. Check if student is already enrolled
    if (isAuthenticated) {
      api.get('/enrollments/my-courses')
        .then((res) => {
          const myCourses = res.data.data.courses || [];
          const found = myCourses.some((c) => parseInt(c.course_id, 10) === parseInt(id, 10));
          setIsEnrolled(found);
        })
        .catch(() => {});
    }
  }, [id, isAuthenticated]);

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enrollments', { course_id: id });
      setIsEnrolled(true);
      navigate(`/learn/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      await api.post('/reviews', {
        course_id: id,
        rating,
        review_text: reviewText,
      });
      setReviewMsg({ type: 'success', text: 'Thank you! Your review has been published.' });
      setReviewText('');

      // Refresh reviews list
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data.course);
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit review.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading course curriculum and reviews...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <Link to="/courses" className="mt-4 inline-block text-blue-600 font-bold hover:underline">
          Return to course catalog
        </Link>
      </div>
    );
  }

  const totalLessonsCount = course.sections
    ? course.sections.reduce((acc, s) => acc + (s.lessons ? s.lessons.length : 0), 0)
    : 0;

  return (
    <div className="space-y-12 pb-20">
      
      {/* Course Header Banner */}
      <section className="bg-slate-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  {course.category_name || 'Development'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-slate-800 text-slate-300">
                  {course.difficulty_level} Level
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{Number(course.average_rating || 5.0).toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({course.reviews_count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>{course.total_enrolled || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>{course.duration || '10 hours'}</span>
                </div>
              </div>

              {/* Instructor snippet */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800 text-xs">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                  {course.instructor_name ? course.instructor_name.charAt(0) : 'I'}
                </div>
                <div>
                  <p className="font-bold text-slate-200">Instructor: {course.instructor_name}</p>
                  <p className="text-slate-400">{course.instructor_expertise || 'Senior Software Engineer'}</p>
                </div>
              </div>
            </div>

            {/* Course Card Preview (Right side) */}
            <div className="lg:col-span-4 bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 mb-6">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg">
                    <PlayCircle className="h-7 w-7" />
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-950">
                  {parseFloat(course.price) === 0 ? 'Free' : `$${parseFloat(course.price).toFixed(2)}`}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Full Lifetime Access
                </span>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/learn/${course.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  <PlayCircle className="h-4 w-4" /> Go to Classroom
                </Link>
              ) : (
                <button
                  onClick={handleEnrollment}
                  disabled={enrolling}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-600/25 disabled:opacity-50"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enrolling...
                    </>
                  ) : (
                    <>
                      Enroll Now <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              <div className="mt-6 space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {totalLessonsCount} high-definition video lessons
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Interactive examination & quizzes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-world capstone assignments
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verifiable digital certificate
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Course Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Curriculum, Quizzes, Assignments, Reviews */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* 1. Course Curriculum */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Course Curriculum</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {course.sections?.length || 0} Sections • {totalLessonsCount} Lessons • {course.duration} Total
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, idx) => (
                  <div key={section.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setActiveSection(activeSection === idx ? -1 : idx)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-800">{section.section_title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{section.lessons?.length || 0} lessons</span>
                        {activeSection === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {activeSection === idx && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {section.lessons && section.lessons.length > 0 ? (
                          section.lessons.map((lesson, lIdx) => (
                            <div key={lesson.id} className="p-3.5 px-6 flex items-center justify-between hover:bg-slate-50/50">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-4 w-4 text-blue-600 shrink-0" />
                                <span className="text-xs font-semibold text-slate-700">{lesson.title}</span>
                              </div>
                              <span className="text-[11px] text-slate-400">{lesson.duration || '10 mins'}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No lessons listed in this section yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Curriculum is currently being drafted by the instructor.</p>
              )}
            </div>
          </div>

          {/* 2. Quizzes & Assignments Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Interactive Examination</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Includes automated multiple-choice assessments with immediate scoring and passing benchmarks.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-600">
                {course.quizzes?.length || 1} Quiz Available
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Capstone Project Assignment</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit assignments directly for personal instructor evaluation, grade marks, and feedback.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600">
                {course.assignments?.length || 1} Assignment Available
              </div>
            </div>
          </div>

          {/* 3. Student Reviews & Testimonials */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">{Number(course.average_rating || 5.0).toFixed(1)}</span>
                  <span>course rating • {course.reviews?.length || 0} ratings</span>
                </div>
              </div>
            </div>

            {/* Leave Review Form (If enrolled) */}
            {isEnrolled && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Write a Review
                </h4>

                {reviewMsg && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    reviewMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {reviewMsg.text}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 font-semibold">Your Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                    className="px-3 py-1 rounded-lg border border-slate-300 text-xs bg-white font-bold text-amber-600"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value="3">⭐⭐⭐ (3 - Average)</option>
                    <option value="2">⭐⭐ (2 - Below Average)</option>
                    <option value="1">⭐ (1 - Poor)</option>
                  </select>
                </div>

                <textarea
                  rows="2"
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share how this course helped your skills..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="divide-y divide-slate-100 space-y-4">
              {course.reviews && course.reviews.length > 0 ? (
                course.reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {rev.student_name ? rev.student_name.charAt(0) : 'S'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{rev.student_name}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-9">
                      {rev.review_text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4">No student reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Instructor Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">About the Instructor</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow">
                {course.instructor_name ? course.instructor_name.charAt(0) : 'I'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{course.instructor_name}</h4>
                <p className="text-[11px] text-blue-600 font-semibold">{course.instructor_expertise || 'Senior Instructor'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {course.instructor_bio || 'Experienced educator and software engineer dedicated to building production-ready architectures and mentoring developers worldwide.'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CourseDetail;

