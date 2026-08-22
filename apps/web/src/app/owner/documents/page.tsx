"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocumentItem {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  status: string;
  linked_record_id?: number;
  linked_survey?: string;
  linked_village?: string;
  linked_state?: string;
  created_at: string;
}

export default function OwnerDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8000/api/owner/documents");
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      const data: DocumentItem[] = await res.json();
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load deed documents from database.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      d.original_name.toLowerCase().includes(s) ||
      (d.linked_survey && d.linked_survey.toLowerCase().includes(s)) ||
      (d.linked_village && d.linked_village.toLowerCase().includes(s)) ||
      (d.linked_state && d.linked_state.toLowerCase().includes(s))
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-6 max-w-6xl w-full mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Document Vault • दस्तावेज़
            </span>
            <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-[10px]">
              {documents.length} Digitized Deeds
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Original Deed Repository
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Secure digital vault containing your registered 7/12 Satbara, RTC Pahani, Sale Deeds, and Encumbrance Certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Search Deeds with Copilot</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by original filename, survey number, or state..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">Loading digital document vault...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Documents Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or upload a new revenue deed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 transition-all shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">
                        {doc.original_name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(doc.file_size / 1024)} KB • {doc.mime_type.split("/")[1]?.toUpperCase() || "PDF"}
                      </span>
                    </div>
                  </div>

                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] px-1.5 py-0">
                    {doc.status}
                  </Badge>
                </div>

                {/* Linked Record Details */}
                {doc.linked_survey && (
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Linked Survey:</span>
                      <strong className="text-white font-semibold">Survey {doc.linked_survey}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-300">{doc.linked_village}, {doc.linked_state}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                {doc.linked_record_id ? (
                  <Link
                    href={`/owner/properties/${doc.linked_record_id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 px-3 py-2 text-xs font-semibold text-indigo-300 transition-colors"
                  >
                    <span>View Property</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : null}

                <Link
                  href={`/verification/${doc.linked_record_id || 1}`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors"
                  title="Open in Human Verification Workbench"
                >
                  <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verify</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
