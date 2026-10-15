using Previa.Domain.Enums;

namespace Previa.Application.Features.Attendance;

public record ClassRoomDto(
    Guid Id,
    Guid OrganisationId,
    string Name,
    string? Description,
    string AcademicYear,
    string? RoomNumber,
    int StudentCount,
    bool IsActive
);

public record CreateClassRoomRequestDto(
    string Name,
    string? Description,
    string AcademicYear,
    string? RoomNumber
);

public record StudentDto(
    Guid Id,
    Guid OrganisationId,
    Guid ClassRoomId,
    string ClassRoomName,
    string RollNumber,
    string FirstName,
    string LastName,
    string FullName,
    string GuardianName,
    string GuardianPhone,
    string? GuardianEmail,
    DateOnly AdmissionDate,
    bool IsActive
);

public record CreateStudentRequestDto(
    Guid ClassRoomId,
    string RollNumber,
    string FirstName,
    string LastName,
    string GuardianName,
    string GuardianPhone,
    string? GuardianEmail,
    DateOnly AdmissionDate
);

public record AttendanceItemDto(
    Guid StudentId,
    string StudentName,
    string RollNumber,
    AttendanceStatus Status,
    string? Remarks
);

public record RecordAttendanceRequestDto(
    Guid ClassRoomId,
    DateOnly Date,
    List<AttendanceItemDto> Attendances
);

public record AttendanceRecordDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    string RollNumber,
    Guid ClassRoomId,
    string ClassRoomName,
    DateOnly Date,
    AttendanceStatus Status,
    string? Remarks,
    DateTime RecordedAtUtc
);

public record AttendanceSummaryDto(
    DateOnly Date,
    int TotalStudents,
    int PresentCount,
    int AbsentCount,
    int LateCount,
    int ExcusedCount,
    double AttendancePercentage
);

public interface IAttendanceService
{
    // Classes
    Task<List<ClassRoomDto>> GetClassesAsync(Guid organisationId, CancellationToken ct = default);
    Task<ClassRoomDto> CreateClassAsync(Guid organisationId, CreateClassRoomRequestDto request, CancellationToken ct = default);
    
    // Students
    Task<List<StudentDto>> GetStudentsAsync(Guid organisationId, Guid? classRoomId = null, CancellationToken ct = default);
    Task<StudentDto> CreateStudentAsync(Guid organisationId, CreateStudentRequestDto request, CancellationToken ct = default);

    // Attendance
    Task<List<AttendanceRecordDto>> GetAttendanceForClassAndDateAsync(Guid organisationId, Guid classRoomId, DateOnly date, CancellationToken ct = default);
    Task<bool> RecordAttendanceAsync(Guid organisationId, Guid userId, RecordAttendanceRequestDto request, CancellationToken ct = default);
    Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(Guid organisationId, DateOnly? date = null, CancellationToken ct = default);
    Task<byte[]> ExportAttendanceCsvAsync(Guid organisationId, Guid? classRoomId, DateOnly startDate, DateOnly endDate, CancellationToken ct = default);
}
