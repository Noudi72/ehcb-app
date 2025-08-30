import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Lädt...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-[#0a2240] dark:border-blue-400 ${sizeClasses[size]}`}></div>
      {text && (
        <span className="ml-2 text-gray-600 dark:text-gray-300 mt-2 text-sm">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
