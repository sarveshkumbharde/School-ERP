import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Award, CheckCircle2, Clock, XCircle, User, GraduationCap, MapPin } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import DataTable from '../../components/common/DataTable';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfileAndAttendance();
  }, [user]);

  const fetchStudentProfileAndAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch students in the school and find this student's profile
      const studentsResponse = await api.get('/students');
      const studentList = studentsResponse.data.data.students || [];
      const studentProfile = studentList.find((s) => s.user?._id === user._id);
      setProfile(studentProfile);

      // 2. Fetch attendance logs for this student ID
      if (studentProfile) {
        const attendanceResponse = await api.get(`/attendance/student/${studentProfile._id}`);
        setAttendance(attendanceResponse.data.data.records || []);
      }
    } catch (error) {
      console.error('Error fetching student dashboard info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Calculate stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter((r) => r.status === 'present').length;
  const absentDays = attendance.filter((r) => r.status === 'absent').length;
  const lateDays = attendance.filter((r) => r.status === 'late').length;
  const rate = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 100;

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
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Student Portal</h1>
        <p className="text-slate-500 text-sm">Welcome back, {user?.name}</p>
      </div>

      {/* Profile & Gauge Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
            <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-extrabold text-xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-medium">Roll Number: {profile?.rollNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <User size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Full Name</p>
                  <p className="font-medium text-slate-800 mt-0.5">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">School Email</p>
                  <p className="font-medium text-slate-800 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Home Address</p>
                  <p className="font-medium text-slate-800 mt-0.5">{profile?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <GraduationCap size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Class & Section</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {profile ? `Class ${profile.class} - ${profile.section}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Award size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Gender</p>
                  <p className="font-medium text-slate-800 mt-0.5 capitalize">{profile?.gender || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gauge Chart widget */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6 lg:col-span-1 items-center text-center">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 w-full text-left">
            Attendance Rate
          </h3>

          <div className="relative flex items-center justify-center h-32 w-32 mt-2">
            {/* Custom SVG circle progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#f1f5f9"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke={rate >= 75 ? '#10b981' : '#f43f5e'}
                strokeWidth="10"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * rate) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-800">{rate}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Attend</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full text-xs border-t border-slate-50 pt-4">
            <div className="text-emerald-600 font-semibold">
              <p className="text-sm font-black">{presentDays}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Present</p>
            </div>
            <div className="text-amber-600 font-semibold">
              <p className="text-sm font-black">{lateDays}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Late</p>
            </div>
            <div className="text-rose-600 font-semibold">
              <p className="text-sm font-black">{absentDays}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Logs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <h2 className="text-base font-bold text-slate-800">Recent Attendance Logs</h2>
          <Link
            to="/student/attendance"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
          >
            View Full Log
          </Link>
        </div>

        <DataTable
          headers={['Date', 'Status', 'Marked By']}
          data={attendance.slice(0, 5)}
          loading={false}
          emptyState={
            <div className="text-center py-6 text-slate-400 text-sm">
              No attendance records found.
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

export default StudentDashboard;
