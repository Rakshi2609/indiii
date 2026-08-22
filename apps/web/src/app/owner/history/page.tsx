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
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data: HistoryEvent[] = await res.json();
      setEvents(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load ownership lineage from database.");
    } finally {
      setLoading(false);
    }
  };

  const states = ["all", "Karnataka", "Telangana", "Maharashtra", "Andhra Pradesh", "Tamil Nadu"];

  const filteredEvents = events.filter((ev) => {
    if (selectedState !== "all" && ev.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      const text = `${ev.property_title} ${ev.title} ${ev.description} ${ev.parties_involved || ''} ${ev.mutation_number || ''}`.toLowerCase();
      return text.includes(s);
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-6 max-w-5xl w-full mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Lineage &amp; Succession • वंशावली
            </span>
            <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px]">
              Chronological Ledger
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Ownership &amp; Title History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official chronological record of mutations, inheritance successions, mortgage charges, and registered titles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ask Lineage Copilot</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mutations, party names, survey numbers..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {states.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedState === st
                  ? "bg-purple-600 text-white font-semibold"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {st === "all" ? "All States" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-xs text-slate-400 font-medium">Assembling chronological title lineage...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <History className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Historical Events Matched</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or selecting &ldquo;All States&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-6 pl-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
          {filteredEvents.map((event, idx) => (
            <div key={event.id || idx} className="flex items-start gap-4 relative">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-slate-950 shrink-0 mt-1 ${
                event.event_type === "VERIFIED_RECORD"
                  ? "bg-emerald-500 text-white"
                  : event.event_type === "MORTGAGE_LIEN"
                  ? "bg-purple-500 text-white"
                  : "bg-indigo-500 text-white"
              }`}>
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>

              <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{event.property_title}</span>
                      <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-950 text-slate-300">
                        {event.state}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-purple-300 mt-0.5">{event.title}</h4>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">
                    {event.event_date || (event.event_year ? `Year ${event.event_year}` : "Recorded")}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.description}
                </p>

                {event.parties_involved && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-slate-500">Recorded Parties:</strong> {event.parties_involved}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  {event.mutation_number ? (
                    <Badge variant="outline" className="text-[10px] border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                      Mutation Order #{event.mutation_number}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-slate-500">Official Register Entry</span>
                  )}

                  <Link
                    href={`/owner/properties/${event.record_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View Property Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
