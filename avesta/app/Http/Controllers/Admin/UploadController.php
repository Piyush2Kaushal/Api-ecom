<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MediaService;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'file' => 'required|file|max:20480|mimes:jpg,jpeg,png,webp,gif,svg,pdf,ico',
            'folder' => 'nullable|alpha_dash|max:40',
        ]);
        $path = MediaService::store($data['file'], $data['folder'] ?? 'media');

        return response()->json(['path' => $path, 'url' => media_url($path), 'name' => $data['file']->getClientOriginalName()]);
    }
}
