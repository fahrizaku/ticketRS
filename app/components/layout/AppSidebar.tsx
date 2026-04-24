"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { logout } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Ticket,
  Settings,
  LogOut,
  Stethoscope,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const AppSidebar: React.FC<{ user: any }> = ({ user }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const handleNavClick = () => { if (isMobileOpen) toggleMobileSidebar(); };
  const pathname = usePathname();
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={22} />,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Ticket size={22} />,
      name: "Tiket",
      subItems: [
        { name: "Semua Tiket", path: "/tickets" },
        ...(user?.role !== "TEKNISI"
          ? [{ name: "Buat Tiket", path: "/tickets/new" }]
          : []),
      ],
    },
    ...(isAdmin
      ? [
          {
            icon: <Settings size={22} />,
            name: "Admin",
            subItems: [
              { name: "Manajemen User", path: "/admin/users" },
              { name: "Kategori", path: "/admin/categories" },
            ],
          },
        ]
      : []),
  ];

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  const isParentActive = useCallback((item: NavItem) => {
    if (item.path && isActive(item.path)) return true;
    return item.subItems?.some((sub) => isActive(sub.path)) || false;
  }, [isActive]);

  useEffect(() => {
    navItems.forEach((nav, index) => {
      if (nav.subItems?.some((subItem) => isActive(subItem.path))) {
        setOpenSubmenu(index);
      }
    });
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-dvh flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`shrink-0 py-8 px-6 flex items-center ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start gap-3"}`}>
        <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-3">
          <div className="bg-brand-500 p-1.5 rounded-xl text-white shadow-lg shadow-brand-500/20">
            <Stethoscope size={24} />
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-bold text-xl tracking-tight dark:text-white font-outfit">Ticket<span className="text-brand-500">RS</span></span>
          )}
        </Link>
      </div>

      {/* Nav - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4">
        <nav>
          <h2 className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "px-3"}`}>
            {isExpanded || isHovered || isMobileOpen ? "Menu Utama" : "•••"}
          </h2>

          <ul className="flex flex-col gap-2">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === index ? null : index)}
                      className={`menu-item group ${openSubmenu === index || isParentActive(nav) ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded && !isHovered ? "lg:justify-center px-0" : ""}`}
                    >
                      <span className={`menu-item-icon ${openSubmenu === index || isParentActive(nav) ? "menu-item-icon-active" : ""}`}>
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <>
                          <span className="flex-1 text-left font-outfit">{nav.name}</span>
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${openSubmenu === index ? "rotate-180 text-brand-500" : "text-gray-400"}`}
                          />
                        </>
                      )}
                    </button>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <div
                        ref={(el) => { subMenuRefs.current[index] = el; }}
                        className="overflow-hidden transition-all duration-300"
                        style={{ height: openSubmenu === index ? `${subMenuHeight[index]}px` : "0px" }}
                      >
                        <ul className="mt-2 space-y-1 ml-9">
                          {nav.subItems.map((sub) => (
                            <li key={sub.path}>
                              <Link
                                href={sub.path}
                                onClick={handleNavClick}
                                className={`menu-dropdown-item font-outfit ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={nav.path!}
                    onClick={handleNavClick}
                    className={`menu-item group ${isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded && !isHovered ? "lg:justify-center px-0" : ""}`}
                  >
                    <span className={`menu-item-icon ${isActive(nav.path!) ? "menu-item-icon-active" : ""}`}>
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="flex-1 text-left font-outfit">{nav.name}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Profile - mobile only, sticky at bottom */}
      <div className="lg:hidden shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {sidebarProfileOpen && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-error-500 border border-error-200 dark:border-error-500/30 bg-error-50 dark:bg-error-500/10 hover:bg-error-100 dark:hover:bg-error-500/20 rounded-lg transition-colors font-outfit"
              >
                <LogOut size={15} />
                Keluar
              </button>
            </form>
          </div>
        )}
        <button
          onClick={() => setSidebarProfileOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 px-4 py-3"
        >
          <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
            <UserIcon size={18} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate font-outfit">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${sidebarProfileOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
