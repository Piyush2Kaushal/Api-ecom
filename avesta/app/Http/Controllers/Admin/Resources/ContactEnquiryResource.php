<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\ContactEnquiry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ContactEnquiryResource extends ResourceController
{
    protected string $model = ContactEnquiry::class;

    protected string $title = 'Enquiries';

    protected string $singular = 'Enquiry';

    protected ?string $description = 'Contact-form messages and product questions.';

    protected bool $canCreate = false;

    protected array $searchable = ['name', 'email', 'subject', 'company', 'message'];

    public const STATUSES = ['new' => 'New', 'replied' => 'Replied', 'closed' => 'Closed'];

    public static function slug(): string
    {
        return 'enquiries';
    }

    protected function query(Request $request): Builder
    {
        return ContactEnquiry::with('product:id,name,slug');
    }

    protected function filters(): array
    {
        return [['key' => 'status', 'label' => 'Status', 'options' => static::options(self::STATUSES)]];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'subject', 'label' => 'Subject', 'type' => 'text', 'readonly' => true],
            ['name' => 'product_name', 'label' => 'About product', 'type' => 'text', 'readonly' => true],
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'company', 'label' => 'Company', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'readonly' => true, 'col' => 6],
            ['name' => 'phone', 'label' => 'Phone', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'message', 'label' => 'Message', 'type' => 'textarea', 'readonly' => true],
            ['name' => 'manage', 'label' => 'Follow-up', 'type' => 'section'],
            ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'required' => true, 'options' => static::options(self::STATUSES)],
            ['name' => 'admin_note', 'label' => 'Internal notes', 'type' => 'textarea'],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'From', 'type' => 'title', 'sub' => 'email'],
            ['key' => 'subject', 'label' => 'Subject', 'type' => 'text', 'sub' => 'excerpt'],
            ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
            ['key' => 'created_at', 'label' => 'Received', 'type' => 'date'],
        ];
    }

    protected function transform(Model $e): array
    {
        return array_merge($e->toArray(), [
            'product_name' => $e->product?->name,
            'excerpt' => \Illuminate\Support\Str::limit($e->message, 80),
            'mailto' => 'mailto:'.$e->email.'?subject='.rawurlencode('Re: '.($e->subject ?: 'Your enquiry')),
        ]);
    }
}
