<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\Insight;
use App\Models\Transaction;
use App\Support\DashboardHelper;

class DashboardService
{
    /**
     * Get aggregated dashboard data for a given business and period.
     *
     * @return array<string, mixed>
     */
    public function getDashboardData(int $businessId, string $periode = 'hari'): array
    {
        $business = Business::findOrFail($businessId);
        $range = DashboardHelper::getPeriodRange($periode);

        // Current period aggregates
        $currentMetrics = Transaction::query()
            ->where('business_id', $businessId)
            ->whereBetween('occurred_at', [$range['start'], $range['end']])
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            ")
            ->first();

        $currentIncome = (int) ($currentMetrics->total_income ?? 0);
        $currentExpense = (int) ($currentMetrics->total_expense ?? 0);
        $currentProfit = $currentIncome - $currentExpense;

        // Previous period aggregates
        $prevMetrics = Transaction::query()
            ->where('business_id', $businessId)
            ->whereBetween('occurred_at', [$range['prevStart'], $range['prevEnd']])
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            ")
            ->first();

        $prevIncome = (int) ($prevMetrics->total_income ?? 0);
        $prevExpense = (int) ($prevMetrics->total_expense ?? 0);
        $prevProfit = $prevIncome - $prevExpense;

        // Deltas
        $incomeDelta = DashboardHelper::calcDelta($currentIncome, $prevIncome);
        $profitDelta = DashboardHelper::calcDelta($currentProfit, $prevProfit);

        // 5 most recent transactions
        $recentTransactions = Transaction::query()
            ->where('business_id', $businessId)
            ->orderByDesc('occurred_at')
            ->limit(5)
            ->get()
            ->map(function (Transaction $t) {
                return [
                    'id' => $t->id,
                    'type' => $t->type,
                    'item' => $t->item,
                    'quantity' => $t->quantity,
                    'display_item' => $t->quantity > 1 ? "{$t->item} × {$t->quantity}" : $t->item,
                    'amount' => (int) $t->amount,
                    'formatted_amount' => $t->type === 'expense'
                        ? '-'.DashboardHelper::formatRupiah($t->amount)
                        : DashboardHelper::formatRupiah($t->amount),
                    'category' => $t->category,
                    'source' => $t->source,
                    'occurred_at' => $t->occurred_at->toIso8601String(),
                    'formatted_time' => DashboardHelper::formatTransactionTime($t->occurred_at),
                ];
            });

        // Total transaction count and campaign count for starter steps
        $totalTransactionsCount = Transaction::where('business_id', $businessId)->count();
        $campaignsCount = Campaign::where('business_id', $businessId)->count();

        // Latest insight
        $latestInsight = Insight::where('business_id', $businessId)
            ->latest('data_date')
            ->first();

        // Starter steps calculation
        $step1Done = $totalTransactionsCount >= 1;
        $step2Done = ! is_null($business->analysis_viewed_at);
        $step3Done = $campaignsCount >= 1;
        $completedSteps = ($step1Done ? 1 : 0) + ($step2Done ? 1 : 0) + ($step3Done ? 1 : 0);

        return [
            'business' => [
                'id' => $business->id,
                'owner_name' => $business->owner_name,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
                'address' => $business->address,
                'analysis_viewed_at' => $business->analysis_viewed_at?->toIso8601String(),
            ],
            'periode' => $range['periode'],
            'prev_label' => $range['prevLabel'],
            'summary' => [
                'income' => $currentIncome,
                'formatted_income' => DashboardHelper::formatRupiah($currentIncome),
                'expense' => $currentExpense,
                'formatted_expense' => DashboardHelper::formatRupiah($currentExpense),
                'profit' => $currentProfit,
                'formatted_profit' => DashboardHelper::formatRupiah($currentProfit),
                'is_loss' => $currentProfit < 0,
                'income_delta' => $incomeDelta,
                'profit_delta' => $profitDelta,
                'income_prev' => $prevIncome,
                'profit_prev' => $prevProfit,
            ],
            'recent_transactions' => $recentTransactions,
            'total_transactions_count' => $totalTransactionsCount,
            'campaigns_count' => $campaignsCount,
            'latest_insight' => $latestInsight ? [
                'id' => $latestInsight->id,
                'type' => $latestInsight->type,
                'title' => $latestInsight->title,
                'recommendation' => $latestInsight->recommendation,
                'source' => $latestInsight->source,
                'data_date' => $latestInsight->data_date?->format('d M Y'),
            ] : null,
            'starter_steps' => [
                'is_all_completed' => $completedSteps >= 3,
                'completed_count' => $completedSteps,
                'tasks' => [
                    [
                        'id' => 'transaction',
                        'title' => 'Catat transaksi pertamamu',
                        'completed' => $step1Done,
                        'href' => '/catat?mulai=1',
                    ],
                    [
                        'id' => 'analysis',
                        'title' => 'Lihat analisis pertamamu',
                        'completed' => $step2Done,
                        'href' => '/analisis',
                    ],
                    [
                        'id' => 'campaign',
                        'title' => 'Buat promosi pertamamu',
                        'completed' => $step3Done,
                        'href' => '/promosi',
                    ],
                ],
                'example_utterance' => DashboardHelper::getExampleUtterance($business->business_type),
            ],
        ];
    }
}
