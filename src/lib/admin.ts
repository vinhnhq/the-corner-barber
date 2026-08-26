import "server-only";
import { notFound } from "next/navigation";

/**
 * `/admin` has no user accounts. On a deployed site it is protected by HTTP
 * Basic auth in `src/proxy.ts`, which is enough for a single operator over
 * HTTPS but is not real authentication: no sessions, and no way to revoke one
 * person without changing the password for everyone.
 *
 * Locally it is simply open — the database is a throwaway file.
 *
 * The production gate deliberately needs two things, not one. Enabling the
 * section is an explicit opt-in AND a password must exist, so setting
 * `ADMIN_ENABLED=true` on its own can never publish every customer's name and
 * phone number. That combination has already been got wrong once.
 */
function passwordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function assertAdminEnabled(): void {
  // An empty value counts as unset. `.env.example` ships these keys blank so
  // that copying the file into a production environment cannot switch the admin
  // on, and treating "" as "explicitly set" would instead disable the admin for
  // everyone working locally.
  const explicit = process.env.ADMIN_ENABLED || undefined;

  if (process.env.NODE_ENV !== "production") {
    // Development: on unless deliberately switched off.
    if (explicit === "false") notFound();
    return;
  }

  if (explicit !== "true" || !passwordConfigured()) notFound();
}

/**
 * True when the admin is reachable on a deployed site with nothing but Basic
 * auth in front of it. The layout shows a banner so staff are reminded that
 * this is a shared password, not a login.
 */
export function adminIsProductionExposed(): boolean {
  return process.env.NODE_ENV === "production" && process.env.ADMIN_ENABLED === "true";
}
