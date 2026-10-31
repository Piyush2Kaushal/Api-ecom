@php
    $meta = $page['props']['meta'] ?? [];
    $siteName = setting('site_name', 'Avesta');
    $title = isset($meta['title']) && $meta['title'] ? $meta['title'].' | '.$siteName : setting('seo_title');
    $description = $meta['description'] ?? setting('seo_description');
    $image = $meta['image'] ?? media_url(setting('seo_og_image'));
    $favicon = media_url(setting('favicon')) ?? asset('favicon.svg');
    $isAdmin = request()->is('admin*');
@endphp
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0A0A0F">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ $title }}</title>
    <meta name="description" content="{{ \Illuminate\Support\Str::limit(strip_tags((string) $description), 300) }}">
    @if($isAdmin)<meta name="robots" content="noindex, nofollow">@endif
    <link rel="canonical" href="{{ $meta['canonical'] ?? url()->current() }}">
    <meta property="og:site_name" content="{{ $siteName }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ \Illuminate\Support\Str::limit(strip_tags((string) $description), 300) }}">
    <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
    <meta property="og:url" content="{{ url()->current() }}">
    @if($image)<meta property="og:image" content="{{ $image }}">@endif
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="{{ $favicon }}">
    @if(!empty($meta['jsonld']))
        <script type="application/ld+json">{!! json_encode($meta['jsonld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
    @endif
    @if(!$isAdmin && setting('google_analytics_id'))
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ setting('google_analytics_id') }}"></script>
        <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','{{ setting('google_analytics_id') }}');</script>
    @endif
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
