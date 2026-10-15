using System.Text;
using Microsoft.EntityFrameworkCore;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.Attendance;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public AttendanceService(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<List<ClassRoomDto>> GetClassesAsync(Guid organisationId, CancellationToken ct = default)
    {
        return await _context.Classes
            .Where(c => c.OrganisationId == organisationId && c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new ClassRoomDto(
                c.Id,
                c.OrganisationId,
                c.Name,
                c.Description,
                c.AcademicYear,
                c.RoomNumber,
                c.Students.Count(s => s.IsActive),
                c.IsActive
            ))
            .ToListAsync(ct);
    }

    public async Task<ClassRoomDto> CreateClassAsync(Guid organisationId, CreateClassRoomRequestDto request, CancellationToken ct = default)
    {
        var classRoom = new ClassRoom
        {
            OrganisationId = organisationId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            AcademicYear = string.IsNullOrWhiteSpace(request.AcademicYear) ? "2026-2027" : request.AcademicYear.Trim(),
            RoomNumber = request.RoomNumber?.Trim(),
            IsActive = true
        };

        await _context.Classes.AddAsync(classRoom, ct);
        await _context.SaveChangesAsync(ct);

        await _auditService.LogAsync(organisationId, null, "CreateClass", "ClassRoom", classRoom.Id.ToString(), $"Class '{classRoom.Name}' created", ct);

        return new ClassRoomDto(
            classRoom.Id,
            classRoom.OrganisationId,
            classRoom.Name,
            classRoom.Description,
            classRoom.AcademicYear,
            classRoom.RoomNumber,
            0,
            classRoom.IsActive
        );
    }

    public async Task<List<StudentDto>> GetStudentsAsync(Guid organisationId, Guid? classRoomId = null, CancellationToken ct = default)
    {
        var query = _context.Students
            .Include(s => s.ClassRoom)
            .Where(s => s.OrganisationId == organisationId && s.IsActive);

        if (classRoomId.HasValue)
            query = query.Where(s => s.ClassRoomId == classRoomId.Value);

        return await query
            .OrderBy(s => s.ClassRoom.Name)
            .ThenBy(s => s.RollNumber)
            .Select(s => new StudentDto(
                s.Id,
                s.OrganisationId,
                s.ClassRoomId,
                s.ClassRoom.Name,
                s.RollNumber,
                s.FirstName,
                s.LastName,
                s.FullName,
                s.GuardianName,
                s.GuardianPhone,
                s.GuardianEmail,
                s.AdmissionDate,
                s.IsActive
            ))
            .ToListAsync(ct);
    }

    public async Task<StudentDto> CreateStudentAsync(Guid organisationId, CreateStudentRequestDto request, CancellationToken ct = default)
    {
        var classRoom = await _context.Classes.FirstOrDefaultAsync(c => c.OrganisationId == organisationId && c.Id == request.ClassRoomId, ct);
        if (classRoom == null)
        {
            throw new InvalidOperationException("Specified class does not exist in this organisation.");
        }

        var student = new Student
        {
            OrganisationId = organisationId,
            ClassRoomId = request.ClassRoomId,
            RollNumber = request.RollNumber.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            GuardianName = request.GuardianName.Trim(),
            GuardianPhone = request.GuardianPhone.Trim(),
            GuardianEmail = request.GuardianEmail?.Trim(),
            AdmissionDate = request.AdmissionDate,
            IsActive = true
        };

        await _context.Students.AddAsync(student, ct);
        await _context.SaveChangesAsync(ct);

        await _auditService.LogAsync(organisationId, null, "CreateStudent", "Student", student.Id.ToString(), $"Enrolled student {student.FullName}", ct);

        return new StudentDto(
            student.Id,
            student.OrganisationId,
            student.ClassRoomId,
            classRoom.Name,
            student.RollNumber,
            student.FirstName,
            student.LastName,
            student.FullName,
            student.GuardianName,
            student.GuardianPhone,
            student.GuardianEmail,
            student.AdmissionDate,
            student.IsActive
        );
    }

    public async Task<List<AttendanceRecordDto>> GetAttendanceForClassAndDateAsync(Guid organisationId, Guid classRoomId, DateOnly date, CancellationToken ct = default)
    {
        return await _context.AttendanceRecords
            .Include(a => a.Student)
            .Include(a => a.ClassRoom)
            .Where(a => a.OrganisationId == organisationId && a.ClassRoomId == classRoomId && a.Date == date)
            .OrderBy(a => a.Student.RollNumber)
            .Select(a => new AttendanceRecordDto(
                a.Id,
                a.StudentId,
                a.Student.FullName,
                a.Student.RollNumber,
                a.ClassRoomId,
                a.ClassRoom.Name,
                a.Date,
                a.Status,
                a.Remarks,
                a.RecordedAtUtc
            ))
            .ToListAsync(ct);
    }

    public async Task<bool> RecordAttendanceAsync(Guid organisationId, Guid userId, RecordAttendanceRequestDto request, CancellationToken ct = default)
    {
        var existingRecords = await _context.AttendanceRecords
            .Where(a => a.OrganisationId == organisationId && a.ClassRoomId == request.ClassRoomId && a.Date == request.Date)
            .ToListAsync(ct);

        var existingMap = existingRecords.ToDictionary(r => r.StudentId);

        foreach (var item in request.Attendances)
        {
            if (existingMap.TryGetValue(item.StudentId, out var existing))
            {
                // Update existing record safely (prevents duplicates)
                existing.Status = item.Status;
                existing.Remarks = item.Remarks?.Trim();
                existing.RecordedByUserId = userId;
                existing.RecordedAtUtc = DateTime.UtcNow;
            }
            else
            {
                var record = new AttendanceRecord
                {
                    OrganisationId = organisationId,
                    ClassRoomId = request.ClassRoomId,
                    StudentId = item.StudentId,
                    Date = request.Date,
                    Status = item.Status,
                    Remarks = item.Remarks?.Trim(),
                    RecordedByUserId = userId,
                    RecordedAtUtc = DateTime.UtcNow
                };
                await _context.AttendanceRecords.AddAsync(record, ct);
            }
        }

        await _context.SaveChangesAsync(ct);
        await _auditService.LogAsync(organisationId, userId, "RecordAttendance", "Attendance", request.ClassRoomId.ToString(), $"Recorded attendance for {request.Attendances.Count} students on {request.Date}", ct);

        return true;
    }

    public async Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(Guid organisationId, DateOnly? date = null, CancellationToken ct = default)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var totalStudents = await _context.Students.CountAsync(s => s.OrganisationId == organisationId && s.IsActive, ct);

        var records = await _context.AttendanceRecords
            .Where(a => a.OrganisationId == organisationId && a.Date == targetDate)
            .ToListAsync(ct);

        var present = records.Count(r => r.Status == AttendanceStatus.Present);
        var absent = records.Count(r => r.Status == AttendanceStatus.Absent);
        var late = records.Count(r => r.Status == AttendanceStatus.Late);
        var excused = records.Count(r => r.Status == AttendanceStatus.Excused);

        double pct = (records.Count > 0) ? Math.Round((double)(present + late) / records.Count * 100.0, 1) : 0.0;

        return new AttendanceSummaryDto(
            Date: targetDate,
            TotalStudents: totalStudents,
            PresentCount: present,
            AbsentCount: absent,
            LateCount: late,
            ExcusedCount: excused,
            AttendancePercentage: pct
        );
    }

    public async Task<byte[]> ExportAttendanceCsvAsync(Guid organisationId, Guid? classRoomId, DateOnly startDate, DateOnly endDate, CancellationToken ct = default)
    {
        var query = _context.AttendanceRecords
            .Include(a => a.Student)
            .Include(a => a.ClassRoom)
            .Where(a => a.OrganisationId == organisationId && a.Date >= startDate && a.Date <= endDate);

        if (classRoomId.HasValue)
            query = query.Where(a => a.ClassRoomId == classRoomId.Value);

        var records = await query
            .OrderBy(a => a.Date)
            .ThenBy(a => a.ClassRoom.Name)
            .ThenBy(a => a.Student.RollNumber)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Date,Class,Roll Number,Student Name,Status,Remarks,Recorded At (UTC)");

        foreach (var r in records)
        {
            var cleanRemarks = (r.Remarks ?? "").Replace("\"", "\"\"");
            sb.AppendLine($"{r.Date:yyyy-MM-dd},\"{r.ClassRoom.Name}\",\"{r.Student.RollNumber}\",\"{r.Student.FullName}\",{r.Status},\"{cleanRemarks}\",{r.RecordedAtUtc:yyyy-MM-dd HH:mm:ss}");
        }

        await _auditService.LogAsync(organisationId, null, "ExportAttendanceCsv", "Attendance", null, $"Exported attendance from {startDate} to {endDate}", ct);

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
