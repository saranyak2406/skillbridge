import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  FileText, 
  Award, 
  ArrowLeft, 
  Menu, 
  X,
  Loader2,
  Sparkles,
  Download,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LearningInterface = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [togglingCompletion, setTogglingCompletion] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  // Fetch course & student's progress
  const loadData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/courses/${courseId}`),
      ]);

      const courseData = courseRes.data.data.course;
      setCourse(courseData);
      setProgressData(progressRes.data.data);

      // Set initial active lesson if none selected
      if (!activeLesson && courseData.sections && courseData.sections.length > 0) {
        const firstSec = courseData.sections[0];
        if (firstSec.lessons && firstSec.lessons.length > 0) {
          setActiveLesson(firstSec.lessons[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  // Flattened lessons list for easy previous / next navigation
  const allLessons = course?.sections
    ? course.sections.flatMap((s) => s.lessons || [])
    : [];

  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const isLessonCompleted = progressData?.completed_lesson_ids?.includes(activeLesson?.id);

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    setTogglingCompletion(true);
    try {
      await api.post(`/progress/lessons/${activeLesson.id}/complete`, {
        is_completed: !isLessonCompleted,
      });
      // Refresh progress data
      const res = await api.get(`/progress/courses/${courseId}`);
      setProgressData(res.data.data);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    } finally {
      setTogglingCompletion(false);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentLessonIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setActiveLesson(allLessons[currentLessonIndex - 1]);
    }
  };

  const handleClaimCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await api.post('/certificates/generate', { course_id: courseId });
      const cert = res.data.data.certificate;
      navigate(`/certificates/${cert.certificate_number}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Certificate generation failed.');
    } finally {
      setGeneratingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading SkillBridge Classroom...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-800">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link to="/courses" className="text-blue-600 font-bold hover:underline mt-2">
          Return to Courses
        </Link>
      </div>
    );
  }

  const quiz = course.quizzes && course.quizzes.length > 0 ? course.quizzes[0] : null;
  const assignment = course.assignments && course.assignments.length > 0 ? course.assignments[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      
      {/* Top Learning Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${courseId}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Course Overview
          </Link>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-xs font-semibold text-slate-200 truncate max-w-xs sm:max-w-md hidden sm:inline">
            {course.title}
          </span>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              {progressData?.percentage || 0}% Complete
            </span>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressData?.percentage || 0}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Classroom Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left: Video Player & Lesson Details */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          
          {/* Certificate Achieved Banner if 100% */}
          {progressData?.percentage === 100 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-amber-500/20">
              <div className="flex items-center gap-2.5">
                <Award className="h-6 w-6 text-slate-950" />
                <div>
                  <h3 className="text-sm font-black">Course Curriculum Completed!</h3>
                  <p className="text-xs text-amber-950 font-medium">You have met all lecture completion requirements.</p>
                </div>
              </div>
              <button
                onClick={handleClaimCertificate}
                disabled={generatingCert}
                className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 transition shadow"
              >
                {generatingCert ? 'Generating...' : 'Claim Digital Certificate'}
              </button>
            </div>
          )}

          {/* Video Player Container */}
          <div className="aspect-video w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl relative">
            {activeLesson?.video_url ? (
              <iframe
                src={activeLesson.video_url}
                title={activeLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <PlayCircle className="h-16 w-16 mb-2" />
                <p className="text-sm">Select a lesson from the curriculum to begin</p>
              </div>
            )}
          </div>

          {/* Lesson Controls & Completion Action */}
          <div className="max-w-5xl mx-auto w-full mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {activeLesson?.title || 'Course Lesson'}
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleComplete}
                disabled={togglingCompletion || !activeLesson}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                  isLessonCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                }`}
              >
                {togglingCompletion ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLessonCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Completed
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" /> Mark as Completed
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex <= 0}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition"
                  title="Previous Lesson"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex >= allLessons.length - 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition"
                  title="Next Lesson"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Overview & Resources */}
          <div className="max-w-5xl mx-auto w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Lesson Notes</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {activeLesson?.description || 'Follow along with the video lecture. Code examples and architectural blueprints are provided in the resources section.'}
              </p>
            </div>

            {/* Assessment Quick Shortcuts */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Assessments</h3>
              
              {quiz && (
                <Link
                  to={`/learn/${courseId}/quiz/${quiz.id}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-400 transition">
                        {quiz.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{quiz.duration} min timed quiz</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400" />
                </Link>
              )}

              {assignment && (
                <Link
                  to={`/learn/${courseId}/assignment/${assignment.id}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                        {assignment.title}
                      </div>
                      <div className="text-[10px] text-slate-400">Capstone Project Submission</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" />
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar: Curriculum Drawer */}
        {sidebarOpen && (
          <aside className="w-full lg:w-96 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Course Curriculum</h3>
                <p className="text-[11px] text-slate-400">
                  {progressData?.completed_lessons_count || 0} of {allLessons.length} lessons completed
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {course.sections && course.sections.map((section, sIdx) => (
                <div key={section.id} className="py-2">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    {section.section_title}
                  </div>
                  <div className="mt-1">
                    {section.lessons && section.lessons.map((lesson) => {
                      const isCompleted = progressData?.completed_lesson_ids?.includes(lesson.id);
                      const isSelected = activeLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-500 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{lesson.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{lesson.duration || '10 mins'}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default LearningInterface;

