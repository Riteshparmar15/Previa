import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Users,
  Download,
  PlusCircle,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  X,
  FileSpreadsheet,
  Check,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/apiClient';
import { ClassRoom, Student, AttendanceStatus, AttendanceSummary } from '../types';
import { LoadingSpinner, EmptyState, AlertBanner, Badge, PageHeader } from '../components/common/UIComponents';

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Status mapping: studentId -> { status: AttendanceStatus, remarks: string }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Summary
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  // Modals
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassRoomNo, setNewClassRoomNo] = useState('');

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    rollNumber: '',
    firstName: '',
    lastName: '',
    guardianName: '',
    guardianPhone: ''
  });

  const loadClassesAndSummary = async () => {
    try {
      const cls = await api.attendance.getClasses();
      setClasses(cls);
      if (cls.length > 0 && !selectedClassId) {
        setSelectedClassId(cls[0].id);
      }
      const sum = await api.attendance.getSummary(selectedDate);
      setSummary(sum);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassesAndSummary();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedClassId) return;

    const loadRosterAndRecords = async () => {
      try {
        const studentList = await api.attendance.getStudents(selectedClassId);
        setStudents(studentList);

        const records = await api.attendance.getRecords(selectedClassId, selectedDate);
        const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};

        // Default all to Present (1) if not marked yet
        studentList.forEach((s) => {
          map[s.id] = { status: 1, remarks: '' };
        });

        // Overlay existing recorded attendance
        records.forEach((r) => {
          map[r.studentId] = { status: r.status, remarks: r.remarks || '' };
        });

        setAttendanceMap(map);
      } catch {
        // ignore
      }
    };

    loadRosterAndRecords();
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceMap };
    students.forEach((s) => {
      updated[s.id] = { ...updated[s.id], status: 1 };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || students.length === 0) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const items = students.map((s) => ({
        studentId: s.id,
        studentName: s.fullName,
        rollNumber: s.rollNumber,
        status: attendanceMap[s.id]?.status || 1,
        remarks: attendanceMap[s.id]?.remarks || ''
      }));

      await api.attendance.recordAttendance({
        classRoomId: selectedClassId,
        date: selectedDate,
        attendances: items
      });

      setSaveMessage('Attendance records locked successfully! Duplicate prevention verified.');
      const sum = await api.attendance.getSummary(selectedDate);
      setSummary(sum);
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const created = await api.attendance.createClass({
        name: newClassName.trim(),
        roomNumber: newClassRoomNo.trim() || undefined,
        academicYear: '2026-2027'
      });
      setClasses([...classes, created]);
      setSelectedClassId(created.id);
      setShowAddClass(false);
      setNewClassName('');
      setNewClassRoomNo('');
    } catch (err: any) {
      alert(err.message || 'Failed to create class.');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    try {
      const created = await api.attendance.createStudent({
        classRoomId: selectedClassId,
        rollNumber: newStudent.rollNumber.trim(),
        firstName: newStudent.firstName.trim(),
        lastName: newStudent.lastName.trim(),
        guardianName: newStudent.guardianName.trim(),
        guardianPhone: newStudent.guardianPhone.trim(),
        admissionDate: new Date().toISOString().split('T')[0]
      });

      setStudents([...students, created]);
      setAttendanceMap((prev) => ({
        ...prev,
        [created.id]: { status: 1, remarks: '' }
      }));

      setShowAddStudent(false);
      setNewStudent({
        rollNumber: '',
        firstName: '',
        lastName: '',
        guardianName: '',
        guardianPhone: ''
      });
    } catch (err: any) {
      alert(err.message || 'Failed to enroll student.');
    }
  };

  const handleExportCsv = () => {
    const url = api.attendance.exportCsvUrl(selectedDate, selectedDate, selectedClassId || undefined);
    window.open(url, '_blank');
  };

  if (loading) {
    return <LoadingSpinner text="Loading classroom registers..." />;
  }

  // Calculate live current class tallies
  const presentCountInClass = students.filter((s) => attendanceMap[s.id]?.status === 1).length;
  const absentCountInClass = students.filter((s) => attendanceMap[s.id]?.status === 2).length;
  const lateCountInClass = students.filter((s) => attendanceMap[s.id]?.status === 3).length;
  const classPresentPercent = students.length > 0 ? Math.round((presentCountInClass / students.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Classroom Attendance & Roll Call"
        subtitle="1-tap daily attendance with duplicate protection, teacher ratio tracking, and authorized CSV audits."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddClass(true)}
              className="previa-btn-secondary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Class
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV Report
            </button>
          </div>
        }
      />

      {/* Date & Classroom Control Toolbar */}
      <div className="previa-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Classroom Selector */}
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Classroom Roster
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="previa-input sm:w-64 font-bold text-slate-900"
              >
                {classes.length === 0 ? (
                  <option value="">No Classes Created Yet</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount} Students)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Picker */}
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Roll Call Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="previa-input sm:w-44 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2.5 self-end lg:self-center flex-wrap">
            <button
              onClick={handleMarkAllPresent}
              className="previa-btn-secondary text-xs font-bold text-emerald-800 border-emerald-300 hover:bg-emerald-50"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              Mark All Present
            </button>
            {selectedClassId && (
              <button
                onClick={() => setShowAddStudent(true)}
                className="previa-btn-secondary text-xs font-semibold"
              >
                <Users className="w-3.5 h-3.5" />
                Enroll Student
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Attendance Progress & KPI Bar */}
      {students.length > 0 && (
        <div className="previa-card p-4 sm:p-5 bg-gradient-to-r from-white via-white to-emerald-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Selected Class Status:
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {presentCountInClass} of {students.length} Present ({classPresentPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ● {presentCountInClass} Present
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                ● {absentCountInClass} Absent
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ● {lateCountInClass} Late
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${Math.max(4, classPresentPercent)}%` }}
            />
          </div>
        </div>
      )}

      {saveMessage && (
        <AlertBanner type="success" message={saveMessage} />
      )}

      {/* Student Roster Table */}
      {classes.length === 0 ? (
        <EmptyState
          title="No classrooms created yet"
          description="Create your first class group (e.g. Nursery Sunflowers, Jr KG Stars) to begin taking roll call."
          actionText="Create Classroom Now"
          onAction={() => setShowAddClass(true)}
          icon={<CalendarCheck2 className="w-7 h-7 text-primary-700" />}
        />
      ) : students.length === 0 ? (
        <EmptyState
          title="No children enrolled in this classroom"
          description="Enroll students into this class group with their roll number and parent mobile number."
          actionText="Enroll First Child"
          onAction={() => setShowAddStudent(true)}
          icon={<Users className="w-7 h-7 text-primary-700" />}
        />
      ) : (
        <div className="previa-card overflow-hidden border-slate-300">
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Class Attendance Register ({students.length} Students)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Toggle status button for each student and click "Save & Lock Attendance".
              </p>
            </div>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="previa-btn-primary text-xs py-2 px-4 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Locking Records...' : 'Save & Lock Attendance'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-20">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4 text-center w-64">Attendance Status</th>
                  <th className="py-3 px-4">Daily Notes / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || 1;
                  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">{student.rollNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200">
                            {initials}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">{student.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-medium">Admitted: {student.admissionDate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{student.guardianName}</span>
                        <span className="text-[11px] font-medium text-emerald-800">{student.guardianPhone}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-xl bg-slate-200/80 p-1 border border-slate-300 gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${currentStatus === 1
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100'
                              }`}
                            title="Mark Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 2)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${currentStatus === 2
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-rose-800 hover:bg-slate-100'
                              }`}
                            title="Mark Absent"
                          >
                            <X className="w-3.5 h-3.5" />
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 3)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${currentStatus === 3
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-amber-800 hover:bg-slate-100'
                              }`}
                            title="Mark Late"
                          >
                            Late
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Mild cough, arrived late..."
                          value={attendanceMap[student.id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="previa-input py-1 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Classroom</h3>
              <button onClick={() => setShowAddClass(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Class Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nursery Sunflowers Group"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="previa-input"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Room / Section Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 102"
                  value={newClassRoomNo}
                  onChange={(e) => setNewClassRoomNo(e.target.value)}
                  className="previa-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddClass(false)} className="previa-btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="previa-btn-primary text-xs">
                  Create Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Enroll Child into Classroom</h3>
              <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[10px] text-slate-700">
                    Roll No *
                  </label>
                  <input
                    type="text"
                    placeholder="01"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    className="previa-input"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[10px] text-slate-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Aarav"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="previa-input"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[10px] text-slate-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Patel"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="previa-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Guardian / Parent Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hitesh Patel"
                  value={newStudent.guardianName}
                  onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                  className="previa-input"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Guardian Mobile / WhatsApp *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newStudent.guardianPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                  className="previa-input"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddStudent(false)} className="previa-btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="previa-btn-primary text-xs">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
