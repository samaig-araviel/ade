'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  hover?: boolean;
  glow?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ variant = 'default', hover = false, glow = false, children, className = '', onClick }: CardProps) {
  const baseStyles = 'rounded-xl overflow-hidden';

  const variants = {
    default: 'bg-bg-secondary border border-border-primary',
    elevated: 'bg-bg-elevated shadow-lg',
    bordered: 'bg-transparent border border-border-secondary',
    glass: 'glass',
  };

  const hoverStyles = hover ? 'card-hover cursor-pointer' : '';
  const glowStyles = glow ? 'glow' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${glowStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 border-b border-border-primary ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
