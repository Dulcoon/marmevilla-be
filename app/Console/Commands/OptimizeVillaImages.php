<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\VillaImage;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;

class OptimizeVillaImages extends Command
{
    protected $signature = 'images:optimize
        {--quality=80 : WebP quality (1-100)}
        {--max-width=1920 : Max image width in pixels}
        {--dry-run : Scan and report only, no changes}';

    protected $description = 'Convert all non-WebP villa images to WebP and resize';

    public function handle()
    {
        $quality = (int) $this->option('quality');
        $maxWidth = (int) $this->option('max-width');
        $dryRun = $this->option('dry-run');

        if (!class_exists(ImageManager::class)) {
            $this->error('Intervention Image library not found. Run: composer require intervention/image-laravel');
            return self::FAILURE;
        }

        $this->info("Scanning for non-WebP images in storage/app/public/villas/...");
        if ($dryRun) {
            $this->warn("DRY-RUN mode: no files will be modified.");
        }

        $files = Storage::disk('public')->files('villas');

        $nonWebpFiles = array_filter($files, function ($file) {
            return !preg_match('/\.webp$/i', $file);
        });

        if (empty($nonWebpFiles)) {
            $this->info("All images are already WebP. Nothing to do.");
            return self::SUCCESS;
        }

        $this->line("Found " . count($nonWebpFiles) . " non-WebP image(s).");
        $converted = 0;
        $skipped = 0;
        $errors = 0;

        $manager = new ImageManager(new Driver());

        foreach ($nonWebpFiles as $file) {
            $fullPath = Storage::disk('public')->path($file);

            $this->line("Processing: {$file}");

            $webpFile = preg_replace('/\.(jpe?g|png|bmp|gif|tiff?)$/i', '.webp', $file);
            $webpFullPath = Storage::disk('public')->path($webpFile);

            if ($webpFile === $file) {
                $this->warn("  ↳ Unrecognized format, skipping.");
                $skipped++;
                continue;
            }

            if (Storage::disk('public')->exists($webpFile)) {
                $this->warn("  ↳ WebP version already exists ({$webpFile}), skipping.");
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->line("  ↳ Would convert to: {$webpFile}");
                $converted++;
                continue;
            }

            try {
                $img = $manager->decodePath($fullPath);

                if ($img->width() > $maxWidth) {
                    $img->scale(width: $maxWidth);
                }

                $encoded = $img->encode(new WebpEncoder(quality: $quality));
                $encoded->save($webpFullPath);

                if (!file_exists($webpFullPath) || filesize($webpFullPath) === 0) {
                    throw new \Exception("Converted file is empty or missing");
                }

                $dbUpdated = false;
                $oldUrl = '/storage/' . $file;
                $newUrl = '/storage/' . $webpFile;

                $records = VillaImage::where('image_url', $oldUrl)->get();

                if ($records->isNotEmpty()) {
                    foreach ($records as $record) {
                        $record->update(['image_url' => $newUrl]);
                        $this->line("  ↳ Updated DB: villa_image {$record->id} → {$newUrl}");
                    }
                    $dbUpdated = true;
                }

                if (!$dbUpdated) {
                    $this->warn("  ↳ No DB record found for {$oldUrl}. WebP saved, but DB unchanged.");
                }

                Storage::disk('public')->delete($file);
                $this->info("  ✓ Converted: {$file} → {$webpFile}");
                $converted++;

            } catch (\Exception $e) {
                $this->error("  ✗ Failed: {$file} — {$e->getMessage()}");

                if (isset($webpFullPath) && file_exists($webpFullPath)) {
                    unlink($webpFullPath);
                }

                $errors++;
            }
        }

        $this->newLine();
        $this->table(
            ['Result', 'Count'],
            [
                ['Converted', $converted],
                ['Skipped', $skipped],
                ['Errors', $errors],
            ]
        );

        if ($errors > 0) {
            $this->warn("Check storage/logs/laravel.log for error details.");
        }

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }
}
