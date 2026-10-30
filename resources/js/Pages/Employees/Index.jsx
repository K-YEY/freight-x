import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Users, UserPlus, DollarSign, Search, Filter, Shield, 
    MoreHorizontal, Edit3, Trash2, FileText, ArrowRightLeft, 
    CheckCircle2, Clock, AlertCircle, Briefcase, Plus, Phone, Mail
} from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import { useTranslation } from '../../Context/LanguageContext';
import CreateEmployeeModal from '../../Components/Modals/CreateEmployeeModal';
import EditEmployeeModal from '../../Components/Modals/EditEmployeeModal';
import AddEmployeeTransactionModal from '../../Components/Modals/AddEmployeeTransactionModal';
import EmployeeStatementModal from '../../Components/Modals/EmployeeStatementModal';

export default function EmployeesIndex({ employees, roles, departments, filters, stats }) {
    const { t, isRTL } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // Modals state
    const [createOpen, setCreateOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [selectedEmployeeForTxn, setSelectedEmployeeForTxn] = useState(null);
    const [statementModalOpen, setStatementModalOpen] = useState(false);
    const [selectedEmployeeForStatement, setSelectedEmployeeForStatement] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/employees', {
            search,
            department: selectedDepartment,
            status: selectedStatus,
        }, { preserveState: true });
    };

    const handleFilterChange = (dept, stat) => {
        setSelectedDepartment(dept);
        setSelectedStatus(stat);
        router.get('/employees', {
            search,
            department: dept,
            status: stat,
        }, { preserveState: true });
    };

    const handleDeleteEmployee = (emp) => {
        if (window.confirm(`هل أنت متأكد من حذف الموظف (${emp.name})؟`)) {
            router.delete(`/employees/${emp.id}`);
        }
    };

    const employeeData = employees.data || [];

    return (
        <AppLayout title="الموظفين وفريق العمل">
            <Head title="الموظفين وفريق العمل | Freight-X" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                
                {/* Page Title & Main Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                دليل الموظفين وفريق العمل
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {stats.total_count} موظف
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            إدارة كوادر الشحن والعمليات، الرواتب الشهرية، وتخصيص صلاحيات وأدوار النظام (Roles).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedEmployeeForTxn(null);
                                setTransactionModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer shadow-2xs"
                        >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            <span>سند صرف / حركة مالية</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-sm shadow-blue-600/30 active:scale-95"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>إضافة موظف جديد</span>
                        </button>
                    </div>
                </div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                            <span>إجمالي الموظفين</span>
                            <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                            {stats.total_count}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            {stats.active_count} موظف نشط حالياً على رأس العمل
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                            <span>إجمالي مسير الرواتب الأساسية</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                            {Number(stats.total_payroll).toLocaleString()} <span className="text-xs font-normal text-neutral-400">EGP / شهر</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            الرواتب الأساسية المعتمدة للموظفين النشطين
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                            <span>الأدوار والصلاحيات (Roles)</span>
                            <Shield className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                            {roles.length} <span className="text-xs font-normal text-neutral-400">أدوار قياسية</span>
                        </div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400">
                            مدير عام، عمليات، محاسبة، تخليص، مبيعات
                        </div>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400">
                            <Search className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالاسم، الكود، الهاتف، المسمى..."
                            className="w-full ps-9 pe-3 py-1.5 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </form>

                    <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
                        {/* Department Filter */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
                            <span>القسم:</span>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => handleFilterChange(e.target.value, selectedStatus)}
                                className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                            >
                                <option value="all">كل الأقسام</option>
                                {departments.map(d => (
                                    <option key={d.value} value={d.value}>
                                        {isRTL ? d.label_ar : d.label_en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
                            <span>الحالة:</span>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleFilterChange(selectedDepartment, e.target.value)}
                                className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                            >
                                <option value="all">الكل</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="on_leave">إجازة</option>
                                <option value="terminated">منتهي</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="border border-neutral-200/90 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#161617] shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1c1c1e] text-neutral-500 dark:text-neutral-400 font-semibold">
                                    <th className="py-3 px-4 text-start">الموظف</th>
                                    <th className="py-3 px-3 text-start">المسمى والقسم</th>
                                    <th className="py-3 px-3 text-start">الاتصال</th>
                                    <th className="py-3 px-3 text-start">الراتب الأساسي</th>
                                    <th className="py-3 px-3 text-center">دور النظام (Role)</th>
                                    <th className="py-3 px-3 text-center">الحالة</th>
                                    <th className="py-3 px-3 text-end">صافي المستحق</th>
                                    <th className="py-3 px-4 text-center w-36">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
                                {employeeData.length > 0 ? (
                                    employeeData.map((emp) => {
                                        const initials = emp.name.split(' ').map(n => n[0]).slice(0, 2).join('');
                                        const role = emp.user?.roles?.[0];
                                        const summary = emp.financial_summary || {};

                                        return (
                                            <tr key={emp.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#1c1c1f] transition-colors">
                                                
                                                {/* Code & Avatar & Name */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-neutral-900 dark:text-white block hover:text-blue-500 transition-colors">
                                                                {emp.name}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-neutral-400">
                                                                {emp.employee_code}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Job & Department */}
                                                <td className="py-3 px-3">
                                                    <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                                                        {emp.job_title}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400">
                                                        {emp.department}
                                                    </span>
                                                </td>

                                                {/* Contact */}
                                                <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                                                    {emp.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                                                            <span>{emp.phone}</span>
                                                        </div>
                                                    )}
                                                    {emp.email && (
                                                        <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                                                            <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                                                            <span className="truncate max-w-[120px]">{emp.email}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Basic Salary */}
                                                <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                                                    {Number(emp.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })} {emp.currency}
                                                </td>

                                                {/* System Role Badge */}
                                                <td className="py-3 px-3 text-center">
                                                    {role ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                                                            <Shield className="w-3 h-3" />
                                                            <span>{role.display_name_ar || role.name}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-neutral-400">
                                                            بدون حساب دخول
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                        emp.status === 'on_leave' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <span>{emp.status === 'active' ? 'نشط' : emp.status === 'on_leave' ? 'إجازة' : 'غير نشط'}</span>
                                                    </span>
                                                </td>

                                                {/* Net Due Balance */}
                                                <td className="py-3 px-3 text-end font-mono font-bold">
                                                    <span className={(summary.net_due || 0) > 0 ? 'text-blue-500 font-extrabold' : 'text-neutral-400'}>
                                                        {Number(summary.net_due || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {emp.currency}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEmployeeForStatement(emp);
                                                                setStatementModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                                            title="كشف حساب الموظف والرواتب"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEmployeeForTxn(emp.id);
                                                                setTransactionModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                                            title="تسجيل سلفة / صرف راتب"
                                                        >
                                                            <DollarSign className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingEmployee(emp)}
                                                            className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                                                            title="تعديل بيانات الموظف"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEmployee(emp)}
                                                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                            title="حذف الموظف"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-neutral-400">
                                            لم يتم العثور على موظفين مطابقين لشروط البحث.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateEmployeeModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                roles={roles}
                departments={departments}
            />

            <EditEmployeeModal
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                employee={editingEmployee}
                roles={roles}
                departments={departments}
            />

            <AddEmployeeTransactionModal
                isOpen={transactionModalOpen}
                onClose={() => {
                    setTransactionModalOpen(false);
                    setSelectedEmployeeForTxn(null);
                }}
                employees={employeeData}
                defaultEmployeeId={selectedEmployeeForTxn}
            />

            <EmployeeStatementModal
                isOpen={statementModalOpen}
                onClose={() => {
                    setStatementModalOpen(false);
                    setSelectedEmployeeForStatement(null);
                }}
                employee={selectedEmployeeForStatement}
                onAddTransaction={(empId) => {
                    setSelectedEmployeeForTxn(empId);
                    setTransactionModalOpen(true);
                }}
            />
        </AppLayout>
    );
}
