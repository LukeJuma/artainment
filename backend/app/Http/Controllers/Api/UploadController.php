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
        // Increase PHP upload limits at runtime to support 2GB uploads
        ini_set('upload_max_filesize', '2048M');
        ini_set('post_max_size', '2048M');
        ini_set('memory_limit', '2048M');
        ini_set('max_execution_time', '600'); // 10 minutes for large uploads
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

        // Sanitize folder input to prevent directory traversal attacks
        $rawFolder = $request->input('folder', 'uploads');
        $folder = $this->sanitizeFolder($rawFolder);
        
        $file = $request->file('file');
        $path = $file->store($folder, 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'url' => $url,
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
        ], 201);
    }

    /**
     * Sanitize folder input to prevent directory traversal attacks
     */
    private function sanitizeFolder(string $folder): string
    {
        // Define allowed folder names
        $allowedFolders = [
            'uploads',
            'films',
            'series', 
            'podcasts',
            'news',
            'talent',
            'gallery',
            'mic-mtaani',
            'thumbnails',
            'trailers'
        ];

        // Clean the folder name - remove dots, slashes, and limit to alphanumeric plus dash/underscore
        $cleanFolder = preg_replace('/[^a-z0-9\-_]/', '', strtolower(trim($folder)));
        
        // If cleaned folder is in allowed list, use it; otherwise default to 'uploads'
        return in_array($cleanFolder, $allowedFolders) ? $cleanFolder : 'uploads';
    }
}
