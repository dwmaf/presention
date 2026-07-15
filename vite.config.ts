/**
 * ============================================================================
 * File        : vite.config.ts
 * Layer       : Configuration
 *
 * Description:
 * Menambahkan plugin Tailwind CSS v4 ke konfigurasi build Vite.
 * ============================================================================
 */
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.tsx",
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
});
