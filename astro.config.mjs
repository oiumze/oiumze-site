// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// Homolog Basic Auth (src/middleware.ts). Vercel serves prerendered pages straight from the CDN,
// skipping middleware, so when the credentials are set every page is rendered on demand instead.
const basicAuth = Boolean(process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD);

export default defineConfig({
  // Static by default; only routes with `prerender = false` (CMS OAuth) run as Vercel functions.
  output: basicAuth ? "server" : "static",
  adapter: vercel(),
  env: {
    schema: {
      GITHUB_CLIENT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      GITHUB_CLIENT_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
      BASIC_AUTH_USER: envField.string({ context: "server", access: "secret", optional: true }),
      BASIC_AUTH_PASSWORD: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // Project lives on /mnt/c (Windows disk under WSL2): inotify events don't cross over, so poll for changes.
    server: {
      watch: { usePolling: true, interval: 300 },
    },
  },
});
