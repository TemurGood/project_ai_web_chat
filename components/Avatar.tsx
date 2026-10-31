import React from "react";
import { Headphones, User } from "lucide-react";

interface AvatarProps {
  className?: string;
  size?: number;
}

export default function Avatar({ className = "", size = 44 }: AvatarProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Силуэт оператора */}
      <User size={size * 0.55} className="text-white drop-shadow" />
      {/* Гарнитура / наушник с микрофоном */}
      <Headphones
        size={size * 0.65}
        className="absolute text-cyan-200 drop-shadow animate-pulse"
      />
      {/* Зеленый индикатор "онлайн" */}
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
    </div>
  );
}