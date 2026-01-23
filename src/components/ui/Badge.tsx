'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'anthropic' | 'openai' | 'google';
  size?: 'sm' | 'md';
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', pulse = false, children, className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants: Record<string, string> = {
    default: 'bg-bg-accent text-text-secondary',
    success: 'bg-accent-success/10 text-accent-success',
    warning: 'bg-accent-warning/10 text-accent-warning',
    error: 'bg-accent-error/10 text-accent-error',
    info: 'bg-accent-info/10 text-accent-info',
    anthropic: 'badge-anthropic text-white',
    openai: 'badge-openai text-white',
    google: 'badge-google text-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'success' ? 'bg-accent-success' :
            variant === 'warning' ? 'bg-accent-warning' :
            variant === 'error' ? 'bg-accent-error' :
            'bg-accent-secondary'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'success' ? 'bg-accent-success' :
            variant === 'warning' ? 'bg-accent-warning' :
            variant === 'error' ? 'bg-accent-error' :
            'bg-accent-secondary'
          }`} />
        </span>
      )}
      {children}
    </motion.span>
  );
}
