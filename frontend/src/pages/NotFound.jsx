import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 p-4 font-sans select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
          <HelpCircle size={36} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Page Not Found</h1>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 inline-flex items-center justify-center gap-2 btn-transition bounce-hover"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
