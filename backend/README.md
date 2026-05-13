# Sporthink Backend

NestJS + TypeScript API for the Sporthink marketplace reconciliation system.

## Runtime configuration

Create a local `.env` file in this directory or provide these variables from the shell:

- `DATABASE_URL`: MySQL connection string for Prisma.
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_SSL`: raw SQL pool configuration.
- `PORT`: API port, defaults to `3001`.
- `API_PREFIX`: route prefix, defaults to `api`.
- `FRONTEND_ORIGIN`: optional CORS origin, defaults to `http://localhost:5173`.
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_AUTHORITY`, `MICROSOFT_ALLOWED_TENANT_IDS`, `MICROSOFT_ALLOWED_DOMAINS`: Microsoft 365 login verification settings. `MICROSOFT_ALLOWED_TENANT_IDS` and `MICROSOFT_ALLOWED_DOMAINS` are comma-separated allowlists. For demo-only tenant-domain validation, `MICROSOFT_ALLOWED_TENANT_IDS` can be left empty while `MICROSOFT_ALLOWED_DOMAINS` remains restricted.
- `MICROSOFT_ADMIN_EMAILS`: comma-separated Microsoft login emails that should receive the `admin` role automatically. Other newly created Microsoft users receive `operasyon`.
- `JWT_SECRET`, `JWT_EXPIRES_IN`: application JWT signing settings.

Secrets must stay local and must not be committed.

## Commands

```powershell
npm install
npm run build
npm run dev
```

## Microsoft login MVP permissions

The MVP uses Microsoft Identity Platform only for OpenID Connect authentication. The frontend MSAL login request must stay limited to:

```ts
scopes: ["openid", "profile", "email"]
```

Do not add Microsoft Graph permissions such as `User.Read`, `Mail.Read`, `Calendars.Read`, or `offline_access` unless the product scope explicitly changes. The backend only receives and verifies the Microsoft `id_token`; it does not call Microsoft Graph, Mail, Calendar, or any other organization resource.

In Azure App Registration > API permissions, keep only the minimum OpenID Connect sign-in permissions needed for this MVP and remove unnecessary Graph permissions. In corporate or university tenants such as DEU, user consent may be disabled by policy. In that case Microsoft can still show an admin approval screen even for a minimal login flow, and the tenant administrator must allow or consent to the application.

Bu demo ortaminda Microsoft login akisini gostermek icin test tenant kullanilmistir. Production ortaminda Sporthink'in kendi Microsoft Entra tenant'i ve @sporthink.com.tr domain'i kullanilacaktir.
