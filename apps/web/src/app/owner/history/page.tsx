"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  GitFork,
  History,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

interface HistoryEvent {
  id: string;
  record_id: number;
  property_title: string;
  survey_number: string;
  village: string;
  state: string;
  event_year?: number;
  event_date?: string;
  event_type: string;
  title: string;
  description: string;
  mutation_number?: string;
  parties_involved?: string;
  supporting_document_id?: number;
  supporting_document_name?: string;
}

export default function OwnerHistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8000/api/owner/history");
      if (res.ok) {
        const data: HistoryEvent[] = await res.json();
        setEvents(data);
      } else {
        loadMockHistory();
      }
    } catch {
      loadMockHistory();
    } finally {
      setLoading(false);
    }
  };

  const loadMockHistory = () => {
    setEvents([
      {
        id: "evt-1",
        record_id: 1,
        property_title: "Survey 204/5B • Medavakkam",
        survey_number: "204/5B",
        village: "Medavakkam",
        state: "Tamil Nadu",
        event_year: 2018,
        event_date: "14 Oct 2018",
        event_type: "MUTATION_INHERITANCE",
        title: "Succession & Legal Heir Transfer",
        description: "Inheritance transfer executed under Patta No. 14892 from father to legal heirs with certified mutation order.",
        mutation_number: "M-4512",
        parties_involved: "Patil Family Estate → Nishu Kumar",
        supporting_document_name: "Patta_Extract_14892.pdf",
      },
      {
        id: "evt-2",
        record_id: 2,
        property_title: "Survey 18/2 • Whitefield",
        survey_number: "18/2",
        village: "Whitefield",
        state: "Karnataka",
        event_year: 2015,
        event_date: "22 May 2015",
        event_type: "SALE_DEED",
        title: "Registered Absolute Sale Deed",
        description: "Absolute conveyance and registered title deed executed at Sub-Registrar Office, KR Puram, Bangalore.",
        mutation_number: "REG-2015-8832",
        parties_involved: "G. Venkatesh → Nishu Kumar",
        supporting_document_name: "Sale_Deed_Whitefield_8832.pdf",
      },
      {
        id: "evt-3",
        record_id: 3,
        property_title: "Survey 45/A • Hinjawadi",
        survey_number: "45/A",
        village: "Hinjawadi",
        state: "Maharashtra",
        event_year: 2019,
        event_date: "05 Nov 2019",
        event_type: "PARTITION_DEED",
        title: "Ancestral Co-Sharer Partition",
        description: "Registered family partition deed partitioning 0.15 Acres of residential land in Haveli revenue sub-division.",
        mutation_number: "FERFAR-6201",
        parties_involved: "Shri. Ramesh S. Patil & Co-sharers",
        supporting_document_name: "7_12_Satbara_Hinjawadi.pdf",
      },
    ]);
  };

  const states = ["all", "Karnataka", "Telangana", "Maharashtra", "Tamil Nadu", "Rajasthan"];

  const filteredEvents = events.filter((ev) => {
    if (selectedState !== "all" && ev.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      const text = `${ev.property_title} ${ev.title} ${ev.description} ${ev.parties_involved || ""} ${ev.mutation_number || ""}`.toLowerCase();
      return text.includes(s);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Lineage &amp; Succession • वंशावली
              </span>
              <Badge variant="outline" className="text-[10px]">
                Chronological Ledger
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Ownership History &amp; Title Lineage
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Verified chronological timeline of all acquisitions, partitions, inheritance transfers, and mutation orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/intelligence">
              <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold gap-1.5 shadow-sm">
                <GitFork className="w-3.5 h-3.5" />
                <span>Interactive Lineage Graph</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by deed title, party name, or mutation number..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedState === st
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                }`}
              >
                {st === "all" ? "All States" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs text-on-surface-variant font-medium">Loading title lineage history...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-12 text-center space-y-2">
            <History className="w-8 h-8 text-on-surface-variant mx-auto" />
            <h3 className="text-base font-bold text-on-surface">No Historical Events Found</h3>
            <p className="text-xs text-on-surface-variant">Try selecting &ldquo;All States&rdquo;.</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-outline-variant space-y-6 my-4">
            {filteredEvents.map((evt, idx) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface border-2 border-primary text-primary font-bold text-[10px] shadow-sm">
                  {idx + 1}
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-surface border border-outline-variant shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">{evt.title}</span>
                        {evt.event_year && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {evt.event_year}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-on-surface-variant block mt-0.5">
                        {evt.property_title} ({evt.state})
                      </span>
                    </div>

                    <Badge variant="verified" className="text-[10px]">
                      {evt.event_type}
                    </Badge>
                  </div>

                  <p className="text-xs text-on-surface leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
                    {evt.parties_involved && (
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-semibold">Parties</span>
                        <strong className="text-on-surface">{evt.parties_involved}</strong>
                      </div>
                    )}
                    {evt.mutation_number && (
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-semibold">Mutation / Reg No</span>
                        <strong className="text-primary font-mono">{evt.mutation_number}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60 text-xs">
                    <Link
                      href={`/owner/properties/${evt.record_id}`}
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Property Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
