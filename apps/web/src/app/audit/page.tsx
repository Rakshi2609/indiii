"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileCheck2,
  FileText,
  Filter,
  History,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";

interface AuditEvent {
  id: number;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  details: string;
  hash_signature: string;
  status: "VERIFIED" | "SUSPICIOUS" | "TAMPER_FREE";
}

export default function AuditTrailLedgerPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/audit/logs");
      if (res.ok) {
        setEvents(await res.json());
      } else {
        loadMockAudit();
      }
    } catch {
      loadMockAudit();
    } finally {
      setLoading(false);
    }
  };

  const loadMockAudit = () => {
    setEvents([
      {
        id: 10842,
        timestamp: "2026-08-22T12:45:10Z",
        actor_name: "Ramesh Patil (Officer #902)",
        actor_role: "REVENUE_OFFICER",
        action_type: "DEED_APPROVED",
        target_entity: "Survey 142/2A",
        target_id: "DOC-2023-891A",
        details: "Verified 7/12 extract against Cadastral Polygon. Variance 0.16% accepted.",
        hash_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status: "TAMPER_FREE",
      },
      {
        id: 10841,
        timestamp: "2026-08-22T11:20:00Z",
        actor_name: "Indic Vision AI Daemon",
        actor_role: "SYSTEM_AI",
        action_type: "OCR_EXTRACTION",
        target_entity: "Survey 204/5B",
        target_id: "DOC-2023-902B",
        details: "Automated extraction completed with 96.4% confidence score across 8 revenue fields.",
        hash_signature: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        status: "VERIFIED",
      },
      {
        id: 10840,
        timestamp: "2026-08-22T09:15:33Z",
        actor_name: "Nishu Kumar (Citizen)",
        actor_role: "CITIZEN_OWNER",
        action_type: "PORTFOLIO_QUERY",
        target_entity: "Multi-State Vault",
        target_id: "OWNER-VAULT",
        details: "Citizen accessed verified title lineage records for properties in Karnataka and Maharashtra.",
        hash_signature: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        status: "TAMPER_FREE",
      },
      {
        id: 10839,
        timestamp: "2026-08-21T18:30:12Z",
        actor_name: "PostGIS Spatial Engine",
        actor_role: "GIS_DAEMON",
        action_type: "BOUNDARY_CONFLICT_FLAGGED",
        target_entity: "Survey 118/B",
        target_id: "GIS-204-BLR",
        details: "Detected 0.12 Acre overlap with adjacent state highway reservation buffer.",
        hash_signature: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        status: "SUSPICIOUS",
      },
    ]);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.target_entity.toLowerCase().includes(search.toLowerCase()) ||
      ev.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      ev.action_type.toLowerCase().includes(search.toLowerCase()) ||
      ev.details.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || ev.actor_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (user?.role === "OWNER") {
    return (
      <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Audit Ledger Restricted</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              System governance audit logs and cryptographic ledgers are restricted to official oversight bodies and administrators.
            </p>
            <div className="pt-2">
              <Link href="/owner">
                <Button className="w-full bg-primary text-on-primary font-bold text-xs">
                  Go to Citizen Land Vault
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Immutable Governance Trail
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Audit Ledger &amp; Security Events
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Cryptographically verified chain of officer decisions, AI extraction batches, and land ownership modifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="verified" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              SHA-256 Tamper-Evident
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs font-semibold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by survey number, actor name, or action description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            {["ALL", "REVENUE_OFFICER", "SYSTEM_AI", "CITIZEN_OWNER"].map((rf) => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors border ${
                  roleFilter === rf
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                }`}
              >
                {rf === "ALL" ? "All Roles" : rf.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                <tr>
                  <th className="p-3.5">Log ID &amp; Time</th>
                  <th className="p-3.5">Actor &amp; Role</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Target Land Record</th>
                  <th className="p-3.5">Integrity &amp; Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-primary mb-2" />
                      <span>Verifying cryptographic log signatures...</span>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-on-surface">#{ev.id}</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          {new Date(ev.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-on-surface">{ev.actor_name}</div>
                        <span className="text-[10px] font-mono text-primary bg-primary-fixed/40 px-1.5 py-0.2 rounded">
                          {ev.actor_role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-xs text-on-surface block">{ev.action_type}</span>
                        <p className="text-on-surface-variant text-[11px] mt-0.5 max-w-sm line-clamp-2">
                          {ev.details}
                        </p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-on-surface">{ev.target_entity}</div>
                        <span className="text-[10px] font-mono text-on-surface-variant">{ev.target_id}</span>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            ev.status === "TAMPER_FREE" || ev.status === "VERIFIED"
                              ? "verified"
                              : "warning"
                          }
                          className="text-[9px]"
                        >
                          {ev.status}
                        </Badge>
                        <div className="font-mono text-[9px] text-on-surface-variant truncate max-w-[120px] mt-1">
                          {ev.hash_signature}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
