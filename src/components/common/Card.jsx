import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  padding = 'p-6',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[#0D1326]/90 border border-[#1E294B] shadow-xl backdrop-blur-md transition-all duration-300 ${
        hoverEffect ? 'hover:border-purple-500/40 hover:bg-[#121A35] hover:shadow-2xl hover:shadow-purple-950/20' : ''
      } ${glow ? 'ring-1 ring-purple-500/30 shadow-purple-900/20 shadow-lg' : ''} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between border-b border-[#1A2346] pb-4 mb-5 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, icon: Icon, className = '' }) => (
  <div className="flex items-center gap-2.5">
    {Icon && <Icon className="w-5 h-5 text-purple-400 shrink-0" />}
    <h3 className={`font-semibold text-slate-100 text-lg tracking-tight ${className}`}>
      {children}
    </h3>
  </div>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-400 mt-1 leading-relaxed ${className}`}>
    {children}
  </p>
);
