import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboard } from '../api/analytics';
import { useAuth } from '../store/authContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import {
  Package,
  CheckCircle,
  ShoppingCart,
  Receipt,
  Clock,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="w-8 h-8 border-3 border-[rgba(255,255,255,0.1)] border-t-[#8b5cf6] rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Sarees', value: data?.totalSarees || 0, icon: Package, color: 'violet' },
    { label: 'Available', value: data?.availableSarees || 0, icon: CheckCircle, color: 'emerald' },
    { label: 'Sold', value: data?.soldSarees || 0, icon: ShoppingCart, color: 'amber' },
    { label: 'Total Sales', value: data?.totalSales || 0, icon: Receipt, color: 'sky' },
    { label: 'Pending', value: data?.pendingSales || 0, icon: Clock, color: 'amber' },
    { label: 'Employees', value: data?.totalEmployees || 0, icon: Users, color: 'violet' },
  ];

  return (
    <motion.div
      className="pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
          <p className="text-sm text-white/50 mt-1">Welcome back, {user?.name}</p>
        </div>
        <GlassBadge color="violet" size="md">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </GlassBadge>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <GlassCard className="p-8 relative">
          <div className="absolute inset-0 gradient-border opacity-20" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Total Revenue</p>
              <p className="text-4xl font-bold gradient-text mt-2">
                ₹{(data?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-white/50 mt-1">From {data?.approvedSales || 0} approved sales</p>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
              <DollarSign size={32} className="text-[#8b5cf6]" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const colorMap = {
            violet: { bg: 'bg-[rgba(139,92,246,0.15)]', text: 'text-[#8b5cf6]', border: 'border-[rgba(139,92,246,0.3)]' },
            emerald: { bg: 'bg-[rgba(52,211,153,0.15)]', text: 'text-[#34d399]', border: 'border-[rgba(52,211,153,0.3)]' },
            amber: { bg: 'bg-[rgba(251,191,36,0.15)]', text: 'text-[#f59e0b]', border: 'border-[rgba(251,191,36,0.3)]' },
            sky: { bg: 'bg-[rgba(56,189,248,0.15)]', text: 'text-[#38bdf8]', border: 'border-[rgba(56,189,248,0.3)]' },
          };
          const c = colorMap[stat.color];
          return (
            <motion.div key={i} variants={itemVariants}>
              <GlassCard className="p-5" shimmer>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <TrendingUp size={14} className="text-white/20" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}