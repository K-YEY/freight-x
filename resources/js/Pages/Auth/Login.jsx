import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { 
    Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, 
    Languages, Moon, Sun, Crown, Ship, Wallet, ShieldCheck, TrendingUp
} from 'lucide-react';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isRTL, setIsRTL] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [activeRoleIndex, setActiveRoleIndex] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'alex@twenty.local',
        password: 'password',
        remember: true,
    });

    useEffect(() => {
        // Match existing theme preference if set
        const savedTheme = localStorage.getItem('twenty_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        const savedLocale = localStorage.getItem('app_locale') || 'ar';
        setIsRTL(savedLocale === 'ar');
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('twenty_theme', next ? 'dark' : 'light');
        if (next) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleLocale = () => {
        const nextRTL = !isRTL;
        setIsRTL(nextRTL);
        localStorage.setItem('app_locale', nextRTL ? 'ar' : 'en');
    };

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const quickRoles = [
        {
            nameAr: 'المدير العام',
            nameEn: 'Admin',
            email: 'alex@twenty.local',
            password: 'password',
            icon: Crown,
            color: 'text-amber-500 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
        },
        {
            nameAr: 'العمليات',
            nameEn: 'Operations',
            email: 'operations@freight.local',
            password: 'password',
            icon: Ship,
            color: 'text-cyan-500 dark:text-cyan-400',
            bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        },
        {
            nameAr: 'المحاسبة',
            nameEn: 'Finance',
            email: 'accountant@freight.local',
            password: 'password',
            icon: Wallet,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
    ];

    const extraRoles = [
        {
            nameAr: 'التخليص الجمركي',
            nameEn: 'Customs',
            email: 'customs@freight.local',
            password: 'password',
            icon: ShieldCheck,
        },
        {
            nameAr: 'مبيعات الشحن',
            nameEn: 'Sales',
            email: 'sales@freight.local',
            password: 'password',
            icon: TrendingUp,
        },
    ];

    const handleSelectRole = (role, index) => {
        setActiveRoleIndex(index);
        setData({
            ...data,
            email: role.email,
            password: role.password,
        });
    };

    return (
        <div 
            dir={isRTL ? 'rtl' : 'ltr'} 
            className="relative min-h-screen w-screen flex flex-col justify-between overflow-hidden font-sans select-none transition-colors duration-500 bg-[#eaf4fb] dark:bg-[#0c0d10]"
        >
            <Head title={isRTL ? "تسجيل الدخول | Freight-X" : "Sign In | Freight-X"} />

            {/* Atmosphere Backdrop matching reference image & theme */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Light mode sky & cloud soft gradient / Dark mode deep mesh */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#d8ecf8] via-[#e8f3fa] to-[#f4f9fd] dark:from-[#0f1117] dark:via-[#0c0d10] dark:to-[#08080a] opacity-90 transition-opacity duration-500" />

                {/* Soft ambient blurs */}
                <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-sky-200/60 via-blue-100/40 to-transparent dark:from-blue-900/15 dark:via-indigo-950/10 dark:to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-white/70 dark:from-black/40 to-transparent backdrop-blur-[2px]" />

                {/* Concentric Orbital Rings Radiating Behind Center Card (Identical to image) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[440px] h-[440px] rounded-full border border-sky-400/25 dark:border-white/[0.04] absolute transition-all duration-700" />
                    <div className="w-[680px] h-[680px] rounded-full border border-sky-400/20 dark:border-white/[0.03] absolute transition-all duration-700" />
                    <div className="w-[940px] h-[940px] rounded-full border border-sky-400/15 dark:border-white/[0.02] absolute transition-all duration-700" />
                    <div className="w-[1220px] h-[1220px] rounded-full border border-sky-300/15 dark:border-white/[0.015] absolute transition-all duration-700" />
                </div>
            </div>

            {/* Header with Logo and Action Switches */}
            <header className="relative w-full px-6 sm:px-10 py-5 flex items-center justify-between z-20">
                {/* Top-Left Brand Logo (similar to 'Ebolt' in reference) */}
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold shadow-xs">
                        20
                    </div>
                    <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
                        Freight-X
                    </span>
                </div>

                {/* Controls: Language and Theme Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleLocale}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60 border border-neutral-300/60 dark:border-neutral-700/60 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm"
                        title={isRTL ? "Switch to English" : "التحويل إلى العربية"}
                    >
                        <Languages className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px]">{isRTL ? 'EN' : 'عربي'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60 border border-neutral-300/60 dark:border-neutral-700/60 transition-all cursor-pointer backdrop-blur-sm"
                        title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
                    >
                        {isDark ? (
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                            <Moon className="w-3.5 h-3.5 text-neutral-600" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Central Floating Card (Faithful to Reference Image) */}
            <main className="relative flex-1 flex items-center justify-center px-4 py-8 z-20">
                <div className="w-full max-w-[420px]">
                    
                    {/* The Card Container */}
                    <div className="relative rounded-[32px] p-8 sm:p-9 bg-white/80 dark:bg-[#15161b]/80 border border-white/70 dark:border-white/[0.08] shadow-[0_24px_50px_-12px_rgba(14,165,233,0.14),0_12px_24px_-6px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300">
                        
                        {/* Top Icon Badge: Exactly like '→]' in reference */}
                        <div className="flex justify-center -mt-1 mb-5">
                            <div className="w-13 h-13 rounded-2xl bg-white dark:bg-[#1e1f26] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-neutral-100 dark:border-white/[0.08] flex items-center justify-center text-neutral-800 dark:text-neutral-100 transition-transform duration-300 hover:scale-105">
                                <svg 
                                    className="w-5 h-5 rtl:rotate-180" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2.2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                            </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="text-center mb-6">
                            <h1 className="text-xl sm:text-[22px] font-bold text-neutral-900 dark:text-white tracking-tight">
                                {isRTL ? 'تسجيل الدخول بالبريد' : 'Sign in with email'}
                            </h1>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed max-w-[310px] mx-auto">
                                {isRTL 
                                    ? 'منصة الشحن واللوجستيات لربط شحناتك وعملياتك وحساباتك بدقة.' 
                                    : 'Make a new doc to bring your shipments, data, and teams together.'}
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Validation Error */}
                        {errors.email && (
                            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.email}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-3.5">
                            {/* Email Field with Pill Style */}
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder={isRTL ? "البريد الإلكتروني" : "Email"}
                                    className="w-full ps-10 pe-4 py-2.5 text-xs bg-[#f1f3f6] dark:bg-[#1f2026] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-xl border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-[#18191f] focus:outline-none transition-all shadow-2xs"
                                />
                            </div>

                            {/* Password Field with Pill Style & Eye Toggle */}
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={isRTL ? "كلمة المرور" : "Password"}
                                    className="w-full ps-10 pe-10 py-2.5 text-xs bg-[#f1f3f6] dark:bg-[#1f2026] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-xl border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-[#18191f] focus:outline-none transition-all shadow-2xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                                    title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Remember Me & Forgot Password Row */}
                            <div className="flex items-center justify-between text-xs pt-0.5">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 focus:ring-0 cursor-pointer"
                                    />
                                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        {isRTL ? 'تذكرني' : 'Remember me'}
                                    </span>
                                </label>

                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                                    {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                                </span>
                            </div>

                            {/* Main CTA Button: Sleek Black Pill like 'Get Started' in reference */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#1e2025] hover:bg-[#111215] text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-sm transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                <span>
                                    {processing 
                                        ? (isRTL ? 'جاري التحقق والدخول...' : 'Signing in...') 
                                        : (isRTL ? 'ابدأ الآن / تسجيل الدخول' : 'Get Started')}
                                </span>
                            </button>
                        </form>

                        {/* Dotted Divider: 'Or sign in with' exactly like reference image */}
                        <div className="relative my-6 flex items-center justify-center">
                            <div className="w-full border-t border-dashed border-neutral-300 dark:border-neutral-700/80" />
                            <span className="absolute px-3 bg-white/95 dark:bg-[#15161b] text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                                {isRTL ? 'أو الدخول السريع بالأدوار' : 'Or sign in with'}
                            </span>
                        </div>

                        {/* 3 Quick Role Buttons: Identical shape/layout to Google/Facebook/Apple in reference */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {quickRoles.map((role, idx) => {
                                const Icon = role.icon;
                                const isSelected = activeRoleIndex === idx;
                                return (
                                    <button
                                        key={role.email}
                                        type="button"
                                        onClick={() => handleSelectRole(role, idx)}
                                        className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-center ${
                                            isSelected 
                                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs' 
                                                : 'bg-white/90 dark:bg-[#1c1d24] hover:bg-[#f6f8fb] dark:hover:bg-[#23242c] border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700'
                                        }`}
                                        title={`${role.nameAr} (${role.email})`}
                                    >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSelected ? 'text-current' : role.color}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-semibold tracking-tight truncate w-full px-0.5">
                                            {isRTL ? role.nameAr : role.nameEn}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Extra roles quick chips (Customs & Sales) */}
                        <div className="flex items-center justify-center gap-2 mt-3">
                            {extraRoles.map((role, idx) => {
                                const Icon = role.icon;
                                return (
                                    <button
                                        key={role.email}
                                        type="button"
                                        onClick={() => handleSelectRole(role, idx + 3)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-[#202129] border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors cursor-pointer"
                                    >
                                        <Icon className="w-3 h-3 text-neutral-400" />
                                        <span>{isRTL ? role.nameAr : role.nameEn}</span>
                                    </button>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </main>

            {/* Subtle Footer */}
            <footer className="relative w-full py-4 px-6 text-center text-[11px] text-neutral-400 dark:text-neutral-500 z-20">
                <span>Twenty Freight-X &bull; {new Date().getFullYear()}</span>
            </footer>
        </div>
    );
}

