import { defineMiddleware } from "astro:middleware";
import { BASIC_AUTH_PASSWORD, BASIC_AUTH_USER } from "astro:env/server";

// Basic Auth for the homolog deploy: active only when both env vars are set on Vercel
// (which also switches the build to `output: "server"`, see astro.config.mjs).
export const onRequest = defineMiddleware(async (context, next) => {
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD || context.isPrerendered) return next();

  // CMS OAuth endpoints (popup + GitHub redirect) expose no content.
  if (context.url.pathname.startsWith("/api/")) return next();

  const expected = "Basic " + btoa(`${BASIC_AUTH_USER}:${BASIC_AUTH_PASSWORD}`);
  const response =
    context.request.headers.get("authorization") === expected
      ? await next()
      : new Response("Acesso restrito.", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Umzé homolog", charset="UTF-8"' },
        });

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
});
