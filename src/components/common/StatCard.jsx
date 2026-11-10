import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  trend, // e.g. { value: '+4.2%', direction: 'up', label: 'vs last month' }
  icon: Icon,
  accentColor = 'purple', // 'purple' | 'cyan' | 'emerald' | 'amber'
  onClick
}) => {
  const accentClasses = {
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-950/60 text-purple-400 border border-purple-500/30',
      glow: 'hover:shadow-purple-950/20',
      gradient: 'from-purple-500/10 to-transparent'
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30',
      glow: 'hover:shadow-cyan-950/20',
      gradient: 'from-cyan-500/10 to-transparent'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
      glow: 'hover:shadow-emerald-950/20',
      gradient: 'from-emerald-500/10 to-transparent'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
      glow: 'hover:shadow-amber-950/20',
      gradient: 'from-amber-500/10 to-transparent'
    }
  };

  const style = accentClasses[accentColor] || accentClasses.purple;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-[#0D1326]/90 border ${style.border} p-5 backdrop-blur-md transition-all duration-300 hover:shadow-xl ${style.glow} group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1.5 font-['Plus_Jakarta_Sans']">
            {value}
          </h4>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.iconBg} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#192244]/80 text-xs relative z-10">
          {trend && (
            <span
              className={`inline-flex items-center font-semibold gap-0.5 ${
                trend.direction === 'up'
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
          <span className="text-slate-400 truncate">
            {trend?.label || subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
