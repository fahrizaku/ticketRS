# Ticket RS

A helpdesk ticketing system for reporting and tracking IT and facility problems
in a hospital (printers, network, the hospital information system, and so on).
Staff file tickets, technicians pick them up, admins manage users and
categories, and everyone sees updates in real time.

The UI is in Indonesian, the code and this document are in English.

## Features

- **Role-based access** — `ADMIN`, `TEKNISI` (technician) and `STAFF`, enforced
  in every server action.
- **Ticket lifecycle** — priority (`LOW`…`CRITICAL`), status
  (`OPEN` → `IN_PROGRESS` → `CLOSED`), assignment to a technician, comments.
- **Realtime notifications** — Server-Sent Events (`/api/events`) fed by an
  in-process event bus. New comments, status changes and notifications appear
  without reloading the page.
- **Admin area** — user registration and ticket category management.
- **Dashboard** — ticket statistics, responsive down to mobile, light/dark theme.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Database | SQLite / libSQL via Drizzle ORM (`drizzle-kit` for schema push) |
| Auth | Username + password (`bcryptjs`), session in an httpOnly JWT cookie (`jose`) |
| Validation | `zod` |
| Styling | Tailwind CSS 4 |

## Quick start

Requires Node.js 20+.

```bash
npm ci
mkdir -p prisma                  # location of the default SQLite file
cp .env.example .env
# put a random value into JWT_SECRET (>= 32 chars), e.g.:
#   openssl rand -base64 48

npm run db:push                  # create the tables
npm run seed                     # demo users, categories and tickets
npm run dev                      # http://localhost:3000
```

`JWT_SECRET` is required. There is intentionally no default: the app throws
instead of signing sessions with a known value.

### Demo accounts (seed data only)

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Technician | `teknisi` | `teknisi123` |
| Staff | `staff` | `staff123` |

These exist only to try the app locally. Do not run the seed against a real
deployment, or change the passwords immediately.

## Project layout

```
app/
├── (auth)/login            login page
├── (dashboard)/            authenticated area: dashboard, tickets, admin
├── actions/                server actions (auth, tickets, categories, notifications)
├── api/events/route.ts     SSE endpoint
├── components/             UI components
└── lib/
    ├── auth.ts             JWT session helpers
    ├── db.ts, schema.ts    Drizzle client and schema (users, categories,
    │                       tickets, comments, notifications)
    ├── events.ts           in-process event bus
    └── seed.ts             demo data
```

## Known limitations

- The event bus lives in the Node.js process memory, so realtime updates only
  reach clients connected to the **same instance**. Running several instances
  (or a serverless deployment) would need a shared broker such as Redis pub/sub.
- No automated tests yet.
- Image upload for tickets stores files on local disk (`public/uploads`), which
  is not suitable for ephemeral filesystems.

## Credits

Some layout components (sidebar, breadcrumb, card) are adapted from a Tailwind
admin dashboard template.
