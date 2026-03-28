import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
      outline: 'bg-transparent border-2 border-slate-200 dark:border-slate-800',
      ghost: 'bg-slate-50 dark:bg-slate-900/50 border-none',
      glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800/50 shadow-xl',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6 sm:p-8',
      lg: 'p-8 sm:p-12',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-[2.5rem] transition-all',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
