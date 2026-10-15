using System.Net;
using System.Text.Json;

namespace Previa.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            UnauthorizedAccessException uae => (HttpStatusCode.Unauthorized, uae.Message),
            KeyNotFoundException knf => (HttpStatusCode.NotFound, knf.Message),
            InvalidOperationException ioe => (HttpStatusCode.BadRequest, ioe.Message),
            ArgumentException ae => (HttpStatusCode.BadRequest, ae.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected server error occurred. Please try again.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            status = (int)statusCode,
            error = statusCode.ToString(),
            message = message,
            timestampUtc = DateTime.UtcNow,
            // In production, never return sensitive stack traces or SQL internals
            details = _env.IsDevelopment() ? exception.StackTrace : null
        };

        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
