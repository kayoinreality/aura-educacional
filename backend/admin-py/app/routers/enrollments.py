from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..auth import current_user
from ..models import Enrollment
from ..main import templates

router = APIRouter()
PAGE_SIZE = 25


@router.get("/enrollments", response_class=HTMLResponse)
async def list_enrollments(
    request: Request,
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    user=Depends(current_user),
):
    total = db.query(Enrollment).count()
    enrollments = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.student), joinedload(Enrollment.course))
        .order_by(Enrollment.createdAt.desc())
        .offset((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .all()
    )
    return templates.TemplateResponse(
        "enrollments.html",
        {
            "request": request,
            "user": user,
            "enrollments": enrollments,
            "total": total,
            "page": page,
            "page_size": PAGE_SIZE,
        },
    )
