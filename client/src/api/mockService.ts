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

const STORAGE_KEY_NOTICES = 'previa_demo_notices';
const STORAGE_KEY_ATTENDANCE = 'previa_demo_attendance';
const STORAGE_KEY_FEES = 'previa_demo_fees';
const STORAGE_KEY_PLANS = 'previa_demo_plans';

export const demoUser: AuthResponse = {
  userId: 'usr_demo_pooja_shah_2026',
  email: 'admin@littlepearls.in',
  fullName: 'Pooja Shah',
  organisationId: 'org_little_pearls_vadodara',
  organisationName: 'Little Pearls Preschool & Daycare',
  role: 'Owner',
  accessToken: 'demo_jwt_token_for_static_previa_showcase_2026',
  refreshToken: 'demo_refresh_token_2026',
  expiresAtUtc: new Date(Date.now() + 86400000 * 30).toISOString(),
  needsOnboarding: false
};

export const demoProfile: UserProfile = {
  userId: demoUser.userId,
  email: demoUser.email,
  fullName: demoUser.fullName,
  phoneNumber: '+91 98250 12345',
  organisationId: demoUser.organisationId,
  organisationName: demoUser.organisationName,
  organisationCity: 'Vadodara, Gujarat',
  role: 'Owner',
  preferredLanguage: 2, // Gujarati
  timeZoneId: 'India Standard Time',
  subscriptionTier: 'Growth Academy'
};

export const demoSubscription: OrganisationSubscription = {
  organisationId: demoUser.organisationId,
  organisationName: demoUser.organisationName,
  subscriptionPlanId: 'plan_growth_tier3',
  planName: 'Growth Academy Tier',
  tier: 3,
  status: 1,
  currentPeriodStartUtc: '2026-10-01T00:00:00Z',
  currentPeriodEndUtc: '2026-11-01T00:00:00Z',
  noticesGeneratedThisMonth: 18,
  maxNoticesPerMonth: 150,
  activityPlansGeneratedThisMonth: 7,
  maxActivityPlansPerMonth: 50,
  currentStudentCount: 42,
  maxStudents: 100,
  currentClassCount: 4,
  maxClasses: 8,
  canGenerateNotice: true,
  canGenerateActivityPlan: true,
  canAddStudent: true,
  canAddClass: true
};

export const demoClasses: ClassRoom[] = [
  { id: 'cls_pg', organisationId: demoUser.organisationId, name: 'Playgroup Butterflies', academicYear: '2026-2027', roomNumber: 'Room 101', studentCount: 10, isActive: true },
  { id: 'cls_nursery', organisationId: demoUser.organisationId, name: 'Nursery Little Stars', academicYear: '2026-2027', roomNumber: 'Room 102', studentCount: 12, isActive: true },
  { id: 'cls_jrkg', organisationId: demoUser.organisationId, name: 'Jr. KG Sunshine', academicYear: '2026-2027', roomNumber: 'Room 103', studentCount: 11, isActive: true },
  { id: 'cls_srkg', organisationId: demoUser.organisationId, name: 'Sr. KG Explorers', academicYear: '2026-2027', roomNumber: 'Room 104', studentCount: 9, isActive: true }
];

export const demoStudents: Student[] = [
  { id: 'stu_1', organisationId: demoUser.organisationId, classRoomId: 'cls_nursery', classRoomName: 'Nursery Little Stars', rollNumber: 'NUR-01', firstName: 'Aarav', lastName: 'Patel', fullName: 'Aarav Patel', guardianName: 'Bhavesh Patel', guardianPhone: '+91 98980 11223', guardianEmail: 'bhavesh.p@example.com', admissionDate: '2026-06-01', isActive: true },
  { id: 'stu_2', organisationId: demoUser.organisationId, classRoomId: 'cls_nursery', classRoomName: 'Nursery Little Stars', rollNumber: 'NUR-02', firstName: 'Diya', lastName: 'Shah', fullName: 'Diya Shah', guardianName: 'Kunal Shah', guardianPhone: '+91 98240 33445', guardianEmail: 'kunal.shah@example.com', admissionDate: '2026-06-02', isActive: true },
  { id: 'stu_3', organisationId: demoUser.organisationId, classRoomId: 'cls_nursery', classRoomName: 'Nursery Little Stars', rollNumber: 'NUR-03', firstName: 'Kabir', lastName: 'Mehta', fullName: 'Kabir Mehta', guardianName: 'Sanjay Mehta', guardianPhone: '+91 98790 55667', guardianEmail: 'sanjay.m@example.com', admissionDate: '2026-06-03', isActive: true },
  { id: 'stu_4', organisationId: demoUser.organisationId, classRoomId: 'cls_nursery', classRoomName: 'Nursery Little Stars', rollNumber: 'NUR-04', firstName: 'Ananya', lastName: 'Desai', fullName: 'Ananya Desai', guardianName: 'Parag Desai', guardianPhone: '+91 98981 77889', guardianEmail: 'parag.desai@example.com', admissionDate: '2026-06-05', isActive: true },
  { id: 'stu_5', organisationId: demoUser.organisationId, classRoomId: 'cls_jrkg', classRoomName: 'Jr. KG Sunshine', rollNumber: 'JKG-01', firstName: 'Rivaan', lastName: 'Joshi', fullName: 'Rivaan Joshi', guardianName: 'Nilesh Joshi', guardianPhone: '+91 98251 99001', guardianEmail: 'nilesh.j@example.com', admissionDate: '2026-06-01', isActive: true },
  { id: 'stu_6', organisationId: demoUser.organisationId, classRoomId: 'cls_jrkg', classRoomName: 'Jr. KG Sunshine', rollNumber: 'JKG-02', firstName: 'Myra', lastName: 'Trivedi', fullName: 'Myra Trivedi', guardianName: 'Amit Trivedi', guardianPhone: '+91 98792 22334', guardianEmail: 'amit.trivedi@example.com', admissionDate: '2026-06-02', isActive: true },
  { id: 'stu_7', organisationId: demoUser.organisationId, classRoomId: 'cls_pg', classRoomName: 'Playgroup Butterflies', rollNumber: 'PG-01', firstName: 'Vivaan', lastName: 'Solanki', fullName: 'Vivaan Solanki', guardianName: 'Jatin Solanki', guardianPhone: '+91 98242 44556', guardianEmail: 'jatin.s@example.com', admissionDate: '2026-06-10', isActive: true },
  { id: 'stu_8', organisationId: demoUser.organisationId, classRoomId: 'cls_srkg', classRoomName: 'Sr. KG Explorers', rollNumber: 'SKG-01', firstName: 'Samaira', lastName: 'Panchal', fullName: 'Samaira Panchal', guardianName: 'Deepak Panchal', guardianPhone: '+91 98983 66778', guardianEmail: 'deepak.p@example.com', admissionDate: '2026-06-01', isActive: true }
];

const initialNotices: NoticeItem[] = [
  {
    id: 'not_1',
    organisationId: demoUser.organisationId,
    title: 'Rainy Day Safety & Colorful Umbrella Activity',
    messageBody: 'Dear Parents, due to morning showers, preschool will conclude at 12:30 PM today. Please ensure your child carries their labeled rainwear and a spare set of clothes.',
    whatsAppVersion: '🌧️ *Little Pearls Preschool Update*\nDear Parents,\nDue to morning showers, school will disperse at 12:30 PM today.\n✅ Please send extra labeled clothes.\nWarm regards, Little Pearls Team.',
    category: 4, // Emergency
    targetAudience: 1, // AllParents
    language: 1, // English
    tone: 1, // Warm
    isDraft: false,
    createdAtUtc: '2026-10-15T08:30:00Z'
  },
  {
    id: 'not_2',
    organisationId: demoUser.organisationId,
    title: 'માતા-પિતા શિક્ષક સંવાદ સભા (PTM Notification)',
    messageBody: 'આદરણીય વાલીશ્રીઓ, આગામી શનિવારે સવારે 9:00 થી 11:30 વાગ્યા સુધી નર્સરી તથા જુનિયર કે.જી. માટે PTM યોજાશે. આપ સૌને ઉપસ્થિત રહેવા નમ્ર વિનંતી છે.',
    whatsAppVersion: '🌸 *લિટલ પર્લ્સ પ્રિસ્કૂલ - વાલી સંવાદ બેઠક (PTM)*\nઆદરણીય વાલીશ્રી,\nઆગામી શનિવારે સવારે ૯:૦૦ થી ૧૧:૩૦ કલાકે તમારા બાળકના સર્વાંગી વિકાસની ચર્ચા માટે PTM રાખેલ છે.\n- લિટલ પર્લ્સ ટીમ',
    category: 3, // Event
    targetAudience: 1,
    language: 2, // Gujarati
    tone: 1,
    isDraft: false,
    createdAtUtc: '2026-10-14T11:15:00Z'
  },
  {
    id: 'not_3',
    organisationId: demoUser.organisationId,
    title: 'दीपावली एवं नवरात्रि रंगोत्सव सूचना',
    messageBody: 'प्रिय अभिभावक, विद्यालय में आगामी शुक्रवार को पारंपरिक परिधान उत्सव एवं रंगोली प्रतियोगिता का आयोजन किया जाएगा। बच्चे पारंपरिक वेशभूषा में आ सकते हैं।',
    whatsAppVersion: '🪔 *लिटिल पर्ल्स प्रीस्कूल - उत्सव सूचना*\nप्रिय अभिभावक, शुक्रवार को बच्चे पारंपरिक वेशभूषा पहन कर आ सकते हैं।\nशुभकामनाएं!',
    category: 6, // Celebration
    targetAudience: 1,
    language: 3, // Hindi
    tone: 4, // Friendly
    isDraft: false,
    createdAtUtc: '2026-10-13T09:40:00Z'
  }
];

const initialPlans: ActivityPlanItem[] = [
  {
    id: 'plan_1',
    organisationId: demoUser.organisationId,
    topic: 'Monsoon Magic & Sensory Rain Exploration',
    ageGroup: '3-4 Years (Nursery)',
    numberOfDays: 5,
    learningObjectives: 'Develop sensory awareness of weather changes, tactile water transfer skills, and rhythmic motor responses.',
    materials: 'Cotton balls, blue food dye, dropper, paper plates, umbrella silhouettes, rain sounds audio.',
    setting: 'Indoor Classroom & Covered Verandah',
    language: 1,
    classRoomName: 'Nursery Little Stars',
    createdAtUtc: '2026-10-14T14:00:00Z',
    days: [
      {
        dayNumber: 1,
        dayTheme: 'Pitter Patter Sounds',
        activityName: 'Rhythm Stick Rain Dance',
        objective: 'Auditory processing and tempo matching',
        materialsNeeded: 'Wooden rhythm sticks, soft rain soundtrack',
        stepByStepInstructions: 'Sit in a circle. Tap sticks slowly for drizzle, faster for torrential rain. Children freeze when the thunder drum sounds.',
        durationMinutes: '25 min',
        abilityAdaptations: 'Hand-over-hand assistance for fine motor control',
        safetyConsiderations: 'Gentle stick handling boundaries'
      },
      {
        dayNumber: 2,
        dayTheme: 'Cloud in a Jar',
        activityName: 'Shaving Cream Rain Cloud Science',
        objective: 'Cause-and-effect visual science experiment',
        materialsNeeded: 'Clear glass jar, water, shaving foam, blue food coloring with dropper',
        stepByStepInstructions: 'Fill jar 3/4 with water. Top with shaving cream cloud. Have each child drop 3 blue food color drops onto the cloud to watch rain fall into the water.',
        durationMinutes: '30 min',
        abilityAdaptations: 'Bulb pipettes for toddlers',
        safetyConsiderations: 'Non-toxic foam, adult supervision'
      }
    ]
  }
];

const initialFees: FeeRecord[] = [
  { id: 'fee_1', organisationId: demoUser.organisationId, studentId: 'stu_1', studentName: 'Aarav Patel', rollNumber: 'NUR-01', guardianName: 'Bhavesh Patel', guardianPhone: '+91 98980 11223', feePeriod: 'Q3 (Oct-Dec 2026)', amount: 12500, paidAmount: 0, pendingAmount: 12500, currency: 'INR', dueDate: '2026-10-20', status: 1, createdAtUtc: '2026-10-01T00:00:00Z' },
  { id: 'fee_2', organisationId: demoUser.organisationId, studentId: 'stu_2', studentName: 'Diya Shah', rollNumber: 'NUR-02', guardianName: 'Kunal Shah', guardianPhone: '+91 98240 33445', feePeriod: 'Q3 (Oct-Dec 2026)', amount: 12500, paidAmount: 12500, pendingAmount: 0, currency: 'INR', dueDate: '2026-10-20', status: 2, createdAtUtc: '2026-10-01T00:00:00Z' },
  { id: 'fee_3', organisationId: demoUser.organisationId, studentId: 'stu_3', studentName: 'Kabir Mehta', rollNumber: 'NUR-03', guardianName: 'Sanjay Mehta', guardianPhone: '+91 98790 55667', feePeriod: 'Q3 (Oct-Dec 2026)', amount: 12500, paidAmount: 6000, pendingAmount: 6500, currency: 'INR', dueDate: '2026-10-10', status: 4, createdAtUtc: '2026-10-01T00:00:00Z' },
  { id: 'fee_4', organisationId: demoUser.organisationId, studentId: 'stu_5', studentName: 'Rivaan Joshi', rollNumber: 'JKG-01', guardianName: 'Nilesh Joshi', guardianPhone: '+91 98251 99001', feePeriod: 'Q3 (Oct-Dec 2026)', amount: 14000, paidAmount: 0, pendingAmount: 14000, currency: 'INR', dueDate: '2026-10-05', status: 3, notes: 'Grace period till 18th Oct granted', createdAtUtc: '2026-10-01T00:00:00Z' }
];

export const demoTemplates: NoticeTemplate[] = [
  {
    id: 'tpl_1',
    title: 'Rainy Day Early Closure Notice',
    category: 4,
    subjectTemplate: 'Important Notice: Early School Closure due to Heavy Rain',
    bodyTemplate: 'Dear Parents,\nDue to the continuous heavy rainfall and waterlogging reports in Vadodara, Little Pearls Preschool will conclude classes today at {time}. School vans will depart at {vanTime}.\nPlease pick up self-commute students promptly. Thank you for your cooperation.\n\nWarm regards,\nPrincipal, Little Pearls Preschool',
    whatsAppTemplate: '🌧️ *Little Pearls Preschool Alert*\nDear Parents, classes will conclude early today at {time} due to heavy rain. Please pick up your child safely.\nContact: +91 98250 12345',
    language: 1,
    isSystemTemplate: true,
    isArchived: false,
    createdAtUtc: '2026-06-01T00:00:00Z'
  },
  {
    id: 'tpl_2',
    title: 'માસિક ફી યાદપત્ર (Gujarati Fee Reminder)',
    category: 5,
    subjectTemplate: 'લિટલ પર્લ્સ પ્રિસ્કૂલ - સત્ર ફી જમા કરાવવા અંગે વિનંતી',
    bodyTemplate: 'આદરણીય વાલીશ્રી {guardianName},\nસસ્નેહ નમસ્કાર. આપના પાલ્ય {studentName} ({rollNumber}) ની સત્ર ફી રૂ. {amount} જમા કરાવવાની છેલ્લી તારીખ {dueDate} છે. કૃપા કરીને સમયસર ફી જમા કરાવી સહકાર આપવા વિનંતી છે.\n\nઆભાર,\nલિટલ પર્લ્સ વહીવટી વિભાગ',
    whatsAppTemplate: '🌸 *લિટલ પર્લ્સ પ્રિસ્કૂલ ફી નોટિસ*\nનમસ્તે {guardianName},\n{studentName} ની સત્ર ફી રૂ. {amount} જમા કરાવવાની બાકી છે. સમયસર ચુકવણી માટે વિનંતી છે.\nUPI / PhonePe / GPay ઉપલબ્ધ.',
    language: 2,
    isSystemTemplate: true,
    isArchived: false,
    createdAtUtc: '2026-06-01T00:00:00Z'
  },
  {
    id: 'tpl_3',
    title: 'वार्षिक खेल दिवस आमंत्रण (Sports Day Invitation)',
    category: 3,
    subjectTemplate: 'लिटिल पर्ल्स प्रीस्कूल - वार्षिक खेल दिवस आमंत्रण',
    bodyTemplate: 'आदरणीय अभिभावक,\nहमें यह बताते हुए अत्यंत प्रसन्नता हो रही है कि हमारे नन्हे-मुन्ने बच्चों के लिए वार्षिक खेल उत्सव दिनांक {eventDate} को सुबह 9:00 बजे आयोजित किया जा रहा है। आप सभी सपरिवार सादर आमंत्रित हैं।\n\nसस्नेह,\nप्रबंधन समिति, लिटिल पर्ल्स',
    whatsAppTemplate: '🏅 *लिटिल पर्ल्स खेल दिवस*\nप्रिय अभिभावक, हमारे वार्षिक खेल उत्सव दिनांक {eventDate} में सादर आमंत्रित हैं। बच्चों का उत्साह बढ़ाएं!',
    language: 3,
    isSystemTemplate: true,
    isArchived: false,
    createdAtUtc: '2026-06-01T00:00:00Z'
  }
];

class MockService {
  private getNotices(): NoticeItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_NOTICES);
    return raw ? JSON.parse(raw) : initialNotices;
  }

  private saveNotices(notices: NoticeItem[]) {
    localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(notices));
  }

  private getPlans(): ActivityPlanItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    return raw ? JSON.parse(raw) : initialPlans;
  }

  private savePlans(plans: ActivityPlanItem[]) {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  }

  private getFees(): FeeRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_FEES);
    return raw ? JSON.parse(raw) : initialFees;
  }

  private saveFees(fees: FeeRecord[]) {
    localStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(fees));
  }

  public getDashboardStats(): DashboardStats {
    const notices = this.getNotices();
    const plans = this.getPlans();
    const fees = this.getFees();

    const pendingFees = fees.filter(f => f.status === 1 || f.status === 3 || f.status === 4);
    const totalPendingAmount = pendingFees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

    return {
      totalStudents: demoStudents.length,
      totalClasses: demoClasses.length,
      noticesCount: notices.length,
      activityPlansCount: plans.length,
      todayAttendance: {
        date: new Date().toISOString().split('T')[0],
        totalStudents: demoStudents.length,
        presentCount: 7,
        absentCount: 1,
        lateCount: 0,
        excusedCount: 0,
        attendancePercentage: 87.5
      },
      subscription: demoSubscription,
      recentNotices: notices.slice(0, 3),
      recentAiActivities: [
        { id: 'ai_1', type: 'Notice Synthesis', modelName: 'Previa Domain AI (Gujarati Engine)', createdAtUtc: '2026-10-15T08:30:00Z', isSuccess: true },
        { id: 'ai_2', type: 'Activity Plan', modelName: 'Montessori Early Years Model', createdAtUtc: '2026-10-14T14:00:00Z', isSuccess: true },
        { id: 'ai_3', type: 'Fee Reminder Generation', modelName: 'WhatsApp Smart Assistant', createdAtUtc: '2026-10-13T10:15:00Z', isSuccess: true }
      ],
      pendingFeeRecordsCount: pendingFees.length,
      totalPendingFeeAmount: totalPendingAmount
    };
  }

  public generateAiNotice(data: {
    category: string;
    targetAudience: string;
    subject: string;
    tone: ToneStyle;
    language: SupportedLanguage;
  }) {
    const langNames: Record<SupportedLanguage, string> = { 1: 'English', 2: 'Gujarati', 3: 'Hindi' };
    const selectedLang = langNames[data.language] || 'English';

    let title = data.subject || 'Special Notice for Parents';
    let messageBody = '';
    let whatsAppVersion = '';

    if (data.language === 2) {
      // Gujarati
      title = `${data.subject} - અગત્યની સૂચના`;
      messageBody = `આદરણીય વાલીશ્રીઓ,\nસસ્નેહ વંદન. લિટલ પર્લ્સ પ્રિસ્કૂલ તરફથી જણાવવાનું કે ${data.subject} સંદર્ભે આપની સહભાગિતા અપેક્ષિત છે. બાળકોના શ્રેષ્ઠ વિકાસ અને સુવિધા માટે અમે કટિબદ્ધ છીએ.\n\nઆપનો સ્નેહી,\nસંચાલક મંડળ, લિટલ પર્લ્સ પ્રિસ્કૂલ`;
      whatsAppVersion = `🌸 *લિટલ પર્લ્સ પ્રિસ્કૂલ - પરિપત્ર*\nઆદરણીય વાલીશ્રી,\n${data.subject} વિશેની અગત્યની માહિતી માટે કૃપા કરી આ મેસેજ ધ્યાને લેશો.\nસંપર્ક: +91 98250 12345`;
    } else if (data.language === 3) {
      // Hindi
      title = `${data.subject} - आवश्यक सूचना`;
      messageBody = `प्रिय अभिभावक,\nसादर प्रणाम। लिटिल पर्ल्स प्रीस्कूल द्वारा सूचित किया जाता है कि ${data.subject} के संबंध में सभी आवश्यक प्रबंध पूरे कर लिए गए हैं। कृपया विवरण नोट करें।\n\nधन्यवाद,\nप्रधानाचार्य, लिटिल पर्ल्स प्रीस्कूल`;
      whatsAppVersion = `🪔 *लिटिल पर्ल्स प्रीस्कूल सूचना*\nप्रिय अभिभावक,\n${data.subject} के संबंध में यह संदेश प्रेषित है। सहयोग के लिए धन्यवाद।`;
    } else {
      // English
      title = `${data.subject} - Preschool Circular`;
      messageBody = `Dear Parents,\nGreetings from Little Pearls Preschool. We would like to inform you regarding ${data.subject}. Please make note of the schedule and requirements for your child.\n\nWarm regards,\nPrincipal & Teaching Team\nLittle Pearls Preschool`;
      whatsAppVersion = `📢 *Little Pearls Preschool Notice*\nDear Parents,\nPlease take note of: *${data.subject}*.\nWe appreciate your constant support!\nContact: +91 98250 12345`;
    }

    return {
      title,
      messageBody,
      whatsAppVersion,
      language: data.language,
      modelUsed: `Previa Adaptive Preschool AI (${selectedLang} Engine)`,
      estimatedTokens: 340
    };
  }

  public generateAiActivityPlan(data: {
    ageGroup: string;
    topic: string;
    numberOfDays: number;
    learningObjectives: string;
    materials: string;
    setting: string;
    language: SupportedLanguage;
  }) {
    const days = [];
    for (let i = 1; i <= Math.min(data.numberOfDays || 5, 5); i++) {
      days.push({
        dayNumber: i,
        dayTheme: `Day ${i}: Hands-on ${data.topic} Discovery`,
        activityName: `Sensory Station & Creative Expression Part ${i}`,
        objective: `Active engagement with ${data.topic} through motor exploration and language building.`,
        materialsNeeded: data.materials || 'Crayons, building blocks, playdough, cardboard cards, sensory tray',
        stepByStepInstructions: `1. Circle time story (5 min)\n2. Interactive demonstration of ${data.topic} (10 min)\n3. Guided tactile exploration with partner (15 min)\n4. Tidy-up song & reflective summary (5 min)`,
        durationMinutes: '35 min',
        abilityAdaptations: 'Visual flashcards for bilingual learners',
        safetyConsiderations: 'Non-toxic materials and rounded scissors only'
      });
    }

    return {
      topic: data.topic,
      ageGroup: data.ageGroup,
      numberOfDays: data.numberOfDays,
      days,
      modelUsed: 'Previa Early Childhood Montessori Engine',
      estimatedTokens: 520
    };
  }

  public generateFeeReminder(data: {
    studentName: string;
    guardianName: string;
    feePeriod: string;
    amount: number;
    currency: string;
    dueDate: string;
    language: SupportedLanguage;
  }) {
    let reminderSubject = `Fee Reminder for ${data.studentName} - ${data.feePeriod}`;
    let reminderBody = `Dear ${data.guardianName},\nThis is a gentle reminder that the preschool tuition fee of ${data.currency} ${data.amount.toLocaleString()} for ${data.studentName} (${data.feePeriod}) is due by ${data.dueDate}. You can complete payment at school office or via instant UPI.\nThank you!`;
    let whatsAppVersion = `🔔 *Little Pearls Preschool Fee Notice*\nDear ${data.guardianName},\nTuition fee of *${data.currency} ${data.amount.toLocaleString()}* for *${data.studentName}* is due on *${data.dueDate}*.\n💳 UPI: littlepearls@okhdfc\nThank you for your prompt support!`;

    if (data.language === 2) {
      reminderSubject = `${data.studentName} ની સત્ર ફી ભરવા અંગે યાદપત્ર`;
      reminderBody = `આદરણીય ${data.guardianName},\nનમસ્તે. આપના બાળક ${data.studentName} ની સત્ર ફી રૂ. ${data.amount.toLocaleString()} ભરવાની છેલ્લી તારીખ ${data.dueDate} છે. કૃપા કરીને સમયસર ચુકવણી કરી સહકાર આપશો.\nઆભાર!`;
      whatsAppVersion = `🌸 *લિટલ પર્લ્સ ફી સૂચના*\nનમસ્તે ${data.guardianName},\n${data.studentName} ની ફી *રૂ. ${data.amount.toLocaleString()}* તા. *${data.dueDate}* સુધીમાં ભરવાની વિનંતી છે.\nUPI: littlepearls@okhdfc`;
    }

    return {
      reminderSubject,
      reminderBody,
      whatsAppVersion,
      language: data.language,
      modelUsed: 'Previa WhatsApp Fee Assistant'
    };
  }

  public translateText(text: string, targetLanguage: SupportedLanguage) {
    if (targetLanguage === 2) {
      return {
        translatedText: `[ગુજરાતી અનુવાદ] ${text}`,
        targetLanguage: 2,
        modelUsed: 'Previa Indic-Gujarati Neural Engine'
      };
    }
    if (targetLanguage === 3) {
      return {
        translatedText: `[हिन्दी अनुवाद] ${text}`,
        targetLanguage: 3,
        modelUsed: 'Previa Indic-Hindi Neural Engine'
      };
    }
    return {
      translatedText: `[English] ${text}`,
      targetLanguage: 1,
      modelUsed: 'Previa Multi-Lingual Core'
    };
  }

  public listNotices(params?: any) {
    let list = this.getNotices();
    if (params?.category) list = list.filter(n => n.category === Number(params.category));
    if (params?.searchTerm) {
      const q = params.searchTerm.toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.messageBody.toLowerCase().includes(q));
    }
    return {
      items: list,
      totalCount: list.length,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
  }

  public createNotice(data: any): NoticeItem {
    const list = this.getNotices();
    const newNotice: NoticeItem = {
      id: `not_${Date.now()}`,
      organisationId: demoUser.organisationId,
      title: data.title,
      messageBody: data.messageBody,
      whatsAppVersion: data.whatsAppVersion,
      category: data.category,
      targetAudience: data.targetAudience,
      classRoomId: data.classRoomId,
      classRoomName: demoClasses.find(c => c.id === data.classRoomId)?.name,
      language: data.language,
      tone: data.tone,
      isDraft: data.isDraft ?? false,
      createdAtUtc: new Date().toISOString()
    };
    list.unshift(newNotice);
    this.saveNotices(list);
    return newNotice;
  }

  public deleteNotice(id: string) {
    const list = this.getNotices().filter(n => n.id !== id);
    this.saveNotices(list);
  }

  public listPlans(params?: any) {
    const list = this.getPlans();
    return {
      items: list,
      totalCount: list.length,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
  }

  public savePlan(data: any): ActivityPlanItem {
    const list = this.getPlans();
    const newPlan: ActivityPlanItem = {
      id: `plan_${Date.now()}`,
      organisationId: demoUser.organisationId,
      topic: data.topic,
      ageGroup: data.ageGroup,
      numberOfDays: data.numberOfDays,
      learningObjectives: data.learningObjectives,
      materials: data.materials,
      setting: data.setting,
      language: data.language,
      classRoomId: data.classRoomId,
      classRoomName: demoClasses.find(c => c.id === data.classRoomId)?.name,
      days: data.days || [],
      createdAtUtc: new Date().toISOString()
    };
    list.unshift(newPlan);
    this.savePlans(list);
    return newPlan;
  }

  public deletePlan(id: string) {
    const list = this.getPlans().filter(p => p.id !== id);
    this.savePlans(list);
  }

  public listFees(status?: FeeStatus): FeeRecord[] {
    const fees = this.getFees();
    if (status) {
      return fees.filter(f => f.status === status);
    }
    return fees;
  }

  public updatePayment(id: string, data: { amountPaid: number; status: FeeStatus; notes?: string }) {
    const fees = this.getFees();
    const item = fees.find(f => f.id === id);
    if (item) {
      item.paidAmount += data.amountPaid;
      item.pendingAmount = Math.max(0, item.amount - item.paidAmount);
      item.status = item.pendingAmount === 0 ? 2 : data.status;
      if (data.notes) item.notes = data.notes;
      this.saveFees(fees);
      return item;
    }
    throw new Error('Fee record not found');
  }

  public recordAttendance(data: { classRoomId: string; date: string; attendances: any[] }) {
    localStorage.setItem(`${STORAGE_KEY_ATTENDANCE}_${data.classRoomId}_${data.date}`, JSON.stringify(data.attendances));
    return { message: 'Attendance recorded successfully' };
  }

  public getAttendanceRecords(classRoomId: string, date?: string): AttendanceRecord[] {
    const d = date || new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(`${STORAGE_KEY_ATTENDANCE}_${classRoomId}_${d}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((item: any) => ({
        id: `att_${item.studentId}_${d}`,
        studentId: item.studentId,
        studentName: item.studentName,
        rollNumber: item.rollNumber,
        classRoomId,
        classRoomName: demoClasses.find(c => c.id === classRoomId)?.name || 'Preschool Class',
        date: d,
        status: item.status,
        remarks: item.remarks,
        recordedAtUtc: new Date().toISOString()
      }));
    }

    // Default seed attendance records for today
    const studentsInClass = demoStudents.filter(s => !classRoomId || s.classRoomId === classRoomId);
    return studentsInClass.map((s, idx) => ({
      id: `att_${s.id}_${d}`,
      studentId: s.id,
      studentName: s.fullName,
      rollNumber: s.rollNumber,
      classRoomId: s.classRoomId,
      classRoomName: s.classRoomName,
      date: d,
      status: (idx === 1 ? 2 : 1) as any, // Aarav present, Diya absent on demo day
      remarks: idx === 1 ? 'Viral fever reported by parent' : undefined,
      recordedAtUtc: new Date().toISOString()
    }));
  }
}

export const mockService = new MockService();
