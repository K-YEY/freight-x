import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import EditableCell from '../../Components/EditableCell';
import InlineStatusBadge from '../../Components/InlineStatusBadge';
import FilterBar from '../../Components/FilterBar';
import BulkActionBar from '../../Components/BulkActionBar';
import CreateTaskModal from '../../Components/Modals/CreateTaskModal';
import { useTranslation } from '../../Context/LanguageContext';
import { 
    Plus, CheckCircle2, Circle, Calendar, 
    Building2, User, Briefcase, Trash2
} from 'lucide-react';

export default function TasksIndex({ tasks, companies, contacts, opportunities, filters }) {
    const { t, isRTL } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || '',
        priority: filters.priority || '',
    });
    const [selectedIds, setSelectedIds] = useState([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleFilterChange = (key, value) => {
        const nextFilters = { ...activeFilters, [key]: value };
        setActiveFilters(nextFilters);
        router.get('/tasks', { 
            search, 
            status: nextFilters.status, 
            priority: nextFilters.priority 
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveFilters({ status: '', priority: '' });
        router.get('/tasks', { search }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/tasks', { 
            search: val, 
            status: activeFilters.status, 
            priority: activeFilters.priority 
        }, { preserveState: true, replace: true });
    };

    // Toggle single task status
    const handleToggleTask = (taskId) => {
        router.patch(`/tasks/${taskId}/toggle`, {}, { preserveScroll: true });
    };

    // Inline edit handler
    const handleSaveCell = (taskId, field, newValue) => {
        return new Promise((resolve, reject) => {
            router.patch(`/tasks/${taskId}`, { [field]: newValue }, {
                preserveScroll: true,
                onSuccess: () => resolve(),
                onError: (errors) => reject(errors),
            });
        });
    };

    // Selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(tasks.map((t) => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (e, id) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} tasks?`)) return;

        selectedIds.forEach((id) => {
            router.delete(`/tasks/${id}`, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    const handleBulkChangeStatus = (newStatus) => {
        selectedIds.forEach((id) => {
            router.patch(`/tasks/${id}`, { status: newStatus }, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    // Export to CSV
    const handleExportCsv = () => {
        const headers = [t('task_title'), t('status'), t('priority'), t('due_date'), t('company_name'), t('people')];
        const rows = tasks.map((tk) => [
            tk.title,
            t(tk.status),
            t(tk.priority),
            tk.due_date || '',
            tk.company?.name || '',
            tk.contact?.name || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `twenty_crm_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterOptions = [
        {
            key: 'status',
            label: t('status'),
            options: [
                { value: 'todo', label: t('todo') },
                { value: 'in_progress', label: t('in_progress') },
                { value: 'completed', label: t('completed') },
            ],
        },
        {
            key: 'priority',
            label: t('priority'),
            options: [
                { value: 'low', label: t('low') },
                { value: 'medium', label: t('medium') },
                { value: 'high', label: t('high') },
                { value: 'urgent', label: t('urgent') },
            ],
        },
    ];

    return (
        <AppLayout title={t('tasks')} companies={companies} contacts={contacts} opportunities={opportunities}>
            <Head title={`${t('tasks')} - ${t('app_name')}`} />

            <div className="flex flex-col h-full">
                
                {/* Advanced FilterBar */}
                <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-white/[0.08] glass-header pe-6 sticky top-0 z-20">
                    <div className="flex-1">
                        <FilterBar
                            search={search}
                            onSearchChange={handleSearchChange}
                            filterOptions={filterOptions}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            totalCount={tasks.length}
                            unit={t('tasks')}
                            onExportCsv={handleExportCsv}
                        />
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs shrink-0 gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('new_task')}</span>
                    </button>
                </div>

                {/* Tasks Table with Inline Editing */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#111111]">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200/80 dark:border-white/[0.08] glass-table-header text-[11px] font-semibold text-neutral-500 uppercase tracking-wider sticky top-0 z-10 select-none">
                                <th className="py-2 px-3 w-10 text-center border-e border-neutral-200/50 dark:border-neutral-800/50">
                                    <input
                                        type="checkbox"
                                        checked={tasks.length > 0 && selectedIds.length === tasks.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
                                    />
                                </th>
                                <th className="py-2.5 px-4 w-12 text-center border-e border-neutral-200/50 dark:border-neutral-800/50">{t('done')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('task_title')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('priority')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('status')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('due_date')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('company_name')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('people')}</th>
                                <th className="py-2 px-2 w-8 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs text-neutral-800 dark:text-neutral-200">
                            {tasks.map((task) => {
                                const isSelected = selectedIds.includes(task.id);
                                const isCompleted = task.status === 'completed';

                                return (
                                    <tr
                                        key={task.id}
                                        className={`transition-colors group ${
                                            isSelected 
                                                ? 'bg-blue-50/60 dark:bg-[#14233a]' 
                                                : 'hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]'
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <td className="py-2.5 px-3 text-center border-e border-neutral-100 dark:border-neutral-800/50">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleToggleSelect(e, task.id)}
                                                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
                                            />
                                        </td>

                                        {/* Toggle Complete Checkbox */}
                                        <td className="py-2.5 px-4 text-center border-e border-neutral-100 dark:border-neutral-800/50">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleTask(task.id)}
                                                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                                                title={isCompleted ? t('completed') : t('todo')}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <Circle className="w-4 h-4 group-hover:text-neutral-600" />
                                                )}
                                            </button>
                                        </td>

                                        {/* Task Title (Inline Editable) */}
                                        <td className="py-2.5 px-4 font-medium border-e border-neutral-100 dark:border-neutral-800/50">
                                            <EditableCell
                                                value={task.title}
                                                onSave={(val) => handleSaveCell(task.id, 'title', val)}
                                                className={`font-semibold ${isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}
                                            />
                                        </td>

                                        {/* Priority (Inline Switcher) */}
                                        <td className="py-2.5 px-4 border-e border-neutral-100 dark:border-neutral-800/50">
                                            <InlineStatusBadge
                                                value={task.priority}
                                                options={['low', 'medium', 'high', 'urgent']}
                                                onSelect={(val) => handleSaveCell(task.id, 'priority', val)}
                                                type="priority"
                                            />
                                        </td>

                                        {/* Status (Inline Switcher) */}
                                        <td className="py-2.5 px-4 border-e border-neutral-100 dark:border-neutral-800/50">
                                            <InlineStatusBadge
                                                value={task.status}
                                                options={['todo', 'in_progress', 'completed']}
                                                onSelect={(val) => handleSaveCell(task.id, 'status', val)}
                                                type="status"
                                            />
                                        </td>

                                        {/* Due Date (Inline Editable) */}
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 border-e border-neutral-100 dark:border-neutral-800/50">
                                            <EditableCell
                                                type="date"
                                                value={task.due_date}
                                                onSave={(val) => handleSaveCell(task.id, 'due_date', val)}
                                                placeholder={t('set_date')}
                                            />
                                        </td>

                                        {/* Company */}
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 border-e border-neutral-100 dark:border-neutral-800/50">
                                            {task.company?.name || <span className="text-neutral-400 italic text-[11px]">—</span>}
                                        </td>

                                        {/* Person */}
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 border-e border-neutral-100 dark:border-neutral-800/50">
                                            {task.contact?.name || <span className="text-neutral-400 italic text-[11px]">—</span>}
                                        </td>

                                        {/* Delete */}
                                        <td className="py-2 px-2 text-center">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete task?')) router.delete(`/tasks/${task.id}`);
                                                }}
                                                className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-xs text-neutral-400">
                                        {t('no_records_match')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Floating Bulk Actions Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onBulkDelete={handleBulkDelete}
                statusOptions={[
                    { value: 'todo', label: t('todo') },
                    { value: 'in_progress', label: t('in_progress') },
                    { value: 'completed', label: t('completed') },
                ]}
                onBulkChangeStatus={handleBulkChangeStatus}
            />

            {/* Dedicated Task Creation Modal */}
            <CreateTaskModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                companies={companies}
                contacts={contacts}
                opportunities={opportunities}
            />
        </AppLayout>
    );
}
