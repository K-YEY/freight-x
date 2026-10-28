import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import StatusBadge from '../Components/StatusBadge';
import RecordDrawer from '../Components/RecordDrawer';
import { useTranslation } from '../Context/LanguageContext';
import { 
    DollarSign, Users, Building2, Briefcase, CheckSquare, 
    ArrowUpRight, Clock, Activity, CheckCircle2, Circle, 
    TrendingUp, Calendar
} from 'lucide-react';

export default function Dashboard({ stats, stages, recentActivities, upcomingTasks, topOpportunities }) {
    const { t, locale, isRTL } = useTranslation();
    const [drawerState, setDrawerState] = useState({ isOpen: false, type: 'opportunity', record: null });

    const handleToggleTask = (taskId) => {
        router.patch(`/tasks/${taskId}/toggle`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout title={t('dashboard')}>
            <Head title={`${t('dashboard')} - ${t('app_name')}`} />

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Greeting & Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {t('welcome_back')}
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {t('dashboard_subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/opportunities?view=kanban"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors gap-1.5"
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{t('open_pipeline_board')}</span>
                        </Link>
                    </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                            <span>{t('active_pipeline')}</span>
                            <Briefcase className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            ${stats.totalPipeline.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-neutral-400 flex items-center">
                            {t('open_deals_desc')}
                        </span>
                    </div>

                    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                            <span>{t('won_revenue')}</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                            ${stats.wonRevenue.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 flex items-center">
                            {t('closed_won_desc')}
                        </span>
                    </div>

                    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                            <span>{t('total_people')}</span>
                            <Users className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {stats.contactsCount}
                        </div>
                        <span className="text-[11px] text-neutral-400 flex items-center">
                            {t('across_companies', { count: stats.companiesCount })}
                        </span>
                    </div>

                    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                            <span>{t('open_tasks')}</span>
                            <CheckSquare className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {stats.openTasksCount}
                        </div>
                        <span className="text-[11px] text-neutral-400 flex items-center">
                            {t('requiring_action')}
                        </span>
                    </div>
                </div>

                {/* Pipeline Stage Bar */}
                <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                            {t('pipeline_distribution')}
                        </h3>
                        <Link href="/opportunities" className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1">
                            <span>{t('view_deals')}</span>
                            <ArrowUpRight className={`w-3 h-3 ${isRTL ? 'rotate-[-90deg]' : ''}`} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {stages.map((stage) => {
                            const stageKey = stage.key || stage.label.toLowerCase();
                            return (
                                <div key={stage.label} className="p-3 rounded-lg bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                                    <div className="text-[11px] font-medium text-neutral-500 capitalize">
                                        {t(stageKey) || stage.label}
                                    </div>
                                    <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                        ${Number(stage.amount).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-neutral-400">
                                        {stage.count} {stage.count === 1 ? t('deal') : t('deals')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid 2 Columns: Top Opportunities & Upcoming Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Top Opportunities */}
                    <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-neutral-400" />
                                <span>{t('top_deals')}</span>
                            </h3>
                            <Link href="/opportunities" className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                                {t('see_all')}
                            </Link>
                        </div>

                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                            {topOpportunities.map((opp) => (
                                <div
                                    key={opp.id}
                                    onClick={() => setDrawerState({ isOpen: true, type: 'opportunity', record: opp })}
                                    className="py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#1f1f1f] px-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className="min-w-0 pe-3">
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                            {opp.name}
                                        </div>
                                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                                            {opp.company?.name || t('no_company')} · {opp.contact?.name || t('no_contact')}
                                        </div>
                                    </div>
                                    <div className="text-end shrink-0">
                                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            ${Number(opp.amount).toLocaleString()}
                                        </div>
                                        <div className="mt-0.5">
                                            <StatusBadge type="stage" value={opp.stage} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-neutral-400" />
                                <span>{t('upcoming_tasks')}</span>
                            </h3>
                            <Link href="/tasks" className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                                {t('view_all')}
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {upcomingTasks.map((tk) => (
                                <div
                                    key={tk.id}
                                    className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-[#1f1f1f] flex items-center justify-between transition-colors group"
                                >
                                    <button
                                        onClick={() => handleToggleTask(tk.id)}
                                        className="flex items-center gap-2.5 text-start flex-1 min-w-0 me-3"
                                    >
                                        {tk.status === 'completed' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-700 dark:group-hover:text-neutral-200" />
                                        )}
                                        <span className={`text-xs truncate ${tk.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200 font-medium'}`}>
                                            {tk.title}
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <StatusBadge type="priority" value={tk.priority} />
                                        {tk.due_date && (
                                            <span className="text-[11px] text-neutral-400">
                                                {tk.due_date}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities Timeline */}
                <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] shadow-2xs space-y-4">
                    <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-neutral-400" />
                        <span>{t('activities_timeline')}</span>
                    </h3>

                    <div className="relative ps-6 space-y-5 before:content-[''] before:absolute before:start-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200 dark:before:bg-neutral-800">
                        {recentActivities.map((act) => (
                            <div key={act.id} className="relative">
                                <div className="absolute -start-6 top-1 w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600 ring-4 ring-white dark:ring-[#161616]"></div>
                                <div className="flex items-baseline justify-between mb-0.5">
                                    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                        {act.title}
                                    </h4>
                                    <span className="text-[10px] text-neutral-400">
                                        {new Date(act.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                    </span>
                                </div>
                                {act.description && (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {act.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Side Drawer for Details */}
            <RecordDrawer
                isOpen={drawerState.isOpen}
                onClose={() => setDrawerState({ isOpen: false, type: 'opportunity', record: null })}
                type={drawerState.type}
                record={drawerState.record}
            />
        </AppLayout>
    );
}

