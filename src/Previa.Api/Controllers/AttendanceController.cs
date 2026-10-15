using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Previa.Application.Features.Attendance;

namespace Previa.Api.Controllers;

[Authorize]
public class AttendanceController : BaseApiController
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet("classes")]
    public async Task<ActionResult<List<ClassRoomDto>>> GetClasses(CancellationToken ct)
    {
        var classes = await _attendanceService.GetClassesAsync(CurrentOrganisationId, ct);
        return Ok(classes);
    }

    [HttpPost("classes")]
    public async Task<ActionResult<ClassRoomDto>> CreateClass([FromBody] CreateClassRoomRequestDto request, CancellationToken ct)
    {
        var created = await _attendanceService.CreateClassAsync(CurrentOrganisationId, request, ct);
        return Ok(created);
    }

    [HttpGet("students")]
    public async Task<ActionResult<List<StudentDto>>> GetStudents([FromQuery] Guid? classRoomId, CancellationToken ct)
    {
        var students = await _attendanceService.GetStudentsAsync(CurrentOrganisationId, classRoomId, ct);
        return Ok(students);
    }

    [HttpPost("students")]
    public async Task<ActionResult<StudentDto>> CreateStudent([FromBody] CreateStudentRequestDto request, CancellationToken ct)
    {
        var student = await _attendanceService.CreateStudentAsync(CurrentOrganisationId, request, ct);
        return Ok(student);
    }

    [HttpGet("records")]
    public async Task<ActionResult<List<AttendanceRecordDto>>> GetAttendanceRecords(
        [FromQuery] Guid classRoomId, 
        [FromQuery] string? date, 
        CancellationToken ct)
    {
        var targetDate = string.IsNullOrWhiteSpace(date)
            ? DateOnly.FromDateTime(DateTime.UtcNow)
            : DateOnly.Parse(date);

        var records = await _attendanceService.GetAttendanceForClassAndDateAsync(CurrentOrganisationId, classRoomId, targetDate, ct);
        return Ok(records);
    }

    [HttpPost("record")]
    public async Task<IActionResult> RecordAttendance([FromBody] RecordAttendanceRequestDto request, CancellationToken ct)
    {
        await _attendanceService.RecordAttendanceAsync(CurrentOrganisationId, CurrentUserId, request, ct);
        return Ok(new { message = "Attendance recorded successfully." });
    }

    [HttpGet("summary")]
    public async Task<ActionResult<AttendanceSummaryDto>> GetSummary([FromQuery] string? date, CancellationToken ct)
    {
        DateOnly? targetDate = string.IsNullOrWhiteSpace(date) ? null : DateOnly.Parse(date);
        var summary = await _attendanceService.GetAttendanceSummaryAsync(CurrentOrganisationId, targetDate, ct);
        return Ok(summary);
    }

    [HttpGet("export-csv")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] Guid? classRoomId,
        [FromQuery] string startDate,
        [FromQuery] string endDate,
        CancellationToken ct)
    {
        var start = DateOnly.Parse(startDate);
        var end = DateOnly.Parse(endDate);

        var fileBytes = await _attendanceService.ExportAttendanceCsvAsync(CurrentOrganisationId, classRoomId, start, end, ct);
        var fileName = $"Attendance_{start:yyyyMMdd}_{end:yyyyMMdd}.csv";

        return File(fileBytes, "text/csv", fileName);
    }
}
