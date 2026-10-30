<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Port;
use App\Models\Quotation;
use App\Models\Shipment;
use Tests\TestCase;

class QuotationTest extends TestCase
{
    public function test_quotations_index_page_is_accessible(): void
    {
        $response = $this->get('/quotations');

        $response->assertStatus(200);
    }

    public function test_can_create_quotation_with_items_and_recalculate_totals(): void
    {
        $company = Company::first() ?? Company::factory()->create();
        $portOrigin = Port::first() ?? Port::create(['code' => 'TEST1', 'name' => 'Origin Port']);
        $portDest = Port::skip(1)->first() ?? Port::create(['code' => 'TEST2', 'name' => 'Dest Port']);

        $response = $this->post('/quotations', [
            'customer_id' => $company->id,
            'mode' => 'sea',
            'service_type' => 'fcl',
            'incoterm' => 'CIF',
            'origin_port_id' => $portOrigin->id,
            'destination_port_id' => $portDest->id,
            'commodity' => 'Consumer Electronics',
            'estimated_transit_days' => 18,
            'valid_until' => now()->addDays(14)->toDateString(),
            'currency' => 'USD',
            'payment_terms' => '30% Advance, 70% against BL copy',
            'status' => 'draft',
            'items' => [
                [
                    'charge_code' => 'OFRT',
                    'description' => 'Ocean Freight 40ft High Cube',
                    'category' => 'ocean_freight',
                    'unit_type' => 'per_container',
                    'quantity' => 2,
                    'unit_price' => 2000,
                    'tax_rate' => 0,
                ],
                [
                    'charge_code' => 'THC',
                    'description' => 'Terminal Handling Charges',
                    'category' => 'origin_charges',
                    'unit_type' => 'per_container',
                    'quantity' => 2,
                    'unit_price' => 150,
                    'tax_rate' => 0,
                ],
            ],
        ]);

        $response->assertRedirect('/quotations');

        $this->assertDatabaseHas('quotations', [
            'customer_id' => $company->id,
            'mode' => 'sea',
            'subtotal' => 4300, // (2*2000) + (2*150)
            'total_amount' => 4300,
            'status' => 'draft',
        ]);
    }

    public function test_can_update_quotation_status(): void
    {
        $quotation = Quotation::latest('id')->first();
        if (! $quotation) {
            $this->markTestSkipped('No quotation available');
        }

        $response = $this->patch("/quotations/{$quotation->id}/status", [
            'status' => 'accepted',
        ]);

        $response->assertRedirect();
        $this->assertEquals('accepted', $quotation->fresh()->status);
    }

    public function test_can_convert_quotation_to_active_shipment(): void
    {
        $company = Company::first();
        $quotation = Quotation::create([
            'quotation_number' => 'QT-TEST-'.uniqid(),
            'customer_id' => $company->id,
            'mode' => 'sea',
            'service_type' => 'fcl',
            'incoterm' => 'FOB',
            'commodity' => 'Solar Batteries',
            'currency' => 'USD',
            'subtotal' => 3500,
            'total_amount' => 3500,
            'status' => 'accepted',
        ]);

        $quotation->items()->create([
            'charge_code' => 'OFRT',
            'description' => 'Ocean Freight',
            'category' => 'ocean_freight',
            'unit_type' => 'per_container',
            'quantity' => 1,
            'unit_price' => 3500,
            'total_price' => 3500,
            'currency' => 'USD',
        ]);

        $response = $this->post("/quotations/{$quotation->id}/convert");

        $response->assertRedirect('/shipments');

        $quotation->refresh();
        $this->assertEquals('converted', $quotation->status);
        $this->assertNotNull($quotation->converted_shipment_id);

        $shipment = $quotation->convertedShipment;
        $this->assertNotNull($shipment);
        $this->assertEquals($company->id, $shipment->customer_id);
        $this->assertEquals('booked', $shipment->status);
        $this->assertEquals(3500, $shipment->total_revenue);

        // Verify receivable invoice was created
        $this->assertDatabaseHas('invoices', [
            'shipment_id' => $shipment->id,
            'type' => 'receivable',
            'total_amount' => 3500,
        ]);
    }

    public function test_can_update_bill_of_lading_details_on_shipment(): void
    {
        $shipment = Shipment::first();
        if (! $shipment) {
            $this->markTestSkipped('No shipment available');
        }

        $response = $this->patch("/shipments/{$shipment->id}/bl", [
            'hbl_number' => 'HBL-TEST-9988',
            'mbl_number' => 'MBL-TEST-1122',
            'bl_type' => 'house',
            'freight_term' => 'Prepaid',
            'shipper_name' => 'Shanghai Exports Ltd',
            'shipper_address' => 'Pudong New Area, Shanghai',
            'consignee_name' => 'Cairo Trading Co.',
            'consignee_address' => 'Nasr City, Cairo, Egypt',
            'notify_party_name' => 'SAME AS CONSIGNEE',
            'bl_issue_place' => 'Shanghai',
            'bl_issue_date' => now()->toDateString(),
            'marks_and_numbers' => 'N/M',
            'cargo_description' => 'Auto Spare Parts',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'hbl_number' => 'HBL-TEST-9988',
            'shipper_name' => 'Shanghai Exports Ltd',
            'consignee_name' => 'Cairo Trading Co.',
            'freight_term' => 'Prepaid',
        ]);
    }

    public function test_can_access_printable_bill_of_lading_page(): void
    {
        $shipment = Shipment::first();
        if (! $shipment) {
            $this->markTestSkipped('No shipment available');
        }

        $response = $this->get("/shipments/{$shipment->id}/hbl");

        $response->assertStatus(200);
    }
}
