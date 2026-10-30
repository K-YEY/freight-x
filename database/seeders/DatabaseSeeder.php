<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Note;
use App\Models\Opportunity;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Single User Account
        User::firstOrCreate(
            ['email' => 'alex@twenty.local'],
            [
                'name' => 'Alex Rivera',
                'password' => bcrypt('password'),
            ]
        );

        // 2. Realistic Freight Carriers & Logistics Partners (Companies)
        $companiesData = [
            [
                'name' => 'Maersk Line Egypt',
                'code' => 'MAEU',
                'partner_type' => 'shipping_line',
                'contact_person' => 'Ahmed Mansour (Key Accounts)',
                'phone' => '+20 3 481 9000',
                'email' => 'alex.ops@maersk.com',
                'tax_number' => '200-482-190',
                'domain' => 'maersk.com',
                'website_url' => 'https://www.maersk.com',
                'industry' => 'Container Ocean Carrier',
                'employees_count' => 1200,
                'annual_revenue' => 45000000,
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'address' => 'Sultan Hussein St, El Messallah Sharq',
                'description' => 'Global container ocean shipping line, direct calls at Dekheila and Port Said East container terminals.',
            ],
            [
                'name' => 'MSC Mediterranean Shipping Co',
                'code' => 'MSCU',
                'partner_type' => 'shipping_line',
                'contact_person' => 'Tarek El-Kady (Booking Desk)',
                'phone' => '+20 3 487 5500',
                'email' => 'egy-operations@msc.com',
                'tax_number' => '201-940-332',
                'domain' => 'msc.com',
                'website_url' => 'https://www.msc.com',
                'industry' => 'Container Ocean Carrier',
                'employees_count' => 950,
                'annual_revenue' => 38000000,
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'address' => 'El Horreya Avenue, Latin Quarter',
                'description' => 'Major ocean liner serving trade lanes between Far East, Mediterranean, Northern Europe and the Americas.',
            ],
            [
                'name' => 'Hapag-Lloyd Egypt',
                'code' => 'HLCU',
                'partner_type' => 'shipping_line',
                'contact_person' => 'Marina Samir (Customer Service)',
                'phone' => '+20 66 322 1400',
                'email' => 'cairo.cs@hlag.com',
                'tax_number' => '205-881-401',
                'domain' => 'hapag-lloyd.com',
                'website_url' => 'https://www.hapag-lloyd.com',
                'industry' => 'Container Ocean Carrier',
                'employees_count' => 400,
                'annual_revenue' => 22000000,
                'city' => 'Port Said',
                'country' => 'Egypt',
                'address' => 'Gomhouria St, Port Said Port District',
                'description' => 'German container carrier specializing in reefer cargo and specialized dry container logistics.',
            ],
            [
                'name' => 'CMA CGM Egypt',
                'code' => 'CMDU',
                'partner_type' => 'shipping_line',
                'contact_person' => 'Karim Zaki (Line Operations)',
                'phone' => '+20 3 480 3400',
                'email' => 'egy.genops@cma-cgm.com',
                'tax_number' => '208-112-990',
                'domain' => 'cma-cgm.com',
                'website_url' => 'https://www.cma-cgm.com',
                'industry' => 'Container Ocean Carrier',
                'employees_count' => 600,
                'annual_revenue' => 29000000,
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'address' => 'Fouad Street, Downtown',
                'description' => 'Ocean container services with extensive hub operations in Damietta and Alexandria ports.',
            ],
            [
                'name' => 'Alexandria Drayage & Heavy Haul',
                'code' => 'ALX-TRK',
                'partner_type' => 'trucker',
                'contact_person' => 'Mahmoud El-Shennawy (Fleet Dispatch)',
                'phone' => '+20 10 0123 4567',
                'email' => 'dispatch@alxdrayage.com',
                'tax_number' => '310-820-114',
                'domain' => 'alxdrayage.com',
                'website_url' => 'https://alxdrayage.com',
                'industry' => 'Inland Heavy Drayage & Flatbeds',
                'employees_count' => 140,
                'annual_revenue' => 7500000,
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'address' => 'Dekheila Gate 27 Industrial Zone',
                'description' => 'Fleet of 85 modern Mercedes Actros tractors, low-beds, and skeleton chassis for port-to-factory container trucking.',
            ],
            [
                'name' => 'Nile Customs Clearance Syndicate',
                'code' => 'NILE-BRK',
                'partner_type' => 'customs_broker',
                'contact_person' => 'Mostafa El-Naggar (Licensed Broker #4820)',
                'phone' => '+20 11 1234 5678',
                'email' => 'clearance@nilecustoms.eg',
                'tax_number' => '104-552-870',
                'domain' => 'nilecustoms.eg',
                'website_url' => 'https://nilecustoms.eg',
                'industry' => 'Customs Brokerage & Nafeza Clearance',
                'employees_count' => 45,
                'annual_revenue' => 3200000,
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'address' => 'Alexandria Port Custom House, Building B',
                'description' => 'Accredited customs brokerage firm handling ACI declarations, certificate of origin verifications, and tariff inspection.',
            ],
            [
                'name' => 'Shanghai Oceanway Logistics Co., Ltd',
                'code' => 'SH-WAY',
                'partner_type' => 'overseas_agent',
                'contact_person' => 'Li Wei (Overseas Routing Agent)',
                'phone' => '+86 21 6888 1234',
                'email' => 'booking@shanghaioceanway.cn',
                'tax_number' => '91310000MA1FL8820',
                'domain' => 'shanghaioceanway.cn',
                'website_url' => 'https://shanghaioceanway.cn',
                'industry' => 'Overseas Freight Forwarding Agent',
                'employees_count' => 220,
                'annual_revenue' => 18000000,
                'city' => 'Shanghai',
                'country' => 'China',
                'address' => 'Pudong New Area, Century Avenue, Tower 1',
                'description' => 'Exclusive origin agent in China providing factory pickups, export customs clearance, and FOB/EXW bookings at Shanghai & Ningbo.',
            ],
            [
                'name' => 'EgyptAir Cargo',
                'code' => 'MS-CGO',
                'partner_type' => 'airline',
                'contact_person' => 'Capt. Essam Adel (Cargo Booking)',
                'phone' => '+20 2 2265 7000',
                'email' => 'cargo.res@egyptair.com',
                'tax_number' => '100-001-999',
                'domain' => 'egyptair-cargo.com',
                'website_url' => 'https://www.egyptair-cargo.com',
                'industry' => 'Air Cargo Carrier',
                'employees_count' => 800,
                'annual_revenue' => 28000000,
                'city' => 'Cairo',
                'country' => 'Egypt',
                'address' => 'Cairo International Airport, Cargo Terminal Village',
                'description' => 'National air freighter fleet operating A330 freighters connecting Cairo with Europe, the Gulf, and Africa.',
            ],
        ];

        $companies = [];
        foreach ($companiesData as $data) {
            $companies[] = Company::create($data);
        }

        // 3. Freight Forwarder Customers (Contacts)
        $contactsData = [
            [
                'first_name' => 'Hazem',
                'last_name' => 'El-Araby',
                'company_name' => 'El-Araby Group for Home Appliances',
                'customer_type' => 'importer',
                'tax_id' => '100-234-890',
                'commercial_registry' => 'CR-948201-CAI',
                'customs_card_number' => 'IMP-88204-EG',
                'nafeza_id' => 'NFZ-EG-2026-9041',
                'payment_terms' => 'credit_30',
                'credit_limit' => 150000.00,
                'billing_address' => 'Industrial Zone, Quesna, Menoufia & 12 Ramses St, Cairo',
                'notes' => 'High-volume importer of electronic components and compressors from Ningbo and Shanghai. Direct discharge at Dekheila.',
                'email' => 'procurement@elarabygroup.com',
                'phone' => '+20 2 2400 1122',
                'job_title' => 'Supply Chain & Procurement Director',
                'city' => 'Cairo',
                'country' => 'Egypt',
                'company_id' => $companies[0]->id,
                'status' => 'customer',
                'tags' => ['VIP', 'Importer', 'Ocean Freight'],
                'linkedin_url' => 'https://linkedin.com/in/hazem-elaraby',
            ],
            [
                'first_name' => 'Eng. Sherif',
                'last_name' => 'Bahaa',
                'company_name' => 'Ezz Rolling Mills & Metal Industries',
                'customer_type' => 'exporter',
                'tax_id' => '201-904-118',
                'commercial_registry' => 'CR-33419-ALX',
                'customs_card_number' => 'EXP-77102-EG',
                'nafeza_id' => 'NFZ-EG-2026-4402',
                'payment_terms' => 'credit_60',
                'credit_limit' => 300000.00,
                'billing_address' => 'Dekheila Free Zone, Alexandria Port',
                'notes' => 'Heavy exports of steel rebar and wire rods to Antwerp, Ravenna, and Jeddah. Requires verified gross mass (VGM) certificates.',
                'email' => 'logistics@ezzsteel.com',
                'phone' => '+20 3 429 8800',
                'job_title' => 'Export Logistics Manager',
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'company_id' => $companies[1]->id,
                'status' => 'customer',
                'tags' => ['Exporter', 'Breakbulk', 'Steel'],
                'linkedin_url' => 'https://linkedin.com/in/sherif-bahaa',
            ],
            [
                'first_name' => 'Mahmoud',
                'last_name' => 'Abdel-Fattah',
                'company_name' => 'Delta Fresh Crops & Agro Commodities',
                'customer_type' => 'exporter',
                'tax_id' => '305-667-200',
                'commercial_registry' => 'CR-11094-TND',
                'customs_card_number' => 'EXP-55912-EG',
                'nafeza_id' => 'NFZ-EG-2026-1189',
                'payment_terms' => 'credit_15',
                'credit_limit' => 75000.00,
                'billing_address' => 'Tanta Agricultural Highway, Gharbia',
                'notes' => 'Reefer citrus and dates exporter to Rotterdam and St. Petersburg. Mandatory PTI (Pre-Trip Inspection) and cold treatment logs.',
                'email' => 'export@delta-agrocrops.com',
                'phone' => '+20 10 9876 5432',
                'job_title' => 'Managing Director',
                'city' => 'Tanta',
                'country' => 'Egypt',
                'company_id' => $companies[2]->id,
                'status' => 'customer',
                'tags' => ['Reefer', 'Agro', 'Exporter'],
                'linkedin_url' => 'https://linkedin.com/in/mahmoud-fattah',
            ],
            [
                'first_name' => 'Dr. Nader',
                'last_name' => 'Shawky',
                'company_name' => 'Cairo Pharma Care & Medical Supplies Ltd',
                'customer_type' => 'importer',
                'tax_id' => '402-118-993',
                'commercial_registry' => 'CR-77218-GZA',
                'customs_card_number' => 'IMP-33104-EG',
                'nafeza_id' => 'NFZ-EG-2026-7781',
                'payment_terms' => 'cash',
                'credit_limit' => 0.00,
                'billing_address' => 'Pyramids Road, Giza',
                'notes' => 'Temperature-controlled pharmaceutical active ingredients (API) via Air Freight. Requires Egyptian Drug Authority (EDA) release prior to discharge.',
                'email' => 'supplychain@cairopharma.eg',
                'phone' => '+20 2 3345 8890',
                'job_title' => 'Head of Supply Chain',
                'city' => 'Giza',
                'country' => 'Egypt',
                'company_id' => $companies[7]->id,
                'status' => 'customer',
                'tags' => ['Pharma', 'Air Cargo', 'Importer'],
                'linkedin_url' => 'https://linkedin.com/in/nader-shawky',
            ],
            [
                'first_name' => 'Sheikh Fouad',
                'last_name' => 'Al-Maghraby',
                'company_name' => 'Al-Haramain Grains & Oilseeds Trading',
                'customer_type' => 'trader',
                'tax_id' => '509-332-110',
                'commercial_registry' => 'CR-66290-CAI',
                'customs_card_number' => 'IMP-12903-EG',
                'nafeza_id' => 'NFZ-EG-2026-8833',
                'payment_terms' => 'credit_30',
                'credit_limit' => 120000.00,
                'billing_address' => 'Nasr City, Cairo',
                'notes' => 'Soybean and yellow corn bulk container shipments from Santos, Brazil. Fast delivery of original endorsed Bills of Lading.',
                'email' => 'trading@alharamain-eg.com',
                'phone' => '+20 12 3456 7890',
                'job_title' => 'Chief Trading Officer',
                'city' => 'Cairo',
                'country' => 'Egypt',
                'company_id' => $companies[3]->id,
                'status' => 'customer',
                'tags' => ['Trader', 'Grains', 'Commodities'],
                'linkedin_url' => 'https://linkedin.com/in/fouad-maghraby',
            ],
            [
                'first_name' => 'Ashraf',
                'last_name' => 'El-Sayed',
                'company_name' => 'Al-Amal Textile Distribution Agency',
                'customer_type' => 'broker_client',
                'tax_id' => '601-778-442',
                'commercial_registry' => 'CR-55410-ALX',
                'customs_card_number' => 'IMP-90412-EG',
                'nafeza_id' => 'NFZ-EG-2026-2244',
                'payment_terms' => 'cash',
                'credit_limit' => 10000.00,
                'billing_address' => 'Gomhouria Square, Alexandria & Mahalla El-Kobra',
                'notes' => 'Clearance and trucking only client. Fabric yarns and textile machinery spare parts.',
                'email' => 'ashraf@alamal-textiles.com',
                'phone' => '+20 11 4455 6677',
                'job_title' => 'Logistics Representative',
                'city' => 'Alexandria',
                'country' => 'Egypt',
                'company_id' => $companies[5]->id,
                'status' => 'lead',
                'tags' => ['Textiles', 'Clearance Only', 'Trucking'],
                'linkedin_url' => 'https://linkedin.com/in/ashraf-sayed',
            ],
        ];

        $contacts = [];
        foreach ($contactsData as $c) {
            $contacts[] = Contact::create($c);
        }

        // 4. Opportunities (Freight Bookings & Quotation Deals)
        $opportunitiesData = [
            [
                'name' => '10x40ft HC Booking from Ningbo to Alexandria (El-Araby)',
                'amount' => 48000,
                'stage' => 'proposal',
                'close_date' => Carbon::now()->addDays(14)->toDateString(),
                'probability' => 80,
                'company_id' => $companies[0]->id,
                'contact_id' => $contacts[0]->id,
                'notes' => 'Freight rate offered via Maersk Line at $4,800 per 40ft HC with 21 days free demurrage.',
            ],
            [
                'name' => 'Export 1200 MT Steel Rebar to Antwerp (Ezz Steel)',
                'amount' => 125000,
                'stage' => 'meeting',
                'close_date' => Carbon::now()->addDays(30)->toDateString(),
                'probability' => 60,
                'company_id' => $companies[1]->id,
                'contact_id' => $contacts[1]->id,
                'notes' => 'Meeting with export committee to finalize loading berths and stevedoring rates at Dekheila Port.',
            ],
            [
                'name' => '5x40ft Reefer Citrus Export to Rotterdam (Delta Agro)',
                'amount' => 35000,
                'stage' => 'won',
                'close_date' => Carbon::now()->subDays(3)->toDateString(),
                'probability' => 100,
                'company_id' => $companies[2]->id,
                'contact_id' => $contacts[2]->id,
                'notes' => 'Booking confirmed with Hapag-Lloyd. Vessel cut-off date is this Thursday at Damietta.',
            ],
            [
                'name' => 'Air Cargo Express Pharma from Frankfurt to CAI (Cairo Pharma)',
                'amount' => 18500,
                'stage' => 'proposal',
                'close_date' => Carbon::now()->addDays(7)->toDateString(),
                'probability' => 85,
                'company_id' => $companies[7]->id,
                'contact_id' => $contacts[3]->id,
                'notes' => 'Temperature active container (+15C to +25C) quoted via EgyptAir Cargo.',
            ],
            [
                'name' => 'Bulk Corn Containers from Santos to Dekheila (Al-Haramain)',
                'amount' => 74000,
                'stage' => 'screening',
                'close_date' => Carbon::now()->addDays(20)->toDateString(),
                'probability' => 40,
                'company_id' => $companies[3]->id,
                'contact_id' => $contacts[4]->id,
                'notes' => 'Evaluating CMA CGM vs MSC ocean freight rates for 15x40ft shipments.',
            ],
            [
                'name' => 'Customs Clearance & Inland Drayage 4x40ft (Al-Amal Textiles)',
                'amount' => 12000,
                'stage' => 'new',
                'close_date' => Carbon::now()->addDays(10)->toDateString(),
                'probability' => 30,
                'company_id' => $companies[5]->id,
                'contact_id' => $contacts[5]->id,
                'notes' => 'Client requested all-inclusive clearance and trucking rate to Mahalla El-Kobra.',
            ],
        ];

        $opportunities = [];
        foreach ($opportunitiesData as $opp) {
            $opportunities[] = Opportunity::create($opp);
        }

        // 5. Operational Tasks
        $tasksData = [
            [
                'title' => 'Submit Nafeza ACID pre-registration draft for El-Araby shipment',
                'description' => 'Verify commercial invoice and proforma with Chinese exporter before ACID issuance.',
                'due_date' => Carbon::now()->addDays(2)->toDateString(),
                'priority' => 'urgent',
                'status' => 'todo',
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
            ],
            [
                'title' => 'Verify container gross mass (VGM) with Ezz Steel terminal',
                'description' => 'Cross-check weighbridge certificates prior to container gate-in at Alexandria port.',
                'due_date' => Carbon::now()->addDays(4)->toDateString(),
                'priority' => 'high',
                'status' => 'in_progress',
                'contact_id' => $contacts[1]->id,
                'opportunity_id' => $opportunities[1]->id,
                'company_id' => $companies[1]->id,
            ],
            [
                'title' => 'Arrange Pre-Trip Inspection (PTI) for 5 reefer containers',
                'description' => 'Inspect set point (+4C) and genset calibration with Hapag-Lloyd Damietta depot.',
                'due_date' => Carbon::now()->addDays(1)->toDateString(),
                'priority' => 'high',
                'status' => 'completed',
                'contact_id' => $contacts[2]->id,
                'opportunity_id' => $opportunities[2]->id,
                'company_id' => $companies[2]->id,
            ],
            [
                'title' => 'Deliver original endorsed Bill of Lading to Nile Customs Broker',
                'description' => 'Coordinate delivery order (DO) release at Maersk maritime counter.',
                'due_date' => Carbon::now()->addDays(3)->toDateString(),
                'priority' => 'medium',
                'status' => 'todo',
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
            ],
        ];

        foreach ($tasksData as $t) {
            Task::create($t);
        }

        // 6. Operational Notes
        $notesData = [
            [
                'title' => 'El-Araby Group Master Account Terms',
                'content' => "Key client requirement:\n- 21 days demurrage/detention at destination.\n- Electronic copy of original BL required 5 days before ETA.\n- Dedicated truck dispatch to Quesna facility upon clearance.",
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
            ],
            [
                'title' => 'Ezz Steel Loading Protocol',
                'content' => "Safety & Stevedoring specifications:\n- Flat rack lashing must comply with IMO standards.\n- Tare weight cross-verification mandatory on all outbound trucks.",
                'contact_id' => $contacts[1]->id,
                'opportunity_id' => $opportunities[1]->id,
                'company_id' => $companies[1]->id,
            ],
            [
                'title' => 'Cold Chain Requirements - Delta Agro',
                'content' => 'Continuous temperature monitoring required at +4C. Data logger must be downloaded upon arrival in Rotterdam.',
                'contact_id' => $contacts[2]->id,
                'opportunity_id' => $opportunities[2]->id,
                'company_id' => $companies[2]->id,
            ],
        ];

        foreach ($notesData as $n) {
            Note::create($n);
        }

        // 7. Activity Logs
        $activities = [
            [
                'type' => 'stage_change',
                'title' => 'Quotation moved to Proposal',
                'description' => 'Freight rate quotation for 10x40ft HC Ningbo to Alexandria sent to El-Araby Group.',
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
                'created_at' => Carbon::now()->subHours(3),
            ],
            [
                'type' => 'call',
                'title' => 'Operations Call with Ezz Steel',
                'description' => 'Confirmed breakbulk berth allocation and stevedoring gang schedule at Dekheila port.',
                'contact_id' => $contacts[1]->id,
                'opportunity_id' => $opportunities[1]->id,
                'company_id' => $companies[1]->id,
                'created_at' => Carbon::now()->subHours(8),
            ],
            [
                'type' => 'stage_change',
                'title' => 'Export Booking Won & Confirmed 🎉',
                'description' => 'Delta Fresh Crops 5x40ft Reefer booking to Rotterdam confirmed with Hapag-Lloyd ($35,000).',
                'contact_id' => $contacts[2]->id,
                'opportunity_id' => $opportunities[2]->id,
                'company_id' => $companies[2]->id,
                'created_at' => Carbon::now()->subDays(3),
            ],
            [
                'type' => 'meeting',
                'title' => 'Customs Tariff Review Meeting',
                'description' => 'Met with Nile Customs Broker to finalize ACI filing and ACID entry number for textile consignment.',
                'contact_id' => $contacts[5]->id,
                'opportunity_id' => $opportunities[5]->id,
                'company_id' => $companies[5]->id,
                'created_at' => Carbon::now()->subDays(1),
            ],
        ];

        foreach ($activities as $act) {
            ActivityLog::create($act);
        }
    }
}
