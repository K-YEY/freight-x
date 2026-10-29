<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Permission;
use App\Models\Port;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\ShipmentContainer;
use App\Models\ShipmentMilestone;
use App\Models\User;
use App\Models\Vessel;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FreightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Roles & Permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin'], [
            'display_name_en' => 'General Manager / Admin',
            'display_name_ar' => 'المدير العام',
            'description' => 'Full access to operations, finances, team, and settings',
        ]);

        $opsRole = Role::firstOrCreate(['name' => 'operations'], [
            'display_name_en' => 'Freight Operations Specialist',
            'display_name_ar' => 'مسؤول عمليات الشحن',
            'description' => 'Manage shipments, containers, milestones, and routes',
        ]);

        $billingRole = Role::firstOrCreate(['name' => 'accountant'], [
            'display_name_en' => 'Accountant / Billing',
            'display_name_ar' => 'المحاسب المالي',
            'description' => 'Manage invoices, vendor costs, payments, and profitability',
        ]);

        $salesRole = Role::firstOrCreate(['name' => 'sales'], [
            'display_name_en' => 'Freight Forwarder / Sales',
            'display_name_ar' => 'مسؤول مبيعات الشحن',
            'description' => 'Handle clients, inquiries, quotes, and bookings',
        ]);

        $customsRole = Role::firstOrCreate(['name' => 'customs_agent'], [
            'display_name_en' => 'Customs Broker / Specialist',
            'display_name_ar' => 'أخصائي التخليص الجمركي',
            'description' => 'Track customs declarations, clearances, and regulatory duties',
        ]);

        // Sample Permissions
        $permissionsList = [
            ['name' => 'shipments.view', 'display_name_en' => 'View Shipments', 'display_name_ar' => 'عرض الشحنات', 'category' => 'shipments'],
            ['name' => 'shipments.create', 'display_name_en' => 'Create Shipments', 'display_name_ar' => 'إنشاء شحنات جديدة', 'category' => 'shipments'],
            ['name' => 'shipments.edit', 'display_name_en' => 'Edit Shipments', 'display_name_ar' => 'تعديل الشحنات', 'category' => 'shipments'],
            ['name' => 'shipments.delete', 'display_name_en' => 'Delete Shipments', 'display_name_ar' => 'حذف الشحنات', 'category' => 'shipments'],
            ['name' => 'invoices.manage', 'display_name_en' => 'Manage Invoices', 'display_name_ar' => 'إدارة الفواتير', 'category' => 'finances'],
            ['name' => 'finances.view_profit', 'display_name_en' => 'View Profit Margins', 'display_name_ar' => 'الاطلاع على أرباح الشحنات', 'category' => 'finances'],
            ['name' => 'settings.manage', 'display_name_en' => 'Manage Master Data', 'display_name_ar' => 'إدارة البيانات المرجعية', 'category' => 'settings'],
        ];

        foreach ($permissionsList as $pData) {
            $perm = Permission::firstOrCreate(['name' => $pData['name']], $pData);
            $adminRole->permissions()->syncWithoutDetaching([$perm->id]);
            if (str_starts_with($pData['name'], 'shipments.')) {
                $opsRole->permissions()->syncWithoutDetaching([$perm->id]);
            }
            if (str_starts_with($pData['name'], 'invoices.') || $pData['name'] === 'finances.view_profit') {
                $billingRole->permissions()->syncWithoutDetaching([$perm->id]);
            }
        }

        // Attach Admin Role to First User
        $user = User::first();
        if ($user) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        // 2. Ports & Airports & Dry Ports
        $ports = [
            [
                'name' => 'Alexandria Port',
                'code' => 'EGALY',
                'country' => 'Egypt',
                'city' => 'Alexandria',
                'type' => 'sea',
                'terminal_name' => 'Dekheila Container Terminal',
                'latitude' => 31.1895,
                'longitude' => 29.8659,
                'status' => 'active',
            ],
            [
                'name' => 'Port Said Port',
                'code' => 'EGPSD',
                'country' => 'Egypt',
                'city' => 'Port Said',
                'type' => 'sea',
                'terminal_name' => 'Suez Canal Container Terminal (SCCT)',
                'latitude' => 31.2565,
                'longitude' => 32.3019,
                'status' => 'active',
            ],
            [
                'name' => 'Cairo International Airport Cargo',
                'code' => 'EGCAI',
                'country' => 'Egypt',
                'city' => 'Cairo',
                'type' => 'air',
                'terminal_name' => 'Cargo Village Complex',
                'latitude' => 30.1219,
                'longitude' => 31.4056,
                'status' => 'active',
            ],
            [
                'name' => 'Jebel Ali Port',
                'code' => 'AEJEA',
                'country' => 'United Arab Emirates',
                'city' => 'Dubai',
                'type' => 'sea',
                'terminal_name' => 'DP World Terminal 1 & 2',
                'latitude' => 24.9857,
                'longitude' => 55.0273,
                'status' => 'active',
            ],
            [
                'name' => 'Shanghai Port',
                'code' => 'CNSHA',
                'country' => 'China',
                'city' => 'Shanghai',
                'type' => 'sea',
                'terminal_name' => 'Yangshan Deepwater Port',
                'latitude' => 30.6277,
                'longitude' => 122.0645,
                'status' => 'active',
            ],
            [
                'name' => 'Rotterdam Port',
                'code' => 'NLRTM',
                'country' => 'Netherlands',
                'city' => 'Rotterdam',
                'type' => 'sea',
                'terminal_name' => 'Maasvlakte 2 ECT',
                'latitude' => 51.9547,
                'longitude' => 4.0531,
                'status' => 'active',
            ],
            [
                'name' => 'Frankfurt Airport CargoCity',
                'code' => 'DEFRA',
                'country' => 'Germany',
                'city' => 'Frankfurt',
                'type' => 'air',
                'terminal_name' => 'CargoCity South',
                'latitude' => 50.0379,
                'longitude' => 8.5622,
                'status' => 'active',
            ],
            [
                'name' => 'Riyadh Dry Port',
                'code' => 'SARUH',
                'country' => 'Saudi Arabia',
                'city' => 'Riyadh',
                'type' => 'dry_port',
                'terminal_name' => 'Riyadh Intermodal Terminal',
                'latitude' => 24.6333,
                'longitude' => 46.7167,
                'status' => 'active',
            ],
        ];

        foreach ($ports as $portData) {
            Port::firstOrCreate(['code' => $portData['code']], $portData);
        }

        // 3. Warehouses & CFS
        $warehouses = [
            [
                'name' => 'Alexandria Free Zone CFS Terminal',
                'code' => 'CFS-ALY-01',
                'type' => 'cfs',
                'address' => 'Amreya Free Zone, Gate 3',
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'capacity_cbm' => 25000,
                'manager_name' => 'Ahmed Mansour',
                'phone' => '+20 3 4567890',
                'email' => 'cfs-aly@freightx.com',
                'status' => 'active',
            ],
            [
                'name' => '10th of Ramadan Bonded Logistics Center',
                'code' => 'BND-RAM-01',
                'type' => 'bonded',
                'address' => 'Industrial Zone A3, Plot 14',
                'city' => '10th of Ramadan',
                'country' => 'Egypt',
                'capacity_cbm' => 45000,
                'manager_name' => 'Tarek El-Shennawy',
                'phone' => '+20 15 334455',
                'email' => 'bonded-ramadan@freightx.com',
                'status' => 'active',
            ],
            [
                'name' => 'Jebel Ali Logistics Hub (Cold & Dry)',
                'code' => 'LOG-DXB-01',
                'type' => 'cold_storage',
                'address' => 'JAFZA South, Street 12',
                'city' => 'Dubai',
                'country' => 'United Arab Emirates',
                'capacity_cbm' => 60000,
                'manager_name' => 'Zayd Al-Maktoum',
                'phone' => '+971 4 8812345',
                'email' => 'dxb-hub@freightx.com',
                'status' => 'active',
            ],
        ];

        foreach ($warehouses as $whData) {
            Warehouse::firstOrCreate(['code' => $whData['code']], $whData);
        }

        // 4. Logistics Companies (Shipping Lines, Customs, Truckers, Forwarders, Clients)
        $carrierMaersk = Company::firstOrCreate(['name' => 'Maersk Line'], [
            'code' => 'MAEU',
            'partner_type' => 'shipping_line',
            'tax_number' => 'EG-TAX-100234',
            'domain' => 'maersk.com',
            'industry' => 'Maritime Transport',
            'city' => 'Copenhagen / Cairo Branch',
            'country' => 'Denmark',
        ]);

        $carrierMSC = Company::firstOrCreate(['name' => 'MSC Mediterranean Shipping Company'], [
            'code' => 'MSCU',
            'partner_type' => 'shipping_line',
            'tax_number' => 'CH-TAX-889922',
            'domain' => 'msc.com',
            'industry' => 'Maritime Transport',
            'city' => 'Geneva / Alexandria Branch',
            'country' => 'Switzerland',
        ]);

        $airlineEgyptAir = Company::firstOrCreate(['name' => 'EgyptAir Cargo'], [
            'code' => 'MSCARGO',
            'partner_type' => 'airline',
            'tax_number' => 'EG-TAX-778899',
            'domain' => 'egyptair-cargo.com',
            'industry' => 'Air Freight Transport',
            'city' => 'Cairo',
            'country' => 'Egypt',
        ]);

        $customsBroker = Company::firstOrCreate(['name' => 'El-Dawlia Customs Clearance & Logistics'], [
            'code' => 'DAWLIA',
            'partner_type' => 'customs_broker',
            'tax_number' => 'EG-CLR-443322',
            'domain' => 'dawlia-clearance.com',
            'industry' => 'Customs Brokerage',
            'city' => 'Alexandria',
            'country' => 'Egypt',
        ]);

        $truckerNile = Company::firstOrCreate(['name' => 'Nile Express Heavy Trucking'], [
            'code' => 'NILETRK',
            'partner_type' => 'trucker',
            'tax_number' => 'EG-TRK-990011',
            'domain' => 'nile-express.com',
            'industry' => 'Inland Road Transport',
            'city' => 'Cairo',
            'country' => 'Egypt',
        ]);

        $clientAlAmal = Company::firstOrCreate(['name' => 'Al-Amal International Import & Export'], [
            'code' => 'AMAL',
            'partner_type' => 'customer',
            'tax_number' => 'EG-COM-556677',
            'domain' => 'alamal-trade.com',
            'industry' => 'General Trading & Electronics',
            'city' => 'Cairo',
            'country' => 'Egypt',
        ]);

        $clientApex = Company::firstOrCreate(['name' => 'Apex Industrial Equipment FZE'], [
            'code' => 'APEX',
            'partner_type' => 'customer',
            'tax_number' => 'AE-VAT-112233',
            'domain' => 'apexindustrial.ae',
            'industry' => 'Machinery & Spare Parts',
            'city' => 'Dubai',
            'country' => 'United Arab Emirates',
        ]);

        // 5. Vessels
        $vesselOscar = Vessel::firstOrCreate(['imo_number' => '9703291'], [
            'name' => 'MSC Oscar',
            'mmsi' => '355906000',
            'call_sign' => '3FDA9',
            'flag_country' => 'Panama',
            'vessel_type' => 'Ultra Large Container Ship (ULCS)',
            'carrier_id' => $carrierMSC->id,
            'status' => 'active',
        ]);

        $vesselMaersk = Vessel::firstOrCreate(['imo_number' => '9619907'], [
            'name' => 'Maersk Mc-Kinney Moller',
            'mmsi' => '219018271',
            'call_sign' => 'OWIZ2',
            'flag_country' => 'Denmark',
            'vessel_type' => 'Triple-E Container Ship',
            'carrier_id' => $carrierMaersk->id,
            'status' => 'active',
        ]);

        // 6. Realistic Multi-Modal Shipments
        $portAlex = Port::where('code', 'EGALY')->first();
        $portSaid = Port::where('code', 'EGPSD')->first();
        $portShanghai = Port::where('code', 'CNSHA')->first();
        $portRotterdam = Port::where('code', 'NLRTM')->first();
        $portCairoAir = Port::where('code', 'EGCAI')->first();
        $portFrankfurt = Port::where('code', 'DEFRA')->first();
        $portRiyadh = Port::where('code', 'SARUH')->first();
        $portJebelAli = Port::where('code', 'AEJEA')->first();

        $cfsAlex = Warehouse::where('code', 'CFS-ALY-01')->first();
        $bondedRamadan = Warehouse::where('code', 'BND-RAM-01')->first();

        // Shipment 1: Ocean FCL (Shanghai -> Alexandria) - In Transit
        $shipment1 = Shipment::firstOrCreate(['shipment_number' => 'SHP-2026-0001'], [
            'booking_number' => 'BKG-SHA-88991',
            'mbl_number' => 'MSCU99887766',
            'hbl_number' => 'FRX-HBL-00101',
            'mode' => 'sea',
            'service_type' => 'fcl',
            'direction' => 'import',
            'customer_id' => $clientAlAmal->id,
            'shipper_id' => $carrierMSC->id,
            'consignee_id' => $clientAlAmal->id,
            'carrier_id' => $carrierMSC->id,
            'customs_broker_id' => $customsBroker->id,
            'trucker_id' => $truckerNile->id,
            'origin_port_id' => $portShanghai->id,
            'destination_port_id' => $portAlex->id,
            'discharge_warehouse_id' => $cfsAlex->id,
            'vessel_id' => $vesselOscar->id,
            'voyage_flight_number' => 'VOY-2604W',
            'incoterm' => 'CIF',
            'move_type' => 'Port-to-Port',
            'commodity' => 'Consumer Electronics & Smart Displays',
            'hs_code' => '8528.52.00',
            'total_packages' => 840,
            'package_type' => 'carton',
            'total_gross_weight_kg' => 24500.00,
            'total_net_weight_kg' => 22800.00,
            'total_volume_cbm' => 136.000,
            'status' => 'in_transit',
            'booking_date' => Carbon::now()->subDays(18)->format('Y-m-d'),
            'cargo_ready_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
            'etd' => Carbon::now()->subDays(12)->format('Y-m-d'),
            'atd' => Carbon::now()->subDays(12)->format('Y-m-d'),
            'eta' => Carbon::now()->addDays(8)->format('Y-m-d'),
            'currency' => 'USD',
            'total_revenue' => 14200.00,
            'total_cost' => 10350.00,
            'gross_profit' => 3850.00,
            'margin_percentage' => 27.11,
            'created_by' => $user?->id,
            'notes' => 'High priority shipment. Customs clearance documents pre-lodged with El-Dawlia.',
        ]);

        // Containers for Shipment 1
        ShipmentContainer::firstOrCreate(['container_number' => 'MSCU7123450'], [
            'shipment_id' => $shipment1->id,
            'type' => '40HC',
            'seal_number' => 'SL-MSC-99120',
            'tare_weight_kg' => 3900.00,
            'cargo_weight_kg' => 12100.00,
            'vgm_weight_kg' => 16000.00,
            'cbm' => 68.000,
            'packages_count' => 420,
            'status' => 'in_transit',
        ]);

        ShipmentContainer::firstOrCreate(['container_number' => 'MSCU7123451'], [
            'shipment_id' => $shipment1->id,
            'type' => '40HC',
            'seal_number' => 'SL-MSC-99121',
            'tare_weight_kg' => 3900.00,
            'cargo_weight_kg' => 12400.00,
            'vgm_weight_kg' => 16300.00,
            'cbm' => 68.000,
            'packages_count' => 420,
            'status' => 'in_transit',
        ]);

        // Milestones for Shipment 1
        $milestones1 = [
            ['stage' => 'booking', 'title_en' => 'Booking Confirmed with MSC', 'title_ar' => 'تأكيد الحجز لدى خط MSC', 'location' => 'Shanghai, China', 'planned' => Carbon::now()->subDays(18), 'actual' => Carbon::now()->subDays(18), 'status' => 'completed'],
            ['stage' => 'cargo_received', 'title_en' => 'Containers Received at Yangshan Terminal', 'title_ar' => 'دخول الحاويات محطة يانغشان', 'location' => 'Shanghai Port', 'planned' => Carbon::now()->subDays(14), 'actual' => Carbon::now()->subDays(14), 'status' => 'completed'],
            ['stage' => 'customs_export', 'title_en' => 'China Export Customs Cleared', 'title_ar' => 'إنهاء التخليص الجمركي للصادر', 'location' => 'Shanghai Customs', 'planned' => Carbon::now()->subDays(13), 'actual' => Carbon::now()->subDays(13), 'status' => 'completed'],
            ['stage' => 'loaded', 'title_en' => 'Loaded onto Vessel MSC Oscar', 'title_ar' => 'تحميل الحاويات على ظهر السفينة MSC Oscar', 'location' => 'Yangshan Terminal Berth 4', 'planned' => Carbon::now()->subDays(12), 'actual' => Carbon::now()->subDays(12), 'status' => 'completed'],
            ['stage' => 'departed', 'title_en' => 'Vessel Departed Shanghai', 'title_ar' => 'إبحار السفينة من ميناء شنغهاي', 'location' => 'East China Sea', 'planned' => Carbon::now()->subDays(12), 'actual' => Carbon::now()->subDays(12), 'status' => 'completed'],
            ['stage' => 'in_transit', 'title_en' => 'Sailing via Red Sea & Suez Canal', 'title_ar' => 'السفينة في المسار الملاحي للبحر الأحمر', 'location' => 'In Transit', 'planned' => Carbon::now(), 'actual' => Carbon::now(), 'status' => 'in_progress'],
            ['stage' => 'arrived', 'title_en' => 'Expected Arrival at Alexandria Port', 'title_ar' => 'الوصول المتوقع لميناء الإسكندرية', 'location' => 'Alexandria Port (EGALY)', 'planned' => Carbon::now()->addDays(8), 'actual' => null, 'status' => 'pending'],
            ['stage' => 'customs_import', 'title_en' => 'Import Customs Clearance & Inspection', 'title_ar' => 'الفحص الجمركي والإفراج النهائي', 'location' => 'Alexandria Port Customs', 'planned' => Carbon::now()->addDays(10), 'actual' => null, 'status' => 'pending'],
            ['stage' => 'delivered', 'title_en' => 'Delivery to Al-Amal Warehouse', 'title_ar' => 'التسليم لمخازن العميل بالقاهرة', 'location' => 'Cairo, Egypt', 'planned' => Carbon::now()->addDays(12), 'actual' => null, 'status' => 'pending'],
        ];

        foreach ($milestones1 as $m) {
            ShipmentMilestone::firstOrCreate([
                'shipment_id' => $shipment1->id,
                'stage' => $m['stage'],
            ], [
                'title_en' => $m['title_en'],
                'title_ar' => $m['title_ar'],
                'location' => $m['location'],
                'planned_date' => $m['planned'],
                'actual_date' => $m['actual'],
                'status' => $m['status'],
                'created_by' => $user?->id,
            ]);
        }

        // Invoices for Shipment 1
        // Invoice A: Receivable to Customer (Consolidated Client Invoice)
        $clientInv = Invoice::firstOrCreate(['invoice_number' => 'INV-2026-0042'], [
            'type' => 'receivable',
            'category' => 'customer_billing',
            'shipment_id' => $shipment1->id,
            'partner_id' => $clientAlAmal->id,
            'currency' => 'USD',
            'exchange_rate' => 1.0000,
            'subtotal' => 14200.00,
            'tax_amount' => 0.00,
            'discount_amount' => 0.00,
            'total_amount' => 14200.00,
            'paid_amount' => 7000.00,
            'balance_due' => 7200.00,
            'status' => 'partially_paid',
            'issue_date' => Carbon::now()->subDays(10)->format('Y-m-d'),
            'due_date' => Carbon::now()->addDays(20)->format('Y-m-d'),
            'payment_terms' => 'Net 30',
            'notes' => '50% advance deposit received. Remaining balance due upon B/L release.',
            'created_by' => $user?->id,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $clientInv->id, 'charge_code' => 'ocean_freight'], [
            'description' => 'Ocean Freight (Shanghai to Alexandria) - 2x 40HC',
            'quantity' => 2,
            'unit_price' => 5200.00,
            'total_price' => 10400.00,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $clientInv->id, 'charge_code' => 'origin_thc'], [
            'description' => 'Terminal Handling Charges (Origin THC Shanghai)',
            'quantity' => 2,
            'unit_price' => 450.00,
            'total_price' => 900.00,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $clientInv->id, 'charge_code' => 'customs_clearance'], [
            'description' => 'Comprehensive Import Customs Brokerage & Documentation',
            'quantity' => 1,
            'unit_price' => 1500.00,
            'total_price' => 1500.00,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $clientInv->id, 'charge_code' => 'inland_trucking'], [
            'description' => 'Inland Drayage from Alex Port to Cairo Warehouse',
            'quantity' => 2,
            'unit_price' => 700.00,
            'total_price' => 1400.00,
        ]);

        // Invoice B: Payable to MSC (Carrier Ocean Freight Cost)
        $mscBill = Invoice::firstOrCreate(['invoice_number' => 'BILL-MSC-99214'], [
            'type' => 'payable',
            'category' => 'ocean_freight',
            'shipment_id' => $shipment1->id,
            'partner_id' => $carrierMSC->id,
            'currency' => 'USD',
            'exchange_rate' => 1.0000,
            'subtotal' => 8400.00,
            'tax_amount' => 0.00,
            'total_amount' => 8400.00,
            'paid_amount' => 8400.00,
            'balance_due' => 0.00,
            'status' => 'paid',
            'issue_date' => Carbon::now()->subDays(12)->format('Y-m-d'),
            'due_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
            'payment_terms' => 'Prepaid Upon Loading',
            'created_by' => $user?->id,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $mscBill->id, 'charge_code' => 'ocean_freight_cost'], [
            'description' => 'Carrier Ocean Freight 2x 40HC MSC Oscar',
            'quantity' => 2,
            'unit_price' => 4200.00,
            'total_price' => 8400.00,
        ]);

        // Invoice C: Payable to Customs Broker
        $brokerBill = Invoice::firstOrCreate(['invoice_number' => 'BILL-DAW-0081'], [
            'type' => 'payable',
            'category' => 'customs_brokerage',
            'shipment_id' => $shipment1->id,
            'partner_id' => $customsBroker->id,
            'currency' => 'USD',
            'exchange_rate' => 1.0000,
            'subtotal' => 950.00,
            'tax_amount' => 0.00,
            'total_amount' => 950.00,
            'paid_amount' => 0.00,
            'balance_due' => 950.00,
            'status' => 'issued',
            'issue_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'due_date' => Carbon::now()->addDays(15)->format('Y-m-d'),
            'created_by' => $user?->id,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $brokerBill->id, 'charge_code' => 'customs_fee'], [
            'description' => 'Customs declaration agency & inspection fee',
            'quantity' => 1,
            'unit_price' => 950.00,
            'total_price' => 950.00,
        ]);

        // Invoice D: Payable to Trucking Company
        $truckerBill = Invoice::firstOrCreate(['invoice_number' => 'BILL-TRK-7712'], [
            'type' => 'payable',
            'category' => 'trucking_drayage',
            'shipment_id' => $shipment1->id,
            'partner_id' => $truckerNile->id,
            'currency' => 'USD',
            'exchange_rate' => 1.0000,
            'subtotal' => 1000.00,
            'tax_amount' => 0.00,
            'total_amount' => 1000.00,
            'paid_amount' => 0.00,
            'balance_due' => 1000.00,
            'status' => 'draft',
            'issue_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
            'due_date' => Carbon::now()->addDays(25)->format('Y-m-d'),
            'created_by' => $user?->id,
        ]);

        InvoiceItem::firstOrCreate(['invoice_id' => $truckerBill->id, 'charge_code' => 'inland_cost'], [
            'description' => 'Road haulage Alex Port to Cairo (2 trailers)',
            'quantity' => 2,
            'unit_price' => 500.00,
            'total_price' => 1000.00,
        ]);

        // Shipment 2: Air Cargo (Frankfurt -> Cairo Cargo Village) - Delivered & Completed
        $shipment2 = Shipment::firstOrCreate(['shipment_number' => 'SHP-2026-0002'], [
            'booking_number' => 'AWB-MS-077-9871',
            'mbl_number' => '077-98716542',
            'hbl_number' => 'HAWB-FRX-9002',
            'mode' => 'air',
            'service_type' => 'air_standard',
            'direction' => 'import',
            'customer_id' => $clientAlAmal->id,
            'shipper_id' => $carrierMaersk->id,
            'consignee_id' => $clientAlAmal->id,
            'carrier_id' => $airlineEgyptAir->id,
            'customs_broker_id' => $customsBroker->id,
            'trucker_id' => $truckerNile->id,
            'origin_port_id' => $portFrankfurt->id,
            'destination_port_id' => $portCairoAir->id,
            'discharge_warehouse_id' => $bondedRamadan->id,
            'voyage_flight_number' => 'MS-786 Cargo',
            'incoterm' => 'CIP',
            'move_type' => 'Airport-to-Airport',
            'commodity' => 'Precision Medical Diagnostic Kits (Temperature Controlled)',
            'hs_code' => '3822.00.10',
            'total_packages' => 48,
            'package_type' => 'pallet',
            'total_gross_weight_kg' => 2850.00,
            'total_net_weight_kg' => 2600.00,
            'total_volume_cbm' => 14.800,
            'status' => 'delivered',
            'booking_date' => Carbon::now()->subDays(8)->format('Y-m-d'),
            'cargo_ready_date' => Carbon::now()->subDays(6)->format('Y-m-d'),
            'etd' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'atd' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'eta' => Carbon::now()->subDays(4)->format('Y-m-d'),
            'ata' => Carbon::now()->subDays(4)->format('Y-m-d'),
            'customs_cleared_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
            'delivery_date' => Carbon::now()->subDays(1)->format('Y-m-d'),
            'currency' => 'USD',
            'total_revenue' => 8900.00,
            'total_cost' => 6400.00,
            'gross_profit' => 2500.00,
            'margin_percentage' => 28.09,
            'created_by' => $user?->id,
            'notes' => 'Time-critical pharma shipment delivered successfully with active temperature loggers intact.',
        ]);

        // Shipment 3: Land Road Freight (Jebel Ali -> Riyadh Dry Port) - Booked
        $shipment3 = Shipment::firstOrCreate(['shipment_number' => 'SHP-2026-0003'], [
            'booking_number' => 'CMR-DXB-5544',
            'mbl_number' => 'CMR-7788990',
            'mode' => 'land',
            'service_type' => 'ftl',
            'direction' => 'export',
            'customer_id' => $clientApex->id,
            'shipper_id' => $clientApex->id,
            'consignee_id' => $clientApex->id,
            'carrier_id' => $truckerNile->id,
            'trucker_id' => $truckerNile->id,
            'origin_port_id' => $portJebelAli->id,
            'destination_port_id' => $portRiyadh->id,
            'loading_warehouse_id' => Warehouse::where('code', 'LOG-DXB-01')->first()?->id,
            'voyage_flight_number' => 'TRK-DXB-9021',
            'incoterm' => 'DDP',
            'move_type' => 'Door-to-Door',
            'commodity' => 'Hydraulic Valves & Automated Control Units',
            'hs_code' => '8481.20.00',
            'total_packages' => 24,
            'package_type' => 'crate',
            'total_gross_weight_kg' => 18200.00,
            'total_net_weight_kg' => 17100.00,
            'total_volume_cbm' => 78.500,
            'status' => 'booked',
            'booking_date' => Carbon::now()->subDays(1)->format('Y-m-d'),
            'cargo_ready_date' => Carbon::now()->addDays(1)->format('Y-m-d'),
            'etd' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'eta' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'currency' => 'USD',
            'total_revenue' => 6500.00,
            'total_cost' => 4800.00,
            'gross_profit' => 1700.00,
            'margin_percentage' => 26.15,
            'created_by' => $user?->id,
            'notes' => 'Cross-border trucking with Batha border customs clearance.',
        ]);

        // Recalculate all financials
        $shipment1->recalculateFinancials();
    }
}
