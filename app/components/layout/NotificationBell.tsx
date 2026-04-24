"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getNotifications, markAllAsRead } from "@/app/actions/notifications";

type Notification = {
  id: string;
  message: string;
  link: string | null;
  isRead: boolean | number;
  createdAt: Date;
};

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    [880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {
    // AudioContext blocked by browser policy — silently ignore
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    const data = await getNotifications() as Notification[];
    setNotifications(data);

    const newUnread = data.filter((n) => !n.isRead).length;
    if (prevUnreadRef.current !== null && newUnread > prevUnreadRef.current) {
      playNotificationSound();
    }
    prevUnreadRef.current = newUnread;
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    return `${Math.floor(diffHour / 24)} hari lalu`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-brand-500 shadow-sm transition-colors"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 right-0 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 border-2 border-white dark:border-gray-900 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {unreadCount === 0 && (
          <span className="absolute -top-0.5 right-0 z-10 block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900" />
        )}
        <Bell size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-brand-500 font-medium">{unreadCount} belum dibaca</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-gray-400">Tidak ada notifikasi</p>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} formatTime={formatTime} onClose={() => setIsOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  formatTime,
  onClose,
}: {
  notification: Notification;
  formatTime: (d: Date) => string;
  onClose: () => void;
}) {
  const isRead = Boolean(notification.isRead);
  const content = (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!isRead ? "bg-brand-25 dark:bg-brand-500/5" : ""}`}>
      {!isRead && <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-brand-500" />}
      {isRead && <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-transparent" />}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!isRead ? "font-medium text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link} onClick={onClose}>{content}</Link>;
  }
  return content;
}
