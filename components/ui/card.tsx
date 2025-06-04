import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {children}
    </div>
  );
};

export { Card };
export default Card;
