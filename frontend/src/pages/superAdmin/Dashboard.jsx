import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, CheckCircle2, Clock, XCircle, ChevronRight, Users, Plus } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await api.get('/schools');
      const schoolList = response.data.data.schools || [];
      setSchools(schoolList);

      // Calculate stats
      const total = schoolList.length;
      const pending = schoolList.filter((s) => s.status === 'pending').length;
      const approved = schoolList.filter((s) => s.status === 'approved').length;
      const rejected = schoolList.filter((s) => s.status === 'rejected').length;
      setStats({ total, pending, approved, rejected });
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const pendingSchools = schools.filter((s) => s.status === 'pending');

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">System-wide overview of onboarded schools</p>
        </div>
        <Link
          to="/school/register"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover"
        >
          <Plus size={16} />
          Onboard New School
        </Link>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary-50 text-primary-600 rounded-xl">
            <School size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Schools</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.total}</p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Approval</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.pending}</p>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.approved}</p>
          </div>
        </div>

        {/* Rejected Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Applications List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h2 className="text-base font-bold text-slate-800">Pending Onboarding Requests</h2>
            <Link
              to="/super-admin/schools"
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All
            </Link>
          </div>

          {pendingSchools.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No pending school applications.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingSchools.slice(0, 5).map((school) => (
                <div
                  key={school._id}
                  onClick={() => navigate(`/super-admin/schools/${school._id}`)}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-xl cursor-pointer transition-all bounce-hover group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm uppercase">
                      {school.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm group-hover:text-primary-600">
                        {school.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {school.city}, {school.state} • Code: {school.schoolCode}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Status Chart Widget */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
          <h2 className="text-base font-bold text-slate-800 self-start border-b border-slate-50 pb-3 w-full text-left mb-6">
            Onboarding Ratios
          </h2>
          {stats.total === 0 ? (
            <p className="text-slate-400 text-sm py-12">No data available</p>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-6">
              {/* Custom SVG Bar Chart */}
              <div className="w-full flex flex-col gap-3">
                {/* Approved Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-500 rounded-full" /> Approved</span>
                    <span>{Math.round((stats.approved / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(stats.approved / stats.total) * 100}%` }} />
                  </div>
                </div>

                {/* Pending Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-amber-500 rounded-full" /> Pending</span>
                    <span>{Math.round((stats.pending / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />
                  </div>
                </div>

                {/* Rejected Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Rejected</span>
                    <span>{Math.round((stats.rejected / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${(stats.rejected / stats.total) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-50 pt-4 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-800">{stats.approved}</p>
                  <p className="mt-0.5">Active</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{stats.pending}</p>
                  <p className="mt-0.5">Review</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{stats.rejected}</p>
                  <p className="mt-0.5">Rejected</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
