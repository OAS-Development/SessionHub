import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Alert({ children, variant = 'default', className = '' }: AlertProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-900 border-gray-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    error: 'bg-red-50 text-red-900 border-red-200'
  };
  
  return (
    <div className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = "" }) { return <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>{children}</h5>; } export function AlertDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm ${className}`}>{children}</div>;
}

export default Alert;
