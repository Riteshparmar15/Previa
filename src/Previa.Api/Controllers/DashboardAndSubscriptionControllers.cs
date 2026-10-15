using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Previa.Application.Features.Dashboard;
using Previa.Application.Features.Subscriptions;

namespace Previa.Api.Controllers;

[Authorize]
public class SubscriptionsController : BaseApiController
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<ActionResult<List<SubscriptionPlanDto>>> GetPlans(CancellationToken ct)
    {
        var plans = await _subscriptionService.GetAvailablePlansAsync(ct);
        return Ok(plans);
    }

    [HttpGet("current")]
    public async Task<ActionResult<OrganisationSubscriptionDto>> GetCurrentSubscription(CancellationToken ct)
    {
        var current = await _subscriptionService.GetCurrentSubscriptionAsync(CurrentOrganisationId, ct);
        return Ok(current);
    }

    [HttpPost("change-plan")]
    public async Task<ActionResult<OrganisationSubscriptionDto>> ChangePlan([FromBody] ChangeSubscriptionPlanRequestDto request, CancellationToken ct)
    {
        var updated = await _subscriptionService.ChangeSubscriptionPlanAsync(CurrentOrganisationId, request, ct);
        return Ok(updated);
    }
}

[Authorize]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats(CancellationToken ct)
    {
        var stats = await _dashboardService.GetDashboardStatsAsync(CurrentOrganisationId, ct);
        return Ok(stats);
    }
}
