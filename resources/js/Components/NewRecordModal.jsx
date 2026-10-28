import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, User, Building2, Briefcase, CheckSquare } from 'lucide-react';

export default function NewRecordModal({ isOpen, onClose, initialType = 'contact', companies = [], contacts = [] }) {
    if (!isOpen) return null;

    const [recordType, setRecordType] = useState(initialType);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [contactForm, setContactForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        city: '',
        company_id: '',
        status: 'lead',
    });

    const [companyForm, setCompanyForm] = useState({
        name: '',
        domain: '',
        website_url: '',
        industry: '',
        employees_count: '',
        annual_revenue: '',
        city: '',
        country: '',
        description: '',
    });

    const [opportunityForm, setOpportunityForm] = useState({
        name: '',
        amount: '',
        stage: 'new',
        close_date: '',
        probability: 50,
        company_id: '',
        contact_id: '',
        notes: '',
    });

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
        company_id: '',
        contact_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (recordType === 'contact') {
            router.post('/contacts', contactForm, {
                onSuccess: () => { onClose(); setSubmitting(false); },
                onError: () => setSubmitting(false),
            });
        } else if (recordType === 'company') {
            router.post('/companies', companyForm, {
                onSuccess: () => { onClose(); setSubmitting(false); },
                onError: () => setSubmitting(false),
            });
        } else if (recordType === 'opportunity') {
            router.post('/opportunities', opportunityForm, {
                onSuccess: () => { onClose(); setSubmitting(false); },
                onError: () => setSubmitting(false),
            });
        } else if (recordType === 'task') {
            router.post('/tasks', taskForm, {
                onSuccess: () => { onClose(); setSubmitting(false); },
                onError: () => setSubmitting(false),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#181818] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-fade-in-scale">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Create New Record
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Type Selector Tabs */}
                <div className="grid grid-cols-4 p-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 gap-1">
                    <button
                        type="button"
                        onClick={() => setRecordType('contact')}
                        className={`flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                            recordType === 'contact'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        Person
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecordType('opportunity')}
                        className={`flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                            recordType === 'opportunity'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                        Deal
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecordType('company')}
                        className={`flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                            recordType === 'company'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5 mr-1.5" />
                        Company
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecordType('task')}
                        className={`flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                            recordType === 'task'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                        Task
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Contact Form */}
                    {recordType === 'contact' && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={contactForm.first_name}
                                        onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="e.g. Alex"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={contactForm.last_name}
                                        onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="e.g. Rivera"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="alex@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={contactForm.phone}
                                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        value={contactForm.job_title}
                                        onChange={(e) => setContactForm({ ...contactForm, job_title: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="Head of Product"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Company</label>
                                    <select
                                        value={contactForm.company_id}
                                        onChange={(e) => setContactForm({ ...contactForm, company_id: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    >
                                        <option value="">No company assigned</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Status</label>
                                <select
                                    value={contactForm.status}
                                    onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="customer">Customer</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Company Form */}
                    {recordType === 'company' && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={companyForm.name}
                                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Domain</label>
                                    <input
                                        type="text"
                                        value={companyForm.domain}
                                        onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="acme.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Industry</label>
                                    <input
                                        type="text"
                                        value={companyForm.industry}
                                        onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="SaaS & Cloud"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Employees</label>
                                    <input
                                        type="number"
                                        value={companyForm.employees_count}
                                        onChange={(e) => setCompanyForm({ ...companyForm, employees_count: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="120"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Annual Revenue ($)</label>
                                    <input
                                        type="number"
                                        value={companyForm.annual_revenue}
                                        onChange={(e) => setCompanyForm({ ...companyForm, annual_revenue: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="5000000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Description</label>
                                <textarea
                                    value={companyForm.description}
                                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    placeholder="Brief overview of the organization"
                                />
                            </div>
                        </div>
                    )}

                    {/* Opportunity Form */}
                    {recordType === 'opportunity' && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Deal Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={opportunityForm.name}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, name: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    placeholder="e.g. Enterprise License Expansion"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Amount ($) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={opportunityForm.amount}
                                        onChange={(e) => setOpportunityForm({ ...opportunityForm, amount: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                        placeholder="50000"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Stage</label>
                                    <select
                                        value={opportunityForm.stage}
                                        onChange={(e) => setOpportunityForm({ ...opportunityForm, stage: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    >
                                        <option value="new">New</option>
                                        <option value="screening">Screening</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="proposal">Proposal</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Company</label>
                                    <select
                                        value={opportunityForm.company_id}
                                        onChange={(e) => setOpportunityForm({ ...opportunityForm, company_id: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    >
                                        <option value="">No company assigned</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Primary Contact</label>
                                    <select
                                        value={opportunityForm.contact_id}
                                        onChange={(e) => setOpportunityForm({ ...opportunityForm, contact_id: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    >
                                        <option value="">No contact assigned</option>
                                        {contacts.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name || `${c.first_name} ${c.last_name}`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Target Close Date</label>
                                <input
                                    type="date"
                                    value={opportunityForm.close_date}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, close_date: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* Task Form */}
                    {recordType === 'task' && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    placeholder="e.g. Follow up with contract revision"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Priority</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={taskForm.due_date}
                                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Description</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                    placeholder="Additional task notes..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-xs disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : `Create ${recordType}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
