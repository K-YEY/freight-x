<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Twenty CRM') }}</title>

        <!-- Google Fonts: Inter & IBM Plex Sans Arabic -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Theme & Locale initialization script (prevents flash) -->
        <script>
            (function() {
                var theme = localStorage.getItem('twenty_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                var locale = localStorage.getItem('twenty_locale') || 'ar';
                document.documentElement.lang = locale;
                document.documentElement.dir = (locale === 'ar') ? 'rtl' : 'ltr';
            })();
        </script>

        <!-- Scripts & Styles -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="h-full bg-[#fbfbfb] dark:bg-[#111111] text-[#111111] dark:text-[#ececec] font-sans antialiased selection:bg-neutral-800 selection:text-white">
        @inertia
    </body>
</html>
