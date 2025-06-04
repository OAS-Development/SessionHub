import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ orientation = 'horizontal', className = '' }: SeparatorProps) {
  return (
    <div
      className={`${
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } bg-gray-200 ${className}`}
    />
  );
}

export default Separator;
