
import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
  ShieldCheck
} from 'lucide-react';

export const Badge = ({
  children,
  variant = 'default',
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
          styles: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
          icon: AlertCircle
        };

      case 'warning':
      case 'needs_revision':
      case 'needs revisions':
        return {
          styles: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          icon: AlertTriangle
        };

      case 'pass':
      case 'passed':
      case 'approved':
        return {
          styles: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          icon: ShieldCheck
        };

      case 'in_review':
      case 'in review':
      case 'analyzing':
        return {
          styles: 'bg-[#7000FF]/10 text-purple-300 border border-[#7000FF]/30',
          icon: Clock
        };

      case 'suggestion':
      case 'info':
        return {
          styles: 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/25',
          icon: Info
        };

      default:
        return {
          styles: 'bg-[#1B1E2D] text-[#B0B8CA] border border-[#272A3B]',
          icon: null
        };
    }
  };

  const { styles, icon: IconComponent } = getVariantConfig();

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        whitespace-nowrap
        ${styles}
        ${sizeStyles[size] || sizeStyles.sm}
        ${className}
      `}
    >
      {withIcon && IconComponent && (
        <IconComponent className="w-3.5 h-3.5 shrink-0" />
      )}

      <span>{children}</span>
    </span>
  );
};
