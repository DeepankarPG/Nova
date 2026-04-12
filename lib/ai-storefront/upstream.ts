/**
 * Optional forward to merchant API. When `PAYGLOCAL_MERCHANT_API_BASE` is unset,
 * route handlers use the in-memory dev store instead.
 *
 * Expected upstream base includes the path prefix for storefront APIs, e.g.
 * `https://api.payglocal.example/v1/merchants/current/ai-storefront` (no trailing slash).
 * Forwarded URL = `${base}${path}` where path starts with `/overview`, `/products`, etc.
 */

const BASE = process.env.PAYGLOCAL_MERCHANT_API_BASE?.replace(/\/$/, "") ?? "";

export function isUpstreamConfigured(): boolean {
  return BASE.length > 0;
}

/**
 * Forwards the incoming request to upstream. Caller supplies path like `/products`.
 */
export async function forwardUpstream(
  request: Request,
  pathWithLeadingSlash: string,
  init?: { body?: BodyInit | null; method?: string }
): Promise<Response> {
  const url = `${BASE}${pathWithLeadingSlash}`;
  const method = init?.method ?? request.method;
  const headers = new Headers();
  const auth = request.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  const ct = request.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const body =
    init?.body !== undefined
      ? init.body
      : method === "GET" || method === "HEAD"
        ? undefined
        : await request.text();

  return fetch(url, {
    method,
    headers,
    body: body === undefined || method === "GET" || method === "HEAD" ? undefined : body,
    cache: "no-store",
  });
}
