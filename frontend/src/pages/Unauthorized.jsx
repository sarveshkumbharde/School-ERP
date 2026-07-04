import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleBackToDashboard = () => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    switch (user.role) {
      case 'super_admin':
        navigate('/super-admin/dashboard', { replace: true });
        break;
      case 'school_admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'teacher':
        navigate('/teacher/dashboard', { replace: true });
        break;
      case 'student':
        navigate('/student/dashboard', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 p-4 font-sans select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          You do not have the required permissions to access this page. This action has been logged for security audits.
        </p>

        <button
          onClick={handleBackToDashboard}
          className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 inline-flex items-center justify-center gap-2 btn-transition bounce-hover"
        >
          <ArrowLeft size={16} />
          Go to My Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
