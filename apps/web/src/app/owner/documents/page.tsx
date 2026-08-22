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
import { Topbar } from "@/components/Topbar";

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
      if (res.ok) {
        const data: DocumentItem[] = await res.json();
        setDocuments(data);
      } else {
        loadMockDocuments();
      }
    } catch {
      loadMockDocuments();
    } finally {
      setLoading(false);
    }
  };

  const loadMockDocuments = () => {
    setDocuments([
      {
        id: 101,
        filename: "satbara_wagholi_142.pdf",
        original_name: "Satbara_7_12_Extract_Wagholi_Pune.pdf",
        file_size: 420000,
        mime_type: "application/pdf",
        status: "VERIFIED",
        linked_record_id: 1,
        linked_survey: "142/2A",
        linked_village: "Wagholi",
        linked_state: "Maharashtra",
        created_at: "2026-08-20T10:00:00Z",
      },
      {
        id: 102,
        filename: "patta_chennai_204.pdf",
        original_name: "Patta_Chitta_Medavakkam_14892.pdf",
        file_size: 680000,
        mime_type: "application/pdf",
        status: "FLAGGED",
        linked_record_id: 1,
        linked_survey: "204/5B",
        linked_village: "Medavakkam",
        linked_state: "Tamil Nadu",
        created_at: "2026-08-18T14:30:00Z",
      },
      {
        id: 103,
        filename: "sale_deed_whitefield.pdf",
        original_name: "Registered_Conveyance_Sale_Deed_8832.pdf",
        file_size: 1200000,
        mime_type: "application/pdf",
        status: "VERIFIED",
        linked_record_id: 2,
        linked_survey: "18/2",
        linked_village: "Whitefield",
        linked_state: "Karnataka",
        created_at: "2026-08-15T09:15:00Z",
      },
    ]);
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
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Document Vault • दस्तावेज़
              </span>
              <Badge variant="outline" className="text-[10px]">
                {documents.length} Digitized Deeds
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Original Deed Repository
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Secure digital vault containing your registered 7/12 Satbara, RTC Pahani, Sale Deeds, and Encumbrance Certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/copilot">
              <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Search Deeds with Copilot</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-surface p-3.5 rounded-xl border border-outline-variant shadow-sm relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by deed name, survey number, village, or state..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs text-on-surface-variant font-medium">Loading documents from vault...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-on-surface-variant mx-auto" />
            <h3 className="text-base font-bold text-on-surface">No Documents Found</h3>
            <p className="text-xs text-on-surface-variant">Try adjusting your active search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface rounded-xl border border-outline-variant p-5 flex flex-col justify-between shadow-[0_2px_4px_rgba(23,32,27,0.04)] hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-on-surface truncate">{doc.original_name}</h3>
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          {(doc.file_size / 1024).toFixed(0)} KB • {doc.mime_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {doc.linked_survey && (
                    <div className="rounded-lg bg-surface-container-low border border-outline-variant p-2.5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Linked Land:</span>
                        <strong className="text-on-surface font-mono">Survey {doc.linked_survey}</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant">Location:</span>
                        <span className="text-on-surface truncate">{doc.linked_village}, {doc.linked_state}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between mt-4">
                  {doc.linked_record_id ? (
                    <Link
                      href={`/owner/properties/${doc.linked_record_id}`}
                      className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                    >
                      <span>View Linked Property</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-on-surface-variant">Vault Ingested</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
