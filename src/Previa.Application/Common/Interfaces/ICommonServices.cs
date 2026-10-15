using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? OrganisationId { get; }
    UserRole? UserRole { get; }
    string? UserEmail { get; }
    string? IpAddress { get; }
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) GenerateAccessToken(User user, Guid organisationId, UserRole role);
    string GenerateRefreshToken();
}

public interface IAuditService
{
    Task LogAsync(Guid organisationId, Guid? userId, string action, string entityType, string? entityId, string? details, CancellationToken ct = default);
}
