import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Power, Search, Trash2, X } from 'lucide-react';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  toggleAdminUserStatus,
  updateAdminUser,
  type AdminUser,
} from '../../lib/adminApi';

const emptyForm = { fullName: '', email: '', password: '', role: 'Customer' };

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers();
      setUsers(response.items);
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) =>
      !term ||
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term),
    );
  }, [search, users]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({ fullName: user.fullName, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateAdminUser(editing.id, { fullName: form.fullName, role: form.role });
      } else {
        await createAdminUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        });
      }
      setShowForm(false);
      await loadUsers();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: AdminUser) => {
    try {
      const updated = await toggleAdminUserStatus(user.id);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to change user status.');
    }
  };

  const remove = async (user: AdminUser) => {
    if (!window.confirm(`Disable account ${user.email}?`)) return;
    try {
      await deleteAdminUser(user.id);
      await loadUsers();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to disable user.');
    }
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold">User Management</h2>
          <p className="mt-2 text-sm text-[#64748b]">Manage accounts, roles, verification, and access status.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff9429] px-5 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>

      {notice && <div className="mt-5 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#c2410c]">{notice}</div>}

      <label className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
        <Search className="h-5 w-5 text-[#94a3b8]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or role" className="min-w-0 flex-1 outline-none" />
      </label>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-[#64748b]">
              <tr>
                <th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Email</th><th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th><th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#f1f5f9]">
                  <td className="px-5 py-4 font-bold">{user.fullName}</td>
                  <td className="px-5 py-4">{user.role}</td>
                  <td className="px-5 py-4">
                    <div>{user.email}</div>
                    <span className={user.isEmailVerified ? 'text-xs text-green-600' : 'text-xs text-amber-600'}>
                      {user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#64748b]">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(user)} className="rounded-lg p-2 hover:bg-blue-50" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => void toggleStatus(user)} className="rounded-lg p-2 hover:bg-orange-50" title="Toggle status"><Power className="h-4 w-4" /></button>
                      <button onClick={() => void remove(user)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Disable"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#e2e8f0] px-5 py-4 text-sm text-[#64748b]">
          {loading ? 'Loading users...' : `${filteredUsers.length} of ${users.length} users`}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4">
          <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold">{editing ? 'Edit user' : 'Create user'}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="w-full rounded-xl border px-4 py-3" />
              <input required disabled={Boolean(editing)} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-xl border px-4 py-3 disabled:bg-slate-50" />
              {!editing && <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Strong password" className="w-full rounded-xl border px-4 py-3" />}
              {editing && (
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border px-4 py-3">
                  <option>Customer</option><option>Admin</option>
                </select>
              )}
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-[#ff9429] px-5 py-3 font-bold text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Save user'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
