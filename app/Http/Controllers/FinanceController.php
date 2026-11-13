<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Tampilkan halaman utama Keuangan & Catatan Kas UMKM
     */
    public function index(): Response
    {
        return Inertia::render('Finance/Index');
    }
}
