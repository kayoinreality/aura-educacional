from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from .auth import AuthenticationRequired
from .config import settings

BASE_DIR = Path(__file__).parent

app = FastAPI(title=settings.admin_py_app_name, docs_url=None, redoc_url=None)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


def _fmt_currency(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _fmt_date(value) -> str:
    if value is None:
        return "—"
    return value.strftime("%d/%m/%Y %H:%M")


templates.env.filters["currency"] = _fmt_currency
templates.env.filters["fmt_date"] = _fmt_date


@app.exception_handler(AuthenticationRequired)
async def auth_required_handler(request: Request, _exc: AuthenticationRequired):
    return RedirectResponse(f"/auth/login?next={request.url.path}", status_code=303)


@app.get("/", response_class=HTMLResponse)
async def root():
    return RedirectResponse("/dashboard", status_code=303)


from .routers import auth_router, dashboard, users, courses, enrollments, payments  # noqa: E402

app.include_router(auth_router.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(payments.router)
