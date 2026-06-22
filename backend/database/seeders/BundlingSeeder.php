<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BundlingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $category = \App\Models\Category::firstOrCreate(
            ['name' => 'Bundling'],
            ['description' => 'Paket Bundling Pilihan Spesial']
        );

        \App\Models\Product::firstOrCreate(
            ['name' => 'Paket Pemula Air Tawar'],
            [
                'name' => 'Paket Pemula Air Tawar',
                'description' => 'Paket lengkap (Joran, Reel, Senar, Kail) khusus pemula untuk memancing di sungai atau danau.',
                'price' => 299000,
                'stock' => 50,
                'brand' => 'Mix Brand',
                'location' => 'Air Tawar',
                'category_id' => $category->id,
                'image' => '/storage/products/bundling_pancing.webp',
                'specifications' => json_encode(['Joran Antena 150cm', 'Reel 1000 Series', 'Senar Nylon 100m', 'Kail Set']),
            ]
        );

        \App\Models\Product::firstOrCreate(
            ['name' => 'Paket Pro Laut Dalam'],
            [
                'name' => 'Paket Pro Laut Dalam',
                'description' => 'Set peralatan pancing kelas berat untuk menaklukkan ikan-ikan besar di laut lepas.',
                'price' => 1500000,
                'stock' => 15,
                'brand' => 'Pro Angler',
                'location' => 'Air Asin/Laut',
                'category_id' => $category->id,
                'image' => '/storage/products/bundling_pancing_2.webp',
                'specifications' => json_encode(['Joran Carbon Solid 180cm', 'Reel Saltwater 5000', 'Senar PE 4', 'Lure Minnow Laut']),
            ]
        );
    }
}
