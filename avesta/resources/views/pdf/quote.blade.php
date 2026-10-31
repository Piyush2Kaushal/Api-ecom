@php($t = $summary['totals'])
<!DOCTYPE html>
<html><head><meta charset="utf-8">@include('pdf._styles')</head>
<body>
<div class="foot">{{ setting('company_name') }} · {{ setting('company_address') }} · {{ setting('company_email') }} · {{ setting('company_phone') }}</div>
<table><tr>
    <td><div class="brand">{{ strtoupper(setting('site_name')) }}</div><div class="tag">{{ setting('site_tagline') }}</div></td>
    <td class="title">PRO-FORMA QUOTE</td>
</tr></table>
<div class="bar"></div>
<table><tr>
    <td valign="top" style="width:60%"><div class="label">Prepared for</div>{{ $user->name }}@if($user->company_name)<br>{{ $user->company_name }}@endif<br>{{ $user->email }}</td>
    <td valign="top"><table>
        <tr><td class="muted">Quote no.</td><td class="r"><b>{{ $number }}</b></td></tr>
        <tr><td class="muted">Date</td><td class="r">{{ now()->format('d M Y') }}</td></tr>
        <tr><td class="muted">Valid until</td><td class="r">{{ now()->addDays(14)->format('d M Y') }}</td></tr>
        <tr><td class="muted">Price level</td><td class="r">{{ ucfirst($summary['tier']) }}</td></tr>
    </table></td>
</tr></table><br>
<table class="items">
    <thead><tr><th style="width:46%">Item</th><th>SKU</th><th class="r">Qty</th><th class="r">Unit</th><th class="r">VAT</th><th class="r">Total</th></tr></thead>
    <tbody>
    @foreach($summary['lines'] as $l)
        <tr><td><b>{{ $l['name'] }}</b>@if($l['variant_label'])<br><span class="muted">{{ $l['variant_label'] }}</span>@endif</td>
            <td>{{ $l['sku'] }}</td><td class="r">{{ $l['quantity'] }}</td><td class="r">{{ money($l['unit_price']) }}</td>
            <td class="r">{{ money($l['vat']) }}</td><td class="r">{{ money($l['gross']) }}</td></tr>
    @endforeach
    </tbody>
</table><br>
<table><tr><td style="width:52%"></td><td>
<table class="totals">
    <tr><td class="muted">Items</td><td class="r">{{ money($t['items_subtotal']) }}</td></tr>
    @if($t['coupon_discount'] > 0)<tr><td class="muted">Coupon</td><td class="r">−{{ money($t['coupon_discount']) }}</td></tr>@endif
    <tr><td class="muted">Delivery (estimate)</td><td class="r">{{ $t['shipping'] > 0 ? money($t['shipping']) : 'Free' }}</td></tr>
    <tr><td class="muted">Total excl. VAT</td><td class="r">{{ money($t['net_total']) }}</td></tr>
    <tr><td class="muted">VAT</td><td class="r">{{ money($t['vat_total']) }}</td></tr>
    <tr class="grand"><td>Total</td><td class="r">{{ money($t['grand_total']) }}</td></tr>
</table></td></tr></table>
<br><div class="muted">Prices are subject to stock availability. This quote is not a VAT invoice.</div>
</body></html>
