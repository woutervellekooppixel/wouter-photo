import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lijst"))
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from main import app as lijst_app
from ui_html import UI

app = FastAPI()

# Vercel normaliseert /lijst/ naar /lijst — serveer de UI dus direct
# op het kale pad; de submount vangt /lijst/api/* en /lijst/frame/*.
@app.get("/lijst")
def wortel():
    return HTMLResponse(UI)

app.mount("/lijst", lijst_app)
