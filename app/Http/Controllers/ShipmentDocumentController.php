<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ShipmentDocumentController extends Controller
{
    /**
     * Store an uploaded document for a shipment
     */
    public function store(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'document_type' => 'required|string',
            'title' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'file' => 'nullable|file|max:15360', // 15MB max
        ]);

        $filePath = '';
        $fileName = 'Document_Recorded';
        $fileSize = 0;
        $mimeType = 'application/pdf';

        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            $uploadedFile = $request->file('file');
            $fileName = $uploadedFile->getClientOriginalName();
            $fileSize = $uploadedFile->getSize();
            $mimeType = $uploadedFile->getMimeType();
            $filePath = $uploadedFile->store("shipments/{$shipment->id}/documents", 'public');
        } else {
            // Simulated / Registered document without file attachment
            $filePath = "shipments/{$shipment->id}/documents/registered_doc.pdf";
            $fileName = $validated['title'].'.pdf';
        }

        ShipmentDocument::create([
            'shipment_id' => $shipment->id,
            'document_type' => $validated['document_type'],
            'title' => $validated['title'],
            'document_number' => $validated['document_number'] ?? null,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'status' => 'pending',
            'uploaded_by' => $request->user()?->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Document {$validated['title']} added to shipment.");
    }

    /**
     * Verify or reject a shipment document
     */
    public function verify(Request $request, ShipmentDocument $document): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected,pending',
            'rejection_reason' => 'nullable|string|max:255',
        ]);

        $document->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['status'] === 'rejected' ? ($validated['rejection_reason'] ?? 'Document rejected by compliance officer') : null,
            'verified_by' => $validated['status'] === 'verified' ? $request->user()?->id : null,
            'verified_at' => $validated['status'] === 'verified' ? now() : null,
        ]);

        return redirect()->back()->with('success', "Document verification updated to {$validated['status']}.");
    }

    /**
     * Download or view document
     */
    public function download(ShipmentDocument $document): BinaryFileResponse|RedirectResponse
    {
        if (Storage::disk('public')->exists($document->file_path)) {
            return response()->download(Storage::disk('public')->path($document->file_path), $document->file_name);
        }

        return redirect()->back()->with('error', 'The document file is not found on the server.');
    }

    /**
     * Delete document
     */
    public function destroy(ShipmentDocument $document): RedirectResponse
    {
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }
}
