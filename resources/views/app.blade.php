<!DOCTYPE html>
@php
    $lapakTextSize = request()->cookie('lapak_text_size', auth()->user()?->preference?->text_size ?? 'normal');
    $lapakTextSize = in_array($lapakTextSize, ['normal', 'besar'], true) ? $lapakTextSize : 'normal';
@endphp
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-text-size="{{ $lapakTextSize }}" class="{{ $lapakTextSize === 'besar' ? 'text-size-besar' : '' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @php
            $isPublicLanding = request()->is('/') || request()->is('syarat') || request()->is('privasi');
        @endphp
        @if ($isPublicLanding)
            <meta name="robots" content="index, follow">
        @else
            <meta name="robots" content="noindex, nofollow">
        @endif

        {{-- Enforce LAPAK Light Theme per design.md regardless of OS theme --}}
        <script>
            (function() {
                try {
                    localStorage.setItem('appearance', 'light');
                } catch (e) {}
                document.documentElement.classList.remove('dark');

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

        {{-- Base style: Clean White background per user preference --}}
        <style>
            html, html.dark, body {
                background-color: #FFFFFF !important;
                color: #183C30;
                color-scheme: light !important;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
