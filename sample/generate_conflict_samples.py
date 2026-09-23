"""
Land AI (इंडी-भूमि) — Sample Conflict, Overlap & Discrepancy PNG Generator
=============================================================================
Generates 10 annotated PNG images that visually demonstrate the key land record
conflict scenarios this platform detects:

  1. GIS Area vs Deed Area Mismatch (>5% variance)
  2. Boundary Overlap between two parcels
  3. Dual/Double-Ownership Conflict
  4. Encumbrance & Active Mortgage on Disputed Parcel
  5. Orphaned Mutation (Broken Succession Chain)
  6. Phantom Hissa (Sub-division not reflected in GIS)
  7. Multi-state Encroachment Boundary
  8. OCR Confidence Heatmap — Low-Confidence Fields
  9. Cadastral Conflict Dashboard Summary
 10. Tamper/Forgery Indicator (Hash Mismatch)

Usage:
    python generate_conflict_samples.py

Output:
    /home/appu/sih26/sample/outputs/  (10 PNG files)
"""

import os
import math
import textwrap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.patheffects as pe
from matplotlib.patches import FancyBboxPatch, Polygon as MplPolygon, FancyArrowPatch
from matplotlib.collections import PatchCollection
from matplotlib.gridspec import GridSpec
import numpy as np

# ──────────────────────────────────────────────────────────────────────────────
OUTPUT_DIR = "/home/appu/sih26/sample/outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colour palette — Land AI brand
C_RED     = "#E53E3E"
C_ORANGE  = "#DD6B20"
C_YELLOW  = "#D69E2E"
C_GREEN   = "#38A169"
C_BLUE    = "#3182CE"
C_INDIGO  = "#553C9A"
C_TEAL    = "#2C7A7B"
C_DARK    = "#1A202C"
C_LIGHT   = "#F7FAFC"
C_GREY    = "#718096"
C_SAND    = "#FAF3E0"
C_BG      = "#EDF2F7"

TITLE_FONT   = {"fontsize": 15, "fontweight": "bold", "color": C_DARK, "fontfamily": "DejaVu Sans"}
LABEL_FONT   = {"fontsize": 9,  "color": C_DARK, "fontfamily": "DejaVu Sans"}
WARNING_FONT = {"fontsize": 10, "color": C_RED,  "fontweight": "bold"}


def save(fig, name, index):
    path = os.path.join(OUTPUT_DIR, f"{index:02d}_{name}.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved -> {path}")
    return path


# ======================================================================
# IMAGE 1 — GIS Area vs Deed Area Mismatch Bar Chart
# ======================================================================
def img_01_area_mismatch():
    fig, ax = plt.subplots(figsize=(12, 7), facecolor=C_LIGHT)
    ax.set_facecolor(C_BG)

    labels = [
        "Karnataka\nRTC 88/3A",
        "Karnataka\nBhoomi 104/1",
        "Karnataka\nMutation 215/2",
        "Telangana\nDharani 156/AA",
        "Telangana\nSale Deed 78/B",
        "AP MeeSeva\n412/3",
        "AP Conv.\n189/1A",
        "Tamil Nadu\nPatta 204/5B",
        "Maharashtra\n7/12 142/2B",
        "Maharashtra\nSale 94/1",
    ]
    deed_ha  = [1.052, 0.809, 0.607, 0.935, 0.728, 0.500, 0.405, 0.125, 1.500, 0.223]
    gis_ha   = [1.055, 0.812, 0.611, 1.102, 0.731, 0.502, 0.408, 0.126, 1.231, 0.221]
    pct_var  = [(g - d) / d * 100 for g, d in zip(gis_ha, deed_ha)]

    x = np.arange(len(labels))
    w = 0.35
    bars_deed = ax.bar(x - w/2, deed_ha, w, label="Deed Area (Ha)", color=C_BLUE, alpha=0.85, zorder=3)
    bars_gis  = ax.bar(x + w/2, gis_ha,  w, label="GIS Satellite Area (Ha)", color=C_TEAL, alpha=0.85, zorder=3)

    # Highlight conflicting parcels (index 3 & 8)
    for idx in [3, 8]:
        ax.bar(idx - w/2, deed_ha[idx], w, color=C_RED, alpha=0.9, zorder=4)
        ax.bar(idx + w/2, gis_ha[idx],  w, color=C_ORANGE, alpha=0.9, zorder=4)
        ax.annotate(f"WARNING {pct_var[idx]:+.1f}%",
                    xy=(idx, max(deed_ha[idx], gis_ha[idx]) + 0.04),
                    ha="center", fontsize=9, color=C_RED, fontweight="bold",
                    bbox=dict(boxstyle="round,pad=0.3", fc="white", ec=C_RED, lw=1.5))

    for i, (b, pv) in enumerate(zip(bars_gis, pct_var)):
        if i not in [3, 8]:
            color = C_GREEN if abs(pv) <= 5 else C_RED
            ax.text(i, max(deed_ha[i], gis_ha[i]) + 0.015,
                    f"{pv:+.1f}%", ha="center", fontsize=7, color=color, fontweight="bold")

    ax.set_xlabel("Property Survey Number & State", **LABEL_FONT, labelpad=10)
    ax.set_ylabel("Area (Hectares)", **LABEL_FONT)
    ax.set_title(
        "IMAGE 1 — GIS Satellite Area vs Deed-Recorded Area Comparison\n"
        "Nishu Kumar — All 10 Land Parcels",
        **TITLE_FONT, pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=7.5)
    ax.yaxis.grid(True, linestyle="--", alpha=0.5, zorder=0)
    ax.set_ylim(0, max(gis_ha) * 1.3)

    conflict_patch = mpatches.Patch(color=C_RED, label="Conflict (>5% variance)")
    deed_patch = mpatches.Patch(color=C_BLUE, label="Deed Area (Ha)")
    gis_patch = mpatches.Patch(color=C_TEAL, label="GIS Satellite Area (Ha)")
    ax.legend(handles=[deed_patch, gis_patch, conflict_patch], fontsize=8, loc="upper right")

    fig.text(0.5, 0.01,
             "Land AI — Cadastral Conflict Engine | PostGIS WGS-84 Polygon Area vs Legal Deed Extract",
             ha="center", fontsize=7, color=C_GREY, style="italic")
    fig.tight_layout(pad=1.5)
    return save(fig, "GIS_vs_Deed_Area_Mismatch", 1)


# ======================================================================
# IMAGE 2 — Polygon Boundary Overlap (Cadastral Overlap Map)
# ======================================================================
def img_02_boundary_overlap():
    fig, axes = plt.subplots(1, 2, figsize=(14, 7), facecolor=C_LIGHT)
    fig.suptitle(
        "IMAGE 2 — Cadastral Boundary Overlap: Maharashtra Parcels 142/2B & 94/1\n"
        "Wagholi, Pune Haveli — Encroachment Zone Detected",
        **TITLE_FONT, y=1.02)

    ax = axes[0]
    ax.set_facecolor("#1a3a1a")

    for i in np.arange(73.965, 73.995, 0.005):
        ax.axvline(i, color="#2a4a2a", lw=0.4, alpha=0.5)
    for j in np.arange(18.570, 18.598, 0.004):
        ax.axhline(j, color="#2a4a2a", lw=0.4, alpha=0.5)

    poly_142 = MplPolygon([
        (73.9700, 18.5750), (73.9780, 18.5750),
        (73.9790, 18.5810), (73.9710, 18.5820),
        (73.9700, 18.5750)
    ], closed=True, facecolor=C_RED, edgecolor="white", alpha=0.55, lw=2, zorder=3)
    ax.add_patch(poly_142)

    poly_94 = MplPolygon([
        (73.9760, 18.5730), (73.9820, 18.5730),
        (73.9825, 18.5780), (73.9755, 18.5790),
        (73.9760, 18.5730)
    ], closed=True, facecolor=C_ORANGE, edgecolor="yellow", alpha=0.55, lw=2, zorder=3)
    ax.add_patch(poly_94)

    overlap = MplPolygon([
        (73.9760, 18.5750), (73.9780, 18.5750),
        (73.9790, 18.5780), (73.9755, 18.5790),
        (73.9760, 18.5750)
    ], closed=True, facecolor="white", edgecolor=C_RED, alpha=0.75, lw=2.5,
        linestyle="--", zorder=5)
    ax.add_patch(overlap)

    ax.text(73.9745, 18.5785, "PARCEL\n142/2B\n3.71 Ac\nFlagged",
            color="white", fontsize=8, ha="center", fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3", fc=C_RED, alpha=0.9))
    ax.text(73.9793, 18.5755, "PARCEL\n94/1\n0.55 Ac",
            color="white", fontsize=8, ha="center", fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3", fc=C_ORANGE, alpha=0.9))
    ax.text(73.9772, 18.5770, "OVERLAP\nZONE\n~0.031 Ha",
            color=C_DARK, fontsize=7.5, ha="center", fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.25", fc="white", ec=C_RED, alpha=0.95, lw=2))

    ax.set_xlim(73.963, 73.990)
    ax.set_ylim(18.568, 18.587)
    ax.set_xlabel("Longitude (WGS-84)", color="white", fontsize=8)
    ax.set_ylabel("Latitude (WGS-84)", color="white", fontsize=8)
    ax.tick_params(colors="white", labelsize=7)
    ax.set_title("PostGIS Cadastral Overlap Map", color="white", fontsize=10, pad=8)
    ax.spines[:].set_color("#444")

    p1 = mpatches.Patch(color=C_RED,    alpha=0.7, label="Parcel 142/2B (7/12 Extract)")
    p2 = mpatches.Patch(color=C_ORANGE, alpha=0.7, label="Parcel 94/1 (Sale Deed)")
    p3 = mpatches.Patch(color="white",  alpha=0.9, label="Conflict Overlap Zone")
    ax.legend(handles=[p1, p2, p3], fontsize=7, loc="lower right",
              facecolor="#1a3a1a", labelcolor="white", edgecolor="#444")

    ax2 = axes[1]
    ax2.set_facecolor(C_SAND)
    ax2.axis("off")

    data = [
        ["Field", "Parcel 142/2B", "Parcel 94/1", "Conflict"],
        ["Survey No.", "142/2B", "94/1", "None"],
        ["Deed Area", "3.71 Ac (1.500 Ha)", "0.55 Ac (0.223 Ha)", "None"],
        ["GIS Area", "3.05 Ac (1.234 Ha)", "0.55 Ac (0.224 Ha)", "None"],
        ["Variance %", "-17.8% WARNING", "+0.4% OK", "CRITICAL"],
        ["Overlap Area", "~0.031 Ha", "~0.031 Ha", "BOTH PARCELS"],
        ["Owner", "Nishu Kumar", "Nishu Kumar", "Same Owner"],
        ["Status", "GIS Variance", "Pending", "REVIEW"],
        ["Mutation", "M-4512", "M-4891", "Conflict Trace"],
        ["Encumbrance", "Bank Mortgage", "NIL", "Risk Elevated"],
    ]

    colors = []
    for i, row in enumerate(data):
        if i == 0:
            colors.append(["#553C9A"] * 4)
        elif row[3] in ["CRITICAL", "REVIEW", "BOTH PARCELS"]:
            colors.append(["#FED7D7", "#FED7D7", "#FED7D7", "#FC8181"])
        elif row[3] == "OK":
            colors.append(["#C6F6D5"] * 4)
        else:
            row_color = C_BG if i % 2 == 0 else "white"
            colors.append([row_color] * 4)

    tbl = ax2.table(cellText=data[1:], colLabels=data[0],
                    cellLoc="center", loc="center",
                    cellColours=colors[1:],
                    colColours=colors[0])
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8)
    tbl.scale(1.2, 2.0)

    for (r, c), cell in tbl.get_celld().items():
        cell.set_edgecolor(C_GREY)
        if r == 0:
            cell.set_text_props(color="white", fontweight="bold")

    ax2.set_title("Conflict Analysis — Overlap Details", fontsize=11, fontweight="bold", color=C_DARK)

    fig.tight_layout(pad=1.5)
    return save(fig, "Boundary_Overlap_Conflict", 2)


# ======================================================================
# IMAGE 3 — Dual Ownership / Double Claim Conflict
# ======================================================================
def img_03_dual_ownership():
    fig, ax = plt.subplots(figsize=(13, 8), facecolor=C_LIGHT)
    ax.set_facecolor(C_BG)
    ax.axis("off")

    fig.suptitle(
        "IMAGE 3 — Dual Ownership Conflict: Telangana Dharani Passbook 156/AA\n"
        "Gollapally, Shamshabad — Same Parcel Claimed by Two Owners",
        **TITLE_FONT, y=1.01)

    def node(ax, x, y, label, color, w=2.5, h=0.55, fontsize=8.5):
        box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                             boxstyle="round,pad=0.1",
                             fc=color, ec="white", lw=2, zorder=4)
        ax.add_patch(box)
        ax.text(x, y, label, ha="center", va="center", fontsize=fontsize,
                color="white", fontweight="bold", zorder=5)

    def arrow(ax, x1, y1, x2, y2, color=C_GREY):
        ax.annotate("", xy=(x2, y2 + 0.3), xytext=(x1, y1 - 0.3),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.8))

    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)

    node(ax, 7, 8.2, "Survey 156/AA\nGollapally, Shamshabad, Telangana\n2.31 Ac (0.935 Ha)", C_INDIGO, w=5, h=1.2, fontsize=9)

    node(ax, 3, 6.2, "Dharani Passbook\n(2023-01-12)\nOwner: Nishu Kumar", C_BLUE, w=3.5)
    node(ax, 3, 4.5, "Mutation: DH-2023-891\nSuccession from\nPriya Kumar (mother)", C_TEAL, w=3.5)
    node(ax, 3, 2.8, "Supporting Doc:\nDeath Certificate\n+ Inheritance Affidavit", C_GREEN, w=3.5)

    node(ax, 11, 6.2, "Registered Sale Deed\n(2023-11-05)\nOwner: Rajesh Rao", C_RED, w=3.5)
    node(ax, 11, 4.5, "Reg. No: AP-2023-7712\nSub-Registrar: Shamshabad\nStamp Duty Paid", C_ORANGE, w=3.5)
    node(ax, 11, 2.8, "Seller: Unknown 3rd Party\nSeller had NO valid title\nFraudulent Origin", C_RED, w=3.5)

    arrow(ax, 7, 7.6, 3, 6.5, C_BLUE)
    arrow(ax, 7, 7.6, 11, 6.5, C_RED)
    arrow(ax, 3, 5.9, 3, 4.8, C_BLUE)
    arrow(ax, 3, 4.2, 3, 3.1, C_GREEN)
    arrow(ax, 11, 5.9, 11, 4.8, C_RED)
    arrow(ax, 11, 4.2, 11, 3.1, C_ORANGE)

    conflict_box = FancyBboxPatch((5.2, 4.8), 3.6, 1.2,
                                  boxstyle="round,pad=0.2",
                                  fc=C_RED, ec=C_DARK, lw=2.5, zorder=6)
    ax.add_patch(conflict_box)
    ax.text(7, 5.4, "DUAL OWNERSHIP\nCONFLICT DETECTED",
            ha="center", va="center", fontsize=10, color="white",
            fontweight="bold", zorder=7)

    ax.annotate("", xy=(5.8, 5.4), xytext=(4.7, 6.0),
                arrowprops=dict(arrowstyle="->", color=C_BLUE, lw=2))
    ax.annotate("", xy=(8.2, 5.4), xytext=(9.3, 6.0),
                arrowprops=dict(arrowstyle="->", color=C_RED, lw=2))

    ax.text(3, 7.2, "VALID CHAIN A — Nishu Kumar\n(Inheritance Succession)",
            ha="center", fontsize=9, color=C_BLUE, fontweight="bold")
    ax.text(11, 7.2, "INVALID CHAIN B — Rajesh Rao\n(Fraudulent Sale)",
            ha="center", fontsize=9, color=C_RED, fontweight="bold")

    ax.text(7, 0.5,
            "Resolution Required: Sub-Registrar Shamshabad + District Collector\n"
            "Platform Action: Auto-frozen from mutation | Flagged for legal review | SHA-256 audit entry created",
            ha="center", fontsize=8, color=C_DARK,
            bbox=dict(boxstyle="round,pad=0.4", fc="#FFF5F5", ec=C_RED, lw=1.5))

    fig.tight_layout()
    return save(fig, "Dual_Ownership_Conflict", 3)


# ======================================================================
# IMAGE 4 — Encumbrance & Active Mortgage on Disputed Parcel
# ======================================================================
def img_04_encumbrance():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 7), facecolor=C_LIGHT)
    fig.suptitle(
        "IMAGE 4 — Encumbrance Risk Matrix: Active Mortgages on Conflicted Parcels\nNishu Kumar Portfolio",
        **TITLE_FONT, y=1.01)

    ax1.set_facecolor(C_BG)
    parcels    = ["88/3A\nKarnataka", "104/1\nKarnataka", "215/2\nKarnataka",
                  "156/AA\nTelangana", "78/B\nTelangana",
                  "412/3\nAP", "189/1A\nAP", "204/5B\nTN", "142/2B\nMH", "94/1\nMH"]
    conf_score = [0.92,  0.88,  0.85,   0.42,   0.87,   0.83,  0.90,  0.91,  0.38,  0.72]
    gis_var    = [0.3,   0.4,   0.7,    17.8,   0.4,    0.4,   0.7,   0.8,   17.8,  0.9]
    enc_amt    = [350000, 0,    0,      800000,  0,      0,     0,     0,     500000, 0]
    sizes_plot = [max(200, e / 1500) for e in enc_amt]

    colors_s = [C_RED if (c < 0.5 or g > 10) else (C_YELLOW if c < 0.75 else C_GREEN)
                for c, g in zip(conf_score, gis_var)]

    ax1.scatter(gis_var, conf_score, s=sizes_plot, c=colors_s, alpha=0.85,
                edgecolors="white", linewidths=1.5, zorder=4)

    for i, (lbl, x, y, amt) in enumerate(zip(parcels, gis_var, conf_score, enc_amt)):
        ax1.annotate(lbl, (x, y), textcoords="offset points", xytext=(8, 4),
                     fontsize=7, color=C_DARK)
        if amt > 0:
            ax1.annotate(f"Rs {amt/100000:.1f}L Mortgage",
                         (x, y), textcoords="offset points", xytext=(8, -12),
                         fontsize=6.5, color=C_RED, fontweight="bold")

    ax1.axvline(5, color=C_RED, linestyle="--", lw=1.5, alpha=0.8, label="5% GIS Threshold")
    ax1.axhline(0.7, color=C_ORANGE, linestyle=":", lw=1.5, alpha=0.8, label="0.7 Confidence Floor")
    ax1.fill_betweenx([0, 0.7], 5, 25, alpha=0.08, color=C_RED)
    ax1.text(15, 0.4, "DANGER ZONE\n(Low Confidence +\nHigh GIS Variance)",
             ha="center", fontsize=8, color=C_RED, fontweight="bold",
             bbox=dict(boxstyle="round", fc="white", ec=C_RED, alpha=0.9))

    ax1.set_xlabel("GIS vs Deed Variance (%)", **LABEL_FONT)
    ax1.set_ylabel("AI Extraction Confidence Score", **LABEL_FONT)
    ax1.set_title("Risk Scatter: Confidence vs GIS Variance\n(Bubble size = Mortgage Amount)", fontsize=10)
    ax1.legend(fontsize=7)
    ax1.set_xlim(-1, 22)
    ax1.set_ylim(0.3, 1.0)
    ax1.yaxis.grid(True, alpha=0.4)

    ax2.axis("off")
    ax2.set_facecolor(C_SAND)

    enc_data = [
        ["Survey", "Encumbrance Type", "Institution", "Amount (Rs)", "Status", "Risk"],
        ["88/3A", "KCC Agri Loan", "SBI Devanahalli", "3,50,000", "Active", "Medium"],
        ["104/1", "NIL", "None", "None", "Clear", "Low"],
        ["215/2", "NIL", "None", "None", "Clear", "Low"],
        ["156/AA", "Mortgage", "HDFC Bank", "8,00,000", "Active", "HIGH"],
        ["78/B",  "NIL", "None", "None", "Clear", "Low"],
        ["412/3", "NIL", "None", "None", "Clear", "Low"],
        ["189/1A","NIL", "None", "None", "Clear", "Low"],
        ["204/5B","NIL", "None", "None", "Clear", "Low"],
        ["142/2B","Bank Mortgage","Bank of Maharashtra","5,00,000","Active","HIGH"],
        ["94/1",  "NIL", "None", "None", "Pending","Medium"],
    ]

    row_colors = []
    for i, r in enumerate(enc_data):
        if i == 0:
            row_colors.append([C_INDIGO] * 6)
        elif "HIGH" in r[-1]:
            row_colors.append(["#FFF5F5"] * 5 + ["#FC8181"])
        elif "Medium" in r[-1]:
            row_colors.append(["#FFFBEB"] * 5 + ["#F6E05E"])
        else:
            row_colors.append(["#F0FFF4"] * 5 + ["#9AE6B4"])

    tbl = ax2.table(cellText=enc_data[1:], colLabels=enc_data[0],
                    cellLoc="center", loc="center",
                    cellColours=row_colors[1:],
                    colColours=row_colors[0])
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8)
    tbl.scale(1.3, 1.85)
    for (r, c), cell in tbl.get_celld().items():
        cell.set_edgecolor(C_GREY)
        if r == 0:
            cell.set_text_props(color="white", fontweight="bold")

    ax2.set_title("Encumbrance Registry — All Parcels", fontsize=11, fontweight="bold", color=C_DARK)

    fig.tight_layout(pad=1.5)
    return save(fig, "Encumbrance_Risk_Matrix", 4)


# ======================================================================
# IMAGE 5 — Broken Mutation Chain (Orphaned Succession)
# ======================================================================
def img_05_mutation_chain():
    fig, ax = plt.subplots(figsize=(14, 9), facecolor=C_LIGHT)
    ax.set_facecolor(C_BG)
    ax.axis("off")
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)

    fig.suptitle(
        "IMAGE 5 — Orphaned Mutation Chain: Maharashtra 7/12 Satbara 142/2B\n"
        "Wagholi, Pune — Broken Succession Lineage Detected",
        **TITLE_FONT, y=1.01)

    def mnode(x, y, text, color, w=3.2, h=0.9, fs=8):
        box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                             boxstyle="round,pad=0.15", fc=color, ec="white", lw=2, zorder=4)
        ax.add_patch(box)
        ax.text(x, y, text, ha="center", va="center", fontsize=fs,
                color="white", fontweight="bold", zorder=5)

    def marrow(x1, y1, x2, y2, color=C_GREY, label=""):
        ax.annotate("", xy=(x2, y2 + 0.45), xytext=(x1, y1 - 0.45),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=2.0))
        if label:
            mx, my = (x1 + x2) / 2 + 0.3, (y1 + y2) / 2
            ax.text(mx, my, label, fontsize=7, color=color, ha="left")

    ax.plot([1.2, 1.2], [0, 10], color="#444", lw=2, zorder=1)

    mnode(7, 9.2, "Original Title: 1985\nGov. Allotment to Shankar Patil\nSurvey 142/2B, Wagholi", C_INDIGO, w=5, h=1.0)
    marrow(7, 8.7, 7, 7.8, C_GREEN, "Mutation M-1104\n(1985 — Grant)")
    mnode(7, 7.3, "Mutation M-1104 (1985)\nTitle Transfer — Govt to Shankar Patil\nArea: 3.71 Ac", C_GREEN, w=4.5)
    marrow(7, 6.85, 7, 5.85, C_GREEN, "Mutation M-2278\n(2001 — Inheritance)")
    mnode(7, 5.4, "Mutation M-2278 (2001)\nSuccession: Shankar — Ramesh & Suresh Patil\nJoint Ownership 1/2 each", C_TEAL, w=4.5)
    marrow(7, 4.95, 7, 3.95, C_RED, "MISSING MUTATION\n(2019 Gap — No Record)")

    gap_box = FancyBboxPatch((4.8, 3.5), 4.4, 0.9,
                              boxstyle="round,pad=0.2",
                              fc="#FFF5F5", ec=C_RED, lw=2.5, linestyle="--", zorder=6)
    ax.add_patch(gap_box)
    ax.text(7, 3.95, "ORPHANED GAP (2019-2023)\nNo registered mutation found in revenue records\nSeller identity UNVERIFIABLE",
            ha="center", va="center", fontsize=8.5, color=C_RED, fontweight="bold", zorder=7)

    marrow(7, 3.5, 7, 2.5, C_RED, "Claimed M-4512\n(2023 — Unverified)")

    mnode(7, 2.0, "Mutation M-4512 (2023) — CONTESTED\nClaims: Nishu Kumar owns 50% share\nLinked Deed: NOT in original chain", C_RED, w=5)

    ax.text(1.2, 6.0,
            "VALID CHAIN\n1985 to 2001\n(Confirmed Mutations)",
            ha="center", fontsize=8.5, color=C_GREEN, fontweight="bold",
            bbox=dict(boxstyle="round", fc="white", ec=C_GREEN, lw=1.5))
    ax.text(1.2, 3.5,
            "BROKEN LINK\n2019 Gap\nNo Record",
            ha="center", fontsize=8.5, color=C_RED, fontweight="bold",
            bbox=dict(boxstyle="round", fc="white", ec=C_RED, lw=1.5))

    ax.text(7, 0.7,
            "Platform Actions:\n"
            "  Mutation M-4512 auto-flagged as PENDING MANUAL REVIEW\n"
            "  Tahsildar notification triggered for 2019-2023 gap resolution\n"
            "  SHA-256 audit entry logged for complete mutation chain review",
            ha="center", fontsize=8.5, color=C_DARK,
            bbox=dict(boxstyle="round,pad=0.5", fc="white", ec=C_ORANGE, lw=1.5))

    fig.tight_layout()
    return save(fig, "Broken_Mutation_Chain", 5)


# ======================================================================
# IMAGE 6 — Phantom Hissa (Sub-division not in GIS)
# ======================================================================
def img_06_phantom_hissa():
    fig, axes = plt.subplots(1, 3, figsize=(15, 7), facecolor=C_LIGHT)
    fig.suptitle(
        "IMAGE 6 — Phantom Hissa Conflict: AP Pahani 412/3 vs 412/3A, 412/3B, 412/3C\n"
        "Angalakuduru, Tenali — Sub-division in Deed NOT reflected in GIS Polygons",
        **TITLE_FONT, y=1.01)

    ax1 = axes[0]
    ax1.set_facecolor("#1a3a1a")
    full_poly = MplPolygon([
        (80.550, 16.232), (80.562, 16.232),
        (80.562, 16.244), (80.550, 16.244),
        (80.550, 16.232)
    ], closed=True, facecolor=C_TEAL, edgecolor="white", alpha=0.75, lw=2.5)
    ax1.add_patch(full_poly)
    ax1.text(80.556, 16.238, "412/3\n1.23 Ac\n(UNDIVIDED\nGIS View)",
             ha="center", fontsize=9, color="white", fontweight="bold")
    ax1.set_xlim(80.545, 80.568)
    ax1.set_ylim(16.228, 16.249)
    ax1.set_title("GIS: Single Polygon\n(No Sub-division)", color="white", fontsize=10)
    ax1.tick_params(colors="white", labelsize=6)

    ax2 = axes[1]
    ax2.set_facecolor("#1a3a1a")
    hissa_A = MplPolygon([
        (80.550, 16.232), (80.554, 16.232),
        (80.554, 16.244), (80.550, 16.244),
        (80.550, 16.232)
    ], closed=True, facecolor=C_BLUE, edgecolor="yellow", alpha=0.7, lw=2)
    hissa_B = MplPolygon([
        (80.554, 16.232), (80.558, 16.232),
        (80.558, 16.244), (80.554, 16.244),
        (80.554, 16.232)
    ], closed=True, facecolor=C_GREEN, edgecolor="yellow", alpha=0.7, lw=2)
    hissa_C = MplPolygon([
        (80.558, 16.232), (80.562, 16.232),
        (80.562, 16.244), (80.558, 16.244),
        (80.558, 16.232)
    ], closed=True, facecolor=C_ORANGE, edgecolor="yellow", alpha=0.7, lw=2)

    ax2.add_patch(hissa_A)
    ax2.add_patch(hissa_B)
    ax2.add_patch(hissa_C)

    ax2.text(80.552, 16.238, "412/3A\n0.41 Ac\nNishu K.",
             ha="center", fontsize=8, color="white", fontweight="bold")
    ax2.text(80.556, 16.238, "412/3B\n0.41 Ac\nRavi P.",
             ha="center", fontsize=8, color="white", fontweight="bold")
    ax2.text(80.560, 16.238, "412/3C\n0.41 Ac\nSuresh T.",
             ha="center", fontsize=8, color="white", fontweight="bold")

    ax2.set_xlim(80.545, 80.568)
    ax2.set_ylim(16.228, 16.249)
    ax2.set_title("Deed: 3 Hissa Sub-divisions\n(As per AP Pahani)", color="white", fontsize=10)
    ax2.tick_params(colors="white", labelsize=6)

    ax3 = axes[2]
    ax3.axis("off")
    ax3.set_facecolor(C_SAND)

    rows = [
        ["Attribute", "GIS Polygon", "Deed Record", "Conflict"],
        ["Survey No.", "412/3", "412/3A,B,C", "SPLIT"],
        ["Hissa Count", "1 (Undivided)", "3 Sub-parcels", "MISMATCH"],
        ["Area (GIS)", "0.502 Ha", "None", "None"],
        ["Area (Deed)", "None", "0.500 Ha", "~0.4%"],
        ["Owners", "1 (Nishu Kumar)", "3 Different", "CONFLICT"],
        ["Sub-div Date", "Not in GIS", "2021-08-14", "NOT UPDATED"],
        ["Mutation", "None found", "MR-2021-667", "ORPHANED"],
        ["Risk Level", "None", "None", "HIGH"],
    ]
    rcolors = []
    for i, r in enumerate(rows):
        if i == 0:
            rcolors.append([C_INDIGO] * 4)
        elif r[3] in ["SPLIT", "MISMATCH", "CONFLICT", "NOT UPDATED", "ORPHANED", "HIGH"]:
            rcolors.append(["#FFF5F5"] * 3 + ["#FC8181"])
        else:
            c = C_BG if i % 2 else "white"
            rcolors.append([c] * 4)

    tbl = ax3.table(cellText=rows[1:], colLabels=rows[0],
                    cellLoc="center", loc="center",
                    cellColours=rcolors[1:], colColours=rcolors[0])
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8)
    tbl.scale(1.1, 2.0)
    for (r, c), cell in tbl.get_celld().items():
        cell.set_edgecolor(C_GREY)
        if r == 0:
            cell.set_text_props(color="white", fontweight="bold")

    ax3.set_title("Phantom Hissa Analysis", fontsize=11, fontweight="bold", color=C_DARK)

    fig.tight_layout(pad=1.5)
    return save(fig, "Phantom_Hissa_Conflict", 6)


# ======================================================================
# IMAGE 7 — Multi-state Boundary Encroachment
# ======================================================================
def img_07_state_boundary():
    fig, ax = plt.subplots(figsize=(13, 8), facecolor=C_LIGHT)
    ax.set_facecolor("#1a2a3a")
    fig.suptitle(
        "IMAGE 7 — Multi-State Encroachment: Karnataka-Telangana Border Parcel\n"
        "Survey 88/3A (Karnataka) Boundary Intrudes into Telangana Administrative Zone",
        **TITLE_FONT, y=1.01)

    karnataka = MplPolygon([
        (77.40, 11.5), (78.60, 11.5),
        (78.60, 15.5), (77.40, 15.5),
        (77.40, 11.5)
    ], closed=True, facecolor="#1a3a6a", edgecolor="#4a7abf", alpha=0.6, lw=2)

    telangana = MplPolygon([
        (78.60, 15.5), (79.80, 15.5),
        (79.80, 20.0), (78.60, 20.0),
        (78.60, 15.5)
    ], closed=True, facecolor="#1a6a4a", edgecolor="#4abf7a", alpha=0.6, lw=2)

    ax.add_patch(karnataka)
    ax.add_patch(telangana)

    ax.axvline(78.60, color="yellow", lw=3, linestyle="--", zorder=5)
    ax.text(78.60, 15.7, "STATE BOUNDARY\nKarnataka | Telangana",
            ha="center", fontsize=8.5, color="yellow", fontweight="bold",
            bbox=dict(boxstyle="round", fc="#333", alpha=0.8))

    parcel = MplPolygon([
        (78.45, 13.8), (78.75, 13.8),
        (78.78, 14.1), (78.42, 14.1),
        (78.45, 13.8)
    ], closed=True, facecolor=C_RED, edgecolor="white", alpha=0.65, lw=2.5, zorder=6)
    ax.add_patch(parcel)

    karnataka_part = MplPolygon([
        (78.45, 13.8), (78.60, 13.8),
        (78.60, 14.1), (78.42, 14.1),
        (78.45, 13.8)
    ], closed=True, facecolor=C_BLUE, edgecolor="white", alpha=0.5, lw=2, zorder=7)
    ax.add_patch(karnataka_part)

    telangana_intrusion = MplPolygon([
        (78.60, 13.8), (78.75, 13.8),
        (78.78, 14.1), (78.60, 14.1),
        (78.60, 13.8)
    ], closed=True, facecolor=C_ORANGE, edgecolor="yellow", alpha=0.75, lw=2.5,
        linestyle="--", zorder=7)
    ax.add_patch(telangana_intrusion)

    ax.text(78.52, 13.95, "Karnataka\nPortion\n(0.78 Ha)", ha="center", fontsize=9,
            color="white", fontweight="bold")
    ax.text(78.70, 13.95, "TELANGANA\nENCROACHMENT\n(0.27 Ha)", ha="center", fontsize=8.5,
            color=C_ORANGE, fontweight="bold",
            bbox=dict(boxstyle="round", fc="#1a2a3a", alpha=0.9, ec=C_ORANGE, lw=1.5))

    ax.text(77.9, 13.0, "KARNATAKA\n(Bengaluru Rural)", color="#aaddff",
            fontsize=13, ha="center", fontweight="bold", alpha=0.8)
    ax.text(79.2, 17.0, "TELANGANA\n(Hyderabad)", color="#aaffcc",
            fontsize=13, ha="center", fontweight="bold", alpha=0.8)

    ax.annotate("Survey 88/3A\n(Registered in Karnataka)\nDevanahalli Kasaba",
                xy=(78.60, 13.95), xytext=(77.6, 12.5),
                fontsize=9, color="white",
                arrowprops=dict(arrowstyle="->", color="white", lw=1.5),
                bbox=dict(boxstyle="round", fc=C_BLUE, alpha=0.9))

    ax.annotate("Encroachment Zone\n0.27 Ha inside Telangana\nRequires NOC from two states",
                xy=(78.72, 13.95), xytext=(79.1, 12.8),
                fontsize=8.5, color=C_ORANGE,
                arrowprops=dict(arrowstyle="->", color=C_ORANGE, lw=1.5),
                bbox=dict(boxstyle="round", fc="#1a2a3a", ec=C_ORANGE, alpha=0.9, lw=1.5))

    ax.set_xlim(77.3, 80.2)
    ax.set_ylim(11.0, 20.5)
    ax.set_xlabel("Longitude (WGS-84)", color="white", fontsize=9)
    ax.set_ylabel("Latitude (WGS-84)", color="white", fontsize=9)
    ax.tick_params(colors="white", labelsize=7)
    ax.spines[:].set_color("#555")

    fig.text(0.5, 0.01,
             "Cross-State Encroachment requires clearance from Revenue Depts of BOTH Karnataka AND Telangana",
             ha="center", fontsize=8, color=C_ORANGE, fontweight="bold")

    fig.tight_layout()
    return save(fig, "MultiState_Boundary_Encroachment", 7)


# ======================================================================
# IMAGE 8 — OCR Confidence Heatmap (Low-Confidence Fields)
# ======================================================================
def img_08_ocr_confidence():
    fig, axes = plt.subplots(1, 2, figsize=(14, 8), facecolor=C_LIGHT)
    fig.suptitle(
        "IMAGE 8 — Multi-Model OCR Confidence Heatmap\n"
        "Field-Level Extraction Confidence Across 10 Nishu Kumar Deeds",
        **TITLE_FONT, y=1.01)

    fields = ["Survey\nNumber", "Owner\nName", "Area\n(Acres)", "Mutation\nNumber",
               "Taluk/\nVillage", "Encumbrance\nDetails", "Land\nTenure",
               "Khata\nNumber", "Date of\nDoc", "Stamp\nDuty"]

    deeds_short = ["KA-88/3A", "KA-104/1", "KA-215/2", "TG-156/AA",
                   "TG-78/B", "AP-412/3", "AP-189/1A", "TN-204/5B",
                   "MH-142/2B", "MH-94/1"]

    np.random.seed(42)
    conf = np.array([
        [0.97, 0.95, 0.93, 0.91, 0.96, 0.88, 0.90, 0.89, 0.94, 0.85],
        [0.96, 0.94, 0.91, 0.89, 0.95, 0.86, 0.88, 0.87, 0.92, 0.83],
        [0.94, 0.92, 0.88, 0.85, 0.93, 0.82, 0.85, 0.83, 0.90, 0.80],
        [0.65, 0.52, 0.48, 0.38, 0.61, 0.32, 0.44, 0.35, 0.55, 0.29],
        [0.93, 0.91, 0.89, 0.87, 0.93, 0.84, 0.86, 0.85, 0.91, 0.81],
        [0.91, 0.88, 0.86, 0.83, 0.90, 0.80, 0.82, 0.81, 0.88, 0.77],
        [0.95, 0.92, 0.90, 0.88, 0.94, 0.85, 0.87, 0.86, 0.92, 0.82],
        [0.96, 0.93, 0.91, 0.90, 0.95, 0.87, 0.89, 0.88, 0.93, 0.84],
        [0.55, 0.48, 0.42, 0.35, 0.58, 0.28, 0.38, 0.32, 0.50, 0.25],
        [0.80, 0.75, 0.71, 0.68, 0.78, 0.60, 0.65, 0.62, 0.72, 0.58],
    ])

    ax1 = axes[0]
    im = ax1.imshow(conf, cmap="RdYlGn", aspect="auto", vmin=0.2, vmax=1.0)
    ax1.set_xticks(range(len(fields)))
    ax1.set_xticklabels(fields, fontsize=7.5, rotation=30, ha="right")
    ax1.set_yticks(range(len(deeds_short)))
    ax1.set_yticklabels(deeds_short, fontsize=8)
    ax1.set_title("Confidence Score Heatmap\n(Green=High, Red=Low)", fontsize=10, pad=8)

    for i in range(len(deeds_short)):
        for j in range(len(fields)):
            val = conf[i, j]
            text_color = "white" if val < 0.5 else C_DARK
            ax1.text(j, i, f"{val:.2f}", ha="center", va="center",
                     fontsize=6.5, color=text_color, fontweight="bold")

    plt.colorbar(im, ax=ax1, shrink=0.8, label="Confidence Score (0=Low, 1=High)")

    for deed_idx in [3, 8]:
        rect = mpatches.FancyBboxPatch((-0.5, deed_idx - 0.5), len(fields), 1,
                                        boxstyle="round,pad=0.05",
                                        fill=False, edgecolor=C_RED, linewidth=3, zorder=5)
        ax1.add_patch(rect)
        ax1.text(len(fields) - 0.2, deed_idx, "FLAGGED", va="center",
                 fontsize=7, color=C_RED, fontweight="bold")

    ax2 = axes[1]
    ax2.set_facecolor(C_BG)
    avg_conf = conf.mean(axis=1)
    bar_colors = [C_RED if c < 0.55 else (C_YELLOW if c < 0.75 else C_GREEN) for c in avg_conf]
    bars = ax2.barh(deeds_short, avg_conf, color=bar_colors, alpha=0.85, edgecolor="white", lw=1.5, zorder=3)
    ax2.axvline(0.7, color=C_RED, linestyle="--", lw=2, label="0.7 Acceptance Threshold")
    ax2.axvline(0.85, color=C_GREEN, linestyle=":", lw=1.5, label="0.85 High Confidence")

    for i, (bar, val) in enumerate(zip(bars, avg_conf)):
        ax2.text(val + 0.01, i, f"{val:.3f}", va="center", fontsize=9, fontweight="bold",
                 color=C_RED if val < 0.55 else C_DARK)
        if val < 0.55:
            ax2.text(val - 0.02, i, "REVIEW REQUIRED", va="center",
                     ha="right", fontsize=7.5, color=C_RED, fontweight="bold")

    ax2.set_xlabel("Average Field Confidence Score", **LABEL_FONT)
    ax2.set_title("Per-Deed Average Extraction\nConfidence Score", fontsize=10)
    ax2.legend(fontsize=8)
    ax2.set_xlim(0, 1.1)
    ax2.xaxis.grid(True, alpha=0.4)

    fig.tight_layout(pad=1.5)
    return save(fig, "OCR_Confidence_Heatmap", 8)


# ======================================================================
# IMAGE 9 — Cadastral Conflict Dashboard Summary
# ======================================================================
def img_09_dashboard():
    fig = plt.figure(figsize=(16, 10), facecolor=C_DARK)
    gs = GridSpec(3, 4, figure=fig, hspace=0.45, wspace=0.35)

    fig.suptitle(
        "IMAGE 9 — Land AI Executive Conflict Dashboard\n"
        "Nishu Kumar — Complete Portfolio Conflict Overview",
        fontsize=15, fontweight="bold", color="white", y=1.01)

    kpis = [
        ("Total Parcels", "10", C_BLUE, "Land"),
        ("Total Area", "16.31 Ac\n6.602 Ha", C_TEAL, "Area"),
        ("Conflicts", "2 Critical", C_RED, "Alert"),
        ("Clear Title", "7 Parcels", C_GREEN, "OK"),
    ]

    for col, (title, value, color, icon) in enumerate(kpis):
        ax_kpi = fig.add_subplot(gs[0, col])
        ax_kpi.set_facecolor(color)
        ax_kpi.set_xlim(0, 1)
        ax_kpi.set_ylim(0, 1)
        ax_kpi.axis("off")
        ax_kpi.text(0.5, 0.75, icon, ha="center", va="center", fontsize=16)
        ax_kpi.text(0.5, 0.45, value, ha="center", va="center", fontsize=14,
                    color="white", fontweight="bold")
        ax_kpi.text(0.5, 0.15, title, ha="center", va="center", fontsize=9,
                    color="white", alpha=0.9)

    ax_pie = fig.add_subplot(gs[1, 0])
    ax_pie.set_facecolor(C_DARK)
    state_areas = [1.052 + 0.809 + 0.607, 0.935 + 0.728, 0.500 + 0.405, 0.125, 1.500 + 0.223]
    state_names = ["Karnataka\n(3 parcels)", "Telangana\n(2)", "Andhra Pradesh\n(2)", "Tamil Nadu\n(1)", "Maharashtra\n(2)"]
    colors_pie  = [C_BLUE, C_TEAL, C_GREEN, C_YELLOW, C_RED]
    wedges, texts, autos = ax_pie.pie(state_areas, labels=state_names,
                                       colors=colors_pie, autopct="%1.0f%%",
                                       textprops={"color": "white", "fontsize": 7},
                                       startangle=140, pctdistance=0.75)
    for auto in autos:
        auto.set_fontsize(7)
        auto.set_color("white")
    ax_pie.set_title("State Distribution\n(by Area Ha)", color="white", fontsize=9, pad=5)

    ax_status = fig.add_subplot(gs[1, 1])
    ax_status.set_facecolor(C_DARK)
    statuses = ["Verified", "Flagged", "Pending", "Dual Claim"]
    counts   = [7, 2, 1, 1]
    status_colors = [C_GREEN, C_RED, C_YELLOW, C_INDIGO]
    bars = ax_status.bar(statuses, counts, color=status_colors, alpha=0.9, edgecolor="white", lw=1.5)
    for bar, count in zip(bars, counts):
        ax_status.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                       str(count), ha="center", fontsize=11, color="white", fontweight="bold")
    ax_status.set_facecolor(C_DARK)
    ax_status.tick_params(colors="white", labelsize=7)
    ax_status.set_ylim(0, 9)
    ax_status.spines[:].set_color("#444")
    ax_status.yaxis.grid(True, color="#333", alpha=0.5)
    ax_status.set_title("Validation Status\nDistribution", color="white", fontsize=9)

    ax_conf = fig.add_subplot(gs[1, 2:])
    ax_conf.set_facecolor(C_DARK)
    surveys_x = range(1, 11)
    conf_scores = [0.92, 0.88, 0.85, 0.42, 0.87, 0.83, 0.90, 0.91, 0.38, 0.72]
    bar_c = [C_RED if c < 0.5 else (C_YELLOW if c < 0.75 else C_GREEN) for c in conf_scores]
    ax_conf.bar(surveys_x, conf_scores, color=bar_c, alpha=0.9, edgecolor="white", lw=1)
    ax_conf.axhline(0.7, color="yellow", linestyle="--", lw=1.5, label="0.70 Threshold")
    ax_conf.axhline(0.85, color=C_GREEN, linestyle=":", lw=1.5, label="0.85 High Conf.")
    ax_conf.set_xticks(surveys_x)
    survey_labels = ["88/3A\nKA", "104/1\nKA", "215/2\nKA", "156/AA\nTG-FLAG",
                     "78/B\nTG", "412/3\nAP", "189/1A\nAP", "204/5B\nTN",
                     "142/2B\nMH-FLAG", "94/1\nMH"]
    ax_conf.set_xticklabels(survey_labels, fontsize=6.5, color="white")
    ax_conf.tick_params(axis="y", colors="white", labelsize=7)
    ax_conf.set_ylim(0, 1.05)
    ax_conf.set_title("AI Extraction Confidence by Parcel", color="white", fontsize=9)
    ax_conf.legend(fontsize=7, labelcolor="white", facecolor="#333")
    ax_conf.spines[:].set_color("#444")
    ax_conf.yaxis.grid(True, color="#333", alpha=0.5)

    ax_matrix = fig.add_subplot(gs[2, :])
    ax_matrix.set_facecolor(C_DARK)
    ax_matrix.axis("off")

    conflict_rows = [
        ["Parcel", "State", "Area (Ac)", "GIS Var%", "Encumbrance", "Dual Claim", "OCR Conf", "Status"],
        ["88/3A", "Karnataka", "2.60", "0.3%", "Rs 3.5L KCC", "No", "0.92", "Verified"],
        ["104/1", "Karnataka", "2.00", "0.4%", "NIL", "No", "0.88", "Verified"],
        ["215/2", "Karnataka", "1.50", "0.7%", "NIL", "No", "0.85", "Verified"],
        ["156/AA", "Telangana", "2.31", "17.8%", "Rs 8L Mortgage", "YES CONFLICT", "0.42", "CRITICAL"],
        ["78/B",  "Telangana", "1.80", "0.4%", "NIL", "No", "0.87", "Verified"],
        ["412/3", "Andhra Pradesh", "1.23", "0.4%", "NIL", "No", "0.83", "Verified"],
        ["189/1A","Andhra Pradesh", "1.00", "0.7%", "NIL", "No", "0.90", "Verified"],
        ["204/5B","Tamil Nadu",  "0.31", "0.8%", "NIL", "No", "0.91", "Verified"],
        ["142/2B","Maharashtra", "3.71", "17.8%","Rs 5L Mortgage", "Overlap", "0.38", "CRITICAL"],
        ["94/1",  "Maharashtra", "0.55", "0.9%", "NIL", "No", "0.72", "Pending"],
    ]

    row_c = []
    for i, row in enumerate(conflict_rows):
        if i == 0:
            row_c.append([C_INDIGO] * 8)
        elif "CRITICAL" in row[-1]:
            row_c.append(["#3a1a1a"] * 7 + ["#FC8181"])
        elif "Pending" in row[-1]:
            row_c.append(["#2a2a1a"] * 7 + ["#ECC94B"])
        else:
            row_c.append(["#1e2a1e"] * 7 + ["#68D391"])

    tbl = ax_matrix.table(cellText=conflict_rows[1:], colLabels=conflict_rows[0],
                          cellLoc="center", loc="center",
                          cellColours=row_c[1:], colColours=row_c[0])
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8)
    tbl.scale(1.0, 2.1)
    for (r, c), cell in tbl.get_celld().items():
        cell.set_edgecolor("#444")
        cell.set_text_props(color="white")
        if r == 0:
            cell.set_text_props(color="white", fontweight="bold")

    ax_matrix.set_title("Complete Conflict Matrix — All Parcels", color="white",
                         fontsize=11, fontweight="bold", pad=10)

    fig.tight_layout()
    return save(fig, "Conflict_Dashboard_Summary", 9)


# ======================================================================
# IMAGE 10 — Tamper / SHA-256 Hash Mismatch Audit Trail
# ======================================================================
def img_10_tamper_audit():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 9), facecolor=C_LIGHT)
    fig.suptitle(
        "IMAGE 10 — Tamper-Evident Audit Trail: SHA-256 Hash Mismatch Alert\n"
        "Maharashtra 7/12 Extract 142/2B — Document Integrity Compromised",
        **TITLE_FONT, y=1.01)

    ax1.set_facecolor(C_DARK)
    ax1.axis("off")
    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 12)

    events = [
        (2.0, 11.0, "2021-04-15 14:22:11", "Original Document Uploaded",
         "SHA-256: a3f9b1c4d7e2...8f21\nUploader: Sub-Registrar Wagholi",
         C_GREEN, "VERIFIED"),
        (2.0, 8.8,  "2022-08-01 09:15:44", "Mutation M-4512 Applied",
         "SHA-256: a3f9b1c4d7e2...8f21\nMutation logged, hash UNCHANGED",
         C_BLUE, "VERIFIED"),
        (2.0, 6.6,  "2023-03-12 23:58:02", "Document Accessed — Unusual Hour",
         "SHA-256: a3f9b1c4d7e2...8f21\nAccess from unknown IP: 103.21.xx.xx",
         C_YELLOW, "FLAGGED"),
        (2.0, 4.4,  "2023-03-13 01:12:19", "HASH MISMATCH DETECTED",
         "Expected: a3f9b1c4d7e2...8f21\nFound:    b8e2c5f1a0d9...3c44\nDiff: 214 fields modified",
         C_RED, "TAMPER"),
        (2.0, 2.2,  "2023-03-13 01:12:20", "Document FROZEN by System",
         "All mutations suspended\nDistrict Collector alerted\nForensic copy preserved",
         C_ORANGE, "LOCKED"),
    ]

    ax1.plot([1.2, 1.2], [0, 12], color="#444", lw=2, zorder=1)

    for (x, y, ts, action, detail, color, badge) in events:
        ax1.plot(1.2, y, "o", color=color, markersize=12, zorder=4)
        event_box = FancyBboxPatch((1.7, y - 0.85), 7.5, 1.7,
                                    boxstyle="round,pad=0.15",
                                    fc="#1e2e3e", ec=color, lw=2, zorder=3)
        ax1.add_patch(event_box)
        ax1.text(5.45, y + 0.55, ts, ha="center", fontsize=7, color="#aaa")
        ax1.text(5.45, y + 0.2,  action, ha="center", fontsize=9.5, color="white", fontweight="bold")
        ax1.text(5.45, y - 0.4,  detail, ha="center", fontsize=7.5,
                 color=C_RED if badge in ["TAMPER", "FLAGGED"] else "#ccc")
        ax1.text(9.0, y, badge, ha="center", fontsize=9, color=color, fontweight="bold",
                 bbox=dict(boxstyle="round,pad=0.2", fc="#0a1a2a", ec=color, lw=1.5))

    ax1.set_title("SHA-256 Audit Event Timeline", color="white", fontsize=11, pad=8)

    ax2.set_facecolor(C_DARK)
    ax2.axis("off")
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 12)
    ax2.set_title("Document Field Diff (Before vs After Tamper)", color="white",
                  fontsize=11, pad=8)

    diff_rows = [
        ("Survey Number",    "142/2B",          "142/2B",          "MATCH"),
        ("Owner Name",       "Nishu Kumar",      "Ramesh Patil",    "CHANGED"),
        ("Area (Ha)",        "1.500",            "1.500",           "MATCH"),
        ("Mutation No.",     "M-4512",           "M-9999",          "CHANGED"),
        ("Encumbrance",      "Bank of MH Rs5L",  "NIL",             "CHANGED"),
        ("Stamp Duty",       "Rs 24,500",        "Rs 24,500",       "MATCH"),
        ("Date of Doc",      "2021-04-15",       "2021-04-15",      "MATCH"),
        ("OCR Signature",    "SIG-REAL-001",     "SIG-FAKE-999",    "CHANGED"),
        ("Issuing Authority","Sub-Reg Wagholi",  "Sub-Reg Pune",    "CHANGED"),
        ("SHA-256 Hash",     "a3f9b1c4...8f21",  "b8e2c5f1...3c44", "MISMATCH"),
    ]

    header_y = 11.5
    ax2.text(2.0, header_y, "Field",          color="white", fontsize=9, fontweight="bold", ha="center")
    ax2.text(4.5, header_y, "Original",       color=C_GREEN, fontsize=9, fontweight="bold", ha="center")
    ax2.text(7.0, header_y, "Tampered",       color=C_RED,   fontsize=9, fontweight="bold", ha="center")
    ax2.text(9.2, header_y, "Status",         color="white", fontsize=9, fontweight="bold", ha="center")
    ax2.axhline(header_y - 0.25, color="#555", lw=1.5, xmin=0.05, xmax=0.97)

    for i, (field, orig, tampered, status) in enumerate(diff_rows):
        y = 10.5 - i * 1.05
        bg_color = "#3a1a1a" if status in ["CHANGED", "MISMATCH"] else "#1a3a1a"
        row_box = FancyBboxPatch((0.2, y - 0.4), 9.5, 0.8,
                                  boxstyle="square,pad=0.05",
                                  fc=bg_color, ec="#444", lw=0.8, zorder=2)
        ax2.add_patch(row_box)

        ax2.text(2.0, y, field,    color="white", fontsize=8,  ha="center", va="center")
        ax2.text(4.5, y, orig,     color=C_GREEN, fontsize=8,  ha="center", va="center")
        t_color = C_RED if status in ["CHANGED", "MISMATCH"] else C_GREEN
        ax2.text(7.0, y, tampered, color=t_color, fontsize=8,  ha="center", va="center", fontweight="bold")
        ax2.text(9.2, y, status,   color=t_color, fontsize=7.5, ha="center", va="center", fontweight="bold")

    summary_box = FancyBboxPatch((0.2, -0.5), 9.5, 0.9,
                                  boxstyle="round,pad=0.2",
                                  fc="#3a0a0a", ec=C_RED, lw=2.5, zorder=6)
    ax2.add_patch(summary_box)
    ax2.text(5.0, -0.05,
             "5 of 10 Fields TAMPERED  |  Document SHA-256 INVALID  |  FROZEN & REFERRED TO DISTRICT COLLECTOR",
             ha="center", va="center", fontsize=8, color=C_RED, fontweight="bold")

    fig.tight_layout(pad=1.5)
    return save(fig, "Tamper_SHA256_Audit_Trail", 10)


# ======================================================================
# MAIN
# ======================================================================
if __name__ == "__main__":
    print("\nLand AI — Conflict and Overlap Sample Image Generator")
    print("=" * 65)

    paths = []
    generators = [
        img_01_area_mismatch,
        img_02_boundary_overlap,
        img_03_dual_ownership,
        img_04_encumbrance,
        img_05_mutation_chain,
        img_06_phantom_hissa,
        img_07_state_boundary,
        img_08_ocr_confidence,
        img_09_dashboard,
        img_10_tamper_audit,
    ]

    for gen in generators:
        try:
            p = gen()
            paths.append(p)
        except Exception as e:
            print(f"  ERROR in {gen.__name__}: {e}")
            import traceback
            traceback.print_exc()

    print(f"\nGenerated {len(paths)}/10 images in: {OUTPUT_DIR}/")
    print("\nSummary:")
    for p in paths:
        print(f"     {os.path.basename(p)}")
