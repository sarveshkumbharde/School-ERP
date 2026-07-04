import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock, School, User, Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSchoolDetails();
  }, [id]);

  const fetchSchoolDetails = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get(`/schools/${id}`);
      setSchool(response.data.data.school);
      setAdmin(response.data.data.admin);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to fetch school details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setShowApproveModal(false);
    setActionLoading(true);
    try {
      await api.patch(`/schools/${id}/approve`);
      await fetchSchoolDetails();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setShowRejectModal(false);
    setActionLoading(true);
    try {
      await api.patch(`/schools/${id}/reject`);
      await fetchSchoolDetails();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (errorMessage && !school) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold mb-4">{errorMessage}</p>
        <Link to="/super-admin/schools" className="text-primary-600 font-semibold underline">
          Back to School List
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
            <Clock size={12} />
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/super-admin/schools')}
          className="p-2 hover:bg-white border border-slate-100 text-slate-500 hover:text-slate-700 rounded-lg shadow-sm btn-transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reviewing Application</span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{school?.name}</h1>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-150 text-red-700 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main card panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-8">
        {/* Status Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center text-slate-500">
              <School size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
              <div className="mt-1">{getStatusBadge(school?.status)}</div>
            </div>
          </div>

          {/* Action buttons (only show if pending) */}
          {school?.status === 'pending' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 font-semibold text-sm rounded-xl btn-transition"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 btn-transition bounce-hover"
              >
                <CheckCircle2 size={16} />
                Approve School
              </button>
            </div>
          )}
        </div>

        {/* Detailed school grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* School Details Card */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
              School Profile Details
            </h3>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Building size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">School Code</p>
                <p className="font-semibold text-slate-800 mt-0.5">{school?.schoolCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Mail size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="font-medium text-slate-800 mt-0.5">{school?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Phone size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="font-medium text-slate-800 mt-0.5">{school?.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Campus Address</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {school?.address}, {school?.city}, {school?.state}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Details Card */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
              Administrator Profile
            </h3>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <User size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Admin Name</p>
                <p className="font-semibold text-slate-800 mt-0.5">{admin?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Mail size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Account Email</p>
                <p className="font-medium text-slate-800 mt-0.5">{admin?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-600 text-sm">
              <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Application Date</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {school?.createdAt ? new Date(school.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showApproveModal}
        title="Approve Onboarding Request"
        message={`Are you sure you want to approve '${school?.name}'? This will allow their School Admin to log in and set up teachers and students.`}
        confirmText="Approve"
        type="success"
        onConfirm={handleApprove}
        onCancel={() => setShowApproveModal(false)}
      />

      <ConfirmModal
        isOpen={showRejectModal}
        title="Reject Onboarding Request"
        message={`Are you sure you want to reject '${school?.name}'? Their School Admin account will remain locked.`}
        confirmText="Reject"
        type="danger"
        onConfirm={handleReject}
        onCancel={() => setShowRejectModal(false)}
      />
    </div>
  );
};

export default SchoolDetails;
