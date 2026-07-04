import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Clipboard, GraduationCap, Edit2, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import DataTable from '../../components/common/DataTable';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentAndAttendance();
  }, [id]);

  const fetchStudentAndAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch student profile
      const studentResponse = await api.get(`/students/${id}`);
      setStudent(studentResponse.data.data.student);

      // 2. Fetch student attendance logs
      const attendanceResponse = await api.get(`/attendance/student/${id}`);
      setAttendance(attendanceResponse.data.data.records || []);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(err.response?.data?.message || 'Failed to load student profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error || !student) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold mb-4">{error || 'Student not found'}</p>
        <Link to="/admin/students" className="text-primary-600 font-semibold underline">
          Back to Students
        </Link>
      </div>
    );
  }

  // Calculate attendance percentages
  const totalDays = attendance.length;
  const presentDays = attendance.filter((r) => r.status === 'present').length;
  const absentDays = attendance.filter((r) => r.status === 'absent').length;
  const lateDays = attendance.filter((r) => r.status === 'late').length;
  const rate = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 100; // Late counts half-present or present, let's treat present+late as attended

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            <CheckCircle2 size={12} />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100">
            <XCircle size={12} />
            Absent
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
            <Clock size={12} />
            Late
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 hover:bg-white border border-slate-100 text-slate-500 hover:text-slate-700 rounded-lg shadow-sm btn-transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Profile</span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{student.user?.name}</h1>
          </div>
        </div>

        <button
          onClick={() => navigate(`/admin/students/add?edit=${student._id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl btn-transition"
        >
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      {/* Profile & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
            <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-extrabold text-xl">
              {student.user?.name ? student.user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{student.user?.name}</h3>
              <p className="text-xs text-slate-400 font-medium">Roll Number: {student.rollNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email Address</p>
                  <p className="font-medium text-slate-800 mt-0.5">{student.user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                  <p className="font-medium text-slate-800 mt-0.5">{student.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Home Address</p>
                  <p className="font-medium text-slate-800 mt-0.5">{student.address}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <GraduationCap size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Class & Section</p>
                  <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                    {student.class} - {student.section}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Gender</p>
                  <p className="font-medium text-slate-800 mt-0.5 capitalize">{student.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date of Birth</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3">
            Attendance Overview
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <span className={`text-2xl font-black ${rate >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {rate}%
            </span>
          </div>

          {/* Simple Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 border-t border-slate-50 pt-4">
            <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-emerald-700">
              <p className="font-bold text-base">{presentDays}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Present</p>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-amber-700">
              <p className="font-bold text-base">{lateDays}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Late</p>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl text-rose-700">
              <p className="font-bold text-base">{absentDays}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">
          Attendance Log
        </h3>
        <DataTable
          headers={['Date', 'Status', 'Marked By']}
          data={attendance}
          loading={false}
          emptyState={
            <div className="text-center py-6 text-slate-400 text-sm">
              No attendance records found for this student.
            </div>
          }
          renderRow={(record) => (
            <tr key={record._id} className="hover:bg-slate-50/50 btn-transition">
              <td className="px-6 py-3.5 text-slate-700 font-medium text-sm">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-3.5">{getStatusBadge(record.status)}</td>
              <td className="px-6 py-3.5 text-slate-500 text-xs">
                {record.markedBy?.name} ({record.markedBy?.role === 'teacher' ? 'Teacher' : 'Admin'})
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default StudentDetails;
