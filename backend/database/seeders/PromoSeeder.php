<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $promo1 = \App\Models\Promo::create([
            'title' => 'Perlengkapan Mancing Kualitas Terbaik',
            'subtitle' => 'Temukan alat pancing terbaik dengan harga bersahabat',
            'discount_percentage' => 10.00,
            'image_path' => '/storage/products/joran-pancing-tua-dan-air-laut-biru_34013-35.avif',
            'button_text' => 'Tambah Sekarang',
            'is_active' => true,
        ]);

        $promo2 = \App\Models\Promo::create([
            'title' => 'Koleksi Umpan Terbaru',
            'subtitle' => 'Tingkatkan hasil tangkapan dengan umpan inovatif kami (Diskon 20%)',
            'discount_percentage' => 20.00,
            'image_path' => 'https://images.unsplash.com/photo-1506809598284-934c553a067a?q=80&w=1000&auto=format&fit=crop',
            'button_text' => 'Cek Koleksi',
            'is_active' => true,
        ]);

        $promo3 = \App\Models\Promo::create([
            'title' => 'Perlengkapan Mancing Kualitas Terbaik',
            'subtitle' => 'Temukan alat pancing terbaik dengan harga bersahabat',
            'discount_percentage' => 50.00,
            'image_path' => '/storage/products/joran-pancing-tua-dan-air-laut-biru_34013-35.avif',
            'button_text' => 'Tambah Sekarang',
            'is_active' => true,
        ]);

        // Attach promos to random products
        $products = \App\Models\Product::all();
        if ($products->count() > 0) {
            // Apply 50% promo to first 2 products
            $promo1->products()->attach($products->take(2)->pluck('id'));
            
            // Apply 20% promo to next 3 products
            $promo2->products()->attach($products->slice(2, 3)->pluck('id'));
            
            // Apply 10% promo to next 4 products
            $promo3->products()->attach($products->slice(5, 4)->pluck('id'));
        }
    }
}
