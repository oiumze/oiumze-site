import type { APIRoute } from "astro";
import { GITHUB_CLIENT_ID } from "astro:env/server";

// Sveltia CMS opens this in a popup (`base_url` + `auth_endpoint` in public/admin/config.yml).
export const prerender = false;

export const STATE_COOKIE = "cms_oauth_state";

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  if (!GITHUB_CLIENT_ID) {
    return new Response("GITHUB_CLIENT_ID não configurado.", { status: 500 });
  }

  const state = crypto.randomUUID();

  cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/api",
    maxAge: 600,
  });

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", new URL("/api/callback", url).href);
  authorize.searchParams.set("scope", url.searchParams.get("scope") ?? "repo");
  authorize.searchParams.set("state", state);

  return redirect(authorize.href);
};
