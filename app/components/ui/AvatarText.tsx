import React from "react";

export default function AvatarText({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-brand-100 text-brand-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-success-100 text-success-600",
  ];

  const index = name.length % colors.length;
  const colorClass = colors[index];

  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold text-xs ${colorClass} ${className}`}>
      {initials}
    </div>
  );
}
