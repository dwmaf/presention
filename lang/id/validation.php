<?php
    /**
     * ============================================================================
     * File        : validation.php
     * Layer       : Translation (id)
     *
     * Description:
     * Pesan kesalahan validasi input dalam Bahasa Indonesia.
     * ============================================================================
     */

    return [
        'required' => 'Kolom :attribute wajib diisi.',
        'email' => 'Kolom :attribute harus berupa alamat email yang valid.',

        /*
        |--------------------------------------------------------------------------
        | Custom Validation Attributes
        |--------------------------------------------------------------------------
        */
        'attributes' => [
            'email' => 'email',
            'password' => 'password',
        ],
    ];