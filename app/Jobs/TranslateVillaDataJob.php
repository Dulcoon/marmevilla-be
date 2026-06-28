<?php

namespace App\Jobs;

use App\Models\Villa;
use App\Services\GeminiTranslationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TranslateVillaDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $villa;

    /**
     * Create a new job instance.
     */
    public function __construct(Villa $villa)
    {
        $this->villa = $villa;
    }

    public function handle(GeminiTranslationService $translator): void
    {
        $dataToTranslate = [];

        if (!empty($this->villa->tagline)) {
            $dataToTranslate['tagline_en'] = $this->villa->tagline;
        }
        if (!empty($this->villa->description)) {
            $dataToTranslate['description_en'] = $this->villa->description;
        }
        if (!empty($this->villa->view_description)) {
            $dataToTranslate['view_description_en'] = $this->villa->view_description;
        }
        if (!empty($this->villa->long_description)) {
            $dataToTranslate['long_description_en'] = $this->villa->long_description;
        }
        if (!empty($this->villa->features)) {
            $dataToTranslate['features_en'] = $this->villa->features;
        }

        if (empty($dataToTranslate)) {
            return;
        }

        // Lakukan 1 kali request ke API untuk menghemat kuota dan mempercepat proses
        try {
            $translated = $translator->translateArray($dataToTranslate);

            if (!empty($translated) && is_array($translated)) {
                // Jika Gemini mengembalikan JSON di dalam array index ke-0 (karena prompt JSON array)
                if (isset($translated[0]) && is_array($translated[0])) {
                    $translated = $translated[0];
                }

                $updatePayload = [];
                $jsonColumns = ['long_description_en', 'features_en'];
                $stringColumns = ['tagline_en', 'description_en', 'view_description_en'];

                foreach ($stringColumns as $col) {
                    if (isset($translated[$col])) {
                        // Pastikan data adalah string, fallback ke null jika aneh
                        $updatePayload[$col] = is_string($translated[$col]) ? $translated[$col] : null;
                    }
                }

                foreach ($jsonColumns as $col) {
                    if (isset($translated[$col])) {
                        // Pastikan di-encode sebagai JSON jika berupa array
                        $updatePayload[$col] = is_array($translated[$col]) ? json_encode($translated[$col], JSON_UNESCAPED_UNICODE) : $translated[$col];
                    }
                }

                if (!empty($updatePayload)) {
                    \DB::table('villas')->where('id', $this->villa->id)->update($updatePayload);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal saat memproses terjemahan di Job: ' . $e->getMessage());
        }
    }
}
