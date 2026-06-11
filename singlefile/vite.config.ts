import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

/**
 * Single-File-Build der TIPS-26-App.
 *
 *   npm --prefix singlefile run build
 *   → singlefile/dist/index.html (∼500-800 KB, alles inline)
 *
 * Die Datei lässt sich überall per file://-Doppelklick öffnen — kein Server,
 * keine Workers-from-disk-Probleme (Workers werden zu Blob-URLs).
 *
 * Re-nutzt die Algorithmen + Daten aus ../frontend/lib/ direkt (keine
 * Duplikation). Die UI ist eigenständig: kein Next.js, kein Tailwind,
 * stattdessen klassisches React + handgeschriebene CSS.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: [
      // Die Reihenfolge zählt — speziellere Aliases ZUERST, damit
      // "@/lib" greift bevor "@" den Pfad einfängt.
      { find: "@lib", replacement: path.resolve(__dirname, "../frontend/lib") },
      { find: "@/lib", replacement: path.resolve(__dirname, "../frontend/lib") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  build: {
    target: "es2020",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  worker: {
    format: "es",
  },
});
