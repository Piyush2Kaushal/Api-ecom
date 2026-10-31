@php($logo = media_url(setting('logo')))
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>{{ $subjectLine }}</title></head>
<body style="margin:0;padding:0;background:#F4F4F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#0A0A0F;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F7;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#0A0A0F;padding:24px 32px;">
        @if($logo)
            <img src="{{ $logo }}" alt="{{ setting('site_name') }}" height="32" style="display:block;height:32px;">
        @else
            <span style="color:#FFFFFF;font-size:20px;font-weight:700;letter-spacing:4px;">{{ strtoupper(setting('site_name')) }}</span>
            <div style="color:#8B6CFF;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">{{ setting('site_tagline') }}</div>
        @endif
    </td></tr>
    <tr><td style="height:4px;background:linear-gradient(90deg,#5B2BD9,#8B6CFF);background-color:#5B2BD9;"></td></tr>
    <tr><td style="padding:36px 32px 8px;">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.3px;">{{ $heading }}</h1>
        @foreach($lines as $line)
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3A3A45;">{{ $line }}</p>
        @endforeach
        @if($code)
            <div style="margin:24px 0;padding:20px;background:#F4F1FF;border-radius:12px;text-align:center;font-size:34px;font-weight:700;letter-spacing:10px;color:#4A1FB8;">{{ $code }}</div>
        @endif
        @if($rows)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #E7E7EC;">
                @foreach($rows as $row)
                    <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E7E7EC;font-size:14px;color:#6B6B78;">{{ $row[0] }}</td>
                        <td style="padding:12px 0;border-bottom:1px solid #E7E7EC;font-size:14px;text-align:right;font-weight:600;">{{ $row[1] }}</td>
                    </tr>
                @endforeach
            </table>
        @endif
        @if($button)
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="border-radius:10px;background:#5B2BD9;">
                <a href="{{ $button['url'] }}" style="display:inline-block;padding:14px 28px;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;">{{ $button['text'] }}</a>
            </td></tr></table>
        @endif
        @foreach($outro as $line)
            <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#6B6B78;">{{ $line }}</p>
        @endforeach
    </td></tr>
    <tr><td style="padding:24px 32px 32px;border-top:1px solid #E7E7EC;font-size:12px;line-height:1.6;color:#8A8A96;">
        {{ setting('company_name') }} · {{ setting('company_address') }}<br>
        {{ setting('company_email') }} · {{ setting('company_phone') }}
    </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
