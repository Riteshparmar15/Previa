using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Previa.Domain.Enums;

namespace Previa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(idClaim, out var id))
                return id;
            throw new UnauthorizedAccessException("User is not authenticated.");
        }
    }

    protected Guid CurrentOrganisationId
    {
        get
        {
            var orgClaim = User.FindFirst("org_id")?.Value;
            if (Guid.TryParse(orgClaim, out var orgId))
                return orgId;
            throw new UnauthorizedAccessException("No organisation context found in token.");
        }
    }

    protected UserRole CurrentUserRole
    {
        get
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (Enum.TryParse<UserRole>(roleClaim, true, out var role))
                return role;
            return UserRole.Staff;
        }
    }
}
