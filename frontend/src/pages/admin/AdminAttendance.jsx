import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, classFilter, sectionFilter]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = '/attendance';
      const params = [];
      if (dateFilter) params.push(`date=${dateFilter}`);
      if (classFilter) params.push(`class=${classFilter}`);
      if (sectionFilter) params.push(`section=${sectionFilter}`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await api.get(url);
      setAttendance(response.data.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Search filter on top of backend filters (searches student name/roll number locally)
  const filteredAttendance = attendance.filter((record) => {
    const term = searchTerm.toLowerCase();
    const studentName = record.student?.user?.name || '';
    const studentRoll = record.student?.rollNumber || '';
    return studentName.toLowerCase().includes(term) || studentRoll.toLowerCase().includes(term);
  });

  const classes = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
  const sections = ['A', 'B', 'C', 'D'];

  const filterContent = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date filter */}
      <div className="relative">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </div>

      {/* Class filter */}
      <select
        value={classFilter}
        onChange={(e) => setClassFilter(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      >
        <option value="">All Classes</option>
        {classes.map((c) => (
          <option key={c} value={c}>
            Class {c}
          </option>
        ))}
      </select>

      {/* Section filter */}
      <select
        value={sectionFilter}
        onChange={(e) => setSectionFilter(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      >
        <option value="">All Sections</option>
        {sections.map((s) => (
          <option key={s} value={s}>
            Section {s}
          </option>
        ))}
      </select>
    </div>
  );

  const headers = ['Date', 'Roll No', 'Student Name', 'Class & Section', 'Status', 'Marked By'];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance Logs</h1>
        <p className="text-slate-500 text-sm">Query and audit attendance reports across the school campus</p>
      </div>

      {/* Logs Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <DataTable
          headers={headers}
          data={filteredAttendance}
          loading={loading}
          searchPlaceholder="Filter student name or roll number..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterContent={filterContent}
          emptyState={
            <EmptyState
              title="No attendance records found"
              description="No attendance records match the selected date, class, or student search."
            />
          }
          renderRow={(record) => (
            <tr key={record._id} className="hover:bg-slate-50/50 btn-transition">
              <td className="px-6 py-4 text-slate-700 text-sm font-semibold">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">
                {record.student?.rollNumber}
              </td>
              <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                {record.student?.user?.name}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200">
                  {record.class}-{record.section}
                </span>
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

export default AdminAttendance;
