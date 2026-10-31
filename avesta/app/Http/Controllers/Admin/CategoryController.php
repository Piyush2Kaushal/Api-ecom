<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $counts = Product::selectRaw('category_id, COUNT(*) as c')->groupBy('category_id')->pluck('c', 'category_id');
        $all = Category::orderBy('sort_order')->orderBy('name')->get();
        $byParent = $all->groupBy(fn ($c) => $c->parent_id ?? 0);
        $build = function ($pid) use (&$build, $byParent, $counts) {
            return ($byParent[$pid] ?? collect())->map(fn ($c) => array_merge($c->toArray(), [
                'products_count' => (int) ($counts[$c->id] ?? 0),
                'children' => $build($c->id),
            ]))->values()->all();
        };

        return Inertia::render('Admin/Categories', [
            'tree' => $build(0),
            'options' => ProductController::categoryOptions(),
            'maxDepth' => Category::MAX_DEPTH,
        ]);
    }

    protected function rules(?Category $category = null): array
    {
        return [
            'name' => 'required|string|max:150',
            'slug' => ['nullable', 'string', 'max:190', Rule::unique('categories', 'slug')->ignore($category?->id)],
            'parent_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string|max:2000',
            'image' => 'nullable|string|max:500', 'banner' => 'nullable|string|max:500',
            'is_active' => 'boolean', 'show_in_menu' => 'boolean', 'show_on_home' => 'boolean',
            'sort_order' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255', 'meta_description' => 'nullable|string|max:500',
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $parent = isset($data['parent_id']) ? Category::find($data['parent_id']) : null;
        $depth = $parent ? $parent->depth + 1 : 1;
        if ($depth > Category::MAX_DEPTH) {
            throw ValidationException::withMessages(['parent_id' => 'Categories can be at most '.Category::MAX_DEPTH.' levels deep.']);
        }
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['name']);
        $data['depth'] = $depth;
        $data['sort_order'] = $data['sort_order'] ?? ((int) Category::where('parent_id', $data['parent_id'] ?? null)->max('sort_order') + 1);
        Category::create($data);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate($this->rules($category));
        $newParent = isset($data['parent_id']) ? Category::find($data['parent_id']) : null;
        if ($newParent && in_array($newParent->id, Category::descendantIds($category->id), true)) {
            throw ValidationException::withMessages(['parent_id' => 'A category cannot be moved inside itself.']);
        }
        $depth = $newParent ? $newParent->depth + 1 : 1;
        if ($depth + $category->subtreeHeight() > Category::MAX_DEPTH) {
            throw ValidationException::withMessages(['parent_id' => 'This move would make the tree deeper than '.Category::MAX_DEPTH.' levels.']);
        }
        $data['slug'] = $data['slug'] ? Str::slug($data['slug']) : $category->slug;
        DB::transaction(function () use ($category, $data, $depth) {
            $shift = $depth - $category->depth;
            $category->update($data + ['depth' => $depth]);
            if ($shift !== 0) {
                Category::whereIn('id', array_diff(Category::descendantIds($category->id), [$category->id]))->increment('depth', $shift);
            }
        });

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Request $request, Category $category)
    {
        DB::transaction(function () use ($category) {
            // Products and sub-categories move up to the parent rather than being lost.
            Product::where('category_id', $category->id)->update(['category_id' => $category->parent_id]);
            foreach (Category::where('parent_id', $category->id)->get() as $child) {
                $child->update(['parent_id' => $category->parent_id]);
                Category::whereIn('id', Category::descendantIds($child->id))->decrement('depth');
            }
            $category->delete();
        });

        return back()->with('success', 'Category deleted. Its products and sub-categories moved up one level.');
    }

    public function reorder(Request $request)
    {
        $data = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($data['ids'] as $i => $id) {
            Category::whereKey($id)->update(['sort_order' => $i]);
        }

        return back();
    }

    protected function uniqueSlug(string $value): string
    {
        $slug = Str::slug($value);

        return Category::where('slug', $slug)->exists() ? $slug.'-'.Str::lower(Str::random(4)) : $slug;
    }
}
