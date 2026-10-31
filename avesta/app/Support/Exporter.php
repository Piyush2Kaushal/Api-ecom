<?php

namespace App\Support;

use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\CSV\Writer as CsvWriter;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;

/** Streams CSV / Excel downloads without loading everything into memory. */
class Exporter
{
    /**
     * @param  array<int,string>  $headers
     * @param  iterable<array<int,mixed>>  $rows
     */
    public static function download(string $name, array $headers, iterable $rows, string $format = 'xlsx')
    {
        $format = $format === 'csv' ? 'csv' : 'xlsx';
        $filename = $name.'-'.now()->format('Y-m-d').'.'.$format;

        return response()->streamDownload(function () use ($headers, $rows, $format) {
            $writer = $format === 'csv' ? new CsvWriter : new XlsxWriter;
            $writer->openToFile('php://output');
            $writer->addRow(Row::fromValues($headers));
            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues(array_map(fn ($v) => is_bool($v) ? ($v ? 'yes' : 'no') : ($v ?? ''), $row)));
            }
            $writer->close();
        }, $filename, [
            'Content-Type' => $format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
