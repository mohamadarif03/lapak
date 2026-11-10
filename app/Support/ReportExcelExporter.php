<?php

namespace App\Support;

use ZipArchive;

class ReportExcelExporter
{
    /**
     * Generate XLSX binary content from report data.
     *
     * @param  array<string, mixed>  $report
     */
    public static function generate(array $report): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'lapak_xlsx_');
        $zip = new ZipArchive;
        $zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        // 1. [Content_Types].xml
        $zip->addFromString('[Content_Types].xml', self::buildContentTypes());

        // 2. _rels/.rels
        $zip->addFromString('_rels/.rels', self::buildRootRels());

        // 3. xl/workbook.xml
        $isMonthly = $report['periodic']['is_monthly'] ?? false;
        $periodicSheetName = $isMonthly ? 'Bulanan' : 'Harian';
        $zip->addFromString('xl/workbook.xml', self::buildWorkbookXml($periodicSheetName));

        // 4. xl/_rels/workbook.xml.rels
        $zip->addFromString('xl/_rels/workbook.xml.rels', self::buildWorkbookRels());

        // 5. xl/styles.xml
        $zip->addFromString('xl/styles.xml', self::buildStylesXml());

        // 6. xl/worksheets/sheet1.xml (Ringkasan)
        $zip->addFromString('xl/worksheets/sheet1.xml', self::buildSummarySheet($report));

        // 7. xl/worksheets/sheet2.xml (Kategori)
        $zip->addFromString('xl/worksheets/sheet2.xml', self::buildCategorySheet($report));

        // 8. xl/worksheets/sheet3.xml (Harian / Bulanan)
        $zip->addFromString('xl/worksheets/sheet3.xml', self::buildPeriodicSheet($report));

        // 9. xl/worksheets/sheet4.xml (Transaksi)
        $zip->addFromString('xl/worksheets/sheet4.xml', self::buildTransactionsSheet($report));

        $zip->close();

        $content = file_get_contents($tempFile);
        @unlink($tempFile);

        return $content ?: '';
    }

    protected static function escapeXml(mixed $val): string
    {
        return htmlspecialchars((string) $val, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    protected static function buildContentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'</Types>';
    }

    protected static function buildRootRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    protected static function buildWorkbookXml(string $periodicSheetName): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets>'
            .'<sheet name="Ringkasan" sheetId="1" r:id="rId1"/>'
            .'<sheet name="Kategori" sheetId="2" r:id="rId2"/>'
            .'<sheet name="'.self::escapeXml($periodicSheetName).'" sheetId="3" r:id="rId3"/>'
            .'<sheet name="Transaksi" sheetId="4" r:id="rId4"/>'
            .'</sheets>'
            .'</workbook>';
    }

    protected static function buildWorkbookRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>'
            .'<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>'
            .'<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/>'
            .'<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    protected static function buildStylesXml(): string
    {
        // Style indices:
        // 0: Normal text
        // 1: Bold title
        // 2: Header cell (bold, gray bg, thin border)
        // 3: Numeric currency (integer)
        // 4: Numeric percentage (1 decimal)
        // 5: Date format
        // 6: Subheader / label bold
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<numFmts count="3">'
            .'<numFmt numFmtId="164" formatCode="&quot;Rp &quot;#,##0;[Red]-&quot;Rp &quot;#,##0;&quot;Rp 0&quot;"/>'
            .'<numFmt numFmtId="165" formatCode="0.0%"/>'
            .'<numFmt numFmtId="166" formatCode="yyyy-mm-dd"/>'
            .'</numFmts>'
            .'<fonts count="3">'
            .'<font><sz val="11"/><name val="Calibri"/></font>'
            .'<font><b/><sz val="11"/><name val="Calibri"/></font>'
            .'<font><b/><sz val="14"/><name val="Calibri"/></font>'
            .'</fonts>'
            .'<fills count="3">'
            .'<fill><patternFill patternType="none"/></fill>'
            .'<fill><patternFill patternType="gray125"/></fill>'
            .'<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>'
            .'</fills>'
            .'<borders count="2">'
            .'<border><left/><right/><top/><bottom/><diagonal/></border>'
            .'<border>'
            .'<left style="thin"><color rgb="FFE2E8F0"/></left>'
            .'<right style="thin"><color rgb="FFE2E8F0"/></right>'
            .'<top style="thin"><color rgb="FFE2E8F0"/></top>'
            .'<bottom style="thin"><color rgb="FFE2E8F0"/></bottom>'
            .'</border>'
            .'</borders>'
            .'<cellXfs count="7">'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0"><alignment horizontal="center" vertical="center"/></xf>'
            .'<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0"><alignment horizontal="right"/></xf>'
            .'<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0"><alignment horizontal="right"/></xf>'
            .'<xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0"><alignment horizontal="center"/></xf>'
            .'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0"/>'
            .'</cellXfs>'
            .'</styleSheet>';
    }

    protected static function buildSummarySheet(array $report): string
    {
        $h = $report['header'];
        $s = $report['summary'];

        $bizName = ReportHelper::escapeSpreadsheetText($h['business_name']);
        $owner = ReportHelper::escapeSpreadsheetText($h['owner_name']);

        $incomeDeltaText = $s['income_delta']['text'] ?? '-';
        $profitDeltaText = $s['profit_delta']['text'] ?? '-';

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<cols>'
            .'<col min="1" max="1" width="32" customWidth="1"/>'
            .'<col min="2" max="2" width="24" customWidth="1"/>'
            .'<col min="3" max="3" width="38" customWidth="1"/>'
            .'</cols>'
            .'<sheetData>'
            .'<row r="1"><c r="A1" s="1" t="inlineStr"><is><t>'.self::escapeXml("LAPORAN LABA RUGI - {$bizName}").'</t></is></c></row>'
            .'<row r="2"><c r="A2" t="inlineStr"><is><t>'.self::escapeXml("Pemilik: {$owner}").'</t></is></c></row>'
            .'<row r="3"><c r="A3" t="inlineStr"><is><t>'.self::escapeXml("Periode: {$h['periode_label']}").'</t></is></c></row>'
            .'<row r="4"><c r="A4" t="inlineStr"><is><t>'.self::escapeXml("Dibuat pada: {$h['generated_at']}").'</t></is></c></row>'
            .'<row r="5"/>'
            .'<row r="6">'
            .'<c r="A6" s="2" t="inlineStr"><is><t>Indikator</t></is></c>'
            .'<c r="B6" s="2" t="inlineStr"><is><t>Nilai</t></is></c>'
            .'<c r="C6" s="2" t="inlineStr"><is><t>Perbandingan Periode Sebelumnya</t></is></c>'
            .'</row>'
            .'<row r="7">'
            .'<c r="A7" s="6" t="inlineStr"><is><t>Total Pemasukan</t></is></c>'
            .'<c r="B7" s="3"><v>'.(int) $s['total_income'].'</v></c>'
            .'<c r="C7" t="inlineStr"><is><t>'.self::escapeXml($incomeDeltaText).'</t></is></c>'
            .'</row>'
            .'<row r="8">'
            .'<c r="A8" s="6" t="inlineStr"><is><t>Total Pengeluaran</t></is></c>'
            .'<c r="B8" s="3"><v>'.(int) $s['total_expense'].'</v></c>'
            .'<c r="C8" t="inlineStr"><is><t>-</t></is></c>'
            .'</row>'
            .'<row r="9">'
            .'<c r="A9" s="6" t="inlineStr"><is><t>'.self::escapeXml("Laba / Rugi Bersih ({$s['profit_label']})").'</t></is></c>'
            .'<c r="B9" s="3"><v>'.(int) $s['net_profit'].'</v></c>'
            .'<c r="C9" t="inlineStr"><is><t>'.self::escapeXml($profitDeltaText).'</t></is></c>'
            .'</row>'
            .'<row r="10">'
            .'<c r="A10" s="6" t="inlineStr"><is><t>Jumlah Transaksi</t></is></c>'
            .'<c r="B10" s="0"><v>'.(int) $s['transaction_count'].'</v></c>'
            .'<c r="C10" t="inlineStr"><is><t>-</t></is></c>'
            .'</row>'
            .'<row r="11">'
            .'<c r="A11" s="6" t="inlineStr"><is><t>Rata-rata Transaksi Pemasukan</t></is></c>'
            .'<c r="B11" s="3"><v>'.(int) ($s['avg_income_transaction'] ?? 0).'</v></c>'
            .'<c r="C11" t="inlineStr"><is><t>-</t></is></c>'
            .'</row>'
            .'<row r="12"/>'
            .'<row r="13"><c r="A13" t="inlineStr"><is><t>'.self::escapeXml("Catatan: {$h['disclaimer']}").'</t></is></c></row>'
            .'</sheetData>'
            .'</worksheet>';
    }

    protected static function buildCategorySheet(array $report): string
    {
        $cats = $report['categories'];
        $incomeRows = $cats['income'] ?? [];
        $expenseRows = $cats['expense'] ?? [];

        $r = 1;
        $sheetData = '';

        // Table 1: Pemasukan
        $sheetData .= "<row r=\"{$r}\"><c r=\"A{$r}\" s=\"1\" t=\"inlineStr\"><is><t>Rincian Kategori Pemasukan</t></is></c></row>";
        $r++;
        $sheetData .= "<row r=\"{$r}\">"
            ."<c r=\"A{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Kategori</t></is></c>"
            ."<c r=\"B{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Jumlah Transaksi</t></is></c>"
            ."<c r=\"C{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Total Nominal</t></is></c>"
            ."<c r=\"D{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Persentase</t></is></c>"
            .'</row>';
        $r++;

        if (empty($incomeRows)) {
            $sheetData .= "<row r=\"{$r}\"><c r=\"A{$r}\" t=\"inlineStr\"><is><t>Belum ada data pemasukan</t></is></c></row>";
            $r++;
        } else {
            foreach ($incomeRows as $row) {
                $safeName = ReportHelper::escapeSpreadsheetText($row['category']);
                $pctVal = round(((float) $row['percentage']) / 100.0, 4);

                $sheetData .= "<row r=\"{$r}\">"
                    ."<c r=\"A{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($safeName).'</t></is></c>'
                    ."<c r=\"B{$r}\" s=\"0\"><v>{$row['count']}</v></c>"
                    ."<c r=\"C{$r}\" s=\"3\"><v>{$row['amount']}</v></c>"
                    ."<c r=\"D{$r}\" s=\"4\"><v>{$pctVal}</v></c>"
                    .'</row>';
                $r++;
            }
        }

        // Total Pemasukan Row
        $sheetData .= "<row r=\"{$r}\">"
            ."<c r=\"A{$r}\" s=\"6\" t=\"inlineStr\"><is><t>Total Pemasukan</t></is></c>"
            ."<c r=\"B{$r}\" s=\"6\"><v>".(int) ($report['summary']['income_count'] ?? 0).'</v></c>'
            ."<c r=\"C{$r}\" s=\"3\"><v>".(int) ($cats['income_total'] ?? 0).'</v></c>'
            ."<c r=\"D{$r}\" s=\"4\"><v>1.0</v></c>"
            .'</row>';
        $r += 2;

        // Table 2: Pengeluaran
        $sheetData .= "<row r=\"{$r}\"><c r=\"A{$r}\" s=\"1\" t=\"inlineStr\"><is><t>Rincian Kategori Pengeluaran</t></is></c></row>";
        $r++;
        $sheetData .= "<row r=\"{$r}\">"
            ."<c r=\"A{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Kategori</t></is></c>"
            ."<c r=\"B{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Jumlah Transaksi</t></is></c>"
            ."<c r=\"C{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Total Nominal</t></is></c>"
            ."<c r=\"D{$r}\" s=\"2\" t=\"inlineStr\"><is><t>Persentase</t></is></c>"
            .'</row>';
        $r++;

        if (empty($expenseRows)) {
            $sheetData .= "<row r=\"{$r}\"><c r=\"A{$r}\" t=\"inlineStr\"><is><t>Belum ada data pengeluaran</t></is></c></row>";
            $r++;
        } else {
            foreach ($expenseRows as $row) {
                $safeName = ReportHelper::escapeSpreadsheetText($row['category']);
                $pctVal = round(((float) $row['percentage']) / 100.0, 4);

                $sheetData .= "<row r=\"{$r}\">"
                    ."<c r=\"A{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($safeName).'</t></is></c>'
                    ."<c r=\"B{$r}\" s=\"0\"><v>{$row['count']}</v></c>"
                    ."<c r=\"C{$r}\" s=\"3\"><v>{$row['amount']}</v></c>"
                    ."<c r=\"D{$r}\" s=\"4\"><v>{$pctVal}</v></c>"
                    .'</row>';
                $r++;
            }
        }

        // Total Pengeluaran Row
        $sheetData .= "<row r=\"{$r}\">"
            ."<c r=\"A{$r}\" s=\"6\" t=\"inlineStr\"><is><t>Total Pengeluaran</t></is></c>"
            ."<c r=\"B{$r}\" s=\"6\"><v>".(int) ($report['summary']['expense_count'] ?? 0).'</v></c>'
            ."<c r=\"C{$r}\" s=\"3\"><v>".(int) ($cats['expense_total'] ?? 0).'</v></c>'
            ."<c r=\"D{$r}\" s=\"4\"><v>1.0</v></c>"
            .'</row>';

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<cols>'
            .'<col min="1" max="1" width="30" customWidth="1"/>'
            .'<col min="2" max="2" width="18" customWidth="1"/>'
            .'<col min="3" max="3" width="22" customWidth="1"/>'
            .'<col min="4" max="4" width="16" customWidth="1"/>'
            .'</cols>'
            ."<sheetData>{$sheetData}</sheetData>"
            .'</worksheet>';
    }

    protected static function buildPeriodicSheet(array $report): string
    {
        $periodic = $report['periodic'];
        $isMonthly = $periodic['is_monthly'] ?? false;
        $labelCol = $isMonthly ? 'Bulan' : 'Tanggal';

        $sheetData = '<row r="1">'
            ."<c r=\"A1\" s=\"2\" t=\"inlineStr\"><is><t>{$labelCol}</t></is></c>"
            .'<c r="B1" s="2" t="inlineStr"><is><t>Pemasukan</t></is></c>'
            .'<c r="C1" s="2" t="inlineStr"><is><t>Pengeluaran</t></is></c>'
            .'<c r="D1" s="2" t="inlineStr"><is><t>Laba / Rugi</t></is></c>'
            .'</row>';

        $r = 2;
        $totalInc = 0;
        $totalExp = 0;

        foreach ($periodic['rows'] ?? [] as $row) {
            $key = $row['key'] ?? '';
            $inc = (int) ($row['income'] ?? 0);
            $exp = (int) ($row['expense'] ?? 0);
            $profit = $inc - $exp;

            $totalInc += $inc;
            $totalExp += $exp;

            $sheetData .= "<row r=\"{$r}\">"
                ."<c r=\"A{$r}\" s=\"5\" t=\"inlineStr\"><is><t>".self::escapeXml($key).'</t></is></c>'
                ."<c r=\"B{$r}\" s=\"3\"><v>{$inc}</v></c>"
                ."<c r=\"C{$r}\" s=\"3\"><v>{$exp}</v></c>"
                ."<c r=\"D{$r}\" s=\"3\"><v>{$profit}</v></c>"
                .'</row>';
            $r++;
        }

        $totalProfit = $totalInc - $totalExp;

        // Total row
        $sheetData .= "<row r=\"{$r}\">"
            ."<c r=\"A{$r}\" s=\"6\" t=\"inlineStr\"><is><t>Total</t></is></c>"
            ."<c r=\"B{$r}\" s=\"3\"><v>{$totalInc}</v></c>"
            ."<c r=\"C{$r}\" s=\"3\"><v>{$totalExp}</v></c>"
            ."<c r=\"D{$r}\" s=\"3\"><v>{$totalProfit}</v></c>"
            .'</row>';

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<cols>'
            .'<col min="1" max="1" width="18" customWidth="1"/>'
            .'<col min="2" max="2" width="22" customWidth="1"/>'
            .'<col min="3" max="3" width="22" customWidth="1"/>'
            .'<col min="4" max="4" width="22" customWidth="1"/>'
            .'</cols>'
            ."<sheetData>{$sheetData}</sheetData>"
            .'</worksheet>';
    }

    protected static function buildTransactionsSheet(array $report): string
    {
        $transactions = $report['transactions'] ?? [];

        $sheetData = '<row r="1">'
            .'<c r="A1" s="2" t="inlineStr"><is><t>Tanggal</t></is></c>'
            .'<c r="B1" s="2" t="inlineStr"><is><t>Jam</t></is></c>'
            .'<c r="C1" s="2" t="inlineStr"><is><t>Jenis</t></is></c>'
            .'<c r="D1" s="2" t="inlineStr"><is><t>Item / Transaksi</t></is></c>'
            .'<c r="E1" s="2" t="inlineStr"><is><t>Jumlah</t></is></c>'
            .'<c r="F1" s="2" t="inlineStr"><is><t>Kategori</t></is></c>'
            .'<c r="G1" s="2" t="inlineStr"><is><t>Nominal</t></is></c>'
            .'<c r="H1" s="2" t="inlineStr"><is><t>Catatan</t></is></c>'
            .'<c r="I1" s="2" t="inlineStr"><is><t>Sumber</t></is></c>'
            .'</row>';

        $r = 2;
        foreach ($transactions as $tx) {
            $itemEsc = ReportHelper::escapeSpreadsheetText($tx['item'] ?? '');
            $catEsc = ReportHelper::escapeSpreadsheetText($tx['category'] ?? '');
            $noteEsc = ReportHelper::escapeSpreadsheetText($tx['note'] ?? '');
            $sourceEsc = ReportHelper::escapeSpreadsheetText($tx['source'] ?? '');
            $typeLabel = strtolower((string) ($tx['type'] ?? '')) === 'income' ? 'Pemasukan' : 'Pengeluaran';

            $sheetData .= "<row r=\"{$r}\">"
                ."<c r=\"A{$r}\" s=\"5\" t=\"inlineStr\"><is><t>".self::escapeXml($tx['date']).'</t></is></c>'
                ."<c r=\"B{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($tx['time']).'</t></is></c>'
                ."<c r=\"C{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($typeLabel).'</t></is></c>'
                ."<c r=\"D{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($itemEsc).'</t></is></c>'
                ."<c r=\"E{$r}\" s=\"0\"><v>".(int) ($tx['quantity'] ?? 1).'</v></c>'
                ."<c r=\"F{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($catEsc).'</t></is></c>'
                ."<c r=\"G{$r}\" s=\"3\"><v>".(int) ($tx['amount'] ?? 0).'</v></c>'
                ."<c r=\"H{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($noteEsc).'</t></is></c>'
                ."<c r=\"I{$r}\" s=\"0\" t=\"inlineStr\"><is><t>".self::escapeXml($sourceEsc).'</t></is></c>'
                .'</row>';
            $r++;
        }

        $lastRow = max(2, $r - 1);
        $autoFilterRef = "A1:I{$lastRow}";

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<sheetViews>'
            .'<sheetView tabSelected="1" workbookViewId="0">'
            .'<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
            .'</sheetView>'
            .'</sheetViews>'
            .'<cols>'
            .'<col min="1" max="1" width="14" customWidth="1"/>'
            .'<col min="2" max="2" width="10" customWidth="1"/>'
            .'<col min="3" max="3" width="16" customWidth="1"/>'
            .'<col min="4" max="4" width="28" customWidth="1"/>'
            .'<col min="5" max="5" width="10" customWidth="1"/>'
            .'<col min="6" max="6" width="22" customWidth="1"/>'
            .'<col min="7" max="7" width="20" customWidth="1"/>'
            .'<col min="8" max="8" width="28" customWidth="1"/>'
            .'<col min="9" max="9" width="12" customWidth="1"/>'
            .'</cols>'
            ."<sheetData>{$sheetData}</sheetData>"
            ."<autoFilter ref=\"{$autoFilterRef}\"/>"
            .'</worksheet>';
    }
}
