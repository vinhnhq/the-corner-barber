import "server-only";
import { notFound } from "next/navigation";

/**
 * `/admin` has NO authentication — it was scoped as a local-only tool.
 *
 * That is safe on a laptop and unsafe anywhere else, so the route is gated on
 * an explicit opt-in that defaults to development only. Deploying without
 * setting `ADMIN_ENABLED` makes the whole section 404 rather than quietly
 * exposing every customer's phone number.
 *
 * Anyone turning this on in production must add real auth first.
 */
export function assertAdminEnabled(): void {
  const explicit = process.env.ADMIN_ENABLED;
  const enabled =
    explicit === undefined ? process.env.NODE_ENV !== "production" : explicit === "true";

  if (!enabled) notFound();
}

export function adminIsProductionExposed(): boolean {
  return process.env.NODE_ENV === "production" && process.env.ADMIN_ENABLED === "true";
}
