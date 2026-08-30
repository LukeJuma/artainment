<?php

namespace Tests\Feature;

use App\Models\Film;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SmokeTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────
    // 1. Public API endpoints — no auth required
    // ─────────────────────────────────────────────────────────────

    public function test_home_endpoint_returns_200(): void
    {
        $this->getJson('/api/home')->assertOk();
    }

    public function test_films_index_returns_200_with_paginated_shape(): void
    {
        Film::create([
            'title' => 'Test Film',
            'slug' => 'test-film',
            'genre' => 'Drama',
            'year' => '2026',
            'status' => 'completed',
        ]);

        $res = $this->getJson('/api/films');
        $res->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'title', 'slug', 'has_full_video']],
            ]);
    }

    public function test_film_detail_hides_full_video_url_from_public(): void
    {
        Film::create([
            'title' => 'Private Film',
            'slug' => 'private-film',
            'genre' => 'Drama',
            'year' => '2026',
            'status' => 'completed',
            'full_video_url' => '/storage/full/private.mp4',
        ]);

        $res = $this->getJson('/api/films/private-film');
        $res->assertOk()
            ->assertJsonFragment(['has_full_video' => true])
            ->assertJsonMissing(['full_video_url' => '/storage/full/private.mp4']);
    }

    public function test_film_detail_exposes_youtube_url(): void
    {
        Film::create([
            'title' => 'YT Film',
            'slug' => 'yt-film',
            'genre' => 'Drama',
            'year' => '2026',
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ]);

        $res = $this->getJson('/api/films/yt-film');
        $res->assertOk()
            ->assertJsonFragment(['youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'])
            ->assertJsonFragment(['has_full_video' => true]);
    }

    public function test_stream_endpoint_returns_422_without_file_param(): void
    {
        $this->getJson('/api/stream')->assertStatus(422);
    }

    public function test_stream_endpoint_returns_404_for_missing_local_file(): void
    {
        $this->getJson('/api/stream?file=nonexistent.mp4')->assertStatus(404);
    }

    public function test_stream_endpoint_redirects_for_http_url(): void
    {
        $res = $this->getJson('/api/stream?file=https://example.com/video.mp4');
        $res->assertRedirect('https://example.com/video.mp4');
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Auth flow: login → token → user
    // ─────────────────────────────────────────────────────────────

    public function test_login_returns_token_and_user(): void
    {
        User::create([
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'is_admin' => false,
        ]);

        $res = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $res->assertOk()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
    }

    public function test_auth_user_endpoint_with_valid_token(): void
    {
        $user = User::create([
            'name' => 'AuthUser',
            'email' => 'auth@example.com',
            'password' => bcrypt('password'),
            'is_admin' => false,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonFragment(['email' => 'auth@example.com']);
    }

    public function test_auth_user_returns_401_without_token(): void
    {
        $this->getJson('/api/auth/user')->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Admin endpoints: dashboard, upload, CRUD
    // ─────────────────────────────────────────────────────────────

    private function adminToken(): string
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'is_admin' => true,
        ]);

        return $admin->createToken('admin')->plainTextToken;
    }

    public function test_admin_dashboard_stats_returns_200(): void
    {
        $token = $this->adminToken();

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/dashboard/stats')
            ->assertOk();
    }

    public function test_admin_upload_stores_file_on_configured_disk(): void
    {
        Storage::fake('public');

        $token = $this->adminToken();
        $file = UploadedFile::fake()->image('poster.jpg', 800, 600);

        $res = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/upload', [
                'file' => $file,
                'folder' => 'posters',
            ]);

        $res->assertCreated()
            ->assertJsonStructure(['url', 'path', 'filename']);

        Storage::disk('public')->assertExists('posters/' . $file->hashName());
    }

    public function test_admin_upload_rejects_unauthenticated(): void
    {
        $file = UploadedFile::fake()->image('poster.jpg');

        $this->postJson('/api/upload', ['file' => $file])
            ->assertStatus(401);
    }

    public function test_admin_films_create_and_public_exposure(): void
    {
        $token = $this->adminToken();

        $res = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/admin/films', [
                'title' => 'Admin Film',
                'slug' => 'admin-film',
                'genre' => 'Drama',
                'year' => '2026',
                'full_video_url' => '/storage/full/test.mp4',
            ]);

        $res->assertCreated();
    }

    public function test_public_film_detail_hides_full_video_and_exposes_has_full_video(): void
    {
        Film::create([
            'title' => 'Private Film',
            'slug' => 'private-film-pub',
            'genre' => 'Drama',
            'year' => '2026',
            'full_video_url' => '/storage/full/private.mp4',
        ]);

        $this->getJson('/api/films/private-film-pub')
            ->assertOk()
            ->assertJsonFragment(['has_full_video' => true])
            ->assertJsonMissing(['full_video_url' => '/storage/full/private.mp4']);
    }

    public function test_admin_micmtaani_articles_endpoint(): void
    {
        $token = $this->adminToken();

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/micmtaani/articles')
            ->assertOk();
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Filesystem / upload disk configuration
    // ─────────────────────────────────────────────────────────────

    public function test_public_disk_driver_is_configurable(): void
    {
        $driver = config('filesystems.disks.public.driver');
        $this->assertContains($driver, ['local', 's3']);
    }

    public function test_public_disk_has_supabase_s3_fallbacks(): void
    {
        $disk = config('filesystems.disks.public');

        $this->assertArrayHasKey('key', $disk);
        $this->assertArrayHasKey('secret', $disk);
        $this->assertArrayHasKey('bucket', $disk);
        $this->assertArrayHasKey('endpoint', $disk);
        $this->assertArrayHasKey('use_path_style_endpoint', $disk);
    }

    public function test_filesystem_default_is_configurable(): void
    {
        $default = config('filesystems.default');
        $this->assertContains($default, ['local', 'public', 's3']);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Stream URL handling
    // ─────────────────────────────────────────────────────────────

    public function test_stream_redirects_http_urls_away(): void
    {
        $httpUrls = [
            'https://supabase.co/storage/v1/object/public/media/video.mp4',
            'http://cdn.example.com/trailer.mov',
        ];

        foreach ($httpUrls as $url) {
            $res = $this->getJson('/api/stream?file=' . urlencode($url));
            $res->assertRedirect($url);
        }
    }

    public function test_stream_rejects_path_traversal(): void
    {
        $this->getJson('/api/stream?file=../../etc/passwd')->assertStatus(422);
        $this->getJson('/api/stream?file=..%2F..%2Fetc%2Fpasswd')->assertStatus(422);
    }

    public function test_protected_stream_requires_auth(): void
    {
        $film = Film::create([
            'title' => 'Protected',
            'slug' => 'protected-film',
            'genre' => 'Drama',
            'year' => '2026',
            'full_video_url' => '/storage/full/protected.mp4',
        ]);

        $this->getJson('/api/stream/protected-film')->assertStatus(401);
    }

    public function test_protected_stream_requires_subscription(): void
    {
        $user = User::create([
            'name' => 'FreeUser',
            'email' => 'free@example.com',
            'password' => bcrypt('password'),
            'is_admin' => false,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        Film::create([
            'title' => 'Sub Film',
            'slug' => 'sub-film',
            'genre' => 'Drama',
            'year' => '2026',
            'full_video_url' => '/storage/full/sub.mp4',
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/stream/sub-film')
            ->assertStatus(403)
           ->assertJsonFragment(['code' => 'subscription_required']);
    }

    // ─────────────────────────────────────────────────────────────
    // 6. CORS / FRONTEND_URL configuration
    // ─────────────────────────────────────────────────────────────

    public function test_cors_config_reads_frontend_url(): void
    {
        $origins = config('cors.allowed_origins');
        $this->assertIsArray($origins);
        $this->assertNotEmpty($origins);
    }

    public function test_cors_supports_credentials(): void
    {
        $this->assertTrue(config('cors.supports_credentials'));
    }
}
