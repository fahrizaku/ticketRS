import React, { ReactNode } from "react";

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className={`min-w-full table-auto ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <thead className={`border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`${className}`}>{children}</tr>;
}

export function TableCell({ 
  children, 
  isHeader = false, 
  className = "" 
}: { 
  children: ReactNode; 
  isHeader?: boolean; 
  className?: string 
}) {
  const Tag = isHeader ? "th" : "td";
  return (
    <Tag className={`px-4 py-4 text-left text-sm ${isHeader ? "font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs" : "text-gray-700 dark:text-gray-300"} ${className}`}>
      {children}
    </Tag>
  );
}
