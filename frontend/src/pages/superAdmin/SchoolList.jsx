import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';

const SchoolList = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await api.get('/schools');
      setSchools(response.data.data.schools || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Filter school list based on search and selected tab status
  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.schoolCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || school.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const headers = ['School Name', 'Code', 'Contact Info', 'Location', 'Status', 'Actions'];

  const filterTabs = [
    { id: 'all', label: 'All Schools' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Onboarded Schools</h1>
        <p className="text-slate-500 text-sm">Review, approve, or reject school onboarding requests</p>
      </div>

      {/* Main Table Card wrapper */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Custom Tab Header */}
        <div className="flex items-center gap-1 border-b border-slate-100 px-6 pt-4 bg-slate-50/30">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all -mb-px ${
                selectedStatus === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <DataTable
          headers={headers}
          data={filteredSchools}
          loading={loading}
          searchPlaceholder="Search by school name, code, or city..."
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          emptyState={
            <EmptyState
              title="No schools found"
              description="There are no school applications matching the current filters."
            />
          }
          renderRow={(school) => (
            <tr key={school._id} className="hover:bg-slate-50/50 btn-transition">
              <td className="px-6 py-4.5">
                <div className="font-semibold text-slate-800 text-sm">{school.name}</div>
              </td>
              <td className="px-6 py-4.5">
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs uppercase font-semibold border border-slate-200">
                  {school.schoolCode}
                </span>
              </td>
              <td className="px-6 py-4.5">
                <div className="text-slate-700 text-xs font-medium">{school.email}</div>
                <div className="text-slate-400 text-xs mt-0.5">{school.phone}</div>
              </td>
              <td className="px-6 py-4.5">
                <div className="text-slate-600 text-xs font-medium">{school.address}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {school.city}, {school.state}
                </div>
              </td>
              <td className="px-6 py-4.5">{getStatusBadge(school.status)}</td>
              <td className="px-6 py-4.5">
                <button
                  onClick={() => navigate(`/super-admin/schools/${school._id}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 font-semibold text-xs rounded-lg btn-transition"
                >
                  <Eye size={14} />
                  Review Details
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default SchoolList;
