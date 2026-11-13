import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, BookOpen, Briefcase, Award, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  // Student
  const [education, setEducation] = useState(user?.profile?.education || 'Undergraduate Degree');
  const [interests, setInterests] = useState(user?.profile?.interests || '');
  // Instructor
  const [expertise, setExpertise] = useState(user?.profile?.expertise || '');
  const [experience, setExperience] = useState(user?.profile?.experience || '3-5 Years');
  const [qualifications, setQualifications] = useState(user?.profile?.qualifications || '');

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      full_name: fullName,
      bio,
      ...(user.role === 'student' ? { education, interests } : { expertise, experience, qualifications }),
    };

    const result = await updateProfile(payload);
    setIsSaving(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setStatusMessage({ type: 'error', text: result.message || 'Failed to update profile.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 flex items-end">
          <div className="translate-y-1/2 flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-white shadow-md">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* Profile Header Details */}
        <div className="pt-14 pb-6 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{user.full_name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : user.role === 'instructor'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Shield className="h-3.5 w-3.5" /> Role: {user.role}
            </span>
          </div>
        </div>

        {/* Alert Feedback */}
        {statusMessage && (
          <div className="mx-8 mt-6">
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              {statusMessage.text}
            </div>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-sm cursor-not-allowed"
              />
            </div>

            {/* Role-Specific Fields */}
            {user.role === 'instructor' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Expertise
                  </label>
                  <input
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Cloud Architecture & Microservices"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  >
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Qualifications & Certifications
                  </label>
                  <input
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. M.S. Software Engineering, AWS Certified"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  />
                </div>
              </>
            ) : user.role === 'student' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Education Level
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  >
                    <option value="High School">High School</option>
                    <option value="Undergraduate Degree">Undergraduate Degree</option>
                    <option value="Graduate / Master's">Graduate / Master's</option>
                    <option value="Self-Taught Developer">Self-Taught Developer</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Interests & Goals
                  </label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. React, Cloud, Python, Full Stack"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </>
            ) : null}

            {/* Bio textarea */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                About / Bio
              </label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others a bit about your background and goals..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
