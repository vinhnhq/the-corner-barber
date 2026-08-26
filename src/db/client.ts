import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";
import type { Database } from "./schema";

/**
 * The Kysely instance over libSQL, created on first use.
 *
 * Locally `DATABASE_URL` is `file:./data/corner.db`, which is a plain SQLite
 * file. The same client talks to a hosted Turso database when the URL becomes
 * `libsql://…` and `DATABASE_AUTH_TOKEN` is set, so moving off the local file
 * is a change of environment variables and nothing else.
 *
 * This is a function rather than an exported instance, and deliberately so.
 * Building the client at module scope opened the connection as soon as anything
 * imported this file, which made `next build` fail whenever the database was
 * unreachable — before a route's own guards could run, and on a machine that
 * may have no database at all.
 *
 * A proxy that connected lazily behind a plain `db` export was tried first and
 * abandoned: Kysely keeps its state in private class fields, so methods have to
 * be bound to the real instance, and binding destroys callable helpers like
 * `db.fn`, which carries its own methods. An explicit accessor has none of
 * those edges.
 */
const globalForDb = globalThis as unknown as { __cornerDb?: Kysely<Database> };

export function getDb(): Kysely<Database> {
  // Reused across hot reloads so dev does not leak a connection per edit.
  globalForDb.__cornerDb ??= new Kysely<Database>({
    dialect: new LibsqlDialect({
      url: process.env.DATABASE_URL ?? "file:./data/corner.db",
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    }),
  });

  return globalForDb.__cornerDb;
}

/** ISO-8601 UTC, the format every timestamp column stores. */
export function now(): string {
  return new Date().toISOString();
}
