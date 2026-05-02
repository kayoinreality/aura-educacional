from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..auth import current_user
from ..models import User
from ..main import templates

router = APIRouter()
PAGE_SIZE = 25


@router.get("/users", response_class=HTMLResponse)
async def list_users(
    request: Request,
    page: int = Query(1, ge=1),
    q: str = Query(""),
    db: Session = Depends(get_db),
    user=Depends(current_user),
):
    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(User.email.ilike(like), User.firstName.ilike(like), User.lastName.ilike(like))
        )
    total = query.count()
    users = query.order_by(User.createdAt.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()
    return templates.TemplateResponse(
        "users.html",
        {
            "request": request,
            "user": user,
            "users": users,
            "total": total,
            "page": page,
            "page_size": PAGE_SIZE,
            "q": q,
        },
    )
