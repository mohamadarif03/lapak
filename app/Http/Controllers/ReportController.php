<?php

namespace App\Http\Controllers;

use App\Support\AuthHelper;
use App\Support\ReportExcelExporter;
use App\Support\ReportHelper;
use App\Support\ReportPdfExporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the financial report page.
     */
    public function index(Request $request): Response|RedirectResponse|JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return $auth;
        }

        $business = $auth['business'];

        $periode = $request->query('periode', 'bulan');
        $dari = $request->query('dari');
        $sampai = $request->query('sampai');

        $range = ReportHelper::getReportRange($periode, $dari, $sampai);
        $warning = $range['is_valid'] ? null : $range['error_message'];

        $report = ReportHelper::computeReport($business->id, $range);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'report' => $report,
                'warning' => $warning,
                'range' => [
                    'periode' => $range['periode'],
                    'label' => $range['label'],
                    'dari' => $range['start']->format('Y-m-d'),
                    'sampai' => $range['end']->format('Y-m-d'),
                    'is_valid' => $range['is_valid'],
                    'error_message' => $range['error_message'],
                    'is_monthly' => $range['is_monthly'],
                ],
            ]);
        }

        return Inertia::render('catat/laporan', [
            'report' => $report,
            'warning' => $warning,
            'range' => [
                'periode' => $range['periode'],
                'label' => $range['label'],
                'dari' => $range['start']->format('Y-m-d'),
                'sampai' => $range['end']->format('Y-m-d'),
                'is_valid' => $range['is_valid'],
                'error_message' => $range['error_message'],
                'is_monthly' => $range['is_monthly'],
            ],
            'business' => [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'owner_name' => $business->owner_name,
            ],
        ]);
    }

    /**
     * Export report to PDF or XLSX format.
     */
    public function export(Request $request): HttpResponse|JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $user = $auth['user'];
        $business = $auth['business'];

        // 1. Rate limiting: max 20 exports per hour per user
        $rateLimitKey = "report-export:user:{$user->id}";
        if (RateLimiter::tooManyAttempts($rateLimitKey, 20)) {
            return response()->json([
                'message' => 'Terlalu banyak ekspor. Coba lagi nanti.',
            ], 429);
        }
        RateLimiter::hit($rateLimitKey, 3600);

        // 2. Timeout 30 seconds
        @set_time_limit(30);

        // 3. Validate format
        $format = strtolower((string) $request->query('format', 'pdf'));
        if (! in_array($format, ['pdf', 'xlsx'], true)) {
            return response()->json([
                'message' => 'Format ekspor tidak didukung. Pilih pdf atau xlsx.',
            ], 400);
        }

        $periode = $request->query('periode', 'bulan');
        $dari = $request->query('dari');
        $sampai = $request->query('sampai');

        $range = ReportHelper::getReportRange($periode, $dari, $sampai);
        $report = ReportHelper::computeReport($business->id, $range);

        // 4. Row limit for Excel
        if ($format === 'xlsx' && count($report['transactions']) > 10000) {
            return response()->json([
                'message' => 'Terlalu banyak transaksi. Persempit periode.',
            ], 422);
        }

        // 5. Generate binary content
        $filename = ReportHelper::buildReportFilename(
            $business->business_name,
            $range['start'],
            $range['end'],
            $format
        );

        if ($format === 'pdf') {
            $binary = ReportPdfExporter::generate($report);
            $mime = 'application/pdf';
        } else {
            $binary = ReportExcelExporter::generate($report);
            $mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        return response($binary, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Content-Length' => strlen($binary),
            'Cache-Control' => 'no-cache, private',
        ]);
    }
}
