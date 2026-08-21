import { 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Database, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ExternalLink 
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
      name: "Redis 7 & Celery Workers",
      desc: "Asynchronous OCR, title chain reconstruction & dispute detection queues",
      status: "Configured",
      icon: ShieldCheck,
    },
  ];

  const modules = [
    {
      title: "7/12 & RoR OCR Intelligence",
      description: "Automated extraction and validation of Survey/Khasra numbers, land tenures, and ownership mutations.",
      tag: "OCR / NLP"
    },
    {
      title: "Cadastral GIS Verification",
      description: "Overlays boundary geometries against land registry shapes to detect spatial encroaches and sub-division errors.",
      tag: "GIS / PostGIS"
    },
    {
      title: "Title Chain Reconstruction",
      description: "Chronological verification of deeds across 30+ years, flagging missing link documents and disputed inheritances.",
      tag: "Dispute Detection"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Land AI Platform</h1>
              <Badge variant="default" className="ml-2">Phase 1 Initialized</Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Next-generation Land Record Intelligence, Cadastral GIS & Automated Title Verification Platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="http://localhost:8000/api/v1/docs" target="_blank" rel="noreferrer">
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                API Documentation
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Button>
            </a>
            <Button className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              System Healthy
            </Button>
          </div>
        </header>

        {/* Stack Status Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Monorepo Architecture & Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stack.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <Badge variant="secondary">{item.status}</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Core Domain Modules */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Core Domain Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((m) => (
              <Card key={m.title} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between pb-2">
                    <Badge variant="outline">{m.tag}</Badge>
                  </div>
                  <CardTitle className="text-lg">{m.title}</CardTitle>
                  <CardDescription className="pt-2">{m.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
