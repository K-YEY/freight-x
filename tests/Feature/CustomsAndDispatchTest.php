<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Port;
use App\Models\Shipment;
use App\Models\ShipmentContainer;
use App\Models\TruckDispatch;
use Tests\TestCase;

class CustomsAndDispatchTest extends TestCase
{
    protected function createTestShipment(): Shipment
    {
        $company = Company::first() ?? Company::create(['name' => 'Customs Client Co', 'type' => 'customer']);
        $port1 = Port::first() ?? Port::create(['code' => 'P1', 'name' => 'Port 1']);
        $port2 = Port::skip(1)->first() ?? Port::create(['code' => 'P2', 'name' => 'Port 2']);

        return Shipment::create([
            'shipment_number' => 'SHP-CUS-'.rand(1000, 9999),
            'customer_id' => $company->id,
            'origin_port_id' => $port1->id,
            'destination_port_id' => $port2->id,
            'mode' => 'sea',
            'type' => 'FCL',
            'status' => 'in_transit',
            'origin_port' => 'Origin Port',
            'destination_port' => 'Dest Port',
            'total_revenue' => 10000.00,
            'total_cost' => 6000.00,
            'gross_profit' => 4000.00,
            'margin_percentage' => 40.00,
        ]);
    }

    public function test_can_update_customs_clearance_and_delivery_order(): void
    {
        $shipment = $this->createTestShipment();

        $response = $this->patch("/shipments/{$shipment->id}/customs", [
            'acid_number' => 'ACID-TEST-8812',
            'bayan_number' => 'BYN-ALX-5512',
            'customs_office' => 'Alexandria Port Customs',
            'customs_stage' => 'duties_assessed',
            'customs_duty_amount' => 5000.00,
            'customs_vat_amount' => 7000.00,
            'customs_fees_amount' => 1200.00,
            'delivery_order_number' => 'DO-MSC-9912',
            'delivery_order_status' => 'exchanged',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'acid_number' => 'ACID-TEST-8812',
            'bayan_number' => 'BYN-ALX-5512',
            'customs_stage' => 'duties_assessed',
            'customs_duty_amount' => 5000.00,
            'delivery_order_status' => 'exchanged',
        ]);
    }

    public function test_can_create_truck_dispatch_order_and_update_status(): void
    {
        $shipment = $this->createTestShipment();
        $container = ShipmentContainer::create([
            'shipment_id' => $shipment->id,
            'container_number' => 'MSCU'.rand(1000000, 9999999),
            'container_type' => '40HC',
            'seal_number' => 'SL-TRK-01',
            'status' => 'discharged',
        ]);

        $trucker = Company::firstOrCreate(['name' => 'Fast Trucking Co', 'partner_type' => 'trucker']);

        $response = $this->post("/shipments/{$shipment->id}/dispatches", [
            'shipment_container_id' => $container->id,
            'trucking_company_id' => $trucker->id,
            'driver_name' => 'Ahmed Mahmoud',
            'driver_phone' => '+20 100 000 0000',
            'truck_plate' => 'ABC 123',
            'origin_address' => 'Alex Port Yard 4',
            'delivery_address' => 'Customer Factory 10th Ramadan',
            'empty_return_depot' => 'Almajd Empty Yard',
            'driver_cost' => 400.00,
            'client_charge' => 600.00,
        ]);

        $response->assertSessionHasNoErrors();

        $dispatch = TruckDispatch::where('shipment_id', $shipment->id)->first();
        $this->assertNotNull($dispatch);
        $this->assertEquals('assigned', $dispatch->status);
        $this->assertEquals('ABC 123', $dispatch->truck_plate);

        // Update status to empty returned
        $updateResponse = $this->patch("/dispatches/{$dispatch->id}/status", [
            'status' => 'empty_returned',
            'empty_return_receipt' => 'EIR-998877',
        ]);

        $updateResponse->assertSessionHasNoErrors();
        $dispatch->refresh();
        $this->assertEquals('empty_returned', $dispatch->status);
        $this->assertEquals('EIR-998877', $dispatch->empty_return_receipt);
        $this->assertNotNull($dispatch->empty_returned_at);
    }

    public function test_can_configure_agent_profit_sharing_and_lock_financials(): void
    {
        $shipment = $this->createTestShipment();
        $agent = Company::firstOrCreate(['name' => 'Shanghai Partner Logistics', 'partner_type' => 'agent']);

        $response = $this->patch("/shipments/{$shipment->id}/agent-settlement", [
            'overseas_agent_id' => $agent->id,
            'agent_share_type' => 'fifty_fifty',
            'agent_share_percentage' => 50.00,
            'agent_profit_share_amount' => 2000.00,
            'agent_debit_credit_type' => 'debit',
            'agent_settlement_status' => 'issued',
            'generate_invoice' => true,
        ]);

        $response->assertSessionHasNoErrors();

        $shipment->refresh();
        $this->assertEquals($agent->id, $shipment->overseas_agent_id);
        $this->assertEquals('fifty_fifty', $shipment->agent_share_type);
        $this->assertEquals('issued', $shipment->agent_settlement_status);
        $this->assertNotNull($shipment->agent_settlement_reference);

        // Verify Debit Note was created in invoices
        $this->assertDatabaseHas('invoices', [
            'type' => 'debit_note',
            'partner_id' => $agent->id,
            'shipment_id' => $shipment->id,
            'total_amount' => 2000.00,
        ]);

        // Toggle Financial Lock
        $lockResponse = $this->patch("/shipments/{$shipment->id}/financial-lock");
        $lockResponse->assertSessionHasNoErrors();

        $shipment->refresh();
        $this->assertEquals('closed_locked', $shipment->financial_status);
        $this->assertNotNull($shipment->financial_closed_at);
    }
}
