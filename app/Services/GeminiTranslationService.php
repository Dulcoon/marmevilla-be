<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiTranslationService
{
    protected string $apiKey;
    // List of models to try in order (fallback mechanism)
    protected array $models = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest'
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', '');
    }

    protected function callGeminiApi(string $prompt, float $temperature, ?string $responseMimeType = null): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('Gemini API key is not configured.');
            return null;
        }

        foreach ($this->models as $model) {
            $baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

            try {
                $generationConfig = ['temperature' => $temperature];
                if ($responseMimeType) {
                    $generationConfig['responseMimeType'] = $responseMimeType;
                }

                // Set a timeout of 15 seconds to prevent hanging on one model too long
                $response = Http::timeout(15)->post($baseUrl . '?key=' . $this->apiKey, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => $generationConfig
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                }

                Log::warning("Gemini API Error with model {$model}", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            } catch (\Exception $e) {
                Log::warning("Gemini API Exception with model {$model}: " . $e->getMessage());
            }
        }

        Log::error('All Gemini fallback models failed.');
        return null;
    }

    public function translate(?string $text): ?string
    {
        if (empty(trim($text ?? ''))) {
            return null;
        }

        $prompt = "Terjemahkan teks bahasa Indonesia berikut ke dalam bahasa Inggris. Terjemahan harus natural, akurat, dan mempertahankan gaya bahasa aslinya, khususnya cocok untuk deskripsi properti/villa/hospitality. Jangan menambahkan penjelasan atau teks lain selain terjemahannya saja.\n\nTeks:\n" . $text;

        $result = $this->callGeminiApi($prompt, 0.3);

        return $result ? trim($result) : null;
    }

    public function translateArray(?array $data): ?array
    {
        if (empty($data)) {
            return null;
        }

        $jsonInput = json_encode($data, JSON_UNESCAPED_UNICODE);
        $prompt = "Terjemahkan nilai-nilai (values) dalam array JSON berikut dari bahasa Indonesia ke bahasa Inggris. Pertahankan struktur JSON-nya. Jangan ubah key-nya.\n\nJSON:\n" . $jsonInput;

        // Gunakan responseMimeType = application/json agar Gemini mengembalikan JSON murni
        $result = $this->callGeminiApi($prompt, 0.1, 'application/json');

        if ($result) {
            $result = str_replace(['```json', '```'], '', $result);
            $decoded = json_decode(trim($result), true);
            return is_array($decoded) ? $decoded : null;
        }

        return null;
    }
}
