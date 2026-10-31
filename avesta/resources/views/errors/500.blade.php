<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Something went wrong</title>
    <style>
        body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;background:#0A0A0F;color:#fff;text-align:center;padding:24px}
        .code{font-size:120px;font-weight:700;letter-spacing:-6px;color:#24104F;line-height:1}
        h1{margin:-10px 0 12px;font-size:30px;letter-spacing:-.5px}
        p{color:rgba(255,255,255,.6);max-width:440px;margin:0 auto;line-height:1.6}
        a{display:inline-block;margin-top:28px;background:#5B2BD9;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-weight:600}
    </style>
</head>
<body>
    <div>
        <div class="code">{{ $code ?? 500 }}</div>
        <h1>{{ ($code ?? 500) == 503 ? 'Back soon' : 'Something went wrong' }}</h1>
        <p>{{ ($code ?? 500) == 503 ? 'We are carrying out scheduled maintenance.' : 'Our team has been notified. Please try again in a moment.' }}</p>
        <a href="/">Go to homepage</a>
    </div>
</body>
</html>
