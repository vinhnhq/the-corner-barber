import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";
import type { Database } from "./schema";

/**
 * One Kysely instance over libSQL.
 *
 * Locally `DATABASE_URL` is `file:./data/corner.db`, which is a plain SQLite
 * file. The same client talks to a hosted Turso database when the URL becomes
 * `libsql://…` and `DATABASE_AUTH_TOKEN` is set, so moving off the local file
 * is a change of environment variables and nothing else.
 */
const url = process.env.DATABASE_URL ?? "file:./data/corner.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

/** Reused across hot reloads so dev does not leak a connection per edit. */
const globalForDb = globalThis as unknown as { __cornerDb?: Kysely<Database> };

export const db: Kysely<Database> =
  globalForDb.__cornerDb ??
  new Kysely<Database>({ dialect: new LibsqlDialect({ url, authToken }) });

if (process.env.NODE_ENV !== "production") globalForDb.__cornerDb = db;

/** ISO-8601 UTC, the format every timestamp column stores. */
export function now(): string {
  return new Date().toISOString();
}
