<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Get all products (with pagination)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $category = $request->input('category');

        $query = Product::query();

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
        }

        if ($category) {
            $query->where('category_id', $category);
        }

        $products = $query->with('category')
            ->paginate($perPage);

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
     * Create new product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'brand' => 'nullable|string|max:255',
            'location' => 'nullable|in:Air Asin/Laut,Air Tawar,Kolam',
            'specifications' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Prepare data
        $data = $request->except('image');
        
        // Parse specifications from JSON string to array
        if (isset($data['specifications']) && is_string($data['specifications'])) {
            try {
                $specs = json_decode($data['specifications'], true);
                $data['specifications'] = $specs ?: [];
            } catch (\Exception $e) {
                $data['specifications'] = [];
            }
        }

        // Convert category_id to integer
        $data['category_id'] = (int) $data['category_id'];
        $data['price'] = (float) $data['price'];
        $data['stock'] = (int) $data['stock'];

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('products', $filename, 'public');
                $data['image'] = '/storage/' . $path;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal upload gambar: ' . $e->getMessage()], 500);
            }
        }

        $product = Product::create($data);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json(['product' => $product], 200);
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|integer|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'brand' => 'nullable|string|max:255',
            'location' => 'nullable|in:Air Asin/Laut,Air Tawar,Kolam',
            'specifications' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Prepare data
        $data = $request->except('image');
        
        // Parse specifications from JSON string to array
        if (isset($data['specifications']) && is_string($data['specifications'])) {
            try {
                $specs = json_decode($data['specifications'], true);
                $data['specifications'] = $specs ?: [];
            } catch (\Exception $e) {
                $data['specifications'] = [];
            }
        }

        // Convert to proper types
        if (isset($data['category_id'])) $data['category_id'] = (int) $data['category_id'];
        if (isset($data['price'])) $data['price'] = (float) $data['price'];
        if (isset($data['stock'])) $data['stock'] = (int) $data['stock'];

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('products', $filename, 'public');
                $data['image'] = '/storage/' . $path;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal upload gambar: ' . $e->getMessage()], 500);
            }
        }

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ], 200);
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ], 200);
    }

    /**
     * Bulk update stock
     */
    public function updateStock(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->products as $item) {
            Product::find($item['id'])->update(['stock' => $item['stock']]);
        }

        return response()->json([
            'message' => 'Stock updated successfully',
        ], 200);
    }
}
