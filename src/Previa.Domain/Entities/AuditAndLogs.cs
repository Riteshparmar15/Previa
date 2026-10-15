using Previa.Domain.Common;
using Previa.Domain.Enums;

namespace Previa.Domain.Entities;

public class AiGenerationLog : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public AiGenerationType GenerationType { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public string PromptSummary { get; set; } = string.Empty;
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
    public long DurationMs { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}

public class AuditEvent : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty; // e.g. "CreateNotice", "UpdateAttendance", "ExportCsv"
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}
