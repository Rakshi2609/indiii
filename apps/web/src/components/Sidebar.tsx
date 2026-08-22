"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  GitFork,
  HelpCircle,
  History,
  Layers,
  Lock,
  LogOut,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  // If on login page, hide sidebar completely
  if (pathname === "/login") {
    return null;
  }

  const isOwnerMode = user?.role === "OWNER" || pathname.startsWith("/owner");

  // Owner Portal Navigation Items
  const ownerNavItems = [
    { name: "Overview", href: "/owner", icon: Layers, labelIndic: "अवलोकन" },
    { name: "My Land", href: "/owner/properties", icon: MapPin, labelIndic: "मेरी भूमि" },
    { name: "Land History", href: "/owner/history", icon: History, labelIndic: "वंशावली" },
    { name: "Documents", href: "/owner/documents", icon: FileText, labelIndic: "दस्तावेज़" },
    { name: "GIS Map", href: "/owner/gis", icon: Compass, labelIndic: "मानचित्र" },
    { 
      name: "Ask Land AI", 
      href: "/copilot", 
      icon: Sparkles, 
      labelIndic: "सहायक",
      badge: "AI" 
    },
  ];

  // Government / Officer Navigation Items
  const govtNavItems = [
    { name: "Overview", href: "/", icon: Layers, labelIndic: "अवलोकन" },
    { 
      name: "Land Copilot", 
      href: "/copilot", 
      icon: Sparkles, 
      labelIndic: "सहायक",
      badge: "AI" 
    },
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

  const currentNavItems = isOwnerMode ? ownerNavItems : govtNavItems;

  const quickSearchRecords = isOwnerMode ? [
    { title: "My Land Portfolio Overview", href: "/owner", type: "Portfolio" },
    { title: "All Verified Properties List", href: "/owner/properties", type: "Land Vault" },
    { title: "Chronological Title Lineage & History", href: "/owner/history", type: "History Timeline" },
    { title: "Original Uploaded Deeds & Documents", href: "/owner/documents", type: "Documents" },
    { title: "Personal Cadastral GIS Map", href: "/owner/gis", type: "GIS Map" },
    { title: "Ask Land AI Copilot (Mistral DB Grounded)", href: "/copilot", type: "AI Chatbot" },
  ] : [
    { title: "Land AI Copilot (Mistral DB Grounded Chat)", href: "/copilot", type: "AI Chatbot" },
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openState = isExpanded || isHovered;

  const filteredSearchRecords = quickSearchRecords.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Modal (Cmd+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <Search className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search survey numbers, deeds, owners, or navigation..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 text-xs"
              >
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">ESC</kbd>
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
              <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {isOwnerMode ? "Owner Land Vault Quick Access" : "Authoritative Cadastral Records & Actions"}
              </div>
              {filteredSearchRecords.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchModalOpen(false);
                    if (item.isExternal) {
                      window.open(item.href, "_blank");
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/40 transition-colors">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.type}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-slate-950/95 border-r border-slate-800/90 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl ${
          openState ? "w-64" : "w-[68px]"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <Link href={isOwnerMode ? "/owner" : "/"} className="flex items-center gap-3 overflow-hidden">
            <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md ${
              isOwnerMode
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
            }`}>
              {isOwnerMode ? <MapPin className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            {openState && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">LAND AI</span>
                  <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/30">
                    {isOwnerMode ? "Vault" : "इंडी-भूमि"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {isOwnerMode ? "Owner Intelligence Portal" : "Land Records & GIS"}
                </span>
              </div>
            )}
          </Link>

          {openState && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title={isExpanded ? "Collapse Sidebar" : "Pin Sidebar"}
            >
              {isExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Quick Search Button */}
        <div className="px-3 py-3">
          <button
            onClick={() => setSearchModalOpen(true)}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all group ${
              !openState ? "justify-center px-0" : ""
            }`}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-400" />
            {openState && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{isOwnerMode ? "Search My Land..." : "Quick Search..."}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-400">⌘K</kbd>
              </div>
            )}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? isOwnerMode
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent"
                } ${!openState ? "justify-center px-0" : ""}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${
                  isActive
                    ? isOwnerMode ? "text-emerald-400" : "text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-200"
                }`} />

                {openState && (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({item.labelIndic})</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        item.badge === "AI"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Portal Switcher & User Profile */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          
          {/* Switch Portal Quick Link */}
          {openState && (
            <div className="px-2 py-1">
              <Link
                href={isOwnerMode ? "/dashboard" : "/owner"}
                className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 transition-colors"
              >
                <span>{isOwnerMode ? "🏛️ Switch to Govt Command" : "👤 Switch to Owner Vault"}</span>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </Link>
            </div>
          )}

          {/* User Profile Pill */}
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80 ${
            !openState ? "justify-center p-2" : ""
          }`}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center text-white shrink-0">
              <User className="h-4 w-4" />
            </div>

            {openState && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.full_name || "Nishu Kumar"}
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  {isOwnerMode ? (
                    <span className="text-emerald-400 font-medium">Land Owner</span>
                  ) : (
                    <span className="text-indigo-400 font-medium">Revenue Officer</span>
                  )}
                </div>
              </div>
            )}

            {openState && (
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
