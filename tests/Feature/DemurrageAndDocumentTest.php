<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Port;
use App\Models\Shipment;
use App\Models\ShipmentContainer;
use App\Models\ShipmentDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DemurrageAndDocumentTest extends TestCase
{
    protected function createTestShipment(): Shipment
    {
        $company = Company::first() ?? Company::create(['name' => 'Test Logistics Co', 'type' => 'customer']);
        $port1 = Port::first() ?? Port::create(['code' => 'P1', 'name' => 'Port 1']);
        $port2 = Port::skip(1)->first() ?? Port::create(['code' => 'P2', 'name' => 'Port 2']);

        return Shipment::create([
            'shipment_number' => 'SHP-TEST-'.rand(1000, 9999),
            'customer_id' => $company->id,
            'origin_port_id' => $port1->id,
            'destination_port_id' => $port2->id,
            'mode' => 'sea',
            'type' => 'FCL',
            'status' => 'in_transit',
            'origin_port' => 'Origin Port',
            'destination_port' => 'Dest Port',
            'demurrage_free_days' => 14,
            'detention_free_days' => 7,
            'demurrage_daily_rate' => 75.00,
            'detention_daily_rate' => 50.00,
        ]);
    }

    public function test_can_update_shipment_free_time_terms(): void
    {
        $shipment = $this->createTestShipment();

        $response = $this->patch("/shipments/{$shipment->id}/freetime", [
            'demurrage_free_days' => 21,
            'detention_free_days' => 10,
            'demurrage_daily_rate' => 100.00,
            'detention_daily_rate' => 60.00,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'demurrage_free_days' => 21,
            'detention_free_days' => 10,
            'demurrage_daily_rate' => 100.00,
            'detention_daily_rate' => 60.00,
        ]);
    }

    public function test_can_update_container_tracking_and_compute_demurrage(): void
    {
        $shipment = $this->createTestShipment();

        $container = ShipmentContainer::create([
            'shipment_id' => $shipment->id,
            'container_number' => 'MSCU'.rand(1000000, 9999999),
            'container_type' => '40HC',
            'seal_number' => 'SEAL-'.rand(100, 999),
            'status' => 'discharged',
        ]);

        // Discharged 20 days ago, gate out 2 days ago (with 14 free days -> 4 days excess demurrage)
        $discharged = now()->subDays(20)->toDateString();
        $gateOut = now()->subDays(2)->toDateString();

        $response = $this->patch("/containers/{$container->id}/tracking", [
            'discharged_at' => $discharged,
            'gate_out_at' => $gateOut,
        ]);

        $response->assertSessionHasNoErrors();

        $container->refresh();
        $this->assertEquals($discharged, $container->discharged_at?->toDateString());
        $this->assertEquals($gateOut, $container->gate_out_at?->toDateString());
        $this->assertGreaterThan(0, $container->demurrage_days_incurred);
        $this->assertGreaterThan(0, $container->demurrage_amount);
    }

    public function test_can_upload_verify_and_delete_shipment_document(): void
    {
        Storage::fake('public');

        $shipment = $this->createTestShipment();

        $file = UploadedFile::fake()->create('bill_of_lading.pdf', 100, 'application/pdf');

        $uploadResponse = $this->post("/shipments/{$shipment->id}/documents", [
            'document_type' => 'bill_of_lading',
            'title' => 'House B/L Original Signed',
            'file' => $file,
            'notes' => 'Signed by Shipper',
        ]);

        $uploadResponse->assertSessionHasNoErrors();

        $doc = ShipmentDocument::where('shipment_id', $shipment->id)
            ->where('title', 'House B/L Original Signed')
            ->first();

        $this->assertNotNull($doc);
        $this->assertEquals('pending', $doc->status);
        Storage::disk('public')->assertExists($doc->file_path);

        // Verify document
        $verifyResponse = $this->patch("/documents/{$doc->id}/verify", [
            'status' => 'verified',
        ]);
        $verifyResponse->assertSessionHasNoErrors();
        $this->assertEquals('verified', $doc->fresh()->status);

        // Delete document
        $deleteResponse = $this->delete("/documents/{$doc->id}");
        $deleteResponse->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('shipment_documents', ['id' => $doc->id]);
    }
}
