using Microsoft.EntityFrameworkCore;
using Previa.Application.Common.Interfaces;
using Previa.Domain.Common;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentUserService? currentUserService = null)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Organisation> Organisations => Set<Organisation>();
    public DbSet<OrganisationMembership> Memberships => Set<OrganisationMembership>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<OrganisationSubscription> OrganisationSubscriptions => Set<OrganisationSubscription>();
    public DbSet<ClassRoom> Classes => Set<ClassRoom>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<Notice> Notices => Set<Notice>();
    public DbSet<ActivityPlan> ActivityPlans => Set<ActivityPlan>();
    public DbSet<FeeRecord> FeeRecords => Set<FeeRecord>();
    public DbSet<FeeReminderDraft> FeeReminderDrafts => Set<FeeReminderDraft>();
    public DbSet<NoticeTemplate> NoticeTemplates => Set<NoticeTemplate>();
    public DbSet<AiGenerationLog> AiGenerationLogs => Set<AiGenerationLog>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.Email).HasMaxLength(150).IsRequired();
            b.Property(x => x.FullName).HasMaxLength(100).IsRequired();
            b.Property(x => x.PhoneNumber).HasMaxLength(20);
        });

        // Organisation
        modelBuilder.Entity<Organisation>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Name).HasMaxLength(150).IsRequired();
            b.Property(x => x.City).HasMaxLength(100);
            b.Property(x => x.State).HasMaxLength(100);
            b.Property(x => x.Country).HasMaxLength(100);
        });

        // OrganisationMembership
        modelBuilder.Entity<OrganisationMembership>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.UserId }).IsUnique();
            b.HasOne(x => x.Organisation).WithMany(x => x.Memberships).HasForeignKey(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.User).WithMany(x => x.Memberships).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // SubscriptionPlan
        modelBuilder.Entity<SubscriptionPlan>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.PriceInrMonthly).HasPrecision(18, 2);
            b.Property(x => x.Name).HasMaxLength(50).IsRequired();
        });

        // OrganisationSubscription
        modelBuilder.Entity<OrganisationSubscription>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.OrganisationId).IsUnique();
            b.HasOne(x => x.Organisation).WithOne(x => x.Subscription).HasForeignKey<OrganisationSubscription>(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.SubscriptionPlan).WithMany().HasForeignKey(x => x.SubscriptionPlanId).OnDelete(DeleteBehavior.Restrict);
        });

        // ClassRoom
        modelBuilder.Entity<ClassRoom>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.Name, x.AcademicYear });
            b.Property(x => x.Name).HasMaxLength(100).IsRequired();
            b.Property(x => x.AcademicYear).HasMaxLength(20);
            b.HasOne(x => x.Organisation).WithMany(x => x.Classes).HasForeignKey(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
        });

        // Student
        modelBuilder.Entity<Student>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.ClassRoomId, x.RollNumber });
            b.Property(x => x.FirstName).HasMaxLength(60).IsRequired();
            b.Property(x => x.LastName).HasMaxLength(60).IsRequired();
            b.Property(x => x.GuardianName).HasMaxLength(100).IsRequired();
            b.Property(x => x.GuardianPhone).HasMaxLength(20).IsRequired();
            b.HasOne(x => x.ClassRoom).WithMany(x => x.Students).HasForeignKey(x => x.ClassRoomId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Organisation).WithMany(x => x.Students).HasForeignKey(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
        });

        // AttendanceRecord - with critical duplicate protection
        modelBuilder.Entity<AttendanceRecord>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.ClassRoomId, x.StudentId, x.Date }).IsUnique();
            b.HasOne(x => x.Student).WithMany(x => x.AttendanceRecords).HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.ClassRoom).WithMany(x => x.AttendanceRecords).HasForeignKey(x => x.ClassRoomId).OnDelete(DeleteBehavior.Cascade);
        });

        // Notice
        modelBuilder.Entity<Notice>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.CreatedAtUtc });
            b.Property(x => x.Title).HasMaxLength(200).IsRequired();
            b.Property(x => x.MessageBody).HasMaxLength(5000).IsRequired();
            b.HasOne(x => x.Organisation).WithMany(x => x.Notices).HasForeignKey(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
        });

        // ActivityPlan
        modelBuilder.Entity<ActivityPlan>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.CreatedAtUtc });
            b.Property(x => x.Topic).HasMaxLength(200).IsRequired();
            b.Property(x => x.AgeGroup).HasMaxLength(50);
            b.HasOne(x => x.Organisation).WithMany(x => x.ActivityPlans).HasForeignKey(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
        });

        // FeeRecord
        modelBuilder.Entity<FeeRecord>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.Status, x.DueDate });
            b.Property(x => x.Amount).HasPrecision(18, 2);
            b.Property(x => x.PaidAmount).HasPrecision(18, 2);
            b.Property(x => x.FeePeriod).HasMaxLength(100).IsRequired();
            b.HasOne(x => x.Student).WithMany(x => x.FeeRecords).HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.Organisation).WithMany(x => x.FeeRecords).HasForeignKey(x => x.OrganisationId).OnDelete(DeleteBehavior.Cascade);
        });

        // FeeReminderDraft
        modelBuilder.Entity<FeeReminderDraft>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.FeeRecord).WithMany(x => x.ReminderDrafts).HasForeignKey(x => x.FeeRecordId).OnDelete(DeleteBehavior.Cascade);
        });

        // NoticeTemplate
        modelBuilder.Entity<NoticeTemplate>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.IsSystemTemplate });
            b.Property(x => x.Title).HasMaxLength(200).IsRequired();
        });

        // AiGenerationLog
        modelBuilder.Entity<AiGenerationLog>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.CreatedAtUtc });
        });

        // AuditEvent
        modelBuilder.Entity<AuditEvent>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.OrganisationId, x.TimestampUtc });
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAtUtc == default)
                    entry.Entity.CreatedAtUtc = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
