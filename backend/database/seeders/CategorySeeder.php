<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder {
    public function run(): void {
        $categories = [
            [
                'nama_kategori' => 'Pancing Laut',
                'img' => null
            ],
            [
                'nama_kategori' => 'Pancing Tawar',
                'img' => null
            ],
            [
                'nama_kategori' => 'Pancing Kolam',
                'img' => null
            ],
            [
                'nama_kategori' => 'Umpan & Spot',
                'img' => null
            ],
            [
                'nama_kategori' => 'Perlengkapan Pemancing',
                'img' => null
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
