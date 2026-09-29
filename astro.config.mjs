// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  // Static by default; only routes with `prerender = false` (CMS OAuth) run as Vercel functions.
  adapter: vercel(),
  env: {
    schema: {
      GITHUB_CLIENT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      GITHUB_CLIENT_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
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
