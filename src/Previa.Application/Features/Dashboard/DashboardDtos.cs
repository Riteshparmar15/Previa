using Previa.Application.Features.Attendance;
using Previa.Application.Features.Notices;
using Previa.Application.Features.Subscriptions;

namespace Previa.Application.Features.Dashboard;

public record DashboardStatsDto(
    int TotalStudents,
    int TotalClasses,
    int NoticesCount,
    int ActivityPlansCount,
    AttendanceSummaryDto TodayAttendance,
    OrganisationSubscriptionDto Subscription,
    List<NoticeDto> RecentNotices,
    List<RecentAiActivityDto> RecentAiActivities,
    int PendingFeeRecordsCount,
    decimal TotalPendingFeeAmount
);

public record RecentAiActivityDto(
    Guid Id,
    string Type,
    string ModelName,
    DateTime CreatedAtUtc,
    bool IsSuccess
);

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(Guid organisationId, CancellationToken ct = default);
}
