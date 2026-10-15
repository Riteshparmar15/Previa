using Previa.Domain.Enums;

namespace Previa.Application.Features.Templates;

public record NoticeTemplateDto(
    Guid Id,
    Guid? OrganisationId,
    string Title,
    NoticeCategory Category,
    string SubjectTemplate,
    string BodyTemplate,
    string? WhatsAppTemplate,
    SupportedLanguage Language,
    bool IsSystemTemplate,
    bool IsArchived,
    DateTime CreatedAtUtc
);

public record CreateNoticeTemplateRequestDto(
    string Title,
    NoticeCategory Category,
    string SubjectTemplate,
    string BodyTemplate,
    string? WhatsAppTemplate,
    SupportedLanguage Language
);

public record UpdateNoticeTemplateRequestDto(
    string Title,
    NoticeCategory Category,
    string SubjectTemplate,
    string BodyTemplate,
    string? WhatsAppTemplate,
    SupportedLanguage Language
);

public interface ITemplateService
{
    Task<List<NoticeTemplateDto>> GetTemplatesAsync(Guid organisationId, NoticeCategory? category = null, CancellationToken ct = default);
    Task<NoticeTemplateDto?> GetTemplateByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default);
    Task<NoticeTemplateDto> CreateCustomTemplateAsync(Guid organisationId, CreateNoticeTemplateRequestDto request, CancellationToken ct = default);
    Task<NoticeTemplateDto?> UpdateCustomTemplateAsync(Guid organisationId, Guid id, UpdateNoticeTemplateRequestDto request, CancellationToken ct = default);
    Task<NoticeTemplateDto?> DuplicateTemplateAsync(Guid organisationId, Guid id, CancellationToken ct = default);
    Task<bool> ArchiveTemplateAsync(Guid organisationId, Guid id, CancellationToken ct = default);
}
