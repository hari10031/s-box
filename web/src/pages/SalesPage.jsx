import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSales, approveSale, rejectSale } from '../api/sales';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassInput } from '../components/ui/GlassInput';
import { Receipt, Check, X } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const fetchData = () => { setLoading(true); const p = {}; if (tab !== 'all') p.status = tab; getSales(p).then((r) => setSales(r.data.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, [tab]);

  const handleApprove = async (id) => { try { await approveSale(id); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Failed'); } };
  const handleReject = async (id) => { try { await rejectSale(id, reason); setRejectId(null); setReason(''); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Failed'); } };

  const statusColors = { pending: 'amber', approved: 'emerald', rejected: 'red' };
  const filterTabs = ['pending', 'approved', 'rejected', 'all'];

  return (
    <motion.div className="pb-10" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Sales</h1>
          <p className="text-sm text-white/50 mt-1">{sales.length} transactions</p>
        </div>
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
      ) : sales.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center mb-4"><Receipt size={28} className="text-[#8b5cf6]" /></div>
          <p className="text-sm font-medium text-white/70">No {tab !== 'all' ? tab : ''} sales</p>
          <p className="text-xs text-white/40 mt-1">Transactions will appear here</p>
        </GlassCard>
      ) : (
        <motion.div variants={itemVariants} className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">{['Saree', 'Employee', 'Customer', 'Amount', 'Date', 'Status', ''].map((h, i) => <th key={i} className="text-left px-5 py-3.5 text-xs font-semibold text-white/40">{h}</th>)}</tr></thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s._id} className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-white">{s.sareeRef?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{s.employeeRef?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{s.customerRef?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[#f59e0b]">₹{s.salePrice?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{new Date(s.saleDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5"><GlassBadge color={statusColors[s.status] || 'violet'} size="md">{s.status}</GlassBadge></td>
                  <td className="px-5 py-3.5">
                    {s.status === 'pending' && rejectId !== s._id && (
                      <div className="flex gap-2">
                        <GlassButton variant="primary" size="sm" onClick={() => handleApprove(s._id)} className="bg-[rgba(52,211,153,0.15)] border-[rgba(52,211,153,0.3)] text-[#34d399] hover:bg-[rgba(52,211,153,0.25)]"><Check size={14} /></GlassButton>
                        <GlassButton variant="destructive" size="sm" onClick={() => setRejectId(s._id)}><X size={14} /></GlassButton>
                      </div>
                    )}
                    {rejectId === s._id && (
                      <div className="flex gap-1.5 items-center">
                        <GlassInput className="h-8 w-32 text-xs" placeholder="Reason..." value={reason} onChange={(e) => setReason(e.target.value)} />
                        <GlassButton variant="destructive" size="sm" onClick={() => handleReject(s._id)}>Reject</GlassButton>
                        <GlassButton variant="ghost" size="sm" onClick={() => { setRejectId(null); setReason(''); }}><X size={14} /></GlassButton>
                      </div>
                    )}
                    {s.status === 'rejected' && s.rejectionReason && <span className="text-[11px] text-[#fca5a5]/70 italic">{s.rejectionReason}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}