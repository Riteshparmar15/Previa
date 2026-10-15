namespace Previa.Domain.Enums;

public enum UserRole
{
    Owner = 1,
    Admin = 2,
    Teacher = 3,
    Staff = 4
}

public enum SubscriptionTier
{
    Starter = 1,
    Standard = 2,
    Premium = 3
}

public enum SubscriptionStatus
{
    Trialing = 1,
    Active = 2,
    PastDue = 3,
    Canceled = 4
}

public enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    Late = 3,
    Excused = 4
}

public enum NoticeCategory
{
    General = 1,
    Holiday = 2,
    Event = 3,
    Emergency = 4,
    FeeReminder = 5,
    Celebration = 6
}

public enum NoticeAudience
{
    AllParents = 1,
    SpecificClass = 2,
    Staff = 3
}

public enum SupportedLanguage
{
    English = 1,
    Gujarati = 2,
    Hindi = 3
}

public enum ToneStyle
{
    Warm = 1,
    Formal = 2,
    Urgent = 3,
    Friendly = 4
}

public enum FeeStatus
{
    Pending = 1,
    Paid = 2,
    Overdue = 3,
    PartiallyPaid = 4
}

public enum AiGenerationType
{
    Notice = 1,
    ActivityPlan = 2,
    Translation = 3,
    FeeReminder = 4
}
