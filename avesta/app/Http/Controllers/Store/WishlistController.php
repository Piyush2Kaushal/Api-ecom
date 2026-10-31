<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function toggle(Request $request, Product $product)
    {
        $user = $request->user('web');
        $row = Wishlist::where('user_id', $user->id)->where('product_id', $product->id)->first();
        $row ? $row->delete() : Wishlist::create(['user_id' => $user->id, 'product_id' => $product->id]);

        return back()->with('success', $row ? 'Removed from your wishlist.' : 'Saved to your wishlist.');
    }
}
