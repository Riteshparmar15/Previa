import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  BookOpenCheck,
  CalendarCheck2,
  ReceiptIndianRupee,
  Users,
  School,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Languages,
  PlusCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { api } from '../api/apiClient';
import { DashboardStats } from '../types';
import { LoadingSpinner, AlertBanner, Badge, PageHeader } from '../components/common/UIComponents';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Connecting to your centre database..." />;
  }

  if (error || !stats) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" title="Dashboard Connection Error" message={error || 'Unable to load dashboard data.'} />
        <button onClick={() => window.location.reload()} className="previa-btn-secondary">
          Retry Connection
        </button>
      </div>
    );
  }

  const sub = stats.subscription;
  const noticePercent = Math.min(100, Math.round((sub.noticesGeneratedThisMonth / sub.maxNoticesPerMonth) * 100));
  const planPercent = Math.min(100, Math.round((sub.activityPlansGeneratedThisMonth / sub.maxActivityPlansPerMonth) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-teal-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-teal-100 border border-white/20">
              <School className="w-3.5 h-3.5 text-teal-300" />
              <span>{profile?.organisationName || sub.organisationName}</span>
              <span>•</span>
              <span>{profile?.organisationCity || 'Vadodara'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.fullName || 'Educator'}! 👋
            </h1>
            <p className="text-sm text-teal-100/90 max-w-xl leading-relaxed">
              Here is what is happening at your centre today. Your trilingual WhatsApp engine is ready for parent notices and lesson plans.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/app/notices"
              className="inline-flex items-center gap-2 bg-[#25D366] text-[#075E54] hover:bg-emerald-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Draft WhatsApp Notice</span>
            </Link>
            <Link
              to="/app/attendance"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/25 transition-all active:scale-[0.98]"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Take Roll Call</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 High-Visibility Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Students */}
        <div className="previa-card p-5 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Children</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalStudents}</span>
            <span className="text-xs font-semibold text-slate-500">/ {sub.maxStudents} capacity</span>
          </div>
          <p className="text-xs font-semibold text-teal-800 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {stats.totalClasses} Active Classrooms
          </p>
        </div>

        {/* Card 2: Attendance */}
        <div className="previa-card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.todayAttendance.attendancePercentage}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {stats.todayAttendance.presentCount} Present
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600 mt-2">
            {stats.todayAttendance.absentCount} Absent • {stats.todayAttendance.lateCount} Late
          </p>
        </div>

        {/* Card 3: Notices */}
        <div className="previa-card p-5 border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notices Published</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.noticesCount}</span>
            <span className="text-xs font-medium text-slate-500">Total in archive</span>
          </div>
          <p className="text-xs font-semibold text-sky-800 mt-2 flex items-center gap-1">
            <span>Trilingual: Gu / Hi / En</span>
          </p>
        </div>

        {/* Card 4: Fees */}
        <div className="previa-card p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Fees</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <ReceiptIndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-500">₹</span>
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalPendingFeeAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-900 mt-2 flex items-center gap-1">
            <span>{stats.pendingFeeRecordsCount} Student Record(s) Due</span>
          </p>
        </div>
      </div>

      {/* Subscription Entitlements & Usage Quotas */}
      <div className="previa-card p-6 bg-gradient-to-r from-white via-white to-teal-50/40 border border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Subscription Entitlement & Monthly AI Quotas</h3>
              <Badge variant="primary">{sub.planName} Plan</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Active Tier: <strong>₹{sub.tier === 1 ? '499' : sub.tier === 2 ? '999' : '1,999'}/month</strong> • Next billing cycle: {new Date(sub.currentPeriodEndUtc).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <Link to="/app/settings" className="previa-btn-secondary text-xs self-start sm:self-center">
            Upgrade / Manage Tier
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {/* Notice meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>AI Parent Notices</span>
              <span>{sub.noticesGeneratedThisMonth} / {sub.maxNoticesPerMonth} Used</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  noticePercent > 80 ? 'bg-amber-500' : 'bg-primary-700'
                }`}
                style={{ width: `${Math.max(5, noticePercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{noticePercent}% consumed</span>
              <span className="text-emerald-700 font-bold">{sub.maxNoticesPerMonth - sub.noticesGeneratedThisMonth} remaining</span>
            </div>
          </div>

          {/* Activity Plan meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Weekly Lesson & Activity Plans</span>
              <span>{sub.activityPlansGeneratedThisMonth} / {sub.maxActivityPlansPerMonth} Used</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  planPercent > 80 ? 'bg-amber-500' : 'bg-teal-700'
                }`}
                style={{ width: `${Math.max(5, planPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{planPercent}% consumed</span>
              <span className="text-emerald-700 font-bold">{sub.maxActivityPlansPerMonth - sub.activityPlansGeneratedThisMonth} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Administrative Workflows */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Administrative Workflows</h3>
          <span className="text-xs text-slate-500 font-medium">Click to launch workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1 */}
          <Link
            to="/app/notices"
            className="previa-card p-5 hover:border-emerald-500 group flex flex-col justify-between hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BellRing className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Parent Notice Generator
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Emergency rain alerts, PTMs, fee circulars & WhatsApp formatted text with bold & emojis.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
              Draft Notice <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Action 2 */}
          <Link
            to="/app/activity-planner"
            className="previa-card p-5 hover:border-teal-500 group flex flex-col justify-between hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Lesson & Activity Planner
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Play-based 1 to 5 day structured early childhood plans with safety guidelines.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 mt-4 flex items-center gap-1">
              Plan Curriculum <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Action 3 */}
          <Link
            to="/app/attendance"
            className="previa-card p-5 hover:border-sky-500 group flex flex-col justify-between hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Take Daily Roll Call
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                One-tap attendance recording, duplicate prevention, and exportable CSV audit sheets.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-700 mt-4 flex items-center gap-1">
              Record Attendance <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Action 4 */}
          <Link
            to="/app/fees"
            className="previa-card p-5 hover:border-amber-500 group flex flex-col justify-between hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ReceiptIndianRupee className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Gentle Fee Reminders
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Prepare respectful, culturally polite reminders in Gujarati or English for parents.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
              Manage Dues <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Two Column: Recent Notices & AI Engine Activity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notices */}
        <div className="previa-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Parent Notices</h3>
              <p className="text-xs text-slate-500 font-medium">Published circulars and drafts</p>
            </div>
            <Link to="/app/notices" className="text-xs font-bold text-primary-700 hover:underline">
              View All Archive ({stats.noticesCount})
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {stats.recentNotices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No notices drafted yet. Click "Draft WhatsApp Notice" above to draft your first announcement!
              </div>
            ) : (
              stats.recentNotices.map((n) => (
                <div key={n.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <h5 className="text-sm font-bold text-slate-900 truncate">{n.title}</h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {n.classRoomName ? `Class: ${n.classRoomName}` : 'All Parents'} • {new Date(n.createdAtUtc).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Badge variant={n.isDraft ? 'warning' : 'success'}>
                      {n.isDraft ? 'Draft' : 'Active'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Engine Activity Log */}
        <div className="previa-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">AI Engine Activity Audit</h3>
              <p className="text-xs text-slate-500 font-medium">Tenant-isolated operational logs</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Online
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {stats.recentAiActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent AI generations logged yet.
              </div>
            ) : (
              stats.recentAiActivities.map((a) => (
                <div key={a.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{a.type} Generation</span>
                    <p className="text-slate-500 font-medium mt-0.5">{a.modelName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={a.isSuccess ? 'success' : 'danger'}>
                      {a.isSuccess ? 'Completed' : 'Failed'}
                    </Badge>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {new Date(a.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
