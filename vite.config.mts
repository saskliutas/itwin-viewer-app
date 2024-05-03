import { defineConfig, loadEnv } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            // copy assets from `@itwin` dependencies
            src: "./node_modules/@itwin/*/lib/public/*",
            dest: ".",
          },
        ],
      }),
    ],
    server: {
      port: 3000,
      strictPort: true,
    },
    envPrefix: "IMJS_",
    define: {
      "process.env.IMJS_URL_PREFIX": JSON.stringify(env.IMJS_URL_PREFIX),
    },
    resolve: {
      alias: [
        {
          // Resolve SASS tilde imports.
          find: /^~(.*)$/,
          replacement: "$1",
        },
      ],
    },
  };
});
