# Phase 1: Project Foundation Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (with venv)
- Docker & Docker Compose

## Quick Start

### 1. Database & Cache Services
Start PostgreSQL (with PostGIS) and Redis using Docker Compose:
```bash
docker compose up -d
```

### 2. Backend (FastAPI)
```bash
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
- Health Check: http://localhost:8000/health
- Swagger Docs: http://localhost:8000/api/v1/docs

### 3. Frontend (Next.js)
```bash
cd apps/web
npm run dev
```
- Web Application: http://localhost:3000
