"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronRight,
  Compass,
  FileCheck2,
  FileText,
  Layers,
  MapPin,
  Menu,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  User,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isOwnerMode = user?.role === "OWNER" || pathname.startsWith("/owner");

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

  const quickSearchRecords = isOwnerMode
    ? [
        { title: "My Land Portfolio Overview", href: "/owner", type: "Portfolio" },
        { title: "All Verified Properties List", href: "/owner/properties", type: "Land Vault" },
        { title: "Chronological Title Lineage & History", href: "/owner/history", type: "History Timeline" },
        { title: "Original Uploaded Deeds & Documents", href: "/owner/documents", type: "Documents" },
        { title: "Personal Cadastral GIS Map", href: "/owner/gis", type: "GIS Map" },
        { title: "Ask Land AI Copilot (DB Grounded)", href: "/copilot", type: "AI Chatbot" },
      ]
    : [
        { title: "National / State / District Overview", href: "/dashboard", type: "Command Center" },
        { title: "Survey No. 142/2A • Wagholi, Pune (Maharashtra)", href: "/verification/1", type: "Cadastral Record" },
        { title: "Land Ownership Lineage Graph & Timeline", href: "/intelligence", type: "Lineage Graph" },
        { title: "Sale Deed • Guntur City, Andhra Pradesh (Telugu)", href: "/verification/4", type: "Deed Extract" },
        { title: "Cadastral GIS Conflict Map (Survey 142)", href: "/gis", type: "Spatial Map" },
        { title: "Upload New Multilingual Deed (OCR / Vision)", href: "/upload", type: "Document Action" },
        { title: "System Audit Logs & Security Events", href: "/audit", type: "Audit Log" },
        { title: "FastAPI Interactive Swagger Specs", href: "http://localhost:8000/docs", isExternal: true, type: "API Docs" },
      ];

  const filteredSearch = quickSearchRecords.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-[64px] bg-surface/95 border-b border-outline-variant backdrop-blur-md sticky top-0 right-0 z-30 flex items-center justify-between px-4 md:px-6 w-full shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-md transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            {isOwnerMode ? (
              <>
                <Link
                  href="/owner"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname === "/owner"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  Overview
                </Link>
                <Link
                  href="/owner/properties"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname.startsWith("/owner/properties")
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  My Land
                </Link>
                <Link
                  href="/owner/gis"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname === "/owner/gis"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  Cadastral GIS
                </Link>
                <Link
                  href="/owner/history"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname === "/owner/history"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  History Timeline
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname === "/dashboard"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  Command Center
                </Link>
                <Link
                  href="/verification"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname.startsWith("/verification")
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  Verification Queue
                </Link>
                <Link
                  href="/gis"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname === "/gis"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  Cadastral GIS
                </Link>
                <Link
                  href="/intelligence"
                  className={`py-2 transition-colors border-b-2 ${
                    pathname === "/intelligence"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  Lineage Graph
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Center Search Input */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4 items-center relative">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between bg-surface-container-high hover:bg-surface-container border border-outline-variant/60 rounded-full py-1.5 pl-9 pr-3 text-xs text-on-surface-variant transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 absolute left-3 text-on-surface-variant" />
              <span className="truncate">Search records, surveys, owners...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px] text-on-surface-variant border border-outline-variant font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="sm:hidden p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          <Link
            href="/copilot"
            className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high transition-colors relative"
            title="Ask Land AI Copilot"
          >
            <Sparkles className="h-4 w-4 text-[#4F46E5]" />
          </Link>

          <Link
            href={isOwnerMode ? "/owner/history" : "/audit"}
            className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high transition-colors relative"
            title={isOwnerMode ? "Ownership History" : "Notifications & Audit Events"}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
          </Link>

          {!isOwnerMode && (
            <>
              <div className="h-6 w-[1px] bg-outline-variant hidden sm:block" />
              <Link
                href="/owner"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm bg-primary text-on-primary hover:bg-primary/90"
              >
                <Shield className="h-3 w-3" />
                <span>View Citizen Vault</span>
              </Link>
            </>
          )}

          {/* User Avatar */}
          <Link
            href={isOwnerMode ? "/owner" : "/dashboard"}
            className="w-8 h-8 rounded-full bg-primary-container/20 border border-outline-variant overflow-hidden flex items-center justify-center text-primary font-bold text-xs hover:ring-2 ring-primary transition-all"
            title={user?.full_name || "Profile"}
          >
            {user?.full_name ? user.full_name.charAt(0) : "N"}
          </Link>
        </div>
      </header>

      {/* Global Command Palette Search Modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
              <Search className="h-4 w-4 text-primary shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search survey numbers, deeds, owners, or navigation..."
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container"
              >
                <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] text-on-surface-variant border border-outline-variant">
                  ESC
                </kbd>
              </button>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {isOwnerMode ? "Owner Vault Quick Access" : "Authoritative Cadastral Records & Actions"}
              </div>
              {filteredSearch.length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  No records match &ldquo;{searchQuery}&rdquo;.
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
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container text-xs text-on-surface transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-6 w-6 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate font-medium">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/60 shrink-0">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-outline-variant bg-surface-container-low text-[11px] text-on-surface-variant flex items-center justify-between">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-surface border border-outline-variant text-[9px]">ESC</kbd> to close</span>
              <span>LAND AI • इंडी-भूमि</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
