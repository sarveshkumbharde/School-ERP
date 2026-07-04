import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Save } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import SelectInput from '../../components/common/SelectInput';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Form states
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Attendance grid record states
  // Map of studentId -> status ('present' | 'absent' | 'late')
  const [attendanceGrid, setAttendanceGrid] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTeacherProfile();
  }, [user]);

  useEffect(() => {
    if (selectedClassSection) {
      loadStudents();
    } else {
      setStudents([]);
      setAttendanceGrid({});
    }
  }, [selectedClassSection, selectedDate]);

  const fetchTeacherProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get('/teachers');
      const teacherList = response.data.data.teachers || [];
      const teacherProfile = teacherList.find((t) => t.user?._id === user._id);
      setProfile(teacherProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    setApiMessage({ type: '', text: '' });
    try {
      // Split "10-A" to Class: "10", Section: "A"
      const [className, section] = selectedClassSection.split('-');
      
      // Fetch students in this class/section
      const studentsResponse = await api.get(`/students?class=${className}&section=${section}`);
      const studentList = studentsResponse.data.data.students || [];
      setStudents(studentList);

      // Fetch already marked attendance for this class, section and date
      const attendanceResponse = await api.get(
        `/attendance?date=${selectedDate}&class=${className}&section=${section}`
      );
      const existingLogs = attendanceResponse.data.data.attendance || [];

      // Build grid defaults. If attendance already marked, populate statuses. Otherwise, default all to 'present'.
      const grid = {};
      studentList.forEach((student) => {
        const loggedRecord = existingLogs.find((log) => log.student?._id === student._id);
        grid[student._id] = loggedRecord ? loggedRecord.status : 'present';
      });

      setAttendanceGrid(grid);
      if (existingLogs.length > 0) {
        setApiMessage({
          type: 'info',
          text: `Attendance is already marked for this date. You can modify records below.`,
        });
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setApiMessage({ type: 'error', text: 'Failed to load students roster.' });
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceGrid((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setApiMessage({ type: '', text: '' });
  };

  const handleMarkAll = (status) => {
    const grid = {};
    students.forEach((student) => {
      grid[student._id] = status;
    });
    setAttendanceGrid(grid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassSection) return;

    setIsSubmitting(true);
    setApiMessage({ type: '', text: '' });

    const [className, section] = selectedClassSection.split('-');

    // Build records list
    const records = Object.keys(attendanceGrid).map((studentId) => ({
      student: studentId,
      status: attendanceGrid[studentId],
    }));

    const payload = {
      class: className,
      section,
      date: selectedDate,
      records,
    };

    try {
      await api.post('/attendance', payload);
      setApiMessage({ type: 'success', text: 'Attendance records saved successfully!' });
      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance. Please try again.';
      setApiMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // Map assignedClasses options, e.g. ["10-A", "9-B"]
  const classOptions = profile?.assignedClasses
    ? profile.assignedClasses.map((cls) => ({ value: cls, label: `Class ${cls}` }))
    : [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mark Attendance</h1>
        <p className="text-slate-500 text-sm">Select Class, Section, and mark student presence</p>
      </div>

      {apiMessage.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2.5 border ${
            apiMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : apiMessage.type === 'info'
              ? 'bg-primary-50 text-primary-750 border-primary-100'
              : 'bg-red-50 text-red-700 border-red-150'
          }`}
        >
          {apiMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          )}
          <p>{apiMessage.text}</p>
        </div>
      )}

      {/* Class and Date selection card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
          <SelectInput
            label="Class & Section"
            name="classSection"
            value={selectedClassSection}
            onChange={(e) => setSelectedClassSection(e.target.value)}
            options={classOptions}
            placeholder="Select Assigned Class"
            required
          />
        </div>
        <div className="w-full sm:w-1/2">
          <FormInput
            label="Attendance Date"
            name="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            icon={Calendar}
            required
          />
        </div>
      </div>

      {/* Student List Grid */}
      {selectedClassSection && (
        <div className="flex-grow flex flex-col min-h-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
            {/* Quick action header controls */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">
                Mark All:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-bold btn-transition"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('late')}
                  className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-600 hover:text-amber-700 border border-slate-200 rounded-lg text-xs font-bold btn-transition"
                >
                  All Late
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 rounded-lg text-xs font-bold btn-transition"
                >
                  All Absent
                </button>
              </div>
            </div>

            {/* Main Table */}
            <DataTable
              headers={['Roll No', 'Student Name', 'Attendance Status']}
              data={students}
              loading={studentsLoading}
              emptyState={
                <EmptyState
                  title="No students found"
                  description="No students are enrolled in the selected class-section."
                />
              }
              renderRow={(student) => (
                <tr key={student._id} className="hover:bg-slate-50/50 btn-transition">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                    {student.user?.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Present Label Option */}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name={`status-${student._id}`}
                          value="present"
                          checked={attendanceGrid[student._id] === 'present'}
                          onChange={() => handleStatusChange(student._id, 'present')}
                          className="h-4 w-4 text-emerald-600 border-slate-200 focus:ring-emerald-500"
                        />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            attendanceGrid[student._id] === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-transparent text-slate-400 border-transparent'
                          }`}
                        >
                          Present
                        </span>
                      </label>

                      {/* Late Label Option */}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name={`status-${student._id}`}
                          value="late"
                          checked={attendanceGrid[student._id] === 'late'}
                          onChange={() => handleStatusChange(student._id, 'late')}
                          className="h-4 w-4 text-amber-600 border-slate-200 focus:ring-amber-500"
                        />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            attendanceGrid[student._id] === 'late'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-transparent text-slate-400 border-transparent'
                          }`}
                        >
                          Late
                        </span>
                      </label>

                      {/* Absent Label Option */}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name={`status-${student._id}`}
                          value="absent"
                          checked={attendanceGrid[student._id] === 'absent'}
                          onChange={() => handleStatusChange(student._id, 'absent')}
                          className="h-4 w-4 text-rose-600 border-slate-200 focus:ring-rose-500"
                        />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            attendanceGrid[student._id] === 'absent'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-transparent text-slate-400 border-transparent'
                          }`}
                        >
                          Absent
                        </span>
                      </label>
                    </div>
                  </td>
                </tr>
              )}
            />

            {students.length > 0 && (
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving Register...' : 'Save Attendance Register'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
