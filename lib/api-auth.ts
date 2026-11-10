import { auth } from "./auth";

/**
 * Resolves the acting user from either:
 *  - a per-user agent API key: `Authorization: Bearer <key>`
 *  - the dashboard session cookie
 */
export async function getUserId(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const key = header.slice(7).trim();
    if (!key) return null;
    const result = await auth.api.verifyApiKey({ body: { key } });
    const owner = result.valid
      ? (result.key as { referenceId?: string; userId?: string } | null)
      : null;
    return owner?.referenceId ?? owner?.userId ?? null;
  }

  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

export function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
