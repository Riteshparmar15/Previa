using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.Ai;
using Previa.Application.Features.Attendance;
using Previa.Application.Features.Auth;
using Previa.Application.Features.Notices;
using Previa.Application.Features.Subscriptions;
using Previa.Domain.Entities;
using Previa.Domain.Enums;
using Previa.Infrastructure.Ai;
using Previa.Infrastructure.Persistence;
using Previa.Infrastructure.Security;
using Previa.Infrastructure.Services;
using Xunit;

namespace Previa.Tests;

public class PreviaTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var connection = new Microsoft.Data.Sqlite.SqliteConnection("DataSource=:memory:");
        connection.Open();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task Register_CreatesUser_And_AssignsOwner_WithStarterPlan()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var hasher = new PasswordHasher();
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", "Test_Secret_Key_At_Least_32_Characters_Long_For_Jwt_Security!"},
            {"Jwt:Issuer", "PreviaApi"},
            {"Jwt:Audience", "PreviaClient"}
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var jwt = new JwtTokenService(config);
        var audit = new AuditService(context);
        var authService = new AuthService(context, hasher, jwt, audit);

        var request = new RegisterRequestDto(
            Email: "owner@littleangels.in",
            Password: "SecurePassword123!",
            FullName: "Sunita Patel",
            PhoneNumber: "+919876543210",
            OrganisationName: "Little Angels Academy",
            City: "Vadodara",
            PreferredLanguage: SupportedLanguage.Gujarati
        );

        // Act
        var result = await authService.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("owner@littleangels.in");
        result.OrganisationName.Should().Be("Little Angels Academy");
        result.Role.Should().Be(UserRole.Owner);
        result.AccessToken.Should().NotBeNullOrWhiteSpace();

        var savedUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "owner@littleangels.in");
        savedUser.Should().NotBeNull();
        hasher.VerifyPassword("SecurePassword123!", savedUser!.PasswordHash).Should().BeTrue();

        var membership = await context.Memberships.FirstOrDefaultAsync(m => m.UserId == savedUser.Id);
        membership.Should().NotBeNull();
        membership!.Role.Should().Be(UserRole.Owner);
    }

    [Fact]
    public async Task TenantIsolation_UserFromOrg1_CannotAccessOrg2Notices()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var audit = new AuditService(context);
        var noticeService = new NoticeService(context, audit);

        var org1Id = Guid.NewGuid();
        var org2Id = Guid.NewGuid();
        var org1 = new Organisation { Id = org1Id, Name = "Org 1", Slug = "org-1" };
        var org2 = new Organisation { Id = org2Id, Name = "Org 2", Slug = "org-2" };
        var user = new User { Id = Guid.NewGuid(), Email = "teacher@org1.com", FullName = "Teacher 1" };
        await context.Organisations.AddRangeAsync(org1, org2);
        await context.Users.AddAsync(user);

        // Seed notice for Org 1
        var noticeOrg1 = new Notice
        {
            OrganisationId = org1Id,
            CreatedByUserId = user.Id,
            Title = "Org 1 Internal Notice",
            MessageBody = "Confidential to Org 1",
            Category = NoticeCategory.General,
            Language = SupportedLanguage.English
        };

        // Seed notice for Org 2
        var noticeOrg2 = new Notice
        {
            OrganisationId = org2Id,
            CreatedByUserId = user.Id,
            Title = "Org 2 Confidential Report",
            MessageBody = "Private to Org 2",
            Category = NoticeCategory.General,
            Language = SupportedLanguage.English
        };

        await context.Notices.AddRangeAsync(noticeOrg1, noticeOrg2);
        await context.SaveChangesAsync();

        // Act: User from Org 1 attempts to list notices
        var org1Notices = await noticeService.GetNoticesAsync(org1Id, new NoticeListFilterDto());

        // Act: User from Org 1 attempts to fetch Org 2 notice directly by ID
        var crossTenantNotice = await noticeService.GetNoticeByIdAsync(org1Id, noticeOrg2.Id);

        // Assert
        org1Notices.Items.Should().ContainSingle();
        org1Notices.Items.First().Title.Should().Be("Org 1 Internal Notice");
        crossTenantNotice.Should().BeNull("Org 1 user must not be able to retrieve Org 2 notice by ID");
    }

    [Fact]
    public async Task AttendanceService_PreventsDuplicateRecords_And_UpdatesExisting()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var audit = new AuditService(context);
        var attendanceService = new AttendanceService(context, audit);

        var orgId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();
        var org = new Organisation { Id = orgId, Name = "Preschool 1", Slug = "preschool-1" };
        var classRoom = new ClassRoom { Id = Guid.NewGuid(), OrganisationId = orgId, Name = "Nursery A" };
        var student = new Student { Id = Guid.NewGuid(), OrganisationId = orgId, ClassRoomId = classRoom.Id, FirstName = "Aarav", LastName = "Shah", RollNumber = "N01" };

        await context.Organisations.AddAsync(org);
        await context.Classes.AddAsync(classRoom);
        await context.Students.AddAsync(student);
        await context.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // 1. First record: Present
        var firstSubmission = new RecordAttendanceRequestDto(
            ClassRoomId: classRoom.Id,
            Date: today,
            Attendances: new List<AttendanceItemDto>
            {
                new(student.Id, student.FullName, student.RollNumber, AttendanceStatus.Present, "Arrived on time")
            }
        );

        await attendanceService.RecordAttendanceAsync(orgId, teacherId, firstSubmission);

        // 2. Second submission on same date: Change to Late
        var secondSubmission = new RecordAttendanceRequestDto(
            ClassRoomId: classRoom.Id,
            Date: today,
            Attendances: new List<AttendanceItemDto>
            {
                new(student.Id, student.FullName, student.RollNumber, AttendanceStatus.Late, "Traffic delay")
            }
        );

        await attendanceService.RecordAttendanceAsync(orgId, teacherId, secondSubmission);

        // Assert
        var allRecords = await context.AttendanceRecords
            .Where(a => a.OrganisationId == orgId && a.StudentId == student.Id && a.Date == today)
            .ToListAsync();

        allRecords.Should().ContainSingle("Duplicate records for same student and date must be prevented");
        allRecords.First().Status.Should().Be(AttendanceStatus.Late);
        allRecords.First().Remarks.Should().Be("Traffic delay");
    }

    [Fact]
    public async Task ConfigurableAiService_WithoutLiveCredentials_ProducesGujaratiAndEnglishNoticesSafely()
    {
        // Arrange
        var emptyConfig = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        var httpClient = new HttpClient();
        var aiService = new ConfigurableAiService(httpClient, emptyConfig, NullLogger<ConfigurableAiService>.Instance);

        var gujaratiRequest = new GenerateNoticeAiRequest(
            Category: "Event",
            TargetAudience: "All Parents",
            Subject: "વાલી-શિક્ષક મિટિંગ (PTM)",
            EventDate: "20 ઓક્ટોબર, સવારે 10:00",
            RequiredItems: "વિદ્યાર્થી નોટબુક",
            Tone: ToneStyle.Friendly,
            Language: SupportedLanguage.Gujarati,
            OutputLength: "Standard",
            AdditionalInstructions: "કૃપા કરીને સમયસર પધારવું"
        );

        // Act
        var response = await aiService.GenerateNoticeAsync(gujaratiRequest);

        // Assert
        aiService.IsLiveProviderConfigured.Should().BeFalse();
        response.Should().NotBeNull();
        response.Language.Should().Be(SupportedLanguage.Gujarati);
        response.Title.Should().Contain("વાલી-શિક્ષક મિટિંગ");
        response.MessageBody.Should().Contain("સાદર વાલીશ્રીઓ");
        response.WhatsAppVersion.Should().NotBeNullOrWhiteSpace();
        response.ModelUsed.Should().Contain("Sandbox");
    }

    [Fact]
    public async Task SubscriptionService_EnforcesQuotaLimits()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var audit = new AuditService(context);
        var subService = new SubscriptionService(context, audit);

        var orgId = Guid.NewGuid();
        var plan = new SubscriptionPlan
        {
            Id = Guid.NewGuid(),
            Name = "Starter",
            Tier = SubscriptionTier.Starter,
            MaxNoticesPerMonth = 2,
            MaxActivityPlansPerMonth = 1
        };

        var org = new Organisation { Id = orgId, Name = "Test School" };
        var subscription = new OrganisationSubscription
        {
            OrganisationId = orgId,
            SubscriptionPlan = plan,
            NoticesGeneratedThisMonth = 2 // Already reached limit!
        };

        await context.SubscriptionPlans.AddAsync(plan);
        await context.Organisations.AddAsync(org);
        await context.OrganisationSubscriptions.AddAsync(subscription);
        await context.SaveChangesAsync();

        // Act
        var canCreateNotice = await subService.CanPerformAiActionAsync(orgId, AiGenerationType.Notice);
        var canCreatePlan = await subService.CanPerformAiActionAsync(orgId, AiGenerationType.ActivityPlan);

        // Assert
        canCreateNotice.Should().BeFalse("Quota of 2 notices has been exhausted");
        canCreatePlan.Should().BeTrue("Activity plan limit has not been reached");
    }
}
