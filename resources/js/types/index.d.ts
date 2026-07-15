/**
 * ============================================================================
 * File        : index.d.ts
 * Layer       : Types
 *
 * Description:
 * Definisi tipe global dan modul untuk integrasi TypeScript.
 * ============================================================================
 */

import { PageProps as InertiaPageProps } from "@inertiajs/core";
import { AxiosInstance } from "axios";

declare global {
    interface Window {
        axios: AxiosInstance;
    }
    // * Deklarasi helper global route (Ziggy)
    function route(
        name?: string,
        params?: any,
        absolute?: boolean,
        config?: any,
    ): any;
}

declare module "@inertiajs/core" {
    interface PageProps extends InertiaPageProps {
        // * Definisikan struktur PageProps kustom dari Laravel di sini.
    }
}
