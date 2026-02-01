import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/sun.github.io/", // ⚠️ NOM EXACT DE TON REPO
});
