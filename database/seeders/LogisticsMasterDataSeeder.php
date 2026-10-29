<?php

namespace Database\Seeders;

use App\Models\Incoterm;
use App\Models\MoveType;
use App\Models\PackageType;
use Illuminate\Database\Seeder;

class LogisticsMasterDataSeeder extends Seeder
{
    /**
     * Seed Incoterms, Packages, and Move Types
     */
    public function run(): void
    {
        // 1. Incoterms 2020 Standard
        $incoterms = [
            [
                'code' => 'FOB',
                'name' => 'Free on Board',
                'name_ar' => 'تسليم على ظهر السفينة (FOB)',
                'description' => 'Seller delivers goods on board the vessel nominated by the buyer at the named port of shipment.',
                'applicable_modes' => 'sea',
                'status' => 'active',
            ],
            [
                'code' => 'CIF',
                'name' => 'Cost, Insurance and Freight',
                'name_ar' => 'التكلفة والتأمين وأجور الشحن (CIF)',
                'description' => 'Seller pays for carriage and insurance to the named port of destination.',
                'applicable_modes' => 'sea',
                'status' => 'active',
            ],
            [
                'code' => 'CFR',
                'name' => 'Cost and Freight',
                'name_ar' => 'التكلفة وأجور الشحن (CFR)',
                'description' => 'Seller covers costs of carriage to named destination port. Risk transfers upon boarding.',
                'applicable_modes' => 'sea',
                'status' => 'active',
            ],
            [
                'code' => 'EXW',
                'name' => 'Ex Works',
                'name_ar' => 'تسليم أرض المصنع (EXW)',
                'description' => 'Seller makes goods available at their premises. Buyer bears all transport risks and costs.',
                'applicable_modes' => 'all',
                'status' => 'active',
            ],
            [
                'code' => 'DDP',
                'name' => 'Delivered Duty Paid',
                'name_ar' => 'تسليم مدفوع الرسوم والجمارك (DDP)',
                'description' => 'Seller handles transport, clearance, and duties right up to buyer destination door.',
                'applicable_modes' => 'all',
                'status' => 'active',
            ],
            [
                'code' => 'DAP',
                'name' => 'Delivered at Place',
                'name_ar' => 'تسليم في مكان محدد (DAP)',
                'description' => 'Seller delivers when goods are placed at buyer disposal on arriving vehicle ready for unloading.',
                'applicable_modes' => 'all',
                'status' => 'active',
            ],
            [
                'code' => 'FCA',
                'name' => 'Free Carrier',
                'name_ar' => 'تسليم للناقل (FCA)',
                'description' => 'Seller delivers goods to buyer carrier at seller premises or another specified location.',
                'applicable_modes' => 'all',
                'status' => 'active',
            ],
            [
                'code' => 'CIP',
                'name' => 'Carriage and Insurance Paid To',
                'name_ar' => 'الشحن والتأمين مدفوعان إلى (CIP)',
                'description' => 'Seller pays for carriage and maximum cover insurance to destination.',
                'applicable_modes' => 'all',
                'status' => 'active',
            ],
            [
                'code' => 'CPT',
                'name' => 'Carriage Paid To',
                'name_ar' => 'الشحن مدفوع إلى (CPT)',
                'description' => 'Seller pays for carriage of goods up to named destination place.',
                'applicable_modes' => 'all',
                'status' => 'active',
            ],
        ];

        foreach ($incoterms as $inc) {
            Incoterm::firstOrCreate(['code' => $inc['code']], $inc);
        }

        // 2. Package Types
        $packageTypes = [
            [
                'code' => 'PALLET',
                'name' => 'Pallet / Skids',
                'name_ar' => 'طبلية / بالتة خشبية أو بلاستيكية',
                'description' => 'Standard Euro (120x80cm) or Industrial (120x100cm) pallets.',
                'status' => 'active',
            ],
            [
                'code' => 'CARTON',
                'name' => 'Carton / Box',
                'name_ar' => 'كرتونة / صندوق ورقي مقوى',
                'description' => 'Corrugated cardboard boxes for general consumer goods.',
                'status' => 'active',
            ],
            [
                'code' => 'CRATE',
                'name' => 'Wooden Crate',
                'name_ar' => 'قفص خشبي محكم',
                'description' => 'Heavy-duty wooden crates for machinery and fragile industrial components.',
                'status' => 'active',
            ],
            [
                'code' => 'DRUM',
                'name' => 'Steel / Plastic Drum',
                'name_ar' => 'برميل صلب / بلاستيك',
                'description' => 'Cylindrical containers for chemical and liquid products (200L / 55 Gallon).',
                'status' => 'active',
            ],
            [
                'code' => 'BAG',
                'name' => 'Bag / Sack',
                'name_ar' => 'شيكارة / كيس حبيبات',
                'description' => 'Multi-ply paper or polypropylene woven sacks for raw bulk materials.',
                'status' => 'active',
            ],
            [
                'code' => 'IBC_TOTE',
                'name' => 'IBC Tote (1000L)',
                'name_ar' => 'خزان وسيط سوائل (IBC Tote)',
                'description' => 'Intermediate bulk container for industrial liquids.',
                'status' => 'active',
            ],
            [
                'code' => 'ROLL',
                'name' => 'Roll / Coil',
                'name_ar' => 'رول / لفة ورق أو حديد',
                'description' => 'Textile rolls, steel coils, and paper master reels.',
                'status' => 'active',
            ],
        ];

        foreach ($packageTypes as $pkg) {
            PackageType::firstOrCreate(['code' => $pkg['code']], $pkg);
        }

        // 3. Move Types
        $moveTypes = [
            [
                'code' => 'Door-to-Door',
                'name' => 'Door to Door (D2D)',
                'name_ar' => 'من الباب إلى الباب',
                'description' => 'Complete end-to-end multimodal logistics from shipper factory to consignee warehouse.',
                'status' => 'active',
            ],
            [
                'code' => 'Port-to-Port',
                'name' => 'Port to Port (P2P)',
                'name_ar' => 'من الميناء إلى الميناء',
                'description' => 'Ocean carriage between loading port terminal and discharge port terminal.',
                'status' => 'active',
            ],
            [
                'code' => 'Door-to-Port',
                'name' => 'Door to Port (D2P)',
                'name_ar' => 'من الباب إلى الميناء',
                'description' => 'Pick up from shipper site with delivery at destination port terminal.',
                'status' => 'active',
            ],
            [
                'code' => 'Port-to-Door',
                'name' => 'Port to Door (P2D)',
                'name_ar' => 'من الميناء إلى الباب',
                'description' => 'Receipt at loading port with final inland delivery to consignee door.',
                'status' => 'active',
            ],
            [
                'code' => 'Airport-to-Airport',
                'name' => 'Airport to Airport (A2A)',
                'name_ar' => 'من المطار إلى المطار',
                'description' => 'Air cargo carriage between origin airport and destination airport terminals.',
                'status' => 'active',
            ],
            [
                'code' => 'CFS-to-CFS',
                'name' => 'CFS to CFS (Container Freight Station)',
                'name_ar' => 'من محطة فرز إلى محطة فرز (LCL)',
                'description' => 'Consolidation station to deconsolidation station for LCL groupage cargo.',
                'status' => 'active',
            ],
        ];

        foreach ($moveTypes as $mt) {
            MoveType::firstOrCreate(['code' => $mt['code']], $mt);
        }
    }
}
