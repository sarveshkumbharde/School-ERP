import React from 'react';
import { Menu, LogOut, User as UserIcon, School } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();

  const roleLabels = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    teacher: 'Teacher',
    student: 'Student',
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 z-20 w-full">
      {/* Left side: Hamburger and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg lg:hidden btn-transition"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm">
          {user?.school && (
            <>
              <School size={16} className="text-primary-500" />
              <span className="font-semibold text-slate-700">{user.school.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: User card and Log out */}
      <div className="flex items-center gap-4">
        {/* User badge */}
        <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
          <div className="h-9 w-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.name}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {roleLabels[user?.role] || 'User'}
            </span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-medium text-sm py-2 px-3 hover:bg-red-50 rounded-lg btn-transition"
          title="Log out"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
