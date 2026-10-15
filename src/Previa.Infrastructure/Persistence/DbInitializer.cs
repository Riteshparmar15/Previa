using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Previa.Domain.Entities;
using Previa.Domain.Enums;

namespace Previa.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            if (!await context.SubscriptionPlans.AnyAsync())
            {
                logger.LogInformation("Seeding default Previa subscription plans...");
                var plans = new List<SubscriptionPlan>
                {
                    new()
                    {
                        Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                        Name = "Starter",
                        Tier = SubscriptionTier.Starter,
                        PriceInrMonthly = 499.00m,
                        MaxNoticesPerMonth = 30,
                        MaxActivityPlansPerMonth = 10,
                        MaxStudents = 30,
                        MaxClasses = 2,
                        AllowWhatsAppFormat = true,
                        AllowTranslations = true,
                        AllowCustomTemplates = true,
                        AllowCsvExport = true,
                        IsActive = true
                    },
                    new()
                    {
                        Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                        Name = "Standard",
                        Tier = SubscriptionTier.Standard,
                        PriceInrMonthly = 999.00m,
                        MaxNoticesPerMonth = 150,
                        MaxActivityPlansPerMonth = 50,
                        MaxStudents = 100,
                        MaxClasses = 8,
                        AllowWhatsAppFormat = true,
                        AllowTranslations = true,
                        AllowCustomTemplates = true,
                        AllowCsvExport = true,
                        IsActive = true
                    },
                    new()
                    {
                        Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                        Name = "Premium",
                        Tier = SubscriptionTier.Premium,
                        PriceInrMonthly = 1999.00m,
                        MaxNoticesPerMonth = 1000,
                        MaxActivityPlansPerMonth = 500,
                        MaxStudents = 500,
                        MaxClasses = 30,
                        AllowWhatsAppFormat = true,
                        AllowTranslations = true,
                        AllowCustomTemplates = true,
                        AllowCsvExport = true,
                        IsActive = true
                    }
                };

                await context.SubscriptionPlans.AddRangeAsync(plans);
                await context.SaveChangesAsync();
            }

            if (!await context.NoticeTemplates.AnyAsync(t => t.IsSystemTemplate))
            {
                logger.LogInformation("Seeding default preschool system templates...");
                var templates = new List<NoticeTemplate>
                {
                    new()
                    {
                        Title = "Parent-Teacher Meeting (PTM) Invitation",
                        Category = NoticeCategory.General,
                        SubjectTemplate = "Invitation for Term 1 Parent-Teacher Meeting",
                        BodyTemplate = "Dear Parents,\n\nWe cordially invite you to the upcoming Parent-Teacher Meeting on {Date} between {Time} at the preschool campus. This meeting provides an excellent opportunity to discuss your child's developmental milestones, social interaction, and classroom engagement.\n\nPlease arrive within your designated time slot. We look forward to meeting you!\n\nWarm regards,\nCentre Administrator",
                        WhatsAppTemplate = "🌸 *Parent-Teacher Meeting Invitation*\n\nDear Parents, please join us on {Date} between {Time} to review your child's learning progress.\nVenue: School Campus.\nLooking forward to seeing you!\n- Previa Preschool",
                        Language = SupportedLanguage.English,
                        IsSystemTemplate = true
                    },
                    new()
                    {
                        Title = "Monsoon Rain Advisory & Preschool Holiday",
                        Category = NoticeCategory.Emergency,
                        SubjectTemplate = "School Holiday Notice due to Heavy Rain Advisory",
                        BodyTemplate = "Dear Parents,\n\nFollowing the severe weather advisory and heavy rainfall forecasted by the municipal authorities in Vadodara, the preschool will remain closed on {Date} for the safety and well-being of all young children.\n\nRegular classes will resume once conditions improve. Stay safe and dry indoors!\n\nWarm regards,\nPrincipal",
                        WhatsAppTemplate = "🌧️ *Rain Holiday Notice*\n\nDear Parents, in view of heavy rain warnings in Vadodara, the preschool will remain CLOSED on {Date}. Safety is our highest priority. Stay safe indoors!\n- Preschool Admin",
                        Language = SupportedLanguage.English,
                        IsSystemTemplate = true
                    },
                    new()
                    {
                        Title = "Annual Sports & Fun Day Announcement",
                        Category = NoticeCategory.Event,
                        SubjectTemplate = "Annual Kindergarten Sports Day - Schedule & Attire",
                        BodyTemplate = "Dear Parents,\n\nGet ready for our vibrant Annual Sports & Fun Day scheduled on {Date}! Children will participate in delightful age-appropriate games, parachute races, and team activities designed to foster gross motor skills and teamwork.\n\nPlease dress your child in comfortable sports shoes and preschool house t-shirts, and pack an extra labeled water bottle.\n\nWarm regards,\nSports Committee",
                        WhatsAppTemplate = "🏅 *Annual Sports Day!*\n\nDear Parents, mark your calendars for {Date}! Fun races, medals, and cheers await our little champions. Please send children in sports attire with water bottles.\n- Preschool Team",
                        Language = SupportedLanguage.English,
                        IsSystemTemplate = true
                    },
                    new()
                    {
                        Title = "Navratri & Diwali Vacation Announcement",
                        Category = NoticeCategory.Holiday,
                        SubjectTemplate = "Festive Holidays & Cultural Celebration",
                        BodyTemplate = "Dear Parents,\n\nWishing you and your family joy and prosperity! The preschool will observe festive vacation starting from {StartDate} to {EndDate}.\n\nBefore the break, we will host a Traditional Dress Day on {CelebrationDate}. Classes will resume with regular timings on {ReopenDate}.\n\nWarm regards,\nSchool Management",
                        WhatsAppTemplate = "🪔 *Festival Vacation Notice*\n\nDear Parents, the preschool will remain closed for festive holidays from {StartDate} to {EndDate}. Reopening on {ReopenDate}. Wishing you festive joy!\n- Preschool Management",
                        Language = SupportedLanguage.English,
                        IsSystemTemplate = true
                    },
                    new()
                    {
                        Title = "Friendly Monthly Fee Due Reminder",
                        Category = NoticeCategory.FeeReminder,
                        SubjectTemplate = "Friendly Reminder: Preschool Fee Due for {Month}",
                        BodyTemplate = "Dear Parents,\n\nThis is a kind reminder regarding the preschool fee payment for {StudentName} for the term {Month}. The due date for payment is {DueDate}.\n\nTimely payments assist us in maintaining top-tier learning resources and activities for your little ones. If you have already made the transfer, please kindly disregard this message.\n\nThank you for your support!\n\nWarm regards,\nAccounts Desk",
                        WhatsAppTemplate = "📝 *Friendly Fee Reminder*\n\nDear Parents, preschool fees for {StudentName} ({Month}) are due by {DueDate}. Thank you for your continued support.\n- Preschool Office",
                        Language = SupportedLanguage.English,
                        IsSystemTemplate = true
                    }
                };

                await context.NoticeTemplates.AddRangeAsync(templates);
                await context.SaveChangesAsync();
            }

            // Seed Demo Preschool & Owner Account if not present
            if (!await context.Users.AnyAsync(u => u.Email == "admin@littlepearls.in"))
            {
                logger.LogInformation("Seeding demo preschool account (admin@littlepearls.in)...");

                var orgId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
                var userId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
                var planId = Guid.Parse("22222222-2222-2222-2222-222222222222"); // Standard Plan
                var classId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
                var class2Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc2");
                var student1Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddd01");
                var student2Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddd02");
                var student3Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddd03");

                var demoOrg = new Organisation
                {
                    Id = orgId,
                    Name = "Little Pearls Preschool - Vadodara",
                    Slug = "little-pearls-vadodara",
                    Address = "14, Sampatrao Colony, Alkapuri",
                    City = "Vadodara",
                    State = "Gujarat",
                    Country = "India",
                    PreferredLanguage = SupportedLanguage.Gujarati,
                    TimeZoneId = "India Standard Time",
                    IsActive = true
                };

                var demoUser = new User
                {
                    Id = userId,
                    Email = "admin@littlepearls.in",
                    FullName = "Pooja Shah",
                    PhoneNumber = "+91 98765 43210",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123", workFactor: 11),
                    IsActive = true
                };

                var membership = new OrganisationMembership
                {
                    OrganisationId = orgId,
                    UserId = userId,
                    Role = UserRole.Owner,
                    IsActive = true
                };

                var subscription = new OrganisationSubscription
                {
                    OrganisationId = orgId,
                    SubscriptionPlanId = planId,
                    Status = SubscriptionStatus.Active,
                    CurrentPeriodStartUtc = DateTime.UtcNow.AddDays(-15),
                    CurrentPeriodEndUtc = DateTime.UtcNow.AddDays(15),
                    TrialEndsAtUtc = DateTime.UtcNow.AddDays(15),
                    NoticesGeneratedThisMonth = 4,
                    ActivityPlansGeneratedThisMonth = 2
                };

                var class1 = new ClassRoom
                {
                    Id = classId,
                    OrganisationId = orgId,
                    Name = "Nursery Sunflowers",
                    Description = "Foundational play-based sensory and motor skills (Age 3-4)",
                    AcademicYear = "2026-2027",
                    RoomNumber = "Room 102",
                    IsActive = true
                };

                var class2 = new ClassRoom
                {
                    Id = class2Id,
                    OrganisationId = orgId,
                    Name = "Junior KG Little Explorers",
                    Description = "Early phonics, number sense and social interaction (Age 4-5)",
                    AcademicYear = "2026-2027",
                    RoomNumber = "Room 201",
                    IsActive = true
                };

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var student1 = new Student
                {
                    Id = student1Id,
                    OrganisationId = orgId,
                    ClassRoomId = classId,
                    RollNumber = "LP-01",
                    FirstName = "Aarav",
                    LastName = "Patel",
                    GuardianName = "Hitesh Patel",
                    GuardianPhone = "+919876543210",
                    GuardianEmail = "hitesh.patel@example.com",
                    AdmissionDate = today.AddMonths(-4),
                    IsActive = true
                };

                var student2 = new Student
                {
                    Id = student2Id,
                    OrganisationId = orgId,
                    ClassRoomId = classId,
                    RollNumber = "LP-02",
                    FirstName = "Diya",
                    LastName = "Shah",
                    GuardianName = "Bhavin Shah",
                    GuardianPhone = "+919876543211",
                    GuardianEmail = "bhavin.shah@example.com",
                    AdmissionDate = today.AddMonths(-4),
                    IsActive = true
                };

                var student3 = new Student
                {
                    Id = student3Id,
                    OrganisationId = orgId,
                    ClassRoomId = class2Id,
                    RollNumber = "LP-03",
                    FirstName = "Kabir",
                    LastName = "Mehta",
                    GuardianName = "Nilesh Mehta",
                    GuardianPhone = "+919876543212",
                    GuardianEmail = "nilesh.mehta@example.com",
                    AdmissionDate = today.AddMonths(-3),
                    IsActive = true
                };

                var sampleNotice = new Notice
                {
                    Id = Guid.NewGuid(),
                    OrganisationId = orgId,
                    CreatedByUserId = userId,
                    Title = "નવરાત્રી ગરબા મહોત્સવ અને પારંપરિક વસ્ત્રો અંગે સૂચના",
                    MessageBody = "પ્રિય વાલીશ્રીઓ,\n\nઆગામી નવરાત્રી ઉત્સવ નિમિત્તે આપણી પ્રિસ્કૂલમાં ખાસ બાળ ગરબા મહોત્સવનું આયોજન કરવામાં આવ્યું છે.\n\nતારીખ: આ શુક્રવાર\nસમય: સવારે ૯:૩૦ થી ૧૧:૩૦\n\nબાળકોને રંગબેરંગી પારંપરિક વસ્ત્રો (ચણિયા ચોળી / કુર્તા પાયજામા) પહેરાવીને મોકલવા નમ્ર વિનંતી છે. સલામતી ખાતર સપાટ જૂતા પહેરાવવા.\n\nઆભાર,\nલિટલ પર્લ્સ એકેડેમી, વડોદરા",
                    WhatsAppVersion = "🌸 *નવરાત્રી ગરબા મહોત્સવ - લિટલ પર્લ્સ એકેડેમી*\n\nવાલીશ્રીઓ, આ શુક્રવારે સવારે ૯:૩૦ કલાકે બાળકો માટે ગરબા ઉત્સવ યોજાશે. બાળકોને આરામદાયક પારંપરિક વસ્ત્રો પહેરાવવા વિનંતી.\n- પ્રિસ્કૂલ વહીવટ",
                    Category = NoticeCategory.Event,
                    TargetAudience = NoticeAudience.AllParents,
                    Language = SupportedLanguage.Gujarati,
                    Tone = ToneStyle.Warm,
                    IsDraft = false,
                    CreatedAtUtc = DateTime.UtcNow.AddHours(-2)
                };

                var att1 = new AttendanceRecord
                {
                    OrganisationId = orgId,
                    ClassRoomId = classId,
                    StudentId = student1Id,
                    Date = today,
                    Status = AttendanceStatus.Present,
                    Remarks = "Arrived on time cheerfully",
                    RecordedByUserId = userId,
                    RecordedAtUtc = DateTime.UtcNow
                };

                var att2 = new AttendanceRecord
                {
                    OrganisationId = orgId,
                    ClassRoomId = classId,
                    StudentId = student2Id,
                    Date = today,
                    Status = AttendanceStatus.Present,
                    Remarks = "Present with water bottle",
                    RecordedByUserId = userId,
                    RecordedAtUtc = DateTime.UtcNow
                };

                var sampleFee = new FeeRecord
                {
                    Id = Guid.NewGuid(),
                    OrganisationId = orgId,
                    StudentId = student1Id,
                    FeePeriod = "Term 2 (Oct - Dec)",
                    Amount = 4500.00m,
                    PaidAmount = 0.00m,
                    Currency = "INR",
                    DueDate = today.AddDays(7),
                    Status = FeeStatus.Pending,
                    Notes = "Quarterly tuition and materials fee"
                };

                await context.Organisations.AddAsync(demoOrg);
                await context.Users.AddAsync(demoUser);
                await context.Memberships.AddAsync(membership);
                await context.OrganisationSubscriptions.AddAsync(subscription);
                await context.Classes.AddRangeAsync(class1, class2);
                await context.Students.AddRangeAsync(student1, student2, student3);
                await context.Notices.AddAsync(sampleNotice);
                await context.AttendanceRecords.AddRangeAsync(att1, att2);
                await context.FeeRecords.AddAsync(sampleFee);

                await context.SaveChangesAsync();
                logger.LogInformation("Demo preschool account (admin@littlepearls.in) seeded successfully!");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database seeding.");
            throw;
        }
    }
}
