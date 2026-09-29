# Sewage Repair Service

A community-driven sanitation reporting and repair-management web application for **Khayelitsha, Cape Town**.

> Student entrepreneurship / software project prototype. Not affiliated with the City of Cape Town.

## Description

Frequent blocked drains, burst sewer pipes and sewage overflows affect the health of residents, schools and small
businesses. The business rests on three pillars — **Prevention, Responsiveness, Repair** — and this application
provides the operational side of it:

- **Community sewage reporting** — residents report problems from any phone.
- **Report tracking** — residents follow each report: *Reported → Assigned → In Progress → Resolved*.
- **Repair management** — admins assign repair teams, set an ETA, change status and post updates.
- **Weekly inspection management** — schedule and log sewer inspections; turn an "Issue Found" into a repair report.
- **Admin dashboard** — live statistics calculated from MySQL.

## Features

**Residents**
- Register / log in / log out (email + password, bcrypt-hashed)
- Dashboard with *My Reports*, *Open Reports*, *Resolved Reports* and recent reports
- Mobile-friendly "Report an Issue" form (issue type, area/extension, street/landmark, description, optional phone)
- Unique report reference numbers (`#208`, `#209`, …) shown straight after submission
- *My Reports* list and a tracking page with a visual progress tracker, assigned team, technicians, ETA and a
  timestamped repair-update timeline
- Cancel their own report while it is still *Reported*
- Residents can only ever see their own reports (checked on the server)

**Admins**
- Dashboard: Open Reports, Assigned Jobs, In Progress, Resolved This Week, Average Fix Time, Teams On Duty
- Reports table with status filter tabs and search (reference number, location, issue type)
- Report management page: assign team + ETA (a *Reported* job automatically becomes *Assigned*), change status,
  add repair updates (optionally changing status at the same time), delete
- Teams CRUD (create, edit, set on/off duty, delete)
- Inspections CRUD with status (*Scheduled*, *Completed*, *Issue Found*) and a **Create report** button for issues found

**Platform**
- Server-side authorization in every API route and page, plus route protection middleware
- Zod validation on both the forms and the API, with friendly error messages
- Raw database errors are never shown to users
- Loading states on every button, empty states on every list
- Status badges always include text (never colour alone); semantic HTML and labelled form fields
- No external services required (no Maps API, PayFast, Supabase, Firebase, Twilio or push notifications).
  Updates appear when the page is refreshed (there's a *Refresh status* button on the tracking page).

## Technologies

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- Prisma ORM 6
- MySQL 8
- Zod
- bcryptjs
- jose (signed, HTTP-only session cookie)

## Requirements

- **Node.js** 18.18 or newer (20 or 22 LTS recommended)
- **npm**
- **MySQL** 8 (MySQL Server + MySQL Workbench is fine)

## Installation

```bash
# 1. Install dependencies (this also runs `prisma generate`)
npm install

# 2. Create your environment file
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
```

Edit **`.env`** and set your own values:

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/sewage_repair_service"
NEXTAUTH_SECRET="any-long-random-string-at-least-16-characters"
```

- Use `.env` (not only `.env.local`): the Prisma CLI reads `.env`, and Next.js reads it too.
- If your MySQL password contains special characters (`@`, `#`, `:`, `/`, …) URL-encode them, e.g. `@` → `%40`.
- Generate a secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Database

Choose **one** of the two options.

### Option A — Prisma (recommended)

```bash
# Create the empty database once (or do it in MySQL Workbench)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sewage_repair_service;"

npx prisma generate        # or: npm run db:generate
npm run db:deploy          # applies prisma/migrations (creates all tables)
npm run db:seed            # inserts demo users, teams, reports, updates and inspections
```

`npm run db:seed` wipes and re-creates the demo data, so you can run it again any time to reset the demo.

If you later change `prisma/schema.prisma`, create a new migration with `npx prisma migrate dev` (`npm run db:migrate`).

### Option B — MySQL Workbench (SQL script)

1. Open **`database/schema.sql`** in MySQL Workbench.
2. Click *Execute* (the lightning bolt). It creates the database, all tables, foreign keys and indexes, and inserts the
   same demo data (with bcrypt-hashed passwords).
3. Run `npx prisma generate` (already done by `npm install`).

The SQL script matches `prisma/schema.prisma` exactly. If you use Option B and later want to use Prisma migrations,
mark the initial migration as applied: `npx prisma migrate resolve --applied 20260929000000_init`.

## Running the application

```bash
npm run dev                # development: http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Demo accounts

| Role     | Email                    | Password       |
|----------|--------------------------|----------------|
| Admin    | `admin@sewage.local`     | `Admin123!`    |
| Resident | `resident1@sewage.local` | `Resident123!` |
| Resident | `resident2@sewage.local` | `Resident123!` |
| Resident | `resident3@sewage.local` | `Resident123!` |

Seeded reports: `#201`, `#202` (Resolved), `#203`, `#205` (In Progress), `#204` (Assigned), `#206`, `#207` (Reported).
`#205` (Sewage Overflow, Site C, Harare — Team B, ETA 45 minutes) belongs to `resident1` and has a full update
timeline, matching the example in the presentation. New reports continue from `#208`.

## Demo script

1. Log in as `resident1@sewage.local`.
2. **Report an Issue** → *Sewage Overflow*, area `Ext. 12, Khayelitsha`, description
   `Sewage is overflowing near the corner shop.` → **Submit Report**. Note the reference (e.g. `#208`, status *Reported*).
3. Logout. Log in as `admin@sewage.local`. The new report is on the dashboard under *Open reports*.
4. Open it (**Manage**). *Assign team*: **Team B**, ETA **45 minutes** → **Assign Team**. Status becomes *Assigned*.
5. *Add update*: `Team B is on the way to the reported location.`, *Also change status to*: **In Progress** → **Add Update**.
6. *Add update*: `Repair has been completed successfully.`, *Also change status to*: **Resolved** → **Add Update**.
7. Logout. Log in as `resident1` → **My Reports** → open the report. The tracker shows
   Reported ✓ → Assigned ✓ → In Progress ✓ → Resolved ✓, with every update in the timeline.

## Project structure

```text
app/                    pages (App Router) and API route handlers (app/api/**/route.ts)
  admin/                admin dashboard, reports, teams, inspections
  api/                  auth, reports (+ assign, updates), teams, inspections, dashboard
components/             ui/, layout/, reports/, dashboard/, admin/, auth/
lib/                    prisma client, auth/session, validations (Zod), business logic, formatting
prisma/                 schema.prisma, migrations/, seed.ts
database/schema.sql     full MySQL script (DDL + seed data) for MySQL Workbench
middleware.ts           route protection (login required, admin-only areas)
```

## API

| Method | Route | Who |
|--------|-------|-----|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | public |
| GET | `/api/auth/me` | anyone |
| GET / POST | `/api/reports` | resident (own) / admin (all, `?status=&q=`) |
| GET / PUT / DELETE | `/api/reports/[id]` | owner or admin / admin (resident may cancel own) / admin |
| POST | `/api/reports/[id]/assign` | admin — `{ teamId, eta? }` |
| POST | `/api/reports/[id]/updates` | admin — `{ comment, status? }` |
| GET / POST | `/api/teams` · PUT / DELETE `/api/teams/[id]` | admin |
| GET / POST | `/api/inspections` · PUT / DELETE `/api/inspections/[id]` | admin |
| GET | `/api/dashboard` | resident (own counts) / admin (full stats) |

## Testing checklist

```text
[ ] npm install finishes and runs prisma generate
[ ] npm run db:deploy + npm run db:seed succeed (or schema.sql runs in Workbench)
[ ] npm run dev starts; home page loads
[ ] Register a new resident (try a duplicate email and mismatched passwords too)
[ ] Login / logout work; wrong password shows "Incorrect email or password."
[ ] Resident dashboard shows counts and recent reports
[ ] Resident submits a report; reference + REPORTED status are shown
[ ] Report appears in MySQL (reports + repair_updates tables)
[ ] Resident sees it in My Reports and on the tracking page
[ ] Visiting another resident's /reports/<id> shows "not found"
[ ] Visiting /admin as a resident redirects to /dashboard; logged out redirects to /login
[ ] Admin dashboard numbers match the data
[ ] Admin filters and searches reports (#205, "Harare", "overflow")
[ ] Admin assigns Team B + ETA → status becomes ASSIGNED
[ ] Admin adds updates and moves to IN_PROGRESS, then RESOLVED
[ ] Resident sees the new status, tracker and updates after refresh
[ ] Teams: create, edit, set off duty, delete
[ ] Inspections: create, edit, delete; "Create report" on an Issue Found inspection
[ ] Forms show validation messages for empty/invalid input
[ ] Layout works at phone width (menu button, cards instead of tables where relevant)
[ ] npm run build succeeds
```

## Future work (not required for the MVP)

Map pin / photo upload on reports, SMS or push notifications, payments for call-out fees or maintenance subscriptions,
and a technician role with its own job list.
