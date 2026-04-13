<?php

namespace App\Http\Controllers\Api;

use App\Models\Rating;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    /**
     * Store a rating
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_item_id' => 'required|exists:order_items,id',
                'rating' => 'required|integer|min:1|max:5',
                'review' => 'nullable|string|max:1000',
            ]);

            $orderItem = OrderItem::with('order')->findOrFail($validated['order_item_id']);

            // Verify the order belongs to authenticated user
            if ($orderItem->order->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Check if rating already exists
            $existingRating = Rating::where('order_item_id', $validated['order_item_id'])
                ->where('user_id', Auth::id())
                ->first();

            if ($existingRating) {
                return response()->json(['message' => 'Anda sudah memberikan rating produk ini'], 422);
            }

            $rating = Rating::create([
                'user_id' => Auth::id(),
                'product_id' => $orderItem->product_id,
                'order_item_id' => $validated['order_item_id'],
                'rating' => $validated['rating'],
                'review' => $validated['review'],
            ]);

            return response()->json([
                'message' => 'Rating berhasil disimpan',
                'data' => $rating->load('user', 'product'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan rating',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get ratings for a product
     */
    public function getProductRatings($productId)
    {
        try {
            $ratings = Rating::where('product_id', $productId)
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            $averageRating = $ratings->avg('rating');
            $totalRatings = $ratings->count();

            return response()->json([
                'data' => $ratings,
                'average_rating' => round($averageRating, 1),
                'total_ratings' => $totalRatings,
                'rating_distribution' => $this->getRatingDistribution($ratings),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memuat rating',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user rating for specific order item
     */
    public function getUserRating($orderItemId)
    {
        try {
            $rating = Rating::where('order_item_id', $orderItemId)
                ->where('user_id', Auth::id())
                ->with('product')
                ->first();

            return response()->json([
                'data' => $rating,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memuat rating',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get rating distribution
     */
    private function getRatingDistribution($ratings)
    {
        $distribution = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];

        foreach ($ratings as $rating) {
            $distribution[$rating->rating]++;
        }

        return $distribution;
    }
}
