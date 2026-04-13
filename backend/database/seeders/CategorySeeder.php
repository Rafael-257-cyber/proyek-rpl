<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pancing Laut',
                'description' => 'Peralatan pancing untuk memancing di laut/air asin'
            ],
            [
                'name' => 'Pancing Tawar',
                'description' => 'Peralatan pancing untuk memancing di air tawar'
            ],
            [
                'name' => 'Pancing Kolam',
                'description' => 'Peralatan pancing untuk memancing di kolam'
            ],
            [
                'name' => 'Umpan & Spot',
                'description' => 'Umpan dan aksesoris pemancing'
            ],
            [
                'name' => 'Perlengkapan Pemancing',
                'description' => 'Perlengkapan dan pakaian pemancing'
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
