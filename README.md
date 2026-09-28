# 🐾 CatCorp HR

A small cloud CRUD application for a university PaaS assignment.

## Assignment requirements covered

- Web application: Next.js UI
- CRUD + list: cat employees
- Public API: `/api/cats` and `/api/cats/:id`
- Persistence: PostgreSQL (Neon)
- File storage: Vercel Blob for employee photos
- Background operation: Vercel Cron chooses Employee of the Day
- Create/update validation:
  - string: name/job title
  - email/string format
  - decimal number: salary
  - date: birth date
  - boolean: remote worker
  - integer: lives remaining
  - file: image type and size

## Architecture

```text
Browser
   |
   v
Vercel / Next.js
   |-- Web pages
   |-- REST API /api/cats
   |-- Upload API /api/upload
   |
   +--------> Neon PostgreSQL
   |
   +--------> Vercel Blob (cat photos)

Vercel Cron
   |
   +--------> /api/cron/employee-of-the-day
                    |
                    +--> PostgreSQL
```

## 1. Install locally

Requires a current Node.js LTS version.

```bash
npm install
```

Copy `.env.example` to `.env.local`.

## 2. Create PostgreSQL

Recommended: create a Neon PostgreSQL integration for the Vercel project.

Put the supplied PostgreSQL connection string in:

```env
DATABASE_URL=...
```

Open the Neon/Vercel SQL editor and execute `database/schema.sql`.

## 3. Create Vercel Blob

In the Vercel project Storage area create a PUBLIC Blob store and connect it to this project.
Vercel supplies `BLOB_READ_WRITE_TOKEN`.

For local development, pull/copy that token into `.env.local`.

## 4. Cron secret

Create a random secret (16+ characters) and add:

```env
CRON_SECRET=...
```

to both local `.env.local` and the Vercel project's environment variables.

The production schedule in `vercel.json` runs at 06:00 UTC every day.

## 5. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

The cron can be tested locally with:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/employee-of-the-day
```

## 6. API examples

List:

```bash
curl http://localhost:3000/api/cats
```

Get one:

```bash
curl http://localhost:3000/api/cats/1
```

Create:

```bash
curl -X POST http://localhost:3000/api/cats \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Mittens",
    "jobTitle":"Senior Mouse Engineer",
    "email":"mittens@catcorp.test",
    "salary":42000.50,
    "birthDate":"2021-04-12",
    "remoteWorker":true,
    "livesRemaining":8,
    "photoUrl":null
  }'
```

Update uses `PUT /api/cats/:id`.
Delete uses `DELETE /api/cats/:id`.

## 7. Deploy

1. Push this folder to a GitHub repository.
2. Import that repository into Vercel.
3. Add/connect Neon from Vercel Marketplace.
4. Run `database/schema.sql` against the database.
5. Create/connect a public Vercel Blob store.
6. Add `CRON_SECRET`.
7. Redeploy if environment variables were added after the first deployment.
8. Test Create, Read, Update, Delete, photo upload, `/api/cats`, and the cron endpoint.

## Notes

"Delete" is implemented as a soft delete (`active = false`) so Employee-of-the-Day history remains valid.
The REST API has no authentication because the assignment asks for a public API. Do not use this exact security model for a real HR system.
