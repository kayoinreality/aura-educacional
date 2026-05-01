from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from fastapi import Request, Response
import bcrypt
from sqlalchemy.orm import Session
from .config import settings
from .models import User

SESSION_COOKIE = "aura_admin_session"
_serializer = URLSafeTimedSerializer(settings.admin_py_session_secret)


class AuthenticationRequired(Exception):
    pass


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or user.role not in ("ADMIN", "INSTRUCTOR"):
        return None
    if not user.passwordHash:
        return None
    try:
        if not bcrypt.checkpw(password.encode(), user.passwordHash.encode()):
            return None
    except Exception:
        return None
    return user


def set_session_cookie(response: Response, user_id: str) -> None:
    token = _serializer.dumps(user_id)
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=settings.admin_py_secure_cookies,
        samesite="lax",
        max_age=60 * 60 * 8,
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE)


def current_user(request: Request, db: Session) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise AuthenticationRequired()
    try:
        user_id = _serializer.loads(token, max_age=60 * 60 * 8)
    except (BadSignature, SignatureExpired):
        raise AuthenticationRequired()
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ("ADMIN", "INSTRUCTOR"):
        raise AuthenticationRequired()
    return user
