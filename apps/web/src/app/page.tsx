import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Database, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ExternalLink,
  BarChart3,
  Compass,
  FileCheck2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const stack = [
    {
      name: "FastAPI Backend",
      desc: "High-performance Python backend with PostGIS, GeoAlchemy2 & Celery",
      status: "Ready",
      icon: Cpu,
    },
    {
      name: "Next.js 15 Web App",
      desc: "App Router, TypeScript, Tailwind CSS & Shadcn/UI primitives",
      status: "Ready",
      icon: Layers,
    },
    {
      name: "PostgreSQL 15 + PostGIS 3.3",
      desc: "Spatial cadastral boundary queries & 7/12 ledger storage",
      status: "Configured",
      icon: Database,
    },
    {
      name: "Sarvam Document AI & Vision",
      desc: "OCR, Indic language entity extraction, boundary validation & active learning",
      status: "Ready",
      icon: Sparkles,
    },
  ];

  const modules = [
    {
      title: "Document Upload & Processing",
      description: "Upload Satbara 7/12, RTC, or Jamabandi deeds with Sarvam & Mistral multi-model OCR.",
      tag: "AI Pipeline",
      href: "/upload",
      icon: Sparkles
    },
    {
      title: "Executive Analytics Dashboard",
      description: "Real-time KPIs, document throughput, digitization rates, and district-wise coverage metrics.",
      tag: "Analytics & Telemetry",
      href: "/dashboard",
      icon: BarChart3
    },
    {
      title: "Cadastral GIS Map Explorer",
      description: "Interactive vector survey boundary mapping, geodetic area computation, and spatial discrepancy checks.",
      tag: "GIS / PostGIS",
      href: "/gis",
      icon: Compass
    },
    {
      title: "Human Verification Workbench",
      description: "Side-by-side revenue deed inspection, active learning field corrections, and audit logging.",
      tag: "Verification & Audit",
      href: "/verification",
      icon: FileCheck2
    },
    {
      title: "Enterprise Audit Trail",
      description: "Tamper-evident logs of all deed alterations, officer sign-offs, and RBAC security events.",
      tag: "Compliance & RBAC",
      href: "/audit",
      icon: ShieldCheck
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Land AI Platform</h1>
              <Badge variant="verified" className="ml-2">Phase 10 Production Ready</Badge>
            </div>
            <p className="text-slate-400">
              Next-generation Land Record Intelligence, Cadastral GIS & Automated Title Verification Platform
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-semibold">
                <BarChart3 className="h-4 w-4" />
                Launch Dashboard
              </Button>
            </Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-200 gap-2">
                <FileText className="h-4 w-4" />
                FastAPI Docs
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Button>
            </a>
          </div>
        </header>

        {/* Action Modules */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-white">Platform Capabilities & Interfaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.title} className="bg-slate-900/70 border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between pb-2">
                      <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-slate-400 border-slate-800">{m.tag}</Badge>
                    </div>
                    <CardTitle className="text-lg text-white mt-2">{m.title}</CardTitle>
                    <CardDescription className="text-slate-400 pt-1 text-xs leading-relaxed">{m.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link href={m.href}>
                      <Button variant="secondary" className="w-full text-xs gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200">
                        Open Interface <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Stack Status Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-white">Monorepo Architecture & Backend Foundation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stack.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-emerald-400" />
                      <Badge variant="verified">{item.status}</Badge>
                    </div>
                    <CardTitle className="text-base text-white mt-2">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400 text-xs">{item.desc}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
