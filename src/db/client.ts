import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";
import type { Database } from "./schema";

/**
 * One Kysely instance over libSQL, connected lazily.
 *
 * Locally `DATABASE_URL` is `file:./data/corner.db`, which is a plain SQLite
 * file. The same client talks to a hosted Turso database when the URL becomes
 * `libsql://…` and `DATABASE_AUTH_TOKEN` is set, so moving off the local file
 * is a change of environment variables and nothing else.
 *
 * The laziness matters. Building the client at module scope opens the
 * connection the moment anything imports this file, which made `next build`
 * fail outright whenever the database was unreachable — before a route's own
 * guards could run, and on a machine that may have no database at all. The
 * proxy defers construction to the first query, so importing is free and the
 * build only needs a database if it actually reads one.
 */
const globalForDb = globalThis as unknown as { __cornerDb?: Kysely<Database> };

function connect(): Kysely<Database> {
  const url = process.env.DATABASE_URL ?? "file:./data/corner.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

  return new Kysely<Database>({ dialect: new LibsqlDialect({ url, authToken }) });
}

function instance(): Kysely<Database> {
  // Reused across hot reloads so dev does not leak a connection per edit.
  globalForDb.__cornerDb ??= connect();
  return globalForDb.__cornerDb;
}

export const db = new Proxy({} as Kysely<Database>, {
  get(_target, property) {
    const real = instance();
    const value = Reflect.get(real, property, real) as unknown;

    // Methods must be bound to the real instance. Kysely holds its state in
    // private class fields, and those are unreachable when `this` is the proxy
    // — Kysely hands the connection around internally (`sql`.execute(db)` calls
    // `db.getExecutor()`), so an unbound method throws on the first query.
    return typeof value === "function" ? value.bind(real) : value;
  },
  has(_target, property) {
    return Reflect.has(instance(), property);
  },
}) satisfies Kysely<Database>;

/** ISO-8601 UTC, the format every timestamp column stores. */
export function now(): string {
  return new Date().toISOString();
}
