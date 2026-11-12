
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold rounded-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40
    focus:ring-offset-2 focus:ring-offset-[#0A0B10]
    disabled:opacity-50 disabled:cursor-not-allowed
    select-none cursor-pointer
    active:scale-[0.98]
  `;

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-[#00BFD6] to-[#00E5FF]
      text-[#071018]
      shadow-lg shadow-cyan-950/30
      hover:from-[#00D5E8] hover:to-[#52EDFF]
      hover:shadow-cyan-500/20
    `,

    secondary: `
      bg-[#1B1E2D] text-[#EAF2FF]
      border border-[#272A3B]
      hover:bg-[#25293B]
      hover:border-[#00BFD6]/40
    `,

    outline: `
      bg-transparent
      border border-[#00BFD6]/50
      text-[#00E5FF]
      hover:bg-[#00E5FF]/10
      hover:border-[#00E5FF]
    `,

    ghost: `
      bg-transparent text-[#B0B8CA]
      hover:text-white
      hover:bg-[#1B1E2D]
    `,

    danger: `
      bg-rose-600/90 text-white
      shadow-md shadow-rose-950/30
      hover:bg-rose-500
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      )}

      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};
