using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.ActivityPlans;
using Previa.Application.Features.Ai;
using Previa.Application.Features.Notices;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Services;

public class NoticeService : INoticeService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public NoticeService(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PagedResult<NoticeDto>> GetNoticesAsync(Guid organisationId, NoticeListFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.Notices
            .Include(n => n.ClassRoom)
            .Where(n => n.OrganisationId == organisationId);

        if (filter.Category.HasValue)
            query = query.Where(n => n.Category == filter.Category.Value);

        if (filter.Audience.HasValue)
            query = query.Where(n => n.TargetAudience == filter.Audience.Value);

        if (filter.Language.HasValue)
            query = query.Where(n => n.Language == filter.Language.Value);

        if (filter.IsDraft.HasValue)
            query = query.Where(n => n.IsDraft == filter.IsDraft.Value);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(n => n.Title.ToLower().Contains(search) || n.MessageBody.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var items = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<NoticeDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<NoticeDto?> GetNoticeByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var notice = await _context.Notices
            .Include(n => n.ClassRoom)
            .FirstOrDefaultAsync(n => n.OrganisationId == organisationId && n.Id == id, ct);

        if (notice == null) return null;

        return new NoticeDto(
            notice.Id,
            notice.OrganisationId,
            notice.Title,
            notice.MessageBody,
            notice.WhatsAppVersion,
            notice.Category,
            notice.TargetAudience,
            notice.ClassRoomId,
            notice.ClassRoom?.Name,
            notice.Language,
            notice.Tone,
            notice.IsDraft,
            notice.CreatedAtUtc
        );
    }

    public async Task<NoticeDto> CreateNoticeAsync(Guid organisationId, Guid userId, CreateNoticeRequestDto request, CancellationToken ct = default)
    {
        var notice = new Notice
        {
            OrganisationId = organisationId,
            CreatedByUserId = userId,
            Title = request.Title.Trim(),
            MessageBody = request.MessageBody.Trim(),
            WhatsAppVersion = request.WhatsAppVersion?.Trim(),
            Category = request.Category,
            TargetAudience = request.TargetAudience,
            ClassRoomId = request.ClassRoomId,
            Language = request.Language,
            Tone = request.Tone,
            IsDraft = request.IsDraft,
            AdditionalInstructions = request.AdditionalInstructions
        };

        await _context.Notices.AddAsync(notice, ct);

        // Update organisation usage
        var sub = await _context.OrganisationSubscriptions.FirstOrDefaultAsync(s => s.OrganisationId == organisationId, ct);
        if (sub != null)
        {
            sub.NoticesGeneratedThisMonth++;
        }

        await _context.SaveChangesAsync(ct);

        await _auditService.LogAsync(organisationId, userId, "CreateNotice", "Notice", notice.Id.ToString(), $"Notice '{notice.Title}' created", ct);

        string? className = null;
        if (notice.ClassRoomId.HasValue)
        {
            className = await _context.Classes.Where(c => c.Id == notice.ClassRoomId).Select(c => c.Name).FirstOrDefaultAsync(ct);
        }

        return new NoticeDto(
            notice.Id,
            notice.OrganisationId,
            notice.Title,
            notice.MessageBody,
            notice.WhatsAppVersion,
            notice.Category,
            notice.TargetAudience,
            notice.ClassRoomId,
            className,
            notice.Language,
            notice.Tone,
            notice.IsDraft,
            notice.CreatedAtUtc
        );
    }

    public async Task<NoticeDto?> UpdateNoticeAsync(Guid organisationId, Guid id, UpdateNoticeRequestDto request, CancellationToken ct = default)
    {
        var notice = await _context.Notices
            .Include(n => n.ClassRoom)
            .FirstOrDefaultAsync(n => n.OrganisationId == organisationId && n.Id == id, ct);

        if (notice == null) return null;

        notice.Title = request.Title.Trim();
        notice.MessageBody = request.MessageBody.Trim();
        notice.WhatsAppVersion = request.WhatsAppVersion?.Trim();
        notice.Category = request.Category;
        notice.TargetAudience = request.TargetAudience;
        notice.ClassRoomId = request.ClassRoomId;
        notice.Language = request.Language;
        notice.Tone = request.Tone;
        notice.IsDraft = request.IsDraft;

        await _context.SaveChangesAsync(ct);

        return new NoticeDto(
            notice.Id,
            notice.OrganisationId,
            notice.Title,
            notice.MessageBody,
            notice.WhatsAppVersion,
            notice.Category,
            notice.TargetAudience,
            notice.ClassRoomId,
            notice.ClassRoom?.Name,
            notice.Language,
            notice.Tone,
            notice.IsDraft,
            notice.CreatedAtUtc
        );
    }

    public async Task<bool> DeleteNoticeAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var notice = await _context.Notices.FirstOrDefaultAsync(n => n.OrganisationId == organisationId && n.Id == id, ct);
        if (notice == null) return false;

        _context.Notices.Remove(notice);
        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, null, "DeleteNotice", "Notice", id.ToString(), $"Deleted notice {id}", ct);
        return true;
    }
}

public class ActivityPlanService : IActivityPlanService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public ActivityPlanService(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PagedResult<ActivityPlanDto>> GetPlansAsync(Guid organisationId, ActivityPlanListFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.ActivityPlans
            .Include(p => p.ClassRoom)
            .Where(p => p.OrganisationId == organisationId);

        if (!string.IsNullOrWhiteSpace(filter.AgeGroup))
            query = query.Where(p => p.AgeGroup == filter.AgeGroup);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(p => p.Topic.ToLower().Contains(search) || p.LearningObjectives.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var list = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = list.Select(p =>
        {
            var days = new List<ActivityDayItem>();
            try
            {
                if (!string.IsNullOrWhiteSpace(p.StructuredPlanJson))
                    days = JsonSerializer.Deserialize<List<ActivityDayItem>>(p.StructuredPlanJson) ?? new();
            }
            catch { }

            return new ActivityPlanDto(
                p.Id,
                p.OrganisationId,
                p.Topic,
                p.AgeGroup,
                p.NumberOfDays,
                p.LearningObjectives,
                p.Materials,
                p.Setting,
                p.Language,
                p.ClassRoomId,
                p.ClassRoom?.Name,
                days,
                p.CreatedAtUtc
            );
        }).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<ActivityPlanDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<ActivityPlanDto?> GetPlanByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var p = await _context.ActivityPlans
            .Include(p => p.ClassRoom)
            .FirstOrDefaultAsync(p => p.OrganisationId == organisationId && p.Id == id, ct);

        if (p == null) return null;

        var days = new List<ActivityDayItem>();
        try
        {
            if (!string.IsNullOrWhiteSpace(p.StructuredPlanJson))
                days = JsonSerializer.Deserialize<List<ActivityDayItem>>(p.StructuredPlanJson) ?? new();
        }
        catch { }

        return new ActivityPlanDto(
            p.Id,
            p.OrganisationId,
            p.Topic,
            p.AgeGroup,
            p.NumberOfDays,
            p.LearningObjectives,
            p.Materials,
            p.Setting,
            p.Language,
            p.ClassRoomId,
            p.ClassRoom?.Name,
            days,
            p.CreatedAtUtc
        );
    }

    public async Task<ActivityPlanDto> SavePlanAsync(Guid organisationId, Guid userId, SaveActivityPlanRequestDto request, CancellationToken ct = default)
    {
        var plan = new ActivityPlan
        {
            OrganisationId = organisationId,
            CreatedByUserId = userId,
            Topic = request.Topic.Trim(),
            AgeGroup = request.AgeGroup.Trim(),
            NumberOfDays = request.NumberOfDays,
            LearningObjectives = request.LearningObjectives.Trim(),
            Materials = request.Materials.Trim(),
            Setting = request.Setting.Trim(),
            Language = request.Language,
            ClassRoomId = request.ClassRoomId,
            StructuredPlanJson = JsonSerializer.Serialize(request.Days)
        };

        await _context.ActivityPlans.AddAsync(plan, ct);

        // Update organisation usage
        var sub = await _context.OrganisationSubscriptions.FirstOrDefaultAsync(s => s.OrganisationId == organisationId, ct);
        if (sub != null)
        {
            sub.ActivityPlansGeneratedThisMonth++;
        }

        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, userId, "CreateActivityPlan", "ActivityPlan", plan.Id.ToString(), $"Activity plan '{plan.Topic}' saved", ct);

        string? className = null;
        if (plan.ClassRoomId.HasValue)
        {
            className = await _context.Classes.Where(c => c.Id == plan.ClassRoomId).Select(c => c.Name).FirstOrDefaultAsync(ct);
        }

        return new ActivityPlanDto(
            plan.Id,
            plan.OrganisationId,
            plan.Topic,
            plan.AgeGroup,
            plan.NumberOfDays,
            plan.LearningObjectives,
            plan.Materials,
            plan.Setting,
            plan.Language,
            plan.ClassRoomId,
            className,
            request.Days,
            plan.CreatedAtUtc
        );
    }

    public async Task<bool> DeletePlanAsync(Guid organisationId, Guid id, CancellationToken ct = default)
    {
        var plan = await _context.ActivityPlans.FirstOrDefaultAsync(p => p.OrganisationId == organisationId && p.Id == id, ct);
        if (plan == null) return false;

        _context.ActivityPlans.Remove(plan);
        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, null, "DeleteActivityPlan", "ActivityPlan", id.ToString(), $"Deleted activity plan {id}", ct);
        return true;
    }
}
