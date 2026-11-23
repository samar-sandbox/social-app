import react from "@vitejs/plugin-react";
import { build, defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs/promises";

const SW_NAME = "firebase-messaging-sw.js";

// Service workers can't resolve bare imports, so bundle it into a single
// classic script served at the site root (where FCM looks for it).
function firebaseMessagingSw() {
  let resolved;

  const bundle = async () => {
    const result = await build({
      configFile: false,
      logLevel: "silent",
      mode: resolved.mode,
      envDir: resolved.envDir,
      define: { "process.env.NODE_ENV": JSON.stringify(resolved.mode) },
      build: {
        write: false,
        minify: resolved.mode === "production",
        lib: {
          entry: path.resolve(import.meta.dirname, "src", SW_NAME),
          name: "firebaseMessagingSw",
          formats: ["iife"],
          fileName: () => SW_NAME,
        },
      },
    });

    const { output } = Array.isArray(result) ? result[0] : result;

    return output[0].code;
  };

  return {
    name: "firebase-messaging-sw",
    configResolved(config) {
      resolved = config;
    },
    configureServer(server) {
      server.middlewares.use(`/${SW_NAME}`, async (_req, res, next) => {
        try {
          res.setHeader("Content-Type", "text/javascript");
          res.setHeader("Service-Worker-Allowed", "/");
          res.end(await bundle());
        } catch (err) {
          next(err);
        }
      });
    },
    async writeBundle() {
      const outDir = path.resolve(resolved.root, resolved.build.outDir);
      await fs.writeFile(path.join(outDir, SW_NAME), await bundle());
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), firebaseMessagingSw()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
});
