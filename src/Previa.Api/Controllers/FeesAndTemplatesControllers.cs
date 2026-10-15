using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Previa.Application.Features.Ai;
using Previa.Application.Features.Finance;
using Previa.Application.Features.Templates;
using Previa.Domain.Enums;

namespace Previa.Api.Controllers;

[Authorize]
public class FeesController : BaseApiController
{
    private readonly IFeeService _feeService;
    private readonly IAiAssistantService _aiService;

    public FeesController(IFeeService feeService, IAiAssistantService aiService)
    {
        _feeService = feeService;
        _aiService = aiService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FeeRecordDto>>> GetFees([FromQuery] FeeStatus? status, CancellationToken ct)
    {
        var records = await _feeService.GetFeeRecordsAsync(CurrentOrganisationId, status, ct);
        return Ok(records);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FeeRecordDto>> GetFeeById(Guid id, CancellationToken ct)
    {
        var record = await _feeService.GetFeeRecordByIdAsync(CurrentOrganisationId, id, ct);
        if (record == null) return NotFound(new { message = "Fee record not found." });
        return Ok(record);
    }

    [HttpPost]
    public async Task<ActionResult<FeeRecordDto>> CreateFee([FromBody] CreateFeeRecordRequestDto request, CancellationToken ct)
    {
        var record = await _feeService.CreateFeeRecordAsync(CurrentOrganisationId, request, ct);
        return CreatedAtAction(nameof(GetFeeById), new { id = record.Id }, record);
    }

    [HttpPut("{id:guid}/payment")]
    public async Task<ActionResult<FeeRecordDto>> UpdatePayment(Guid id, [FromBody] UpdateFeePaymentRequestDto request, CancellationToken ct)
    {
        var updated = await _feeService.UpdatePaymentAsync(CurrentOrganisationId, id, request, ct);
        if (updated == null) return NotFound(new { message = "Fee record not found." });
        return Ok(updated);
    }

    [HttpPost("ai-reminder")]
    public async Task<ActionResult<GenerateFeeReminderAiResponse>> GenerateAiReminder([FromBody] GenerateFeeReminderAiRequest request, CancellationToken ct)
    {
        var reminder = await _aiService.GenerateFeeReminderAsync(request, ct);
        return Ok(reminder);
    }

    [HttpPost("save-reminder")]
    public async Task<ActionResult<FeeReminderDraftDto>> SaveReminderDraft([FromBody] SaveFeeReminderDraftRequestDto request, CancellationToken ct)
    {
        var draft = await _feeService.SaveReminderDraftAsync(CurrentOrganisationId, CurrentUserId, request, ct);
        return Ok(draft);
    }

    [HttpGet("{id:guid}/reminders")]
    public async Task<ActionResult<List<FeeReminderDraftDto>>> GetReminderDrafts(Guid id, CancellationToken ct)
    {
        var drafts = await _feeService.GetReminderDraftsAsync(CurrentOrganisationId, id, ct);
        return Ok(drafts);
    }
}

[Authorize]
public class TemplatesController : BaseApiController
{
    private readonly ITemplateService _templateService;

    public TemplatesController(ITemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet]
    public async Task<ActionResult<List<NoticeTemplateDto>>> GetTemplates([FromQuery] NoticeCategory? category, CancellationToken ct)
    {
        var templates = await _templateService.GetTemplatesAsync(CurrentOrganisationId, category, ct);
        return Ok(templates);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoticeTemplateDto>> GetTemplateById(Guid id, CancellationToken ct)
    {
        var template = await _templateService.GetTemplateByIdAsync(CurrentOrganisationId, id, ct);
        if (template == null) return NotFound(new { message = "Template not found." });
        return Ok(template);
    }

    [HttpPost]
    public async Task<ActionResult<NoticeTemplateDto>> CreateTemplate([FromBody] CreateNoticeTemplateRequestDto request, CancellationToken ct)
    {
        var created = await _templateService.CreateCustomTemplateAsync(CurrentOrganisationId, request, ct);
        return CreatedAtAction(nameof(GetTemplateById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoticeTemplateDto>> UpdateTemplate(Guid id, [FromBody] UpdateNoticeTemplateRequestDto request, CancellationToken ct)
    {
        var updated = await _templateService.UpdateCustomTemplateAsync(CurrentOrganisationId, id, request, ct);
        if (updated == null) return NotFound(new { message = "Template not found or not editable." });
        return Ok(updated);
    }

    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<NoticeTemplateDto>> DuplicateTemplate(Guid id, CancellationToken ct)
    {
        var duplicated = await _templateService.DuplicateTemplateAsync(CurrentOrganisationId, id, ct);
        if (duplicated == null) return NotFound(new { message = "Template not found." });
        return Ok(duplicated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> ArchiveTemplate(Guid id, CancellationToken ct)
    {
        var archived = await _templateService.ArchiveTemplateAsync(CurrentOrganisationId, id, ct);
        if (!archived) return NotFound(new { message = "Template not found or cannot be archived." });
        return NoContent();
    }
}

[Authorize]
public class TranslationsController : BaseApiController
{
    private readonly IAiAssistantService _aiService;

    public TranslationsController(IAiAssistantService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("ai-translate")]
    public async Task<ActionResult<TranslateAiResponse>> Translate([FromBody] TranslateAiRequest request, CancellationToken ct)
    {
        var result = await _aiService.TranslateAsync(request, ct);
        return Ok(result);
    }
}
