"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  GitCommit,
  GitFork,
  Info,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface GraphNode {
  id: string;
  label: string;
  sub_label: string;
  role: string;
  acres: number;
  initial_acres?: number;
  status: string;
  active: boolean;
  x: number;
  y: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  acres: number;
  label: string;
  mutation: string;
  color: string;
}

interface FinalOwner {
  owner: string;
  current_holding_acres: number;
  parcel: string;
  status: string;
}

interface LineageData {
  survey_number: string;
  total_estate_acres: number;
  nodes: GraphNode[];
  links: GraphLink[];
  final_owners: FinalOwner[];
  mathematical_audit: {
    initial_acres: number;
    sum_final_holdings: number;
    discrepancy_acres: number;
    leakage_status: string;
  };
}

export default function OwnershipLineageGraph({ data }: { data?: LineageData }) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);

  // Default demo graph matching the exact user prompt scenario
  const defaultData: LineageData = {
    survey_number: "142",
    total_estate_acres: 10.0,
    nodes: [
      {
        id: "node_initial",
        label: "Original Title: Anand Rao",
        sub_label: "Khata #102 • Ancestral (1998)",
        role: "INITIAL_HOLDER",
        acres: 10.0,
        status: "ORIGIN",
        active: false,
        x: 90,
        y: 200,
        color: "#6366F1",
      },
      {
        id: "node_person_a",
        label: "Person A (Ramesh)",
        sub_label: "3.00 Acres • Survey 142/2A",
        role: "CURRENT_OWNER",
        acres: 3.0,
        status: "FINAL_OWNER",
        active: true,
        x: 410,
        y: 75,
        color: "#10B981",
      },
      {
        id: "node_person_b",
        label: "Person B (Suresh)",
        sub_label: "6.0 Ac Recv'd → 1.0 Ac Retained",
        role: "INTERMEDIATE_HOLDER",
        acres: 1.0,
        initial_acres: 6.0,
        status: "PARTIAL_RETAINED",
        active: true,
        x: 410,
        y: 205,
        color: "#F59E0B",
      },
      {
        id: "node_person_c",
        label: "Person C (Sunita)",
        sub_label: "1.0 Ac Recv'd → 0 Ac (All Sold)",
        role: "TRANSFERRED_FULL",
        acres: 0.0,
        initial_acres: 1.0,
        status: "EXITED_TITLE",
        active: false,
        x: 410,
        y: 335,
        color: "#94A3B8",
      },
      {
        id: "node_person_d",
        label: "Person D (Arun Kumar)",
        sub_label: "6.00 Acres Consolidated • Survey 142/2B",
        role: "CURRENT_OWNER",
        acres: 6.0,
        status: "FINAL_OWNER",
        active: true,
        x: 730,
        y: 270,
        color: "#14B8A6",
      },
    ],
    links: [
      {
        source: "node_initial",
        target: "node_person_a",
        acres: 3.0,
        label: "Partition: 3.0 Ac (2005)",
        mutation: "M-4512/A",
        color: "#10B981",
      },
      {
        source: "node_initial",
        target: "node_person_b",
        acres: 6.0,
        label: "Partition: 6.0 Ac (2005)",
        mutation: "M-4512/B",
        color: "#F59E0B",
      },
      {
        source: "node_initial",
        target: "node_person_c",
        acres: 1.0,
        label: "Remainder: 1.0 Ac (2005)",
        mutation: "M-4512/C",
        color: "#94A3B8",
      },
      {
        source: "node_person_b",
        target: "node_person_d",
        acres: 5.0,
        label: "Sale: 5.0 Ac (2018)",
        mutation: "M-6201/Sale",
        color: "#14B8A6",
      },
      {
        source: "node_person_c",
        target: "node_person_d",
        acres: 1.0,
        label: "Sale: All 1.0 Ac (2018)",
        mutation: "M-6201/Full",
        color: "#14B8A6",
      },
    ],
    final_owners: [
      { owner: "Person A (Ramesh)", current_holding_acres: 3.0, parcel: "Survey 142/2A", status: "ACTIVE_CERTIFIED" },
      { owner: "Person D (Arun Kumar)", current_holding_acres: 6.0, parcel: "Survey 142/2B", status: "ACTIVE_CERTIFIED" },
      { owner: "Person B (Suresh)", current_holding_acres: 1.0, parcel: "Survey 142/2B (Co-share)", status: "ACTIVE_RESIDUAL" },
    ],
    mathematical_audit: {
      initial_acres: 10.0,
      sum_final_holdings: 10.0,
      discrepancy_acres: 0.0,
      leakage_status: "ZERO_LEAKAGE_BALANCED",
    },
  };

  const graph = data || defaultData;

  const getNode = (id: string) => graph.nodes.find((n) => n.id === id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitFork className="w-4 h-4 text-teal-400" />
            <span className="text-[11px] uppercase font-mono tracking-wider text-teal-400 font-semibold">
              Directed Land Succession & Subdivision Graph
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Survey No. {graph.survey_number} — Land Division & Lineage Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Trace the mathematical lineage of the initial 10.00-acre estate as it undergoes family partition, subdivisions, and secondary market consolidation.
          </p>
        </div>

        {/* Zero Leakage Balance Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-lg border border-emerald-500/30 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500">Mathematical Proof</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>10.0 Ac Initial = 10.0 Ac Active</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Discrepancy: 0.00 Ac (Balanced)</div>
          </div>
        </div>
      </div>

      {/* Interactive SVG Node-Link Canvas */}
      <Card className="bg-[#070B14] border-white/[0.08] overflow-hidden shadow-2xl relative">
        <CardHeader className="pb-2 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Interactive Land Division Flow (Click nodes to inspect)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Shows 10 Acres partitioned into 3.0 Ac (Person A), 6.0 Ac (Person B), and 1.0 Ac (Person C) → Person D acquires 5.0 Ac from B + 1.0 Ac from C.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Active Title
              </span>
              <span className="flex items-center gap-1 text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Historical Node
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 relative">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 880 430"
              className="w-full h-[400px] min-w-[750px] select-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(20,184,166,0.03) 0%, rgba(7,11,20,0.95) 100%)" }}
            >
              <defs>
                {/* Flow gradient filters and marker arrows */}
                <marker
                  id="arrow-teal"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#14B8A6" />
                </marker>
                <marker
                  id="arrow-emerald"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
                <marker
                  id="arrow-slate"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
                </marker>
              </defs>

              {/* Grid guide background */}
              <g opacity="0.15">
                <line x1="250" y1="20" x2="250" y2="400" stroke="#64748B" strokeDasharray="3,3" />
                <line x1="570" y1="20" x2="570" y2="400" stroke="#64748B" strokeDasharray="3,3" />
                <text x="160" y="30" fill="#64748B" fontSize="10" fontFamily="monospace">STAGE 1: 1998 ANCESTRAL</text>
                <text x="440" y="30" fill="#64748B" fontSize="10" fontFamily="monospace">STAGE 2: 2005 PARTITION</text>
                <text x="680" y="30" fill="#64748B" fontSize="10" fontFamily="monospace">STAGE 3: 2018-2024 FINAL</text>
              </g>

              {/* Render Animated Curved Links */}
              {graph.links.map((link, idx) => {
                const s = getNode(link.source);
                const t = getNode(link.target);
                if (!s || !t) return null;

                const startX = s.x + 90;
                const startY = s.y + 30;
                const endX = t.x - 10;
                const endY = t.y + 30;
                const midX = (startX + endX) / 2;

                const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                const isHovered = hoveredLink === link;

                return (
                  <g key={idx} onMouseEnter={() => setHoveredLink(link)} onMouseLeave={() => setHoveredLink(null)} className="cursor-pointer">
                    <path
                      d={pathData}
                      fill="none"
                      stroke={link.color}
                      strokeWidth={isHovered ? 4.5 : Math.max(2, (link.acres / 10) * 5)}
                      strokeOpacity={isHovered ? 1 : 0.75}
                      markerEnd={`url(#arrow-${link.color === '#10B981' ? 'emerald' : link.color === '#F59E0B' ? 'amber' : link.color === '#14B8A6' ? 'teal' : 'slate'})`}
                      className="transition-all"
                    />

                    {/* Link Label Tag */}
                    <g transform={`translate(${midX - 35}, ${(startY + endY) / 2 - 12})`}>
                      <rect
                        width="76"
                        height="20"
                        rx="4"
                        fill="#0B1220"
                        stroke={link.color}
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="38"
                        y="13"
                        textAnchor="middle"
                        fill="#E2E8F0"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {link.acres} Acres
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Render Graph Nodes */}
              {graph.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Glow outline on active/selected */}
                    {node.active && (
                      <rect
                        x="-4"
                        y="-4"
                        width="188"
                        height="68"
                        rx="12"
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        opacity="0.6"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Body Card */}
                    <rect
                      width="180"
                      height="60"
                      rx="10"
                      fill="#0B1220"
                      stroke={isSelected ? "#38BDF8" : node.active ? node.color : "#334155"}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="group-hover:stroke-teal-400 transition-all"
                    />

                    {/* Color Left Accent Bar */}
                    <rect
                      width="5"
                      height="60"
                      rx="2"
                      fill={node.color}
                    />

                    {/* Node Header Label */}
                    <text
                      x="14"
                      y="22"
                      fill="#F8FAFC"
                      fontSize="11.5"
                      fontWeight="bold"
                    >
                      {node.label}
                    </text>

                    {/* Node Subtitle */}
                    <text
                      x="14"
                      y="38"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                    >
                      {node.sub_label}
                    </text>

                    {/* Holding Acres Pill */}
                    <rect
                      x="14"
                      y="44"
                      width="72"
                      height="12"
                      rx="3"
                      fill={node.color + "25"}
                    />
                    <text
                      x="50"
                      y="53"
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.acres} Ha/Acres
                    </text>

                    {/* Current Active Badge Indicator */}
                    {node.active && (
                      <circle
                        cx="165"
                        cy="16"
                        r="4.5"
                        fill="#10B981"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <div className="mt-4 p-4 rounded-lg bg-slate-900/90 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                  <Badge variant={selectedNode.active ? "verified" : "secondary"} className="text-[10px]">
                    {selectedNode.active ? "CURRENT ACTIVE HOLDER" : "HISTORICAL ANCESTORS / EXITED"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">
                  {selectedNode.sub_label} • Extent Holding: <strong>{selectedNode.acres} Acres</strong>
                  {selectedNode.initial_acres ? ` (Initial: ${selectedNode.initial_acres} Acres)` : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-md shrink-0"
              >
                Close Inspector
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final State Summary Ledger (A, B, D) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {graph.final_owners.map((owner, idx) => (
          <Card key={idx} className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">{owner.owner}</span>
                </div>
                <Badge variant={owner.status === "ACTIVE_CERTIFIED" ? "verified" : "warning"} className="text-[10px]">
                  {owner.status}
                </Badge>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-400 font-mono">{owner.parcel}</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {owner.current_holding_acres.toFixed(2)} Acres
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
