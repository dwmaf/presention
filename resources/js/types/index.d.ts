/**
 * ============================================================================
 * File        : index.d.ts
 * Layer       : Types
 *
 * Description:
 * Definisi tipe global dan modul untuk integrasi TypeScript.
 * ============================================================================
 */

import { PageProps as InertiaPageProps } from "@inertiajs/react";
import { AxiosInstance } from "axios";

export interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export interface Auth {
    user: AuthUser;
}

/**
 * Tipe Halaman Inertia dengan data autentikasi bawaan.
 */
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = InertiaPageProps &
    T & {
        auth: Auth;
    };

/** Parameter rute yang valid untuk helper Ziggy. */
export type RouteParams =
    | string
    | number
    | boolean
    | (string | number | boolean)[]
    | Record<
          string,
          string | number | boolean | (string | number | boolean)[] | undefined
      >
    | undefined;

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    // * Deklarasi helper global route (Ziggy) tanpa menggunakan `any`.
    function route(
        name?: string,
        params?: RouteParams,
        absolute?: boolean,
        config?: Record<string, unknown>,
    ): string & { current: (name?: string, params?: RouteParams) => boolean };
}

declare module "@inertiajs/react" {
    interface PageProps extends InertiaPageProps {
        auth: Auth;
    }
}
