<?php
$map = [
    "Lapangan Padel" => "sports_tennis",
    "Lapangan Helikopter" => "flight",
    "Brankas kamar" => "lock",
    "Water heater" => "hot_tub",
    "Parking Area" => "local_parking",
    "Mesin espresso" => "coffee_maker",
    "Smart TV" => "tv",
    "Welcome drink" => "local_drink",
    "Dispenser" => "water_drop",
    "Amenities" => "spa",
    "Wi-Fi gratis" => "wifi",
    "Snack" => "restaurant",
    "Mini bar" => "kitchen",
    "AC" => "ac_unit"
];

foreach ($map as $name => $icon) {
    App\Models\VillaFacility::where('name', $name)->update(['icon' => $icon]);
}
echo "Icons updated successfully!\n";
