import React, { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Users,
  School,
  FileCheck2
} from 'lucide-react';
import { api } from '../api/apiClient';
import { OrganisationSubscription, UserProfile } from '../types';
import { LoadingSpinner, AlertBanner, Badge } from '../components/common/UIComponents';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<OrganisationSubscription | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [subData, plansData] = await Promise.all([
        api.subscriptions.getCurrent(),
        api.subscriptions.getPlans()
      ]);
      setSubscription(subData);
      setPlans(plansData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangePlan = async (planId: string) => {
    setUpdatingPlan(planId);
    setSuccessMsg(null);
    try {
      const updated = await api.subscriptions.changePlan(planId);
      setSubscription(updated);
      await refreshProfile();
      setSuccessMsg(`Your preschool subscription was updated to ${updated.planName} tier successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update plan.');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading centre settings & plan configuration..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Centre Profile & Subscription Plans</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your preschool centre details, tenant security boundary, and commercial subscription limits.
        </p>
      </div>

      {successMsg && <AlertBanner type="success" message={successMsg} />}

      {/* Centre Profile Card */}
      <div className="previa-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {profile?.organisationName || subscription?.organisationName}
              </h3>
              <p className="text-xs text-slate-500">Verified Independent Preschool Tenant</p>
            </div>
          </div>
          <Badge variant="primary">Active Tenant</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Location / City</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {profile?.organisationCity || 'Vadodara'}, Gujarat, India
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Default Language</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {profile?.preferredLanguage === 2 ? 'Gujarati (ગુજરાતી)' : profile?.preferredLanguage === 3 ? 'Hindi' : 'English'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Timezone</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {profile?.timeZoneId || 'India Standard Time (IST)'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Subscription Status & Usage */}
      {subscription && (
        <div className="previa-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{subscription.planName} Plan</h3>
                <Badge variant="success">Active Subscription</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Current billing period: {new Date(subscription.currentPeriodStartUtc).toLocaleDateString()} to{' '}
                {new Date(subscription.currentPeriodEndUtc).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Monthly AI Notices</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {subscription.noticesGeneratedThisMonth} / {subscription.maxNoticesPerMonth}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {subscription.canGenerateNotice ? 'Quota Available' : 'Quota Exhausted'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Weekly Activity Plans</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {subscription.activityPlansGeneratedThisMonth} / {subscription.maxActivityPlansPerMonth}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {subscription.canGenerateActivityPlan ? 'Quota Available' : 'Quota Exhausted'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Enrolled Students</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {subscription.currentStudentCount} / {subscription.maxStudents}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {subscription.canAddStudent ? 'Capacity Available' : 'Student Limit Reached'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Active Classes</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {subscription.currentClassCount} / {subscription.maxClasses}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {subscription.canAddClass ? 'Class Slot Available' : 'Class Limit Reached'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans Switcher */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">Select or Switch Subscription Tier</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = subscription?.subscriptionPlanId === p.id;
            return (
              <div
                key={p.id}
                className={`previa-card p-6 flex flex-col justify-between ${
                  isCurrent ? 'border-2 border-primary-600 bg-primary-50/20 shadow-sm' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-base text-slate-900">{p.name}</h4>
                    {isCurrent && <Badge variant="primary">Current Plan</Badge>}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">₹{p.priceInrMonthly}</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      {p.maxNoticesPerMonth} AI Notices / month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      {p.maxActivityPlansPerMonth} Activity Plans / month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      Up to {p.maxStudents} Students ({p.maxClasses} Classes)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      Gujarati, Hindi & English notices
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    disabled={isCurrent || updatingPlan === p.id}
                    onClick={() => handleChangePlan(p.id)}
                    className={`w-full text-xs py-2.5 rounded-xl font-semibold transition-all ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
                    }`}
                  >
                    {updatingPlan === p.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                    ) : isCurrent ? (
                      'Current Active Tier'
                    ) : (
                      `Switch to ${p.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
