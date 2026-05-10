import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSarees, deleteSaree, createSaree } from '../api/sarees';
import { getCategories } from '../api/categories';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput, GlassTextarea, GlassSelect } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassModal } from '../components/ui/GlassModal';
import { Plus, Package, Image as ImageIcon, Trash2 } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function SareesPage() {
  const [sarees, setSarees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', discount: '0', tags: '', category: '' });
  const [images, setImages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchSarees = () => {
    setLoading(true);
    const p = { limit: 100 };
    if (filter !== 'all') p.stockStatus = filter;
    getSarees(p).then((r) => setSarees(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSarees(); }, [filter]);
  useEffect(() => { getCategories().then((r) => setCategories(r.data.data)).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    setError(''); setCreating(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('description', form.description);
      fd.append('price', form.price); fd.append('discount', form.discount || '0');
      if (form.category) fd.append('category', form.category);
      if (form.tags) fd.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim())));
      images.forEach((f) => fd.append('images', f));
      await createSaree(fd);
      setShowModal(false); setForm({ name: '', description: '', price: '', discount: '0', tags: '', category: '' }); setImages([]);
      fetchSarees();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saree permanently?')) return;
    try { await deleteSaree(id); fetchSarees(); } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const filterTabs = ['all', 'available', 'sold'];

  return (
    <motion.div className="pb-10" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Sarees</h1>
          <p className="text-sm text-white/50 mt-1">{sarees.length} items in inventory</p>
        </div>
        <GlassButton onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Saree
        </GlassButton>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-1.5 p-1.5 glass-card w-fit mb-6">
        {filterTabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
              filter === t ? 'gradient-cta text-white' : 'text-white/50 hover:text-white bg-transparent'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-3 border-[rgba(255,255,255,0.1)] border-t-[#8b5cf6] rounded-full animate-spin" />
        </div>
      ) : sarees.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center mb-4">
            <Package size={28} className="text-[#8b5cf6]" />
          </div>
          <p className="text-sm font-medium text-white/70">No sarees found</p>
          <p className="text-xs text-white/40 mt-1">Add your first saree to get started</p>
        </GlassCard>
      ) : (
        <motion.div variants={itemVariants} className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/40"></th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/40">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/40">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/40">Price</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/40">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sarees.map((s) => (
                <tr key={s._id} className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <td className="px-5 py-3.5">
                    {s.coverImage ? (
                      <img src={typeof s.coverImage === 'object' ? s.coverImage.thumbnail || s.coverImage.list : s.coverImage} alt="" className="w-12 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-14 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                        <ImageIcon size={18} className="text-white/20" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    {s.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {s.tags.slice(0, 2).map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-[rgba(255,255,255,0.08)] text-white/50">{t}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{s.category?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-[#f59e0b]">₹{s.price?.toLocaleString()}</span>
                    {s.discount > 0 && <GlassBadge color="emerald" size="sm" className="ml-2">-{s.discount}%</GlassBadge>}
                  </td>
                  <td className="px-5 py-3.5">
                    <GlassBadge color={s.stockStatus === 'available' ? 'emerald' : 'red'} size="md">
                      {s.stockStatus}
                    </GlassBadge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <GlassButton variant="ghost" size="sm" onClick={() => handleDelete(s._id)} className="text-white/40 hover:text-[#ef4444]">
                      <Trash2 size={14} /> Delete
                    </GlassButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <GlassModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Saree" description="Create a new saree listing">
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] text-sm">{error}</div>
        )}
        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Name</label>
            <GlassInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Saree name" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Description</label>
            <GlassTextarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the saree" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
            <GlassSelect value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="" className="bg-[#0f172a]">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id} className="bg-[#0f172a]">{c.name}</option>)}
            </GlassSelect>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Price (₹)</label>
              <GlassInput type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Discount (%)</label>
              <GlassInput type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Tags</label>
            <GlassInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Silk, Bridal, Kanjivaram" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Images</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setImages([...e.target.files])}
              className="text-sm text-white/50 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[rgba(139,92,246,0.2)] file:text-[#c4b5fd] file:cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" disabled={creating} className="flex-1">{creating ? 'Creating...' : 'Create Saree'}</GlassButton>
          </div>
        </form>
      </GlassModal>
    </motion.div>
  );
}