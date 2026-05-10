import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategories, createCategory } from '../api/categories';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassModal } from '../components/ui/GlassModal';
import { Plus, Tags } from 'lucide-react';

const PRICE_TIERS = ['', 'budget', 'mid', 'premium', 'luxury'];
const tierColors = { budget: 'emerald', mid: 'sky', premium: 'amber', luxury: 'violet' };
const tierIcons = { budget: '💰', mid: '💵', premium: '💎', luxury: '👑' };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', fabric: '', occasion: '', region: '', priceTier: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => { setLoading(true); getCategories().then((r) => setCategories(r.data.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setError(''); setCreating(true);
    try { await createCategory(form); setShowModal(false); setForm({ name: '', fabric: '', occasion: '', region: '', priceTier: '' }); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed'); }
    setCreating(false);
  };

  return (
    <motion.div className="pb-10" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Categories</h1>
          <p className="text-sm text-white/50 mt-1">{categories.length} categories configured</p>
        </div>
        <GlassButton onClick={() => setShowModal(true)}><Plus size={16} /> New Category</GlassButton>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-60"><div className="w-8 h-8 border-3 border-[rgba(255,255,255,0.1)] border-t-[#8b5cf6] rounded-full animate-spin" /></div>
      ) : categories.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center mb-4">
            <Tags size={28} className="text-[#8b5cf6]" />
          </div>
          <p className="text-sm font-medium text-white/70">No categories yet</p>
          <p className="text-xs text-white/40 mt-1">Create categories to organize your sarees</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <motion.div key={c._id} variants={itemVariants}>
              <GlassCard shimmer className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-cta flex items-center justify-center text-white text-sm font-bold">
                    {c.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {c.priceTier && (
                    <GlassBadge color={tierColors[c.priceTier]} size="sm">
                      {tierIcons[c.priceTier]} {c.priceTier}
                    </GlassBadge>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{c.name}</h3>
                <div className="mt-3 space-y-1.5">
                  {c.fabric && <p className="text-xs text-white/50"><span className="font-medium text-white/70">Fabric:</span> {c.fabric}</p>}
                  {c.occasion && <p className="text-xs text-white/50"><span className="font-medium text-white/70">Occasion:</span> {c.occasion}</p>}
                  {c.region && <p className="text-xs text-white/50"><span className="font-medium text-white/70">Region:</span> {c.region}</p>}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <GlassModal isOpen={showModal} onClose={() => setShowModal(false)} title="New Category" description="Add a new saree category">
        {error && <div className="mb-4 px-3 py-2.5 rounded-xl bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] text-sm">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="mb-4"><label className="block text-sm font-medium text-white/70 mb-1.5">Name</label><GlassInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Kanjivaram Silk" /></div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Fabric</label><GlassInput value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} placeholder="Silk" /></div>
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Occasion</label><GlassInput value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} placeholder="Wedding" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Region</label><GlassInput value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Tamil Nadu" /></div>
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Price Tier</label>
              <select className="w-full h-11 px-4 glass-input text-sm appearance-none cursor-pointer" value={form.priceTier} onChange={(e) => setForm({ ...form, priceTier: e.target.value })}>
                {PRICE_TIERS.map((t) => <option key={t} value={t} className="bg-[#0f172a]">{t || 'None'}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" disabled={creating} className="flex-1">{creating ? 'Creating...' : 'Create'}</GlassButton>
          </div>
        </form>
      </GlassModal>
    </motion.div>
  );
}