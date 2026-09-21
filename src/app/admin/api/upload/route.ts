import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminEnabled } from "@/lib/admin";

/**
 * Token endpoint for client uploads to Vercel Blob.
 *
 * The phone sends the (already optimised) file straight to Blob; this route
 * only mints the short-lived token that allows it, so nothing large ever
 * passes through a function. It sits under `/admin`, so the same Basic auth
 * that guards the staff screens guards it (`src/proxy.ts`), and the
 * page-level flag is re-checked here because the proxy alone is not the
 * guarantee — see `src/lib/admin.ts`.
 *
 * The row in `media` is written afterwards by a server action, not by the
 * `onUploadCompleted` webhook: the webhook cannot reach a dev machine, and a
 * row that arrives with its width, blur and poster in one call is simpler
 * than one that is filled in later.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isAdminEnabled()) return new NextResponse(null, { status: 404 });

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: [
          "image/jpeg",
          "image/webp",
          "image/png",
          "video/mp4",
          "video/quicktime",
        ],
        // A phone clip that could not be transcoded is uploaded as-is; this
        // is the ceiling for that case, well above anything optimised.
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
        tokenPayload: pathname,
      }),
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "upload failed" },
      { status: 400 },
    );
  }
}
