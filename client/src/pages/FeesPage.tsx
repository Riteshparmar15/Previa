import React, { useState, useEffect } from 'react';
import {
  ReceiptIndianRupee,
  PlusCircle,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { api } from '../api/apiClient';
import { FeeRecord, FeeStatus, Student, SupportedLanguage, ToneStyle } from '../types';
import { LoadingSpinner, EmptyState, AlertBanner, Badge, PageHeader, WhatsAppPreviewBubble } from '../components/common/UIComponents';

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeeStatus | undefined>(undefined);

  // Modals
  const [showAddFee, setShowAddFee] = useState(false);
  const [newFee, setNewFee] = useState({
    studentId: '',
    feePeriod: 'Term 2 (Oct - Dec 2026)',
    amount: 4500,
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    notes: 'Includes activity kit & daycare material fees'
  });

  const [reminderModal, setReminderModal] = useState<FeeRecord | null>(null);
  const [reminderLanguage, setReminderLanguage] = useState<SupportedLanguage>(2); // Gujarati default
  const [reminderTone, setReminderTone] = useState<ToneStyle>(4); // Friendly
  const [generatingReminder, setGeneratingReminder] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{
    subject: string;
    body: string;
    whatsApp: string;
  } | null>(null);

  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Payment status modal
  const [paymentModal, setPaymentModal] = useState<FeeRecord | null>(null);
  const [paidInput, setPaidInput] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<FeeStatus>(2);

  const loadData = async () => {
    try {
      const records = await api.fees.list(statusFilter);
      setFees(records);
      const studentList = await api.attendance.getStudents();
      setStudents(studentList);
      if (studentList.length > 0 && !newFee.studentId) {
        setNewFee((prev) => ({ ...prev, studentId: studentList[0].id }));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.studentId || newFee.amount <= 0) return;
    try {
      const record = await api.fees.create({
        studentId: newFee.studentId,
        feePeriod: newFee.feePeriod.trim(),
        amount: Number(newFee.amount),
        dueDate: newFee.dueDate,
        notes: newFee.notes.trim() || undefined
      });
      setFees([...fees, record]);
      setShowAddFee(false);
    } catch (err: any) {
      alert(err.message || 'Failed to record fee.');
    }
  };

  const handleGenerateReminder = async () => {
    if (!reminderModal) return;
    setGeneratingReminder(true);
    setGeneratedDraft(null);
    try {
      const res = await api.fees.generateAiReminder({
        studentName: reminderModal.studentName,
        guardianName: reminderModal.guardianName,
        feePeriod: reminderModal.feePeriod,
        amount: reminderModal.pendingAmount,
        currency: reminderModal.currency,
        dueDate: reminderModal.dueDate,
        tone: reminderTone,
        language: reminderLanguage
      });

      setGeneratedDraft({
        subject: res.reminderSubject,
        body: res.reminderBody,
        whatsApp: res.whatsAppVersion
      });
    } catch (err: any) {
      alert(err.message || 'Failed to generate reminder draft.');
    } finally {
      setGeneratingReminder(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!reminderModal || !generatedDraft) return;
    try {
      await api.fees.saveReminder({
        feeRecordId: reminderModal.id,
        studentId: reminderModal.studentId,
        reminderText: generatedDraft.body,
        whatsAppVersion: generatedDraft.whatsApp,
        language: reminderLanguage,
        tone: reminderTone
      });
      alert('Draft reminder saved to student communication history!');
      setReminderModal(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save reminder draft.');
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;
    try {
      const updated = await api.fees.updatePayment(paymentModal.id, {
        amountPaid: Number(paidInput),
        status: paymentStatus
      });
      if (updated) {
        setFees(fees.map((f) => (f.id === updated.id ? updated : f)));
      }
      setPaymentModal(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update payment.');
    }
  };

  const copyText = (text: string, isWa: boolean) => {
    navigator.clipboard.writeText(text);
    if (isWa) {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving fee ledger & records..." />;
  }

  // Summary financials
  const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((acc, f) => acc + f.pendingAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Fee Reminder Assistant & Ledger"
        subtitle="Manage quarterly preschool fee records and synthesize respectful, polite parent reminders in regional languages."
        actions={
          <button
            onClick={() => setShowAddFee(true)}
            className="previa-btn-primary text-xs shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student Fee Term
          </button>
        }
      />

      {/* 3 High-Visibility Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="previa-card p-5 border-l-4 border-l-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed Fees</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-500">₹</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalBilled.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Across {fees.length} student records</p>
        </div>

        <div className="previa-card p-5 border-l-4 border-l-emerald-600 bg-emerald-50/20">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Collected</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-bold text-emerald-700">₹</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {totalCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% Collection rate
          </p>
        </div>

        <div className="previa-card p-5 border-l-4 border-l-amber-600 bg-amber-50/20">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Total Outstanding Dues</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-bold text-amber-800">₹</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-800 tracking-tight">
              {totalOutstanding.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-amber-800 mt-1">
            {fees.filter((f) => f.status === 1 || f.status === 3).length} student fee(s) pending
          </p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl w-fit">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === undefined ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Terms ({fees.length})
        </button>
        <button
          onClick={() => setStatusFilter(1)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending ({fees.filter((f) => f.status === 1).length})
        </button>
        <button
          onClick={() => setStatusFilter(3)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === 3 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overdue ({fees.filter((f) => f.status === 3).length})
        </button>
        <button
          onClick={() => setStatusFilter(2)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Paid ({fees.filter((f) => f.status === 2).length})
        </button>
      </div>

      {/* Ledger Table */}
      {fees.length === 0 ? (
        <EmptyState
          title="No fee records recorded yet"
          description="Create your first fee term entry to prepare gentle, culturally respectful parent reminders."
          actionText="Add Fee Record"
          onAction={() => setShowAddFee(true)}
          icon={<ReceiptIndianRupee className="w-7 h-7 text-primary-700" />}
        />
      ) : (
        <div className="previa-card overflow-hidden border-slate-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4">Period / Term</th>
                  <th className="py-3 px-4">Billed Amount</th>
                  <th className="py-3 px-4">Paid / Balance</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fees.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 text-sm block">{record.studentName}</span>
                      <span className="text-[11px] font-medium text-slate-500">Roll: {record.rollNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{record.guardianName}</span>
                      <span className="text-[11px] font-semibold text-emerald-800">{record.guardianPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{record.feePeriod}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{record.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold block">
                        ₹{record.paidAmount.toLocaleString('en-IN')} Paid
                      </span>
                      {record.pendingAmount > 0 && (
                        <span className="text-[11px] font-bold text-amber-800">
                          Due: ₹{record.pendingAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {new Date(record.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={record.status === 2 ? 'success' : record.status === 3 ? 'danger' : 'warning'}>
                        {record.status === 2 ? 'Paid' : record.status === 3 ? 'Overdue' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setPaymentModal(record);
                          setPaidInput(record.paidAmount);
                          setPaymentStatus(record.status);
                        }}
                        className="previa-btn-secondary text-xs py-1.5 px-2.5 font-bold"
                        title="Update payment status"
                      >
                        Payment
                      </button>
                      <button
                        onClick={() => {
                          setReminderModal(record);
                          setGeneratedDraft(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
                        title="Prepare reminder"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prepare AI Reminder Modal */}
      {reminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  AI Fee Reminder Assistant
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Reminder for {reminderModal.studentName} ({reminderModal.feePeriod})
                </h3>
              </div>
              <button onClick={() => setReminderModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Reminder Language (ભાષા)
                </label>
                <select
                  value={reminderLanguage}
                  onChange={(e) => setReminderLanguage(Number(e.target.value) as SupportedLanguage)}
                  className="previa-input font-bold text-teal-800"
                >
                  <option value={2}>Gujarati (ગુજરાતી)</option>
                  <option value={1}>English</option>
                  <option value={3}>Hindi (हिन्दी)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Tone & Manner
                </label>
                <select
                  value={reminderTone}
                  onChange={(e) => setReminderTone(Number(e.target.value) as ToneStyle)}
                  className="previa-input font-bold"
                >
                  <option value={4}>Friendly & Respectful</option>
                  <option value={1}>Warm & Polite</option>
                  <option value={2}>Formal & Direct</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateReminder}
              disabled={generatingReminder}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-primary-700 hover:bg-primary-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generatingReminder ? 'Synthesizing polite reminder with AI...' : 'Generate Respectful Reminder'}
            </button>

            {generatedDraft && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                    WhatsApp Message Preview
                  </span>
                  <WhatsAppPreviewBubble
                    message={generatedDraft.whatsApp}
                    onCopy={() => copyText(generatedDraft.whatsApp, true)}
                    copied={copiedWa}
                  />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                    Formal Circular Format
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs whitespace-pre-line leading-relaxed text-slate-900 font-sans">
                    {generatedDraft.body}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button onClick={handleSaveDraft} className="previa-btn-primary text-xs">
                    Save to Student Records
                  </button>
                  <button onClick={() => setReminderModal(null)} className="previa-btn-secondary text-xs">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Fee Term Modal */}
      {showAddFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add Fee Record</h3>
              <button onClick={() => setShowAddFee(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="space-y-3.5">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Select Student *
                </label>
                <select
                  value={newFee.studentId}
                  onChange={(e) => setNewFee({ ...newFee, studentId: e.target.value })}
                  className="previa-input font-bold"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} (Roll: {s.rollNumber} • {s.classRoomName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Fee Term / Period *
                </label>
                <input
                  type="text"
                  value={newFee.feePeriod}
                  onChange={(e) => setNewFee({ ...newFee, feePeriod: e.target.value })}
                  placeholder="e.g. Term 2 (Oct - Dec 2026)"
                  className="previa-input font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                    className="previa-input font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                    className="previa-input font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddFee(false)} className="previa-btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="previa-btn-primary text-xs">
                  Create Fee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Update Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Update Fee Payment</h3>
              <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Student</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{paymentModal.studentName}</p>
                <p className="text-xs text-slate-600 font-medium">Billed: ₹{paymentModal.amount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Amount Received (INR ₹)
                </label>
                <input
                  type="number"
                  value={paidInput}
                  onChange={(e) => setPaidInput(Number(e.target.value))}
                  className="previa-input font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Updated Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(Number(e.target.value) as FeeStatus)}
                  className="previa-input font-bold"
                >
                  <option value={2}>Paid (Full Payment Received)</option>
                  <option value={4}>Partially Paid</option>
                  <option value={1}>Pending</option>
                  <option value={3}>Overdue</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setPaymentModal(null)} className="previa-btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="previa-btn-primary text-xs">
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
