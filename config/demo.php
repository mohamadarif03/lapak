<?php

return [
    'enabled' => env('DEMO_ENABLED', false),
    'ttl_hours' => (int) env('DEMO_TTL_HOURS', 2),
    'max_active' => (int) env('DEMO_MAX_ACTIVE', 200),
    'allow_production' => env('DEMO_ALLOW_PRODUCTION', false),
    'cleanup_token' => env('DEMO_CLEANUP_TOKEN', 'lapak-demo-cleanup-secret'),
    'business_name' => env('DEMO_BUSINESS_NAME', 'Warung Barokah (Demo)'),
    'owner_name' => env('DEMO_OWNER_NAME', 'Budi Santoso'),
    'address' => env('DEMO_ADDRESS', 'Jl. Wonokromo No. 15, Surabaya'),
    'category' => env('DEMO_CATEGORY', 'Kuliner & Makanan'),
];
