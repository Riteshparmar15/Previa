using Microsoft.EntityFrameworkCore;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.Attendance;
using Previa.Application.Features.Dashboard;
using Previa.Application.Features.Finance;
using Previa.Application.Features.Notices;
using Previa.Application.Features.Subscriptions;
using Previa.Application.Features.Templates;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Services;

public class FeeService : IFeeService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public FeeService(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<List<FeeRecordDto>> GetFeeRecordsAsync(Guid organisationId, FeeStatus? status = null, CancellationToken ct = default)
    {
        var query = _context.FeeRecords
            .Include(f => f.Student)
            .Where(f => f.OrganisationId == organisationId);

        if (status.HasValue)
            query = query.Where(f => f.Status == status.Value);

        return await query
            .OrderBy(f => f.DueDate)
            .Select(f => new FeeRecordDto(
                f.Id,
                f.OrganisationId,
                f.StudentId,
                f.Student.FullName,
                f.Student.RollNumber,
                f.Student.GuardianName,
                f.Student.GuardianPhone,
                f.FeePeriod,
                f.Amount,
                f.PaidAmount,
                f.Amount - f.PaidAmount,
                f.Currency,
                f.DueDate,
                f.Status,
                f.Notes,
                f.CreatedAtUtc
            ))
            .ToListAsync(ct);
    }

    public async Task<FeeRecordDto?> GetFeeRecordByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var f = await _context.FeeRecords
            .Include(f => f.Student)
            .FirstOrDefaultAsync(f => f.OrganisationId == organisationId && f.Id == id, ct);

        if (f == null) return null;

        return new FeeRecordDto(
            f.Id,
            f.OrganisationId,
            f.StudentId,
            f.Student.FullName,
            f.Student.RollNumber,
            f.Student.GuardianName,
            f.Student.GuardianPhone,
            f.FeePeriod,
            f.Amount,
            f.PaidAmount,
            f.Amount - f.PaidAmount,
            f.Currency,
            f.DueDate,
            f.Status,
            f.Notes,
            f.CreatedAtUtc
        );
    }

    public async Task<FeeRecordDto> CreateFeeRecordAsync(Guid organisationId, CreateFeeRecordRequestDto request, CancellationToken ct = default)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.OrganisationId == organisationId && s.Id == request.StudentId, ct);
        if (student == null)
            throw new InvalidOperationException("Student not found in this organisation.");

        var record = new FeeRecord
        {
            OrganisationId = organisationId,
            StudentId = request.StudentId,
            FeePeriod = request.FeePeriod.Trim(),
            Amount = request.Amount,
            PaidAmount = 0,
            Currency = "INR",
            DueDate = request.DueDate,
            Status = FeeStatus.Pending,
            Notes = request.Notes?.Trim()
        };

        await _context.FeeRecords.AddAsync(record, ct);
        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, null, "CreateFeeRecord", "FeeRecord", record.Id.ToString(), $"Fee record {record.FeePeriod} for {student.FullName}", ct);

        return new FeeRecordDto(
            record.Id,
            record.OrganisationId,
            record.StudentId,
            student.FullName,
            student.RollNumber,
            student.GuardianName,
            student.GuardianPhone,
            record.FeePeriod,
            record.Amount,
            record.PaidAmount,
            record.Amount - record.PaidAmount,
            record.Currency,
            record.DueDate,
            record.Status,
            record.Notes,
            record.CreatedAtUtc
        );
    }

    public async Task<FeeRecordDto?> UpdatePaymentAsync(Guid organisationId, Guid id, UpdateFeePaymentRequestDto request, CancellationToken ct = default)
    {
        var record = await _context.FeeRecords
            .Include(f => f.Student)
            .FirstOrDefaultAsync(f => f.OrganisationId == organisationId && f.Id == id, ct);

        if (record == null) return null;

        record.PaidAmount = request.AmountPaid;
        record.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(request.Notes))
            record.Notes = request.Notes.Trim();

        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, null, "UpdateFeePayment", "FeeRecord", id.ToString(), $"Updated payment to {record.PaidAmount}", ct);

        return new FeeRecordDto(
            record.Id,
            record.OrganisationId,
            record.StudentId,
            record.Student.FullName,
            record.Student.RollNumber,
            record.Student.GuardianName,
            record.Student.GuardianPhone,
            record.FeePeriod,
            record.Amount,
            record.PaidAmount,
            record.Amount - record.PaidAmount,
            record.Currency,
            record.DueDate,
            record.Status,
            record.Notes,
            record.CreatedAtUtc
        );
    }

    public async Task<FeeReminderDraftDto> SaveReminderDraftAsync(Guid organisationId, Guid userId, SaveFeeReminderDraftRequestDto request, CancellationToken ct = default)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.OrganisationId == organisationId && s.Id == request.StudentId, ct);
        if (student == null) throw new InvalidOperationException("Student not found.");

        var draft = new FeeReminderDraft
        {
            OrganisationId = organisationId,
            FeeRecordId = request.FeeRecordId,
            StudentId = request.StudentId,
            ReminderText = request.ReminderText.Trim(),
            WhatsAppVersion = request.WhatsAppVersion?.Trim(),
            Language = request.Language,
            Tone = request.Tone,
            CreatedByUserId = userId
        };

        await _context.FeeReminderDrafts.AddAsync(draft, ct);
        await _context.SaveChangesAsync(ct);

        return new FeeReminderDraftDto(
            draft.Id,
            draft.FeeRecordId,
            draft.StudentId,
            student.FullName,
            student.GuardianName,
            student.GuardianPhone,
            draft.ReminderText,
            draft.WhatsAppVersion,
            draft.Language,
            draft.Tone,
            draft.CreatedAtUtc
        );
    }

    public async Task<List<FeeReminderDraftDto>> GetReminderDraftsAsync(Guid organisationId, Guid feeRecordId, CancellationToken ct = default)
    {
        return await _context.FeeReminderDrafts
            .Include(d => d.Student)
            .Where(d => d.OrganisationId == organisationId && d.FeeRecordId == feeRecordId)
            .OrderByDescending(d => d.CreatedAtUtc)
            .Select(d => new FeeReminderDraftDto(
                d.Id,
                d.FeeRecordId,
                d.StudentId,
                d.Student.FullName,
                d.Student.GuardianName,
                d.Student.GuardianPhone,
                d.ReminderText,
                d.WhatsAppVersion,
                d.Language,
                d.Tone,
                d.CreatedAtUtc
            ))
            .ToListAsync(ct);
    }
}

public class TemplateService : ITemplateService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public TemplateService(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<List<NoticeTemplateDto>> GetTemplatesAsync(Guid organisationId, NoticeCategory? category = null, CancellationToken ct = default)
    {
        var query = _context.NoticeTemplates
            .Where(t => !t.IsArchived && (t.IsSystemTemplate || t.OrganisationId == organisationId));

        if (category.HasValue)
            query = query.Where(t => t.Category == category.Value);

        return await query
            .OrderByDescending(t => t.IsSystemTemplate)
            .ThenBy(t => t.Title)
            .Select(t => new NoticeTemplateDto(
                t.Id,
                t.OrganisationId,
                t.Title,
                t.Category,
                t.SubjectTemplate,
                t.BodyTemplate,
                t.WhatsAppTemplate,
                t.Language,
                t.IsSystemTemplate,
                t.IsArchived,
                t.CreatedAtUtc
            ))
            .ToListAsync(ct);
    }

    public async Task<NoticeTemplateDto?> GetTemplateByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var t = await _context.NoticeTemplates
            .FirstOrDefaultAsync(t => t.Id == id && (t.IsSystemTemplate || t.OrganisationId == organisationId), ct);

        if (t == null) return null;

        return new NoticeTemplateDto(
            t.Id,
            t.OrganisationId,
            t.Title,
            t.Category,
            t.SubjectTemplate,
            t.BodyTemplate,
            t.WhatsAppTemplate,
            t.Language,
            t.IsSystemTemplate,
            t.IsArchived,
            t.CreatedAtUtc
        );
    }

    public async Task<NoticeTemplateDto> CreateCustomTemplateAsync(Guid organisationId, CreateNoticeTemplateRequestDto request, CancellationToken ct = default)
    {
        var template = new NoticeTemplate
        {
            OrganisationId = organisationId,
            Title = request.Title.Trim(),
            Category = request.Category,
            SubjectTemplate = request.SubjectTemplate.Trim(),
            BodyTemplate = request.BodyTemplate.Trim(),
            WhatsAppTemplate = request.WhatsAppTemplate?.Trim(),
            Language = request.Language,
            IsSystemTemplate = false,
            IsArchived = false
        };

        await _context.NoticeTemplates.AddAsync(template, ct);
        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, null, "CreateTemplate", "NoticeTemplate", template.Id.ToString(), $"Created template '{template.Title}'", ct);

        return new NoticeTemplateDto(
            template.Id,
            template.OrganisationId,
            template.Title,
            template.Category,
            template.SubjectTemplate,
            template.BodyTemplate,
            template.WhatsAppTemplate,
            template.Language,
            template.IsSystemTemplate,
            template.IsArchived,
            template.CreatedAtUtc
        );
    }

    public async Task<NoticeTemplateDto?> UpdateCustomTemplateAsync(Guid organisationId, Guid id, UpdateNoticeTemplateRequestDto request, CancellationToken ct = default)
    {
        var template = await _context.NoticeTemplates
            .FirstOrDefaultAsync(t => t.OrganisationId == organisationId && t.Id == id && !t.IsSystemTemplate, ct);

        if (template == null) return null;

        template.Title = request.Title.Trim();
        template.Category = request.Category;
        template.SubjectTemplate = request.SubjectTemplate.Trim();
        template.BodyTemplate = request.BodyTemplate.Trim();
        template.WhatsAppTemplate = request.WhatsAppTemplate?.Trim();
        template.Language = request.Language;

        await _context.SaveChangesAsync(ct);

        return new NoticeTemplateDto(
            template.Id,
            template.OrganisationId,
            template.Title,
            template.Category,
            template.SubjectTemplate,
            template.BodyTemplate,
            template.WhatsAppTemplate,
            template.Language,
            template.IsSystemTemplate,
            template.IsArchived,
            template.CreatedAtUtc
        );
    }

    public async Task<NoticeTemplateDto?> DuplicateTemplateAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var orig = await _context.NoticeTemplates.FirstOrDefaultAsync(t => t.Id == id && (t.IsSystemTemplate || t.OrganisationId == organisationId), ct);
        if (orig == null) return null;

        var copy = new NoticeTemplate
        {
            OrganisationId = organisationId,
            Title = $"{orig.Title} (Copy)",
            Category = orig.Category,
            SubjectTemplate = orig.SubjectTemplate,
            BodyTemplate = orig.BodyTemplate,
            WhatsAppTemplate = orig.WhatsAppTemplate,
            Language = orig.Language,
            IsSystemTemplate = false,
            IsArchived = false
        };

        await _context.NoticeTemplates.AddAsync(copy, ct);
        await _context.SaveChangesAsync(ct);

        return new NoticeTemplateDto(
            copy.Id,
            copy.OrganisationId,
            copy.Title,
            copy.Category,
            copy.SubjectTemplate,
            copy.BodyTemplate,
            copy.WhatsAppTemplate,
            copy.Language,
            copy.IsSystemTemplate,
            copy.IsArchived,
            copy.CreatedAtUtc
        );
    }

    public async Task<bool> ArchiveTemplateAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var template = await _context.NoticeTemplates.FirstOrDefaultAsync(t => t.OrganisationId == organisationId && t.Id == id && !t.IsSystemTemplate, ct);
        if (template == null) return false;

        template.IsArchived = true;
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public class SubscriptionService : ISubscriptionService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public SubscriptionService(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<List<SubscriptionPlanDto>> GetAvailablePlansAsync(CancellationToken ct = default)
    {
        return await _context.SubscriptionPlans
            .Where(p => p.IsActive)
            .OrderBy(p => p.Tier)
            .Select(p => new SubscriptionPlanDto(
                p.Id,
                p.Name,
                p.Tier,
                p.PriceInrMonthly,
                p.MaxNoticesPerMonth,
                p.MaxActivityPlansPerMonth,
                p.MaxStudents,
                p.MaxClasses,
                p.AllowWhatsAppFormat,
                p.AllowTranslations,
                p.AllowCustomTemplates,
                p.AllowCsvExport
            ))
            .ToListAsync(ct);
    }

    public async Task<OrganisationSubscriptionDto> GetCurrentSubscriptionAsync(Guid organisationId, CancellationToken ct = default)
    {
        var sub = await _context.OrganisationSubscriptions
            .Include(s => s.SubscriptionPlan)
            .Include(s => s.Organisation)
            .FirstOrDefaultAsync(s => s.OrganisationId == organisationId, ct);

        if (sub == null)
        {
            throw new InvalidOperationException("Organisation has no subscription assigned.");
        }

        var studentCount = await _context.Students.CountAsync(s => s.OrganisationId == organisationId && s.IsActive, ct);
        var classCount = await _context.Classes.CountAsync(c => c.OrganisationId == organisationId && c.IsActive, ct);

        var plan = sub.SubscriptionPlan;

        return new OrganisationSubscriptionDto(
            OrganisationId: sub.OrganisationId,
            OrganisationName: sub.Organisation.Name,
            SubscriptionPlanId: plan.Id,
            PlanName: plan.Name,
            Tier: plan.Tier,
            Status: sub.Status,
            CurrentPeriodStartUtc: sub.CurrentPeriodStartUtc,
            CurrentPeriodEndUtc: sub.CurrentPeriodEndUtc,
            TrialEndsAtUtc: sub.TrialEndsAtUtc,
            NoticesGeneratedThisMonth: sub.NoticesGeneratedThisMonth,
            MaxNoticesPerMonth: plan.MaxNoticesPerMonth,
            ActivityPlansGeneratedThisMonth: sub.ActivityPlansGeneratedThisMonth,
            MaxActivityPlansPerMonth: plan.MaxActivityPlansPerMonth,
            CurrentStudentCount: studentCount,
            MaxStudents: plan.MaxStudents,
            CurrentClassCount: classCount,
            MaxClasses: plan.MaxClasses,
            CanGenerateNotice: sub.NoticesGeneratedThisMonth < plan.MaxNoticesPerMonth,
            CanGenerateActivityPlan: sub.ActivityPlansGeneratedThisMonth < plan.MaxActivityPlansPerMonth,
            CanAddStudent: studentCount < plan.MaxStudents,
            CanAddClass: classCount < plan.MaxClasses
        );
    }

    public async Task<OrganisationSubscriptionDto> ChangeSubscriptionPlanAsync(Guid organisationId, ChangeSubscriptionPlanRequestDto request, CancellationToken ct = default)
    {
        var sub = await _context.OrganisationSubscriptions
            .Include(s => s.SubscriptionPlan)
            .Include(s => s.Organisation)
            .FirstOrDefaultAsync(s => s.OrganisationId == organisationId, ct);

        if (sub == null) throw new InvalidOperationException("Subscription not found.");

        var newPlan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == request.NewPlanId && p.IsActive, ct);
        if (newPlan == null) throw new InvalidOperationException("Target subscription plan does not exist.");

        sub.SubscriptionPlanId = newPlan.Id;
        sub.SubscriptionPlan = newPlan;
        sub.Status = SubscriptionStatus.Active;
        sub.CurrentPeriodStartUtc = DateTime.UtcNow;
        sub.CurrentPeriodEndUtc = DateTime.UtcNow.AddDays(30);

        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, null, "ChangeSubscriptionPlan", "Subscription", newPlan.Id.ToString(), $"Upgraded/Changed plan to {newPlan.Name}", ct);

        return await GetCurrentSubscriptionAsync(organisationId, ct);
    }

    public async Task<bool> CanPerformAiActionAsync(Guid organisationId, AiGenerationType actionType, CancellationToken ct = default)
    {
        var sub = await _context.OrganisationSubscriptions
            .Include(s => s.SubscriptionPlan)
            .FirstOrDefaultAsync(s => s.OrganisationId == organisationId, ct);

        if (sub == null) return false;

        return actionType switch
        {
            AiGenerationType.Notice => sub.NoticesGeneratedThisMonth < sub.SubscriptionPlan.MaxNoticesPerMonth,
            AiGenerationType.ActivityPlan => sub.ActivityPlansGeneratedThisMonth < sub.SubscriptionPlan.MaxActivityPlansPerMonth,
            _ => true
        };
    }

    public async Task IncrementUsageAsync(Guid organisationId, AiGenerationType actionType, CancellationToken ct = default)
    {
        var sub = await _context.OrganisationSubscriptions.FirstOrDefaultAsync(s => s.OrganisationId == organisationId, ct);
        if (sub == null) return;

        if (actionType == AiGenerationType.Notice)
            sub.NoticesGeneratedThisMonth++;
        else if (actionType == AiGenerationType.ActivityPlan)
            sub.ActivityPlansGeneratedThisMonth++;

        await _context.SaveChangesAsync(ct);
    }
}

public class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _context;
    private readonly IAttendanceService _attendanceService;
    private readonly ISubscriptionService _subscriptionService;

    public DashboardService(
        IApplicationDbContext context,
        IAttendanceService attendanceService,
        ISubscriptionService subscriptionService)
    {
        _context = context;
        _attendanceService = attendanceService;
        _subscriptionService = subscriptionService;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(Guid organisationId, CancellationToken ct = default)
    {
        var studentCount = await _context.Students.CountAsync(s => s.OrganisationId == organisationId && s.IsActive, ct);
        var classCount = await _context.Classes.CountAsync(c => c.OrganisationId == organisationId && c.IsActive, ct);
        var noticeCount = await _context.Notices.CountAsync(n => n.OrganisationId == organisationId, ct);
        var planCount = await _context.ActivityPlans.CountAsync(p => p.OrganisationId == organisationId, ct);

        var attendanceSummary = await _attendanceService.GetAttendanceSummaryAsync(organisationId, DateOnly.FromDateTime(DateTime.UtcNow), ct);
        var subscription = await _subscriptionService.GetCurrentSubscriptionAsync(organisationId, ct);

        var recentNotices = await _context.Notices
            .Include(n => n.ClassRoom)
            .Where(n => n.OrganisationId == organisationId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(5)
            .Select(n => new NoticeDto(
                n.Id,
                n.OrganisationId,
                n.Title,
                n.MessageBody,
                n.WhatsAppVersion,
                n.Category,
                n.TargetAudience,
                n.ClassRoomId,
                n.ClassRoom != null ? n.ClassRoom.Name : null,
                n.Language,
                n.Tone,
                n.IsDraft,
                n.CreatedAtUtc
            ))
            .ToListAsync(ct);

        var recentAi = await _context.AiGenerationLogs
            .Where(l => l.OrganisationId == organisationId)
            .OrderByDescending(l => l.CreatedAtUtc)
            .Take(5)
            .Select(l => new RecentAiActivityDto(
                l.Id,
                l.GenerationType.ToString(),
                l.ModelName,
                l.CreatedAtUtc,
                l.IsSuccess
            ))
            .ToListAsync(ct);

        var pendingFees = await _context.FeeRecords
            .Where(f => f.OrganisationId == organisationId && (f.Status == FeeStatus.Pending || f.Status == FeeStatus.Overdue))
            .ToListAsync(ct);

        var totalPending = pendingFees.Sum(f => f.Amount - f.PaidAmount);

        return new DashboardStatsDto(
            TotalStudents: studentCount,
            TotalClasses: classCount,
            NoticesCount: noticeCount,
            ActivityPlansCount: planCount,
            TodayAttendance: attendanceSummary,
            Subscription: subscription,
            RecentNotices: recentNotices,
            RecentAiActivities: recentAi,
            PendingFeeRecordsCount: pendingFees.Count,
            TotalPendingFeeAmount: totalPending
        );
    }
}

public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;

    public AuditService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(Guid organisationId, Guid? userId, string action, string entityType, string? entityId, string? details, CancellationToken ct = default)
    {
        var evt = new AuditEvent
        {
            OrganisationId = organisationId,
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            TimestampUtc = DateTime.UtcNow
        };

        await _context.AuditEvents.AddAsync(evt, ct);
        await _context.SaveChangesAsync(ct);
    }
}
