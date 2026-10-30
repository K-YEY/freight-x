import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutDashboard, Users, Building2, Briefcase, CheckSquare, 
    Search, Moon, Sun, Plus, ChevronRight, ChevronDown, User, Languages, Ship, Layers, Receipt, FileText,
    LogOut, Wallet, Shield, Banknote
} from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';
import CommandPalette from './CommandPalette';
import RecordDrawer from './RecordDrawer';
import CreatePersonModal from './Modals/CreatePersonModal';
import CreateCompanyModal from './Modals/CreateCompanyModal';
import CreateDealModal from './Modals/CreateDealModal';
import CreateTaskModal from './Modals/CreateTaskModal';
import CreateShipmentModal from './Modals/CreateShipmentModal';
import CurrencySwitcher from './CurrencySwitcher';

export default function AppLayout({ children, title, companies = [], contacts = [], opportunities = [], ports = [], carriers = [], clients = [] }) {
    const { url, props } = usePage();
    const { t, locale, toggleLocale, isRTL } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    // Dedicated Modals State
    const [createShipmentOpen, setCreateShipmentOpen] = useState(false);
    const [createPersonOpen, setCreatePersonOpen] = useState(false);
    const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
    const [createDealOpen, setCreateDealOpen] = useState(false);
    const [createTaskOpen, setCreateTaskOpen] = useState(false);

    // New menu popover
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Selected record for side-peek drawer
    const [activeDrawer, setActiveDrawer] = useState({
        isOpen: false,
        type: 'contact',
        record: null,
    });

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('twenty_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const isThemeTransitioning = useRef(false);

    const toggleTheme = (e) => {
        if (isThemeTransitioning.current) return;

        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const nextThemeIsDark = !isCurrentlyDark;

        const applyTheme = () => {
            if (nextThemeIsDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('twenty_theme', 'dark');
                setDarkMode(true);
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('twenty_theme', 'light');
                setDarkMode(false);
            }
        };

        // Fallback for browsers without View Transitions API or if user prefers reduced motion
        if (
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            applyTheme();
            return;
        }

        isThemeTransitioning.current = true;

        // Origin of the expanding circle (click coordinates or center of toggle button)
        const rect = e?.currentTarget?.getBoundingClientRect();
        const x = e?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
        const y = e?.clientY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);

        // Calculate radius to the furthest corner of the viewport
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            applyTheme();
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 550,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });

        transition.finished.finally(() => {
            isThemeTransitioning.current = false;
        });
    };

    // Close create dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setCreateDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global keyboard shortcuts (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const authUser = props?.auth?.user;
    const userRole = authUser?.roles?.[0]?.display_name_ar || authUser?.roles?.[0]?.name || 'مسؤول';

    const navItems = [
        { name: t('dashboard'), href: '/', icon: LayoutDashboard, active: url === '/' || url === '/dashboard' },
        { name: t('quotations'), href: '/quotations', icon: FileText, active: url.startsWith('/quotations') },
        { name: t('shipments'), href: '/shipments', icon: Ship, active: url.startsWith('/shipments') },
        { name: t('billing'), href: '/billing', icon: Receipt, active: url.startsWith('/billing') },
        { name: t('employees'), href: '/employees', icon: Users, active: url.startsWith('/employees') },
        { name: t('employee_accounts'), href: '/employee-accounts', icon: Wallet, active: url.startsWith('/employee-accounts') },
        { name: t('office_expenses'), href: '/office-expenses', icon: Banknote, active: url.startsWith('/office-expenses') },
        { name: t('master_data'), href: '/master-data', icon: Layers, active: url.startsWith('/master-data') },
        { name: t('people'), href: '/contacts', icon: User, active: url.startsWith('/contacts') },
        { name: t('companies'), href: '/companies', icon: Building2, active: url.startsWith('/companies') },
        { name: t('opportunities'), href: '/opportunities', icon: Briefcase, active: url.startsWith('/opportunities') },
        { name: t('tasks'), href: '/tasks', icon: CheckSquare, active: url.startsWith('/tasks') },
    ];

    const handleOpenCreateModal = (type = 'contact') => {
        if (type === 'shipment') setCreateShipmentOpen(true);
        if (type === 'contact' || type === 'person') setCreatePersonOpen(true);
        if (type === 'company') setCreateCompanyOpen(true);
        if (type === 'opportunity' || type === 'deal') setCreateDealOpen(true);
        if (type === 'task') setCreateTaskOpen(true);
    };

    const handleSelectRecordFromSearch = (type, record) => {
        setActiveDrawer({
            isOpen: true,
            type,
            record,
        });
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#0f0f0f] text-neutral-900 dark:text-neutral-100 font-sans">
            
            {/* Sidebar (Twenty CRM Style) */}
            <aside className="w-60 h-full flex flex-col bg-[#f7f7f7] dark:bg-[#141414] border-e border-[#e5e5e5] dark:border-[#222222] select-none shrink-0">
                
                {/* Workspace Header & Action Icons */}
                <div className="px-3.5 py-3 flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#222222]">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xs tracking-tight shadow-xs shrink-0">
                            20
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none truncate">
                                {t('app_name')}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-none truncate">
                                {t('personal_edition')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {/* Language Switcher */}
                        <button
                            onClick={(e) => toggleLocale(e)}
                            className="px-1.5 py-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded-md transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
                        >
                            <Languages className="w-3.5 h-3.5 transition-transform duration-300 hover:rotate-12" />
                            <span className="font-mono">{locale === 'ar' ? 'EN' : 'عربي'}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={(e) => toggleTheme(e)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 rounded-md transition-all cursor-pointer active:scale-95"
                            title={t('toggle_theme')}
                        >
                            {darkMode ? (
                                <Sun className="w-3.5 h-3.5 transition-transform duration-300 hover:rotate-45" />
                            ) : (
                                <Moon className="w-3.5 h-3.5 transition-transform duration-300 hover:-rotate-12" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar / Quick Command Button */}
                <div className="px-3 pt-3 pb-2">
                    <button
                        onClick={() => setCommandPaletteOpen(true)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-white dark:bg-[#1a1a1a] hover:bg-neutral-100 dark:hover:bg-[#202020] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg shadow-2xs transition-all text-start group cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200" />
                            <span>{t('search')}...</span>
                        </span>
                        <kbd className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-mono">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                    <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1.5">
                        {t('objects')}
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    item.active
                                        ? 'bg-neutral-200/70 dark:bg-[#222222] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/40 dark:hover:bg-[#1c1c1c]'
                                }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`} />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Status & Info */}
                <div className="p-3 border-t border-[#e5e5e5] dark:border-[#222222] space-y-2">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t('mysql_connected')}
                        </span>
                        <span className="text-[10px] bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                            v1.0
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-200/50 dark:bg-neutral-900/60 border border-neutral-300/60 dark:border-neutral-800 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                                {authUser?.name ? authUser.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AR'}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                    {authUser?.name || 'Alex Rivera'}
                                </span>
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold truncate">
                                    {userRole}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="تسجيل الخروج من النظام"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#111111]">
                
                {/* Topbar with Glassmorphism */}
                <header className="h-12 px-6 flex items-center justify-between border-b border-neutral-200/60 dark:border-white/[0.08] glass-header shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-400">{t('workspace')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 rtl:rotate-180" />
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {title || t('overview')}
                        </span>
                    </div>

                    {/* Header Controls: Live Currency Switcher & New Record */}
                    <div className="flex items-center gap-2.5">
                        <CurrencySwitcher />

                        {/* New Record Split Button */}
                        <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('new_record')}</span>
                            <ChevronDown className="w-3 h-3 opacity-70" />
                        </button>

                        {createDropdownOpen && (
                            <div className="absolute end-0 top-full mt-2 z-50 w-52 glass-popover rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-neutral-200/90 dark:border-neutral-700/70 p-1.5 space-y-0.5 animate-fade-in-scale">
                                <button
                                    onClick={() => { setCreateDropdownOpen(false); setCreateShipmentOpen(true); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer border-b border-neutral-100 dark:border-neutral-800/60 pb-2 mb-1"
                                >
                                    <Ship className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                    <span>{t('new_shipment')}</span>
                                </button>
                                <button
                                    onClick={() => { setCreateDropdownOpen(false); setCreatePersonOpen(true); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>{t('new_person')}</span>
                                </button>
                                <button
                                    onClick={() => { setCreateDropdownOpen(false); setCreateCompanyOpen(true); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    <span>{t('new_company')}</span>
                                </button>
                                <button
                                    onClick={() => { setCreateDropdownOpen(false); setCreateDealOpen(true); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>{t('new_deal')}</span>
                                </button>
                                <button
                                    onClick={() => { setCreateDropdownOpen(false); setCreateTaskOpen(true); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <CheckSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>{t('new_task')}</span>
                                </button>
                                <Link
                                    href="/billing"
                                    onClick={() => setCreateDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer border-t border-neutral-100 dark:border-neutral-800/60 pt-2 mt-1"
                                >
                                    <Receipt className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>{t('new_invoice')}</span>
                                </Link>
                                <Link
                                    href="/employees"
                                    onClick={() => setCreateDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span>{locale === 'ar' ? 'إدارة الموظفين والكوادر' : 'Employees Management'}</span>
                                </Link>
                                <Link
                                    href="/employee-accounts"
                                    onClick={() => setCreateDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <Wallet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>{locale === 'ar' ? 'سند صرف / حسابات موظفين' : 'Employee Accounts & Payroll'}</span>
                                </Link>
                                <Link
                                    href="/office-expenses"
                                    onClick={() => setCreateDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-start transition-colors cursor-pointer"
                                >
                                    <Banknote className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>{locale === 'ar' ? 'تسجيل مصاريف المكتب' : 'Office Expenses'}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>

            {/* Global Command Palette (Ctrl+K) */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                onOpenCreateModal={handleOpenCreateModal}
                onSelectRecord={handleSelectRecordFromSearch}
            />

            {/* Dedicated Creation Modals */}
            <CreateShipmentModal
                isOpen={createShipmentOpen}
                onClose={() => setCreateShipmentOpen(false)}
                clients={clients?.length ? clients : companies}
                carriers={carriers?.length ? carriers : companies}
                ports={ports}
            />

            <CreatePersonModal
                isOpen={createPersonOpen}
                onClose={() => setCreatePersonOpen(false)}
                companies={companies}
            />

            <CreateCompanyModal
                isOpen={createCompanyOpen}
                onClose={() => setCreateCompanyOpen(false)}
            />

            <CreateDealModal
                isOpen={createDealOpen}
                onClose={() => setCreateDealOpen(false)}
                companies={companies}
                contacts={contacts}
            />

            <CreateTaskModal
                isOpen={createTaskOpen}
                onClose={() => setCreateTaskOpen(false)}
                companies={companies}
                contacts={contacts}
                opportunities={opportunities}
            />

            {/* Global Side-Peek Record Drawer */}
            <RecordDrawer
                isOpen={activeDrawer.isOpen}
                onClose={() => setActiveDrawer({ isOpen: false, type: 'contact', record: null })}
                type={activeDrawer.type}
                record={activeDrawer.record}
            />
        </div>
    );
}
