import logging
from datetime import timedelta
from typing import Annotated, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token
)
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.record import LandRecord
from app.schemas.user import (
    Token,
    UserCreate,
    UserLogin,
    UserResponse
)
from app.api.deps import get_current_active_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication & Role Management"])


def ensure_demo_users_seeded(db: Session):
    """Seed or update demo accounts (Owner, Revenue Officer, Admin) and link demo records."""
    demo_accounts = [
        {
            "email": "nishu@demo.landai",
            "password": "LandAI@123",
            "full_name": "Nishu Kumar",
            "role": UserRole.OWNER,
            "is_superuser": False
        },
        {
            "email": "officer@demo.landai",
            "password": "LandAI@123",
            "full_name": "P. V. Rajesh (Revenue Officer)",
            "role": UserRole.REVENUE_OFFICER,
            "is_superuser": False
        },
        {
            "email": "admin@demo.landai",
            "password": "LandAI@123",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN,
            "is_superuser": True
        },
    ]

    for acc in demo_accounts:
        user = db.query(User).filter(User.email == acc["email"]).first()
        if not user:
            user = User(
                email=acc["email"],
                hashed_password=get_password_hash(acc["password"]),
                full_name=acc["full_name"],
                role=acc["role"],
                is_active=True,
                is_superuser=acc["is_superuser"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created seeded demo user: {acc['email']} [{acc['role']}]")
        else:
            # Ensure role and password are correct
            user.role = acc["role"]
            user.full_name = acc["full_name"]
            user.is_active = True
            db.commit()

        # If Nishu, link all records where "Nishu" appears in owners_data or records
        if acc["email"] == "nishu@demo.landai":
            try:
                records = db.query(LandRecord).all()
                for r in records:
                    # If Nishu is in owners_data, link to this user
                    is_nishu = False
                    if r.owners_data:
                        for o in r.owners_data:
                            name = (o.get("name") or "").lower()
                            if "nishu" in name:
                                is_nishu = True
                                break
                    if is_nishu or r.owner_user_id is None:
                        r.owner_user_id = user.id
                db.commit()
            except Exception as e:
                logger.warning(f"Error linking records to Nishu: {e}")


@router.post("/login", response_model=Token, summary="OAuth2 form login")
def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)]
) -> Token:
    """OAuth2 compatible token login via form data, get access token."""
    ensure_demo_users_seeded(db)

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires,
        extra_claims={
            "email": user.email,
            "role": role_val,
            "full_name": user.full_name,
            "is_superuser": user.is_superuser
        }
    )

    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/login-json", response_model=Token, summary="JSON payload login")
def login_json(
    login_data: UserLogin,
    db: Annotated[Session, Depends(get_db)]
) -> Token:
    """Enterprise JSON payload login for Next.js frontend and institutional clients."""
    ensure_demo_users_seeded(db)

    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires,
        extra_claims={
            "email": user.email,
            "role": role_val,
            "full_name": user.full_name,
            "is_superuser": user.is_superuser
        }
    )

    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/seed-demo-users", summary="Explicitly seed and link demo accounts")
def seed_demo_accounts(
    db: Annotated[Session, Depends(get_db)]
) -> Dict[str, Any]:
    """Manually trigger demo accounts generation and ownership linking."""
    ensure_demo_users_seeded(db)
    return {
        "message": "Demo accounts initialized successfully.",
        "accounts": [
            {"email": "nishu@demo.landai", "role": "OWNER", "name": "Nishu Kumar"},
            {"email": "officer@demo.landai", "role": "REVENUE_OFFICER", "name": "P. V. Rajesh (Revenue Officer)"},
            {"email": "admin@demo.landai", "role": "ADMIN", "name": "System Administrator"}
        ]
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a provisioned user")
def register_user(
    user_in: UserCreate,
    db: Annotated[Session, Depends(get_db)]
) -> UserResponse:
    """Register a provisioned user account."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
        is_superuser=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.get("/me", response_model=UserResponse, summary="Get current logged in user")
def get_user_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> UserResponse:
    """Retrieve details of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
