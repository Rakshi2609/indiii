"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  FileCheck2,
  FileText,
  GitFork,
  History,
  Layers,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // If on landing, login or signup page, do not render sidebar
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const isOwnerMode = user?.role === "OWNER" || pathname.startsWith("/owner");

  const navItems = isOwnerMode
    ? [
        { name: "Dashboard", href: "/owner", icon: Layers, badge: null },
        { name: "Land Records", href: "/owner/properties", icon: FileText, badge: null },
        { name: "GIS Mapping", href: "/owner/gis", icon: Compass, badge: null },
        { name: "Verifications", href: "/verification", icon: FileCheck2, badge: "2" },
        { name: "Audit Ledger", href: "/owner/history", icon: History, badge: null },
        { name: "AI Copilot", href: "/copilot", icon: Sparkles, badge: "AI" },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: Layers, badge: null },
        { name: "Land Records", href: "/upload", icon: FileText, badge: null },
        { name: "GIS Mapping", href: "/gis", icon: Compass, badge: null },
        { name: "Verifications", href: "/verification", icon: FileCheck2, badge: "3" },
        { name: "Audit Ledger", href: "/audit", icon: History, badge: null },
        { name: "AI Copilot", href: "/copilot", icon: Sparkles, badge: "AI" },
      ];

  const isActive = (path: string) => {
    if (path === "/owner" && pathname === "/owner") return true;
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/owner" && path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const showExpanded = isExpanded || isPinned;

  return (
    <>
      {/* Desktop Expandable Sidebar (High Z-Index, Floats Over Canvas Without Resizing Page) */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!isPinned) setIsExpanded(false);
        }}
        className={`hidden md:flex bg-surface fixed left-0 top-0 h-full border-r border-outline-variant transition-all duration-300 ease-in-out flex-col py-4 z-50 select-none ${
          showExpanded
            ? "w-[260px] shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl bg-surface/98"
            : "w-[72px] shadow-sm bg-surface"
        }`}
      >
        {/* Brand Header */}
        <div className="px-3.5 mb-5 flex items-center justify-between">
          <Link
            href={isOwnerMode ? "/owner" : "/dashboard"}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-container flex-shrink-0 flex items-center justify-center text-on-primary-container shadow-sm">
              <span className="font-bold text-lg text-white font-mono">L</span>
            </div>
            {showExpanded && (
              <div className="min-w-0 transition-opacity duration-200">
                <h1 className="text-base font-extrabold text-primary tracking-tight leading-tight truncate">
                  LAND AI
                </h1>
                <p className="text-[10px] font-bold text-on-surface-variant leading-none truncate">
                  इंडी-भूमि
                </p>
              </div>
            )}
          </Link>

          {/* Pin/Collapse Toggle Button */}
          {showExpanded && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
              title={isPinned ? "Unpin sidebar" : "Pin sidebar expanded"}
            >
              {isPinned ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Quick CTA Button */}
        <div className="px-3 mb-4">
          <Link href="/upload">
            <button
              className={`w-full bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                showExpanded ? "py-2.5 px-3 gap-2" : "py-2.5 px-0"
              }`}
              title="Verify Record"
            >
              <FileCheck2 className="h-4 w-4 shrink-0" />
              {showExpanded && <span className="truncate">Verify Record</span>}
            </button>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  showExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                } ${
                  active
                    ? "bg-primary text-on-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
                title={!showExpanded ? item.name : undefined}
              >
                <div className={`flex items-center gap-3 ${!showExpanded ? "justify-center" : ""}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-on-primary" : "text-on-surface-variant group-hover:text-primary"}`} />
                  {showExpanded && <span className="truncate">{item.name}</span>}
                </div>

                {showExpanded && item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      active
                        ? "bg-white/20 text-white"
                        : item.badge === "AI"
                        ? "bg-[#E0E7FF] text-[#4338CA] border border-[#A5B4FC]"
                        : "bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions & User Profile */}
        <div className="px-2 mt-auto pt-3 border-t border-outline-variant space-y-2">
          {/* Quick Portal Switcher */}
          {showExpanded ? (
            <Link
              href={isOwnerMode ? "/dashboard" : "/owner"}
              className="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant hover:text-primary p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/60"
            >
              <span>{isOwnerMode ? "🏛️ Govt Command" : "👤 Owner Vault"}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              href={isOwnerMode ? "/dashboard" : "/owner"}
              className="flex items-center justify-center p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/60"
              title={isOwnerMode ? "Switch to Govt Command" : "Switch to Owner Vault"}
            >
              <span className="text-xs">{isOwnerMode ? "🏛️" : "👤"}</span>
            </Link>
          )}

          {/* Supporting Links */}
          <div className="space-y-0.5">
            <Link
              href="/intelligence"
              className={`flex items-center gap-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high text-xs transition-colors ${
                showExpanded ? "px-3 py-1.5" : "py-2 justify-center"
              }`}
              title="Lineage Intelligence"
            >
              <GitFork className="h-3.5 w-3.5 shrink-0" />
              {showExpanded && <span className="truncate">Lineage Intelligence</span>}
            </Link>
            <Link
              href="/audit"
              className={`flex items-center gap-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high text-xs transition-colors ${
                showExpanded ? "px-3 py-1.5" : "py-2 justify-center"
              }`}
              title="Audit & Compliance"
            >
              <Settings className="h-3.5 w-3.5 shrink-0" />
              {showExpanded && <span className="truncate">Audit & Compliance</span>}
            </Link>
          </div>

          {/* User Profile Pill */}
          <div
            className={`rounded-xl bg-surface-container-low border border-outline-variant flex items-center transition-all ${
              showExpanded ? "p-2 justify-between" : "p-1.5 justify-center"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                {user?.full_name ? user.full_name.charAt(0) : "N"}
              </div>
              {showExpanded && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-on-surface truncate">
                    {user?.full_name || "Nishu Kumar"}
                  </div>
                  <div className="text-[10px] text-on-surface-variant truncate">
                    {isOwnerMode ? "Land Owner" : "Revenue Officer"}
                  </div>
                </div>
              )}
            </div>
            {showExpanded && (
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 text-on-surface-variant hover:text-error hover:bg-surface-container rounded transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-[270px] bg-surface h-full p-4 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <div>
                    <span className="font-bold text-sm text-primary">LAND AI</span>
                    <span className="text-[10px] text-on-surface-variant block font-semibold">इंडी-भूमि</span>
                  </div>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-on-surface-variant">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        active
                          ? "bg-primary text-on-primary font-bold"
                          : "text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-surface-container-high border border-outline-variant font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-outline-variant">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-error hover:bg-error-container/20 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
