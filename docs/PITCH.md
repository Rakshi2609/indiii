# Land AI — 3-Minute Hackathon Pitch Script

> **Product**: Land AI — Automated Land Record Intelligence, Indic Document AI & Cadastral GIS Platform  
> **Target Audience**: Hackathon Judges, Revenue Department Officials, Urban Planners, Banking Underwriters  
> **Duration**: Exactly 3 Minutes (180 Seconds)

---

## ⏱️ Act 1: The Problem & Core Insight (0:00 – 0:30)

**[Speaker starts with high energy and confidence]**

> "Judges, in India today, over **66% of all civil litigation** is tied to land and property disputes. That locks up over **$200 Billion in stalled infrastructure projects, contested bank mortgages, and generational family conflicts**."

> "Why? Because across India's 600,000+ villages, land records exist as fragile, handwritten, multilingual paper extracts — **7/12 Satbara in Maharashtra, RTC Pahani in Karnataka, and Jamabandi in Punjab**. When state governments attempt digitization, manual data entry takes decades and introduces severe human error."

> **Our Core Insight**: Land intelligence cannot be solved by generic OCR alone. It requires **Indic-specialized multi-modal Document AI** coupled directly with **PostGIS geodetic cadastral mapping and automated title consistency engines**."

---

## ⏱️ Act 2: The Hero Demo Walkthrough (0:30 – 1:30)

**[Screen switches to Live Demo at `http://localhost:3000`]**

### 1. Document AI Upload (15s)
> *"Let's see Land AI in action. I will upload a multi-column, bilingual Maharashtra 7/12 Satbara deed from Wagholi, Pune. We select **High-Accuracy Ensemble Mode** and hit Extract."*

### 2. Multi-Model Extraction & Schema Mapping (15s)
> *"In real time, our AI router invokes **Sarvam Vision 1.5** for Devanagari numerals and Indic entity extraction, while cross-checking layout structures with **Mistral OCR (`mistral-ocr-latest`)**. Within 2 seconds, it normalizes Khatadars, Survey Number 142/2A, and 1.50 Hectares of land into a strictly validated typed schema."*

### 3. Spatial GIS Cadastral Boundary Check (15s)
> *"Now, look at the Cadastral GIS map. Land AI automatically queries our **PostGIS cadastral vector database** and computes the geodetic polygon area of Survey 142/2A. It instantly flags a **Spatial Boundary Discrepancy** — the deed claims 2.50 Hectares, but the surveyed physical polygon is only 1.50 Hectares, catching an encroachment before it becomes a lawsuit!"*

### 4. Human-in-the-Loop Active Learning (15s)
> *"In our **Side-by-Side Verification Workspace**, a revenue officer inspects the original deed with bounding box citations, applies a one-click correction, and marks it verified. Every keystroke is immutably logged into our **Enterprise Audit Trail** for model active learning."*

---

## ⏱️ Act 3: Technical Architecture & Resiliency (1:30 – 2:00)

**[Slide / Screen highlights Monorepo Architecture & Telemetry]**

> *"Under the hood, Land AI is built for mission-critical enterprise scale:*
> 1. **Resilient AI Router**: Features an automatic multi-tier fallback: **Sarvam Vision 1.5 $\rightarrow$ Mistral OCR $\rightarrow$ Google Gemini 1.5 Pro**. If an upstream API ever experiences downtime, the system fails over seamlessly with zero user disruption.
> 2. **Cadastral PostGIS Engine**: Executes geodetic polygon math using WGS84 coordinates and spatial containment checks.
> 3. **Fuzzy Title Chain Reconstructor**: Utilizes RapidFuzz Levenshtein scoring to match transliterated owner names across 30+ years of inheritance mutations.
> 4. **Enterprise RBAC & Audit**: 6-role statutory access control with full mutation diff tracking."*

---

## ⏱️ Act 4: Impact, Scale & Next Steps (2:00 – 2:30)

> *"What is the real-world impact?*
> - **100x Faster Digitization**: Accelerates state land registry digitization from 15 years down to 3 months.
> - **Instant Mortgage Clearances**: Enables rural farmers to secure agricultural bank credit in minutes rather than weeks.
> - **Dispute Prevention**: Proactively identifies duplicate deeds, overlapping subdivisions, and illegal encroachments."*

> *"**Next Steps**: We are expanding support to 12 Indian regional languages, integrating drone LiDAR orthophoto overlays, and piloting directly with state land administration departments.*

> **"Land AI — Powering transparent, verifiable, dispute-free land governance for India. Thank you!"**

---

## 🎯 Judge FAQ Preparation & Cheat Sheet

| Question | Recommended Answer |
| :--- | :--- |
| **How do you handle degraded or handwritten historical deeds?** | We use Google Gemini 1.5 Pro and Sarvam Vision's multi-modal reasoning fallback specifically tuned on Devanagari, Kannada, and Nastaliq scripts with human verification for marginal confidence scores. |
| **What if two models disagree during extraction?** | In High-Accuracy mode, our AI router calculates an `overall_agreement_score`. Discrepancies in survey numbers, area, or owners are flagged as `ValidationResult` items in the officer review queue. |
| **How does spatial verification work?** | We project cadastral WGS84 GeoJSON polygons with centroid latitude scaling into metric surface areas, comparing against extracted deed extents with a 5% tolerance threshold. |
