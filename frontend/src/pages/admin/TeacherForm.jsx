import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Phone, GraduationCap, Clipboard, Award } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import Loader from '../../components/common/Loader';

const TeacherForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    phone: '',
    gender: '',
    qualification: '',
    subjects: '',
    assignedClasses: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchTeacherDetails();
    }
  }, [editId]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/teachers/${editId}`);
      const teacher = response.data.data.teacher;
      setFormData({
        name: teacher.user?.name || '',
        email: teacher.user?.email || '',
        password: '', // Leave blank for edit
        employeeId: teacher.employeeId || '',
        phone: teacher.phone || '',
        gender: teacher.gender || '',
        qualification: teacher.qualification || '',
        subjects: teacher.subjects ? teacher.subjects.join(', ') : '',
        assignedClasses: teacher.assignedClasses ? teacher.assignedClasses.join(', ') : '',
      });
    } catch (error) {
      console.error('Error fetching teacher:', error);
      setApiError('Failed to load teacher details.');
    } finally {
      setLoading(false);
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
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender selection is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.subjects.trim()) newErrors.subjects = 'At least one subject is required';
    if (!formData.assignedClasses.trim()) newErrors.assignedClasses = 'At least one class is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    // Parse subjects and classes from comma-separated inputs
    const parsedSubjects = formData.subjects
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const parsedClasses = formData.assignedClasses
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    const payload = {
      name: formData.name,
      email: formData.email,
      employeeId: formData.employeeId,
      phone: formData.phone,
      gender: formData.gender,
      qualification: formData.qualification,
      subjects: parsedSubjects,
      assignedClasses: parsedClasses,
    };

    if (!isEditMode) {
      payload.password = formData.password;
    }

    try {
      if (isEditMode) {
        await api.put(`/teachers/${editId}`, payload);
      } else {
        await api.post('/teachers', payload);
      }
      navigate('/admin/teachers');
    } catch (err) {
      const msg = err.response?.data?.message || 'Form submission failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/teachers')}
          className="p-2 hover:bg-white border border-slate-100 text-slate-500 hover:text-slate-700 rounded-lg shadow-sm btn-transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isEditMode ? 'Edit Profile' : 'Onboard Teacher'}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? 'Modify Teacher Record' : 'Add New Teacher'}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        {apiError && (
          <div className="mb-6 p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-2xl text-xs font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Alice Smith"
              error={errors.name}
              icon={User}
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. alice@school.com"
              error={errors.email}
              icon={Mail}
              required
            />
          </div>

          {!isEditMode && (
            <FormInput
              label="Login Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 6 characters"
              error={errors.password}
              icon={Lock}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="e.g. EMP001"
              error={errors.employeeId}
              icon={Clipboard}
              required
            />
            <FormInput
              label="Contact Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +1 555-0211"
              error={errors.phone}
              icon={Phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select Gender"
              error={errors.gender}
              required
            />
            <FormInput
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              placeholder="e.g. M.Sc. in Mathematics"
              error={errors.qualification}
              icon={Award}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Assigned Subjects"
              name="subjects"
              value={formData.subjects}
              onChange={handleInputChange}
              placeholder="e.g. Mathematics, Physics"
              error={errors.subjects}
              icon={GraduationCap}
              required
            />
            <FormInput
              label="Assigned Classes"
              name="assignedClasses"
              value={formData.assignedClasses}
              onChange={handleInputChange}
              placeholder="e.g. 10-A, 9-B"
              error={errors.assignedClasses}
              icon={Clipboard}
              required
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/teachers')}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm rounded-xl focus:outline-none btn-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover text-center"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Teacher' : 'Onboard Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
