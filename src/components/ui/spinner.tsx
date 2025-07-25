import React from 'react';

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 ${className}`} />
  );
} 