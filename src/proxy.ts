/**
 * Edge middleware (Next.js 16 names the file `proxy.ts`, the export `proxy`).
 *
 * One responsibility: put HTTP Basic auth in front of `/admin`, so the staff
 * screens can be reached on the deployed site without being open to the world.
 *
 * This is not a replacement for real authentication — there are no accounts, no
 * sessions and no way to revoke one person's access without changing the
 * password for everybody. It is the smallest honest thing that makes a
 * single-operator admin safe to expose over HTTPS, and it buys time until
 * proper login exists.
 *
 * It fails closed. With no `ADMIN_PASSWORD` set this does nothing, and the
 * page-level guard in `src/lib/admin.ts` keeps returning 404 in production —
 * so forgetting the password cannot leave the admin open, it only leaves it
 * unreachable.
 */

import { type NextRequest, NextResponse } from "next/server";

/**
 * ASCII only. Header values are ByteStrings, so a non-Latin-1 character here —
 * an em dash or a Vietnamese diacritic — throws when the response is built,
 * turning every rejection into a 500 instead of an auth prompt. The
 * `charset` parameter still tells the browser to send the credentials
 * themselves as UTF-8.
 */
const REALM = "The Corner Admin";

/**
 * Compares via SHA-256 digests rather than the raw strings.
 *
 * A plain character loop leaks the length of the secret through timing, and
 * bailing early on the first mismatch leaks how much of a guess was correct.
 * Hashing first makes both inputs the same fixed size, and the digest
 * comparison then runs over every byte regardless of where it first differs.
 */
async function matches(candidate: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);

  const left = new Uint8Array(a);
  const right = new Uint8Array(b);

  let difference = 0;
  for (const [index, byte] of left.entries()) difference |= byte ^ right[index];
  return difference === 0;
}

function challenge(): NextResponse {
  return new NextResponse("Cần đăng nhập.", {
    status: 401,
    headers: {
      "www-authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      // Never let a proxy or the browser cache an admin response.
      "cache-control": "no-store",
    },
  });
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const expected = process.env.ADMIN_PASSWORD;

  // Unset means the admin is not meant to be reachable here at all; let the
  // page's own guard answer, which is a 404 in production.
  if (!expected) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return challenge();

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return challenge();
  }

  // Only the first colon separates the two — passwords may contain colons.
  const separator = decoded.indexOf(":");
  if (separator === -1) return challenge();

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  const expectedUser = process.env.ADMIN_USER || "admin";

  // Both are always checked, so a wrong username costs the same as a wrong
  // password and neither can be probed independently.
  const [userOk, passwordOk] = await Promise.all([
    matches(user, expectedUser),
    matches(password, expected),
  ]);

  if (!userOk || !passwordOk) return challenge();

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
