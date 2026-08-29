<?php

use App\Http\Controllers\Api\{AuthController, ContactController, DashboardController, FilmController, GalleryController, HomeController, MicMtaaniAdminController, MicMtaaniController, NewsController, NotificationController, PaymentController, PodcastController, ProductionController, ReviewController, ServiceController, SettingController, SeriesController, SubscriptionController, SubscriptionPlanController, TalentController, TestimonialController, TicketController, UploadController, UserController, VideoStreamController};
use Illuminate\Support\Facades\Route;

// Public API routes
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:login');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:reset-password');

Route::get('/home', [HomeController::class, 'index']);

Route::get('/films', [FilmController::class, 'index']);
Route::get('/films/{slug}', [FilmController::class, 'show']);

Route::get('/series', [SeriesController::class, 'index']);
Route::get('/series/{slug}', [SeriesController::class, 'show']);

Route::get('/podcasts', [PodcastController::class, 'index']);
Route::get('/podcasts/{slug}', [PodcastController::class, 'show']);

Route::get('/stream', [VideoStreamController::class, 'stream']); // Public — trailers only (full_video_url is null in public responses)

Route::get('/services', [ServiceController::class, 'index']);

Route::get('/talent', [TalentController::class, 'index']);
Route::get('/talent/{slug}', [TalentController::class, 'show']);

// Actors alias — the frontend refers to talent as actors.
Route::get('/actors', [TalentController::class, 'index']);
Route::get('/actors/{slug}', [TalentController::class, 'show']);

Route::get('/productions', [ProductionController::class, 'index']);

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show']);

Route::get('/testimonials', [TestimonialController::class, 'index']);

Route::get('/gallery', [GalleryController::class, 'index']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/subscribe', [ContactController::class, 'subscribe'])->middleware('throttle:subscribe');

Route::post('/reviews', [ReviewController::class, 'store'])->middleware('throttle:reviews');

// ─── Mic Mtaani Public API ──────────────────────────────────────
Route::prefix('micmtaani')->group(function () {
    Route::get('/', [MicMtaaniController::class, 'homepage']);
    Route::get('/articles', [MicMtaaniController::class, 'articles']);
    Route::get('/articles/{slug}', [MicMtaaniController::class, 'article']);
    Route::post('/articles/{slug}/comments', [MicMtaaniController::class, 'addComment'])->middleware('throttle:micmtaani');
    Route::get('/categories', [MicMtaaniController::class, 'categories']);
    Route::get('/journalists', [MicMtaaniController::class, 'journalists']);
    Route::get('/journalists/{slug}', [MicMtaaniController::class, 'journalist']);
    Route::get('/events', [MicMtaaniController::class, 'events']);
    Route::get('/businesses', [MicMtaaniController::class, 'businesses']);
    Route::get('/businesses/{slug}', [MicMtaaniController::class, 'business']);
    Route::get('/search', [MicMtaaniController::class, 'search']);
    Route::post('/submit', [MicMtaaniController::class, 'submit'])->middleware('throttle:micmtaani');
    Route::post('/subscribe', [MicMtaaniController::class, 'subscribe'])->middleware('throttle:subscribe');
});

// Protected routes (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Authenticated video streaming — requires active subscription
    Route::get('/stream/{slug}', [VideoStreamController::class, 'streamFilm']);

    // ─── Admin API (admin-only) ───────────────────────────────────
    Route::middleware('admin')->group(function () {
        Route::post('/upload', [UploadController::class, 'store']);

        Route::get('/admin/contacts', [ContactController::class, 'index']);
        Route::put('/admin/contacts/{id}', [ContactController::class, 'updateStatus']);

        Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);

        Route::apiResource('/admin/films', FilmController::class)->except(['index', 'show']);
        Route::apiResource('/admin/series', SeriesController::class)->except(['index', 'show']);
        Route::apiResource('/admin/podcasts', PodcastController::class)->except(['index', 'show']);
        Route::get('/admin/podcasts/{id}/episodes', [PodcastController::class, 'episodes']);
        Route::post('/admin/podcasts/{id}/episodes', [PodcastController::class, 'storeEpisode']);
        Route::put('/admin/podcast-episodes/{id}', [PodcastController::class, 'updateEpisode']);
        Route::delete('/admin/podcast-episodes/{id}', [PodcastController::class, 'destroyEpisode']);
        Route::get('/admin/series/{id}/seasons', [SeriesController::class, 'seasons']);
        Route::post('/admin/series/{id}/seasons', [SeriesController::class, 'storeSeason']);
        Route::put('/admin/seasons/{id}', [SeriesController::class, 'updateSeason']);
        Route::delete('/admin/seasons/{id}', [SeriesController::class, 'destroySeason']);
        Route::get('/admin/seasons/{id}/episodes', [SeriesController::class, 'episodes']);
        Route::post('/admin/seasons/{id}/episodes', [SeriesController::class, 'storeEpisode']);
        Route::put('/admin/episodes/{id}', [SeriesController::class, 'updateEpisode']);
        Route::delete('/admin/episodes/{id}', [SeriesController::class, 'destroyEpisode']);
        Route::apiResource('/admin/services', ServiceController::class)->except(['index']);
        Route::apiResource('/admin/talent', TalentController::class)->except(['index', 'show']);
        Route::apiResource('/admin/productions', ProductionController::class)->except(['index']);
        Route::apiResource('/admin/news', NewsController::class)->except(['index', 'show']);
        Route::apiResource('/admin/testimonials', TestimonialController::class)->except(['index']);
        Route::apiResource('/admin/gallery', GalleryController::class)->except(['index']);

        // ─── Payments & Subscriptions Admin API ─────────────────────
        Route::get('/admin/subscription-plans', [SubscriptionPlanController::class, 'index']);
        Route::post('/admin/subscription-plans', [SubscriptionPlanController::class, 'store']);
        Route::put('/admin/subscription-plans/{id}', [SubscriptionPlanController::class, 'update']);
        Route::delete('/admin/subscription-plans/{id}', [SubscriptionPlanController::class, 'destroy']);

        Route::get('/admin/subscriptions', [SubscriptionController::class, 'index']);
        Route::get('/admin/payments', [PaymentController::class, 'index']);

        // ─── Reviews, Tickets & Notifications Admin API ──────────────
        Route::get('/admin/reviews', [ReviewController::class, 'index']);
        Route::put('/admin/reviews/{id}', [ReviewController::class, 'update']);
        Route::delete('/admin/reviews/{id}', [ReviewController::class, 'destroy']);

        Route::get('/admin/tickets', [TicketController::class, 'index']);
        Route::post('/admin/tickets', [TicketController::class, 'store']);
        Route::put('/admin/tickets/{id}', [TicketController::class, 'update']);
        Route::delete('/admin/tickets/{id}', [TicketController::class, 'destroy']);

        Route::get('/admin/notifications', [NotificationController::class, 'index']);
        Route::post('/admin/notifications', [NotificationController::class, 'store']);
        Route::delete('/admin/notifications/{id}', [NotificationController::class, 'destroy']);

        // ─── Users & Settings Admin API ────────────────────────────
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::put('/admin/users/{id}/role', [UserController::class, 'updateRole']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);

        Route::get('/admin/settings', [SettingController::class, 'index']);
        Route::put('/admin/settings', [SettingController::class, 'update']);

        // ─── Mic Mtaani Admin API ─────────────────────────────────────
        Route::prefix('admin/micmtaani')->group(function () {
            Route::get('/articles', [MicMtaaniAdminController::class, 'articles']);
            Route::post('/articles', [MicMtaaniAdminController::class, 'storeArticle']);
            Route::put('/articles/{id}', [MicMtaaniAdminController::class, 'updateArticle']);
            Route::delete('/articles/{id}', [MicMtaaniAdminController::class, 'deleteArticle']);

            Route::post('/categories', [MicMtaaniAdminController::class, 'storeCategory']);
            Route::delete('/categories/{id}', [MicMtaaniAdminController::class, 'deleteCategory']);

            Route::get('/journalists', [MicMtaaniAdminController::class, 'journalists']);
            Route::post('/journalists', [MicMtaaniAdminController::class, 'storeJournalist']);
            Route::delete('/journalists/{id}', [MicMtaaniAdminController::class, 'deleteJournalist']);

            Route::get('/submissions', [MicMtaaniAdminController::class, 'submissions']);
            Route::post('/submissions/{id}/approve', [MicMtaaniAdminController::class, 'approveSubmission']);
            Route::post('/submissions/{id}/reject', [MicMtaaniAdminController::class, 'rejectSubmission']);

            Route::get('/comments', [MicMtaaniAdminController::class, 'pendingComments']);
            Route::post('/comments/{id}/approve', [MicMtaaniAdminController::class, 'approveComment']);
            Route::delete('/comments/{id}', [MicMtaaniAdminController::class, 'deleteComment']);

            Route::post('/events', [MicMtaaniAdminController::class, 'storeEvent']);
            Route::delete('/events/{id}', [MicMtaaniAdminController::class, 'deleteEvent']);

            Route::post('/businesses', [MicMtaaniAdminController::class, 'storeBusiness']);
            Route::delete('/businesses/{id}', [MicMtaaniAdminController::class, 'deleteBusiness']);
        });
    });
});
