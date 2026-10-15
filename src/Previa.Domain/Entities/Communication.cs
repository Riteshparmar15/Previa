using Previa.Domain.Common;
using Previa.Domain.Enums;

namespace Previa.Domain.Entities;

public class Notice : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public NoticeCategory Category { get; set; } = NoticeCategory.General;
    public NoticeAudience TargetAudience { get; set; } = NoticeAudience.AllParents;
    public Guid? ClassRoomId { get; set; }
    public ClassRoom? ClassRoom { get; set; }

    public string Title { get; set; } = string.Empty;
    public string MessageBody { get; set; } = string.Empty;
    public string? WhatsAppVersion { get; set; }
    public SupportedLanguage Language { get; set; } = SupportedLanguage.English;
    public ToneStyle Tone { get; set; } = ToneStyle.Friendly;
    public bool IsDraft { get; set; } = false;
    public string? AdditionalInstructions { get; set; }
}

public class ActivityPlan : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public Guid? ClassRoomId { get; set; }
    public ClassRoom? ClassRoom { get; set; }

    public string AgeGroup { get; set; } = "3-4 years";
    public string Topic { get; set; } = string.Empty;
    public int NumberOfDays { get; set; } = 3;
    public string LearningObjectives { get; set; } = string.Empty;
    public string Materials { get; set; } = string.Empty;
    public string Setting { get; set; } = "Indoor";
    public SupportedLanguage Language { get; set; } = SupportedLanguage.English;
    
    // Structured JSON storing days, activity items, adaptations, safety notes
    public string StructuredPlanJson { get; set; } = string.Empty;
}

public class NoticeTemplate : BaseEntity
{
    // If null, it is a system global template available to all organisations
    public Guid? OrganisationId { get; set; }
    public Organisation? Organisation { get; set; }

    public string Title { get; set; } = string.Empty;
    public NoticeCategory Category { get; set; } = NoticeCategory.General;
    public string SubjectTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public string? WhatsAppTemplate { get; set; }
    public SupportedLanguage Language { get; set; } = SupportedLanguage.English;
    public bool IsSystemTemplate { get; set; } = false;
    public bool IsArchived { get; set; } = false;
}
