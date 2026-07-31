<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'service' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($validated);
        return response()->json(['message' => 'Message received. We will be in touch within 24 hours.', 'id' => $contact->id], 201);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $subscriber = Subscriber::firstOrCreate(
            ['email' => $validated['email']],
            ['active' => true]
        );

        return response()->json(['message' => 'Successfully subscribed to our newsletter.']);
    }

    public function index(): JsonResponse
    {
        $contacts = Contact::orderByDesc('created_at')->get();
        return response()->json($contacts);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:pending,read,replied',
        ]);
        $contact->update($validated);
        return response()->json($contact);
    }
}
