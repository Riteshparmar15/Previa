export type UserRole = 'Owner' | 'Admin' | 'Teacher' | 'Staff';
export type SupportedLanguage = 1 | 2 | 3; // 1 = English, 2 = Gujarati, 3 = Hindi
export type NoticeCategory = 1 | 2 | 3 | 4 | 5 | 6; // General, Holiday, Event, Emergency, FeeReminder, Celebration
export type NoticeAudience = 1 | 2 | 3; // AllParents, SpecificClass, Staff
export type ToneStyle = 1 | 2 | 3 | 4; // Warm, Formal, Urgent, Friendly
export type AttendanceStatus = 1 | 2 | 3 | 4; // Present, Absent, Late, Excused
export type FeeStatus = 1 | 2 | 3 | 4; // Pending, Paid, Overdue, PartiallyPaid

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  organisationId: string;
  organisationName: string;
  organisationCity: string;
  role: UserRole;
  preferredLanguage: SupportedLanguage;
  timeZoneId: string;
  subscriptionTier: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  organisationId: string;
  organisationName: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  needsOnboarding: boolean;
}

export interface NoticeItem {
  id: string;
  organisationId: string;
  title: string;
  messageBody: string;
  whatsAppVersion?: string;
  category: NoticeCategory;
  targetAudience: NoticeAudience;
  classRoomId?: string;
  classRoomName?: string;
  language: SupportedLanguage;
  tone: ToneStyle;
  isDraft: boolean;
  createdAtUtc: string;
}

export interface ActivityDay {
  dayNumber: number;
  dayTheme: string;
  activityName: string;
  objective: string;
  materialsNeeded: string;
  stepByStepInstructions: string;
  durationMinutes: string;
  abilityAdaptations: string;
  safetyConsiderations: string;
}

export interface ActivityPlanItem {
  id: string;
  organisationId: string;
  topic: string;
  ageGroup: string;
  numberOfDays: number;
  learningObjectives: string;
  materials: string;
  setting: string;
  language: SupportedLanguage;
  classRoomId?: string;
  classRoomName?: string;
  days: ActivityDay[];
  createdAtUtc: string;
}

export interface ClassRoom {
  id: string;
  organisationId: string;
  name: string;
  description?: string;
  academicYear: string;
  roomNumber?: string;
  studentCount: number;
  isActive: boolean;
}

export interface Student {
  id: string;
  organisationId: string;
  classRoomId: string;
  classRoomName: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  admissionDate: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classRoomId: string;
  classRoomName: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedAtUtc: string;
}

export interface AttendanceSummary {
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

export interface FeeRecord {
  id: string;
  organisationId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  guardianName: string;
  guardianPhone: string;
  feePeriod: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  dueDate: string;
  status: FeeStatus;
  notes?: string;
  createdAtUtc: string;
}

export interface NoticeTemplate {
  id: string;
  organisationId?: string;
  title: string;
  category: NoticeCategory;
  subjectTemplate: string;
  bodyTemplate: string;
  whatsAppTemplate?: string;
  language: SupportedLanguage;
  isSystemTemplate: boolean;
  isArchived: boolean;
  createdAtUtc: string;
}

export interface OrganisationSubscription {
  organisationId: string;
  organisationName: string;
  subscriptionPlanId: string;
  planName: string;
  tier: number;
  status: number;
  currentPeriodStartUtc: string;
  currentPeriodEndUtc: string;
  trialEndsAtUtc?: string;
  noticesGeneratedThisMonth: number;
  maxNoticesPerMonth: number;
  activityPlansGeneratedThisMonth: number;
  maxActivityPlansPerMonth: number;
  currentStudentCount: number;
  maxStudents: number;
  currentClassCount: number;
  maxClasses: number;
  canGenerateNotice: boolean;
  canGenerateActivityPlan: boolean;
  canAddStudent: boolean;
  canAddClass: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  noticesCount: number;
  activityPlansCount: number;
  todayAttendance: AttendanceSummary;
  subscription: OrganisationSubscription;
  recentNotices: NoticeItem[];
  recentAiActivities: {
    id: string;
    type: string;
    modelName: string;
    createdAtUtc: string;
    isSuccess: boolean;
  }[];
  pendingFeeRecordsCount: number;
  totalPendingFeeAmount: number;
}
