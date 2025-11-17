import React, { useState } from 'react';

interface AvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

/**
 * Gets initials from a name (first letter of first word and first letter of last word)
 */
const getInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Gets a color based on the name for consistent avatar backgrounds
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ 
  avatarUrl, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const showImage = avatarUrl && !imageError;

  if (showImage) {
    return (
      <div className="relative">
        <img 
          src={avatarUrl} 
          alt={name} 
          className={`${sizeClass} rounded-full object-cover ${className}`}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};

