"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Compass,
  FileCheck2,
  FileText,
  FileUp,
  Globe,
  Home,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/", icon: Home },
    { name: "Upload Deed", href: "/upload", icon: FileUp, highlight: true },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Cadastral GIS", href: "/gis", icon: Compass },
    { name: "Verification Queue", href: "/verification", icon: FileCheck2 },
    { name: "Audit Trail", href: "/audit", icon: ShieldCheck },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Land AI
                </span>
                <Badge variant="verified" className="text-[10px] px-1.5 py-0 h-4 uppercase font-mono">
                  Indic AI
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5">
                इंडी-भूमि राजस्व इंटेलिजेंस
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm"
                      : item.highlight
                      ? "text-slate-200 hover:text-white hover:bg-slate-900 border border-emerald-900/40 bg-emerald-950/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : item.highlight ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-900 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>Revenue Officer</span>
            </div>

            <Link href="/upload">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 h-8">
                <FileUp className="w-3.5 h-3.5" />
                Upload Deed
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/upload">
              <Button size="sm" className="bg-emerald-600 text-white text-xs px-2.5 h-8">
                <FileUp className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium ${
                  active
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              API Docs
            </a>
            <span className="text-[11px] text-slate-500 font-mono">Role: Officer</span>
          </div>
        </div>
      )}
    </header>
  );
}
