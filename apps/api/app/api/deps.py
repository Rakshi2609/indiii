from typing import Annotated, Any, List, Optional
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False
)


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[Optional[str], Depends(oauth2_scheme)] = None
) -> User:
    """Retrieve and validate the authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Ensure the authenticated user is currently active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return current_user


def get_optional_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[Optional[str], Depends(oauth2_scheme)] = None
) -> Optional[User]:
    """Optionally resolve authenticated user if token is present; returns None otherwise."""
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        pass
    return None


class RoleChecker:
    """
    Callable dependency to enforce Role-Based Access Control (RBAC).
    Checks whether the authenticated user has one of the allowed roles.
    """

    def __init__(self, allowed_roles: Any):
        flat_roles = []
        if isinstance(allowed_roles, (list, tuple, set)):
            for r in allowed_roles:
                if isinstance(r, (list, tuple, set)):
                    flat_roles.extend(r)
                else:
                    flat_roles.append(r)
        else:
            flat_roles.append(allowed_roles)
        self.allowed_roles = flat_roles

    def __call__(
        self,
        current_user: Annotated[User, Depends(get_current_active_user)]
    ) -> User:
        if current_user.is_superuser:
            return current_user
        if current_user.role not in self.allowed_roles:
            role_strs = [r.value if hasattr(r, "value") else str(r) for r in self.allowed_roles]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {role_strs}"
            )
        return current_user


def require_roles(*allowed_roles: Any):
    """Convenience helper creating a RoleChecker dependency supporting both varargs and lists."""
    return RoleChecker(allowed_roles)
