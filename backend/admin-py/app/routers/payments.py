from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..auth import current_user
from ..models import Payment
from ..main import templates

router = APIRouter()
PAGE_SIZE = 25


@router.get("/payments", response_class=HTMLResponse)
async def list_payments(
    request: Request,
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    user=Depends(current_user),
):
    total = db.query(Payment).count()
    payments = (
        db.query(Payment)
        .options(joinedload(Payment.student), joinedload(Payment.course))
        .order_by(Payment.createdAt.desc())
        .offset((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .all()
    )
    return templates.TemplateResponse(
        "payments.html",
        {
            "request": request,
            "user": user,
            "payments": payments,
            "total": total,
            "page": page,
            "page_size": PAGE_SIZE,
        },
    )
