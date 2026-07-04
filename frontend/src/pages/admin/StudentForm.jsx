import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Clipboard, Phone, Calendar, MapPin, Globe } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import Loader from '../../components/common/Loader';

const StudentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    class: '',
    section: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchStudentDetails();
    }
  }, [editId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/${editId}`);
      const student = response.data.data.student;
      
      // Format date of birth to YYYY-MM-DD
      let dobFormatted = '';
      if (student.dateOfBirth) {
        dobFormatted = new Date(student.dateOfBirth).toISOString().split('T')[0];
      }

      setFormData({
        name: student.user?.name || '',
        email: student.user?.email || '',
        password: '', // Leave blank for edit
        rollNumber: student.rollNumber || '',
        class: student.class || '',
        section: student.section || '',
        dateOfBirth: dobFormatted,
        gender: student.gender || '',
        phone: student.phone || '',
        address: student.address || '',
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      setApiError('Failed to load student details.');
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

    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.class.trim()) newErrors.class = 'Class is required';
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender selection is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    const payload = {
      name: formData.name,
      email: formData.email,
      rollNumber: formData.rollNumber,
      class: formData.class,
      section: formData.section.toUpperCase(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
    };

    if (!isEditMode) {
      payload.password = formData.password;
    }

    try {
      if (isEditMode) {
        await api.put(`/students/${editId}`, payload);
      } else {
        await api.post('/students', payload);
      }
      navigate('/admin/students');
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
          onClick={() => navigate('/admin/students')}
          className="p-2 hover:bg-white border border-slate-100 text-slate-500 hover:text-slate-700 rounded-lg shadow-sm btn-transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isEditMode ? 'Edit Profile' : 'Enroll Student'}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? 'Modify Student Record' : 'Enroll New Student'}
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
              placeholder="e.g. Charlie Brown"
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
              placeholder="e.g. charlie@school.com"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Roll Number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleInputChange}
              placeholder="e.g. R001"
              error={errors.rollNumber}
              icon={Clipboard}
              required
            />
            <FormInput
              label="Class"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              placeholder="e.g. 10"
              error={errors.class}
              icon={Globe}
              required
            />
            <FormInput
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              placeholder="e.g. A"
              error={errors.section}
              icon={Globe}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={errors.dateOfBirth}
              icon={Calendar}
              required
            />
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
          </div>

          <FormInput
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="e.g. +1 555-0301"
            error={errors.phone}
            icon={Phone}
            required
          />

          <FormInput
            label="Home Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="e.g. 123 Maple Street"
            error={errors.address}
            icon={MapPin}
            required
          />

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm rounded-xl focus:outline-none btn-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover text-center"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Student' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
