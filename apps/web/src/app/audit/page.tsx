"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  History,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditLogItem {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  ip_address: string | null;
  timestamp: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<string>("ADMIN");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.items || []);
      } else {
        loadMockAuditLogs();
      }
    } catch {
      loadMockAuditLogs();
    } finally {
      setLoading(false);
    }
  };

  const loadMockAuditLogs = () => {
    const mock: AuditLogItem[] = [
      {
        id: 101,
        user_id: 1,
        user_name: "Vikram Deshmukh",
        user_email: "v.deshmukh@revenue.gov.in",
        user_role: "VERIFICATION_OFFICER",
        action: "RECORD_CORRECT",
        resource_type: "RECORD",
        resource_id: "142",
        old_value: { survey_number: "142", total_area: 1.50, validation_status: "FLAGGED_FOR_REVIEW" },
        new_value: { survey_number: "142/2A", total_area: 1.50, validation_status: "VERIFIED_CORRECTED" },
        ip_address: "192.168.1.45",
        timestamp: new Date().toISOString()
      },
      {
        id: 102,
        user_id: 2,
        user_name: "Anita Kulkarni",
        user_email: "a.kulkarni@revenue.gov.in",
        user_role: "LAND_OFFICER",
        action: "DOCUMENT_UPLOAD",
        resource_type: "DOCUMENT",
        resource_id: "105",
        old_value: null,
        new_value: { filename: "satbara_wagholi_142.pdf", size: 245800, mime_type: "application/pdf" },
        ip_address: "192.168.1.12",
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 103,
        user_id: 3,
        user_name: "Rajesh Shinde",
        user_email: "r.shinde@revenue.gov.in",
        user_role: "VERIFICATION_OFFICER",
        action: "RECORD_APPROVE",
        resource_type: "RECORD",
        resource_id: "88",
        old_value: { validation_status: "VERIFIED_WITH_WARNINGS" },
        new_value: { validation_status: "VERIFIED_MANUAL", notes: "Khatadar succession certified" },
        ip_address: "192.168.1.88",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 104,
        user_id: 1,
        user_name: "Vikram Deshmukh",
        user_email: "v.deshmukh@revenue.gov.in",
        user_role: "VERIFICATION_OFFICER",
        action: "RECORD_REJECT",
        resource_type: "RECORD",
        resource_id: "204",
        old_value: { validation_status: "REJECTED_CRITICAL" },
        new_value: { validation_status: "REJECTED_MANUAL", rejection_reason: "Illegal encroachment on canal boundary" },
        ip_address: "192.168.1.45",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setLogs(mock);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.resource_id && l.resource_id.includes(searchQuery)) ||
      (l.user_name && l.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.ip_address && l.ip_address.includes(searchQuery));

    return matchesAction && matchesSearch;
  });

  const isAuthorized = currentRole === "ADMIN" || currentRole === "MANAGER";

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVE")) return <Badge variant="verified">APPROVED</Badge>;
    if (action.includes("CORRECT")) return <Badge className="bg-indigo-950 border-indigo-700 text-indigo-300">CORRECTED</Badge>;
    if (action.includes("REJECT") || action.includes("DELETE")) return <Badge variant="destructive">{action}</Badge>;
    if (action.includes("UPLOAD")) return <Badge variant="secondary" className="bg-blue-950 border-blue-800 text-blue-300">UPLOAD</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with RBAC Simulator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                Security, Compliance & Active Learning
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Enterprise System Audit Trail
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Tamper-evident logs of all revenue deed uploads, officer verifications, active learning diffs, and security events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* RBAC Role Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Active Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="bg-slate-950 text-emerald-400 font-bold border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ADMIN">ADMIN (Superuser)</option>
                <option value="MANAGER">MANAGER (Full Access)</option>
                <option value="VERIFICATION_OFFICER">VERIFICATION_OFFICER</option>
                <option value="LAND_OFFICER">LAND_OFFICER</option>
                <option value="GIS_OFFICER">GIS_OFFICER</option>
                <option value="VIEWER">VIEWER (Read Only)</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/dashboard">
              <Button size="sm" variant="secondary" className="text-xs">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* RBAC Access Denied Fallback */}
        {!isAuthorized ? (
          <Card className="bg-red-950/20 border-red-900/60 p-8 text-center max-w-2xl mx-auto shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">403 Forbidden: Restricted Interface</h2>
              <p className="text-xs text-red-200/80 mt-1.5 max-w-md mx-auto">
                The Enterprise Audit Trail contains sensitive statutory records and active learning diffs. Your current role (<strong>{currentRole}</strong>) does not have permission to view this log.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                size="sm"
                onClick={() => setCurrentRole("ADMIN")}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Switch to ADMIN Role
              </Button>
              <Link href="/verification">
                <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300">
                  Go to Verification Queue
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Action, Resource ID, Officer Name, or IP Address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {["ALL", "RECORD_APPROVE", "RECORD_CORRECT", "DOCUMENT_UPLOAD"].map((act) => (
                  <Button
                    key={act}
                    size="sm"
                    variant={actionFilter === act ? "default" : "outline"}
                    onClick={() => setActionFilter(act)}
                    className={`flex-1 text-[11px] px-2 ${
                      actionFilter === act
                        ? "bg-emerald-600 text-white"
                        : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {act.replace("RECORD_", "").replace("DOCUMENT_", "")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Audit Log Data Table */}
            <Card className="bg-slate-900/60 border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Timestamp (UTC)</th>
                      <th className="p-3.5">Officer / User</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Resource</th>
                      <th className="p-3.5">Client IP</th>
                      <th className="p-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          <p>No audit events match your criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        return (
                          <React.Fragment key={log.id}>
                            <tr
                              className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                                isExpanded ? "bg-slate-800/60" : ""
                              }`}
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            >
                              <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  {new Date(log.timestamp).toLocaleString()}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-semibold text-white">{log.user_name || "System Automated"}</div>
                                <div className="text-[10px] text-slate-400">{log.user_role || "ENGINE"}</div>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                {getActionBadge(log.action)}
                              </td>

                              <td className="p-3.5 font-mono text-slate-300">
                                <span className="text-slate-400">{log.resource_type}:</span> #{log.resource_id || "—"}
                              </td>

                              <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                                {log.ip_address || "127.0.0.1"}
                              </td>

                              <td className="p-3.5 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-slate-400 hover:text-white"
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </Button>
                              </td>
                            </tr>

                            {/* Expandable Diff Panel */}
                            {isExpanded && (
                              <tr className="bg-slate-950/90 border-b border-slate-800">
                                <td colSpan={6} className="p-4 space-y-3">
                                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    State Mutation Diff & Active Learning Payload
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                                    {/* Old Values */}
                                    <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                      <span className="text-red-400 block font-sans text-[11px] font-bold mb-1">
                                        [PRE-MUTATION STATE]
                                      </span>
                                      <pre className="text-slate-300 whitespace-pre-wrap text-[11px]">
                                        {log.old_value ? JSON.stringify(log.old_value, null, 2) : "None (New Resource Created)"}
                                      </pre>
                                    </div>

                                    {/* New / Corrected Values */}
                                    <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                      <span className="text-emerald-400 block font-sans text-[11px] font-bold mb-1">
                                        [OFFICER VERIFIED / APPLIED STATE]
                                      </span>
                                      <pre className="text-slate-300 whitespace-pre-wrap text-[11px]">
                                        {log.new_value ? JSON.stringify(log.new_value, null, 2) : "None"}
                                      </pre>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
