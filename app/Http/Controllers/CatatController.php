<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\CatatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CatatController extends Controller
{
    public function __construct(
        protected CatatService $catatService
    ) {}

    /**
     * Display the Catat page with real daily transactions and summary.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect('/masuk')
                ->with('status', 'Sesi berakhir, silakan masuk lagi.')
                ->with('message', 'Sesi berakhir, silakan masuk lagi.');
        }

        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            return redirect('/profil-usaha');
        }

        $tanggal = $request->query('tanggal');
        $dailyData = $this->catatService->getDailyTransactions($business->id, $tanggal);

        // Handle ?edit={id}
        $editTransaction = null;
        $editNotFound = false;
        if ($request->has('edit')) {
            $editId = $request->query('edit');
            $trx = Transaction::query()
                ->where('id', $editId)
                ->where('business_id', $business->id)
                ->first();

            if ($trx) {
                $editTransaction = [
                    'id' => $trx->id,
                    'type' => $trx->type,
                    'amount' => $trx->amount,
                    'item' => $trx->item,
                    'quantity' => $trx->quantity,
                    'category' => $trx->category,
                    'note' => $trx->note,
                    'occurred_at' => $trx->occurred_at->format('Y-m-d\TH:i'),
                ];
            } else {
                $editNotFound = true;
            }
        }

        return Inertia::render('catat/index', [
            'business' => [
                'id' => $business->id,
                'owner_name' => $business->owner_name,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
            ],
            'dailySummary' => [
                'date' => $dailyData['date'],
                'date_label' => $dailyData['date_label'],
                'is_today' => $dailyData['is_today'],
                'total_income' => $dailyData['total_income'],
                'formatted_income' => $dailyData['formatted_income'],
                'total_expense' => $dailyData['total_expense'],
                'formatted_expense' => $dailyData['formatted_expense'],
                'net_profit' => $dailyData['net_profit'],
                'formatted_profit' => $dailyData['formatted_profit'],
                'income_count' => $dailyData['income_count'],
                'expense_count' => $dailyData['expense_count'],
            ],
            'transactions' => $dailyData['transactions'],
            'editTransaction' => $editTransaction,
            'editNotFound' => $editNotFound,
            'autoStartRecording' => $request->query('mulai') === '1',
        ]);
    }

    /**
     * Process spoken audio or transcript text and return structured JSON candidate.
     */
    public function parse(Request $request): JsonResponse
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $business = $request->user()->business;
        if (! $business) {
            return response()->json(['message' => 'Profil usaha belum dibuat.'], 404);
        }

        // Validate audio file or transcript
        if ($request->hasFile('audio')) {
            $request->validate([
                'audio' => ['required', 'file', 'max:5120'], // Max 5MB
            ], [
                'audio.max' => 'Ukuran file audio maksimal 5 MB.',
            ]);
        }

        $audioFile = $request->file('audio');
        $transcript = $request->input('transcript');

        $result = $this->catatService->parseSpokenInput($business, $audioFile, $transcript);

        if (! $result['success']) {
            return response()->json([
                'message' => $result['error'] ?? 'Gagal memproses suara.',
            ], 422);
        }

        return response()->json($result['data']);
    }

    /**
     * Store new transaction (manual or voice confirmed).
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $business = $request->user()->business;
        if (! $business) {
            return response()->json(['message' => 'Profil usaha belum dibuat.'], 404);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'item' => ['required', 'string', 'max:100'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'category' => ['nullable', 'string', 'max:50'],
            'note' => ['nullable', 'string', 'max:300'],
            'source' => ['nullable', 'in:voice,manual'],
            'occurred_at' => ['nullable', 'date'],
            'idempotency_key' => ['nullable', 'string', 'max:100'],
            'voice_log_id' => ['nullable', 'integer'],
            'corrected_by_user' => ['nullable', 'boolean'],
        ], [
            'type.required' => 'Jenis transaksi wajib dipilih.',
            'amount.required' => 'Nominal belum diisi.',
            'amount.min' => 'Nominal tidak boleh kurang dari 0.',
            'amount.max' => 'Nominal melebihi batas maksimal Rp 1.000.000.000.',
            'item.required' => 'Nama barang atau transaksi belum diisi.',
            'item.max' => 'Nama barang maksimal 100 karakter.',
            'note.max' => 'Catatan maksimal 300 karakter.',
        ]);

        $transaction = $this->catatService->storeTransaction($business, $validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Tercatat',
                'transaction' => $transaction,
            ]);
        }

        return redirect()->route('catat.index')->with('success', 'Tercatat');
    }

    /**
     * Update existing transaction with tenant protection.
     */
    public function update(Request $request, Transaction $transaction): JsonResponse|RedirectResponse
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $business = $request->user()->business;
        if (! $business || $transaction->business_id !== $business->id) {
            abort(403, 'Akses ditolak. Transaksi bukan milik tokomu.');
        }

        $validated = $request->validate([
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'item' => ['required', 'string', 'max:100'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'category' => ['nullable', 'string', 'max:50'],
            'note' => ['nullable', 'string', 'max:300'],
            'occurred_at' => ['nullable', 'date'],
        ], [
            'type.required' => 'Jenis transaksi wajib dipilih.',
            'amount.required' => 'Nominal belum diisi.',
            'amount.min' => 'Nominal tidak boleh kurang dari 0.',
            'amount.max' => 'Nominal melebihi batas maksimal Rp 1.000.000.000.',
            'item.required' => 'Nama barang atau transaksi belum diisi.',
            'item.max' => 'Nama barang maksimal 100 karakter.',
            'note.max' => 'Catatan maksimal 300 karakter.',
        ]);

        $this->catatService->updateTransaction($transaction, $validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Transaksi berhasil diperbarui',
                'transaction' => $transaction->fresh(),
            ]);
        }

        return redirect()->route('catat.index')->with('success', 'Transaksi berhasil diperbarui');
    }

    /**
     * Delete transaction with tenant ownership check.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse|RedirectResponse
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $business = $request->user()->business;
        if (! $business || $transaction->business_id !== $business->id) {
            abort(403, 'Akses ditolak. Transaksi bukan milik tokomu.');
        }

        $this->catatService->deleteTransaction($transaction);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Transaksi dihapus',
            ]);
        }

        return redirect()->route('catat.index')->with('success', 'Transaksi dihapus');
    }
}
