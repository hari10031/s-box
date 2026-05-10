import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSalesAnalytics } from '../api/analytics';
import { GlassCard } from '../components/ui/GlassCard';
import { TrendingUp, Award, Users, Activity } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 24, filter: 'blur(8px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } };

const BarChart = ({ items, maxVal, gradient, labelKey = '_id' }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-3">
        <span className="w-24 text-xs text-white/50 truncate shrink-0" title={item[labelKey]}>
          {item[labelKey]?.slice?.(0, 16) || item.name?.slice(0, 16)}
        </span>
        <div className="flex-1 h-3 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(4, (item.revenue / maxVal) * 100)}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`h-full rounded-full ${gradient}`}
          />
        </div>
        <span className="w-24 text-right text-xs font-semibold text-white/70 tabular-nums">₹{item.revenue?.toLocaleString()}</span>
      </div>
    ))}
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => { setLoading(true); getSalesAnalytics({ period }).then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, [period]);

  if (loading) return (
    <div className="flex items-center justify-center h-80"><div className="w-8 h-8 border-3 border-[rgba(255,255,255,0.1)] border-t-[#8b5cf6] rounded-full animate-spin" /></div>
  );

  const maxRev = Math.max(1, ...((data?.salesOverTime || []).map((d) => d.revenue)));
  const maxTop = Math.max(1, ...((data?.topSarees || []).map((s) => s.revenue)));
  const maxEmp = Math.max(1, ...((data?.revenueByEmployee || []).map((e) => e.revenue)));

  return (
    <motion.div className="pb-10" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold gradient-text">Analytics</h1><p className="text-sm text-white/50 mt-1">Performance insights & reports</p></div>
        <div className="flex gap-1.5 p-1.5 glass-card">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${period === p ? 'gradient-cta text-white' : 'text-white/50 hover:text-white bg-transparent'}`}>{p}</button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={itemVariants}>
          <GlassCard shimmer className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl gradient-cta flex items-center justify-center text-white shadow-lg">
                <TrendingUp size={18} />
              </div>
              <div><p className="text-sm font-bold text-white">Revenue Timeline</p><p className="text-xs text-white/40">Sales over time</p></div>
            </div>
            {data?.salesOverTime?.length > 0 ? <BarChart items={data.salesOverTime.slice(-10)} maxVal={maxRev} gradient="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8]" /> : (
              <div className="flex flex-col items-center justify-center py-10 text-white/30"><Activity size={32} className="mb-2" /><p className="text-sm">No data for this period</p></div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard shimmer className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center text-[#f59e0b] shadow-lg">
                <Award size={18} />
              </div>
              <div><p className="text-sm font-bold text-white">Top Sellers</p><p className="text-xs text-white/40">Best performing sarees</p></div>
            </div>
            {data?.topSarees?.length > 0 ? <BarChart items={data.topSarees} maxVal={maxTop} gradient="bg-gradient-to-r from-[#f59e0b] to-[#ec4899]" labelKey="name" /> : (
              <div className="flex flex-col items-center justify-center py-10 text-white/30"><Award size={32} className="mb-2" /><p className="text-sm">No data</p></div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard shimmer className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] flex items-center justify-center text-[#34d399] shadow-lg">
              <Users size={18} />
            </div>
            <div><p className="text-sm font-bold text-white">Team Performance</p><p className="text-xs text-white/40">Revenue by employee</p></div>
          </div>
          {data?.revenueByEmployee?.length > 0 ? <BarChart items={data.revenueByEmployee} maxVal={maxEmp} gradient="bg-gradient-to-r from-[#34d399] to-[#38bdf8]" labelKey="name" /> : (
            <div className="flex flex-col items-center justify-center py-10 text-white/30"><Users size={32} className="mb-2" /><p className="text-sm">No data</p></div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}