using Previa.Domain.Common;
using Previa.Domain.Enums;

namespace Previa.Domain.Entities;

public class ClassRoom : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AcademicYear { get; set; } = "2026-2027";
    public string? RoomNumber { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}

public class Student : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid ClassRoomId { get; set; }
    public ClassRoom ClassRoom { get; set; } = null!;

    public string RollNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();

    public string GuardianName { get; set; } = string.Empty;
    public string GuardianPhone { get; set; } = string.Empty;
    public string? GuardianEmail { get; set; }
    
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public DateOnly AdmissionDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public bool IsActive { get; set; } = true;

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    public ICollection<FeeRecord> FeeRecords { get; set; } = new List<FeeRecord>();
}

public class AttendanceRecord : BaseEntity, ITenantEntity
{
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid ClassRoomId { get; set; }
    public ClassRoom ClassRoom { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateOnly Date { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Remarks { get; set; }

    public Guid RecordedByUserId { get; set; }
    public DateTime RecordedAtUtc { get; set; } = DateTime.UtcNow;
}
