<?php

namespace App\Jobs;

use App\Models\VillaFacility;
use App\Services\GeminiTranslationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TranslateFacilityDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $facility;

    /**
     * Create a new job instance.
     */
    public function __construct(VillaFacility $facility)
    {
        $this->facility = $facility;
    }

    /**
     * Execute the job.
     */
    public function handle(GeminiTranslationService $translator): void
    {
        if (!empty($this->facility->name)) {
            $name_en = $translator->translate($this->facility->name);
            if ($name_en) {
                \DB::table('villa_facilities')
                    ->where('id', $this->facility->id)
                    ->update(['name_en' => $name_en]);
            }
        }
    }
}
