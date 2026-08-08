import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lijst"))
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from main import app as lijst_app

app = FastAPI()

@app.get("/lijst")
def naar_slash():
    return RedirectResponse("/lijst/", status_code=308)

app.mount("/lijst", lijst_app)
