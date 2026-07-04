import React from 'react';
import { Search } from 'lucide-react';
import Loader from './Loader';

const DataTable = ({
  headers = [],
  data = [],
  loading = false,
  emptyState,
  renderRow,
  searchPlaceholder = 'Search...',
  searchTerm,
  onSearchChange,
  filterContent,
}) => {
  const showSearch = onSearchChange !== undefined;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full w-full">
      {/* Header controls (Search & Filters) */}
      {(showSearch || filterContent) && (
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          {showSearch && (
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
          )}
          {filterContent && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
              {filterContent}
            </div>
          )}
        </div>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-slate-100 table-auto">
          <thead className="bg-slate-50/70">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-6 py-4.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {typeof header === 'object' ? header.label : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="py-12">
                  <Loader size="md" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-12 px-6 text-center">
                  {emptyState || (
                    <p className="text-slate-400 text-sm">No records found.</p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => renderRow(row, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
