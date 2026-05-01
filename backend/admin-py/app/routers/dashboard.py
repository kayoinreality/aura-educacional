from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..auth import current_user
from ..models import User, Course, Enrollment, Payment
from ..main import templates

router = APIRouter()


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(current_user),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_courses = db.query(func.count(Course.id)).scalar()
    total_enrollments = db.query(func.count(Enrollment.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.status == "PAID"
    ).scalar()

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "user": user,
            "stats": {
                "users": total_users,
                "courses": total_courses,
                "enrollments": total_enrollments,
                "revenue": total_revenue,
            },
        },
    )
