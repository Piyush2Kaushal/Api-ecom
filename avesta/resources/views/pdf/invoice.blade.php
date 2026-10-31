@php
    $cur = $order->currency; $rate = (float) $order->exchange_rate;
    $m = fn ($v) => money($v, $cur, $rate);
    $isCredit = $invoice->type === 'credit_note';
    $addr = function ($a) {
        return collect([trim(($a['first_name'] ?? '').' '.($a['last_name'] ?? '')), $a['company'] ?? null, $a['line1'] ?? null, $a['line2'] ?? null,
            trim(($a['city'] ?? '').' '.($a['postcode'] ?? '')), $a['county'] ?? null, country_name($a['country'] ?? null)])->filter()->implode('<br>');
    };
@endphp
<!DOCTYPE html>
<html><head><meta charset="utf-8">@include('pdf._styles')</head>
<body>
<div class="foot">{{ $s('company_name') }} · {{ $s('company_address') }} · {{ $s('company_email') }} · {{ $s('company_phone') }}
    @if($s('company_number')) · Company No. {{ $s('company_number') }} @endif
    @if($s('company_vat_number')) · VAT No. {{ $s('company_vat_number') }} @endif</div>

<table><tr>
    <td>
        @if(setting('logo') && str_starts_with(setting('logo'), 'uploads/') && file_exists(public_path(setting('logo'))) && !str_ends_with(setting('logo'), '.svg'))
            <img src="{{ public_path(setting('logo')) }}" style="height:34px">
        @else
            <div class="brand">{{ strtoupper($s('site_name')) }}</div><div class="tag">{{ $s('site_tagline') }}</div>
        @endif
    </td>
    <td class="title">{{ $isCredit ? 'CREDIT NOTE' : 'VAT INVOICE' }}</td>
</tr></table>
<div class="bar"></div>

<table><tr>
    <td style="width:34%" valign="top">
        <div class="label">Billed to</div>
        {!! $addr($order->billing_address) !!}<br>{{ $order->email }}
        @if($order->user && $order->user->vat_number)<br>VAT No: {{ $order->user->vat_number }}@endif
    </td>
    <td style="width:33%" valign="top">
        <div class="label">Deliver to</div>
        {!! $addr($order->shipping_address) !!}
    </td>
    <td style="width:33%" valign="top">
        <table>
            <tr><td class="muted">{{ $isCredit ? 'Credit note' : 'Invoice' }} no.</td><td class="r"><b>{{ $invoice->number }}</b></td></tr>
            <tr><td class="muted">Date</td><td class="r">{{ $invoice->issued_at->format('d M Y') }}</td></tr>
            <tr><td class="muted">Order</td><td class="r">{{ $order->number }}</td></tr>
            @if($order->po_reference)<tr><td class="muted">PO ref.</td><td class="r">{{ $order->po_reference }}</td></tr>@endif
            <tr><td class="muted">Payment</td><td class="r">{{ $order->paid_at ? 'Paid '.$order->paid_at->format('d M Y') : 'Unpaid' }}</td></tr>
        </table>
    </td>
</tr></table>
<br>

@if($isCredit)
    <div class="box">Credit issued against invoice for order {{ $order->number }}. @if($invoice->note) Reason: {{ $invoice->note }} @endif</div>
    <br>
    <table class="totals"><tr class="grand"><td>Total credited</td><td class="r">{{ $m($invoice->amount) }}</td></tr></table>
@else
<table class="items">
    <thead><tr>
        <th style="width:42%">Item</th><th>SKU</th><th class="r">Qty</th><th class="r">Unit</th><th class="r">Net</th><th class="r">VAT</th><th class="r">Total</th>
    </tr></thead>
    <tbody>
    @foreach($order->items as $i)
        <tr>
            <td><b>{{ $i->name }}</b>@if($i->variant_label)<br><span class="muted">{{ $i->variant_label }}</span>@endif
                @if((float)$i->coupon_discount > 0)<br><span class="muted">Coupon −{{ $m($i->coupon_discount) }}</span>@endif</td>
            <td style="white-space:nowrap">{{ $i->sku }}</td>
            <td class="r">{{ $i->quantity }}</td>
            <td class="r">@if((float)$i->unit_original_price > (float)$i->unit_price)<span class="strike">{{ $m($i->unit_original_price) }}</span><br>@endif{{ $m($i->unit_price) }}</td>
            <td class="r">{{ $m($i->line_net) }}</td>
            <td class="r">{{ $i->vat_mode === 'none' ? '0%' : rtrim(rtrim(number_format($i->vat_rate, 2), '0'), '.').'%' }}<br>{{ $m($i->line_vat) }}</td>
            <td class="r">{{ $m($i->line_total) }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
<br>
<table><tr>
    <td style="width:52%" valign="top">
        @if($order->customer_notes)<div class="box"><div class="label">Notes</div>{{ $order->customer_notes }}</div>@endif
    </td>
    <td style="width:48%" valign="top">
        <table class="totals">
            <tr><td class="muted">Items</td><td class="r">{{ $m($order->items_subtotal) }}</td></tr>
            @if((float)$order->coupon_discount > 0)<tr><td class="muted">Coupon ({{ $order->coupon_code }})</td><td class="r">−{{ $m($order->coupon_discount) }}</td></tr>@endif
            <tr><td class="muted">Delivery — {{ $order->shipping_method_name }}</td><td class="r">{{ (float)$order->shipping_total > 0 ? $m($order->shipping_total) : 'Free' }}</td></tr>
            <tr><td class="muted">Total excl. VAT</td><td class="r">{{ $m($order->net_total) }}</td></tr>
            <tr><td class="muted">VAT</td><td class="r">{{ $m($order->vat_total) }}</td></tr>
            <tr class="grand"><td>Total</td><td class="r">{{ $m($order->grand_total) }}</td></tr>
            @if((float)$order->savings_total > 0)<tr><td class="muted" colspan="2" style="text-align:right">You saved {{ $m($order->savings_total) }}</td></tr>@endif
        </table>
    </td>
</tr></table>
@endif
<br><br>
<div class="muted">Thank you for choosing {{ $s('site_name') }}.</div>
</body></html>
