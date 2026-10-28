import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, User, Building2, Briefcase, Mail, Phone, MapPin, 
    Calendar, DollarSign, Clock, Plus, CheckCircle2, Circle, 
    FileText, Activity, Trash2, ExternalLink
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useTranslation } from '../Context/LanguageContext';

export default function RecordDrawer({ isOpen, onClose, type, record, onEdit }) {
    const { t, isRTL } = useTranslation();
    if (!isOpen || !record) return null;

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activities' | 'notes' | 'tasks'
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);
    const [submittingTask, setSubmittingTask] = useState(false);

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNoteContent.trim()) return;

        setSubmittingNote(true);
        router.post('/notes', {
            content: newNoteContent,
            contact_id: type === 'contact' ? record.id : null,
            company_id: type === 'company' ? record.id : null,
            opportunity_id: type === 'opportunity' ? record.id : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewNoteContent('');
                setSubmittingNote(false);
            },
            onError: () => setSubmittingNote(false),
        });
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setSubmittingTask(true);
        router.post('/tasks', {
            title: newTaskTitle,
            status: 'todo',
            priority: 'medium',
            contact_id: type === 'contact' ? record.id : null,
            company_id: type === 'company' ? record.id : null,
            opportunity_id: type === 'opportunity' ? record.id : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewTaskTitle('');
                setSubmittingTask(false);
            },
            onError: () => setSubmittingTask(false),
        });
    };

    const handleToggleTask = (taskId) => {
        router.patch(`/tasks/${taskId}/toggle`, {}, { preserveScroll: true });
    };

    const handleDeleteRecord = () => {
        if (!confirm(t('delete_confirm'))) return;

        if (type === 'contact') router.delete(`/contacts/${record.id}`, { onSuccess: () => onClose() });
        if (type === 'company') router.delete(`/companies/${record.id}`, { onSuccess: () => onClose() });
        if (type === 'opportunity') router.delete(`/opportunities/${record.id}`, { onSuccess: () => onClose() });
    };

    const getTitle = () => {
        if (type === 'contact') return record.name || `${record.first_name} ${record.last_name}`;
        if (type === 'company') return record.name;
        if (type === 'opportunity') return record.name;
        return t('details');
    };

    const getIcon = () => {
        if (type === 'contact') return <User className="w-5 h-5 text-neutral-500" />;
        if (type === 'company') return <Building2 className="w-5 h-5 text-neutral-500" />;
        if (type === 'opportunity') return <Briefcase className="w-5 h-5 text-neutral-500" />;
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden glass-modal-backdrop flex justify-end">
            <div className="w-full max-w-xl glass-drawer h-full shadow-[0_0_60px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_rgba(0,0,0,0.85)] border-s border-neutral-200/80 dark:border-neutral-800/80 flex flex-col">
                
                {/* Header with Glassmorphism */}
                <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/80 glass-header flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            {getIcon()}
                        </div>
                        <div className="truncate">
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                {getTitle()}
                            </h2>
                            <span className="text-xs text-neutral-400 capitalize">
                                {t(type) || type} {t('details')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(record)}
                                className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                            >
                                {t('edit')}
                            </button>
                        )}
                        <button
                            onClick={handleDeleteRecord}
                            className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                            title={t('delete')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs with Glassmorphism */}
                <div className="flex items-center px-6 border-b border-neutral-200/70 dark:border-neutral-800/80 glass-header gap-6 text-xs font-medium sticky top-[69px] z-10">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'overview'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('overview')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'activities'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{t('activities')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'notes'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('notes')} ({record.notes?.length || 0})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'tasks'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('tasks')} ({record.tasks?.length || 0})</span>
                    </button>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Tab 1: Overview */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Contact Fields */}
                            {type === 'contact' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('status')}</span>
                                        <StatusBadge type="status" value={record.status} />
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('email')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.email || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('phone')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.phone || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('job_title')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                            {record.job_title || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('company_name')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.company?.name || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('city')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.city || '—'}
                                        </span>
                                    </div>
                                    {record.tags && record.tags.length > 0 && (
                                        <div className="pt-2">
                                            <span className="text-xs text-neutral-400 block mb-2">Tags</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {record.tags.map((tag, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Company Fields */}
                            {type === 'company' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('domain')}</span>
                                        <a href={record.website_url || `https://${record.domain}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:underline flex items-center gap-1">
                                            {record.domain || '—'}
                                            <ExternalLink className="w-3 h-3 text-neutral-400" />
                                        </a>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('industry')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                            {record.industry || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('employees')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 font-mono">
                                            {record.employees_count ? record.employees_count.toLocaleString() : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('annual_revenue')}</span>
                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                                            {record.annual_revenue ? `$${Number(record.annual_revenue).toLocaleString()}` : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('location')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                            {[record.city, record.country].filter(Boolean).join(', ') || '—'}
                                        </span>
                                    </div>
                                    {record.description && (
                                        <div className="pt-2">
                                            <span className="text-xs text-neutral-400 block mb-1">{t('about')}</span>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                                {record.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Opportunity Fields */}
                            {type === 'opportunity' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('amount')}</span>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center font-mono">
                                            ${Number(record.amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('stage')}</span>
                                        <StatusBadge type="stage" value={record.stage} />
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('close_date')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.close_date || t('set_date')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('company_name')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.company?.name || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('people')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.contact?.name || '—'}
                                        </span>
                                    </div>
                                    {record.notes && (
                                        <div className="pt-2">
                                            <span className="text-xs text-neutral-400 block mb-1">{t('notes')}</span>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                                {record.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Activities / Timeline */}
                    {activeTab === 'activities' && (
                        <div className="space-y-4">
                            {(!record.activities || record.activities.length === 0) ? (
                                <div className="py-8 text-center text-xs text-neutral-400">
                                    {t('no_records_match')}
                                </div>
                            ) : (
                                <div className="relative ps-6 space-y-6 before:content-[''] before:absolute before:start-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200 dark:before:bg-neutral-800">
                                    {record.activities.map((act) => (
                                        <div key={act.id} className="relative">
                                            <div className="absolute -start-6 top-1 w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600 ring-4 ring-white dark:ring-[#161616]"></div>
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                                    {act.title}
                                                </h4>
                                                <span className="text-[10px] text-neutral-400">
                                                    {new Date(act.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {act.description && (
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                    {act.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Notes */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Add Note Form */}
                            <form onSubmit={handleAddNote} className="space-y-2">
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    placeholder={t('write_note_placeholder')}
                                    rows={3}
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submittingNote || !newNoteContent.trim()}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {t('add_note')}
                                    </button>
                                </div>
                            </form>

                            {/* Existing Notes */}
                            <div className="space-y-3 pt-2">
                                {record.notes && record.notes.length > 0 ? (
                                    record.notes.map((note) => (
                                        <div key={note.id} className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5">
                                            {note.title && (
                                                <h5 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                                    {note.title}
                                                </h5>
                                            )}
                                            <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                                                {note.content}
                                            </p>
                                            <span className="text-[10px] text-neutral-400 block pt-1">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-xs text-neutral-400">
                                        {t('no_records_match')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Tasks */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            {/* Add Task Form */}
                            <form onSubmit={handleAddTask} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder={t('add_task_placeholder')}
                                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingTask || !newTaskTitle.trim()}
                                    className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{t('create')}</span>
                                </button>
                            </form>

                            {/* Task List */}
                            <div className="space-y-1.5 pt-2">
                                {record.tasks && record.tasks.length > 0 ? (
                                    record.tasks.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-[#1f1f1f] group"
                                        >
                                            <button
                                                onClick={() => handleToggleTask(t.id)}
                                                className="flex items-center gap-2.5 text-start flex-1 cursor-pointer"
                                            >
                                                {t.status === 'completed' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                                                )}
                                                <span className={`text-xs ${t.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200 font-medium'}`}>
                                                    {t.title}
                                                </span>
                                            </button>
                                            {t.due_date && (
                                                <span className="text-[11px] text-neutral-400 shrink-0">
                                                    {t.due_date}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-xs text-neutral-400">
                                        {t('no_records_match')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
