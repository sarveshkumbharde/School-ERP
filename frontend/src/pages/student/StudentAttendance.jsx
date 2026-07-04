import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';

const StudentAttendance = () => {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [user, statusFilter, dateFilter]);

  const fetchAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch student profile first to get their profile ID
      const studentsResponse = await api.get('/students');
      const studentList = studentsResponse.data.data.students || [];
      const studentProfile = studentList.find((s) => s.user?._id === user._id);

      if (studentProfile) {
        // 2. Fetch attendance logs
        const attendanceResponse = await api.get(`/attendance/student/${studentProfile._id}`);
        let records = attendanceResponse.data.data.records || [];

        // Apply filters locally for robust student-side querying
        if (statusFilter) {
          records = records.filter((r) => r.status === statusFilter);
        }
        if (dateFilter) {
          records = records.filter((r) => {
            const recordDateStr = new Date(r.date).toISOString().split('T')[0];
            return recordDateStr === dateFilter;
          });
        }

        setAttendance(records);
      }
    } catch (error) {
      console.error('Error fetching student attendance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            <CheckCircle2 size={12} />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100">
            <XCircle size={12} />
            Absent
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
            <Clock size={12} />
            Late
          </span>
        );
      default:
        return null;
    }
  };

  const filterContent = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date Filter */}
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      />

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      >
        <option value="">All Statuses</option>
        <option value="present">Present</option>
        <option value="late">Late</option>
        <option value="absent">Absent</option>
      </select>
    </div>
  );

  const headers = ['Date', 'Status', 'Marked By'];

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance History</h1>
        <p className="text-slate-500 text-sm">Full audit trail of your class attendance presence logs</p>
      </div>

      {/* Main Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <DataTable
          headers={headers}
          data={attendance}
          loading={loading}
          filterContent={filterContent}
          emptyState={
            <EmptyState
              title="No records found"
              description="No attendance records match the selected date or status filters."
            />
          }
          renderRow={(record) => (
            <tr key={record._id} className="hover:bg-slate-50/50 btn-transition">
              <td className="px-6 py-4 text-slate-700 text-sm font-semibold">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
              <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                {record.markedBy?.name} ({record.markedBy?.role === 'teacher' ? 'Teacher' : 'Admin'})
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default StudentAttendance;
