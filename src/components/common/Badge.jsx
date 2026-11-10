import React from 'react';
import { AlertCircle, AlertTriangle, Clock, Info, ShieldCheck } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'default', // 'critical' | 'warning' | 'pass' | 'info' | 'neutral' | 'in_review' | 'approved' | 'needs_revision'
  size = 'sm',
  withIcon = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-xs px-3 py-1 font-semibold rounded-full',
  };

  const getVariantConfig = () => {
    switch (variant.toLowerCase()) {
      case 'critical':
      case 'action_required':
      case 'rejected':
        return {
          styles: 'bg-rose-950/60 text-rose-300 border border-rose-500/30',
          icon: AlertCircle
        };
      case 'warning':
      case 'needs_revision':
      case 'needs revisions':
        return {
          styles: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
          icon: AlertTriangle
        };
      case 'pass':
      case 'passed':
      case 'approved':
        return {
          styles: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
          icon: ShieldCheck
        };
      case 'in_review':
      case 'in review':
      case 'analyzing':
        return {
          styles: 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30',
          icon: Clock
        };
      case 'suggestion':
      case 'info':
        return {
          styles: 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30',
          icon: Info
        };
      default:
        return {
          styles: 'bg-slate-800 text-slate-300 border border-slate-700',
          icon: null
        };
    }
  };

  const { styles, icon: IconComponent } = getVariantConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 ${styles} ${sizeStyles[size]} ${className}`}>
      {withIcon && IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
