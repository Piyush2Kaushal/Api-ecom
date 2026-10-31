<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Schema-driven admin CRUD. Each resource declares its fields and columns;
 * the React page Admin/Resource renders a consistent table + slide-over form.
 *
 * Field types: text, email, url, textarea, richtext, number, money, percent, toggle, select,
 * multiselect, image, file, date, datetime, tags, repeater, color, section (visual heading).
 */
abstract class ResourceController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    protected string $title;

    protected string $singular;

    protected ?string $description = null;

    protected bool $sortable = false;

    protected bool $canCreate = true;

    protected bool $canDelete = true;

    protected array $searchable = ['name'];

    protected string $defaultSort = 'id';

    protected string $defaultDirection = 'desc';

    protected int $perPage = 25;

    abstract public static function slug(): string;

    abstract protected function fields(): array;

    abstract protected function columns(): array;

    /** Select-style filters shown above the table: [['key' => 'status', 'label' => 'Status', 'options' => [...]]] */
    protected function filters(): array
    {
        return [];
    }

    protected function query(Request $request): Builder
    {
        return $this->model::query();
    }

    protected function applyFilter(Builder $q, string $key, mixed $value): void
    {
        $q->where($key, $value);
    }

    protected function transform(Model $item): array
    {
        return $item->toArray();
    }

    /** Extra props for the page (e.g. help panels). */
    protected function extra(Request $request): array
    {
        return [];
    }

    protected function prepare(array $data, ?Model $item): array
    {
        return $data;
    }

    protected function afterSave(Model $item, array $data): void {}

    public static function routes(): void
    {
        $slug = static::slug();
        $name = str_replace('-', '_', $slug);
        Route::get($slug, [static::class, 'index'])->name($name.'.index');
        Route::post($slug, [static::class, 'store'])->name($name.'.store');
        Route::post($slug.'/reorder', [static::class, 'reorder'])->name($name.'.reorder');
        Route::post($slug.'/bulk-delete', [static::class, 'bulkDestroy'])->name($name.'.bulk_delete');
        Route::put($slug.'/{id}', [static::class, 'update'])->name($name.'.update');
        Route::patch($slug.'/{id}/toggle', [static::class, 'toggle'])->name($name.'.toggle');
        Route::delete($slug.'/{id}', [static::class, 'destroy'])->name($name.'.destroy');
    }

    public function index(Request $request)
    {
        $q = $this->query($request);
        if (($term = trim((string) $request->query('q'))) !== '' && $this->searchable) {
            $q->where(function ($w) use ($term) {
                foreach ($this->searchable as $col) {
                    $w->orWhere($col, 'like', "%{$term}%");
                }
            });
        }
        foreach ($this->filters() as $f) {
            $v = $request->query($f['key']);
            if ($v !== null && $v !== '') {
                $this->applyFilter($q, $f['key'], $v);
            }
        }
        $this->sortable ? $q->orderBy('sort_order')->orderBy('id') : $q->orderBy($this->defaultSort, $this->defaultDirection);

        $page = $q->paginate($this->sortable ? 500 : $this->perPage)->withQueryString();
        $page->getCollection()->transform(fn ($item) => $this->transform($item));

        return Inertia::render('Admin/Resource', array_merge([
            'resource' => [
                'slug' => static::slug(),
                'route' => 'admin.'.str_replace('-', '_', static::slug()),
                'title' => $this->title,
                'singular' => $this->singular,
                'description' => $this->description,
                'sortable' => $this->sortable,
                'canCreate' => $this->canCreate,
                'canDelete' => $this->canDelete,
                'searchable' => (bool) $this->searchable,
            ],
            'fields' => $this->fields(),
            'columns' => $this->columns(),
            'filterDefs' => $this->filters(),
            'items' => $page,
            'filters' => $request->only(array_merge(['q'], array_column($this->filters(), 'key'))),
        ], $this->extra($request)));
    }

    protected function rules(?Model $item): array
    {
        $rules = [];
        foreach ($this->fields() as $f) {
            if (($f['type'] ?? 'text') === 'section' || ! empty($f['readonly'])) {
                continue;
            }
            $req = ! empty($f['required']) ? 'required' : 'nullable';
            $name = $f['name'];
            $rules[$name] = match ($f['type'] ?? 'text') {
                'email' => [$req, 'email', 'max:190'],
                'textarea' => [$req, 'string', 'max:'.($f['max'] ?? 5000)],
                'richtext' => [$req, 'string'],
                'number', 'money', 'percent' => [$req, 'numeric', ...(isset($f['min']) ? ['min:'.$f['min']] : [])],
                'toggle' => ['boolean'],
                'select' => [$req, Rule::in(array_map('strval', array_column($f['options'] ?? [], 'value')))],
                'multiselect', 'tags', 'repeater' => [$req, 'array'],
                'date', 'datetime' => [$req, 'date'],
                default => [$req, 'string', 'max:'.($f['max'] ?? 500)],
            };
            if (! empty($f['unique'])) {
                $rules[$name][] = Rule::unique((new $this->model)->getTable(), $name)->ignore($item?->getKey());
            }
            if (($f['type'] ?? '') === 'repeater') {
                foreach ($f['fields'] ?? [] as $sub) {
                    $rules[$name.'.*.'.$sub['name']] = ['nullable'];
                }
            }
        }

        return $rules;
    }

    protected function validated(Request $request, ?Model $item): array
    {
        $data = $request->validate($this->rules($item));
        foreach ($this->fields() as $f) {
            $type = $f['type'] ?? 'text';
            if ($type === 'toggle' && ! array_key_exists($f['name'], $data)) {
                $data[$f['name']] = false;
            }
            if ($type === 'select' && isset($data[$f['name']]) && is_numeric($data[$f['name']]) && ! empty($f['numeric'])) {
                $data[$f['name']] = (int) $data[$f['name']];
            }
        }

        // Fields named settings.foo are folded into a JSON "settings" column.
        $nested = [];
        foreach ($data as $key => $value) {
            if (str_contains($key, '.') && ! str_contains($key, '*')) {
                Arr::set($nested, $key, $value);
                unset($data[$key]);
            }
        }

        return $this->prepare(array_replace_recursive($data, $nested), $item);
    }

    public function store(Request $request)
    {
        abort_unless($this->canCreate, 403);
        $data = $this->validated($request, null);
        if ($this->sortable && ! isset($data['sort_order'])) {
            $data['sort_order'] = (int) $this->model::max('sort_order') + 1;
        }
        $item = $this->model::create($data);
        $this->afterSave($item, $data);

        return back()->with('success', $this->singular.' created.');
    }

    public function update(Request $request, int $id)
    {
        $item = $this->model::findOrFail($id);
        $data = $this->validated($request, $item);
        $item->update($data);
        $this->afterSave($item, $data);

        return back()->with('success', $this->singular.' saved.');
    }

    public function toggle(Request $request, int $id)
    {
        $field = $request->validate(['field' => 'required|string|max:40'])['field'];
        $allowed = collect($this->fields())->where('type', 'toggle')->pluck('name')->all();
        abort_unless(in_array($field, $allowed, true), 422);
        $item = $this->model::findOrFail($id);
        $item->update([$field => ! $item->$field]);

        return back();
    }

    public function destroy(int $id)
    {
        abort_unless($this->canDelete, 403);
        $this->model::findOrFail($id)->delete();

        return back()->with('success', $this->singular.' deleted.');
    }

    public function bulkDestroy(Request $request)
    {
        abort_unless($this->canDelete, 403);
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];
        $this->model::whereIn('id', $ids)->get()->each->delete();

        return back()->with('success', count($ids).' item(s) deleted.');
    }

    public function reorder(Request $request)
    {
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];
        foreach ($ids as $i => $id) {
            $this->model::whereKey($id)->update(['sort_order' => $i]);
        }

        return back();
    }

    /* Helpers for building option lists */
    protected static function options(array $map): array
    {
        return collect($map)->map(fn ($label, $value) => ['value' => (string) $value, 'label' => $label])->values()->all();
    }
}
