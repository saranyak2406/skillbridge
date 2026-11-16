import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, ArrowLeft, ExternalLink, Award, Loader2, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const SubmissionGrading = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSubmissions = () => {
    api.get('/dashboard/instructor')
      .then((res) => {
        setSubmissions(res.data.data.pending_submissions || []);
      })
      .catch((err) => console.error('Failed to load instructor submissions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub || marks === '') return;

    setSaving(true);
    try {
      await api.patch(`/assignments/submissions/${selectedSub.id}/grade`, {
        marks: parseFloat(marks),
        feedback,
      });
      setSelectedSub(null);
      setMarks('');
      setFeedback('');
      loadSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Student Submissions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      
      <div>
        <Link
          to="/instructor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Instructor Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Student Submissions Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review uploaded files, assign marks, and provide constructive guidance to your students.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Submissions Queue</h2>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {submissions.length} Awaiting Review
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{sub.student_name}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Assignment: {sub.assignment_title}</p>
                  <p className="text-[11px] text-slate-400">Course: {sub.course_title} • Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedSub(sub);
                      setMarks('');
                      setFeedback('');
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    Grade Submission
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">All Caught Up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending student assignments require evaluation right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* GRADING MODAL */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Grade: {selectedSub.student_name}
              </h3>
              <p className="text-xs text-slate-500">{selectedSub.assignment_title}</p>
            </div>

            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Score / Marks Awarded *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Written Feedback</label>
                <textarea
                  rows="3"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Highlight strengths, architecture clarity, or areas for improvement..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubmissionGrading;

