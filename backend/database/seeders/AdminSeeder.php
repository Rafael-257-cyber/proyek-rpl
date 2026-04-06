<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@fishgear.com'],
            [
                'name' => 'Admin FishGear',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
            ]
        );

        // Create test user
        User::updateOrCreate(
            ['email' => 'user@fishgear.com'],
            [
                'name' => 'User Testing',
                'password' => Hash::make('user123456'),
                'role' => 'user',
            ]
        );

        $this->command->info('✅ Admin & User accounts created successfully!');
        $this->command->info('Admin: admin@fishgear.com / admin123456');
        $this->command->info('User: user@fishgear.com / user123456');
    }
}
