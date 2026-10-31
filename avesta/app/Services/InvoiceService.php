<?php

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    public static function pdf(Invoice $invoice)
    {
        $invoice->loadMissing('order.items', 'order.user');

        return Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'order' => $invoice->order,
            's' => setting(...),
        ])->setPaper('a4');
    }

    public static function quote(array $summary, $user)
    {
        return Pdf::loadView('pdf.quote', [
            'summary' => $summary,
            'user' => $user,
            'number' => 'Q-'.now()->format('ymd-His'),
        ])->setPaper('a4');
    }
}
