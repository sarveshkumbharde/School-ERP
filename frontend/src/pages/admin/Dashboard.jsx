import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, CalendarCheck, Clock, CheckCircle2, XCircle, ArrowUpRight, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/schools/stats');
      setStats(response.data.data.stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const todayMarked = stats ? (stats.presentToday + stats.absentToday + stats.lateToday) > 0 : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">School Administration Dashboard</h1>
        <p className="text-slate-500 text-sm">Overview of enrollment, attendance, and faculty records</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Grid of metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats?.studentCount || 0}</p>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary-50 text-primary-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Teachers</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats?.teacherCount || 0}</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarCheck size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overall Attendance</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats?.overallPercentage || 0}%</p>
          </div>
        </div>

        {/* Attendance State Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-slate-50 text-slate-500 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Today's Roster</p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {todayMarked ? 'Marked' : 'Not marked yet'}
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

          {!todayMarked ? (
            <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-4">
              <span>No attendance has been marked today.</span>
              <Link
                to="/admin/attendance"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                Go to Attendance logs <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Progress circles or progress bars */}
              <div className="flex flex-col gap-3">
                {/* Present */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-500 rounded-full" /> Present</span>
                  <span>{stats?.presentToday} Students</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(stats.presentToday / (stats.presentToday + stats.absentToday + stats.lateToday)) * 100}%`,
                    }}
                  />
                </div>

                {/* Late */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-amber-500 rounded-full" /> Late</span>
                  <span>{stats?.lateToday} Students</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${(stats.lateToday / (stats.presentToday + stats.absentToday + stats.lateToday)) * 100}%`,
                    }}
                  />
                </div>

                {/* Absent */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Absent</span>
                  <span>{stats?.absentToday} Students</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${(stats.absentToday / (stats.presentToday + stats.absentToday + stats.lateToday)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links and Management Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Link
              to="/admin/students/add"
              className="p-4 border border-slate-100 hover:border-primary-100 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl flex flex-col text-left group transition-all bounce-hover"
            >
              <span className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                Add New Student
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Register a new student and generate user login credentials.
              </span>
            </Link>

            <Link
              to="/admin/teachers/add"
              className="p-4 border border-slate-100 hover:border-primary-100 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl flex flex-col text-left group transition-all bounce-hover"
            >
              <span className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                Onboard New Teacher
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Set up a new teacher profile and assign subjects or classes.
              </span>
            </Link>

            <Link
              to="/admin/attendance"
              className="p-4 border border-slate-100 hover:border-primary-100 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl flex flex-col text-left group transition-all bounce-hover"
            >
              <span className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                View School Attendance
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Generate reports, look up records, and filter by class/date.
              </span>
            </Link>

            <Link
              to="/admin/students"
              className="p-4 border border-slate-100 hover:border-primary-100 bg-slate-50/50 hover:bg-primary-50/30 rounded-2xl flex flex-col text-left group transition-all bounce-hover"
            >
              <span className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                Manage Student Rosters
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Search, filter, or update personal information for students.
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
