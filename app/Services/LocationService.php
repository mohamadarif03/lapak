<?php

namespace App\Services;

use App\Support\BusinessProfileHelper;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LocationService
{
    /**
     * Search address suggestions in Indonesia.
     *
     * @return array<int, array{label: string, address: string, lat: float, lng: float}>
     */
    public function searchAddress(string $query): array
    {
        $cleanQuery = trim($query);
        if (mb_strlen($cleanQuery) < 3) {
            return [];
        }

        try {
            // Use OpenStreetMap Nominatim with countrycodes=id and limit 5
            $response = Http::timeout(4)
                ->withHeaders([
                    'User-Agent' => 'LapakUMKM/1.0 (contact@lapak.id)',
                ])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $cleanQuery,
                    'format' => 'json',
                    'countrycodes' => 'id',
                    'limit' => 5,
                    'addressdetails' => 1,
                ]);

            if ($response->successful()) {
                $results = $response->json();
                if (is_array($results) && count($results) > 0) {
                    $suggestions = [];
                    foreach ($results as $item) {
                        $lat = (float) ($item['lat'] ?? 0);
                        $lng = (float) ($item['lon'] ?? 0);

                        if (BusinessProfileHelper::isWithinIndonesia($lat, $lng)) {
                            $suggestions[] = [
                                'label' => (string) ($item['display_name'] ?? $cleanQuery),
                                'address' => (string) ($item['display_name'] ?? $cleanQuery),
                                'lat' => $lat,
                                'lng' => $lng,
                            ];
                        }
                    }

                    if (count($suggestions) > 0) {
                        return array_slice($suggestions, 0, 5);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::info('[LocationService] Geocoding API unavailable: '.$e->getMessage());
        }

        // Offline / fallback dictionary of major Indonesian cities & regions
        return $this->getFallbackSuggestions($cleanQuery);
    }

    /**
     * Reverse geocode latitude and longitude coordinates into an Indonesian address string.
     */
    public function reverseGeocode(float $lat, float $lng): ?string
    {
        if (! BusinessProfileHelper::isWithinIndonesia($lat, $lng)) {
            return null;
        }

        try {
            $response = Http::timeout(4)
                ->withHeaders([
                    'User-Agent' => 'LapakUMKM/1.0 (contact@lapak.id)',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $lat,
                    'lon' => $lng,
                    'format' => 'json',
                    'addressdetails' => 1,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                if (! empty($data['display_name'])) {
                    return (string) $data['display_name'];
                }
            }
        } catch (\Throwable $e) {
            Log::info('[LocationService] Reverse geocode unavailable: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Fallback Indonesian city matches when offline or external API is unavailable.
     *
     * @return array<int, array{label: string, address: string, lat: float, lng: float}>
     */
    protected function getFallbackSuggestions(string $query): array
    {
        $database = [
            ['name' => 'Jakarta Pusat, DKI Jakarta', 'lat' => -6.1818, 'lng' => 106.8223],
            ['name' => 'Jakarta Selatan, DKI Jakarta', 'lat' => -6.2615, 'lng' => 106.8106],
            ['name' => 'Jakarta Barat, DKI Jakarta', 'lat' => -6.1683, 'lng' => 106.7589],
            ['name' => 'Jakarta Timur, DKI Jakarta', 'lat' => -6.2250, 'lng' => 106.9004],
            ['name' => 'Jakarta Utara, DKI Jakarta', 'lat' => -6.1384, 'lng' => 106.8640],
            ['name' => 'Surabaya, Jawa Timur', 'lat' => -7.2575, 'lng' => 112.7521],
            ['name' => 'Bandung, Jawa Barat', 'lat' => -6.9175, 'lng' => 107.6191],
            ['name' => 'Medan, Sumatera Utara', 'lat' => 3.5952, 'lng' => 98.6722],
            ['name' => 'Semarang, Jawa Tengah', 'lat' => -6.9667, 'lng' => 110.4167],
            ['name' => 'Yogyakarta, D.I. Yogyakarta', 'lat' => -7.7956, 'lng' => 110.3695],
            ['name' => 'Makassar, Sulawesi Selatan', 'lat' => -5.1477, 'lng' => 119.4327],
            ['name' => 'Palembang, Sumatera Selatan', 'lat' => -2.9761, 'lng' => 104.7754],
            ['name' => 'Denpasar, Bali', 'lat' => -8.6705, 'lng' => 115.2126],
            ['name' => 'Malang, Jawa Timur', 'lat' => -7.9797, 'lng' => 112.6304],
            ['name' => 'Surakarta (Solo), Jawa Tengah', 'lat' => -7.5755, 'lng' => 110.8243],
            ['name' => 'Bogor, Jawa Barat', 'lat' => -6.5971, 'lng' => 106.8060],
            ['name' => 'Bekasi, Jawa Barat', 'lat' => -6.2383, 'lng' => 106.9756],
            ['name' => 'Tangerang, Banten', 'lat' => -6.1783, 'lng' => 106.6319],
            ['name' => 'Depok, Jawa Barat', 'lat' => -6.4025, 'lng' => 106.7942],
            ['name' => 'Bandar Lampung, Lampung', 'lat' => -5.4500, 'lng' => 105.2667],
        ];

        $q = mb_strtolower($query);
        $matches = [];

        foreach ($database as $item) {
            if (str_contains(mb_strtolower($item['name']), $q)) {
                $matches[] = [
                    'label' => $item['name'].', Indonesia',
                    'address' => $item['name'].', Indonesia',
                    'lat' => $item['lat'],
                    'lng' => $item['lng'],
                ];
            }
        }

        return array_slice($matches, 0, 5);
    }
}
