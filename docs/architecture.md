# Land AI Platform Architecture

## System Overview
Land AI is an intelligent land record digitization, title verification, cadastral analysis, and dispute prediction platform designed for Indian land governance and property transactions.

```
+-------------------------------------------------------------------------+
|                               Next.js Web (apps/web)                    |
|  - Cadastral Map Viewer  - Document Upload  - Risk Verification UI     |
+-------------------------------------------------------------------------+
                                    |
                                    v (REST / WebSockets)
+-------------------------------------------------------------------------+
|                              FastAPI (apps/api)                         |
|  - /api/v1/health       - OCR / AI Pipeline  - Cadastral GIS Engine     |
+-------------------------------------------------------------------------+
        |                                                 |
        v                                                 v
+-------------------------------+             +---------------------------+
| PostgreSQL 15 + PostGIS 3.3   |             | Redis 7 (Cache & Celery)  |
| - Spatial Geometries          |             | - Job queues              |
| - 7/12 & Mutation Ledgers     |             | - Session & cache store   |
+-------------------------------+             +---------------------------+
```

## Monorepo Layout
- **`apps/web`**: Next.js 14+ App Router, Tailwind CSS, Lucide icons, Shadcn/UI foundation.
- **`apps/api`**: FastAPI backend with SQLAlchemy ORM, GeoAlchemy2, Celery tasks, and AI integrations (Sarvam, Mistral, Gemini).
- **`packages/schemas`**: Shared TypeScript & Python type schemas.
- **`packages/shared`**: Shared constants, state-specific revenue record formats, and utility helpers.
- **`data/samples`**: Sample revenue records (7/12 extracts, RTCs, Jamabandis, etc.).
- **`docker`**: Dockerfiles, docker-compose, and PostgreSQL/PostGIS initialization scripts.
- **`docs`**: System architecture, setup documentation, and API specifications.
