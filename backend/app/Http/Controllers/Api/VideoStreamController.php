<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class VideoStreamController extends Controller
{
    /**
     * Public stream endpoint — serves trailer files only.
     * The frontend's videoStreamUrl() routes trailer paths here.
     * Full video streaming goes through the authenticated streamFilm() method.
     */
    public function stream(Request $request): BinaryFileResponse|JsonResponse|RedirectResponse
    {
        $file = $request->query('file');

        if (!is_string($file) || trim($file) === '') {
            return response()->json(['message' => 'No file specified.'], 422);
        }

        return $this->serveFile($file);
    }

    /**
     * Authenticated stream endpoint — serves a film's full video.
     * Requires auth:sanctum + an active (non-expired) subscription.
     * The slug is looked up in the URL; the file path comes from the film record.
     */
    public function streamFilm(Request $request, string $slug): BinaryFileResponse|JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $film = Film::where('slug', $slug)->first();
        if (!$film || !$film->full_video_url) {
            return response()->json(['message' => 'Film not found or no video available.'], 404);
        }

        $hasActive = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->exists();

        if (!$hasActive) {
            return response()->json([
                'message' => 'An active subscription is required to watch this film.',
                'code' => 'subscription_required',
            ], 403);
        }

        return $this->serveFile($film->full_video_url);
    }

    private function serveFile(string $file): BinaryFileResponse|JsonResponse|RedirectResponse
    {
        if (preg_match('/^https?:\/\//i', $file)) {
            return redirect()->away($file);
        }

        $path = str_replace('\\', '/', trim($file));
        $path = ltrim($path, '/');

        if ($path === '' || str_contains($path, '..')) {
            return response()->json(['message' => 'Invalid file path.'], 422);
        }

        $base = storage_path('app/public');
        $baseReal = realpath($base);
        $full = realpath($base . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path));

        if ($baseReal === false || $full === false || !is_file($full)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        $prefix = rtrim(str_replace('\\', '/', $baseReal), '/') . '/';
        if (!str_starts_with(str_replace('\\', '/', $full), $prefix)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        $ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
        $mime = match ($ext) {
            'mp4', 'm4v' => 'video/mp4',
            'mov' => 'video/quicktime',
            'avi' => 'video/x-msvideo',
            'webm' => 'video/webm',
            'mkv' => 'video/x-matroska',
            default => 'application/octet-stream',
        };

        $fileSize = filesize($full);
        $headers = [
            'Content-Type' => $mime,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache',
            'Content-Length' => $fileSize,
        ];

        $range = request()->header('Range');

        if ($range && preg_match('/bytes=(\d*)-(\d*)/', $range, $matches)) {
            $start = (int) ($matches[1] ?: 0);
            $end = isset($matches[2]) && $matches[2] !== '' ? (int) $matches[2] : $fileSize - 1;
            $end = min($end, $fileSize - 1);
            $chunkSize = $end - $start + 1;

            $headers['Content-Range'] = "bytes {$start}-{$end}/{$fileSize}";
            $headers['Content-Length'] = $chunkSize;

            $response = new BinaryFileResponse($full, 206, $headers);
            $response->setContent(function () use ($full, $start, $chunkSize) {
                $fp = fopen($full, 'rb');
                fseek($fp, $start);
                echo fread($fp, $chunkSize);
                fclose($fp);
            });

            return $response;
        }

        return new BinaryFileResponse($full, 200, $headers);
    }
}
