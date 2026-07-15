/**
 * ============================================================================
 * File        : app.tsx
 * Layer       : Entrypoint
 *
 * Description:
 * Titik masuk utama aplikasi Inertia.js React menggunakan TypeScript.
 * ============================================================================
 */

import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";

const appName = (import.meta.env.VITE_APP_NAME as string) || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // * Mendukung file .jsx dan .tsx saat masa transisi
        const pages = import.meta.glob("./Pages/**/*.{jsx,tsx}");
        return resolvePageComponent(`./Pages/${name}.tsx`, pages).catch(() =>
            resolvePageComponent(`./Pages/${name}.jsx`, pages),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <TooltipProvider>
                <App {...props} />
                <Toaster />
            </TooltipProvider>,
        );
    },
    progress: {
        color: "#4B5563",
    },
});
