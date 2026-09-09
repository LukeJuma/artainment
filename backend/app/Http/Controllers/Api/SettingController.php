<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Settings Controller - Manages system-wide configuration settings
 * 
 * Security Features:
 * - Whitelisted setting keys prevent arbitrary key creation
 * - Type-specific validation ensures data integrity
 * - Input sanitization prevents malicious values
 */
class SettingController extends Controller
{
    /**
     * Whitelist of allowed setting keys to prevent arbitrary key creation
     */
    private const ALLOWED_SETTINGS = [
        'site_name',
        'site_description', 
        'site_url',
        'contact_email',
        'support_email',
        'phone_number',
        'address',
        'facebook_url',
        'twitter_url', 
        'instagram_url',
        'youtube_url',
        'linkedin_url',
        'privacy_policy_url',
        'terms_of_service_url',
        'cookie_policy_url',
        'analytics_tracking_id',
        'meta_description',
        'meta_keywords',
        'default_language',
        'timezone',
        'currency',
        'subscription_enabled',
        'registration_enabled',
        'maintenance_mode',
        'max_file_size',
        'allowed_file_types',
    ];

    /**
     * Validation rules for specific settings
     */
    private const SETTING_VALIDATION_RULES = [
        'site_url' => 'nullable|url|max:500',
        'contact_email' => 'nullable|email|max:255',
        'support_email' => 'nullable|email|max:255',
        'facebook_url' => 'nullable|url|max:500',
        'twitter_url' => 'nullable|url|max:500',
        'instagram_url' => 'nullable|url|max:500',
        'youtube_url' => 'nullable|url|max:500',
        'linkedin_url' => 'nullable|url|max:500',
        'privacy_policy_url' => 'nullable|url|max:500',
        'terms_of_service_url' => 'nullable|url|max:500',
        'cookie_policy_url' => 'nullable|url|max:500',
        'subscription_enabled' => 'nullable|boolean',
        'registration_enabled' => 'nullable|boolean',
        'maintenance_mode' => 'nullable|boolean',
        'max_file_size' => 'nullable|integer|min:1|max:2048000', // Max 2GB in KB
        'default_language' => 'nullable|string|in:en,sw,fr,es', // Add supported languages
        'currency' => 'nullable|string|in:USD,EUR,GBP,KES', // Add supported currencies
    ];

    public function index(): JsonResponse
    {
        return response()->json(Setting::pluck('value', 'key'));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string|max:5000',
        ]);

        // Security fix: Only allow whitelisted setting keys
        $allowedSettings = array_intersect_key($validated['settings'], array_flip(self::ALLOWED_SETTINGS));
        
        if (count($allowedSettings) !== count($validated['settings'])) {
            $disallowedKeys = array_diff(array_keys($validated['settings']), self::ALLOWED_SETTINGS);
            return response()->json([
                'error' => 'Invalid setting keys provided',
                'disallowed_keys' => $disallowedKeys,
                'allowed_keys' => self::ALLOWED_SETTINGS
            ], 422);
        }

        // Apply specific validation rules for each setting
        $validationErrors = [];
        foreach ($allowedSettings as $key => $value) {
            if (isset(self::SETTING_VALIDATION_RULES[$key])) {
                $validator = \Validator::make(
                    [$key => $value], 
                    [$key => self::SETTING_VALIDATION_RULES[$key]]
                );
                
                if ($validator->fails()) {
                    $validationErrors[$key] = $validator->errors()->first($key);
                }
            }
        }

        if (!empty($validationErrors)) {
            return response()->json([
                'error' => 'Setting validation failed',
                'validation_errors' => $validationErrors
            ], 422);
        }

        // Save valid settings
        foreach ($allowedSettings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'general']);
        }

        return response()->json(Setting::pluck('value', 'key'));
    }

    /**
     * Get list of allowed setting keys for frontend reference
     */
    public function allowedKeys(): JsonResponse
    {
        return response()->json([
            'allowed_keys' => self::ALLOWED_SETTINGS,
            'count' => count(self::ALLOWED_SETTINGS)
        ]);
    }
}
