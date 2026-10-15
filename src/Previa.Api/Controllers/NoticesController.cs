using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.Ai;
using Previa.Application.Features.Notices;
using Previa.Application.Features.Subscriptions;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Api.Controllers;

[Authorize]
public class NoticesController : BaseApiController
{
    private readonly INoticeService _noticeService;
    private readonly IAiAssistantService _aiService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly IApplicationDbContext _context;

    public NoticesController(
        INoticeService noticeService,
        IAiAssistantService aiService,
        ISubscriptionService subscriptionService,
        IApplicationDbContext context)
    {
        _noticeService = noticeService;
        _aiService = aiService;
        _subscriptionService = subscriptionService;
        _context = context;
    }

    [HttpPost("ai-generate")]
    public async Task<ActionResult<GenerateNoticeAiResponse>> GenerateWithAi([FromBody] GenerateNoticeAiRequest request, CancellationToken ct)
    {
        // 1. Check subscription limit
        var canGenerate = await _subscriptionService.CanPerformAiActionAsync(CurrentOrganisationId, AiGenerationType.Notice, ct);
        if (!canGenerate)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Monthly AI notice generation limit reached for your current subscription plan. Please upgrade to create more notices."
            });
        }

        var sw = Stopwatch.StartNew();
        try
        {
            var result = await _aiService.GenerateNoticeAsync(request, ct);
            sw.Stop();

            // Record log
            await _context.AiGenerationLogs.AddAsync(new AiGenerationLog
            {
                OrganisationId = CurrentOrganisationId,
                UserId = CurrentUserId,
                GenerationType = AiGenerationType.Notice,
                ModelName = result.ModelUsed,
                PromptSummary = $"Category: {request.Category}, Subject: {request.Subject}, Lang: {request.Language}",
                InputTokens = 150,
                OutputTokens = result.EstimatedTokens,
                DurationMs = sw.ElapsedMilliseconds,
                IsSuccess = true
            }, ct);
            await _context.SaveChangesAsync(ct);

            return Ok(result);
        }
        catch (Exception ex)
        {
            sw.Stop();
            await _context.AiGenerationLogs.AddAsync(new AiGenerationLog
            {
                OrganisationId = CurrentOrganisationId,
                UserId = CurrentUserId,
                GenerationType = AiGenerationType.Notice,
                ModelName = _aiService.ProviderName,
                PromptSummary = $"Failed Notice - Subject: {request.Subject}",
                DurationMs = sw.ElapsedMilliseconds,
                IsSuccess = false,
                ErrorMessage = ex.Message
            }, ct);
            await _context.SaveChangesAsync(ct);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "AI service is currently unable to process your request. Please try again or draft manually."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<NoticeDto>>> GetNotices([FromQuery] NoticeListFilterDto filter, CancellationToken ct)
    {
        var result = await _noticeService.GetNoticesAsync(CurrentOrganisationId, filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoticeDto>> GetNoticeById(Guid id, CancellationToken ct)
    {
        var notice = await _noticeService.GetNoticeByIdAsync(CurrentOrganisationId, id, ct);
        if (notice == null)
            return NotFound(new { message = "Notice not found." });
        return Ok(notice);
    }

    [HttpPost]
    public async Task<ActionResult<NoticeDto>> CreateNotice([FromBody] CreateNoticeRequestDto request, CancellationToken ct)
    {
        var notice = await _noticeService.CreateNoticeAsync(CurrentOrganisationId, CurrentUserId, request, ct);
        return CreatedAtAction(nameof(GetNoticeById), new { id = notice.Id }, notice);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoticeDto>> UpdateNotice(Guid id, [FromBody] UpdateNoticeRequestDto request, CancellationToken ct)
    {
        var updated = await _noticeService.UpdateNoticeAsync(CurrentOrganisationId, id, request, ct);
        if (updated == null)
            return NotFound(new { message = "Notice not found." });
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNotice(Guid id, CancellationToken ct)
    {
        var deleted = await _noticeService.DeleteNoticeAsync(CurrentOrganisationId, id, ct);
        if (!deleted)
            return NotFound(new { message = "Notice not found." });
        return NoContent();
    }
}
