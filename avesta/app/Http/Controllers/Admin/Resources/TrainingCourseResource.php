<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\TrainingCourse;

class TrainingCourseResource extends ResourceController
{
    protected string $model = TrainingCourse::class;

    protected string $title = 'Training courses';

    protected string $singular = 'Course';

    protected ?string $description = 'Courses listed in the training registration form.';

    protected bool $sortable = true;

    protected array $searchable = ['title'];

    public static function slug(): string
    {
        return 'training-courses';
    }

    protected function fields(): array
    {
        return [
            ['name' => 'title', 'label' => 'Course name', 'type' => 'text', 'required' => true],
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
            ['name' => 'duration', 'label' => 'Duration', 'type' => 'text', 'col' => 6, 'placeholder' => '2 days'],
            ['name' => 'price_label', 'label' => 'Price / deposit label', 'type' => 'text', 'col' => 6, 'placeholder' => '£50 deposit'],
            ['name' => 'is_active', 'label' => 'Available', 'type' => 'toggle', 'default' => true],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'title', 'label' => 'Course', 'type' => 'title', 'sub' => 'duration'],
            ['key' => 'price_label', 'label' => 'Price', 'type' => 'text'],
            ['key' => 'is_active', 'label' => 'Available', 'type' => 'toggle'],
        ];
    }

    protected function extra(\Illuminate\Http\Request $request): array
    {
        return ['links' => [['label' => 'Registrations →', 'route' => 'admin.training.index']]];
    }
}
