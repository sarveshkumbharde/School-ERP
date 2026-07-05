import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, User, Lock, Mail, Phone, MapPin, Building, Globe, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/common/FormInput';
import useAuthStore from '../../store/authStore';

const RegisterSchool = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user && user.role === 'super_admin';

  const [formData, setFormData] = useState({
    name: '',
    schoolCode: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

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
    
    // School validations
    if (!formData.name.trim()) newErrors.name = 'School name is required';
    if (!formData.schoolCode.trim()) newErrors.schoolCode = 'School code is required';
    if (!formData.email.trim()) {
      newErrors.email = 'School email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid school email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'School phone is required';
    if (!formData.address.trim()) newErrors.address = 'School address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    // Admin validations
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid admin email format';
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Admin password is required';
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters';
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
      const endpoint = isSuperAdmin ? '/schools' : '/schools/register';
      await api.post(endpoint, formData);
      if (isSuperAdmin) {
        // Super Admin gets sent back to their schools list directly
        navigate('/super-admin/schools');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'School registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-850 to-primary-950 p-4 font-sans select-none">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Onboarding Registered!</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Your registration for <span className="font-semibold text-slate-700">{formData.name}</span> has been submitted.
          </p>
          <div className="my-5 p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Approval Workflow Status:</span>
            Your school is currently set to <span className="font-semibold text-amber-600">Pending</span>. The Super Admin must approve your request before you can log in to manage your teachers and students.
          </div>
          <Link
            to="/login"
            className="w-full mt-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 text-center btn-transition bounce-hover"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Link to={isSuperAdmin ? "/super-admin/dashboard" : "/login"} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg btn-transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{isSuperAdmin ? "Onboard School" : "School Onboarding"}</h2>
              <p className="text-xs text-slate-400 font-medium">{isSuperAdmin ? "Directly onboard an approved, active school" : "Register your school and administrator account"}</p>
            </div>
          </div>
          <div className="h-10 w-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-primary-500/10">
            <School size={20} />
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
          {apiError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-755 border border-red-150 rounded-2xl text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{apiError}</p>
            </div>
          )}

          {/* Section 1: School Information */}
          <div>
            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
              School Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="School Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Oakridge Academy"
                error={errors.name}
                icon={School}
                required
              />
              <FormInput
                label="School Code (Short Code)"
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleInputChange}
                placeholder="e.g. ORA01"
                error={errors.schoolCode}
                icon={Globe}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="School Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. contact@school.com"
                error={errors.email}
                icon={Mail}
                required
              />
              <FormInput
                label="School Contact Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1 555-0199"
                error={errors.phone}
                icon={Phone}
                required
              />
            </div>
            <FormInput
              label="School Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 101 Education Parkway"
              error={errors.address}
              icon={MapPin}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g. Seattle"
                error={errors.city}
                icon={Building}
                required
              />
              <FormInput
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g. WA"
                error={errors.state}
                icon={Globe}
                required
              />
            </div>
          </div>

          {/* Section 2: Admin Credentials */}
          <div className="mt-2">
            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
              Administrator Profile
            </h3>
            <FormInput
              label="Admin Full Name"
              name="adminName"
              value={formData.adminName}
              onChange={handleInputChange}
              placeholder="e.g. Principal Jane Doe"
              error={errors.adminName}
              icon={User}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Admin Account Email"
                name="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={handleInputChange}
                placeholder="e.g. admin@school.com"
                error={errors.adminEmail}
                icon={Mail}
                required
              />
              <FormInput
                label="Admin Login Password"
                name="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
                error={errors.adminPassword}
                icon={Lock}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {!isSuperAdmin ? (
              <>
                <span className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                    Log In
                  </Link>
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover text-center"
                >
                  {isSubmitting ? 'Registering School...' : 'Submit Onboarding Request'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 ml-auto bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover text-center w-full sm:w-auto"
              >
                {isSubmitting ? 'Onboarding...' : 'Onboard & Activate School'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterSchool;
