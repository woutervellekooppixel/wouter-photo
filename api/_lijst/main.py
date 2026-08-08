"""
Fotolijst-app: telefoon-webapp om de foto op de e-ink lijst te wisselen.

Flow: PIN → foto uploaden (client verkleint naar max 2400px) → crop-hint
schuiven → drie varianten renderen → kiezen → "current" klaarzetten.
De lijst (Pi-poller, straks FireBeetle) haalt /frame/current.png op met een
device-token.

Storage: lokaal (./data) of S3/R2, gestuurd door env:
  EINK_PIN           toegangscode voor de app (verplicht)
  EINK_DEVICE_TOKEN  token waarmee de lijst de blob mag ophalen (verplicht)
  R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
                     alle vier gezet -> R2; anders lokale ./data-map
"""
import io
import json
import os
import secrets
import time

from fastapi import FastAPI, UploadFile, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, Response, JSONResponse
from PIL import Image

import render_core

PIN = os.environ.get("EINK_PIN", "0000")
DEVICE_TOKEN = os.environ.get("EINK_DEVICE_TOKEN", "dev-token")
COOKIE = "eink_sessie"

app = FastAPI()
_sessies = set()  # in-memory; op serverless is elke instantie vers -> cookie = getekende PIN-hash
import hashlib
def _cookie_waarde():
    return hashlib.sha256(f"{PIN}:eink-fotolijst".encode()).hexdigest()[:32]

# --- Storage --------------------------------------------------------------
class LokaleOpslag:
    def __init__(self):
        # op Vercel is alleen /tmp beschrijfbaar (en vluchtig) — echte opslag
        # komt van R2 zodra de env-vars gezet zijn
        self.dir = ("/tmp/eink-data" if os.environ.get("VERCEL")
                    else os.path.join(os.path.dirname(__file__), "data"))
        os.makedirs(self.dir, exist_ok=True)

    def put(self, key, data, content_type="application/octet-stream"):
        pad = os.path.join(self.dir, key.replace("/", "_"))
        with open(pad, "wb") as f:
            f.write(data)

    def get(self, key):
        pad = os.path.join(self.dir, key.replace("/", "_"))
        if not os.path.exists(pad):
            return None
        with open(pad, "rb") as f:
            return f.read()

class R2Opslag:
    # Zelfde env-namen als het wouter-photo project (endpoint volgt uit account-ID);
    # alle keys onder lijst/ zodat de bucket van het portal netjes blijft.
    PREFIX = "lijst/"

    def __init__(self):
        import boto3
        self.bucket = os.environ["R2_BUCKET_NAME"]
        endpoint = os.environ.get("R2_ENDPOINT") or f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com"
        self.s3 = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name="auto",
        )

    def put(self, key, data, content_type="application/octet-stream"):
        self.s3.put_object(Bucket=self.bucket, Key=self.PREFIX + key, Body=data, ContentType=content_type)

    def get(self, key):
        try:
            return self.s3.get_object(Bucket=self.bucket, Key=self.PREFIX + key)["Body"].read()
        except Exception:
            return None

def maak_opslag():
    nodig = ("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME")
    if all(os.environ.get(k) for k in nodig) and (os.environ.get("R2_ACCOUNT_ID") or os.environ.get("R2_ENDPOINT")):
        return R2Opslag()
    return LokaleOpslag()

opslag = maak_opslag()

# --- Auth -----------------------------------------------------------------
def check_auth(request: Request):
    if request.cookies.get(COOKIE) != _cookie_waarde():
        raise HTTPException(status_code=401, detail="niet ingelogd")

@app.post("/api/login")
def login(pin: str = Form(...)):
    if not secrets.compare_digest(pin, PIN):
        raise HTTPException(status_code=403, detail="verkeerde pin")
    r = JSONResponse({"ok": True})
    r.set_cookie(COOKIE, _cookie_waarde(), max_age=180 * 24 * 3600, httponly=True, samesite="lax")
    return r

# --- Upload & render ------------------------------------------------------
@app.post("/api/upload")
async def upload(request: Request, foto: UploadFile):
    check_auth(request)
    data = await foto.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="foto te groot")
    im = Image.open(io.BytesIO(data))  # validatie
    im.verify()
    foto_id = f"{int(time.time())}-{secrets.token_hex(4)}"
    opslag.put(f"orig/{foto_id}.jpg", data, "image/jpeg")
    return {"id": foto_id}

@app.post("/api/render")
def render(request: Request, id: str = Form(...), crop_pos: float = Form(0.5),
           stijl: str = Form("kleur")):
    check_auth(request)
    data = opslag.get(f"orig/{id}.jpg")
    if data is None:
        raise HTTPException(status_code=404, detail="foto onbekend")
    im = Image.open(io.BytesIO(data))
    variant = "Z" if stijl == "zw" else "C"   # Z = zwart-wit, C = zacht kleur
    panel, preview = render_core.render_variant(im, variant, crop_pos)
    for naam, img in (("panel", panel), ("preview", preview)):
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        opslag.put(f"render/{id}_{variant}_{naam}.png", buf.getvalue(), "image/png")
    return {"ok": True, "variant": variant}

@app.get("/api/preview/{id}/{variant}")
def preview(request: Request, id: str, variant: str):
    check_auth(request)
    data = opslag.get(f"render/{id}_{variant}_preview.png")
    if data is None:
        raise HTTPException(status_code=404)
    return Response(data, media_type="image/png")

# --- Roulatie (altijd aan: dagelijks wisselen is het beste voor het paneel) --
# lijst.json: {"items": [{id, variant, door, tijd}], "pointer": 0,
#              "laatste_dag": "2026-08-09"}  (mode-veld uit oudere versies wordt genegeerd)
def _lijst_laad():
    d = opslag.get("lijst.json")
    l = json.loads(d) if d else {}
    return {"items": l.get("items", []), "pointer": l.get("pointer", 0),
            "laatste_dag": l.get("laatste_dag", "")}

def _lijst_bewaar(l):
    opslag.put("lijst.json", json.dumps(l).encode(), "application/json")

def _actueel_item(l, advance=False):
    """advance=True alleen bij device-fetch: nieuwe dag = volgende foto."""
    if not l["items"]:
        return None
    if advance:
        vandaag = time.strftime("%Y-%m-%d")
        if l["laatste_dag"] != vandaag:
            if l["laatste_dag"]:   # niet doorschuiven bij de allereerste fetch
                l["pointer"] = (l["pointer"] + 1) % len(l["items"])
            l["laatste_dag"] = vandaag
            _lijst_bewaar(l)
    return l["items"][l["pointer"] % len(l["items"])]

def _speelvolgorde(l):
    n = len(l["items"])
    if not n:
        return []
    p = l["pointer"] % n
    return l["items"][p:] + l["items"][:p]

@app.post("/api/kies")
def kies(request: Request, id: str = Form(...), variant: str = Form(...),
         door: str = Form("?"), modus: str = Form("roulatie")):
    check_auth(request)
    panel = opslag.get(f"render/{id}_{variant}_panel.png")
    if panel is None:
        raise HTTPException(status_code=404, detail="render onbekend")
    item = {"id": id, "variant": variant, "door": door, "tijd": int(time.time())}
    l = _lijst_laad()
    huidig = _actueel_item(l)
    l["items"] = [i for i in l["items"] if i["id"] != id] + [item]
    if modus == "nu":
        l["pointer"] = len(l["items"]) - 1
        l["laatste_dag"] = time.strftime("%Y-%m-%d")
    else:
        # de foto die nu hangt moet blijven hangen, ook al verschoof de lijst
        l["pointer"] = next((i for i, it in enumerate(l["items"])
                             if huidig and it["id"] == huidig["id"]), 0)
    _lijst_bewaar(l)
    return {"ok": True}

@app.get("/api/bibliotheek")
def bibliotheek(request: Request):
    check_auth(request)
    l = _lijst_laad()
    actueel = _actueel_item(l)
    return {"items": _speelvolgorde(l),
            "actueel_id": actueel["id"] if actueel else None}

@app.post("/api/bibliotheek")
def bibliotheek_actie(request: Request, actie: str = Form(...), id: str = Form("")):
    check_auth(request)
    l = _lijst_laad()
    idx = next((i for i, it in enumerate(l["items"]) if it["id"] == id), None)
    if actie == "verwijder" and idx is not None:
        del l["items"][idx]
        if idx < l["pointer"] or l["pointer"] >= len(l["items"]):
            l["pointer"] = max(0, l["pointer"] - 1) % max(1, len(l["items"]))
    elif actie == "nu" and idx is not None:
        l["pointer"] = idx
        l["laatste_dag"] = time.strftime("%Y-%m-%d")
    _lijst_bewaar(l)
    return {"ok": True}

@app.get("/api/current")
def current(request: Request):
    check_auth(request)
    l = _lijst_laad()
    item = _actueel_item(l)
    volgorde = _speelvolgorde(l)
    return {**(item or {}), "aantal": len(l["items"]),
            "volgende": volgorde[1] if len(volgorde) > 1 else None}

# --- PWA: manifest + icoon -------------------------------------------------
@app.get("/manifest.json")
def manifest():
    return JSONResponse({
        "name": "Fotolijst", "short_name": "Fotolijst",
        "start_url": "/lijst", "scope": "/lijst", "display": "standalone",
        "background_color": "#101010", "theme_color": "#101010",
        "icons": [{"src": "/lijst/icon.png", "sizes": "512x512", "type": "image/png"}],
    })

_ICOON_CACHE = None

@app.get("/icon.png")
def icoon():
    global _ICOON_CACHE
    if _ICOON_CACHE is None:
        from PIL import ImageDraw
        im = Image.new("RGB", (512, 512), (16, 16, 16))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((96, 128, 416, 384), radius=18, outline=(238, 235, 228), width=14)
        kleuren = [(30,30,32),(215,213,205),(200,175,60),(150,55,50),(55,65,115),(75,110,75)]
        for i, k in enumerate(kleuren):
            x = 136 + i * 42
            d.ellipse((x, 412, x + 26, 438), fill=k)
        buf = io.BytesIO(); im.save(buf, format="PNG")
        _ICOON_CACHE = buf.getvalue()
    return Response(_ICOON_CACHE, media_type="image/png")

# --- Accustatus -----------------------------------------------------------
# LiPo-ontlaadcurve (open-klem, rustend): spanning -> procent, lineair
# geinterpoleerd. Grof maar prima voor "moet ik 'm opladen?".
_LIPO_CURVE = [(4.20, 100), (4.05, 85), (3.90, 65), (3.80, 50),
               (3.72, 35), (3.65, 20), (3.55, 10), (3.45, 5), (3.30, 0)]

def _lipo_pct(v: float) -> int:
    if v >= _LIPO_CURVE[0][0]:
        return 100
    for (v1, p1), (v2, p2) in zip(_LIPO_CURVE, _LIPO_CURVE[1:]):
        if v >= v2:
            return round(p2 + (v - v2) / (v1 - v2) * (p1 - p2))
    return 0

def _noteer_vbat(vbat: str):
    """Device geeft vbat mee als queryparam; leeg = netstroom (Pi)."""
    try:
        v = float(vbat)
    except (TypeError, ValueError):
        v = None
    status = {"tijd": int(time.time())}
    if v and 2.5 < v < 5.0:
        status["vbat"] = round(v, 2)
        status["pct"] = _lipo_pct(v)
    opslag.put("status/device.json", json.dumps(status).encode(), "application/json")

@app.get("/api/status")
def status(request: Request):
    check_auth(request)
    s = opslag.get("status/device.json")
    return json.loads(s) if s else {}

# --- Endpoint voor de lijst (Pi-poller / FireBeetle) ----------------------
@app.get("/frame/current.json")
def frame_meta(token: str = "", vbat: str = ""):
    if not secrets.compare_digest(token, DEVICE_TOKEN):
        raise HTTPException(status_code=403)
    _noteer_vbat(vbat)
    l = _lijst_laad()
    item = _actueel_item(l, advance=True)
    return item or {}

# Raw blob voor de FireBeetle: 4 bpp paletcodes, 2 pixels per byte,
# 600 bytes per rij (eerste 300 = linkerhelft/CS_M, laatste 300 = CS_S),
# 1600 rijen = 960.000 bytes. Direct naar SPI te klokken, geen PNG-decoder
# nodig op het device.
_CODES = {(0,0,0): 0x0, (255,255,255): 0x1, (255,255,0): 0x2,
          (255,0,0): 0x3, (0,0,255): 0x5, (0,255,0): 0x6}

def _png_naar_blob(png_bytes: bytes) -> bytes:
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if im.size == (1600, 1200):
        im = im.rotate(90, expand=True)   # driver is portret 1200x1600
    px = im.load()
    uit = bytearray(im.width // 2 * im.height)
    i = 0
    for y in range(im.height):
        for x in range(0, im.width, 2):
            uit[i] = (_CODES.get(px[x, y], 0x1) << 4) | _CODES.get(px[x+1, y], 0x1)
            i += 1
    return bytes(uit)

@app.get("/frame/current.bin")
def frame_bin(token: str = "", vbat: str = ""):
    if not secrets.compare_digest(token, DEVICE_TOKEN):
        raise HTTPException(status_code=403)
    _noteer_vbat(vbat)
    l = _lijst_laad()
    item = _actueel_item(l, advance=True)
    data = (opslag.get(f"render/{item['id']}_{item['variant']}_panel.png")
            if item else opslag.get("current/panel.png"))
    if data is None:
        raise HTTPException(status_code=404)
    return Response(_png_naar_blob(data), media_type="application/octet-stream")

@app.get("/frame/current.png")
def frame_blob(token: str = "", vbat: str = ""):
    if not secrets.compare_digest(token, DEVICE_TOKEN):
        raise HTTPException(status_code=403)
    _noteer_vbat(vbat)
    l = _lijst_laad()
    item = _actueel_item(l, advance=True)
    data = (opslag.get(f"render/{item['id']}_{item['variant']}_panel.png")
            if item else opslag.get("current/panel.png"))
    if data is None:
        raise HTTPException(status_code=404)
    return Response(data, media_type="image/png")

# --- UI -------------------------------------------------------------------
from ui_html import UI

@app.get("/", response_class=HTMLResponse)
def index():
    return UI
