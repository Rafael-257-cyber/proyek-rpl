<?php

return [
    'api_key' => env('RAJAONGKIR_API_KEY'),
    'base_url' => env(
        'RAJAONGKIR_BASE_URL',
        'https://rajaongkir.komerce.id/api/v1'
    ),
    'origin_id' => env('RAJAONGKIR_ORIGIN_ID'),
    'couriers' => array_values(array_filter(explode(',', env('RAJAONGKIR_COURIERS', 'jne')))),
];
