<?php
// Script untuk membuat symlink storage di InfinityFree (Laravel di dalam htdocs/laravel)
// Jalankan script ini dengan mengakses: https://toko-pancing.infinityfree.io/laravel/public/symlink.php

$target = dirname(__DIR__) . '/storage/app/public';
$shortcut = __DIR__ . '/storage';

// Hapus shortcut lama jika berupa file/link rusak sebelum membuat baru
if (file_exists($shortcut) || is_link($shortcut)) {
    @unlink($shortcut);
}

if (symlink($target, $shortcut)) {
    echo "<h1>Sukses!</h1>";
    echo "<p>Symlink storage berhasil dibuat dari <strong>$shortcut</strong> ke <strong>$target</strong>.</p>";
    echo "<p><strong>PENTING:</strong> Segera hapus file <code>symlink.php</code> ini dari FTP Anda demi alasan keamanan.</p>";
} else {
    echo "<h1>Gagal!</h1>";
    echo "<p>Gagal membuat symlink storage. Pastikan struktur folder Anda sesuai panduan.</p>";
}
?>
