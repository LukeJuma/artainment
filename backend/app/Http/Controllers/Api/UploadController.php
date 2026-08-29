<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,svg,mp4,mov,avi',
                function ($attribute, $value, $fail) {
                    $ext = strtolower($value->getClientOriginalExtension());
                    $isVideo = in_array($ext, ['mp4', 'mov', 'avi'], true);
                    $maxKb = $isVideo ? 2097152 : 10240;
                    if ($value->getSize() > $maxKb * 1024) {
                        $maxMb = $maxKb / 1024;
                        $label = $maxMb >= 1024 ? (round($maxMb / 1024, 1) . 'GB') : ($maxMb . 'MB');
                        $fail("The file exceeds the maximum allowed size of {$label}.");
                    }
                },
            ],
            'folder' => 'nullable|string|max:100',
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');
        $path = $file->store($folder, 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'url' => $url,
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
        ], 201);
    }
}
