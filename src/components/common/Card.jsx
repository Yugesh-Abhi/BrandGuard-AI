
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
      className={`
        rounded-2xl
        bg-[#121420]/95
        border border-[#272A3B]
        shadow-xl shadow-black/20
        backdrop-blur-md
        transition-all duration-300

        ${hoverEffect
          ? 'hover:border-[#00BFD6]/40 hover:bg-[#171A29] hover:shadow-xl hover:shadow-cyan-950/20'
          : ''
        }

        ${glow
          ? 'ring-1 ring-[#7000FF]/30 shadow-lg shadow-purple-950/20'
          : ''
        }

        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = ''
}) => (
  <div
    className={`
      flex items-center justify-between
      border-b border-[#272A3B]
      pb-4 mb-5
      ${className}
    `}
  >
    {children}
  </div>
);

export const CardTitle = ({
  children,
  icon: Icon,
  className = ''
}) => (
  <div className="flex items-center gap-2.5">
    {Icon && (
      <Icon className="w-5 h-5 text-[#00E5FF] shrink-0" />
    )}

    <h3
      className={`
        font-semibold text-[#EAF2FF]
        text-lg tracking-tight
        ${className}
      `}
    >
      {children}
    </h3>
  </div>
);

export const CardDescription = ({
  children,
  className = ''
}) => (
  <p
    className={`
      text-xs text-[#B0B8CA]
      mt-1 leading-relaxed
      ${className}
    `}
  >
    {children}
  </p>
);
