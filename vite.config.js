// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy"; // Use a copy plugin
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy manifest.json and icons to the dist folder
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".", // Copies to the root of the dist folder
        },
        {
          src: "public/icons",
          dest: ".", // Copies the icons folder to the root of the dist folder
        },
        // You might need to explicitly copy scripts if they aren't bundled
        // or handled via manifest references relative to the project root
        // But usually, referencing them in manifest.json as src/... works with Vite build
        {
          src: "src/background/background.js",
          dest: "src/background", // Keep original structure for manifest reference
        },
        {
          src: "src/content/content.js",
          dest: "src/content", // Keep original structure for manifest reference
        },
      ],
    }),
  ],
  build: {
    outDir: "dist", // Standard output directory
    emptyOutDir: true, // Clean the dist folder before building
    rollupOptions: {
      // Define the entry point for the React app (popup/side panel)
      input: {
        main: path.resolve(__dirname, "index.html"),
        // Vite automatically handles JS referenced in index.html
        // Background and Content scripts are handled by copying above
        // and referenced in manifest.json
      },
      output: {
        // Ensure consistent naming, especially if not hashing filenames
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  // Optional: Resolve aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
