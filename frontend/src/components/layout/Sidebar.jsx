import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  ClipboardList,
  CalendarDays,
  X,
  BookOpen,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  const getLinks = (role) => {
    switch (role) {
      case 'super_admin':
        return [
          { to: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/super-admin/schools', label: 'Manage Schools', icon: School },
        ];
      case 'school_admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/teachers', label: 'Teachers', icon: Users },
          { to: '/admin/students', label: 'Students', icon: GraduationCap },
          { to: '/admin/attendance', label: 'Attendance History', icon: ClipboardList },
        ];
      case 'teacher':
        return [
          { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/teacher/attendance/mark', label: 'Mark Attendance', icon: CalendarDays },
          { to: '/teacher/attendance', label: 'Attendance Logs', icon: ClipboardList },
        ];
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/attendance', label: 'My Attendance', icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const links = getLinks(user?.role);

  const activeClass =
    'flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 font-semibold text-sm rounded-xl transition-all';
  const inactiveClass =
    'flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium text-sm rounded-xl transition-all';

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-slate-100 w-64 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200 ease-in-out z-40 flex flex-col h-full lg:sticky lg:top-0`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <BookOpen size={20} />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              School ERP
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden btn-transition"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex flex-col text-left text-xs text-slate-400 px-2">
            <span>Logged in as:</span>
            <span className="font-semibold text-slate-600 truncate mt-0.5">{user?.email}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
