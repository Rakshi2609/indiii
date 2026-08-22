"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Compass,
  Database,
  FileCheck2,
  FileText,
  GitFork,
  History,
  Languages,
  Layers,
  MapPin,
  Play,
  RotateCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingHomePage() {
  const [activeTab, setActiveTab] = useState<"compare" | "vision" | "audit">("compare");

  const painPoints = [
    {
      icon: FileText,
      title: "Paper Records",
      desc: "Fragile, degrading physical documents scattered across thousands of legacy registrar and tehsil offices.",
      accent: "error"
    },
    {
      icon: Sparkles,
      title: "Multiple Languages",
      desc: "Deeds inscribed in various regional Indic scripts (Telugu, Marathi, Hindi, Tamil, Kannada) requiring specialized translation.",
      accent: "primary"
    },
    {
      icon: History,
      title: "Legacy Terminology",
      desc: "Archaic revenue, legal, and pot-kharaba measurement units that don't map directly to modern metric standards.",
      accent: "primary"
    },
    {
      icon: Users,
      title: "Ownership Ambiguity",
      desc: "Unclear historical lineage, joint co-sharer inheritance conflicts, and unrecorded familial title transfers.",
      accent: "error"
    },
    {
      icon: Compass,
      title: "Spatial Discrepancies",
      desc: "Textual area extents on paper deeds that contradict physical cadastral satellite boundaries on ground.",
      accent: "error"
    },
    {
      icon: GitFork,
      title: "Mutation Complexity",
      desc: "Fragmented histories of land division, road acquisitions, and succession without a single unified immutable ledger.",
      accent: "primary"
    },
  ];

  const solutions = [
    {
      title: "Autonomous Indic Document AI",
      tag: "Multilingual OCR",
      desc: "Extracts revenue entities, survey numbers, khata details, and encumbrances across 12+ Indic languages with high-confidence bounding box explainability.",
      icon: Sparkles,
      route: "/upload"
    },
    {
      title: "Cadastral GIS Verification",
      tag: "Spatial Alignment",
      desc: "Validates deed area measurements against WGS-84 cadastral vector polygons in real-time, detecting encroachments and boundary variances.",
      icon: Compass,
      route: "/gis"
    },
    {
      title: "Title Lineage & Health Card",
      tag: "Deep Intelligence",
      desc: "Synthesizes multi-year property timelines, fraud risk indexes (0-100), and automated missing link detection before registration.",
      icon: GitFork,
      route: "/intelligence"
    },
    {
      title: "Grounded AI Land Copilot",
      tag: "Zero Hallucination",
      desc: "Conversational intelligence strictly grounded in state land databases and cadastral vectors for instantaneous citizen and officer queries.",
      icon: Bot,
      route: "/copilot"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased overflow-x-hidden font-sans selection:bg-primary-container/20">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-[64px] bg-surface/95 backdrop-blur-md border-b border-outline-variant z-50 flex items-center justify-between px-4 sm:px-8 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-base shadow-sm">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary tracking-tight leading-tight">LAND AI</span>
            <span className="text-[10px] font-semibold text-on-surface-variant leading-none">इंडी-भूमि</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold">
          <Link href="#solutions" className="text-on-surface-variant hover:text-primary transition-colors">
            Core Intelligence
          </Link>
          <Link href="#problem" className="text-on-surface-variant hover:text-primary transition-colors">
            Complexity Resolved
          </Link>
          <Link href="/audit" className="text-on-surface-variant hover:text-primary transition-colors">
            Audit Ledger
          </Link>
          <Link href="/copilot" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>AI Copilot</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold shadow-sm">
              Launch Portal
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[64px]">
        
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center bg-cadastral px-4 sm:px-8 md:px-12 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bright/90 via-surface/80 to-surface-container/50 pointer-events-none" />
          
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Hero Pitch */}
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 border border-primary/20 text-on-primary-fixed-variant text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Next-Gen Indic Land Record & Cadastral Verification</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight leading-[1.15]">
                From paper land records to <span className="text-surface-tint">verified land intelligence.</span>
              </h1>

              <p className="text-base text-on-surface-variant leading-relaxed max-w-xl">
                Understand multilingual Indian land records, verify them against high-resolution cadastral geometry, detect inconsistencies, and maintain an immutable, auditable chain of decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-on-primary text-xs font-bold gap-2 shadow-[0_4px_14px_0_rgba(0,59,27,0.3)] hover:bg-primary/90">
                    <span>Explore Land Intelligence</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/owner">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs font-semibold gap-2 border-outline-variant bg-surface hover:bg-surface-container-low">
                    <span>Citizen Land Vault</span>
                  </Button>
                </Link>
              </div>

              {/* Stat Points */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/60 text-xs">
                <div>
                  <span className="text-xl font-bold text-primary font-mono block">12+</span>
                  <span className="text-on-surface-variant text-[11px]">Indic Languages</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-primary font-mono block">&lt;0.5%</span>
                  <span className="text-on-surface-variant text-[11px]">Cadastral Variance</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-primary font-mono block">100%</span>
                  <span className="text-on-surface-variant text-[11px]">DB Grounded AI</span>
                </div>
              </div>
            </div>

            {/* Right Split Composition Visualization */}
            <div className="relative h-[520px] w-full hidden lg:flex items-center justify-center">
              <div className="relative w-full h-[480px] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden bg-surface flex border border-outline-variant">
                
                {/* Left Half: Paper Record */}
                <div className="w-1/2 h-full bg-[#F4F1EA] border-r border-outline-variant p-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3 opacity-70">
                    <div className="h-6 w-3/4 bg-on-surface-variant/20 rounded" />
                    <div className="h-3 w-full bg-on-surface-variant/20 rounded" />
                    <div className="h-3 w-5/6 bg-on-surface-variant/20 rounded" />
                    <div className="h-3 w-full bg-on-surface-variant/20 rounded" />
                    <div className="h-28 w-full border-2 border-on-surface-variant/20 border-dashed rounded mt-4 p-2">
                      <span className="text-[10px] text-on-surface-variant/60 font-serif italic block">
                        गावनिहाय अधिकार पत्रक • नमुना ७/१२ • क्षेत्र १ हेक्टर ५० आर
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface px-3 py-1 rounded text-xs font-semibold shadow-sm text-on-surface-variant flex items-center gap-1.5 w-fit border border-outline-variant">
                    <FileText className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span>Unstructured Paper Scan</span>
                  </div>
                </div>

                {/* Right Half: Digital Intelligence */}
                <div className="w-1/2 h-full bg-surface-bright p-6 relative flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                        <span className="font-bold text-sm text-primary">Survey 142/2A</span>
                      </div>
                      <span className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] px-2 py-0.5 rounded text-[10px] font-bold">
                        VERIFIED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/60">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase">OWNER</div>
                        <div className="font-semibold text-on-surface truncate">Ramesh S. Patil</div>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/60">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase">AREA EXTENT</div>
                        <div className="font-semibold text-on-surface font-mono">1.50 Ha</div>
                      </div>
                    </div>

                    {/* Cadastral Polygon Mock */}
                    <div className="h-32 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-on-surface-variant font-medium">PostGIS Cadastre</span>
                        <span className="text-[#15803D] font-bold font-mono">0.16% Var (OK)</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="w-16 h-16 rounded border-2 border-primary bg-primary-fixed/30 flex items-center justify-center transform rotate-6 shadow-sm">
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-container px-3 py-1 rounded text-xs font-semibold shadow-sm text-on-primary-container flex items-center gap-1.5 w-fit">
                    <Database className="w-3.5 h-3.5 text-on-primary-container" />
                    <span>Structured Intelligence</span>
                  </div>
                </div>

                {/* Scanning Center Divider with Pulsing Icon */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-surface-tint shadow-[0_0_12px_rgba(46,106,65,0.8)] z-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-surface-tint bg-surface flex items-center justify-center shadow-md">
                    <RotateCw className="w-4 h-4 text-surface-tint animate-spin" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section id="problem" className="py-20 bg-surface-container-low px-4 sm:px-8 md:px-12 border-y border-outline-variant/60">
          <div className="container mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-bold text-surface-tint tracking-widest">
                The Revenue Reality
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                The Complexity of Land Administration
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Traditional paper deeds are fragmented, archaic, and difficult to verify, leading to title disputes, judicial backlogs, and transaction delays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {painPoints.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-surface p-6 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] hover:shadow-[0_8px_24px_rgba(23,32,27,0.08)] transition-all"
                  >
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${
                        item.accent === "error"
                          ? "bg-error-container/40 text-error"
                          : "bg-surface-container-highest text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-on-surface mb-2">{item.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section id="solutions" className="py-20 px-4 sm:px-8 md:px-12">
          <div className="container mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-bold text-surface-tint tracking-widest">
                Our Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Autonomous Land Intelligence Platform
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Complete toolchain for government revenue departments, village administrative officers, and citizen landholders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutions.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] text-on-surface-variant">
                          {s.tag}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-outline-variant/60">
                      <Link
                        href={s.route}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-surface-tint transition-colors"
                      >
                        <span>Open Interface</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-inverse-surface text-inverse-on-surface py-12 px-4 sm:px-8 md:px-12 border-t border-outline-variant">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-outline-variant/30 pb-8">
            <div className="col-span-1 md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center text-white font-bold text-xs">
                  L
                </div>
                <span className="font-bold text-base text-white">LAND AI | इंडी-भूमि</span>
              </div>
              <p className="text-xs text-secondary-fixed-dim max-w-sm leading-relaxed">
                Building the verified digital infrastructure for Indian land revenue administration. Secure, intelligent, and auditable.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-white">Interfaces</h4>
              <ul className="space-y-2 text-xs text-secondary-fixed-dim">
                <li><Link href="/dashboard" className="hover:text-inverse-primary transition-colors">Government Command</Link></li>
                <li><Link href="/owner" className="hover:text-inverse-primary transition-colors">Citizen Land Vault</Link></li>
                <li><Link href="/verification" className="hover:text-inverse-primary transition-colors">Verification Workbench</Link></li>
                <li><Link href="/gis" className="hover:text-inverse-primary transition-colors">Cadastral GIS Map</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-white">System &amp; API</h4>
              <ul className="space-y-2 text-xs text-secondary-fixed-dim">
                <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-inverse-primary transition-colors">FastAPI Swagger Specs</a></li>
                <li><Link href="/audit" className="hover:text-inverse-primary transition-colors">Security Audit Ledger</Link></li>
                <li><Link href="/copilot" className="hover:text-inverse-primary transition-colors">Land AI Copilot</Link></li>
              </ul>
            </div>
          </div>

          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary-fixed-dim">
            <p>© 2026 LAND AI (इंडी-भूमि) • Smart India Hackathon</p>
            <div className="flex items-center gap-2 bg-inverse-surface/80 border border-outline-variant/30 px-3 py-1 rounded">
              <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-400">Made for Digital India</span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
