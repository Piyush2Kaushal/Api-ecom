<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterResource extends ResourceController
{
    protected string $model = NewsletterSubscriber::class;

    protected string $title = 'Newsletter';

    protected string $singular = 'Subscriber';

    protected ?string $description = 'Export the list to your email marketing tool (Mailchimp, Brevo…).';

    protected array $searchable = ['email'];

    public static function slug(): string
    {
        return 'newsletter';
    }

    protected function fields(): array
    {
        return [
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true, 'unique' => true],
            ['name' => 'is_active', 'label' => 'Subscribed', 'type' => 'toggle', 'default' => true],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'email', 'label' => 'Email', 'type' => 'title'],
            ['key' => 'created_at', 'label' => 'Joined', 'type' => 'date'],
            ['key' => 'is_active', 'label' => 'Subscribed', 'type' => 'toggle'],
        ];
    }

    protected function extra(Request $request): array
    {
        return ['exports' => [['label' => 'Export Excel', 'route' => 'admin.newsletter.export', 'params' => ['format' => 'xlsx']], ['label' => 'Export CSV', 'route' => 'admin.newsletter.export', 'params' => ['format' => 'csv']]]];
    }

    public function export(Request $request)
    {
        return \App\Support\Exporter::download('newsletter', ['Email', 'Subscribed', 'Joined'],
            NewsletterSubscriber::orderBy('id')->lazy()->map(fn ($s) => [$s->email, $s->is_active, $s->created_at->format('Y-m-d')]), $request->query('format', 'xlsx'));
    }
}
