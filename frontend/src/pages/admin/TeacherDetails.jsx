import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Award, Clipboard, GraduationCap, Edit2, Calendar } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/teachers/${id}`);
      setTeacher(response.data.data.teacher);
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      setError(err.response?.data?.message || 'Failed to load teacher profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error || !teacher) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold mb-4">{error || 'Teacher not found'}</p>
        <Link to="/admin/teachers" className="text-primary-600 font-semibold underline">
          Back to Teachers
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/teachers')}
            className="p-2 hover:bg-white border border-slate-100 text-slate-500 hover:text-slate-700 rounded-lg shadow-sm btn-transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teacher Profile</span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{teacher.user?.name}</h1>
          </div>
        </div>

        <button
          onClick={() => navigate(`/admin/teachers/add?edit=${teacher._id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl btn-transition"
        >
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
          <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-extrabold text-xl">
            {teacher.user?.name ? teacher.user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{teacher.user?.name}</h3>
            <p className="text-xs text-slate-400 font-medium">Employee ID: {teacher.employeeId}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Contact & Personal */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Personal</h4>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Mail size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="font-medium text-slate-800 mt-0.5">{teacher.user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Phone size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="font-medium text-slate-800 mt-0.5">{teacher.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <User size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Gender</p>
                <p className="font-medium text-slate-800 mt-0.5 capitalize">{teacher.gender}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Onboarding Date</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {new Date(teacher.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Academics */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Profile</h4>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Award size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Qualification</p>
                <p className="font-semibold text-slate-800 mt-0.5">{teacher.qualification}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <GraduationCap size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Assigned Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {teacher.subjects?.map((sub, i) => (
                    <span
                      key={i}
                      className="bg-primary-50 text-primary-600 text-xs font-bold px-2.5 py-0.5 rounded-full"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Clipboard size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Assigned Classes</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {teacher.assignedClasses?.map((cls, i) => (
                    <span
                      key={i}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-slate-200"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
