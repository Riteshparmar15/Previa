# Previa Security & Child Privacy Policy

Previa is designed as a secure, privacy-first software platform serving early-childhood education providers. Because the application manages communications involving children and families, security and data minimization are core architectural invariants.

---

## 1. Child Data Minimization & Privacy Protection

### Strict Data Minimization Policy:
- **No Children Photographs**: Previa deliberately does not collect, store, or process facial photographs of children.
- **No Real-Time GPS Tracking**: No live location data, geolocation pins, or transit monitoring of children is stored.
- **No Sensitive Medical / Health Records**: Medical diagnoses or sensitive personal notes are never stored in student records.
- **Only Necessary Guardian Contacts**: We collect only the minimum required information to identify the child (first name, last name, roll number) and reach the primary guardian for school notices.

---

## 2. Authentication & Credential Management

- **Password Storage**: Passwords are never stored in plaintext or reversible formats. Previa utilizes industry-standard **BCrypt with Work Factor 11** for cryptographic salting and hashing.
- **JWT Architecture**:
  - **Access Tokens**: Short-lived (60 minutes) signed with HMAC-SHA256 (`HmacSha256Signature`). Contains user identity, tenant identifier, and role.
  - **Refresh Tokens**: Cryptographically generated 64-byte random tokens stored in database with explicit expiry dates and revocation upon logout.
  - **Zero Credential Exposure**: Client-side JavaScript never receives or stores administrative API keys or database connection strings.

---

## 3. Multi-Tenant Authorization & Isolation

- **Server-Side Enforcement**: All authorization decisions occur strictly on the backend. No hidden frontend buttons or disabled UI elements are relied upon for security.
- **Tenant Context Verification**: The authenticated user's organisation membership is checked on every query. Modifying URL IDs or request bodies will result in `404 Not Found` or `401 Unauthorized` responses without leaking data exists.
- **Role-Based Access Control (RBAC)**:
  - `Owner`: Complete tenant management, subscription upgrades, user invites, settings.
  - `Administrator`: Day-to-day operations, notices, activities, classrooms, attendance.
  - `Teacher`: Attendance marking, activity plan drafting, class notices.
  - `ReadOnlyStaff`: View notices and non-sensitive dashboards only.

---

## 4. Defense Against Common Vulnerabilities

| Vulnerability | Mitigation Strategy in Previa |
|---|---|
| **SQL Injection** | Entity Framework Core parameterized queries; zero concatenated raw SQL strings. |
| **Cross-Site Scripting (XSS)** | React JSX auto-escaping of all dynamic text; no `dangerouslySetInnerHTML` on AI-generated content. |
| **Cross-Site Request Forgery (CSRF)** | Stateless Bearer token authorization in `Authorization: Bearer <token>` header. |
| **Broken Access Control** | Explicit `ITenantEntity` filtering and role policies applied via `Authorize` filters. |
| **Prompt Injection** | LLM prompts treat user inputs as untrusted data wrapped in structured boundaries; system guidelines strictly prohibit credential disclosure or script generation. |
| **Denial of Service (DoS)** | Per-organisation monthly generation quotas, input length limits, request cancellation timeouts, and database pagination. |

---

## 5. Audit Logging & Compliance

- Sensitive operations (login attempts, attendance marking, notice publishing, subscription changes) are recorded in the `AuditEvents` table with UTC timestamp, user ID, tenant ID, and source IP context.
- Audit logs are non-deletable through standard API endpoints to maintain verifiable operational records.
