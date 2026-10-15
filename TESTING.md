# Previa Automated Testing Guide

This document summarizes the testing strategy, test coverage, and instructions for running automated tests in Previa.

---

## 1. Test Architecture & Coverage

The automated test suite (`Previa.Tests`) tests mission-critical SaaS functionality, tenant isolation, concurrency integrity, and failure handling.

| Test Case | Layer / Focus | Invariant Verified |
|---|---|---|
| `Register_CreatesUser_And_AssignsOwner_WithStarterPlan` | Integration / Auth | New user registration assigns `UserRole.Owner`, links to the newly created `Organisation`, creates default `OrganisationSubscription` on the Starter plan. |
| `TenantIsolation_UserFromOrg1_CannotAccessOrg2Notices` | Integration / Security | A user belonging to Organisation A receives an empty list / 404 when querying notices created by Organisation B. Cross-tenant leakage is strictly prevented. |
| `AttendanceService_PreventsDuplicateRecords_And_UpdatesExisting` | Integration / Attendance | Recording attendance twice for the same student on the same date updates the existing record rather than creating a duplicate row, preserving unique constraints. |
| `ConfigurableAiService_WithoutLiveCredentials_ProducesGujaratiAndEnglishNoticesSafely` | Integration / AI Resilience | In the absence of an external AI API key, the system safely synthesizes structured preschool notices in Gujarati and English without crashing or throwing null references. |
| `SubscriptionService_EnforcesQuotaLimits` | Integration / Billing | An organisation that exhausts its monthly AI generation limit is blocked from generating further items until upgraded. |

---

## 2. Running Unit & Integration Tests

Execute the test suite via the .NET CLI:

```powershell
dotnet test tests/Previa.Tests/Previa.Tests.csproj --verbosity normal
```

Expected result:
```
Passed!  - Failed: 0, Passed: 5, Skipped: 0, Total: 5, Duration: ~1.2 s
```

---

## 3. Running Live HTTP Workflow Verification

A script is provided at `scratch/verify_api_workflow.ps1` to test the running API server through all 12 operational steps:

```powershell
powershell -ExecutionPolicy Bypass -File scratch/verify_api_workflow.ps1
```

Verification stages executed:
1. `POST /api/auth/register` (Registers new preschool owner)
2. `GET /api/dashboard/stats` (Inspects live metrics)
3. `POST /api/notices/ai-generate` (Tests Gujarati notice synthesis)
4. `POST /api/notices` (Persists notice draft)
5. `POST /api/activityplans/ai-generate` (Tests multi-day lesson curriculum plan)
6. `POST /api/attendance/classes` & `POST /api/attendance/students` (Classroom & student enrollment)
7. `POST /api/attendance/record` (Records daily attendance)
8. `GET /api/attendance/summary` (Calculates attendance rate)
9. `GET /api/attendance/export-csv` (Validates authorized CSV file streaming)
10. `POST /api/fees/ai-reminder` (Generates polite fee reminder draft)
11. `GET /api/templates` (Retrieves pre-seeded preschool templates)
12. `POST /api/subscriptions/change-plan` (Tests tier upgrade and limit elevation)

---

## 4. Frontend Verification

Run TypeScript compilation and production bundle validation:

```powershell
cd client
npm run build
```

Bundle verification confirms:
- 0 TypeScript compilation errors.
- Clean minification and code splitting across vendor chunks and pages.
