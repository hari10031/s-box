import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getEmployees, createEmployee, approveEmployee } from '../api/users';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassModal } from '../components/ui/GlassModal';
import { Plus, Users, Check, X } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', contact: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  const fetchData = () => {
    setLoading(true);
    const p = {};
    if (tab !== 'all') p.status = tab;
    getEmployees(p).then((r) => setEmployees(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) { setError('All fields required'); return; }
    setError(''); setCreating(true);
    try { await createEmployee(form); setShowModal(false); setForm({ name: '', username: '', password: '', contact: '' }); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed'); } setCreating(false);
  };

  const handleApprove = async (id, approve) => { try { await approveEmployee(id, approve); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Failed'); } };

  const statusColors = { active: 'emerald', pending: 'amber', banned: 'red' };
  const filterTabs = ['all', 'active', 'pending', 'banned'];

  return (
    <motion.div className="pb-10" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold gradient-text">Employees</h1><p className="text-sm text-white/50 mt-1">{employees.length} team members</p></div>
        <GlassButton onClick={() => setShowModal(true)}><Plus size={16} /> Add Employee</GlassButton>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-1.5 p-1.5 glass-card w-fit mb-6">
        {filterTabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${tab === t ? 'gradient-cta text-white' : 'text-white/50 hover:text-white bg-transparent'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-60"><div className="w-8 h-8 border-3 border-[rgba(255,255,255,0.1)] border-t-[#8b5cf6] rounded-full animate-spin" /></div>
      ) : employees.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center mb-4"><Users size={28} className="text-[#8b5cf6]" /></div>
          <p className="text-sm font-medium text-white/70">No employees found</p>
          <p className="text-xs text-white/40 mt-1">Add your first team member</p>
        </GlassCard>
      ) : (
        <motion.div variants={itemVariants} className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">{['Employee', 'Username', 'Contact', 'Status', 'Actions'].map((h) => <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/40">{h}</th>)}</tr></thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id} className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl gradient-cta flex items-center justify-center text-white text-sm font-bold">{e.name?.charAt(0)?.toUpperCase()}</div><span className="text-sm font-semibold text-white">{e.name}</span></div></td>
                  <td className="px-5 py-3.5 text-sm text-white/50">@{e.username}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{e.contact || '—'}</td>
                  <td className="px-5 py-3.5"><GlassBadge color={statusColors[e.status] || 'violet'} size="md">{e.status}</GlassBadge></td>
                  <td className="px-5 py-3.5">
                    {e.status === 'pending' && (
                      <div className="flex gap-2">
                        <GlassButton variant="primary" size="sm" onClick={() => handleApprove(e._id, true)} className="bg-[rgba(52,211,153,0.15)] border-[rgba(52,211,153,0.3)] text-[#34d399] hover:bg-[rgba(52,211,153,0.25)]"><Check size={14} /></GlassButton>
                        <GlassButton variant="destructive" size="sm" onClick={() => handleApprove(e._id, false)}><X size={14} /></GlassButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <GlassModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Employee" description="Create a new team member">
        {error && <div className="mb-4 px-3 py-2.5 rounded-xl bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] text-sm">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="mb-4"><label className="block text-sm font-medium text-white/70 mb-1.5">Name</label><GlassInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Employee name" /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-white/70 mb-1.5">Username</label><GlassInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-white/70 mb-1.5">Password</label><GlassInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" /></div>
          <div className="mb-6"><label className="block text-sm font-medium text-white/70 mb-1.5">Contact</label><GlassInput value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone number" /></div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" disabled={creating} className="flex-1">{creating ? 'Creating...' : 'Create'}</GlassButton>
          </div>
        </form>
      </GlassModal>
    </motion.div>
  );
}