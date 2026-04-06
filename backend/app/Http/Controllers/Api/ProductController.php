<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all products with advanced filters
     */
    public function index(Request $request)
    {
        $query = Product::query();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by location (Air Asin/Laut, Air Tawar, Kolam)
        if ($request->has('location')) {
            $locations = $request->input('location');
            if (!is_array($locations)) {
                $locations = [$locations];
            }
            $query->whereIn('location', $locations);
        }

        // Filter by brand/merk
        if ($request->has('brand')) {
            $query->where('brand', 'like', '%' . $request->brand . '%');
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Price range filter
        if ($request->has('min_price') && $request->has('max_price')) {
            $query->whereBetween('price', [$request->min_price, $request->max_price]);
        }

        // Only show products with stock
        if ($request->has('in_stock') && $request->in_stock == 'true') {
            $query->where('stock', '>', 0);
        }

        // Pagination
        $perPage = $request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'pagination' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ]
        ], 200);
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'product' => $product->load('category')
        ], 200);
    }

    /**
     * Get available categories
     */
    public function categories()
    {
        $categories = \App\Models\Category::all();
        return response()->json(['categories' => $categories], 200);
    }

    /**
     * Get available locations
     */
    public function locations()
    {
        $locations = ['Air Asin/Laut', 'Air Tawar', 'Kolam'];
        return response()->json(['locations' => $locations], 200);
    }

    /**
     * Get available brands
     */
    public function brands()
    {
        $brands = Product::distinct()->pluck('brand')->filter()->values();
        return response()->json(['brands' => $brands], 200);
    }
}
