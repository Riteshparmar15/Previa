# Previa Deployment & Operations Guide

This guide details the deployment options for **Previa**, including local containerized deployment via Docker Compose and production cloud hosting.

---

## 1. Architecture Overview in Production

In a standard production environment, Previa is deployed with:
1. **Frontend**: Vite-built React single page application served through an Nginx alpine reverse proxy.
2. **Backend API**: ASP.NET Core 10 Web API running in a hardened .NET runtime container.
3. **Database**: MySQL 8.0 with InnoDB engine, utf8mb4 collation, and persistent volume storage.

---

## 2. Docker Compose Deployment (Recommended)

A ready-to-run [docker-compose.yml](file:///c:/Users/ritesh.parmar.TG/Documents/RP/Services/Previa/docker-compose.yml) is included in the root directory.

### Quick Launch Command:

```bash
docker compose up -d --build
```

### Services Started:
- **`previa-db`**: MySQL 8.0 on internal port 3306 (health checked).
- **`previa-api`**: ASP.NET Core Web API on port 5123.
- **`previa-web`**: React SPA on port 5173 (or port 80/443 in production).

---

## 3. Environment Variables Reference

Create a `.env` file from the provided [.env.example](file:///c:/Users/ritesh.parmar.TG/Documents/RP/Services/Previa/.env.example):

### Backend Configuration
```ini
ASPNETCORE_ENVIRONMENT=Production
DATABASE_PROVIDER=MySQL
ConnectionStrings__DefaultConnection="Server=previa-db;Database=previa;User=previa_user;Password=ChangeThisSecurePassword!2026;CharSet=utf8mb4;"

# Security & JWT
JwtSettings__Secret="PreviaSuperSecureSecretKey_ReplaceInProductionWithAtLeast32BytesLengthKey!"
JwtSettings__Issuer="PreviaAuth"
JwtSettings__Audience="PreviaPreschoolSaaS"
JwtSettings__ExpiryMinutes=60
JwtSettings__RefreshTokenExpiryDays=7

# External AI Provider (Optional)
# If left empty, Previa automatically operates in resilient offline domain synthesis mode.
AiSettings__Provider="OpenAI"
AiSettings__ApiKey=""
AiSettings__Model="gpt-4o-mini"
AiSettings__BaseUrl="https://api.openai.com/v1"
```

---

## 4. Database Migrations & Seeding

When starting the application, the `DbInitializer.InitializeAsync` routine automatically:
1. Ensures database schema is created and all constraints are applied.
2. Seeds official subscription plans (`Starter`, `Standard Centre`, `Growth Academy`).
3. Seeds standard preschool announcement templates (PTM circulars, Rainy day notices, Sports day invitations, Holiday greetings).

To run manual EF Core migrations:
```powershell
dotnet ef database update --project src/Previa.Infrastructure --startup-project src/Previa.Api
```

---

## 5. Health Checks & Monitoring

- **Health Check Endpoint**: `GET /health`
  - Returns `200 OK` ("Healthy") when database connectivity is verified.
- **Structured Logs**: Serilog writes console logs formatted for modern aggregators (Datadog, Loki, AWS CloudWatch).

---

## 6. Database Backup & Disaster Recovery

### Automated Daily MySQL Dump:
```bash
docker exec previa-db mysqldump -u previa_user -p"ChangeThisSecurePassword!2026" previa > backup_$(date +%F).sql
```

### Restore Procedure:
```bash
docker exec -i previa-db mysql -u previa_user -p"ChangeThisSecurePassword!2026" previa < backup_2026-10-15.sql
```
