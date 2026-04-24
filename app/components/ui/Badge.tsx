import React from "react";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light";

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  color = "primary",
  children,
  className = "",
}: BadgeProps) {
  const colors = {
    primary: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
    info: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
    light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'CRITICAL':
      return <Badge color="error">Kritis</Badge>;
    case 'HIGH':
      return <Badge color="error">Tinggi</Badge>;
    case 'MEDIUM':
      return <Badge color="warning">Sedang</Badge>;
    case 'LOW':
      return <Badge color="info">Rendah</Badge>;
    default:
      return <Badge color="light">{priority}</Badge>;
  }
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'OPEN':
      return <Badge color="primary">Menunggu</Badge>;
    case 'IN_PROGRESS':
      return <Badge color="info">Dikerjakan</Badge>;
    case 'RESOLVED':
      return <Badge color="success">Selesai</Badge>;
    case 'CLOSED':
      return <Badge color="light">Ditutup</Badge>;
    default:
      return <Badge color="light">{status}</Badge>;
  }
}
