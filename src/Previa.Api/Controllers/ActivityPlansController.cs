using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.ActivityPlans;
using Previa.Application.Features.Ai;
using Previa.Application.Features.Notices;
using Previa.Application.Features.Subscriptions;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Api.Controllers;

[Authorize]
[Route("api/activityplans")]
[Route("api/activity-plans")]
public class ActivityPlansController : BaseApiController
{
    private readonly IActivityPlanService _planService;
    private readonly IAiAssistantService _aiService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly IApplicationDbContext _context;

    public ActivityPlansController(
        IActivityPlanService planService,
        IAiAssistantService aiService,
        ISubscriptionService subscriptionService,
        IApplicationDbContext context)
    {
        _planService = planService;
        _aiService = aiService;
        _subscriptionService = subscriptionService;
        _context = context;
    }

    [HttpPost("ai-generate")]
    public async Task<ActionResult<GenerateActivityPlanAiResponse>> GenerateWithAi([FromBody] GenerateActivityPlanAiRequest request, CancellationToken ct)
    {
        var canGenerate = await _subscriptionService.CanPerformAiActionAsync(CurrentOrganisationId, AiGenerationType.ActivityPlan, ct);
        if (!canGenerate)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Monthly AI activity plan generation limit reached for your plan. Please upgrade to create more plans."
            });
        }

        var sw = Stopwatch.StartNew();
        try
        {
            var result = await _aiService.GenerateActivityPlanAsync(request, ct);
            sw.Stop();

            await _context.AiGenerationLogs.AddAsync(new AiGenerationLog
            {
                OrganisationId = CurrentOrganisationId,
                UserId = CurrentUserId,
                GenerationType = AiGenerationType.ActivityPlan,
                ModelName = result.ModelUsed,
                PromptSummary = $"Topic: {request.Topic}, Age: {request.AgeGroup}, Days: {request.NumberOfDays}",
                InputTokens = 200,
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
                GenerationType = AiGenerationType.ActivityPlan,
                ModelName = _aiService.ProviderName,
                PromptSummary = $"Failed Plan - Topic: {request.Topic}",
                DurationMs = sw.ElapsedMilliseconds,
                IsSuccess = false,
                ErrorMessage = ex.Message
            }, ct);
            await _context.SaveChangesAsync(ct);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "AI service is currently unable to generate the lesson plan. Please try again."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ActivityPlanDto>>> GetPlans([FromQuery] ActivityPlanListFilterDto filter, CancellationToken ct)
    {
        var result = await _planService.GetPlansAsync(CurrentOrganisationId, filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ActivityPlanDto>> GetPlanById(Guid id, CancellationToken ct)
    {
        var plan = await _planService.GetPlanByIdAsync(CurrentOrganisationId, id, ct);
        if (plan == null)
            return NotFound(new { message = "Activity plan not found." });
        return Ok(plan);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityPlanDto>> SavePlan([FromBody] SaveActivityPlanRequestDto request, CancellationToken ct)
    {
        var plan = await _planService.SavePlanAsync(CurrentOrganisationId, CurrentUserId, request, ct);
        return CreatedAtAction(nameof(GetPlanById), new { id = plan.Id }, plan);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlan(Guid id, CancellationToken ct)
    {
        var deleted = await _planService.DeletePlanAsync(CurrentOrganisationId, id, ct);
        if (!deleted)
            return NotFound(new { message = "Activity plan not found." });
        return NoContent();
    }
}
