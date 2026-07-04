import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import Login from './pages/auth/Login';
import RegisterSchool from './pages/auth/RegisterSchool';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Super Admin pages
import SuperAdminDashboard from './pages/superAdmin/Dashboard';
import SchoolList from './pages/superAdmin/SchoolList';
import SchoolDetails from './pages/superAdmin/SchoolDetails';

// School Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import TeacherList from './pages/admin/TeacherList';
import TeacherForm from './pages/admin/TeacherForm';
import TeacherDetails from './pages/admin/TeacherDetails';
import StudentList from './pages/admin/StudentList';
import StudentForm from './pages/admin/StudentForm';
import StudentDetails from './pages/admin/StudentDetails';
import AdminAttendance from './pages/admin/AdminAttendance';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import TeacherAttendance from './pages/teacher/TeacherAttendance';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/StudentAttendance';

// Loader
import Loader from './components/common/Loader';

const App = () => {
  const { fetchCurrentUser, loading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (loading) {
    return <Loader fullPage={true} />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated && user ? (
              // If already logged in, redirect to correct dashboard
              user.role === 'super_admin' ? (
                <Navigate to="/super-admin/dashboard" replace />
              ) : user.role === 'school_admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user.role === 'teacher' ? (
                <Navigate to="/teacher/dashboard" replace />
              ) : (
                <Navigate to="/student/dashboard" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route path="/school/register" element={<RegisterSchool />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Root Route Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Dashboard Shell Routes */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin', 'school_admin', 'teacher', 'student']} />}>
          <Route element={<DashboardLayout />}>
            
            {/* Super Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/schools" element={<SchoolList />} />
              <Route path="/super-admin/schools/:id" element={<SchoolDetails />} />
            </Route>

            {/* School Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['school_admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/teachers" element={<TeacherList />} />
              <Route path="/admin/teachers/add" element={<TeacherForm />} />
              <Route path="/admin/teachers/:id" element={<TeacherDetails />} />
              <Route path="/admin/students" element={<StudentList />} />
              <Route path="/admin/students/add" element={<StudentForm />} />
              <Route path="/admin/students/:id" element={<StudentDetails />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
            </Route>

            {/* Teacher Routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/attendance/mark" element={<MarkAttendance />} />
              <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
            </Route>

          </Route>
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
