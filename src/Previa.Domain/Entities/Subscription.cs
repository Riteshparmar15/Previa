using Previa.Domain.Common;
using Previa.Domain.Enums;

namespace Previa.Domain.Entities;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public SubscriptionTier Tier { get; set; } = SubscriptionTier.Starter;
    public decimal PriceInrMonthly { get; set; }
    public int MaxNoticesPerMonth { get; set; }
    public int MaxActivityPlansPerMonth { get; set; }
    public int MaxStudents { get; set; }
    public int MaxClasses { get; set; }
    public bool AllowWhatsAppFormat { get; set; } = true;
    public bool AllowTranslations { get; set; } = true;
    public bool AllowCustomTemplates { get; set; } = true;
    public bool AllowCsvExport { get; set; } = true;
    public bool IsActive { get; set; } = true;
}

public class OrganisationSubscription : BaseEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid SubscriptionPlanId { get; set; }
    public SubscriptionPlan SubscriptionPlan { get; set; } = null!;

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trialing;
    public DateTime CurrentPeriodStartUtc { get; set; } = DateTime.UtcNow;
    public DateTime CurrentPeriodEndUtc { get; set; } = DateTime.UtcNow.AddDays(30);
    public DateTime? TrialEndsAtUtc { get; set; } = DateTime.UtcNow.AddDays(14);

    public int NoticesGeneratedThisMonth { get; set; }
    public int ActivityPlansGeneratedThisMonth { get; set; }
}
