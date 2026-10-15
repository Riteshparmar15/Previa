using Previa.Domain.Common;
using Previa.Domain.Enums;

namespace Previa.Domain.Entities;

public class FeeRecord : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public string FeePeriod { get; set; } = string.Empty; // e.g. "Term 1 - April 2026"
    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public string Currency { get; set; } = "INR";
    public DateOnly DueDate { get; set; }
    public FeeStatus Status { get; set; } = FeeStatus.Pending;
    public string? Notes { get; set; }

    public ICollection<FeeReminderDraft> ReminderDrafts { get; set; } = new List<FeeReminderDraft>();
}

public class FeeReminderDraft : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid FeeRecordId { get; set; }
    public FeeRecord FeeRecord { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public string ReminderText { get; set; } = string.Empty;
    public string? WhatsAppVersion { get; set; }
    public SupportedLanguage Language { get; set; } = SupportedLanguage.English;
    public ToneStyle Tone { get; set; } = ToneStyle.Friendly;
    public Guid CreatedByUserId { get; set; }
}
