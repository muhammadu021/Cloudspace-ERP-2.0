import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const OnlineStatus = ({ isOnline, lastSeen, size = 'sm', showText = false }) => {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getLastSeenText = () => {
    if (isOnline) return 'Online';
    if (!lastSeen) return 'Offline';
    
    try {
      const lastSeenDate = new Date(lastSeen);
      return `Last seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`;
    } catch (error) {
      return 'Offline';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full ${
            isOnline
              ? 'bg-green-500'
              : 'bg-gray-400 dark:bg-gray-600'
          }`}
        />
        {isOnline && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
          />
        )}
      </div>
      {showText && (
        <span className={`text-xs ${
          isOnline
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {getLastSeenText()}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
