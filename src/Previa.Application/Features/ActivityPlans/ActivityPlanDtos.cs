using Previa.Application.Features.Ai;
using Previa.Application.Features.Notices;
using Previa.Domain.Enums;

namespace Previa.Application.Features.ActivityPlans;

public record ActivityPlanDto(
    Guid Id,
    Guid OrganisationId,
    string Topic,
    string AgeGroup,
    int NumberOfDays,
    string LearningObjectives,
    string Materials,
    string Setting,
    SupportedLanguage Language,
    Guid? ClassRoomId,
    string? ClassRoomName,
    List<ActivityDayItem> Days,
    DateTime CreatedAtUtc
);

public record SaveActivityPlanRequestDto(
    string Topic,
    string AgeGroup,
    int NumberOfDays,
    string LearningObjectives,
    string Materials,
    string Setting,
    SupportedLanguage Language,
    Guid? ClassRoomId,
    List<ActivityDayItem> Days
);

public record ActivityPlanListFilterDto(
    string? AgeGroup = null,
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 10
);

public interface IActivityPlanService
{
    Task<PagedResult<ActivityPlanDto>> GetPlansAsync(Guid organisationId, ActivityPlanListFilterDto filter, CancellationToken ct = default);
    Task<ActivityPlanDto?> GetPlanByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default);
    Task<ActivityPlanDto> SavePlanAsync(Guid organisationId, Guid userId, SaveActivityPlanRequestDto request, CancellationToken ct = default);
    Task<bool> DeletePlanAsync(Guid organisationId, Guid id, CancellationToken ct = default);
}
