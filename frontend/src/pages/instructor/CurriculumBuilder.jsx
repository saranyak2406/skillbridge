import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Trash2, 
  PlayCircle, 
  HelpCircle, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../services/api';

const CurriculumBuilder = () => {
  const { id: courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & form toggles
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15 mins');
  const [lessonDesc, setLessonDesc] = useState('');

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState(15);
  const [quizPassScore, setQuizPassScore] = useState(70);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentMarks, setAssignmentMarks] = useState(100);

  const loadCourse = () => {
    api.get(`/courses/${courseId}`)
      .then((res) => setCourse(res.data.data.course))
      .catch((err) => console.error('Failed to load course:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Create Section
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle) return;
    try {
      await api.post(`/courses/${courseId}/sections`, {
        section_title: newSectionTitle,
      });
      setNewSectionTitle('');
      setShowSectionModal(false);
      loadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create section.');
    }
  };

  // Create Lesson
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle || !selectedSectionId) return;
    try {
      await api.post(`/sections/${selectedSectionId}/lessons`, {
        title: lessonTitle,
        video_url: lessonVideo || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: lessonDuration,
        description: lessonDesc,
      });
      setLessonTitle('');
      setLessonVideo('');
      setLessonDesc('');
      setShowLessonModal(false);
      loadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create lesson.');
    }
  };

  // Create Quiz
  const handleAddQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle) return;
    try {
      await api.post('/quizzes', {
        course_id: courseId,
        title: quizTitle,
        duration: quizDuration,
        passing_score: quizPassScore,
        questions: [
          {
            question_text: 'Sample comprehension question for this module?',
            marks: 1,
            options: [
              { option_text: 'Correct Option', is_correct: true },
              { option_text: 'Incorrect Option A', is_correct: false },
              { option_text: 'Incorrect Option B', is_correct: false },
              { option_text: 'Incorrect Option C', is_correct: false },
            ],
          },
        ],
      });
      setQuizTitle('');
      setShowQuizModal(false);
      loadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  // Create Assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentTitle || !assignmentDesc) return;
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

      await api.post('/assignments', {
        course_id: courseId,
        title: assignmentTitle,
        description: assignmentDesc,
        due_date: dueDate.toISOString(),
        total_marks: assignmentMarks,
      });
      setAssignmentTitle('');
      setAssignmentDesc('');
      setShowAssignmentModal(false);
      loadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Course Curriculum Editor...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/instructor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Instructor Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Curriculum Builder: <span className="text-indigo-600">{course.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize modules, upload video lectures, design examinations, and manage student assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Preview Course
          </Link>
          <button
            onClick={() => setShowSectionModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <PlusCircle className="h-4 w-4" /> Add Section
          </button>
        </div>
      </div>

      {/* Curriculum Sections List */}
      <div className="space-y-6">
        {course.sections && course.sections.length > 0 ? (
          course.sections.map((section, idx) => (
            <div key={section.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
              <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-800">{section.section_title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setShowLessonModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-bold text-xs transition"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Add Lesson
                  </button>
                </div>
              </div>

              {/* Lessons inside Section */}
              <div className="divide-y divide-slate-100 p-4">
                {section.lessons && section.lessons.length > 0 ? (
                  section.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{lesson.title}</p>
                          <p className="text-[10px] text-slate-400">{lesson.duration || '10 mins'} • {lesson.video_url}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs text-slate-400">
                    No lessons in this section yet. Click "+ Add Lesson" to add lecture videos.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <h3 className="text-base font-bold text-slate-800">No Sections Added Yet</h3>
            <p className="text-xs text-slate-500">
              Every course begins with curriculum sections. Click below to add your first module.
            </p>
            <button
              onClick={() => setShowSectionModal(true)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
            >
              Add Section Now
            </button>
          </div>
        )}
      </div>

      {/* Quizzes & Assignments Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        
        {/* Quizzes Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Module Quizzes</h3>
            </div>
            <button
              onClick={() => setShowQuizModal(true)}
              className="text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              + Create Quiz
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {course.quizzes && course.quizzes.length > 0 ? (
              course.quizzes.map((q) => (
                <div key={q.id} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{q.title}</span>
                  <span className="text-slate-400">{q.duration} mins • Pass: {q.passing_score}%</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 py-3">No quizzes created for this course yet.</p>
            )}
          </div>
        </div>

        {/* Assignments Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Course Assignments</h3>
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + Create Assignment
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {course.assignments && course.assignments.length > 0 ? (
              course.assignments.map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{a.title}</span>
                  <span className="text-slate-400">{a.total_marks} Marks</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 py-3">No assignments created for this course yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Curriculum Section</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                <input
                  type="text"
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Section 2: Data Persistence & PostgreSQL"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD LESSON */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Video Lesson</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. 4. Building Parameterized REST Endpoints"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Stream / Embed URL</label>
                <input
                  type="text"
                  value={lessonVideo}
                  onChange={(e) => setLessonVideo(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/embed/..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="e.g. 20 mins"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Description / Notes</label>
                <textarea
                  rows="2"
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="Briefly explain what is demonstrated in this video lecture..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD QUIZ */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Multiple-Choice Quiz</h3>
            <form onSubmit={handleAddQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title *</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Module 1 Knowledge Check"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passing %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={quizPassScore}
                    onChange={(e) => setQuizPassScore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD ASSIGNMENT */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Capstone Assignment</h3>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Build an Authenticated CRUD API"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  min="10"
                  value={assignmentMarks}
                  onChange={(e) => setAssignmentMarks(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deliverable Instructions</label>
                <textarea
                  rows="3"
                  required
                  value={assignmentDesc}
                  onChange={(e) => setAssignmentDesc(e.target.value)}
                  placeholder="Explain exactly what the student should code, test, and upload..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CurriculumBuilder;
