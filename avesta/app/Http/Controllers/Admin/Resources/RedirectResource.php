<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\Redirect;
use Illuminate\Database\Eloquent\Model;

class RedirectResource extends ResourceController
{
    protected string $model = Redirect::class;

    protected string $title = 'Redirects';

    protected string $singular = 'Redirect';

    protected ?string $description = 'Send old links (e.g. from the previous Zoho store) to the new pages so you keep your Google rankings.';

    protected array $searchable = ['from_path', 'to_path'];

    public static function slug(): string
    {
        return 'redirects';
    }

    protected function fields(): array
    {
        return [
            ['name' => 'from_path', 'label' => 'Old path', 'type' => 'text', 'required' => true, 'unique' => true, 'placeholder' => '/products/old-camera/1234'],
            ['name' => 'to_path', 'label' => 'New path or URL', 'type' => 'text', 'required' => true, 'placeholder' => '/product/new-camera'],
            ['name' => 'status_code', 'label' => 'Type', 'type' => 'select', 'default' => '301', 'options' => static::options(['301' => 'Permanent (301)', '302' => 'Temporary (302)'])],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'from_path', 'label' => 'From', 'type' => 'title', 'mono' => true],
            ['key' => 'to_path', 'label' => 'To', 'type' => 'text'],
            ['key' => 'status_code', 'label' => 'Type', 'type' => 'badge'],
            ['key' => 'hits', 'label' => 'Hits', 'type' => 'number'],
        ];
    }

    protected function transform(Model $r): array
    {
        return array_merge($r->toArray(), ['status_code' => (string) $r->status_code]);
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $from = parse_url($data['from_path'], PHP_URL_PATH) ?: $data['from_path'];
        $data['from_path'] = '/'.trim($from, '/');
        $data['status_code'] = (int) ($data['status_code'] ?? 301);

        return $data;
    }
}
