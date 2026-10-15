using Previa.Domain.Enums;

namespace Previa.Application.Features.Subscriptions;

public record SubscriptionPlanDto(
    Guid Id,
    string Name,
    SubscriptionTier Tier,
    decimal PriceInrMonthly,
    int MaxNoticesPerMonth,
    int MaxActivityPlansPerMonth,
    int MaxStudents,
    int MaxClasses,
    bool AllowWhatsAppFormat,
    bool AllowTranslations,
    bool AllowCustomTemplates,
    bool AllowCsvExport
);

public record OrganisationSubscriptionDto(
    Guid OrganisationId,
    string OrganisationName,
    Guid SubscriptionPlanId,
    string PlanName,
    SubscriptionTier Tier,
    SubscriptionStatus Status,
    DateTime CurrentPeriodStartUtc,
    DateTime CurrentPeriodEndUtc,
    DateTime? TrialEndsAtUtc,
    int NoticesGeneratedThisMonth,
    int MaxNoticesPerMonth,
    int ActivityPlansGeneratedThisMonth,
    int MaxActivityPlansPerMonth,
    int CurrentStudentCount,
    int MaxStudents,
    int CurrentClassCount,
    int MaxClasses,
    bool CanGenerateNotice,
    bool CanGenerateActivityPlan,
    bool CanAddStudent,
    bool CanAddClass
);

public record ChangeSubscriptionPlanRequestDto(
    Guid NewPlanId
);

public interface ISubscriptionService
{
    Task<List<SubscriptionPlanDto>> GetAvailablePlansAsync(CancellationToken ct = default);
    Task<OrganisationSubscriptionDto> GetCurrentSubscriptionAsync(Guid organisationId, CancellationToken ct = default);
    Task<OrganisationSubscriptionDto> ChangeSubscriptionPlanAsync(Guid organisationId, ChangeSubscriptionPlanRequestDto request, CancellationToken ct = default);
    Task<bool> CanPerformAiActionAsync(Guid organisationId, AiGenerationType actionType, CancellationToken ct = default);
    Task IncrementUsageAsync(Guid organisationId, AiGenerationType actionType, CancellationToken ct = default);
}
