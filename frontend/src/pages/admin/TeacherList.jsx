import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Search, User } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data.data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
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
      await api.delete(`/teachers/${deleteId}`);
      // Refresh list
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.user?.name.toLowerCase().includes(term) ||
      teacher.user?.email.toLowerCase().includes(term) ||
      teacher.employeeId.toLowerCase().includes(term)
    );
  });

  const headers = ['Employee ID', 'Name', 'Contact Email', 'Qualification', 'Subjects', 'Actions'];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Teachers</h1>
          <p className="text-slate-500 text-sm">Onboard, view profiles, or update teacher records</p>
        </div>
        <Link
          to="/admin/teachers/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover"
        >
          <Plus size={16} />
          Add New Teacher
        </Link>
      </div>

      {/* Main Table Wrapper */}
      <div className="flex-grow flex flex-col min-h-0">
        <DataTable
          headers={headers}
          data={filteredTeachers}
          loading={loading}
          searchPlaceholder="Search by name, employee ID, or email..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          emptyState={
            <EmptyState
              title="No teachers found"
              description="Onboard your first teacher by clicking the button above."
              actionText="Add New Teacher"
              onAction={() => navigate('/admin/teachers/add')}
            />
          }
          renderRow={(teacher) => (
            <tr key={teacher._id} className="hover:bg-slate-50/50 btn-transition">
              <td className="px-6 py-4.5 font-mono text-xs font-semibold text-slate-500">
                {teacher.employeeId}
              </td>
              <td className="px-6 py-4.5 font-semibold text-slate-800 text-sm">
                {teacher.user?.name}
              </td>
              <td className="px-6 py-4.5 text-slate-600 text-sm">
                {teacher.user?.email}
              </td>
              <td className="px-6 py-4.5 text-slate-500 text-xs font-medium">
                {teacher.qualification}
              </td>
              <td className="px-6 py-4.5">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {teacher.subjects.map((sub, i) => (
                    <span
                      key={i}
                      className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/teachers/${teacher._id}`)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg btn-transition"
                    title="View Profile"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/teachers/add?edit=${teacher._id}`)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-lg btn-transition"
                    title="Edit Profile"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(teacher._id, teacher.user?.name)}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg btn-transition"
                    title="Delete Teacher"
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
        title="Delete Teacher Profile"
        message={`Are you sure you want to delete the teacher profile for '${deleteName}'? This action will permanently remove their credentials and User account, and cannot be undone.`}
        confirmText="Delete permanently"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default TeacherList;
