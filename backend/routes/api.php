<?php

use App\Http\Controllers\Api\{AuthController, ContactController, FilmController, GalleryController, HomeController, MicMtaaniAdminController, MicMtaaniController, NewsController, ProductionController, ServiceController, TalentController, TestimonialController, UploadController};
use Illuminate\Support\Facades\Route;

// Public API routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/home', [HomeController::class, 'index']);

Route::get('/films', [FilmController::class, 'index']);
Route::get('/films/{slug}', [FilmController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);

Route::get('/talent', [TalentController::class, 'index']);
Route::get('/talent/{slug}', [TalentController::class, 'show']);

Route::get('/productions', [ProductionController::class, 'index']);

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show']);

Route::get('/testimonials', [TestimonialController::class, 'index']);

Route::get('/gallery', [GalleryController::class, 'index']);

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/subscribe', [ContactController::class, 'subscribe']);

// ─── Mic Mtaani Public API ──────────────────────────────────────
Route::prefix('micmtaani')->group(function () {
    Route::get('/', [MicMtaaniController::class, 'homepage']);
    Route::get('/articles', [MicMtaaniController::class, 'articles']);
    Route::get('/articles/{slug}', [MicMtaaniController::class, 'article']);
    Route::post('/articles/{slug}/comments', [MicMtaaniController::class, 'addComment']);
    Route::get('/categories', [MicMtaaniController::class, 'categories']);
    Route::get('/journalists', [MicMtaaniController::class, 'journalists']);
    Route::get('/journalists/{slug}', [MicMtaaniController::class, 'journalist']);
    Route::get('/events', [MicMtaaniController::class, 'events']);
    Route::get('/businesses', [MicMtaaniController::class, 'businesses']);
    Route::get('/businesses/{slug}', [MicMtaaniController::class, 'business']);
    Route::get('/search', [MicMtaaniController::class, 'search']);
    Route::post('/submit', [MicMtaaniController::class, 'submit']);
    Route::post('/subscribe', [MicMtaaniController::class, 'subscribe']);
});

// Protected routes (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::post('/upload', [UploadController::class, 'store']);

    Route::get('/admin/contacts', [ContactController::class, 'index']);
    Route::put('/admin/contacts/{id}', [ContactController::class, 'updateStatus']);

    Route::apiResource('/admin/films', FilmController::class)->except(['index', 'show']);
    Route::apiResource('/admin/services', ServiceController::class)->except(['index']);
    Route::apiResource('/admin/talent', TalentController::class)->except(['index', 'show']);
    Route::apiResource('/admin/productions', ProductionController::class)->except(['index']);
    Route::apiResource('/admin/news', NewsController::class)->except(['index', 'show']);
    Route::apiResource('/admin/testimonials', TestimonialController::class)->except(['index']);
    Route::apiResource('/admin/gallery', GalleryController::class)->except(['index']);

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
