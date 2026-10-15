using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Previa.Api.Middleware;
using Previa.Application.Common.Interfaces;
using Previa.Application.Features.ActivityPlans;
using Previa.Application.Features.Ai;
using Previa.Application.Features.Attendance;
using Previa.Application.Features.Auth;
using Previa.Application.Features.Dashboard;
using Previa.Application.Features.Finance;
using Previa.Application.Features.Notices;
using Previa.Application.Features.Subscriptions;
using Previa.Application.Features.Templates;
using Previa.Infrastructure.Ai;
using Previa.Infrastructure.Persistence;
using Previa.Infrastructure.Security;
using Previa.Infrastructure.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add Controllers & HttpContextAccessor
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// Database Configuration
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var sqliteConn = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=previa.db";
var mysqlConn = builder.Configuration.GetConnectionString("MySql");

builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    if (dbProvider.Equals("MySql", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(mysqlConn))
    {
        options.UseMySql(mysqlConn, ServerVersion.AutoDetect(mysqlConn));
    }
    else
    {
        options.UseSqlite(sqliteConn);
    }
});

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// Register Application & Infrastructure Services
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IAiAssistantService, ConfigurableAiService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INoticeService, NoticeService>();
builder.Services.AddScoped<IActivityPlanService, ActivityPlanService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IFeeService, FeeService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// JWT Authentication Setup
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "Previa_Super_Secret_Key_For_Preschool_AI_Assistant_2026_Minimum_32_Characters!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PreviaApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PreviaClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Previa API - Preschool AI Assistant",
        Version = "v1",
        Description = "Commercial API backend for preschool administration, parent notices, multilingual translations, attendance, and fee tracking."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter JWT Bearer token: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

// Health check service
builder.Services.AddHealthChecks();

var app = builder.Build();

// Ensure DB Created & Seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        db.Database.EnsureCreated();
        await DbInitializer.SeedAsync(db, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while ensuring or seeding the database.");
    }
}

// Exception handling middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Previa API v1");
    });
}

app.UseCors("AllowClient");

app.UseAuthentication();
app.UseAuthorization();

// Map Health Check
app.MapHealthChecks("/health");

app.MapControllers();

app.Run();

// For integration tests
public partial class Program { }
