<!DOCTYPE html>
@php
    $lapakTextSize = request()->cookie('lapak_text_size', auth()->user()?->preference?->text_size ?? 'normal');
    $lapakTextSize = in_array($lapakTextSize, ['normal', 'besar'], true) ? $lapakTextSize : 'normal';
@endphp
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-text-size="{{ $lapakTextSize }}" class="{{ $lapakTextSize === 'besar' ? 'text-size-besar' : '' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
        @php
            $isPublicLanding = request()->is('/') || request()->is('syarat') || request()->is('privasi');
        @endphp
        @if ($isPublicLanding)
            <meta name="robots" content="index, follow">
        @else
            <meta name="robots" content="noindex, nofollow">
        @endif

        <script>
            (function() {
                try {
                    var m = document.cookie.match(/(?:^|; )lapak_text_size=([^;]*)/);
                    var s = m ? decodeURIComponent(m[1]) : localStorage.getItem('lapak_text_size');
                    if (s === 'besar') {
                        document.documentElement.setAttribute('data-text-size', 'besar');
                        document.documentElement.classList.add('text-size-besar');
                    } else if (s === 'normal') {
                        document.documentElement.setAttribute('data-text-size', 'normal');
                        document.documentElement.classList.remove('text-size-besar');
                    }
                } catch(e) {}
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts & Styles -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
