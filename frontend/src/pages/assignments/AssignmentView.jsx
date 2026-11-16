import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AssignmentView = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const loadAssignment = () => {
    api.get(`/assignments/${assignmentId}`)
      .then((res) => setAssignment(res.data.data.assignment))
      .catch((err) => console.error('Failed to load assignment:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFeedbackMsg({ type: 'error', text: 'Please select a file to submit.' });
      return;
    }

    setSubmitting(true);
    setFeedbackMsg(null);

    const formData = new FormData();
    formData.append('submission_file', file);

    try {
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFeedbackMsg({ type: 'success', text: 'Assignment submitted successfully!' });
      loadAssignment();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit assignment.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Assignment Instructions...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Assignment Not Found</h2>
        <Link to={`/learn/${courseId}`} className="text-blue-600 hover:underline mt-2 inline-block">
          Return to Course
        </Link>
      </div>
    );
  }

  const submission = assignment.my_submission;
  const isGraded = submission?.status === 'graded';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/learn/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Classroom
        </Link>
      </div>

      {/* Main Assignment Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-10 space-y-6">
        
        {/* Title & Metadata */}
        <div>
          <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">
            Capstone Project Assessment
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {assignment.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Course: {assignment.course_title}</p>
        </div>

        {/* Due Date & Marks Pill */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span>Due Date: {new Date(assignment.due_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Award className="h-4 w-4 text-amber-500" />
            <span>Total Marks: {assignment.total_marks} pts</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Assignment Instructions & Deliverables
          </h3>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {assignment.description}
          </div>
        </div>

        {/* Feedback Alert if Graded */}
        {isGraded && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Grade Awarded
              </span>
              <span className="text-xl font-black text-emerald-950">
                {submission.marks} / {assignment.total_marks} Marks
              </span>
            </div>
            {submission.feedback && (
              <div className="text-xs text-emerald-900 border-t border-emerald-200/60 pt-3">
                <strong className="block text-[11px] uppercase tracking-wider mb-1">Instructor Feedback:</strong>
                "{submission.feedback}"
              </div>
            )}
          </div>
        )}

        {/* Submission Upload Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {submission ? 'Update or Re-submit Deliverables' : 'Upload Submission Deliverable'}
          </h3>

          {feedbackMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-medium ${
              feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedbackMsg.text}
            </div>
          )}

          {submission && !isGraded && (
            <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              <span className="font-semibold">Current Submission: Submitted on {new Date(submission.submitted_at).toLocaleString()}</span>
              <a href={submission.file_url} target="_blank" rel="noreferrer" className="font-bold underline flex items-center gap-1">
                View File <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition bg-slate-50/50">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 mb-1">
                {file ? file.name : 'Choose a file or drag and drop here'}
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Accepts PDF, ZIP, RAR, Word (.docx) up to 50MB
              </p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition inline-block"
              >
                Browse File
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !file}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading & Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> {submission ? 'Re-submit Assignment' : 'Submit Assignment'}
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default AssignmentView;

