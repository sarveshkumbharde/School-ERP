import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SelectInput from '../../components/common/SelectInput';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [classFilter, sectionFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = '/students';
      const params = [];
      if (classFilter) params.push(`class=${classFilter}`);
      if (sectionFilter) params.push(`section=${sectionFilter}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await api.get(url);
      setStudents(response.data.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await api.delete(`/students/${deleteId}`);
      // Refresh list
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.user?.name.toLowerCase().includes(term) ||
      student.user?.email.toLowerCase().includes(term) ||
      student.rollNumber.toLowerCase().includes(term)
    );
  });

  const headers = ['Roll No', 'Name', 'Contact Email', 'Class & Section', 'Phone', 'Actions'];

  // Distinct classes and sections from students data to populate filters
  const classes = ['All Classes', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
  const sections = ['All Sections', 'A', 'B', 'C', 'D'];

  const filterContent = (
    <div className="flex items-center gap-2">
      {/* Class Filter */}
      <select
        value={classFilter}
        onChange={(e) => setClassFilter(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      >
        <option value="">Filter Class</option>
        {classes.slice(1).map((c) => (
          <option key={c} value={c}>
            Class {c}
          </option>
        ))}
      </select>

      {/* Section Filter */}
      <select
        value={sectionFilter}
        onChange={(e) => setSectionFilter(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      >
        <option value="">Filter Section</option>
        {sections.slice(1).map((s) => (
          <option key={s} value={s}>
            Section {s}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Student Rosters</h1>
          <p className="text-slate-500 text-sm">Register new enrollments, view transcripts, or manage classes</p>
        </div>
        <Link
          to="/admin/students/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover"
        >
          <Plus size={16} />
          Add New Student
        </Link>
      </div>

      {/* Table grid wrapper */}
      <div className="flex-grow flex flex-col min-h-0">
        <DataTable
          headers={headers}
          data={filteredStudents}
          loading={loading}
          searchPlaceholder="Search by name, roll number, or email..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterContent={filterContent}
          emptyState={
            <EmptyState
              title="No students found"
              description="Onboard your first student by clicking the button above."
              actionText="Add New Student"
              onAction={() => navigate('/admin/students/add')}
            />
          }
          renderRow={(student) => (
            <tr key={student._id} className="hover:bg-slate-50/50 btn-transition">
              <td className="px-6 py-4.5 font-mono text-xs font-semibold text-slate-500">
                {student.rollNumber}
              </td>
              <td className="px-6 py-4.5 font-semibold text-slate-800 text-sm">
                {student.user?.name}
              </td>
              <td className="px-6 py-4.5 text-slate-600 text-sm">
                {student.user?.email}
              </td>
              <td className="px-6 py-4.5">
                <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200">
                  {student.class}-{student.section}
                </span>
              </td>
              <td className="px-6 py-4.5 text-slate-500 text-sm">
                {student.phone}
              </td>
              <td className="px-6 py-4.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/students/${student._id}`)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg btn-transition"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/students/add?edit=${student._id}`)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-lg btn-transition"
                    title="Edit profile"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(student._id, student.user?.name)}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg btn-transition"
                    title="Delete student"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Student Profile"
        message={`Are you sure you want to delete the student profile for '${deleteName}'? This action will permanently delete their account and records, and cannot be undone.`}
        confirmText="Delete permanently"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default StudentList;
