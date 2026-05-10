import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authContext';
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  UserCircle,
  Receipt,
  BarChart3,
  LogOut,
  Star
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sarees', label: 'Sarees', icon: Package },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/customers', label: 'Customers', icon: UserCircle },
  { path: '/sales', label: 'Sales', icon: Receipt },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-[260px] h-screen glass-card rounded-none border-r border-[rgba(255,255,255,0.12)] flex flex-col shrink-0 relative z-20">
      <div className="h-16 flex items-center px-5 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-cta flex items-center justify-center shadow-lg">
            <Star size={16} className="text-white" fill="white" />
          </div>
          <span className="text-base font-bold gradient-text">Sarees Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 py-2">Menu</p>
        {navItems.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 no-underline ${
                isActive
                  ? 'bg-[rgba(255,255,255,0.14)] text-white'
                  : 'text-white/60 hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-cta"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} className={isActive ? 'text-[#8b5cf6]' : 'text-white/40 group-hover:text-white/70'} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-[rgba(255,255,255,0.06)]">
          <div className="w-9 h-9 rounded-full gradient-cta flex items-center justify-center text-white text-sm font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none">{user?.name}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white/40 hover:text-[#ef4444] rounded-xl hover:bg-[rgba(239,68,68,0.10)] transition-all cursor-pointer border-none bg-transparent"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}