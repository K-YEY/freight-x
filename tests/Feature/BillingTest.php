<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Invoice;
use Tests\TestCase;

class BillingTest extends TestCase
{
    public function test_billing_page_is_accessible(): void
    {
        $response = $this->get('/billing');

        $response->assertStatus(200);
    }

    public function test_can_create_customer_invoice_with_items(): void
    {
        $company = Company::first() ?? Company::factory()->create();

        $response = $this->from('/billing')->post('/billing', [
            'type' => 'receivable',
            'category' => 'customer_billing',
            'partner_id' => $company->id,
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'payment_terms' => 'Net 30 Days',
            'currency' => 'USD',
            'discount_amount' => 50,
            'notes' => 'Test customer invoice',
            'items' => [
                [
                    'description' => 'Ocean Freight 40ft HC',
                    'charge_code' => 'OFRT',
                    'quantity' => 1,
                    'unit_price' => 2000,
                    'tax_rate' => 0,
                ],
                [
                    'description' => 'Terminal Handling Charges (THC)',
                    'charge_code' => 'THC',
                    'quantity' => 1,
                    'unit_price' => 350,
                    'tax_rate' => 0,
                ],
            ],
        ]);

        $response->assertRedirect('/billing');

        $this->assertDatabaseHas('invoices', [
            'type' => 'receivable',
            'partner_id' => $company->id,
            'total_amount' => 2300, // 2000 + 350 - 50 discount
            'balance_due' => 2300,
            'status' => 'issued',
        ]);
    }

    public function test_can_record_payment_and_update_status(): void
    {
        $invoice = Invoice::latest('id')->first();
        if (! $invoice) {
            $this->markTestSkipped('No invoice to record payment for');
        }

        $response = $this->patch("/billing/{$invoice->id}/payment", [
            'amount' => 1000,
            'payment_date' => now()->toDateString(),
            'notes' => 'Wire transfer test',
        ]);

        $response->assertRedirect();

        $invoice->refresh();
        $this->assertEquals(1000, $invoice->paid_amount);
        $this->assertEquals('partially_paid', $invoice->status);
    }
}
