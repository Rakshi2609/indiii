"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  Layers,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  User,
  X,
  Zap
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("Land Revenue Officer");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/", icon: Layers },
    { name: "Upload & Extract", href: "/upload", icon: FileUp },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Cadastral GIS", href: "/gis", icon: Compass },
    { 
      name: "Verification", 
      href: "/verification", 
      icon: FileCheck2, 
      badge: "3" 
    },
    { name: "Audit Trail", href: "/audit", icon: ShieldCheck },
  ];

  const quickSearchRecords = [
    { title: "Survey No. 142/2A • Wagholi, Pune (Maharashtra)", href: "/verification/1", type: "Cadastral Record" },
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const filteredSearch = quickSearchRecords.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-full overflow-x-clip h-[74px] border-b border-white/[0.06] bg-[#070B14]/90 backdrop-blur-xl transition-all">
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* ========================================================================= */}
          {/* ZONE 1: BRAND + IDENTITY (Left, ~220–250px)                               */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all">
                <MapPin className="h-4 w-4 text-teal-400 stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] sm:text-[17px] font-semibold tracking-tight text-[#F4F7FA] group-hover:text-teal-300 transition-colors">
                    Land AI
                  </span>
                  <span className="text-[10px] font-medium text-teal-400/80 bg-teal-500/[0.08] px-1.5 py-0.5 rounded tracking-wide">
                    भू-अभिलेख
                  </span>
                </div>
                <span className="text-[11px] text-[#8B98AA] font-normal leading-tight hidden xs:inline">
                  Indic Revenue Intelligence · SIH &apos;26
                </span>
              </div>
            </Link>
          </div>

          {/* Subtle Zone Divider */}
          <div className="hidden xl:block h-6 w-px bg-white/[0.06]" />

          {/* ========================================================================= */}
          {/* ZONE 2: PRIMARY NAVIGATION (Center, Unified Seamless System)              */}
          {/* ========================================================================= */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 whitespace-nowrap ${
                    active
                      ? "text-[#F4F7FA] bg-teal-500/[0.12] shadow-sm shadow-teal-950/40"
                      : "text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-[17px] h-[17px] stroke-[1.75] transition-colors ${
                      active ? "text-teal-400" : "text-[#8B98AA] group-hover:text-[#F4F7FA]"
                    }`}
                  />
                  <span>{item.name}</span>

                  {/* Verification Badge */}
                  {item.badge && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[18px] px-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Active bottom indicator line */}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-teal-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Subtle Zone Divider */}
          <div className="hidden xl:block h-6 w-px bg-white/[0.06]" />

          {/* ========================================================================= */}
          {/* ZONE 3: CONTROLS & PRIMARY ACTION (Right)                                */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 shrink-0 justify-end">
            
            {/* 1. Search Input (⌘K Command Palette Trigger) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden lg:flex items-center justify-between w-[160px] xl:w-[200px] h-9 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[12px] text-[#8B98AA] hover:text-[#F4F7FA] transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#5F6B7A] stroke-[1.75]" />
                <span className="truncate">Search records...</span>
              </div>
              <kbd className="inline-flex items-center rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-[#8B98AA] border border-white/[0.06]">
                ⌘K
              </kbd>
            </button>

            {/* Compact Search Trigger for Tablets/Mobile */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex lg:hidden items-center justify-center h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#8B98AA] hover:text-[#F4F7FA]"
              title="Search records (⌘K)"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* 2. Compact AI Status */}
            <div className="hidden xl:flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#F4F7FA]">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>AI Engine</span>
              </div>
              <span className="text-[10px] text-[#5F6B7A] font-mono tracking-tight -mt-0.5">
                Gemini 3.6 · Sarvam 1.5
              </span>
            </div>

            {/* 3. User Role Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 text-[12px] text-[#8B98AA] hover:text-[#F4F7FA] transition-colors py-1.5 px-2 rounded-md hover:bg-white/[0.04]"
              >
                <User className="w-3.5 h-3.5 text-[#5F6B7A] stroke-[1.75]" />
                <span className="font-medium truncate max-w-[130px]">{activeRole}</span>
                <ChevronDown className="w-3 h-3 text-[#5F6B7A] opacity-80" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#0B1220] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
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

            {/* 4. Primary CTA: Upload Deed (Only High Saturated Element) */}
            <Link href="/upload">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-[#F4F7FA] text-[12px] font-semibold shadow-md shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <FileUp className="w-3.5 h-3.5 stroke-[2]" />
                <span>Upload Deed</span>
              </button>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#8B98AA] hover:text-[#F4F7FA]"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE SLIDE-DOWN DRAWER                                                  */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#070B14]/98 backdrop-blur-2xl px-5 py-4 space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-[#8B98AA] mb-2"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-400" />
                <span>Search survey numbers, deeds...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-[#8B98AA]">⌘K</kbd>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-all ${
                    active
                      ? "bg-teal-500/10 text-teal-300"
                      : "text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-teal-400" : "text-[#8B98AA]"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8B98AA] px-2">
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-teal-400 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                Swagger API Docs
              </a>
              <span className="text-[11px] text-[#5F6B7A] font-mono">{activeRole}</span>
            </div>
          </div>
        )}
      </header>

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
