import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'ai' | 'outline' | 'purple' | 'secondary';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-gray-100 text-gray-900 border border-transparent',
    success: 'bg-green-100 text-green-800 border border-transparent',
    warning: 'bg-yellow-100 text-yellow-800 border border-transparent',
    danger: 'bg-red-100 text-red-800 border border-transparent',
    ai: 'bg-purple-100 text-purple-800 border border-transparent',
    outline: 'text-gray-950 border border-gray-200',
    purple: 'bg-purple-100 text-purple-700 border border-transparent',
    secondary: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
