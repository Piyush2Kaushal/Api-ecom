<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingEnquiry extends Model
{
    protected $guarded = ['id'];

    public function course()
    {
        return $this->belongsTo(TrainingCourse::class, 'training_course_id');
    }
}
