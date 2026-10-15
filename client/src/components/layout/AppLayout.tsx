import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BellRing,
  BookOpenCheck,
  CalendarCheck2,
  ReceiptIndianRupee,
  FolderArchive,
  Languages,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  School,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      label: 'MAIN DESK',
      items: [
        { name: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
        { name: 'AI Notice Generator', to: '/app/notices', icon: BellRing, badge: 'WhatsApp' },
        { name: 'Activity Planner', to: '/app/activity-planner', icon: BookOpenCheck },
      ]
    },
    {
      label: 'DAILY MANAGEMENT',
      items: [
        { name: 'Class Attendance', to: '/app/attendance', icon: CalendarCheck2 },
        { name: 'Fee Reminders', to: '/app/fees', icon: ReceiptIndianRupee },
      ]
    },
    {
      label: 'RESOURCES & TOOLS',
      items: [
        { name: 'Template Library', to: '/app/templates', icon: FolderArchive },
        { name: 'Trilingual Translator', to: '/app/translations', icon: Languages, badge: 'Gu/Hi/En' },
        { name: 'Centre Settings & Plan', to: '/app/settings', icon: Settings },
      ]
    }
  ];

  // Derive current page title for breadcrumb
  const currentPath = location.pathname;
  let pageTitle = 'Dashboard';
  if (currentPath.includes('notices')) pageTitle = 'AI Notice Generator';
  else if (currentPath.includes('activity-planner')) pageTitle = 'Lesson & Activity Planner';
  else if (currentPath.includes('attendance')) pageTitle = 'Classroom Attendance';
  else if (currentPath.includes('fees')) pageTitle = 'Fee Reminder Assistant';
  else if (currentPath.includes('templates')) pageTitle = 'Preschool Templates';
  else if (currentPath.includes('translations')) pageTitle = 'Trilingual Translator';
  else if (currentPath.includes('settings')) pageTitle = 'Centre Settings';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base">Previa</span>
            <span className="text-[10px] text-primary-700 font-semibold block leading-none">Preschool AI</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <Link to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">Previa</span>
              <span className="text-[10px] font-semibold text-primary-800 tracking-wider uppercase block">Preschool OS</span>
            </div>
          </Link>
        </div>

        {/* Active Centre Badge */}
        <div className="p-3.5 mx-3 my-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <School className="w-4 h-4 text-primary-700 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {profile?.organisationName || user?.organisationName || 'Little Pearls Preschool'}
            </h4>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="truncate">{profile?.organisationCity || 'Vadodara, Gujarat'}</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 space-y-5 overflow-y-auto py-2">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                {sec.label}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-primary-700 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.fullName?.charAt(0) || 'P'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Pooja Shah'}</p>
                <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email || 'admin@littlepearls.in'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign out of portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Desktop Top Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Navbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-30">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/app/dashboard" className="hover:text-slate-900 transition-colors">
              Workspace
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{pageTitle}</span>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-4">
            {/* Today Date */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Language indicator */}
            <div className="text-xs font-semibold text-primary-800 bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>English • ગુજરાતી • हिन्दी</span>
            </div>

            <Link
              to="/app/notices"
              className="previa-btn-primary text-xs py-1.5 px-3"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft Notice</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
