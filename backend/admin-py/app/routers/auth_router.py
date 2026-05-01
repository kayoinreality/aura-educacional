from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import authenticate, set_session_cookie, clear_session_cookie, current_user, AuthenticationRequired
from ..main import templates

router = APIRouter()


@router.get("/auth/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/auth/login")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = authenticate(db, email, password)
    if not user:
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Email ou senha inválidos."},
            status_code=401,
        )
    response = RedirectResponse("/dashboard", status_code=303)
    set_session_cookie(response, user.id)
    return response


@router.get("/auth/logout")
async def logout():
    response = RedirectResponse("/auth/login", status_code=303)
    clear_session_cookie(response)
    return response
