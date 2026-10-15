using Microsoft.EntityFrameworkCore;
using Previa.Domain.Entities;

namespace Previa.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Organisation> Organisations { get; }
    DbSet<OrganisationMembership> Memberships { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<OrganisationSubscription> OrganisationSubscriptions { get; }
    DbSet<ClassRoom> Classes { get; }
    DbSet<Student> Students { get; }
    DbSet<AttendanceRecord> AttendanceRecords { get; }
    DbSet<Notice> Notices { get; }
    DbSet<ActivityPlan> ActivityPlans { get; }
    DbSet<FeeRecord> FeeRecords { get; }
    DbSet<FeeReminderDraft> FeeReminderDrafts { get; }
    DbSet<NoticeTemplate> NoticeTemplates { get; }
    DbSet<AiGenerationLog> AiGenerationLogs { get; }
    DbSet<AuditEvent> AuditEvents { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
