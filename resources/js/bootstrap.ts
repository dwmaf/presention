/**
 * ============================================================================
 * File        : bootstrap.ts
 * Layer       : Infrastructure
 *
 * Description:
 * Menginisialisasi Axios dan mengonfigurasi header HTTP default.
 * ============================================================================
 */

import axios from "axios";

// * Memaksa Axios untuk mengenali dirinya sebagai properti window
window.axios = axios;

// * Setel header default untuk semua request HTTP
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
