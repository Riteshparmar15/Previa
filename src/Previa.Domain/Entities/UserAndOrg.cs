using Previa.Domain.Common;
using Previa.Domain.Enums;

namespace Previa.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool EmailConfirmed { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAtUtc { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAtUtc { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiresAtUtc { get; set; }

    public ICollection<OrganisationMembership> Memberships { get; set; } = new List<OrganisationMembership>();
}

public class Organisation : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = "Vadodara";
    public string State { get; set; } = "Gujarat";
    public string Country { get; set; } = "India";
    public SupportedLanguage PreferredLanguage { get; set; } = SupportedLanguage.English;
    public string TimeZoneId { get; set; } = "India Standard Time";
    public bool IsActive { get; set; } = true;

    public ICollection<OrganisationMembership> Memberships { get; set; } = new List<OrganisationMembership>();
    public OrganisationSubscription? Subscription { get; set; }
    public ICollection<ClassRoom> Classes { get; set; } = new List<ClassRoom>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Notice> Notices { get; set; } = new List<Notice>();
    public ICollection<ActivityPlan> ActivityPlans { get; set; } = new List<ActivityPlan>();
    public ICollection<FeeRecord> FeeRecords { get; set; } = new List<FeeRecord>();
    public ICollection<NoticeTemplate> CustomTemplates { get; set; } = new List<NoticeTemplate>();
}

public class OrganisationMembership : BaseEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public UserRole Role { get; set; } = UserRole.Owner;
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;
}
