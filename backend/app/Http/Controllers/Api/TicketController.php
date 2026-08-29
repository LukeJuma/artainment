<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(): JsonResponse
    {
        $tickets = Ticket::with('event:id,title,starts_at,status')->orderByDesc('created_at')->get();
        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'nullable|exists:mic_mtaani_events,id',
            'type' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:0',
            'sold' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,sold_out',
        ]);

        $ticket = Ticket::create($validated);
        return response()->json($ticket->load('event:id,title,starts_at,status'), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $validated = $request->validate([
            'event_id' => 'nullable|exists:mic_mtaani_events,id',
            'type' => 'sometimes|required|string|max:50',
            'price' => 'sometimes|required|numeric|min:0',
            'capacity' => 'sometimes|required|integer|min:0',
            'sold' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,sold_out',
        ]);

        $ticket->update($validated);
        return response()->json($ticket->load('event:id,title,starts_at,status'));
    }

    public function destroy(string $id): JsonResponse
    {
        Ticket::findOrFail($id)->delete();
        return response()->json(['message' => 'Ticket deleted']);
    }
}
