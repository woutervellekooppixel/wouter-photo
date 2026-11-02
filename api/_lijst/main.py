"""
Agendalijst: de e-ink lijst toont een rollend weekoverzicht uit Google Agenda
(huidige week in het midden), met het weer, zon op/onder en de HVC-afvalkalender.
De telefoon-app beheert de agenda's en het afvaladres; de lijst haalt elke
nacht om 04:00 /frame/current.bin op met een device-token.
(De fotofunctie is op 2 nov 2026 verwijderd; zie git-historie.)

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

import datetime as dt
import re

from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, Response, JSONResponse
from PIL import Image
import numpy as np

import agenda
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

# --- PWA: manifest + icoon -------------------------------------------------
@app.get("/manifest.json")
def manifest():
    return JSONResponse({
        "name": "Agendalijst", "short_name": "Agenda",
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
    return {"modus": "agenda"}

# Raw blob voor de FireBeetle: 4 bpp paletcodes, 2 pixels per byte,
# 600 bytes per rij (eerste 300 = linkerhelft/CS_M, laatste 300 = CS_S),
# 1600 rijen = 960.000 bytes. Direct naar SPI te klokken, geen PNG-decoder
# nodig op het device.
_CODES = {(0,0,0): 0x0, (255,255,255): 0x1, (255,255,0): 0x2,
          (255,0,0): 0x3, (0,0,255): 0x5, (0,255,0): 0x6}

def _png_naar_blob(png_bytes: bytes) -> bytes:
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if os.environ.get("EINK_DRAAI_180") == "1":
        im = im.rotate(180)               # paneel ondersteboven in de lijst gemonteerd
    if im.size == (1600, 1200):
        im = im.rotate(90, expand=True)   # driver is portret 1200x1600
    arr = np.asarray(im)
    codes = np.full(arr.shape[:2], 0x1, dtype=np.uint8)   # onbekende kleur = wit
    for rgb, code in _CODES.items():
        codes[np.all(arr == rgb, axis=-1)] = code
    return ((codes[:, 0::2] << 4) | codes[:, 1::2]).tobytes()

def _frame_png(vbat: str) -> bytes:
    """Wat er vannacht op de lijst moet: een vers gerenderde agenda."""
    _noteer_vbat(vbat)
    try:
        return _agenda_render()[0]
    except Exception as e:  # noqa: BLE001 — lijst nooit zonder beeld laten
        print("agenda-render mislukt:", repr(e))
        vorige = opslag.get("agenda/panel.png")
        if vorige is not None:
            return vorige
        return _png(agenda.leeg_scherm("Agenda tijdelijk niet beschikbaar"))

@app.get("/frame/current.bin")
def frame_bin(token: str = "", vbat: str = ""):
    if not secrets.compare_digest(token, DEVICE_TOKEN):
        raise HTTPException(status_code=403)
    return Response(_png_naar_blob(_frame_png(vbat)), media_type="application/octet-stream")

@app.get("/frame/current.png")
def frame_blob(token: str = "", vbat: str = ""):
    if not secrets.compare_digest(token, DEVICE_TOKEN):
        raise HTTPException(status_code=403)
    return Response(_frame_png(vbat), media_type="image/png")

# --- Agenda ---------------------------------------------------------------
# agenda/instellingen.json: {"bronnen": [{id, naam, kleur, url}],
#                            "afval": {"postcode": "1234AB", "huisnummer": "5"}}
# AGENDA_ICS (env, optioneel) vult de bronnen zolang er in de app nog niets
# is ingesteld: één per regel of gescheiden door ';', "naam|kleur|url".
def _bronnen_uit_env():
    uit = []
    for i, regel in enumerate(r for r in re.split(r"[;\n]+", os.environ.get("AGENDA_ICS", ""))
                              if r.strip()):
        delen = [x.strip() for x in regel.split("|")]
        kleur = delen[1] if len(delen) >= 3 and delen[1] in agenda.KLEUREN \
            else agenda.STANDAARD_VOLGORDE[i % len(agenda.STANDAARD_VOLGORDE)]
        uit.append({"id": f"env{i}", "naam": delen[0] if len(delen) >= 2 else f"agenda {i + 1}",
                    "kleur": kleur, "url": delen[-1]})
    return uit

def _agenda_inst():
    d = opslag.get("agenda/instellingen.json")
    inst = json.loads(d) if d else {}
    bronnen = inst.get("bronnen")
    if bronnen is None:
        bronnen = _bronnen_uit_env()
    return {"bronnen": bronnen, "afval": inst.get("afval") or {}}

def _agenda_bewaar(inst):
    opslag.put("agenda/instellingen.json", json.dumps(inst).encode(), "application/json")

def _naar_preview(img: Image.Image) -> Image.Image:
    """Nominale paneelkleuren → zoals het paneel ze echt laat zien."""
    a = np.asarray(img.convert("RGB"))
    uit = np.full_like(a, 255)
    for nom, waarg in zip(render_core.NOMINAAL, render_core.WAARGENOMEN):
        uit[np.all(a == nom, axis=-1)] = waarg.astype(np.uint8)
    return Image.fromarray(uit)

def _png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()

# Weer van vandaag (Open-Meteo); standaard 's-Gravenzande, aan te passen met
# WEER_LAT / WEER_LON. Mislukt het ophalen, dan de laatste van vandaag uit
# R2 — en anders gewoon geen weerblok (de agenda gaat altijd voor).
def _weer(vandaag: dt.date):
    try:
        lat = float(os.environ.get("WEER_LAT", "52.0017"))
        lon = float(os.environ.get("WEER_LON", "4.1653"))
        w = agenda.haal_weer(lat, lon)
        opslag.put("agenda/weer.json", json.dumps(w).encode(), "application/json")
        return w
    except Exception as e:  # noqa: BLE001
        print("weer ophalen mislukt:", repr(e))
        oud = opslag.get("agenda/weer.json")
        w = json.loads(oud) if oud else None
        return w if w and w.get("datum") == vandaag.isoformat() else None

# Afval: HVC-inzamelkalender voor het adres uit de app, hooguit één keer per
# dag opgehaald (cache in R2). Lukt het niet, dan de vorige cache.
def _afval(inst, vandaag: dt.date):
    adres = inst.get("afval") or {}
    if not adres.get("postcode") or not adres.get("huisnummer"):
        return None, None
    sleutel = f"{adres['postcode']}-{adres['huisnummer']}"
    oud = opslag.get("agenda/afval.json")
    cache = json.loads(oud) if oud else {}
    if cache.get("adres") == sleutel and cache.get("opgehaald") == vandaag.isoformat():
        return cache.get("data"), None
    van, tot = agenda.weekbereik(vandaag)
    try:
        data = agenda.haal_afval_hvc(adres["postcode"], adres["huisnummer"],
                                     van, tot + dt.timedelta(days=28))
        opslag.put("agenda/afval.json", json.dumps(
            {"adres": sleutel, "opgehaald": vandaag.isoformat(), "data": data}).encode(),
            "application/json")
        return data, None
    except Exception as e:  # noqa: BLE001
        print("afval ophalen mislukt:", repr(e))
        if cache.get("adres") == sleutel:
            return cache.get("data"), None
        return None, f"afvalkalender: {e.__class__.__name__}"

def _agenda_render():
    inst = _agenda_inst()
    nu = dt.datetime.now(agenda.TZ).replace(tzinfo=None)
    waarschuwingen, afspraken = [], []
    if inst["bronnen"]:
        afspraken, waarschuwingen = agenda.verzamel(
            inst["bronnen"], nu.date(), opslag.get,
            lambda k, v: opslag.put(k, v, "text/calendar"))
    else:
        waarschuwingen.append("nog geen agenda gekoppeld")
    afval, afval_fout = _afval(inst, nu.date())
    if afval_fout:
        waarschuwingen.append(afval_fout)
    s = opslag.get("status/device.json")
    pct = json.loads(s).get("pct") if s else None
    img = agenda.render_agenda(nu.date(), afspraken, bijgewerkt=nu, accu_pct=pct,
                               waarschuwingen=waarschuwingen, weer=_weer(nu.date()),
                               afval=afval, zwartwit=True)
    aantal = len(afspraken)
    panel = _png(img)
    opslag.put("agenda/panel.png", panel, "image/png")
    opslag.put("agenda/preview.png", _png(_naar_preview(img)), "image/png")
    meta = {"tijd": int(time.time()), "aantal": aantal, "waarschuwingen": waarschuwingen}
    opslag.put("agenda/meta.json", json.dumps(meta).encode(), "application/json")
    return panel, meta

def _url_kort(url: str) -> str:
    m = re.match(r"^(?:https?|webcal)://([^/]+)", url)
    return f"{m.group(1) if m else '?'} …{url[-10:]}"

@app.get("/api/agenda")
def agenda_info(request: Request):
    check_auth(request)
    inst = _agenda_inst()
    m = opslag.get("agenda/meta.json")
    afv = opslag.get("agenda/afval.json")
    afv = json.loads(afv) if afv else {}
    return {"afval": inst["afval"],
            "afval_data": len((afv.get("data") or {})) if afv.get("adres") else None,
            "bronnen": [{"id": b["id"], "naam": b["naam"], "kleur": b["kleur"],
                         "url": _url_kort(b["url"])} for b in inst["bronnen"]],
            "laatst": json.loads(m) if m else None,
            "kleuren": list(agenda.KLEUREN)}

@app.post("/api/agenda")
def agenda_actie(request: Request, actie: str = Form(...),
                 naam: str = Form(""), url: str = Form(""), kleur: str = Form(""),
                 id: str = Form(""), postcode: str = Form(""), huisnummer: str = Form("")):
    check_auth(request)
    inst = _agenda_inst()
    if actie == "afval":
        pc = re.sub(r"\s", "", postcode).upper()
        nr = huisnummer.strip()
        if not pc and not nr:
            inst["afval"] = {}
        elif not re.fullmatch(r"\d{4}[A-Z]{2}", pc) or not re.match(r"\d+", nr):
            raise HTTPException(status_code=400, detail="Vul een postcode (1234AB) en huisnummer in")
        else:
            try:
                van, tot = agenda.weekbereik(dt.date.today())
                agenda.haal_afval_hvc(pc, nr, van, tot)
            except Exception:  # noqa: BLE001
                raise HTTPException(status_code=400,
                                    detail="HVC kent dit adres niet (of is even niet bereikbaar)")
            inst["afval"] = {"postcode": pc, "huisnummer": nr}
            opslag.put("agenda/afval.json", b"{}", "application/json")   # cache leeg
    elif actie == "toevoegen":
        url = url.strip()
        if not re.match(r"^(https|webcal)://", url):
            raise HTTPException(status_code=400, detail="Plak het volledige iCal-adres (begint met https://)")
        bron_id = secrets.token_hex(4)
        try:
            opslag.put(f"agenda/cache/{bron_id}.ics", agenda.haal_ics(url), "text/calendar")
        except Exception:  # noqa: BLE001
            raise HTTPException(status_code=400, detail="Op dat adres staat geen agenda (of hij is niet bereikbaar)")
        if kleur not in agenda.KLEUREN:
            gebruikt = {b["kleur"] for b in inst["bronnen"]}
            kleur = next((k for k in agenda.STANDAARD_VOLGORDE if k not in gebruikt), "blauw")
        inst["bronnen"].append({"id": bron_id, "naam": naam.strip()[:40] or "Agenda",
                                "kleur": kleur, "url": url})
    elif actie == "verwijder":
        inst["bronnen"] = [b for b in inst["bronnen"] if b["id"] != id]
    elif actie == "kleur" and kleur in agenda.KLEUREN:
        for b in inst["bronnen"]:
            if b["id"] == id:
                b["kleur"] = kleur
    else:
        raise HTTPException(status_code=400, detail="onbekende actie")
    _agenda_bewaar(inst)
    return {"ok": True}

@app.post("/api/agenda/ververs")
def agenda_ververs(request: Request):
    check_auth(request)
    return _agenda_render()[1]

@app.get("/api/agenda/preview.png")
def agenda_preview(request: Request):
    check_auth(request)
    data = opslag.get("agenda/preview.png")
    if data is None:
        _agenda_render()
        data = opslag.get("agenda/preview.png")
    return Response(data, media_type="image/png", headers={"Cache-Control": "no-store"})

# --- UI -------------------------------------------------------------------
from ui_html import UI

@app.get("/", response_class=HTMLResponse)
def index():
    return UI
