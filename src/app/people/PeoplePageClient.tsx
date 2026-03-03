'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createPersonAction, updatePersonAction } from '@/lib/actions/people-actions';
import Modal from '@/components/ui/Modal';

interface Person { id: number; name: string; role: string; active: boolean; }

const ROLES = ['security', 'store', 'production', 'dispatch', 'design', 'management'];

export default function PeoplePageClient({ people }: { people: Person[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const result = await createPersonAction(fd);
    if (result.error) toast.error(result.error);
    else { toast.success('Person added'); setAddOpen(false); }
    setSubmitting(false);
  }

  async function toggleActive(person: Person) {
    const fd = new FormData();
    fd.set('name', person.name);
    fd.set('role', person.role);
    fd.set('active', String(!person.active));
    await updatePersonAction(person.id, fd);
    toast.success(person.active ? `${person.name} deactivated` : `${person.name} activated`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">People</h1>
        <button onClick={() => setAddOpen(true)} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          + Add Person
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={p.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 capitalize">{p.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(p)}
                    className="text-xs text-gray-500 hover:text-accent"
                  >
                    {p.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Person">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select name="role" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select role...</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">{r}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Person'}
            </button>
            <button type="button" onClick={() => setAddOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
