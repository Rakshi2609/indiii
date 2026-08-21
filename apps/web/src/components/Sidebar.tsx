"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Compass,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  GitFork,
  Layers,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  User,
  X,
  Zap
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("Land Revenue Officer");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Overview", href: "/", icon: Layers, labelIndic: "अवलोकन" },
    { name: "Upload & Extract", href: "/upload", icon: FileUp, labelIndic: "दस्तावेज़" },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, labelIndic: "डैशबोर्ड" },
    { name: "Cadastral GIS", href: "/gis", icon: Compass, labelIndic: "मानचित्र" },
    { 
      name: "Intelligence", 
      href: "/intelligence", 
      icon: GitFork, 
      labelIndic: "वंशावली",
      badge: "NEW" 
    },
    { 
      name: "Verification", 
      href: "/verification", 
      icon: FileCheck2, 
      labelIndic: "सत्यापन",
      badge: "3" 
    },
    { name: "Audit Trail", href: "/audit", icon: ShieldCheck, labelIndic: "ऑडिट" },
  ];

  const quickSearchRecords = [
    { title: "Survey No. 142/2A • Wagholi, Pune (Maharashtra)", href: "/verification/1", type: "Cadastral Record" },
    { title: "Land Ownership Lineage Graph & Timeline (10 Acres Split)", href: "/intelligence", type: "Lineage Graph" },
    { title: "Sale Deed • Guntur City, Andhra Pradesh (Telugu)", href: "/verification/4", type: "Deed Extract" },
    { title: "Cadastral GIS Conflict Map (Survey 142)", href: "/gis", type: "Spatial Map" },
    { title: "Upload New Multilingual Deed (Sarvam / Gemini)", href: "/upload", type: "Document Action" },
    { title: "System Audit Logs & Security Events", href: "/audit", type: "Audit Log" },
    { title: "FastAPI Interactive Swagger Specs", href: "http://localhost:8000/docs", isExternal: true, type: "API Docs" },
  ];

  // Hotkey listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setRoleDropdownOpen(false);
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close when clicking outside on mobile or expanded overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const filteredSearch = quickSearchRecords.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openState = isExpanded || isHovered;

  return (
    <>
      {/* Backdrop overlay when sidebar is expanded */}
      {openState && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-200"
          onClick={() => {
            setIsExpanded(false);
            setIsHovered(false);
          }}
        />
      )}

      {/* Overlapping Floating Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setRoleDropdownOpen(false);
        }}
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col justify-between border-r border-white/[0.08] bg-[#070B14]/95 backdrop-blur-2xl transition-all duration-250 ease-out shadow-2xl ${
          openState ? "w-64" : "w-[68px]"
        }`}
      >
        {/* ========================================================================= */}
        {/* TOP SECTION: BRAND & HEADER                                               */}
        {/* ========================================================================= */}
        <div className="flex flex-col">
          <div className="h-[74px] px-4 flex items-center justify-between border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all">
                <MapPin className="h-4 w-4 text-teal-400 stroke-[1.75]" />
              </div>

              {openState && (
                <div className="flex flex-col overflow-hidden animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold tracking-tight text-[#F4F7FA] whitespace-nowrap">
                      Land AI
                    </span>
                    <span className="text-[9px] font-medium text-teal-400/80 bg-teal-500/[0.08] px-1.5 py-0.2 rounded font-mono">
                      भू-अभिलेख
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8B98AA] font-normal leading-tight truncate">
                    Indic Revenue Intelligence
                  </span>
                </div>
              )}
            </Link>

            {openState && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 rounded-md text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.06] transition-colors"
                title={isExpanded ? "Collapse Sidebar" : "Pin Sidebar"}
              >
                {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Quick Primary Upload Action */}
          <div className="p-3 border-b border-white/[0.06]">
            <Link href="/upload" onClick={() => setIsExpanded(false)}>
              <button
                className={`w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-[#F4F7FA] font-medium text-xs shadow-md shadow-emerald-950/60 transition-all ${
                  openState ? "h-9 px-3" : "h-9 px-0"
                }`}
                title="Upload Deed Document"
              >
                <FileUp className="w-4 h-4 shrink-0 stroke-[2]" />
                {openState && <span className="whitespace-nowrap truncate font-semibold">Upload Deed</span>}
              </button>
            </Link>
          </div>

          {/* Quick Search Button */}
          <div className="p-3 pb-1">
            <button
              onClick={() => setSearchModalOpen(true)}
              className={`w-full flex items-center gap-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[#8B98AA] hover:text-[#F4F7FA] transition-all ${
                openState ? "h-9 px-3 justify-between" : "h-9 px-0 justify-center"
              }`}
              title="Search records (⌘K)"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="w-4 h-4 shrink-0 text-[#5F6B7A] stroke-[1.75]" />
                {openState && <span className="text-xs truncate">Search records...</span>}
              </div>
              {openState && (
                <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-mono text-[#8B98AA] border border-white/[0.06]">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* NAVIGATION LINKS LIST                                                     */}
          {/* ========================================================================= */}
          <nav className="p-2 space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsExpanded(false)}
                  className={`group relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    openState ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                  } ${
                    active
                      ? "text-[#F4F7FA] bg-teal-500/[0.12] shadow-sm shadow-teal-950/40"
                      : "text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.04]"
                  }`}
                  title={!openState ? item.name : undefined}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 stroke-[1.75] transition-colors ${
                      active ? "text-teal-400" : "text-[#8B98AA] group-hover:text-[#F4F7FA]"
                    }`}
                  />

                  {openState && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                      <span className="truncate">{item.name}</span>
                      {item.badge ? (
                        <span className="inline-flex items-center justify-center h-4 min-w-[18px] px-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#5F6B7A] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.labelIndic}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Bar */}
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-teal-400 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: AI ENGINE TELEMETRY & OFFICER RBAC                        */}
        {/* ========================================================================= */}
        <div className="p-3 border-t border-white/[0.06] space-y-2 bg-[#050912]/80">
          {/* AI Engine Status */}
          <div
            className={`flex items-center gap-2.5 rounded-lg py-1.5 ${
              openState ? "px-2.5 bg-white/[0.02] border border-white/[0.04]" : "justify-center px-0"
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>

            {openState && (
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="text-[11px] font-medium text-[#F4F7FA]">AI Engine Active</span>
                <span className="text-[10px] text-[#5F6B7A] font-mono truncate">
                  Gemini 3.6 · Sarvam 1.5
                </span>
              </div>
            )}
          </div>

          {/* User Role Selector */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`w-full flex items-center gap-2 text-xs text-[#8B98AA] hover:text-[#F4F7FA] transition-colors py-1.5 rounded-lg hover:bg-white/[0.04] ${
                openState ? "px-2 justify-between" : "justify-center px-0"
              }`}
              title={!openState ? activeRole : undefined}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                </div>
                {openState && <span className="font-medium text-[11px] truncate">{activeRole}</span>}
              </div>
              {openState && <ChevronDown className="w-3 h-3 text-[#5F6B7A]" />}
            </button>

            {roleDropdownOpen && (
              <div className="absolute left-full bottom-0 ml-2 w-56 rounded-xl border border-white/[0.08] bg-[#0B1220] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5F6B7A] border-b border-white/[0.06] mb-1">
                  Select RBAC Role
                </div>
                {[
                  { role: "Land Revenue Officer", desc: "Verify deeds, approve titles" },
                  { role: "GIS Cadastral Surveyor", desc: "Inspect polygon overlaps" },
                  { role: "System Administrator", desc: "Audit trail, model telemetry" },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setActiveRole(item.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex flex-col ${
                      activeRole === item.role
                        ? "bg-teal-500/10 text-teal-300"
                        : "text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="font-medium flex items-center justify-between">
                      {item.role}
                      {activeRole === item.role && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </span>
                    <span className="text-[10px] text-[#5F6B7A] mt-0.5">{item.desc}</span>
                  </button>
                ))}
                <div className="mt-1 pt-1 border-t border-white/[0.06]">
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#5F6B7A]" />
                      FastAPI Swagger
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* GLOBAL COMMAND PALETTE SEARCH MODAL (⌘K / Ctrl+K)                          */}
      {/* ========================================================================= */}
      {searchModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-white/[0.08] bg-[#0B1220] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06] bg-[#070B14]">
              <Search className="w-4 h-4 text-teal-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Survey Number, Village, Deed Type, or Jurisdiction..."
                className="w-full bg-transparent text-sm text-[#F4F7FA] placeholder-[#5F6B7A] focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-[#8B98AA] hover:text-[#F4F7FA] p-1 rounded hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5F6B7A]">
                Quick Destinations & Records
              </div>
              {filteredSearch.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5F6B7A]">
                  No matching land records or actions found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredSearch.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchModalOpen(false);
                      if (item.isExternal) {
                        window.open(item.href, "_blank");
                      } else {
                        router.push(item.href);
                      }
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-xs text-[#F4F7FA] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Zap className="w-3.5 h-3.5 text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#8B98AA] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] shrink-0">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Search Footer */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#070B14]/60 text-[11px] text-[#5F6B7A] flex items-center justify-between">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-[#8B98AA]">ESC</kbd> to close</span>
              <span>Land AI Indic Revenue Platform</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
