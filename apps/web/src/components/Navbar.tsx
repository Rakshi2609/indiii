"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Command,
  Compass,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  Layers,
  MapPin,
  Menu,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("Land Revenue Officer");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{ status: string; latency: number }>({
    status: "operational",
    latency: 24,
  });

  const navItems = [
    { name: "Overview", href: "/", icon: Layers, labelIndic: "अवलोकन" },
    { 
      name: "Upload & Extract", 
      href: "/upload", 
      icon: FileUp, 
      labelIndic: "दस्तावेज़",
      sparkle: true 
    },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, labelIndic: "डैशबोर्ड" },
    { name: "Cadastral GIS", href: "/gis", icon: Compass, labelIndic: "मानचित्र" },
    { 
      name: "Verification Queue", 
      href: "/verification", 
      icon: FileCheck2, 
      labelIndic: "सत्यापन",
      badgeCount: 3 
    },
    { name: "Audit Trail", href: "/audit", icon: ShieldCheck, labelIndic: "ऑडिट" },
  ];

  const quickSearchRecords = [
    { title: "Survey No. 142/2A • Wagholi, Pune (Maharashtra)", href: "/verification/1", type: "Record" },
    { title: "Sale Deed • Guntur City, Andhra Pradesh (Telugu)", href: "/verification/4", type: "Deed" },
    { title: "Cadastral GIS Conflict Map (Survey 142)", href: "/gis", type: "GIS Map" },
    { title: "Upload New Multilingual Deed (Sarvam / Gemini)", href: "/upload", type: "Action" },
    { title: "System Audit Logs & Security Events", href: "/audit", type: "Audit" },
    { title: "FastAPI Interactive Swagger Specs", href: "http://localhost:8000/docs", isExternal: true, type: "API" },
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
        {/* Subtle glowing accent top border */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            
            {/* 1. Brand Logo & Indic Identity */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/30 group-hover:scale-105 group-hover:ring-emerald-400 transition-all">
                <MapPin className="h-5 w-5 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    Land AI
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded font-mono">
                    भू-अभिलेख
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium -mt-0.5">
                  <span className="text-slate-300">Indic Revenue Intelligence</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400/90 font-mono">SIH &apos;26</span>
                </div>
              </div>
            </Link>

            {/* 2. Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm shadow-emerald-950/50"
                        : item.sparkle
                        ? "text-slate-200 hover:text-white hover:bg-slate-900 border border-emerald-800/40 bg-emerald-950/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : item.sparkle ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                    {item.sparkle && !active && (
                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                    )}
                    {item.badgeCount && (
                      <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {item.badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Global Search Button & Controls */}
            <div className="flex items-center gap-2.5">
              {/* Quick Search Hotkey Trigger */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 font-sans">Search records...</span>
                <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </button>

              {/* Live AI Health Indicator */}
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400">Gemini 3.6 + Sarvam 1.5</span>
              </div>

              {/* Role Switcher Menu */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden md:inline font-medium text-[11px]">{activeRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
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
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                            : "text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-semibold flex items-center justify-between">
                          {item.role}
                          {activeRole === item.role && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                    <div className="mt-1 pt-1 border-t border-slate-800/80">
                      <a
                        href="http://localhost:8000/docs"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          FastAPI Swagger
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Deed Primary Action */}
              <Link href="/upload" className="hidden sm:block">
                <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold gap-1.5 h-8 px-3.5 shadow-md shadow-emerald-950/50">
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload Deed</span>
                </Button>
              </Link>

              {/* Mobile Drawer Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-400 hover:text-white h-9 w-9 border border-slate-800 bg-slate-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* 4. Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-1.5 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-2"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Search survey numbers, deeds...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">⌘K</kbd>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.labelIndic}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-2">
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                Swagger API Docs
              </a>
              <span className="text-[10px] text-slate-400 font-mono">{activeRole}</span>
            </div>
          </div>
        )}
      </header>

      {/* 5. Quick Command Search Modal (Ctrl+K / ⌘K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950">
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search survey number, village, deed type, or jurisdiction..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Jump to Destination or Record
              </div>
              {filteredSearch.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
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
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 shrink-0">
                      {item.type}
                    </Badge>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">ESC</kbd> to close</span>
              <span>Land AI Indic Intelligence</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
