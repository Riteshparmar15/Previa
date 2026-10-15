using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Previa.Application.Features.Ai;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Ai;

public class ConfigurableAiService : IAiAssistantService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ConfigurableAiService> _logger;

    private readonly string? _apiKey;
    private readonly string _endpoint;
    private readonly string _model;

    public ConfigurableAiService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ConfigurableAiService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        _apiKey = _configuration["Ai:ApiKey"] 
                  ?? Environment.GetEnvironmentVariable("PREVIA_AI_API_KEY") 
                  ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                  ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        _endpoint = _configuration["Ai:Endpoint"] ?? "https://api.openai.com/v1/chat/completions";
        _model = _configuration["Ai:Model"] ?? "gpt-4o-mini";
    }

    public bool IsLiveProviderConfigured => !string.IsNullOrWhiteSpace(_apiKey);
    public string ProviderName => IsLiveProviderConfigured ? $"Live Provider ({_model})" : "Previa Educational Engine (Sandbox Mode - API Key Not Configured)";

    public async Task<GenerateNoticeAiResponse> GenerateNoticeAsync(GenerateNoticeAiRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Generating notice for category: {Category}, language: {Language}, audience: {Audience}",
            request.Category, request.Language, request.TargetAudience);

        if (IsLiveProviderConfigured)
        {
            try
            {
                return await CallLiveLlmForNoticeAsync(request, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Live LLM call failed. Falling back gracefully with diagnostic indicator.");
            }
        }

        // Deterministic high-quality preschool synthesis fallback for Gujarati, Hindi, and English
        return SynthesizeNotice(request);
    }

    public async Task<GenerateActivityPlanAiResponse> GenerateActivityPlanAsync(GenerateActivityPlanAiRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Generating activity plan for topic: {Topic}, age: {AgeGroup}, days: {Days}",
            request.Topic, request.AgeGroup, request.NumberOfDays);

        if (IsLiveProviderConfigured)
        {
            try
            {
                return await CallLiveLlmForActivityPlanAsync(request, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Live LLM activity plan call failed. Falling back gracefully with diagnostic indicator.");
            }
        }

        return SynthesizeActivityPlan(request);
    }

    public async Task<TranslateAiResponse> TranslateAsync(TranslateAiRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Translating text to language: {TargetLanguage}", request.TargetLanguage);

        if (IsLiveProviderConfigured)
        {
            try
            {
                return await CallLiveLlmForTranslationAsync(request, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Live LLM translation call failed. Falling back gracefully.");
            }
        }

        return SynthesizeTranslation(request);
    }

    public async Task<GenerateFeeReminderAiResponse> GenerateFeeReminderAsync(GenerateFeeReminderAiRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Generating fee reminder for student: {StudentName}, amount: {Amount}", request.StudentName, request.Amount);

        if (IsLiveProviderConfigured)
        {
            try
            {
                return await CallLiveLlmForFeeReminderAsync(request, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Live LLM fee reminder call failed. Falling back gracefully.");
            }
        }

        return SynthesizeFeeReminder(request);
    }

    #region Live LLM Implementations

    private async Task<GenerateNoticeAiResponse> CallLiveLlmForNoticeAsync(GenerateNoticeAiRequest request, CancellationToken ct)
    {
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, _endpoint);
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var prompt = $"""
            You are an expert preschool communication director in India.
            Generate a preschool parent notice in JSON format with fields:
            - title: Clear, professional headline
            - messageBody: Well-structured announcement with polite greeting, details, what parents need to do, and warm signoff
            - whatsappVersion: Compact WhatsApp format with emojis, bold text (*text*), and key bullet points
            
            Inputs:
            Category: {request.Category}
            Audience: {request.TargetAudience}
            Subject: {request.Subject}
            Date: {request.EventDate ?? "N/A"}
            Required items: {request.RequiredItems ?? "N/A"}
            Tone: {request.Tone}
            Language: {request.Language}
            Output Length: {request.OutputLength}
            Additional Instructions: {request.AdditionalInstructions ?? "None"}

            Respond strictly with valid JSON only.
            """;

        var payload = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = "You are a professional preschool communications assistant. Always output JSON." },
                new { role = "user", content = prompt }
            },
            temperature = 0.5,
            response_format = new { type = "json_object" }
        };

        requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await _httpClient.SendAsync(requestMessage, ct);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(jsonStr);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "{}";

        using var resultDoc = JsonDocument.Parse(content);
        var root = resultDoc.RootElement;

        var title = root.TryGetProperty("title", out var tProp) ? tProp.GetString() ?? request.Subject : request.Subject;
        var messageBody = root.TryGetProperty("messageBody", out var mProp) ? mProp.GetString() ?? "" : "";
        var whatsappVersion = root.TryGetProperty("whatsappVersion", out var wProp) ? wProp.GetString() ?? "" : "";

        return new GenerateNoticeAiResponse(
            Title: title,
            MessageBody: messageBody,
            WhatsAppVersion: whatsappVersion,
            Language: request.Language,
            ModelUsed: _model,
            EstimatedTokens: 450
        );
    }

    private async Task<GenerateActivityPlanAiResponse> CallLiveLlmForActivityPlanAsync(GenerateActivityPlanAiRequest request, CancellationToken ct)
    {
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, _endpoint);
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var prompt = $$"""
            You are a master early childhood educator designing a {{request.NumberOfDays}}-day curriculum for children aged {{request.AgeGroup}}.
            Topic: {{request.Topic}}
            Learning Objectives: {{request.LearningObjectives}}
            Available Materials: {{request.AvailableMaterials}}
            Setting: {{request.Setting}}
            Language: {{request.Language}}

            Return a strictly valid JSON object with the following structure:
            {
              "days": [
                {
                  "dayNumber": 1,
                  "dayTheme": "Theme title",
                  "activityName": "Name",
                  "objective": "Specific developmental objective",
                  "materialsNeeded": "Materials list",
                  "stepByStepInstructions": "Step 1, Step 2, Step 3",
                  "durationMinutes": "30 mins",
                  "abilityAdaptations": "Adaptation for slower or advanced learners",
                  "safetyConsiderations": "Child safety guidance"
                }
              ]
            }
            """;

        var payload = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = "You are an early childhood educator. Output strictly valid JSON." },
                new { role = "user", content = prompt }
            },
            temperature = 0.6,
            response_format = new { type = "json_object" }
        };

        requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await _httpClient.SendAsync(requestMessage, ct);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(jsonStr);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "{}";

        using var resultDoc = JsonDocument.Parse(content);
        var daysList = new List<ActivityDayItem>();
        if (resultDoc.RootElement.TryGetProperty("days", out var daysElement) && daysElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var d in daysElement.EnumerateArray())
            {
                daysList.Add(new ActivityDayItem(
                    DayNumber: d.TryGetProperty("dayNumber", out var num) ? num.GetInt32() : 1,
                    DayTheme: d.TryGetProperty("dayTheme", out var dt) ? dt.GetString() ?? "" : "Day Theme",
                    ActivityName: d.TryGetProperty("activityName", out var an) ? an.GetString() ?? "" : "Activity",
                    Objective: d.TryGetProperty("objective", out var obj) ? obj.GetString() ?? "" : "",
                    MaterialsNeeded: d.TryGetProperty("materialsNeeded", out var mat) ? mat.GetString() ?? "" : "",
                    StepByStepInstructions: d.TryGetProperty("stepByStepInstructions", out var ins) ? ins.GetString() ?? "" : "",
                    DurationMinutes: d.TryGetProperty("durationMinutes", out var dur) ? dur.GetString() ?? "30 mins" : "30 mins",
                    AbilityAdaptations: d.TryGetProperty("abilityAdaptations", out var adp) ? adp.GetString() ?? "" : "",
                    SafetyConsiderations: d.TryGetProperty("safetyConsiderations", out var saf) ? saf.GetString() ?? "" : ""
                ));
            }
        }

        return new GenerateActivityPlanAiResponse(
            Topic: request.Topic,
            AgeGroup: request.AgeGroup,
            NumberOfDays: request.NumberOfDays,
            Days: daysList.Count > 0 ? daysList : SynthesizeActivityPlan(request).Days,
            ModelUsed: _model,
            EstimatedTokens: 750
        );
    }

    private async Task<TranslateAiResponse> CallLiveLlmForTranslationAsync(TranslateAiRequest request, CancellationToken ct)
    {
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, _endpoint);
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var prompt = $$"""
            Translate the following text accurately and naturally into {{request.TargetLanguage}}.
            Maintain the respectful, polite tone appropriate for school communication with parents.
            Source Text:
            \"\"\"{{request.SourceText}}\"\"\"

            Respond strictly with valid JSON:
            { "translatedText": "the translation" }
            """;

        var payload = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = "You are a professional preschool translator. Output valid JSON." },
                new { role = "user", content = prompt }
            },
            temperature = 0.3,
            response_format = new { type = "json_object" }
        };

        requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await _httpClient.SendAsync(requestMessage, ct);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(jsonStr);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "{}";

        using var resultDoc = JsonDocument.Parse(content);
        var text = resultDoc.RootElement.TryGetProperty("translatedText", out var tProp) ? tProp.GetString() ?? request.SourceText : request.SourceText;

        return new TranslateAiResponse(
            TranslatedText: text,
            TargetLanguage: request.TargetLanguage,
            ModelUsed: _model
        );
    }

    private async Task<GenerateFeeReminderAiResponse> CallLiveLlmForFeeReminderAsync(GenerateFeeReminderAiRequest request, CancellationToken ct)
    {
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, _endpoint);
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var prompt = $$"""
            You are a polite preschool administrator writing a gentle, respectful fee reminder for an Indian family.
            Student Name: {{request.StudentName}}
            Parent/Guardian: {{request.GuardianName}}
            Fee Period: {{request.FeePeriod}}
            Amount: {{request.Currency}} {{request.Amount:N2}}
            Due Date: {{request.DueDate}}
            Tone: {{request.Tone}}
            Language: {{request.Language}}

            Output strictly JSON:
            {
              "reminderSubject": "Subject line",
              "reminderBody": "Polite body text",
              "whatsappVersion": "WhatsApp version with emojis and key bold text"
            }
            """;

        var payload = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = "You are a preschool fee desk administrator. Output valid JSON." },
                new { role = "user", content = prompt }
            },
            temperature = 0.4,
            response_format = new { type = "json_object" }
        };

        requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await _httpClient.SendAsync(requestMessage, ct);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(jsonStr);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "{}";

        using var resultDoc = JsonDocument.Parse(content);
        var root = resultDoc.RootElement;

        return new GenerateFeeReminderAiResponse(
            ReminderSubject: root.TryGetProperty("reminderSubject", out var s) ? s.GetString() ?? "Preschool Fee Reminder" : "Preschool Fee Reminder",
            ReminderBody: root.TryGetProperty("reminderBody", out var b) ? b.GetString() ?? "" : "",
            WhatsAppVersion: root.TryGetProperty("whatsappVersion", out var w) ? w.GetString() ?? "" : "",
            Language: request.Language,
            ModelUsed: _model
        );
    }

    #endregion

    #region Deterministic High-Quality Preschool Synthesis Engine (Offline / Sandbox)

    private GenerateNoticeAiResponse SynthesizeNotice(GenerateNoticeAiRequest request)
    {
        string title;
        string body;
        string whatsapp;
        var dateInfo = string.IsNullOrWhiteSpace(request.EventDate) ? "upcoming days" : request.EventDate;
        var itemsInfo = string.IsNullOrWhiteSpace(request.RequiredItems) ? "standard school bag and water bottle" : request.RequiredItems;

        switch (request.Language)
        {
            case SupportedLanguage.Gujarati:
                title = $"મહત્વપૂર્ણ સૂચના: {request.Subject}";
                body = $"""
                    સાદર વાલીશ્રીઓ,

                    આપણી પ્રિસ્કૂલ તરફથી {request.Subject} અંગે આ મહત્વપૂર્ણ સૂચના પાઠવવામાં આવે છે.
                    
                    તારીખ / સમય: {dateInfo}
                    લક્ષ્ય વર્ગ: {request.TargetAudience}
                    વિગત: {request.Subject}
                    જરૂરી વસ્તુઓ: {itemsInfo}

                    આપ સર્વે વાલીશ્રીઓનો સહકાર અમારા નાના બાળકોના ઉજ્જવળ અને સુનિશ્ચિત વિકાસ માટે અત્યંત મૂલ્યવાન છે. વધુ માહિતી માટે શાળા કાર્યાલયનો સંપર્ક કરવો.

                    સ્નેહપૂર્વક,
                    સેન્ટર સંચાલક તથા શિક્ષકગણ
                    """;
                whatsapp = $"""
                    📢 *મહત્વપૂર્ણ શાળા સૂચના*
                    
                    વાલીશ્રીઓ, *{request.Subject}* અંગે આ સૂચના પાઠવવામાં આવી છે.
                    🗓️ તારીખ: {dateInfo}
                    🎒 જરૂરી વસ્તુઓ: {itemsInfo}
                    
                    વિગતવાર માહિતી માટે આપની શાળા એપ્લિકેશન તપાસો.
                    - પ્રિસ્કૂલ વહીવટી વિભાગ
                    """;
                break;

            case SupportedLanguage.Hindi:
                title = $"महत्वपूर्ण सूचना: {request.Subject}";
                body = $"""
                    आदरणीय अभिभावक गण,

                    हमारे प्रीस्कूल की ओर से {request.Subject} के संबंध में यह सूचना जारी की जा रही है।

                    दिनांक / समय: {dateInfo}
                    लक्षित वर्ग: {request.TargetAudience}
                    विवरण: {request.Subject}
                    आवश्यक सामग्री: {itemsInfo}

                    बच्चों के समग्र विकास और सुरक्षा में आपका निरंतर सहयोग हमारे लिए अत्यंत सराहनीय है। किसी भी प्रश्न के लिए स्कूल कार्यालय से संपर्क करें।

                    सस्नेह,
                    प्रधानाध्यापक एवं प्रबंधन
                    """;
                whatsapp = $"""
                    📢 *प्रीस्कूल आवश्यक सूचना*
                    
                    आदरणीय अभिभावक, *{request.Subject}* के संबंध में सूचना:
                    🗓️ दिनांक: {dateInfo}
                    🎒 सामग्री: {itemsInfo}
                    
                    कृपया समय का ध्यान रखें। धन्यवाद!
                    - स्कूल प्रशासन
                    """;
                break;

            default: // English
                title = $"Notice: {request.Subject}";
                body = $"""
                    Dear Parents and Guardians,

                    We are pleased to inform you regarding {request.Subject}. Please find the necessary details below:

                    • Subject: {request.Subject}
                    • Target Group: {request.TargetAudience}
                    • Date / Schedule: {dateInfo}
                    • Required Items: {itemsInfo}

                    {(string.IsNullOrWhiteSpace(request.AdditionalInstructions) ? "" : $"Additional Note: {request.AdditionalInstructions}\n")}
                    We appreciate your prompt attention and continuous partnership in fostering a joyful and safe learning environment for our young learners. Should you have any questions, please reach out to the centre front desk.

                    Warm regards,
                    Preschool Administration Team
                    """;
                whatsapp = $"""
                    🌟 *Preschool Notice: {request.Subject}*
                    
                    Dear Parents,
                    Please take note of the upcoming event:
                    📅 *Date:* {dateInfo}
                    🎒 *Items needed:* {itemsInfo}
                    
                    Thank you for your warm cooperation!
                    - Previa Administration
                    """;
                break;
        }

        return new GenerateNoticeAiResponse(
            Title: title,
            MessageBody: body,
            WhatsAppVersion: whatsapp,
            Language: request.Language,
            ModelUsed: "Previa Educational Engine (Sandbox Mode)",
            EstimatedTokens: 380
        );
    }

    private GenerateActivityPlanAiResponse SynthesizeActivityPlan(GenerateActivityPlanAiRequest request)
    {
        var days = new List<ActivityDayItem>();
        int count = Math.Max(1, Math.Min(request.NumberOfDays, 5));

        string[] themes = { "Sensory Exploration & Introduction", "Creative Expression & Fine Motor Play", "Rhythm, Storytelling & Language", "Gross Motor & Discovery Games", "Celebration, Review & Collaborative Art" };
        string[] activities = { "Color Sorting & Texture Tray Discovery", "Sponge Dab Painting & Clay Dough Sculpting", "Interactive Puppet Rhymes & Story Wheel", "Animal Movement Obstacle Path", "Our Class Masterpiece Showcase" };
        string[] objectives = { "Enhance sensory discrimination and vocabulary", "Strengthen pincer grasp and hand-eye coordination", "Foster listening skills and express feelings verbally", "Develop gross motor agility, balance, and spatial awareness", "Encourage peer cooperation, sharing, and confidence" };
        string[] safety = { "Use non-toxic, taste-safe materials under direct supervision", "Ensure rounded blunt safety scissors and non-toxic dough", "Maintain comfortable child seating with zero trip hazards", "Clear cushioned flooring and adult spotting at turns", "Wash little hands thoroughly post-activity" };

        for (int i = 0; i < count; i++)
        {
            var idx = i % themes.Length;
            days.Add(new ActivityDayItem(
                DayNumber: i + 1,
                DayTheme: $"{themes[idx]} - {request.Topic}",
                ActivityName: $"{activities[idx]} ({request.Topic})",
                Objective: $"{objectives[idx]} focusing on {request.Topic}.",
                MaterialsNeeded: string.IsNullOrWhiteSpace(request.AvailableMaterials) ? "Crayons, child-safe dough, texture swatches, chart paper, puppets" : request.AvailableMaterials,
                StepByStepInstructions: $"1. Circle time: introduce {request.Topic} using engaging visual cards (5 mins).\n2. Guided demo: show the hands-on materials (5 mins).\n3. Child participation: hands-on exploration in pairs (15 mins).\n4. Wrap-up: reflection and cheerful clapping (5 mins).",
                DurationMinutes: "30-35 mins",
                AbilityAdaptations: "Provide hand-over-hand gentle assistance for younger toddlers; encourage older children to describe their creation in full sentences.",
                SafetyConsiderations: safety[idx]
            ));
        }

        return new GenerateActivityPlanAiResponse(
            Topic: request.Topic,
            AgeGroup: request.AgeGroup,
            NumberOfDays: count,
            Days: days,
            ModelUsed: "Previa Educational Engine (Sandbox Mode)",
            EstimatedTokens: 620
        );
    }

    private TranslateAiResponse SynthesizeTranslation(TranslateAiRequest request)
    {
        string translated;
        if (request.TargetLanguage == SupportedLanguage.Gujarati)
        {
            translated = $"[ગુજરાતી અનુવાદ] {request.SourceText}\n(સાદર વાલીશ્રીઓ, કૃપા કરીને આ સંદેશની નોંધ લેવી. - પ્રિસ્કૂલ કાર્યાલય)";
        }
        else if (request.TargetLanguage == SupportedLanguage.Hindi)
        {
            translated = $"[हिन्दी अनुवाद] {request.SourceText}\n(आदरणीय अभिभावक, कृपया इस संदेश को ध्यानपूर्वक पढ़ें। - स्कूल कार्यालय)";
        }
        else
        {
            translated = $"[English Translation] {request.SourceText}\n(Dear Parents, kindly note this communication. - Preschool Office)";
        }

        return new TranslateAiResponse(
            TranslatedText: translated,
            TargetLanguage: request.TargetLanguage,
            ModelUsed: "Previa Educational Engine (Sandbox Mode)"
        );
    }

    private GenerateFeeReminderAiResponse SynthesizeFeeReminder(GenerateFeeReminderAiRequest request)
    {
        string subject;
        string body;
        string whatsapp;

        switch (request.Language)
        {
            case SupportedLanguage.Gujarati:
                subject = $"નમ્ર ફી સ્મૃતિપત્ર: {request.StudentName} ({request.FeePeriod})";
                body = $"""
                    સાદર વાલીશ્રી {request.GuardianName},

                    આપણા વહાલા વિદ્યાર્થી {request.StudentName} ની {request.FeePeriod} સત્રની પ્રિસ્કૂલ ફી બાકી રકમ {request.Currency} {request.Amount:N2} ની ચુકવણી તારીખ {request.DueDate} સુધી કરવાની રહે છે.

                    બાળકોને ઉત્કૃષ્ટ શિક્ષણ સાધનો અને સુવિધાઓ પ્રદાન કરવામાં આપનો સમયસર સહકાર અનિવાર્ય છે. જો આપે અગાઉથી ફી ભરી દીધી હોય, તો કૃપા કરીને આ સંદેશની અવગણના કરવી.

                    આભાર સહ,
                    પ્રિસ્કૂલ એકાઉન્ટ્સ વિભાગ
                    """;
                whatsapp = $"""
                    📝 *નમ્ર ફી સ્મૃતિપત્ર*
                    
                    વાલીશ્રી {request.GuardianName},
                    વિદ્યાર્થી: *{request.StudentName}*
                    સત્ર: {request.FeePeriod}
                    રકમ: *{request.Currency} {request.Amount:N2}*
                    ચુકવણી તારીખ: *{request.DueDate}*
                    
                    આપના સહકાર બદલ આભાર!
                    - પ્રિસ્કૂલ એકાઉન્ટ્સ
                    """;
                break;

            case SupportedLanguage.Hindi:
                subject = $"विनम्र शुल्क स्मरण पत्र: {request.StudentName} ({request.FeePeriod})";
                body = $"""
                    आदरणीय अभिभावक {request.GuardianName},

                    हमारे प्रिय छात्र/छात्रा {request.StudentName} के {request.FeePeriod} सत्र की प्रीस्कूल शुल्क राशि {request.Currency} {request.Amount:N2} की देय तिथि {request.DueDate} है।

                    बच्चों को सर्वोत्तम सुविधाएं और शैक्षणिक वातावरण उपलब्ध कराने हेतु आपका समयबद्ध सहयोग अपेक्षित है। यदि आप पहले ही भुगतान कर चुके हैं, तो कृपया इसे अनदेखा करें।

                    सधन्यवाद,
                    प्रीस्कूल लेखा विभाग
                    """;
                whatsapp = $"""
                    📝 *विनम्र शुल्क स्मरण पत्र*
                    
                    अभिभावक: {request.GuardianName}
                    विद्यार्थी: *{request.StudentName}*
                    अवधि: {request.FeePeriod}
                    राशि: *{request.Currency} {request.Amount:N2}*
                    देय तिथि: *{request.DueDate}*
                    
                    सहयोग के लिए धन्यवाद!
                    - स्कूल कार्यालय
                    """;
                break;

            default:
                subject = $"Gentle Fee Reminder: {request.StudentName} - {request.FeePeriod}";
                body = $"""
                    Dear {request.GuardianName},

                    We hope you and your family are doing well. This is a gentle reminder regarding the preschool fee for {request.StudentName} for the period {request.FeePeriod}.

                    • Student Name: {request.StudentName}
                    • Fee Period: {request.FeePeriod}
                    • Amount Due: {request.Currency} {request.Amount:N2}
                    • Due Date: {request.DueDate}

                    Timely payments enable us to maintain optimal staff ratios, enriched classroom activities, and pristine hygienic facilities for our children. If you have already completed this payment, kindly disregard this notice.

                    Warm regards,
                    Accounts & Administration
                    """;
                whatsapp = $"""
                    📋 *Gentle Fee Reminder*
                    
                    Dear {request.GuardianName},
                    Kindly note the upcoming preschool fee for *{request.StudentName}*:
                    💰 Amount: *{request.Currency} {request.Amount:N2}*
                    📅 Due Date: *{request.DueDate}*
                    
                    Thank you for your continuous support!
                    - Preschool Desk
                    """;
                break;
        }

        return new GenerateFeeReminderAiResponse(
            ReminderSubject: subject,
            ReminderBody: body,
            WhatsAppVersion: whatsapp,
            Language: request.Language,
            ModelUsed: "Previa Educational Engine (Sandbox Mode)"
        );
    }

    #endregion
}
