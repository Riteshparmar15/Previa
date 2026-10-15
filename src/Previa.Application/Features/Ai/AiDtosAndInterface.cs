using Previa.Domain.Enums;

namespace Previa.Application.Features.Ai;

public record GenerateNoticeAiRequest(
    string Category,
    string TargetAudience,
    string Subject,
    string? EventDate,
    string? RequiredItems,
    ToneStyle Tone,
    SupportedLanguage Language,
    string OutputLength, // "Short", "Standard", "Detailed"
    string? AdditionalInstructions
);

public record GenerateNoticeAiResponse(
    string Title,
    string MessageBody,
    string WhatsAppVersion,
    SupportedLanguage Language,
    string ModelUsed,
    int EstimatedTokens
);

public record GenerateActivityPlanAiRequest(
    string AgeGroup,
    string Topic,
    int NumberOfDays,
    string LearningObjectives,
    string AvailableMaterials,
    string Setting,
    SupportedLanguage Language
);

public record ActivityDayItem(
    int DayNumber,
    string DayTheme,
    string ActivityName,
    string Objective,
    string MaterialsNeeded,
    string StepByStepInstructions,
    string DurationMinutes,
    string AbilityAdaptations,
    string SafetyConsiderations
);

public record GenerateActivityPlanAiResponse(
    string Topic,
    string AgeGroup,
    int NumberOfDays,
    List<ActivityDayItem> Days,
    string ModelUsed,
    int EstimatedTokens
);

public record TranslateAiRequest(
    string SourceText,
    SupportedLanguage TargetLanguage,
    string? Context
);

public record TranslateAiResponse(
    string TranslatedText,
    SupportedLanguage TargetLanguage,
    string ModelUsed
);

public record GenerateFeeReminderAiRequest(
    string StudentName,
    string GuardianName,
    string FeePeriod,
    decimal Amount,
    string Currency,
    string DueDate,
    ToneStyle Tone,
    SupportedLanguage Language
);

public record GenerateFeeReminderAiResponse(
    string ReminderSubject,
    string ReminderBody,
    string WhatsAppVersion,
    SupportedLanguage Language,
    string ModelUsed
);

public interface IAiAssistantService
{
    bool IsLiveProviderConfigured { get; }
    string ProviderName { get; }
    Task<GenerateNoticeAiResponse> GenerateNoticeAsync(GenerateNoticeAiRequest request, CancellationToken ct = default);
    Task<GenerateActivityPlanAiResponse> GenerateActivityPlanAsync(GenerateActivityPlanAiRequest request, CancellationToken ct = default);
    Task<TranslateAiResponse> TranslateAsync(TranslateAiRequest request, CancellationToken ct = default);
    Task<GenerateFeeReminderAiResponse> GenerateFeeReminderAsync(GenerateFeeReminderAiRequest request, CancellationToken ct = default);
}
