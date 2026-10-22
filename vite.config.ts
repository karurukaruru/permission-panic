import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { allowedHosts: ["terminal.local"] },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
