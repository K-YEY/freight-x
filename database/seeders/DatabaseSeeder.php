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

        // 2. Realistic Companies
        $companiesData = [
            [
                'name' => 'Linear Orbit Inc.',
                'domain' => 'linear.app',
                'website_url' => 'https://linear.app',
                'industry' => 'Software & SaaS',
                'employees_count' => 85,
                'annual_revenue' => 24000000,
                'city' => 'San Francisco',
                'country' => 'United States',
                'address' => '548 Market St, SF',
                'linkedin_url' => 'https://linkedin.com/company/linear-app',
                'description' => 'Issue tracking built for speed and software product teams.',
            ],
            [
                'name' => 'Vercel Platform',
                'domain' => 'vercel.com',
                'website_url' => 'https://vercel.com',
                'industry' => 'Cloud Infrastructure',
                'employees_count' => 450,
                'annual_revenue' => 95000000,
                'city' => 'San Francisco',
                'country' => 'United States',
                'address' => '340 S Lemon Ave, Walnut, CA',
                'linkedin_url' => 'https://linkedin.com/company/vercel',
                'description' => 'Frontend cloud platform providing developer experience & deployment automation.',
            ],
            [
                'name' => 'Stripe Payments Ltd',
                'domain' => 'stripe.com',
                'website_url' => 'https://stripe.com',
                'industry' => 'Fintech',
                'employees_count' => 7000,
                'annual_revenue' => 14000000000,
                'city' => 'South San Francisco',
                'country' => 'United States',
                'address' => '354 Oyster Point Blvd',
                'linkedin_url' => 'https://linkedin.com/company/stripe',
                'description' => 'Financial infrastructure platform for the internet economy.',
            ],
            [
                'name' => 'Supabase Technologies',
                'domain' => 'supabase.com',
                'website_url' => 'https://supabase.com',
                'industry' => 'Developer Tools',
                'employees_count' => 120,
                'annual_revenue' => 18000000,
                'city' => 'Singapore',
                'country' => 'Singapore',
                'address' => 'Marina Bay Financial Centre',
                'linkedin_url' => 'https://linkedin.com/company/supabase',
                'description' => 'The open source Firebase alternative built on PostgreSQL.',
            ],
            [
                'name' => 'Retool Systems',
                'domain' => 'retool.com',
                'website_url' => 'https://retool.com',
                'industry' => 'Enterprise Software',
                'employees_count' => 380,
                'annual_revenue' => 75000000,
                'city' => 'San Francisco',
                'country' => 'United States',
                'address' => 'Mission St, San Francisco',
                'linkedin_url' => 'https://linkedin.com/company/retool',
                'description' => 'Fastest way to build internal tools and custom portals.',
            ],
            [
                'name' => 'Raycast Hub',
                'domain' => 'raycast.com',
                'website_url' => 'https://raycast.com',
                'industry' => 'Productivity Software',
                'employees_count' => 45,
                'annual_revenue' => 8500000,
                'city' => 'London',
                'country' => 'United Kingdom',
                'address' => 'Shoreditch High St, London',
                'linkedin_url' => 'https://linkedin.com/company/raycast',
                'description' => 'Blazingly fast, extendable launcher and AI assistant for macOS & Windows.',
            ],
            [
                'name' => 'Algolia Search',
                'domain' => 'algolia.com',
                'website_url' => 'https://algolia.com',
                'industry' => 'AI Search & Discovery',
                'employees_count' => 600,
                'annual_revenue' => 120000000,
                'city' => 'Paris',
                'country' => 'France',
                'address' => '55 Rue d\'Amsterdam, Paris',
                'linkedin_url' => 'https://linkedin.com/company/algolia',
                'description' => 'Flexible AI search and discovery API powering millions of experiences.',
            ],
        ];

        $companies = [];
        foreach ($companiesData as $data) {
            $companies[] = Company::create($data);
        }

        // 3. Contacts
        $contactsData = [
            [
                'first_name' => 'Karri',
                'last_name' => 'Saarinen',
                'email' => 'karri@linear.app',
                'phone' => '+1 (415) 890-1122',
                'job_title' => 'CEO & Co-founder',
                'city' => 'San Francisco',
                'company_id' => $companies[0]->id,
                'status' => 'customer',
                'tags' => ['Founder', 'VIP', 'Product'],
                'linkedin_url' => 'https://linkedin.com/in/karrisaarinen',
            ],
            [
                'first_name' => 'Tuomas',
                'last_name' => 'Artman',
                'email' => 'tuomas@linear.app',
                'phone' => '+1 (415) 890-1123',
                'job_title' => 'CTO & Co-founder',
                'city' => 'San Francisco',
                'company_id' => $companies[0]->id,
                'status' => 'customer',
                'tags' => ['Founder', 'Tech Lead'],
                'linkedin_url' => 'https://linkedin.com/in/tuomasartman',
            ],
            [
                'first_name' => 'Guillermo',
                'last_name' => 'Rauch',
                'email' => 'rauchg@vercel.com',
                'phone' => '+1 (415) 745-9920',
                'job_title' => 'CEO',
                'city' => 'San Francisco',
                'company_id' => $companies[1]->id,
                'status' => 'lead',
                'tags' => ['Key Account', 'Decision Maker', 'Enterprise'],
                'linkedin_url' => 'https://linkedin.com/in/rauchg',
            ],
            [
                'first_name' => 'Lee',
                'last_name' => 'Robinson',
                'email' => 'leerob@vercel.com',
                'phone' => '+1 (415) 745-9921',
                'job_title' => 'VP of Developer Experience',
                'city' => 'Des Moines',
                'company_id' => $companies[1]->id,
                'status' => 'lead',
                'tags' => ['Champion', 'DevRel'],
                'linkedin_url' => 'https://linkedin.com/in/leeerob',
            ],
            [
                'first_name' => 'Patrick',
                'last_name' => 'Collison',
                'email' => 'patrick@stripe.com',
                'phone' => '+1 (650) 555-0199',
                'job_title' => 'CEO & Co-founder',
                'city' => 'San Francisco',
                'company_id' => $companies[2]->id,
                'status' => 'lead',
                'tags' => ['Strategic', 'Fintech', 'VIP'],
                'linkedin_url' => 'https://linkedin.com/in/patrickcollison',
            ],
            [
                'first_name' => 'Paul',
                'last_name' => 'Copplestone',
                'email' => 'paul@supabase.com',
                'phone' => '+65 6789 0123',
                'job_title' => 'CEO & Co-founder',
                'city' => 'Singapore',
                'company_id' => $companies[3]->id,
                'status' => 'customer',
                'tags' => ['Open Source', 'Decision Maker'],
                'linkedin_url' => 'https://linkedin.com/in/paulcopplestone',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Hsu',
                'email' => 'david@retool.com',
                'phone' => '+1 (415) 441-2900',
                'job_title' => 'Founder & CEO',
                'city' => 'San Francisco',
                'company_id' => $companies[4]->id,
                'status' => 'lead',
                'tags' => ['Executive', 'Growth'],
                'linkedin_url' => 'https://linkedin.com/in/david-hsu',
            ],
            [
                'first_name' => 'Thomas',
                'last_name' => 'Paul Mann',
                'email' => 'thomas@raycast.com',
                'phone' => '+44 20 7946 0912',
                'job_title' => 'CEO & Co-founder',
                'city' => 'London',
                'company_id' => $companies[5]->id,
                'status' => 'customer',
                'tags' => ['Design', 'Founder'],
                'linkedin_url' => 'https://linkedin.com/in/thomaspaulmann',
            ],
            [
                'first_name' => 'Bernadette',
                'last_name' => 'Nixon',
                'email' => 'bernadette@algolia.com',
                'phone' => '+33 1 42 68 55 00',
                'job_title' => 'Chief Executive Officer',
                'city' => 'Paris',
                'company_id' => $companies[6]->id,
                'status' => 'lead',
                'tags' => ['Enterprise', 'AI'],
                'linkedin_url' => 'https://linkedin.com/in/bernadettenixon',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Chen',
                'email' => 'sarah.chen@innovate.co',
                'phone' => '+1 (512) 345-6789',
                'job_title' => 'VP of Revenue Operations',
                'city' => 'Austin',
                'company_id' => $companies[0]->id,
                'status' => 'customer',
                'tags' => ['Operations', 'Champion'],
                'linkedin_url' => 'https://linkedin.com/in/sarahchen',
            ],
        ];

        $contacts = [];
        foreach ($contactsData as $c) {
            $contacts[] = Contact::create($c);
        }

        // 4. Opportunities (Deals) across Twenty CRM Pipeline Stages:
        // Stages: new, screening, meeting, proposal, won, lost
        $opportunitiesData = [
            [
                'name' => 'Linear Enterprise Seat Expansion',
                'amount' => 48000,
                'stage' => 'proposal',
                'close_date' => Carbon::now()->addDays(14)->toDateString(),
                'probability' => 80,
                'company_id' => $companies[0]->id,
                'contact_id' => $contacts[0]->id,
                'notes' => 'Contract review ongoing with finance department for 120 additional seats.',
            ],
            [
                'name' => 'Vercel Enterprise Edge Routing Integration',
                'amount' => 125000,
                'stage' => 'meeting',
                'close_date' => Carbon::now()->addDays(30)->toDateString(),
                'probability' => 60,
                'company_id' => $companies[1]->id,
                'contact_id' => $contacts[2]->id,
                'notes' => 'Executive demo scheduled next Tuesday to show latency benchmarks.',
            ],
            [
                'name' => 'Stripe Connect Billing Modernization',
                'amount' => 180000,
                'stage' => 'screening',
                'close_date' => Carbon::now()->addDays(45)->toDateString(),
                'probability' => 40,
                'company_id' => $companies[2]->id,
                'contact_id' => $contacts[4]->id,
                'notes' => 'Initial discovery call went great. Setting up security compliance check.',
            ],
            [
                'name' => 'Supabase Multi-Region Cluster License',
                'amount' => 35000,
                'stage' => 'won',
                'close_date' => Carbon::now()->subDays(5)->toDateString(),
                'probability' => 100,
                'company_id' => $companies[3]->id,
                'contact_id' => $contacts[5]->id,
                'notes' => 'Deal closed! Annual prepaid agreement signed via DocuSign.',
            ],
            [
                'name' => 'Retool Custom Internal Workflows Add-on',
                'amount' => 52000,
                'stage' => 'proposal',
                'close_date' => Carbon::now()->addDays(10)->toDateString(),
                'probability' => 75,
                'company_id' => $companies[4]->id,
                'contact_id' => $contacts[6]->id,
                'notes' => 'Presented revised tiered pricing model to VP of Engineering.',
            ],
            [
                'name' => 'Raycast Pro Team Expansion',
                'amount' => 16500,
                'stage' => 'new',
                'close_date' => Carbon::now()->addDays(25)->toDateString(),
                'probability' => 20,
                'company_id' => $companies[5]->id,
                'contact_id' => $contacts[7]->id,
                'notes' => 'Inbound request for team licenses and custom API extension pack.',
            ],
            [
                'name' => 'Algolia AI Neural Search Pilot',
                'amount' => 64000,
                'stage' => 'meeting',
                'close_date' => Carbon::now()->addDays(18)->toDateString(),
                'probability' => 50,
                'company_id' => $companies[6]->id,
                'contact_id' => $contacts[8]->id,
                'notes' => 'Technical discovery call with solutions architecture team.',
            ],
            [
                'name' => 'Legacy On-Prem Migration Project',
                'amount' => 28000,
                'stage' => 'lost',
                'close_date' => Carbon::now()->subDays(20)->toDateString(),
                'probability' => 0,
                'company_id' => $companies[0]->id,
                'contact_id' => $contacts[1]->id,
                'notes' => 'Client decided to postpone cloud migration to next fiscal quarter.',
            ],
            [
                'name' => 'Global Developer Portal Redesign',
                'amount' => 92000,
                'stage' => 'proposal',
                'close_date' => Carbon::now()->addDays(8)->toDateString(),
                'probability' => 85,
                'company_id' => $companies[1]->id,
                'contact_id' => $contacts[3]->id,
                'notes' => 'Final proposal submitted. Awaiting legal sign-off.',
            ],
        ];

        $opportunities = [];
        foreach ($opportunitiesData as $opp) {
            $opportunities[] = Opportunity::create($opp);
        }

        // 5. Tasks
        $tasksData = [
            [
                'title' => 'Send revised master service agreement to Linear legal',
                'description' => 'Incorporate the clause about data residency in EU Frankfurt region.',
                'due_date' => Carbon::now()->addDays(2)->toDateString(),
                'priority' => 'urgent',
                'status' => 'todo',
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
            ],
            [
                'title' => 'Prepare slide deck for Guillermo Rauch & Vercel team',
                'description' => 'Focus on performance benchmarks, edge cache hit ratio, and API latency.',
                'due_date' => Carbon::now()->addDays(4)->toDateString(),
                'priority' => 'high',
                'status' => 'in_progress',
                'contact_id' => $contacts[2]->id,
                'opportunity_id' => $opportunities[1]->id,
                'company_id' => $companies[1]->id,
            ],
            [
                'title' => 'Schedule security review call with Stripe compliance',
                'description' => 'Send SOC2 Type II report and penetration test executive summary.',
                'due_date' => Carbon::now()->addDays(6)->toDateString(),
                'priority' => 'medium',
                'status' => 'todo',
                'contact_id' => $contacts[4]->id,
                'opportunity_id' => $opportunities[2]->id,
                'company_id' => $companies[2]->id,
            ],
            [
                'title' => 'Conduct onboarding kickoff call with Supabase core team',
                'description' => 'Review API integration steps and invite team admins.',
                'due_date' => Carbon::now()->subDays(1)->toDateString(),
                'priority' => 'high',
                'status' => 'completed',
                'contact_id' => $contacts[5]->id,
                'opportunity_id' => $opportunities[3]->id,
                'company_id' => $companies[3]->id,
            ],
            [
                'title' => 'Follow up on Retool custom plugin requirements',
                'description' => 'Check if the team needs custom OAuth2 token exchange handler.',
                'due_date' => Carbon::now()->addDays(5)->toDateString(),
                'priority' => 'medium',
                'status' => 'todo',
                'contact_id' => $contacts[6]->id,
                'opportunity_id' => $opportunities[4]->id,
                'company_id' => $companies[4]->id,
            ],
            [
                'title' => 'Send welcome package to Thomas at Raycast',
                'description' => 'Email API documentation and developer portal credentials.',
                'due_date' => Carbon::now()->addDays(1)->toDateString(),
                'priority' => 'low',
                'status' => 'in_progress',
                'contact_id' => $contacts[7]->id,
                'opportunity_id' => $opportunities[5]->id,
                'company_id' => $companies[5]->id,
            ],
        ];

        foreach ($tasksData as $t) {
            Task::create($t);
        }

        // 6. Notes
        $notesData = [
            [
                'title' => 'Linear Q4 Growth Strategy Notes',
                'content' => "Karri indicated they are doubling their engineering headcount in Q1. They want seamless integration with GitHub Actions and automated issue triage.\n\nKey takeaways:\n- High priority on speed and keyboard navigation\n- Zero latency tolerance\n- Needs SSO support (Okta / Google Workspace)",
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
            ],
            [
                'title' => 'Vercel Architecture Discussion',
                'content' => "Discussed edge middleware capabilities. Guillermo highlighted that latency is the single most critical KPI for their next-gen workflow.\n\nAction items: provide custom endpoint benchmarks for Tokyo and Frankfurt regions.",
                'contact_id' => $contacts[2]->id,
                'opportunity_id' => $opportunities[1]->id,
                'company_id' => $companies[1]->id,
            ],
            [
                'title' => 'Initial Discovery - Stripe Payments',
                'content' => 'Patrick and their platform leads are exploring decoupled microservices for specific ledger sync tasks. Next conversation scheduled with Director of Platform Eng.',
                'contact_id' => $contacts[4]->id,
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
                'title' => 'Opportunity moved to Proposal',
                'description' => 'Deal "Linear Enterprise Seat Expansion" moved from Meeting to Proposal stage.',
                'contact_id' => $contacts[0]->id,
                'opportunity_id' => $opportunities[0]->id,
                'company_id' => $companies[0]->id,
                'created_at' => Carbon::now()->subHours(3),
            ],
            [
                'type' => 'call',
                'title' => 'Demo call with Guillermo Rauch',
                'description' => '30-minute Zoom call demoing the new low-latency data sync engine.',
                'contact_id' => $contacts[2]->id,
                'opportunity_id' => $opportunities[1]->id,
                'company_id' => $companies[1]->id,
                'created_at' => Carbon::now()->subHours(8),
            ],
            [
                'type' => 'meeting',
                'title' => 'Contract Negotiation Call',
                'description' => 'Discussed volume discounts and payment terms with Retool procurement.',
                'contact_id' => $contacts[6]->id,
                'opportunity_id' => $opportunities[4]->id,
                'company_id' => $companies[4]->id,
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'type' => 'stage_change',
                'title' => 'Deal Closed Won 🎉',
                'description' => 'Supabase Multi-Region Cluster License marked as Won ($35,000 ARR).',
                'contact_id' => $contacts[5]->id,
                'opportunity_id' => $opportunities[3]->id,
                'company_id' => $companies[3]->id,
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'type' => 'email',
                'title' => 'Sent follow-up email to Thomas Paul Mann',
                'description' => 'Provided developer sandbox access link and Slack connect invitation.',
                'contact_id' => $contacts[7]->id,
                'opportunity_id' => $opportunities[5]->id,
                'company_id' => $companies[5]->id,
                'created_at' => Carbon::now()->subDays(2),
            ],
        ];

        foreach ($activities as $act) {
            ActivityLog::create($act);
        }
    }
}
