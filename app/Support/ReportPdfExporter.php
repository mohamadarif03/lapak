<?php

namespace App\Support;

class ReportPdfExporter
{
    /**
     * Generate A4 portrait PDF binary content from report data.
     *
     * @param  array<string, mixed>  $report
     */
    public static function generate(array $report): string
    {
        $h = $report['header'];
        $s = $report['summary'];
        $cats = $report['categories'];
        $periodic = $report['periodic'];

        // Page dimensions in points (A4 portrait: 595.28 x 841.89)
        $pageW = 595.28;
        $pageH = 841.89;
        $margin = 40.0;
        $contentW = $pageW - (2 * $margin);

        // We will build page streams
        $pages = [];
        $currentPageOps = [];
        $y = $pageH - $margin; // Start at top margin

        $startNewPage = function () use (&$pages, &$currentPageOps, &$y, $pageH, $margin) {
            if (! empty($currentPageOps)) {
                $pages[] = implode("\n", $currentPageOps);
            }
            $currentPageOps = [];
            $y = $pageH - $margin;
        };

        // Helper closures to push PDF graphic / text commands
        $setFont = function (string $fontKey, float $size) use (&$currentPageOps) {
            $currentPageOps[] = "/{$fontKey} {$size} Tf";
        };

        $setColor = function (float $r, float $g, float $b) use (&$currentPageOps) {
            $currentPageOps[] = sprintf('%.3F %.3F %.3F rg', $r, $g, $b);
        };

        $setStrokeColor = function (float $r, float $g, float $b) use (&$currentPageOps) {
            $currentPageOps[] = sprintf('%.3F %.3F %.3F RG', $r, $g, $b);
        };

        $drawRect = function (float $rx, float $ry, float $rw, float $rh, bool $fill = true, bool $stroke = true) use (&$currentPageOps) {
            $op = $fill && $stroke ? 'B' : ($fill ? 'f' : 'S');
            $currentPageOps[] = sprintf('%.2F %.2F %.2F %.2F re %s', $rx, $ry, $rw, $rh, $op);
        };

        $drawText = function (string $text, float $tx, float $ty, string $align = 'left', ?float $width = null) use (&$currentPageOps) {
            $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
            $currentPageOps[] = 'BT';
            if ($align === 'right' && $width !== null) {
                // approximate character width: ~5.5pt per char for 9-10pt font
                $charWidth = 5.2;
                $estTextW = mb_strlen($text, 'UTF-8') * $charWidth;
                $adjustedX = max($tx, $tx + $width - $estTextW);
                $currentPageOps[] = sprintf('%.2F %.2F Td (%s) Tj', $adjustedX, $ty, $escaped);
            } else {
                $currentPageOps[] = sprintf('%.2F %.2F Td (%s) Tj', $tx, $ty, $escaped);
            }
            $currentPageOps[] = 'ET';
        };

        // 1. PAGE 1: Header + Summary + Categories
        $startNewPage();

        // Top Header Accent Bar
        $setColor(0.129, 0.431, 0.271); // Deep green #216E45
        $drawRect($margin, $y - 4, $contentW, 4, true, false);
        $y -= 16;

        // Title
        $setFont('F2', 18);
        $setColor(0.094, 0.094, 0.106); // Foreground
        $drawText('LAPORAN LABA RUGI UMKM', $margin, $y);
        $y -= 18;

        // Business Name & Meta
        $setFont('F1', 11);
        $setColor(0.30, 0.35, 0.40);
        $drawText($h['business_name'].' (Pemilik: '.$h['owner_name'].')', $margin, $y);
        $y -= 14;

        $setFont('F1', 9.5);
        $drawText('Periode: '.$h['periode_label'].'   |   Dibuat: '.$h['generated_at'], $margin, $y);
        $y -= 22;

        // Divider
        $setStrokeColor(0.88, 0.90, 0.94);
        $currentPageOps[] = sprintf('%.2F %.2F m %.2F %.2F l S', $margin, $y, $margin + $contentW, $y);
        $y -= 18;

        // 2. Summary Cards (2x2 Grid or 4 Cards)
        $setFont('F2', 12);
        $setColor(0.094, 0.094, 0.106);
        $drawText('RINGKASAN KEUANGAN', $margin, $y);
        $y -= 14;

        $cardW = ($contentW - 12) / 2;
        $cardH = 50.0;

        // Card 1: Pemasukan
        $setColor(0.96, 0.98, 0.96);
        $setStrokeColor(0.80, 0.90, 0.82);
        $drawRect($margin, $y - $cardH, $cardW, $cardH, true, true);
        $setFont('F1', 8.5);
        $setColor(0.30, 0.50, 0.35);
        $drawText('TOTAL PEMASUKAN', $margin + 10, $y - 14);
        $setFont('F2', 14);
        $setColor(0.129, 0.431, 0.271);
        $drawText($s['total_income_formatted'], $margin + 10, $y - 32);
        $setFont('F1', 7.5);
        $setColor(0.40, 0.45, 0.50);
        $incomeDeltaText = $s['income_delta']['text'] ?? 'Data periode sebelumnya: -';
        $drawText($incomeDeltaText, $margin + 10, $y - 44);

        // Card 2: Pengeluaran
        $c2X = $margin + $cardW + 12;
        $setColor(0.99, 0.96, 0.96);
        $setStrokeColor(0.92, 0.82, 0.82);
        $drawRect($c2X, $y - $cardH, $cardW, $cardH, true, true);
        $setFont('F1', 8.5);
        $setColor(0.60, 0.25, 0.25);
        $drawText('TOTAL PENGELUARAN', $c2X + 10, $y - 14);
        $setFont('F2', 14);
        $setColor(0.70, 0.15, 0.12);
        $drawText($s['total_expense_formatted'], $c2X + 10, $y - 32);
        $setFont('F1', 7.5);
        $setColor(0.40, 0.45, 0.50);
        $drawText($s['expense_count'].' transaksi pengeluaran tercatat', $c2X + 10, $y - 44);

        $y -= ($cardH + 10);

        // Card 3: Laba / Rugi Bersih
        $isProfit = $s['net_profit'] >= 0;
        $profitBg = $isProfit ? [0.94, 0.98, 0.95] : [0.99, 0.95, 0.95];
        $profitBorder = $isProfit ? [0.70, 0.88, 0.75] : [0.92, 0.78, 0.78];
        $setColor($profitBg[0], $profitBg[1], $profitBg[2]);
        $setStrokeColor($profitBorder[0], $profitBorder[1], $profitBorder[2]);
        $drawRect($margin, $y - $cardH, $cardW, $cardH, true, true);
        $setFont('F1', 8.5);
        $setColor($isProfit ? 0.129 : 0.70, $isProfit ? 0.431 : 0.15, $isProfit ? 0.271 : 0.12);
        $drawText('LABA / RUGI BERSIH ('.strtoupper($s['profit_label']).')', $margin + 10, $y - 14);
        $setFont('F2', 14);
        $drawText($s['net_profit_formatted'], $margin + 10, $y - 32);
        $setFont('F1', 7.5);
        $setColor(0.40, 0.45, 0.50);
        $profitDeltaText = $s['profit_delta']['text'] ?? 'Perbandingan periode: -';
        $drawText($profitDeltaText, $margin + 10, $y - 44);

        // Card 4: Transaksi & Rata-rata
        $setColor(0.97, 0.98, 0.99);
        $setStrokeColor(0.85, 0.88, 0.92);
        $drawRect($c2X, $y - $cardH, $cardW, $cardH, true, true);
        $setFont('F1', 8.5);
        $setColor(0.20, 0.35, 0.55);
        $drawText('TOTAL TRANSAKSI', $c2X + 10, $y - 14);
        $setFont('F2', 14);
        $setColor(0.15, 0.25, 0.40);
        $drawText($s['transaction_count'].' Transaksi', $c2X + 10, $y - 32);
        $setFont('F1', 7.5);
        $setColor(0.40, 0.45, 0.50);
        $drawText('Rata-rata pemasukan: '.$s['avg_income_formatted'], $c2X + 10, $y - 44);

        $y -= ($cardH + 22);

        // 3. Category Breakdown Tables
        $setFont('F2', 12);
        $setColor(0.094, 0.094, 0.106);
        $drawText('RINCIAN PER KATEGORI', $margin, $y);
        $y -= 14;

        $colW = $contentW / 2 - 8;

        // Left Table: Pemasukan
        $renderCategoryBox = function (string $title, array $items, int $totalAmt, float $bx, float $by, float $bw) use (
            &$currentPageOps,
            $setFont,
            $setColor,
            $setStrokeColor,
            $drawRect,
            $drawText
        ): float {
            $hH = 20.0;
            $setColor(0.94, 0.96, 0.98);
            $setStrokeColor(0.85, 0.88, 0.92);
            $drawRect($bx, $by - $hH, $bw, $hH, true, true);

            $setFont('F2', 9);
            $setColor(0.15, 0.20, 0.25);
            $drawText($title, $bx + 8, $by - 14);

            $curY = $by - $hH;
            $rowH = 18.0;

            if (empty($items)) {
                $setFont('F1', 8.5);
                $setColor(0.50, 0.55, 0.60);
                $drawText('Belum ada transaksi', $bx + 8, $curY - 12);
                $curY -= $rowH;
            } else {
                foreach (array_slice($items, 0, 8) as $item) {
                    $setStrokeColor(0.92, 0.94, 0.96);
                    $drawRect($bx, $curY - $rowH, $bw, $rowH, false, true);

                    $setFont('F1', 8.5);
                    $setColor(0.15, 0.18, 0.22);
                    $catLabel = mb_substr($item['category'], 0, 22, 'UTF-8');
                    $drawText($catLabel, $bx + 6, $curY - 12);

                    $setFont('F2', 8.5);
                    $amtStr = $item['amount_formatted'].' ('.$item['percentage'].'%)';
                    $drawText($amtStr, $bx + $bw - 130, $curY - 12, 'right', 124);

                    $curY -= $rowH;
                }
            }

            // Total row
            $setColor(0.96, 0.97, 0.98);
            $setStrokeColor(0.85, 0.88, 0.92);
            $drawRect($bx, $curY - $rowH, $bw, $rowH, true, true);
            $setFont('F2', 8.5);
            $setColor(0.10, 0.15, 0.20);
            $drawText('Total', $bx + 6, $curY - 12);
            $drawText(ReportHelper::formatRupiah($totalAmt), $bx + $bw - 130, $curY - 12, 'right', 124);

            return $by - $curY + $rowH;
        };

        $h1 = $renderCategoryBox('Kategori Pemasukan', $cats['income'] ?? [], (int) ($cats['income_total'] ?? 0), $margin, $y, $colW);
        $h2 = $renderCategoryBox('Kategori Pengeluaran', $cats['expense'] ?? [], (int) ($cats['expense_total'] ?? 0), $margin + $colW + 16, $y, $colW);
        $y -= max($h1, $h2) + 20;

        // 4. Daily / Monthly Periodic Breakdown Table
        $renderTableHeader = function (string $periodTitle) use (
            &$y,
            $margin,
            $contentW,
            $setFont,
            $setColor,
            $setStrokeColor,
            $drawRect,
            $drawText
        ) {
            $hH = 20.0;
            $setColor(0.92, 0.95, 0.93);
            $setStrokeColor(0.80, 0.88, 0.83);
            $drawRect($margin, $y - $hH, $contentW, $hH, true, true);

            $setFont('F2', 8.5);
            $setColor(0.12, 0.25, 0.16);

            $c1W = 100.0;
            $c2W = ($contentW - $c1W) / 3;

            $drawText($periodTitle, $margin + 8, $y - 14);
            $drawText('Pemasukan', $margin + $c1W + 10, $y - 14);
            $drawText('Pengeluaran', $margin + $c1W + $c2W + 10, $y - 14);
            $drawText('Laba / Rugi', $margin + $c1W + (2 * $c2W) + 10, $y - 14);

            $y -= $hH;
        };

        $isMonthly = $periodic['is_monthly'] ?? false;
        $periodTitle = $isMonthly ? 'Rincian per Bulan' : 'Rincian Harian';

        // Check if remaining space on Page 1 is enough for at least header + 3 rows
        if ($y < 160) {
            $startNewPage();
        }

        $setFont('F2', 12);
        $setColor(0.094, 0.094, 0.106);
        $drawText(strtoupper($periodTitle), $margin, $y);
        $y -= 14;

        $renderTableHeader($isMonthly ? 'Bulan' : 'Tanggal');

        $rowH = 16.0;
        $c1W = 100.0;
        $c2W = ($contentW - $c1W) / 3;

        $rows = $periodic['rows'] ?? [];
        $totalInc = 0;
        $totalExp = 0;

        foreach ($rows as $pRow) {
            if ($y < 60) {
                $startNewPage();
                $renderTableHeader($isMonthly ? 'Bulan' : 'Tanggal');
            }

            $inc = (int) ($pRow['income'] ?? 0);
            $exp = (int) ($pRow['expense'] ?? 0);
            $profit = $inc - $exp;

            $totalInc += $inc;
            $totalExp += $exp;

            $setStrokeColor(0.92, 0.94, 0.96);
            $drawRect($margin, $y - $rowH, $contentW, $rowH, false, true);

            $setFont('F1', 8);
            $setColor(0.20, 0.25, 0.30);
            $dateLabel = $pRow['date_formatted'] ?? $pRow['label'] ?? $pRow['key'];
            $drawText($dateLabel, $margin + 8, $y - 11);

            $setFont('F1', 8);
            $setColor(0.129, 0.431, 0.271);
            $drawText(ReportHelper::formatRupiah($inc), $margin + $c1W, $y - 11, 'right', $c2W - 8);

            $setColor(0.70, 0.15, 0.12);
            $drawText(ReportHelper::formatRupiah($exp), $margin + $c1W + $c2W, $y - 11, 'right', $c2W - 8);

            $setColor($profit >= 0 ? 0.129 : 0.70, $profit >= 0 ? 0.431 : 0.15, $profit >= 0 ? 0.271 : 0.12);
            $drawText(ReportHelper::formatRupiah($profit), $margin + $c1W + (2 * $c2W), $y - 11, 'right', $c2W - 8);

            $y -= $rowH;
        }

        // Total row for periodic table
        if ($y < 60) {
            $startNewPage();
        }

        $setColor(0.95, 0.96, 0.98);
        $setStrokeColor(0.80, 0.85, 0.90);
        $drawRect($margin, $y - $rowH, $contentW, $rowH, true, true);

        $setFont('F2', 8.5);
        $setColor(0.10, 0.15, 0.20);
        $drawText('Total', $margin + 8, $y - 11);
        $drawText(ReportHelper::formatRupiah($totalInc), $margin + $c1W, $y - 11, 'right', $c2W - 8);
        $drawText(ReportHelper::formatRupiah($totalExp), $margin + $c1W + $c2W, $y - 11, 'right', $c2W - 8);
        $totProfit = $totalInc - $totalExp;
        $drawText(ReportHelper::formatRupiah($totProfit), $margin + $c1W + (2 * $c2W), $y - 11, 'right', $c2W - 8);

        // Finish last page
        if (! empty($currentPageOps)) {
            $pages[] = implode("\n", $currentPageOps);
        }

        // Add Footers ("Halaman X dari Y" and disclaimer) to all pages
        $totalPages = count($pages);
        $finalPages = [];

        foreach ($pages as $idx => $pOps) {
            $pNum = $idx + 1;
            $footerOps = [];

            // Footer divider
            $footerOps[] = sprintf('0.850 0.880 0.920 RG %.2F 32.00 m %.2F 32.00 l S', $margin, $margin + $contentW);

            // Left disclaimer text
            $disclaimerText = "Dibuat dengan LAPAK pada {$h['generated_at']}. {$h['disclaimer']}";
            $escDisclaimer = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $disclaimerText);
            $footerOps[] = 'BT';
            $footerOps[] = '/F1 7.0 Tf';
            $footerOps[] = '0.450 0.500 0.550 rg';
            $footerOps[] = sprintf('%.2F 20.00 Td (%s) Tj', $margin, $escDisclaimer);
            $footerOps[] = 'ET';

            // Right page number
            $pageText = "Halaman {$pNum} dari {$totalPages}";
            $escPage = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $pageText);
            $footerOps[] = 'BT';
            $footerOps[] = '/F2 7.5 Tf';
            $footerOps[] = '0.300 0.350 0.400 rg';
            $footerOps[] = sprintf('%.2F 20.00 Td (%s) Tj', $margin + $contentW - 80, $escPage);
            $footerOps[] = 'ET';

            $finalPages[] = $pOps."\n".implode("\n", $footerOps);
        }

        // 5. Assemble PDF Document
        return self::assemblePdfDocument($finalPages, $pageW, $pageH);
    }

    /**
     * Assemble final PDF binary with Catalog, Pages, Page, Content streams, Fonts, and xref.
     *
     * @param  list<string>  $pageStreams
     */
    protected static function assemblePdfDocument(array $pageStreams, float $pageW, float $pageH): string
    {
        $numPages = count($pageStreams);
        $objects = [];

        // 1: Catalog
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';

        // 2: Pages
        $kids = [];
        for ($i = 0; $i < $numPages; $i++) {
            $pageObjId = 3 + ($i * 2);
            $kids[] = "{$pageObjId} 0 R";
        }
        $kidsStr = implode(' ', $kids);
        $objects[2] = "<< /Type /Pages /Kids [{$kidsStr}] /Count {$numPages} >>";

        // Fonts at the end of objects list
        $font1Id = 3 + ($numPages * 2);
        $font2Id = $font1Id + 1;

        // Create Page and Content objects
        for ($i = 0; $i < $numPages; $i++) {
            $pageObjId = 3 + ($i * 2);
            $contentObjId = $pageObjId + 1;
            $stream = $pageStreams[$i];
            $streamLen = strlen($stream);

            $objects[$pageObjId] = '<< /Type /Page /Parent 2 0 R '
                .'/MediaBox [0 0 '.sprintf('%.2F %.2F', $pageW, $pageH).'] '
                ."/Contents {$contentObjId} 0 R "
                ."/Resources << /Font << /F1 {$font1Id} 0 R /F2 {$font2Id} 0 R >> >> >>";

            $objects[$contentObjId] = "<< /Length {$streamLen} >>\nstream\n{$stream}\nendstream";
        }

        // Font 1: Helvetica (Regular)
        $objects[$font1Id] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

        // Font 2: Helvetica-Bold
        $objects[$font2Id] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

        // Compile output and calculate xref offsets
        $output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [];

        $totalObjects = count($objects);
        for ($id = 1; $id <= $totalObjects; $id++) {
            $offsets[$id] = strlen($output);
            $output .= "{$id} 0 obj\n".$objects[$id]."\nendobj\n";
        }

        $xrefStart = strlen($output);
        $output .= "xref\n0 ".($totalObjects + 1)."\n";
        $output .= "0000000000 65535 f \n";

        for ($id = 1; $id <= $totalObjects; $id++) {
            $output .= sprintf("%010d 00000 n \n", $offsets[$id]);
        }

        $output .= "trailer\n<< /Size ".($totalObjects + 1)." /Root 1 0 R >>\n";
        $output .= "startxref\n{$xrefStart}\n%%EOF\n";

        return $output;
    }
}
