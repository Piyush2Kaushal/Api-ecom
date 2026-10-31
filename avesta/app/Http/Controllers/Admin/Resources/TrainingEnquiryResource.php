<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\TrainingEnquiry;
use Illuminate\Http\Request;

class TrainingEnquiryResource extends ResourceController
{
    protected string $model = TrainingEnquiry::class;

    protected string $title = 'Training registrations';

    protected string $singular = 'Registration';

    protected bool $canCreate = false;

    protected array $searchable = ['full_name', 'email', 'company_name', 'course_title', 'phone'];

    public const STATUSES = ['new' => 'New', 'contacted' => 'Contacted', 'confirmed' => 'Confirmed', 'completed' => 'Completed', 'cancelled' => 'Cancelled'];

    public static function slug(): string
    {
        return 'training';
    }

    protected function filters(): array
    {
        return [['key' => 'status', 'label' => 'Status', 'options' => static::options(self::STATUSES)]];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'course_title', 'label' => 'Course', 'type' => 'text', 'readonly' => true],
            ['name' => 'full_name', 'label' => 'Name', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'company_name', 'label' => 'Company', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'readonly' => true, 'col' => 6],
            ['name' => 'phone', 'label' => 'Phone', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'address', 'label' => 'Address', 'type' => 'text', 'readonly' => true, 'col' => 8],
            ['name' => 'postcode', 'label' => 'Postcode', 'type' => 'text', 'readonly' => true, 'col' => 4],
            ['name' => 'message', 'label' => 'Message', 'type' => 'textarea', 'readonly' => true],
            ['name' => 'manage', 'label' => 'Follow-up', 'type' => 'section'],
            ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'required' => true, 'options' => static::options(self::STATUSES)],
            ['name' => 'admin_note', 'label' => 'Internal notes', 'type' => 'textarea'],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'full_name', 'label' => 'Name', 'type' => 'title', 'sub' => 'company_name'],
            ['key' => 'course_title', 'label' => 'Course', 'type' => 'text'],
            ['key' => 'email', 'label' => 'Contact', 'type' => 'text', 'sub' => 'phone'],
            ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
            ['key' => 'created_at', 'label' => 'Received', 'type' => 'date'],
        ];
    }

    protected function extra(Request $request): array
    {
        return ['links' => [['label' => 'Manage courses →', 'route' => 'admin.training_courses.index']]];
    }
}
