import type { APIRoute } from "astro";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "astro:env/server";
import { STATE_COOKIE } from "./auth";

export const prerender = false;

// Decap/Sveltia popup handshake: tell the opener we're ready, then send the
// result only to a window on this site's origin (never "*": it carries the token).
const renderResult = (origin: string, status: "success" | "error", content: object) => {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const toJs = (value: string) => JSON.stringify(value).replaceAll("<", "\\u003c");
  const html = `<!doctype html><html><body><script>
(() => {
  const origin = ${toJs(origin)};
  const message = ${toJs(message)};
  window.addEventListener("message", (event) => {
    if (event.origin === origin && event.data === "authorizing:github") {
      window.opener?.postMessage(message, origin);
    }
  });
  window.opener?.postMessage("authorizing:github", origin);
})();
</script></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export const GET: APIRoute = async ({ url, cookies }) => {
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = cookies.get(STATE_COOKIE)?.value;

  cookies.delete(STATE_COOKIE, { path: "/api" });

  if (!code || !state || state !== expectedState) {
    return renderResult(origin, "error", { error: "Invalid OAuth state. Tente entrar novamente." });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return renderResult(origin, "error", { error: "OAuth do GitHub não configurado no servidor." });
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL("/api/callback", url).href,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    return renderResult(origin, "error", {
      error: data.error_description ?? "Falha ao obter token do GitHub.",
    });
  }

  return renderResult(origin, "success", { token: data.access_token, provider: "github" });
};
