using FluentValidation;
using Previa.Domain.Enums;

namespace Previa.Application.Features.Auth;

public record RegisterRequestDto(
    string Email,
    string Password,
    string FullName,
    string? PhoneNumber,
    string OrganisationName,
    string City,
    SupportedLanguage PreferredLanguage
);

public record LoginRequestDto(
    string Email,
    string Password
);

public record RefreshTokenRequestDto(
    string RefreshToken
);

public record ForgotPasswordRequestDto(
    string Email
);

public record ResetPasswordRequestDto(
    string Email,
    string Token,
    string NewPassword
);

public record AuthResponseDto(
    Guid UserId,
    string Email,
    string FullName,
    Guid OrganisationId,
    string OrganisationName,
    UserRole Role,
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAtUtc,
    bool NeedsOnboarding
);

public record UserProfileDto(
    Guid UserId,
    string Email,
    string FullName,
    string? PhoneNumber,
    Guid OrganisationId,
    string OrganisationName,
    string OrganisationCity,
    UserRole Role,
    SupportedLanguage PreferredLanguage,
    string TimeZoneId,
    string SubscriptionTier
);

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).WithMessage("Password must be at least 8 characters long.");
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.OrganisationName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken ct = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken ct = default);
    Task LogoutAsync(Guid userId, CancellationToken ct = default);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken ct = default);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken ct = default);
    Task<UserProfileDto?> GetCurrentUserProfileAsync(Guid userId, Guid organisationId, CancellationToken ct = default);
}
