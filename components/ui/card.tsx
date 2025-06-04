import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
      className
    )}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className, children }) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={clsx('text-gray-600', className)}>
      {children}
    </div>
  );
};
