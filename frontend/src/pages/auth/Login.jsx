import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import FormInput from '../../components/common/FormInput';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Clear global auth errors when entering login page
  useEffect(() => {
    clearError();
  }, [clearError]);

  // If already logged in, redirect to correct dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectUser = (role) => {
    switch (role) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const loggedUser = await login(formData.email, formData.password);
      redirectUser(loggedUser.role);
    } catch (err) {
      setApiError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-850 to-primary-950 p-4 font-sans select-none">
      {/* Background blobs for premium glassmorphism feel */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl" />

      {/* Main glass box */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl p-8 overflow-hidden z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary-500/20">
            <BookOpen size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Access the School ERP Portal</p>
        </div>

        {/* Auth Error Notification */}
        {(apiError || authError) && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-2xl text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>{apiError || authError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g. name@school.com"
            error={errors.email}
            icon={Mail}
            required
          />

          <div className="relative w-full">
            <FormInput
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              error={errors.password}
              icon={Lock}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-9.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 btn-transition bounce-hover"
          >
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            Don't have a school account?{' '}
            <Link
              to="/school/register"
              className="text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-4"
            >
              Register School
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
