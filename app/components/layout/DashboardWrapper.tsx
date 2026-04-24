"use client";
import React from "react";
import { useSidebar } from "../../context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

export default function DashboardWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[280px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar user={user} />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader user={user} />
        <main className="p-4 mx-auto max-w-[1600px] md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
