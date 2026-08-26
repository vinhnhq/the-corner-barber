# The Corner Barbershop

Landing page and booking requests for a classic barbershop at 206 Võ Thị Đặng,
Phường Tân Mỹ, TP. Hồ Chí Minh.

See [PLAN.md](./PLAN.md) for what was built, why, and what is still open.

## Running it

```bash
bun install
cp .env.example .env.local     # already done if you cloned this working copy
bun run db:migrate             # creates data/corner.db
bun run db:seed                # loads the real service menu
bun run dev                    # http://localhost:3000
```

The public page is `/`. The staff screens are at `/admin` — **there is no
login**; see the warning below.

## Scripts

| Command                 | What it does                                                  |
| ----------------------- | ------------------------------------------------------------- |
| `bun run dev`           | Dev server (Turbopack)                                        |
| `bun run build`         | Production build                                              |
| `bun run lint`          | oxlint (type-aware) + oxfmt check                             |
| `bun run format`        | oxfmt write                                                   |
| `bun run typecheck`     | `tsc --noEmit`                                                |
| `bun run db:migrate`    | Apply migrations                                              |
| `bun run db:seed`       | Seed services, barbers, hours, gallery selection (local only) |
| `bun run db:seed:force` | Same, but allowed against a remote database — see below       |
| `bun run db:reset`      | Delete the local database and rebuild it                      |
| `bun run assets:sheets` | Contact sheets over every source photo → `scratch/sheets/`    |
| `bun run assets:photos` | Encode the curated shortlist → `public/photos/` + manifest    |
| `bun run assets:video`  | Cut and encode the hero loop → `public/video/`                |

## Editing content

- **Services, prices, barbers, hours, gallery** — edit in `/admin`, or change
  `src/lib/shop.ts` and re-run `bun run db:seed`.
- **Copy** — `src/lib/i18n/dictionaries.ts`. Vietnamese and English are typed
  against the same shape, so a missing string fails the build.
- **Photos** — add or swap entries in `scripts/photos.manifest.ts`, then run
  `bun run assets:photos`. Originals live in `_source-assets/` and are never
  committed.
- **Icons / logo** — drop a new mark into `favicon/` and run
  `bun run assets:icons`. It recolours the silhouette to brass, sets it on the
  site's olive ground and writes every size: `src/app/favicon.ico`,
  `icon.png`, `apple-icon.png`, the manifest icons in `public/icons/`, and
  `public/icons/mark.png` — the transparent version used as the logo beside the
  wordmark in the header and footer. The source folder is an input and is not
  committed.

## Google Calendar

Confirming a booking in `/admin` puts it on the shop's Google Calendar; staff
then get Google's own notification and can open the calendar to see the day.
Customers can't be written to — nobody grants calendar access to book a
haircut — so the success screen offers them a prefilled Google link and an
`.ics` instead.

**With nothing configured this is inert**: every call logs what it would have
done and the booking is unaffected. `/admin` shows a badge telling staff which
state they're in.

### Setup (about 10 minutes, once)

1. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project and enable the **Google Calendar API**.
2. Create a **service account** and download a **JSON key**. No OAuth consent
   screen is needed — see the note below for why this matters.
3. In Google Calendar, create a calendar for the shop (e.g. _The Corner — Lịch
   hẹn_). Under its settings → **Share with specific people**, add the service
   account's `…@….iam.gserviceaccount.com` address with
   **"Make changes to events"**.
4. From the same settings page, copy the **Calendar ID** (_Integrate calendar_
   section).
5. Fill in `.env.local`:

   ```bash
   GOOGLE_SERVICE_ACCOUNT_EMAIL="the-corner@your-project.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CALENDAR_ID="abc123@group.calendar.google.com"
   ```

   Take `GOOGLE_PRIVATE_KEY` from the `private_key` field of the JSON key,
   keeping the `\n` escapes on one line.

6. Restart the dev server and confirm a booking. The badge in `/admin` should
   read **"đang bật"** and the event should appear on the calendar.

### Why a service account and not "Sign in with Google"

An OAuth app whose consent screen is still in **Testing** publishing status is
issued refresh tokens that **expire after seven days**. An OAuth integration
here would work for a week and then silently stop, and the only fixes are
re-authorising every week or putting the app through Google's verification
review. A service account has no such expiry, no consent screen and no user
login.

### Still to verify

Whether the owner's phone reliably raises a notification for events _created by
the service account_ on their shared calendar. Each event sets explicit
`reminders.overrides` (60 and 10 minutes before) rather than relying on the
calendar's defaults, which should cover it — but this has not been tested
against a real Google account, only against the unconfigured code path.

## Using the admin

`/admin` is disabled on the deployed site because it has no login. That does
not mean the shop cannot use it — the admin is an ordinary page, and the
database it reads is reachable from anywhere with the credentials. Run it on
your machine against the live database:

```bash
# .env.turso — gitignored, and Vercel will not give you the token:
# variables marked Sensitive there pull back as empty strings.
DATABASE_URL="libsql://<db>-<org>.turso.io"
DATABASE_AUTH_TOKEN="<from: turso db tokens create the-corner>"
```

```bash
bun run admin:local     # → http://localhost:3000/admin
```

Changes made there are live: confirming a booking confirms the real one, and
editing a price edits the real price. The script refuses to start against a
local file or with an empty token, so it cannot quietly edit the wrong
database.

To put the admin on the public site instead, it needs real authentication
first — see below.

## ⚠️ `/admin` has no authentication

It was scoped as a local-only tool. The route 404s in production unless
`ADMIN_ENABLED=true` is set, and a red banner appears if it ever is. **Add real
authentication before exposing it** — it lists every customer's name and phone
number.

## Going to production

1. Create a Turso database and set `DATABASE_URL` / `DATABASE_AUTH_TOKEN`. No
   code changes — the same libSQL client handles both.

   **Do not deploy with `DATABASE_URL="file:…"` still set.** Vercel's runtime
   filesystem is ephemeral, so a file-backed database would come back empty on
   every deploy and every cold start.

   Run the migrations against it once, from your machine. Keep the credentials
   in a file rather than inline, so the token stays out of your shell history:

   ```bash
   # .env.turso — gitignored by the .env* rule
   DATABASE_URL="libsql://…"
   DATABASE_AUTH_TOKEN="…"
   ```

   ```bash
   set -a; source .env.turso; set +a
   bun run db:migrate
   bun run db:seed --force
   rm .env.turso
   ```

   Exported variables win over `.env.local`, so this reliably targets Turso and
   not the local file.

   **Do not expect `vercel env pull` to supply the token.** Variables marked
   *Sensitive* in Vercel are write-only — the pull returns them as empty
   strings, and an empty `DATABASE_AUTH_TOKEN` sends no auth header at all, so
   Turso answers `HTTP 401` and the failure looks like a bad token rather than
   a missing one. Paste the token from Turso into the file yourself.

   `db:migrate` is idempotent — it records what it has applied in `_migrations`
   and re-running is a no-op, so repeat it after every release that adds one.
   `db:seed` is **not** safe to repeat: it upserts, so it reverts service names,
   prices, barber names and opening hours to the values in `src/lib/shop.ts`,
   discarding anything edited in `/admin`. Bookings are never touched. It
   refuses to run against a remote database unless you pass `--force`, which is
   why the first-time command above needs it.

2. Set `NEXT_PUBLIC_SITE_URL` so Open Graph URLs resolve.
3. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for staff alerts. Without
   them, new bookings are only logged to the server console.
4. Set the three `GOOGLE_*` variables above if you want confirmed bookings on
   the shop's calendar.
5. Leave `ADMIN_ENABLED` unset until `/admin` has a login.
