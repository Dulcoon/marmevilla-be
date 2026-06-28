<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\VillaFacility;
use App\Jobs\TranslateFacilityDataJob;

class TranslateFacilities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'facilities:translate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Translate all existing facilities to English (name_en)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting facility translation process...');
        
        $facilities = VillaFacility::whereNull('name_en')->orWhere('name_en', '')->get();
        
        if ($facilities->isEmpty()) {
            $this->info('All facilities are already translated!');
            return;
        }

        foreach ($facilities as $facility) {
            $this->line("Dispatching translation job for: {$facility->name}");
            TranslateFacilityDataJob::dispatch($facility);
        }

        $this->info("Successfully dispatched translation jobs for {$facilities->count()} facilities. Please ensure your queue worker is running.");
    }
}
