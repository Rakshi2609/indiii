import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

class GovtCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle preflight OPTIONS requests directly for govt endpoints
        if request.method == "OPTIONS" and request.url.path.startswith("/api/govt/"):
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PATCH, PUT, DELETE"
            response.headers["Access-Control-Allow-Headers"] = "X-API-Key, Authorization, Content-Type, api_key"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response
            
        response = await call_next(request)
        if request.url.path.startswith("/api/govt/"):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PATCH, PUT, DELETE"
            response.headers["Access-Control-Allow-Headers"] = "X-API-Key, Authorization, Content-Type, api_key"
        return response

from app.core.config import settings
from app.db.database import init_db
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.records import router as records_router
from app.api.verification import router as verification_router
from app.api.gis import router as gis_router
from app.api.analytics import router as analytics_router
from app.api.audit import router as audit_router
from app.api.intelligence import router as intelligence_router
from app.api.copilot import router as copilot_router
from app.api.owner import router as owner_router
from app.api.govt import router as govt_router
from app.api.v1.api import api_router
from app.schemas.health import HealthResponse

# Configure root logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown events."""
    logger.info("Starting Land AI API Service...")
    # Initialize database tables on startup
    init_db()
    yield
    logger.info("Shutting down Land AI API Service...")


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(GovtCORSMiddleware)

    # Root health endpoint
    @app.get("/health", response_model=HealthResponse, tags=["Health"])
    def root_health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            app_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc)
        )

    # Authentication router
    app.include_router(auth_router, prefix="/api/auth")

    # Documents upload & processing router
    app.include_router(documents_router, prefix="/api/documents")

    # Land Records & Evidence router
    app.include_router(records_router, prefix="/api/records")

    # Human Verification & Active Learning router
    app.include_router(verification_router, prefix="/api/verification")

    # GIS & Cadastral Mapping router
    app.include_router(gis_router, prefix="/api/parcels")
    app.include_router(gis_router, prefix="/api/gis")

    # Analytics & Metrics router
    app.include_router(analytics_router, prefix="/api/analytics")

    # Enterprise Audit Trail router
    app.include_router(audit_router, prefix="/api/audit")

    # Land Intelligence, History Timeline & Lineage Engine router
    app.include_router(intelligence_router, prefix="/api/intelligence")

    # Land AI Copilot & Grounded Reasoning Chatbot router
    app.include_router(copilot_router, prefix="/api/copilot")

    # Owner Land Vault & Personal Intelligence Portal router
    app.include_router(owner_router, prefix="/api/owner")

    # Government Open API Integration
    app.include_router(govt_router, prefix="/api/govt")

    # API v1 routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
