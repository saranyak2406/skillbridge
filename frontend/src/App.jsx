import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public & Auth Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';

// Course Pages
import CourseList from './pages/courses/CourseList';
import CourseDetail from './pages/courses/CourseDetail';

// Learning & Assessment Pages
import LearningInterface from './pages/learn/LearningInterface';
import QuizTake from './pages/quiz/QuizTake';
import AssignmentView from './pages/assignments/AssignmentView';
import CertificateView from './pages/certificates/CertificateView';

// Role Dashboards
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Instructor Studio Pages
import CourseCreate from './pages/instructor/CourseCreate';
import CurriculumBuilder from './pages/instructor/CurriculumBuilder';
import SubmissionGrading from './pages/instructor/SubmissionGrading';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/categories" element={<CourseList />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public Verifiable Certificate Route */}
              <Route path="/certificates/:certificateNumber" element={<CertificateView />} />

              {/* Authenticated User Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Student Portal & Learning Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/:courseId"
                element={
                  <ProtectedRoute>
                    <LearningInterface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/:courseId/quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <QuizTake />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/:courseId/assignment/:assignmentId"
                element={
                  <ProtectedRoute>
                    <AssignmentView />
                  </ProtectedRoute>
                }
              />

              {/* Instructor Studio Routes */}
              <Route
                path="/instructor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/courses/new"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <CourseCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/courses/:id/curriculum"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <CurriculumBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/submissions"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <SubmissionGrading />
                  </ProtectedRoute>
                }
              />

              {/* Admin Console Route */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
