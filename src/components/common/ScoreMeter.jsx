import React from 'react';

export const ScoreMeter = ({
  score = 0,
  max = 100,
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = true,
  label = 'Brand Health'
}) => {
  const percentage = Math.round((score / max) * 100);

  const getColor = (pct) => {
    if (pct >= 90) return { stroke: '#10B981', text: 'text-emerald-400', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' };
    if (pct >= 80) return { stroke: '#8B5CF6', text: 'text-purple-400', badge: 'bg-purple-950/60 text-purple-300 border-purple-500/30' };
    if (pct >= 70) return { stroke: '#F59E0B', text: 'text-amber-400', badge: 'bg-amber-950/60 text-amber-300 border-amber-500/30' };
    return { stroke: '#F43F5E', text: 'text-rose-400', badge: 'bg-rose-950/60 text-rose-300 border-rose-500/30' };
  };

  const color = getColor(percentage);

  const dimensions = {
    sm: { radius: 26, stroke: 5, width: 64, height: 64, fontSize: 'text-sm' },
    md: { radius: 42, stroke: 7, width: 104, height: 104, fontSize: 'text-2xl' },
    lg: { radius: 64, stroke: 10, width: 156, height: 156, fontSize: 'text-4xl' },
  };

  const dim = dimensions[size] || dimensions.md;
  const circumference = 2 * Math.PI * dim.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={dim.width} height={dim.height} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={dim.radius}
            stroke="#192244"
            strokeWidth={dim.stroke}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={dim.radius}
            stroke={color.stroke}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold font-['Plus_Jakarta_Sans'] ${dim.fontSize} ${color.text}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-xs text-slate-400 font-medium mt-2 tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
};
