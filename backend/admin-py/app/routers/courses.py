from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import current_user
from ..models import Course
from ..main import templates

router = APIRouter()
PAGE_SIZE = 25


@router.get("/courses", response_class=HTMLResponse)
async def list_courses(
    request: Request,
    page: int = Query(1, ge=1),
    q: str = Query(""),
    db: Session = Depends(get_db),
    user=Depends(current_user),
):
    query = db.query(Course)
    if q:
        like = f"%{q}%"
        query = query.filter(Course.title.ilike(like))
    total = query.count()
    courses = (
        query.order_by(Course.createdAt.desc())
        .offset((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .all()
    )
    return templates.TemplateResponse(
        "courses.html",
        {
            "request": request,
            "user": user,
            "courses": courses,
            "total": total,
            "page": page,
            "page_size": PAGE_SIZE,
            "q": q,
        },
    )
