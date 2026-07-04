import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, BookOpen, Users, ClipboardCheck, GraduationCap, ArrowUpRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todaySummary, setTodaySummary] = useState({ marked: false, total: 0, present: 0, absent: 0, late: 0 });

  useEffect(() => {
    fetchProfileAndData();
  }, [user]);

  const fetchProfileAndData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch all teachers to locate the profile for this user ID
      const teachersResponse = await api.get('/teachers');
      const teacherList = teachersResponse.data.data.teachers || [];
      const teacherProfile = teacherList.find((t) => t.user?._id === user._id);
      setProfile(teacherProfile);

      // If profile is found, fetch students in their assigned classes
      if (teacherProfile) {
        const studentsResponse = await api.get('/students');
        const studentList = studentsResponse.data.data.students || [];
        setStudents(studentList);

        // Fetch today's attendance summary for their school
        const today = new Date().toISOString().split('T')[0];
        const attendanceResponse = await api.get(`/attendance?date=${today}`);
        const todayLogs = attendanceResponse.data.data.attendance || [];

        // Filter attendance logs for students in the teacher's assigned classes
        const teacherClasses = teacherProfile.assignedClasses || [];
        const classLogs = todayLogs.filter((log) => {
          const classSection = `${log.class}-${log.section}`;
          return teacherClasses.includes(classSection);
        });

        if (classLogs.length > 0) {
          setTodaySummary({
            marked: true,
            total: classLogs.length,
            present: classLogs.filter((l) => l.status === 'present').length,
            absent: classLogs.filter((l) => l.status === 'absent').length,
            late: classLogs.filter((l) => l.status === 'late').length,
          });
        }
      }
    } catch (error) {
      console.error('Error loading teacher dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Calculate student count under this teacher
  const teacherClasses = profile?.assignedClasses || [];
  const assignedStudents = students.filter((student) => {
    const studentClassStr = `${student.class}-${student.section}`;
    return teacherClasses.includes(studentClassStr);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Teacher Console</h1>
        <p className="text-slate-500 text-sm">Welcome back, {user?.name}</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Classes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Assigned Classes</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{profile?.assignedClasses?.length || 0}</p>
          </div>
        </div>

        {/* Assigned Subjects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary-50 text-primary-600 rounded-xl">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Subjects</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{profile?.subjects?.length || 0}</p>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">My Students</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{assignedStudents.length}</p>
          </div>
        </div>

        {/* Today's Roster Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-slate-50 text-slate-500 rounded-xl">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Today's Roster</p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {todaySummary.marked ? 'Attendance Marked' : 'Pending Action'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Breakdowns */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6 lg:col-span-1">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">
            Today's Attendance Status
          </h2>

          {!todaySummary.marked ? (
            <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-4">
              <span>No attendance has been marked for your classes today.</span>
              <Link
                to="/teacher/attendance/mark"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm btn-transition bounce-hover"
              >
                Mark Attendance
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Progress bars */}
              <div className="flex flex-col gap-3">
                {/* Present */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-500 rounded-full" /> Present</span>
                  <span>{todaySummary.present} Students</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(todaySummary.present / todaySummary.total) * 100}%` }}
                  />
                </div>

                {/* Late */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-amber-500 rounded-full" /> Late</span>
                  <span>{todaySummary.late} Students</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(todaySummary.late / todaySummary.total) * 100}%` }}
                  />
                </div>

                {/* Absent */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Absent</span>
                  <span>{todaySummary.absent} Students</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${(todaySummary.absent / todaySummary.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Profile Details & Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">
            Academic Schedule & Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Subjects</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile?.subjects?.map((sub, i) => (
                  <span
                    key={i}
                    className="bg-primary-50 text-primary-600 text-xs font-bold px-3 py-1 rounded-full"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Classes</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile?.assignedClasses?.map((cls, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-md border border-slate-200"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border-t border-slate-50 pt-6">
            <Link
              to="/teacher/attendance/mark"
              className="p-4 border border-slate-100 hover:border-primary-100 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl flex flex-col text-left group transition-all bounce-hover"
            >
              <span className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                Mark Daily Attendance
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Open the attendance register grid for your assigned classes.
              </span>
            </Link>

            <Link
              to="/teacher/attendance"
              className="p-4 border border-slate-100 hover:border-primary-100 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl flex flex-col text-left group transition-all bounce-hover"
            >
              <span className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                Audit Attendance History
              </span>
              <span className="text-xs text-slate-400 mt-1">
                View previous attendance logs, lookup specific dates, or export data.
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
