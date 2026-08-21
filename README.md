<div align="center">

# 🏛️ Land AI (इंडी-भूमि)

### **Next-Generation Land Record Intelligence, Indic Document AI & Cadastral GIS Verification Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL & PostGIS](https://img.shields.io/badge/PostGIS-3.3-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_Vision-1.5-FF6F00?style=for-the-badge)](https://www.sarvam.ai)
[![Mistral OCR](https://img.shields.io/badge/Mistral_OCR-Latest-F43F5E?style=for-the-badge)](https://mistral.ai)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-Satellite_GIS-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Tests](https://img.shields.io/badge/Pytest-50%20Passed-emerald?style=for-the-badge)](#-automated-testing-suite)

*Transforming complex, unstructured historical Indian land revenue records into tamper-evident, spatially verified digital cadastral intelligence.*

[🎯 3-Minute Hackathon Pitch](docs/PITCH.md) • [📊 Executive Dashboard](http://localhost:3000/dashboard) • [🗺️ Cadastral Satellite GIS](http://localhost:3000/gis) • [✍️ Verification Workbench](http://localhost:3000/verification) • [📑 Swagger API Docs](http://localhost:8000/docs)

</div>

---

## 📖 Table of Contents

- [The Problem & Domain Context](#-the-problem--domain-context)
- [Key Features & Highlights](#-key-features--highlights)
- [System Architecture](#-system-architecture)
- [Multi-Model AI Extraction Pipeline](#-multi-model-ai-extraction-pipeline)
- [Live Satellite Cadastral GIS Explorer](#-live-satellite-cadastral-gis-explorer)
- [Human-in-the-Loop Active Learning Workbench](#-human-in-the-loop-active-learning-workbench)
- [Demo Manager & Document Deletion](#-demo-manager--document-deletion)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Quickstart: Run Locally in 3 Steps](#-quickstart-run-locally-in-3-steps)
- [Environment Configuration](#-environment-configuration)
- [Automated Testing Suite](#-automated-testing-suite)
- [Frontend Navigation Directory](#-frontend-navigation-directory)
- [License & Hackathon Submission](#-license--hackathon-submission)

---

## 🚨 The Problem & Domain Context

In India today, **over 66% of all civil litigation** is tied to land and property ownership disputes. This single issue locks up more than **$200 Billion** in stalled infrastructure, delayed housing projects, and contested agricultural mortgages.

### The Core Challenges:
1. **Multilingual, Degraded Paper Extracts**: Historical revenue deeds (**7/12 Satbara in Maharashtra, RTC Pahani in Karnataka, Vikraya Dastaaveju in Andhra Pradesh, Patta Vilekh in Rajasthan, Jamabandi in Punjab/Haryana, Khatauni in UP**) are handwritten or poorly printed across dozens of regional Indic scripts.
2. **Generic OCR Failures**: Mainstream Western OCR engines fail to parse Indic tabular structures, Devanagari numerals (१, २, ३...), and regional revenue terminology (*Hissa, Pot-Kharaba, Khatadar, Cultivable vs. Uncultivable Extents*).
3. **Deed vs. Physical Ground Discrepancies**: Written deeds frequently claim land areas that contradict actual surveyed physical cadastral polygons.
4. **Fraudulent Mutations & Broken Succession Chains**: Lack of fuzzy phonetic matching enables duplicate title sales and unverified mutation entries.

---

## 🌟 Key Features & Highlights

| Feature | Description |
| :--- | :--- |
| **Indic Document AI** | Autonomous multi-lingual vision OCR tuned for Indian revenue records powered by **Google Gemini 2.0 / 1.5 Flash Vision**, **Sarvam Vision**, and **Mistral OCR**. |
| **Resilient AI Router** | Automated failover chain (**Gemini $\rightarrow$ Sarvam $\rightarrow$ Mistral**) with High-Accuracy ensemble cross-validation and zero manual language selection required. |
| **Live Satellite GIS Engine** | Interactive high-resolution satellite imagery (Esri World Imagery / CartoDB Dark) overlaid with PostGIS WGS-84 cadastral polygon boundaries and $5\%$ discrepancy flags. |
| **Fuzzy Title Chain Matcher** | Levenshtein-based entity normalization using RapidFuzz to resolve transliterated owner names across decades of mutation ledgers. |
| **Active Learning Workbench** | Side-by-side deed viewer with real uploaded image rendering, bounding box citations, active learning field corrections, and statutory approval workflows. |
| **Demo-Friendly Repository Manager** | 1-Click single deed deletion and bulk demo reset to clear all test records instantly during presentations. |
| **Enterprise Side Navigation** | Palantir/Linear grade floating collapsible sidebar with `⌘K` command search, Indic sub-labels, AI engine status indicator, and RBAC switcher. |
| **Enterprise RBAC & Audit Trail** | 6 statutory revenue roles with tamper-evident, JSON-diffed audit logging for every deed mutation. |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Multilingual Land Deed PDF / JPG / PNG] --> B[FastAPI Gateway :8000]
    
    subgraph AI Intelligence Layer
        B --> C{Resilient AI Router}
        C -->|Primary Vision & Reasoning| D[Google Gemini 2.0 / 1.5 Flash]
        C -->|Indic Language Specialist| E[Sarvam Vision 1.5 API]
        C -->|Layout & Tables| F[Mistral OCR - mistral-ocr-latest]
    end
    
    subgraph Data & Verification Core
        D --> G[Schema Extraction Service]
        E --> G
        F --> G
        G --> H[(PostgreSQL 15 + PostGIS 3.3)]
        G --> I[Validation & Arithmetic Engine]
        I -->|Spatial Cross-Check| J[PostGIS Cadastral Parcels]
        I -->|Fuzzy Title Resolution| K[RapidFuzz Entity Matcher]
    end
    
    subgraph Presentation & Review Layer
        I --> L[Officer Verification Queue]
        L --> M[Next.js 16 App Router UI :3000]
        M --> N[Leaflet Live Satellite GIS Explorer]
        M --> O[Side-by-Side Review Workbench]
        M --> P[Executive Telemetry Dashboard]
        M --> Q[Enterprise Audit Trail & Demo Manager]
    end
```

---

## 🤖 Multi-Model AI Extraction Pipeline

Land AI features an **AIRouter** designed for mission-critical uptime during high-volume state digitization drives:

```python
# Processing Modes:
# 1. Standard Mode: Gemini 2.0/1.5 Flash -> Sarvam Vision -> Mistral OCR Fallback
# 2. High-Accuracy Ensemble: Multi-Model Cross-Validation with Agreement Scoring
```

- **Automatic Language & Script Detection**: The model inspects raw pixels to automatically detect Telugu, Hindi, Marathi, Kannada, Tamil, or Gujarati without requiring user dropdown selection.
- **Form Classification**: Automatically categorizes documents as *7/12 Satbara*, *Patta Vilekh*, *Vikraya Dastaaveju (Sale Deed)*, *RTC Pahani*, or *Jamabandi*.
- **Ensemble Agreement Score**: Compares extracted survey numbers, land areas, and owner names across independent models to flag ambiguities before human sign-off.

---

## 🗺️ Live Satellite Cadastral GIS Explorer

Land AI connects extracted legal deed text with real-world spatial geometries on an interactive vector map ([`/gis`](http://localhost:3000/gis)):

1. **High-Resolution Satellite Imagery**: Powered by Esri World Imagery with toggles for CartoDB Dark Command and OpenStreetMap.
2. **Geodetic Polygon Projection**: Computes true ground surface area from WGS-84 GeoJSON polygons with centroid latitude scaling.
3. **Spatial Boundary Validation**: Calculates $\Delta = \frac{|\text{Extracted Area} - \text{Cadastral Polygon Area}|}{\text{Cadastral Polygon Area}} \times 100\%$.
4. **Discrepancy Flagging**: If $\Delta > 5\%$, the validation engine automatically marks the plot as `FLAGGED_FOR_REVIEW` (amber) or `REJECTED_CRITICAL` (red).
5. **Interactive Inspector**: Click any parcel to inspect Khatadars, GIS area, and jump straight into the human verification workbench.

---

## ✍️ Human-in-the-Loop Active Learning Workbench

Revenue officers inspect flagged records in a high-efficiency split-screen interface ([`/verification/[id]`](http://localhost:3000/verification/1)):

- **Left Pane**: Original high-resolution uploaded deed viewer with zoom, rotate, and interactive bounding box citations.
- **Right Pane**: Structured, typed revenue schemas (Administrative, Land Extents, Khatadars, Mutation History, Encumbrances).
- **Active Learning**: In-place field editing logs correction diffs to the audit table, enabling continuous model fine-tuning.
- **One-Click Actions**: `[ ACCEPT / APPROVE ]`, `[ EDIT & SAVE ]`, and `[ REJECT ]` with mandatory statutory reasoning.

---

## 🗑️ Demo Manager & Document Deletion

To ensure smooth, repeatable hackathon demonstrations:
- **Single Document Deletion**: Delete individual deeds and clean up associated database records with cascading removal via `DELETE /api/documents/{id}` or the red trash icon on `/upload` and `/verification`.
- **1-Click Demo Reset**: Wipe all uploaded test files and re-initialize the clean state using the **"Reset Demo Data"** button (`DELETE /api/documents/reset/demo`).

---

## 📡 API Endpoints Reference

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Live telemetry & service status |
| **Documents** | `POST` | `/api/documents/upload` | Multi-file deed upload & metadata storage |
| **Documents** | `GET` | `/api/documents/` | Paginated document listing |
| **Documents** | `POST` | `/api/documents/{id}/process` | Trigger Gemini / Sarvam / Mistral extraction |
| **Documents** | `DELETE` | `/api/documents/{id}` | Delete document file and associated land record |
| **Documents** | `DELETE` | `/api/documents/reset/demo` | Bulk wipe all demo documents and records |
| **Records** | `GET` | `/api/records/{id}` | Fetch typed LandRecord & Evidence citations |
| **Records** | `POST` | `/api/records/{id}/validate` | Execute rule-based & arithmetic checks |
| **Duplicates** | `GET` | `/api/records/{id}/duplicates` | RapidFuzz similarity check for duplicate titles |
| **Verification** | `GET` | `/api/verification/queue` | List records requiring human review |
| **Verification** | `POST` | `/api/verification/{id}/approve` | Mark record as certified/verified |
| **Verification** | `POST` | `/api/verification/{id}/correct` | Apply officer field corrections & log diff |
| **Verification** | `POST` | `/api/verification/{id}/reject` | Reject invalid deed with statutory reason |
| **GIS** | `GET` | `/api/gis/parcels` | Fetch cadastral vector polygons as GeoJSON |
| **Analytics** | `GET` | `/api/analytics/overview` | Executive KPI counts and accuracy rates |
| **Analytics** | `GET` | `/api/analytics/districts` | Geographic digitization progress breakdown |
| **Audit** | `GET` | `/api/audit/` | Tamper-evident mutation logs & RBAC events |
| **Auth** | `POST` | `/api/auth/login` | JWT OAuth2 authentication |

---

## 🚀 Quickstart: Run Locally in 3 Steps

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Python 3.11+](https://www.python.org/)
- [Node.js 18+ & npm](https://nodejs.org/)

---

### Step 1: Start PostGIS & Redis Containers
```bash
# Clone the repository and navigate to root
git clone https://github.com/Rakshi2609/indiii.git
cd indiii

# Start PostgreSQL with PostGIS extension and Redis cache in background
docker compose up -d
```

---

### Step 2: Start the FastAPI Backend Service
```bash
# Navigate to the API service directory
cd apps/api

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> 📍 Backend is live at **`http://localhost:8000`**  
> 📑 Swagger API Documentation at **`http://localhost:8000/docs`**

---

### Step 3: Start the Next.js Frontend Application
```bash
# In a separate terminal, navigate to the web directory
cd apps/web

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
> 📍 Frontend is live at **`http://localhost:3000`**

---

## 🔐 Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Database (PostgreSQL 15 with PostGIS 3.3)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=land_ai
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/land_ai

# Cache & Message Broker (Redis 7)
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# Security & Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI Provider API Keys
SARVAM_API_KEY=sk_f4oo25uk_59C09CLDoRG6IPspjTmqwm8S
MISTRAL_API_KEY=yH4JVt2jjBPoGHaEdfhsV75lkX5AIhJL
GEMINI_API_KEY=AIzaSyD2UWRsMl15Yxr9BdyRB5aL4UyEC0EcE6U

# Application Settings
API_PORT=8000
WEB_PORT=3000
ENVIRONMENT=development
UPLOAD_DIR=data/uploads
MAX_UPLOAD_SIZE_MB=50
```

---

## 🧪 Automated Testing Suite

The repository is covered by comprehensive automated test suites across backend and frontend:

```bash
# 1. Run all 50 Backend Integration & Unit Tests (Pytest)
cd apps/api
source .venv/bin/activate
pytest -v

# 2. Build and Verify Next.js App Router Frontend
cd apps/web
npm run build
```

---

## 🧭 Frontend Navigation Directory

| Route | Interface Name | Purpose |
| :--- | :--- | :--- |
| [`/`](http://localhost:3000/) | **Home Overview** | Monorepo architecture overview & service status matrix |
| [`/upload`](http://localhost:3000/upload) | **Deed Upload & Demo Manager** | 1-Click sample deed upload, autonomous language recognition, document directory, and demo reset |
| [`/dashboard`](http://localhost:3000/dashboard) | **Executive Dashboard** | District digitization KPIs, document throughput, conflict tracking |
| [`/gis`](http://localhost:3000/gis) | **Satellite GIS Map** | Interactive Esri satellite imagery with PostGIS cadastral polygon boundary overlay |
| [`/verification`](http://localhost:3000/verification) | **Verification Queue** | Priority officer queue for records with low confidence or conflicts with direct delete action |
| [`/verification/[id]`](http://localhost:3000/verification/1) | **Review Workbench** | Side-by-side deed inspection with bounding box citations & active learning editing |
| [`/audit`](http://localhost:3000/audit) | **Enterprise Audit Trail** | Tamper-evident ledger of all deed edits, approvals, and RBAC actions |

---

## 📄 License & Hackathon Submission

Developed for the **Smart India Hackathon (SIH)** under the open-source **MIT License**.

<div align="center">
<sub>Built with ❤️ for Indian Land Governance Transparency & Digitization</sub>
</div>
