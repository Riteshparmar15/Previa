using Microsoft.EntityFrameworkCore;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.Auth;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuditService _auditService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IAuditService auditService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _auditService = auditService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken ct = default)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), ct);
        if (existingUser)
        {
            throw new InvalidOperationException("An account with this email address already exists.");
        }

        var user = new User
        {
            Email = request.Email.Trim().ToLower(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            EmailConfirmed = true,
            IsActive = true
        };

        // Create initial organisation
        var slug = request.OrganisationName.ToLower().Replace(" ", "-").Replace("'", "").Replace(".", "");
        var org = new Organisation
        {
            Name = request.OrganisationName.Trim(),
            Slug = $"{slug}-{Guid.NewGuid().ToString()[..6]}",
            ContactEmail = user.Email,
            ContactPhone = user.PhoneNumber,
            City = string.IsNullOrWhiteSpace(request.City) ? "Vadodara" : request.City.Trim(),
            State = "Gujarat",
            Country = "India",
            PreferredLanguage = request.PreferredLanguage,
            TimeZoneId = "India Standard Time",
            IsActive = true
        };

        // Assign Owner membership
        var membership = new OrganisationMembership
        {
            Organisation = org,
            User = user,
            Role = UserRole.Owner,
            IsActive = true,
            JoinedAtUtc = DateTime.UtcNow
        };

        // Attach default starter subscription (14-day trial)
        var starterPlan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Tier == SubscriptionTier.Starter, ct)
                          ?? new SubscriptionPlan
                          {
                              Name = "Starter",
                              Tier = SubscriptionTier.Starter,
                              PriceInrMonthly = 499,
                              MaxNoticesPerMonth = 30,
                              MaxActivityPlansPerMonth = 10,
                              MaxStudents = 30,
                              MaxClasses = 2
                          };

        var subscription = new OrganisationSubscription
        {
            Organisation = org,
            SubscriptionPlan = starterPlan,
            Status = SubscriptionStatus.Trialing,
            CurrentPeriodStartUtc = DateTime.UtcNow,
            CurrentPeriodEndUtc = DateTime.UtcNow.AddDays(30),
            TrialEndsAtUtc = DateTime.UtcNow.AddDays(14)
        };

        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        user.LastLoginAtUtc = DateTime.UtcNow;

        await _context.Users.AddAsync(user, ct);
        await _context.Organisations.AddAsync(org, ct);
        await _context.Memberships.AddAsync(membership, ct);
        await _context.OrganisationSubscriptions.AddAsync(subscription, ct);
        await _context.SaveChangesAsync(ct);

        await _auditService.LogAsync(org.Id, user.Id, "UserRegistered", "User", user.Id.ToString(), $"Owner registered for organisation {org.Name}", ct);

        var (token, expires) = _jwtTokenService.GenerateAccessToken(user, org.Id, UserRole.Owner);

        return new AuthResponseDto(
            UserId: user.Id,
            Email: user.Email,
            FullName: user.FullName,
            OrganisationId: org.Id,
            OrganisationName: org.Name,
            Role: UserRole.Owner,
            AccessToken: token,
            RefreshToken: refreshToken,
            ExpiresAtUtc: expires,
            NeedsOnboarding: false
        );
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Organisation)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower(), ct);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account has been deactivated. Please contact support.");
        }

        var activeMembership = user.Memberships.FirstOrDefault(m => m.IsActive && m.Organisation.IsActive);
        if (activeMembership == null)
        {
            throw new UnauthorizedAccessException("No active organisation membership found for this user.");
        }

        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        user.LastLoginAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        var (token, expires) = _jwtTokenService.GenerateAccessToken(user, activeMembership.OrganisationId, activeMembership.Role);

        await _auditService.LogAsync(activeMembership.OrganisationId, user.Id, "UserLogin", "User", user.Id.ToString(), "Successful login", ct);

        return new AuthResponseDto(
            UserId: user.Id,
            Email: user.Email,
            FullName: user.FullName,
            OrganisationId: activeMembership.OrganisationId,
            OrganisationName: activeMembership.Organisation.Name,
            Role: activeMembership.Role,
            AccessToken: token,
            RefreshToken: refreshToken,
            ExpiresAtUtc: expires,
            NeedsOnboarding: false
        );
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Organisation)
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken, ct);

        if (user == null || user.RefreshTokenExpiresAtUtc < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var activeMembership = user.Memberships.FirstOrDefault(m => m.IsActive && m.Organisation.IsActive);
        if (activeMembership == null)
        {
            throw new UnauthorizedAccessException("No active organisation membership found.");
        }

        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync(ct);

        var (token, expires) = _jwtTokenService.GenerateAccessToken(user, activeMembership.OrganisationId, activeMembership.Role);

        return new AuthResponseDto(
            UserId: user.Id,
            Email: user.Email,
            FullName: user.FullName,
            OrganisationId: activeMembership.OrganisationId,
            OrganisationName: activeMembership.Organisation.Name,
            Role: activeMembership.Role,
            AccessToken: token,
            RefreshToken: newRefreshToken,
            ExpiresAtUtc: expires,
            NeedsOnboarding: false
        );
    }

    public async Task LogoutAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, ct);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiresAtUtc = null;
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower(), ct);
        if (user == null)
            return true; // Return true to avoid user enumeration

        user.PasswordResetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetExpiresAtUtc = DateTime.UtcNow.AddHours(2);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => 
            u.Email.ToLower() == request.Email.Trim().ToLower() &&
            u.PasswordResetToken == request.Token &&
            u.PasswordResetExpiresAtUtc > DateTime.UtcNow, ct);

        if (user == null)
            return false;

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiresAtUtc = null;
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<UserProfileDto?> GetCurrentUserProfileAsync(Guid userId, Guid organisationId, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Organisation)
                    .ThenInclude(o => o.Subscription)
                        .ThenInclude(s => s!.SubscriptionPlan)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null) return null;

        var membership = user.Memberships.FirstOrDefault(m => m.OrganisationId == organisationId);
        if (membership == null) return null;

        var org = membership.Organisation;
        var planTier = org.Subscription?.SubscriptionPlan?.Tier.ToString() ?? "Starter";

        return new UserProfileDto(
            UserId: user.Id,
            Email: user.Email,
            FullName: user.FullName,
            PhoneNumber: user.PhoneNumber,
            OrganisationId: org.Id,
            OrganisationName: org.Name,
            OrganisationCity: org.City,
            Role: membership.Role,
            PreferredLanguage: org.PreferredLanguage,
            TimeZoneId: org.TimeZoneId,
            SubscriptionTier: planTier
        );
    }
}
