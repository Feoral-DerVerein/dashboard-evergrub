
import React from "react";

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  className?: string;
}

export function NotificationBadge({ 
  count, 
  maxCount = 99,
  className = "absolute -top-2 -right-2"
}: NotificationBadgeProps) {
  if (count <= 0) return null;
  
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  return (
    <div className={`${className} bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
      {displayCount}
    </div>
  );
}
