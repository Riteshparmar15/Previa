using FluentValidation;
using Previa.Domain.Enums;

namespace Previa.Application.Features.Notices;

public record NoticeDto(
    Guid Id,
    Guid OrganisationId,
    string Title,
    string MessageBody,
    string? WhatsAppVersion,
    NoticeCategory Category,
    NoticeAudience TargetAudience,
    Guid? ClassRoomId,
    string? ClassRoomName,
    SupportedLanguage Language,
    ToneStyle Tone,
    bool IsDraft,
    DateTime CreatedAtUtc
);

public record CreateNoticeRequestDto(
    string Title,
    string MessageBody,
    string? WhatsAppVersion,
    NoticeCategory Category,
    NoticeAudience TargetAudience,
    Guid? ClassRoomId,
    SupportedLanguage Language,
    ToneStyle Tone,
    bool IsDraft,
    string? AdditionalInstructions
);

public record UpdateNoticeRequestDto(
    string Title,
    string MessageBody,
    string? WhatsAppVersion,
    NoticeCategory Category,
    NoticeAudience TargetAudience,
    Guid? ClassRoomId,
    SupportedLanguage Language,
    ToneStyle Tone,
    bool IsDraft
);

public record NoticeListFilterDto(
    NoticeCategory? Category = null,
    NoticeAudience? Audience = null,
    SupportedLanguage? Language = null,
    bool? IsDraft = null,
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 10
);

public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public class CreateNoticeValidator : AbstractValidator<CreateNoticeRequestDto>
{
    public CreateNoticeValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MessageBody).NotEmpty().MaximumLength(4000);
    }
}

public interface INoticeService
{
    Task<PagedResult<NoticeDto>> GetNoticesAsync(Guid organisationId, NoticeListFilterDto filter, CancellationToken ct = default);
    Task<NoticeDto?> GetNoticeByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default);
    Task<NoticeDto> CreateNoticeAsync(Guid organisationId, Guid userId, CreateNoticeRequestDto request, CancellationToken ct = default);
    Task<NoticeDto?> UpdateNoticeAsync(Guid organisationId, Guid id, UpdateNoticeRequestDto request, CancellationToken ct = default);
    Task<bool> DeleteNoticeAsync(Guid organisationId, Guid id, CancellationToken ct = default);
}
