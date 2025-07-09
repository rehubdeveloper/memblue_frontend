import React, { useState } from 'react';
import { useAuth } from '../../context/AppContext';

const statusOptions = [
    'pending',
    'confirmed',
    'en_route',
    'in_progress',
    'completed',
    'cancelled',
];

const priorityOptions = ['low', 'medium', 'high'];

const WorkOrdersForm = () => {
    const { customers, teamMembers, createWorkOrder, user } = useAuth();
    const [form, setForm] = useState({
        customer_id: '',
        job_type: '',
        description: '',
        status: 'pending',
        priority: 'low',
        tags: '',
        scheduled_for: '',
        assigned_to: '',
        progress_current: '',
        progress_total: '',
        amount: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);

    if (!user || (user.role !== 'admin' && user.role !== 'solo')) {
        return <div>You do not have access to Work Orders.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                customer_id: form.customer_id,
                assigned_to: Number(form.assigned_to),
                tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                progress_current: Number(form.progress_current),
                progress_total: Number(form.progress_total),
                amount: Number(form.amount),
            };
            await createWorkOrder(payload);
            setForm({
                customer_id: '',
                job_type: '',
                description: '',
                status: 'pending',
                priority: 'low',
                tags: '',
                scheduled_for: '',
                assigned_to: '',
                progress_current: '',
                progress_total: '',
                amount: '',
                address: '',
            });
        } catch (err) {
            // Error handled by context
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Create Work Order</h2>
            <div className="mb-3">
                <label className="block mb-1">Customer</label>
                <select name="customer_id" value={form.customer_id} onChange={handleChange} required className="w-full border p-2 rounded">
                    <option value="">Select Customer</option>
                    {customers && customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="block mb-1">Job Type</label>
                <input name="job_type" value={form.job_type} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border p-2 rounded">
                    {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="block mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} required className="w-full border p-2 rounded">
                    {priorityOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="block mb-1">Tags (comma separated)</label>
                <input name="tags" value={form.tags} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Scheduled For</label>
                <input type="datetime-local" name="scheduled_for" value={form.scheduled_for} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Assigned To</label>
                <select name="assigned_to" value={form.assigned_to} onChange={handleChange} required className="w-full border p-2 rounded">
                    <option value="">Select Team Member</option>
                    {teamMembers && teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>{tm.first_name} {tm.last_name} ({tm.position})</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="block mb-1">Progress Current</label>
                <input type="number" name="progress_current" value={form.progress_current} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Progress Total</label>
                <input type="number" name="progress_total" value={form.progress_total} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Amount</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full border p-2 rounded" step="0.01" />
            </div>
            <div className="mb-3">
                <label className="block mb-1">Address</label>
                <input name="address" value={form.address} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? 'Creating...' : 'Create Work Order'}
            </button>
        </form>
    );
};

export default WorkOrdersForm; 