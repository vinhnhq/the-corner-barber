# The Corner Barbershop — build plan & status

Landing page + booking requests for a classic barbershop in Ho Chi Minh City.
Dark olive / brass, Vietnamese-first with an English toggle.

All six phases are built and verified locally. What follows is the record of
what was decided, what shipped, and what is still open.

## Decisions

| Area      | Decision                                                                 |
| --------- | ------------------------------------------------------------------------ |
| Framework | Next.js 16.3.2 App Router, RSC-first, React 19.2, React Compiler on      |
| Styling   | Tailwind v4 + shadcn/ui (radix · maia), custom olive/brass token set     |
| Motion    | CSS scroll-driven animation. No JS animation library — see below         |
| Type      | Cinzel = brand lockup only · Cormorant = headings · Be Vietnam = UI      |
| Data      | SQLite via `@libsql/client` at `file:./data/corner.db`; Kysely on top    |
| Auth      | **None.** `/admin` is open; 404s in production unless `ADMIN_ENABLED`    |
| Content   | Real menu, address and phone, read off the shop's own signage            |
| Booking   | Request → `pending` → staff confirm in admin (no live availability)      |
| Notify    | Telegram bot, env-gated; logs to console when unconfigured               |
| Calendar  | Confirmed bookings → shop's Google Calendar (service account, env-gated) |
| i18n      | VI (default) + EN, cookie-based, server-rendered dictionaries            |
| Theme     | Dark only. Near-black olive, deep olive panels, brass, cream serif       |
| Deploy    | Local only. Vercel-ready (swap the libSQL url for Turso)                 |

## What shipped

### Phase 0 — scaffold

Next 16 + Tailwind v4 + shadcn + zod + libSQL/Kysely, oxlint + oxfmt, React
Compiler. Layout mirrors `infinite-oneness`: `src/app`, `src/components`,
`src/lib`, `src/db`.

### Phase 1 — assets

All 286 source frames reviewed via generated contact sheets
(`bun run assets:sheets` → `scratch/sheets/`). 34 picked into
`scripts/photos.manifest.ts`, encoded to `public/photos/` at 2400px, **13 MB
total**, each with intrinsic dimensions and a base64 LQIP in the generated
`src/lib/photos.ts`.

Hero loop cut from `P7250705.MOV` — 4.8s of a barber working at the mirror
station, 1280×720 H.264, 4.6 MB, with a poster frame.

### Phase 2 — design system

oklch token set in `globals.css` (brass / olive / sage / wood / cream on top of
the shadcn set). Three type roles, and the split between them matters:

- **Cinzel** (`.wordmark`) — the engraved brand lockup, and nothing else.
- **Cormorant Garamond** — headings.
- **Be Vietnam Pro** (`.label`, body) — interface copy and body text.

`brass-rule`, `panel`, `grain`, `vignette` primitives.

### Phase 3 — landing

Hero (video) · Services · Gallery (lightbox) · Barbers · About · Visit ·
Booking · Footer. Server Components throughout; the only client components are
the header, locale switcher, hero video, gallery lightbox and booking form.

### Phase 4 — i18n

`src/lib/i18n/dictionaries.ts` with a hand-written `Dictionary` type both
languages must satisfy, so a missing translation is a compile error. Locale in
a cookie, set by a Server Action, rendered on the server. No client i18n
runtime, no locale route segments.

### Phase 5 — data + booking

Tables: `services`, `barbers`, `bookings`, `shop_settings`, `gallery_photos`.
Booking form → Server Action → zod → `pending` row → Telegram notify. Honeypot
field and a 5-minute per-phone rate limit. Phone numbers normalised to `0…`
form so `+84`/`84`/`0` spellings are one customer.

### Phase 7 — Google Calendar

Confirming a booking creates an event on the shop's calendar; rescheduling
moves it; cancelling or reopening deletes it. `syncCalendar(id)` reconciles
rather than reacting to individual transitions, so the calendar converges on
"exactly one event iff confirmed" no matter what order staff press things in.
`bookings.google_event_id` links the two.

Auth is a service account sharing the shop's calendar, **not** OAuth: an OAuth
app in "Testing" publishing status is issued refresh tokens that expire after
seven days, so it would break weekly until the app passed Google's verification
review.

Customers cannot be written to, so the success screen offers a prefilled Google
template URL and a browser-generated `.ics` instead — no endpoint exposes a
booking by id.

Times use a fixed UTC+7 offset. Vietnam has observed no daylight saving since
1975, so that is exact here rather than an approximation — it would not be safe
elsewhere.

### Phase 8 — slot availability

The time select greys out what is already taken, checked against the shop's own
`bookings` table rather than the Google Calendar — the calendar is a mirror
written after staff confirm, so it lags by design and would miss every request
still awaiting a decision.

A slot goes when the whole shop is full (as many overlapping bookings as there
are barbers) or when the specific barber asked for is busy. Pending requests
count: a slot someone asked for twenty minutes ago is not free just because
nobody has pressed confirm yet. Past times on today's date drop out too.

The lookup fails open — if it errors, every slot stays offerable. Staff vet
every request anyway, so a lookup problem must not stop someone asking.

### Phase 9 — deployment hardening

Live at <https://the-corner-barber.vercel.app>, database on Turso.

`/admin` is reachable in production behind HTTP Basic auth (`src/proxy.ts`),
which matches `/admin` alone and leaves the public pages untouched. Production
requires the opt-in **and** a password: either alone returns 404, so
`ADMIN_ENABLED` can no longer expose customer data by itself. `bun run
admin:local` remains the alternative — the admin on your machine against the
production database, with no public exposure at all.

The booking form no longer uses `<input type="date">`. The native control
renders no calendar indicator on iOS Safari, so it read as a dead text box
beside the fields that had one; it is a list of the next 30 days instead,
generated on the server so the labels cannot differ between renders.

### Phase 6 — admin

`/admin`: bookings with confirm / reschedule / done / cancel, plus editable
services, barbers, opening hours and gallery selection. Every action re-checks
the gate — Server Actions are their own endpoints and can be called without
rendering the page.

## Notes on things that went differently

**Scroll reveals are CSS, not JavaScript.** The first implementation used
Motion's `whileInView`. It left 31 elements stuck at `opacity: 0` — an
`IntersectionObserver` on this page never fires after mount. Rather than debug
the observer, the reveal was rewritten as `animation-timeline: view()`: the
content is visible by default and the hidden state exists only inside an
`@supports` + `prefers-reduced-motion: no-preference` block, so a browser
without support simply shows the page. The `motion` dependency was removed.

**The lightbox is portalled to `<body>`.** An ancestor with a `transform` —
which the scroll reveal applies while animating — becomes the containing block
for the top layer, so a `<dialog>` nested inside one is composited into that
subtree and inherits its opacity.

**Booking rows are mapped to plain objects.** The driver's row objects are not
plain, and React rejects them when they cross into a Client Component.

**Cinzel cannot set Vietnamese.** It publishes `latin` and `latin-ext` only —
measuring `ỆỊỤỖƯĐ` against a fallback face shows identical widths, i.e. the
font has none of those glyphs. It was initially used for all small tracked caps
(nav, eyebrows, field labels), so every diacritic fell through to a fallback
mid-word. Interface copy moved to `.label` on Be Vietnam Pro; Cinzel is now
reserved for the Latin brand lockup. The rendered DOM was audited on both `/`
and `/admin` for any element carrying Vietnamese text while resolving to
Cinzel — zero remain.

**The supplied icon could not be used as delivered.** The export was a black
silhouette on transparency, which disappears against a dark browser tab strip
and — because iOS flattens `apple-touch-icon` onto black — would have produced a
black-on-black home-screen icon. `scripts/process-icons.ts` recolours it to
brass on the site's olive ground and emits three shapes, because the platforms
mask differently: rounded for browsers, hard square for iOS (which applies its
own squircle), and a padded square for Android maskable icons, which get cropped
to the launcher's shape. The generator's `site.webmanifest` was replaced by a
typed `src/app/manifest.ts` — the original shipped an empty `name` and a white
`theme_color` on a near-black site.

**The language switch cross-fades.** Swapping locale is a server round-trip that
changes every string in one commit, which read as a hard flicker. The switcher
mirrors its pending state onto `<html data-locale-switching>` and CSS dips the
page, settling back as the new copy lands. It fades as one piece: `opacity`
applies to the whole subtree, so nothing inside can be held out of it.

## Known gaps

- **`/admin` has no authentication.** Safe locally; it 404s in production
  unless `ADMIN_ENABLED=true` is set explicitly. Add real auth before ever
  turning that on.
- **`/admin` has no user accounts.** Basic auth is a shared password: no
  sessions, and no way to revoke one person without changing it for everyone.
  Real login is the next planned piece of work.
- **Bookings can only be made 30 days ahead**, a consequence of replacing the
  native date input. Raise `BOOKABLE_DAYS` in `src/lib/slots.ts` if the shop
  ever needs a longer horizon.
- **Calendar notifications are still unverified** against a live Google
  account — only the unconfigured code path has been exercised.
- **No WebM/AV1 for the hero loop** — `ffmpeg` is not installed on this machine,
  so `avconvert` produced H.264 only. The clip is 4.6 MB and is therefore only
  fetched on viewports ≥768px, with no reduced-motion preference and no
  `saveData` hint; everyone else gets the poster still.
- **Opening hours are a guess** (`TODO(content)` in `src/lib/shop.ts`) — the
  price board does not list them.
- **Barber names are placeholders** — "Thợ 1/2/3", renameable in `/admin`.
- **No social links, no domain.**
- **Calendar notifications are unverified against a real Google account.** The
  code paths were exercised only in their unconfigured form (logging what they
  would send). Whether the owner's phone raises a notification for events
  _authored by the service account_ on a shared calendar still needs a live
  test; events set explicit `reminders.overrides` rather than trusting the
  calendar's defaults, which should cover it.

## Content taken from the photos

The service menu, prices, address and phone were transcribed from the shop's own
price board (`P7250600.JPG`) and street signboard (`P7250619.JPG`):

- **206 Võ Thị Đặng, Phường Tân Mỹ, TP. Hồ Chí Minh** · **0889 775 088** · EST. 2026
- The price board writes the older street name, "206 Đường số 9, Tân Mỹ".
- The signboard reads "BARBER SHOP", the interior sign "BARBERSHOP".

## Retrospective

Six things went wrong that were only ever going to be caught by looking, not by
reading the diff. They are recorded because each represents a check worth
repeating, not because they were unusual.

**A green build proves less than it appears to.** `typecheck`, `lint` and
`build` were clean while the repo was unbuildable from a fresh clone —
`@hugeicons` was imported by six components and absent from `package.json`,
surviving only in a stale `node_modules`. The same clean-clone check then
caught the database client connecting at module scope, which would have failed
the first Vercel build before the Turso variables existed. Cloning HEAD and
building it is the only honest definition of "it builds".

**Verify in the medium the user sees.** Cinzel has no Vietnamese subset at all
— measuring `ỆỊỤỖƯĐ` against a fallback face showed identical widths — so every
diacritic in the navigation fell through mid-word. The comment directly above
that font said "never for Vietnamese copy", and it was then used for exactly
that. Nothing automated noticed.

**Mobile needed a different technique, not a promise to check later.** The
automation viewport would not resize, and "unverified" was carried in the gaps
list for three rounds. Rendering the page in a 390px `<iframe>` — where media
queries evaluate against the iframe's box — worked immediately and found a
gallery tile rendering 346×12px on phones, invisible the whole time.

**Elegance is not a design goal.** A lazy `Proxy` around the database client
looked clean and could not be made correct: Kysely keeps state in private class
fields, so methods must be bound to the real instance, and binding destroys
callable helpers that carry their own methods. Fixing ``sql`…`.execute(db)``
broke `db.fn.countAll()` in the same edit. An explicit `getDb()` has none of
those edges.

**Fail closed, and test that it does.** `.env.example` shipped
`ADMIN_ENABLED="true"`, so copying it into Vercel — the obvious move — switched
on an admin with no login that lists every customer's phone number. The gate
now needs two independent things, and the matrix was tested against a real
production build. One of those tests was itself invalid: `.env.local` leaked a
value into the run and made a case pass for the wrong reason.

**Read the failure, not the symptom.** Turso answered `HTTP 401`, which reads
as a rejected token. The token was empty — `vercel env pull` returns variables
marked _Sensitive_ as empty strings, and an empty token sends no auth header at
all. Vinh found that one.
