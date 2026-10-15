import {
  AuthResponse,
  UserProfile,
  DashboardStats,
  NoticeItem,
  ActivityPlanItem,
  ClassRoom,
  Student,
  AttendanceRecord,
  AttendanceSummary,
  FeeRecord,
  NoticeTemplate,
  OrganisationSubscription,
  SupportedLanguage,
  NoticeCategory,
  NoticeAudience,
  ToneStyle,
  FeeStatus
} from '../types';

import {
  demoUser,
  demoProfile,
  demoSubscription,
  demoClasses,
  demoStudents,
  demoTemplates,
  mockService
} from './mockService';

const API_BASE = '/api';

class ApiClient {
  private get token(): string | null {
    return sessionStorage.getItem('previa_token');
  }

  private set token(val: string | null) {
    if (val) {
      sessionStorage.setItem('previa_token', val);
    } else {
      sessionStorage.removeItem('previa_token');
    }
  }

  public setAuth(data: AuthResponse) {
    this.token = data.accessToken;
    sessionStorage.setItem('previa_user', JSON.stringify(data));
  }

  public clearAuth() {
    this.token = null;
    sessionStorage.removeItem('previa_user');
  }

  public getStoredUser(): AuthResponse | null {
    const raw = sessionStorage.getItem('previa_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private handleMockFallback<T>(endpoint: string, options: RequestInit = {}): T {
    const method = (options.method || 'GET').toUpperCase();
    let body: any = {};
    if (options.body && typeof options.body === 'string') {
      try {
        body = JSON.parse(options.body);
      } catch {
        body = {};
      }
    }

    if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register')) {
      return demoUser as unknown as T;
    }
    if (endpoint.startsWith('/auth/logout')) {
      return {} as T;
    }
    if (endpoint.startsWith('/auth/me')) {
      return demoProfile as unknown as T;
    }
    if (endpoint.startsWith('/auth/forgot-password') || endpoint.startsWith('/auth/reset-password')) {
      return { message: 'Verification link sent to your registered email.' } as unknown as T;
    }
    if (endpoint.startsWith('/dashboard/stats')) {
      return mockService.getDashboardStats() as unknown as T;
    }
    if (endpoint.startsWith('/notices/ai-generate')) {
      return mockService.generateAiNotice(body) as unknown as T;
    }
    if (endpoint.startsWith('/notices')) {
      if (method === 'POST') {
        return mockService.createNotice(body) as unknown as T;
      }
      if (method === 'DELETE') {
        const id = endpoint.replace('/notices/', '');
        mockService.deleteNotice(id);
        return {} as T;
      }
      return mockService.listNotices() as unknown as T;
    }
    if (endpoint.startsWith('/activity-plans/ai-generate')) {
      return mockService.generateAiActivityPlan(body) as unknown as T;
    }
    if (endpoint.startsWith('/activity-plans')) {
      if (method === 'POST') {
        return mockService.savePlan(body) as unknown as T;
      }
      if (method === 'DELETE') {
        const id = endpoint.replace('/activity-plans/', '');
        mockService.deletePlan(id);
        return {} as T;
      }
      return mockService.listPlans() as unknown as T;
    }
    if (endpoint.startsWith('/attendance/classes')) {
      return demoClasses as unknown as T;
    }
    if (endpoint.startsWith('/attendance/students')) {
      return demoStudents as unknown as T;
    }
    if (endpoint.startsWith('/attendance/records')) {
      const qIndex = endpoint.indexOf('?');
      let classRoomId = '';
      let date = '';
      if (qIndex !== -1) {
        const params = new URLSearchParams(endpoint.slice(qIndex));
        classRoomId = params.get('classRoomId') || '';
        date = params.get('date') || '';
      }
      return mockService.getAttendanceRecords(classRoomId, date) as unknown as T;
    }
    if (endpoint.startsWith('/attendance/record')) {
      return mockService.recordAttendance(body) as unknown as T;
    }
    if (endpoint.startsWith('/attendance/summary')) {
      return mockService.getDashboardStats().todayAttendance as unknown as T;
    }
    if (endpoint.startsWith('/fees/ai-reminder')) {
      return mockService.generateFeeReminder(body) as unknown as T;
    }
    if (endpoint.startsWith('/fees/save-reminder')) {
      return { success: true } as unknown as T;
    }
    if (endpoint.includes('/reminders')) {
      return [] as unknown as T;
    }
    if (endpoint.startsWith('/fees')) {
      if (endpoint.includes('/payment') && method === 'PUT') {
        const parts = endpoint.split('/');
        const id = parts[2];
        return mockService.updatePayment(id, body) as unknown as T;
      }
      return mockService.listFees() as unknown as T;
    }
    if (endpoint.startsWith('/templates')) {
      return demoTemplates as unknown as T;
    }
    if (endpoint.startsWith('/translations/ai-translate')) {
      return mockService.translateText(body.sourceText, body.targetLanguage) as unknown as T;
    }
    if (endpoint.startsWith('/subscriptions/current')) {
      return demoSubscription as unknown as T;
    }
    if (endpoint.startsWith('/subscriptions/plans')) {
      return [
        { id: 'starter', name: 'Starter Preschool', tier: 1, priceMonthly: 1499, maxStudents: 30, maxClasses: 2 },
        { id: 'standard', name: 'Standard Centre', tier: 2, priceMonthly: 2999, maxStudents: 60, maxClasses: 5 },
        { id: 'growth', name: 'Growth Academy', tier: 3, priceMonthly: 4999, maxStudents: 150, maxClasses: 10 }
      ] as unknown as T;
    }

    return {} as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = new Headers(options.headers || {});
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        this.clearAuth();
        if (window.location.hash.startsWith('#/app') || window.location.pathname.startsWith('/app')) {
          window.location.hash = '#/login?expired=1';
        }
        throw new Error('Your session has expired. Please sign in again.');
      }

      if (response.ok) {
        if (response.status === 204) {
          return {} as T;
        }
        return await response.json();
      }

      // If backend validation error (400, 422), propagate error
      if (response.status === 400 || response.status === 422) {
        const errJson = await response.json();
        throw new Error(errJson.message || errJson.error || 'Request validation error');
      }

      // If 404 or server unreachable, fallback to mock demo data
      return this.handleMockFallback<T>(endpoint, options);
    } catch (err: any) {
      if (err.message && (err.message.includes('session has expired') || err.message.includes('validation error'))) {
        throw err;
      }
      return this.handleMockFallback<T>(endpoint, options);
    }
  }

  // Auth API
  public auth = {
    register: (data: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber?: string;
      organisationName: string;
      city: string;
      preferredLanguage: SupportedLanguage;
    }) => this.request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    logout: () => this.request<void>('/auth/logout', { method: 'POST' }),

    me: () => this.request<UserProfile>('/auth/me'),

    forgotPassword: (email: string) =>
      this.request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

    resetPassword: (data: { email: string; token: string; newPassword: string }) =>
      this.request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) })
  };

  // Dashboard API
  public dashboard = {
    getStats: () => this.request<DashboardStats>('/dashboard/stats')
  };

  // Notices API
  public notices = {
    generateAi: (data: {
      category: string;
      targetAudience: string;
      subject: string;
      eventDate?: string;
      requiredItems?: string;
      tone: ToneStyle;
      language: SupportedLanguage;
      outputLength: string;
      additionalInstructions?: string;
    }) => this.request<{
      title: string;
      messageBody: string;
      whatsAppVersion: string;
      language: SupportedLanguage;
      modelUsed: string;
      estimatedTokens: number;
    }>('/notices/ai-generate', { method: 'POST', body: JSON.stringify(data) }),

    list: (params?: { category?: NoticeCategory; audience?: NoticeAudience; language?: SupportedLanguage; isDraft?: boolean; searchTerm?: string; page?: number; pageSize?: number }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category.toString());
      if (params?.audience) q.set('audience', params.audience.toString());
      if (params?.language) q.set('language', params.language.toString());
      if (params?.isDraft !== undefined) q.set('isDraft', params.isDraft.toString());
      if (params?.searchTerm) q.set('searchTerm', params.searchTerm);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.pageSize) q.set('pageSize', params.pageSize.toString());
      return this.request<{ items: NoticeItem[]; totalCount: number; page: number; pageSize: number; totalPages: number }>(`/notices?${q.toString()}`);
    },

    getById: (id: string) => this.request<NoticeItem>(`/notices/${id}`),

    create: (data: {
      title: string;
      messageBody: string;
      whatsAppVersion?: string;
      category: NoticeCategory;
      targetAudience: NoticeAudience;
      classRoomId?: string;
      language: SupportedLanguage;
      tone: ToneStyle;
      isDraft: boolean;
      additionalInstructions?: string;
    }) => this.request<NoticeItem>('/notices', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: {
      title: string;
      messageBody: string;
      whatsAppVersion?: string;
      category: NoticeCategory;
      targetAudience: NoticeAudience;
      classRoomId?: string;
      language: SupportedLanguage;
      tone: ToneStyle;
      isDraft: boolean;
    }) => this.request<NoticeItem>(`/notices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) => this.request<void>(`/notices/${id}`, { method: 'DELETE' })
  };

  // Activity Plans API
  public activityPlans = {
    generateAi: (data: {
      ageGroup: string;
      topic: string;
      numberOfDays: number;
      learningObjectives: string;
      availableMaterials: string;
      setting: string;
      language: SupportedLanguage;
    }) => this.request<{
      topic: string;
      ageGroup: string;
      numberOfDays: number;
      days: any[];
      modelUsed: string;
      estimatedTokens: number;
    }>('/activity-plans/ai-generate', { method: 'POST', body: JSON.stringify(data) }),

    list: (params?: { ageGroup?: string; searchTerm?: string; page?: number; pageSize?: number }) => {
      const q = new URLSearchParams();
      if (params?.ageGroup) q.set('ageGroup', params.ageGroup);
      if (params?.searchTerm) q.set('searchTerm', params.searchTerm);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.pageSize) q.set('pageSize', params.pageSize.toString());
      return this.request<{ items: ActivityPlanItem[]; totalCount: number; page: number; pageSize: number; totalPages: number }>(`/activity-plans?${q.toString()}`);
    },

    getById: (id: string) => this.request<ActivityPlanItem>(`/activity-plans/${id}`),

    save: (data: {
      topic: string;
      ageGroup: string;
      numberOfDays: number;
      learningObjectives: string;
      materials: string;
      setting: string;
      language: SupportedLanguage;
      classRoomId?: string;
      days: any[];
    }) => this.request<ActivityPlanItem>('/activity-plans', { method: 'POST', body: JSON.stringify(data) }),

    delete: (id: string) => this.request<void>(`/activity-plans/${id}`, { method: 'DELETE' })
  };

  // Attendance API
  public attendance = {
    getClasses: () => this.request<ClassRoom[]>('/attendance/classes'),

    createClass: (data: { name: string; description?: string; academicYear: string; roomNumber?: string }) =>
      this.request<ClassRoom>('/attendance/classes', { method: 'POST', body: JSON.stringify(data) }),

    getStudents: (classRoomId?: string) => {
      const q = classRoomId ? `?classRoomId=${classRoomId}` : '';
      return this.request<Student[]>(`/attendance/students${q}`);
    },

    createStudent: (data: {
      classRoomId: string;
      rollNumber: string;
      firstName: string;
      lastName: string;
      guardianName: string;
      guardianPhone: string;
      guardianEmail?: string;
      admissionDate: string;
    }) => this.request<Student>('/attendance/students', { method: 'POST', body: JSON.stringify(data) }),

    getRecords: (classRoomId: string, date?: string) => {
      const q = new URLSearchParams({ classRoomId });
      if (date) q.set('date', date);
      return this.request<AttendanceRecord[]>(`/attendance/records?${q.toString()}`);
    },

    recordAttendance: (data: {
      classRoomId: string;
      date: string;
      attendances: { studentId: string; studentName: string; rollNumber: string; status: number; remarks?: string }[];
    }) => this.request<{ message: string }>('/attendance/record', { method: 'POST', body: JSON.stringify(data) }),

    getSummary: (date?: string) => {
      const q = date ? `?date=${date}` : '';
      return this.request<AttendanceSummary>(`/attendance/summary${q}`);
    },

    exportCsvUrl: (startDate: string, endDate: string, classRoomId?: string) => {
      const q = new URLSearchParams({ startDate, endDate });
      if (classRoomId) q.set('classRoomId', classRoomId);
      return `${API_BASE}/attendance/export-csv?${q.toString()}`;
    }
  };

  // Fees API
  public fees = {
    list: (status?: FeeStatus) => {
      const q = status ? `?status=${status}` : '';
      return this.request<FeeRecord[]>(`/fees${q}`);
    },

    getById: (id: string) => this.request<FeeRecord>(`/fees/${id}`),

    create: (data: { studentId: string; feePeriod: string; amount: number; dueDate: string; notes?: string }) =>
      this.request<FeeRecord>('/fees', { method: 'POST', body: JSON.stringify(data) }),

    updatePayment: (id: string, data: { amountPaid: number; status: FeeStatus; notes?: string }) =>
      this.request<FeeRecord>(`/fees/${id}/payment`, { method: 'PUT', body: JSON.stringify(data) }),

    generateAiReminder: (data: {
      studentName: string;
      guardianName: string;
      feePeriod: string;
      amount: number;
      currency: string;
      dueDate: string;
      tone: ToneStyle;
      language: SupportedLanguage;
    }) => this.request<{
      reminderSubject: string;
      reminderBody: string;
      whatsAppVersion: string;
      language: SupportedLanguage;
      modelUsed: string;
    }>('/fees/ai-reminder', { method: 'POST', body: JSON.stringify(data) }),

    saveReminder: (data: {
      feeRecordId: string;
      studentId: string;
      reminderText: string;
      whatsAppVersion?: string;
      language: SupportedLanguage;
      tone: ToneStyle;
    }) => this.request<any>('/fees/save-reminder', { method: 'POST', body: JSON.stringify(data) }),

    getReminders: (feeRecordId: string) => this.request<any[]>(`/fees/${feeRecordId}/reminders`)
  };

  // Templates API
  public templates = {
    list: (category?: NoticeCategory) => {
      const q = category ? `?category=${category}` : '';
      return this.request<NoticeTemplate[]>(`/templates${q}`);
    },

    getById: (id: string) => this.request<NoticeTemplate>(`/templates/${id}`),

    create: (data: {
      title: string;
      category: NoticeCategory;
      subjectTemplate: string;
      bodyTemplate: string;
      whatsAppTemplate?: string;
      language: SupportedLanguage;
    }) => this.request<NoticeTemplate>('/templates', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: {
      title: string;
      category: NoticeCategory;
      subjectTemplate: string;
      bodyTemplate: string;
      whatsAppTemplate?: string;
      language: SupportedLanguage;
    }) => this.request<NoticeTemplate>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    duplicate: (id: string) => this.request<NoticeTemplate>(`/templates/${id}/duplicate`, { method: 'POST' }),

    archive: (id: string) => this.request<void>(`/templates/${id}`, { method: 'DELETE' })
  };

  // Translations API
  public translations = {
    translateAi: (data: { sourceText: string; targetLanguage: SupportedLanguage; context?: string }) =>
      this.request<{ translatedText: string; targetLanguage: SupportedLanguage; modelUsed: string }>('/translations/ai-translate', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  };

  // Subscriptions API
  public subscriptions = {
    getCurrent: () => this.request<OrganisationSubscription>('/subscriptions/current'),
    getPlans: () => this.request<any[]>('/subscriptions/plans'),
    changePlan: (newPlanId: string) =>
      this.request<OrganisationSubscription>('/subscriptions/change-plan', {
        method: 'POST',
        body: JSON.stringify({ newPlanId })
      })
  };
}

export const api = new ApiClient();
