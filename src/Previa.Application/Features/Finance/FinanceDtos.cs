using Previa.Domain.Enums;

namespace Previa.Application.Features.Finance;

public record FeeRecordDto(
    Guid Id,
    Guid OrganisationId,
    Guid StudentId,
    string StudentName,
    string RollNumber,
    string GuardianName,
    string GuardianPhone,
    string FeePeriod,
    decimal Amount,
    decimal PaidAmount,
    decimal PendingAmount,
    string Currency,
    DateOnly DueDate,
    FeeStatus Status,
    string? Notes,
    DateTime CreatedAtUtc
);

public record CreateFeeRecordRequestDto(
    Guid StudentId,
    string FeePeriod,
    decimal Amount,
    DateOnly DueDate,
    string? Notes
);

public record UpdateFeePaymentRequestDto(
    decimal AmountPaid,
    FeeStatus Status,
    string? Notes
);

public record FeeReminderDraftDto(
    Guid Id,
    Guid FeeRecordId,
    Guid StudentId,
    string StudentName,
    string GuardianName,
    string GuardianPhone,
    string ReminderText,
    string? WhatsAppVersion,
    SupportedLanguage Language,
    ToneStyle Tone,
    DateTime CreatedAtUtc
);

public record SaveFeeReminderDraftRequestDto(
    Guid FeeRecordId,
    Guid StudentId,
    string ReminderText,
    string? WhatsAppVersion,
    SupportedLanguage Language,
    ToneStyle Tone
);

public interface IFeeService
{
    Task<List<FeeRecordDto>> GetFeeRecordsAsync(Guid organisationId, FeeStatus? status = null, CancellationToken ct = default);
    Task<FeeRecordDto?> GetFeeRecordByIdAsync(Guid organisationId, Guid id, CancellationToken ct = default);
    Task<FeeRecordDto> CreateFeeRecordAsync(Guid organisationId, CreateFeeRecordRequestDto request, CancellationToken ct = default);
    Task<FeeRecordDto?> UpdatePaymentAsync(Guid organisationId, Guid id, UpdateFeePaymentRequestDto request, CancellationToken ct = default);
    Task<FeeReminderDraftDto> SaveReminderDraftAsync(Guid organisationId, Guid userId, SaveFeeReminderDraftRequestDto request, CancellationToken ct = default);
    Task<List<FeeReminderDraftDto>> GetReminderDraftsAsync(Guid organisationId, Guid feeRecordId, CancellationToken ct = default);
}
