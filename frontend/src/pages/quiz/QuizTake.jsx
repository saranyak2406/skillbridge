import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Timer, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Award,
  AlertCircle,
  Loader2,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';

const QuizTake = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptState, setAttemptState] = useState('intro'); // 'intro', 'taking', 'results'
  const [attemptId, setAttemptId] = useState(null);

  // Active quiz session states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: option_id }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);

  // Results state
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/${quizId}`)
      .then((res) => {
        const q = res.data.data.quiz;
        setQuiz(q);
        setTimeLeft((q.duration || 15) * 60);
      })
      .catch((err) => {
        console.error('Failed to load quiz:', err);
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (attemptState !== 'taking') return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptState, timeLeft]);

  const handleStartQuiz = async () => {
    try {
      const res = await api.post(`/quizzes/${quizId}/attempts`);
      setAttemptId(res.data.data.attempt.id);
      setAttemptState('taking');
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start quiz attempt.');
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const answersArray = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        question_id: parseInt(qId, 10),
        selected_option_id: optId,
      }));

      await api.post(`/quiz-attempts/${attemptId}/submit`, {
        answers: answersArray,
      });

      // Fetch detailed results with breakdown
      const resultRes = await api.get(`/quiz-attempts/${attemptId}/results`);
      setResultData(resultRes.data.data);
      setAttemptState('results');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to evaluate quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Examination...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Quiz Not Found</h2>
        <Link to={`/learn/${courseId}`} className="text-blue-600 hover:underline mt-2 inline-block">
          Return to Course
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      
      {/* 1. INTRO SCREEN */}
      {attemptState === 'intro' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-12 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
            <HelpCircle className="h-8 w-8" />
          </div>

          <div className="max-w-lg mx-auto">
            <span className="text-xs uppercase font-extrabold text-purple-600 tracking-wider">
              Examination Module
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {quiz.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              {quiz.description || 'Test your understanding of the core concepts taught in this course module.'}
            </p>
          </div>

          {/* Exam Rules Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto pt-2 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-semibold">Total Questions</span>
              <span className="text-lg font-bold text-slate-900">{totalQuestions} Questions</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-semibold">Time Limit</span>
              <span className="text-lg font-bold text-slate-900">{quiz.duration} Minutes</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-semibold">Passing Benchmark</span>
              <span className="text-lg font-bold text-emerald-600">{quiz.passing_score}% Score</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/learn/${courseId}`}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancel & Return to Lessons
            </Link>
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2"
            >
              Start Examination Now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TAKING EXAMINATION */}
      {attemptState === 'taking' && currentQ && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 space-y-8">
          
          {/* Top Exam Navigation Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <div className="text-xs text-slate-500 font-medium">
                {answeredCount} of {totalQuestions} answered
              </div>
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold ${
              timeLeft < 120 ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-800'
            }`}>
              <Timer className="h-4 w-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question_text}
            </h2>

            {/* Answer Options Radio List */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-xs sm:text-sm">{opt.option_text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Navigator Pill Matrix */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Question Navigator:
            </span>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-8 w-8 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                      isCurrent
                        ? 'ring-2 ring-purple-600 bg-purple-600 text-white'
                        : isAnswered
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1.5"
              >
                Next Question <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    Submit Examination <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

      {/* 3. EXAMINATION RESULTS SCREEN */}
      {attemptState === 'results' && resultData && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-12 space-y-8">
          
          {/* Result Banner */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
              resultData.attempt.status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {resultData.attempt.status === 'passed' ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <XCircle className="h-8 w-8" />
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              {resultData.attempt.status === 'passed' ? 'Congratulations! You Passed!' : 'Passing Score Not Met'}
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {resultData.attempt.status === 'passed'
                ? 'Your knowledge of this module meets the mastery benchmark for certification.'
                : 'Review the lessons and re-attempt the examination to fulfill certification requirements.'}
            </p>

            <div className="pt-2">
              <span className="text-4xl font-black text-slate-900">
                {Math.round(resultData.attempt.score)}%
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Passing Requirement: {resultData.attempt.passing_score}%
              </span>
            </div>
          </div>

          {/* Breakdown Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Examination Answer Review
            </h3>

            <div className="space-y-4">
              {resultData.questions_breakdown?.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    q.is_correct ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {q.is_correct ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs font-bold text-slate-900">
                        {idx + 1}. {q.question_text}
                      </p>
                      <div className="text-[11px] space-y-1">
                        <p className={q.is_correct ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          Your answer: {q.selected_option_text || 'No answer submitted'}
                        </p>
                        {!q.is_correct && (
                          <p className="text-emerald-800 font-semibold">
                            Correct answer: {q.correct_option_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              to={`/learn/${courseId}`}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Return to Classroom
            </Link>
            <button
              onClick={() => setAttemptState('intro')}
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retake Examination
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default QuizTake;

