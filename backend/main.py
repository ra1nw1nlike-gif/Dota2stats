from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

from api.players import router as players_router
from api.matches import router as matches_router
from api.auth import router as auth_router
from api.meta import router as meta_router
from api.news import router as news_router

app = FastAPI(title="Dota Analyzer Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (CSS/JS)
BASE_DIR = os.path.dirname(__file__)
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "frontend"))
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")


# Підключаємо API з префіксом
app.include_router(players_router, prefix="/api")
app.include_router(matches_router, prefix="/api")
app.include_router(meta_router, prefix="/api")
app.include_router(news_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")

# Головна сторінка
@app.get("/")
async def read_index():
    # Вказуємо шлях до index.html. Переконайся, що папка frontend поруч із backend
    path = os.path.join(FRONTEND_DIR, "index.html")
    return FileResponse(path)

@app.get("/match")
async def read_match():
    path = os.path.join(FRONTEND_DIR, "match.html")
    return FileResponse(path)

@app.get("/news")
async def read_news():
    path = os.path.join(FRONTEND_DIR, "news.html")
    return FileResponse(path)

# Робимо так, щоб API розуміло довгі ID
@app.middleware("http")
async def fix_ids(request, call_next):
    return await call_next(request)
