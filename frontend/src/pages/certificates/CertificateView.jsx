import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Award, 
  Download, 
  Printer, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  GraduationCap, 
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../../services/api';

const CertificateView = () => {
  const { certificateNumber } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/certificates/verify/${certificateNumber}`)
      .then((res) => {
        setCert(res.data.data.certificate);
      })
      .catch((err) => {
        console.error('Failed to verify certificate:', err);
      })
      .finally(() => setLoading(false));
  }, [certificateNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (cert) {
      window.open(`http://localhost:5000/api/certificates/${cert.id}/download`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Verifying Credential on Blockchain & Database...</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Award className="h-16 w-16 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Invalid Credential</h2>
        <p className="text-xs text-slate-500">
          No verified certificate matches credential ID "{certificateNumber}".
        </p>
        <Link to="/" className="inline-block text-xs font-bold text-blue-600 hover:underline">
          Return to SkillBridge Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      
      {/* Top action controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print Certificate
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Verification status pill */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-2 rounded-2xl print:hidden">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Cryptographically Verified Certificate • Credential Serial: {cert.certificate_number}</span>
      </div>

      {/* CERTIFICATE CANVAS */}
      <div className="relative bg-white border-8 border-slate-900 p-8 sm:p-14 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Double Inner Gold/Navy Border */}
        <div className="absolute inset-3 border-2 border-blue-600/40 rounded-2xl pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-6">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                Skill<span className="text-blue-600">Bridge</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 block tracking-widest uppercase">
                Online Learning & Skill Development
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.25em] block">
              Certificate of Achievement
            </span>
            <div className="h-1 w-16 bg-blue-600 mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Student Recipient */}
          <div className="pt-4 space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">This credential is proudly awarded to</p>
            <h1 className="text-3xl sm:text-5xl font-black text-blue-600 tracking-tight font-serif italic">
              {cert.student_name}
            </h1>
          </div>

          {/* Course Details */}
          <div className="max-w-2xl mx-auto pt-2 space-y-2">
            <p className="text-xs sm:text-sm text-slate-500">
              for successfully completing all curriculum lectures, quizzes, and project assessments in
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {cert.course_title}
            </h2>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 items-end max-w-3xl mx-auto border-t border-slate-100">
            {/* Instructor Signature */}
            <div className="text-center sm:text-left space-y-1">
              <div className="text-base font-serif italic text-slate-800 font-bold border-b border-slate-300 pb-1">
                {cert.instructor_name}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Lead Course Instructor
              </p>
            </div>

            {/* Official Seal Emblem */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white">
                <Award className="h-9 w-9" />
              </div>
              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest mt-1">
                Verified Credential
              </span>
            </div>

            {/* Date & Serial */}
            <div className="text-center sm:text-right space-y-1">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-300 pb-1">
                {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {cert.certificate_number}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CertificateView;

