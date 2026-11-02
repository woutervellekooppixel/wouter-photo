"""
Agenda-modus: Google Agenda als maandoverzicht op het 13,3" Spectra 6-paneel.

Bronnen zijn iCal-adressen (Google Agenda → Instellingen → [agenda] →
"Geheim adres in iCal-indeling"). Geen OAuth nodig; het adres zelf is de sleutel.

Rendering: tekent ALLEEN met de zes nominale paneelkleuren, zonder
anti-aliasing-tussentinten (tekst wordt anti-aliased gerasterd en daarna
gedrempeld). Zo blijft tekst op e-ink scherp en klopt _CODES in main.py
voor elke pixel. 'Grijs' bestaat niet op het paneel: dat is een
dambordpatroon van zwart op wit.
"""
from __future__ import annotations

import datetime as dt
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, asdict
from functools import lru_cache
from zoneinfo import ZoneInfo

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

TZ = ZoneInfo("Europe/Amsterdam")
BREED, HOOG = 1600, 1200

# --- Palet (nominaal = wat het paneel verwacht, zie _CODES in main.py) -------
ZWART = (0, 0, 0)
WIT = (255, 255, 255)
GEEL = (255, 255, 0)
ROOD = (255, 0, 0)
BLAUW = (0, 0, 255)
GROEN = (0, 255, 0)
KLEUREN = {"blauw": BLAUW, "groen": GROEN, "rood": ROOD, "geel": GEEL, "zwart": ZWART}
STANDAARD_VOLGORDE = ["blauw", "groen", "rood", "geel", "zwart"]

MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
           "augustus", "september", "oktober", "november", "december"]
DAGEN_KORT = ["ma", "di", "wo", "do", "vr", "za", "zo"]
DAGEN_LANG = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag",
              "zaterdag", "zondag"]

FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")


@lru_cache(maxsize=None)
def font(gewicht: str, grootte: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(os.path.join(FONT_DIR, f"Inter-{gewicht}.otf"), grootte)


# --- Afspraken ---------------------------------------------------------------
@dataclass
class Afspraak:
    titel: str
    begin: str          # ISO: "2026-11-03" (hele dag) of "2026-11-03T09:30"
    eind: str           # exclusief, zelfde vorm
    hele_dag: bool
    kleur: str
    bron: str

    def _b(self):
        return (dt.date.fromisoformat(self.begin) if self.hele_dag
                else dt.datetime.fromisoformat(self.begin))

    def _e(self):
        return (dt.date.fromisoformat(self.eind) if self.hele_dag
                else dt.datetime.fromisoformat(self.eind))

    @property
    def eerste_dag(self) -> dt.date:
        b = self._b()
        return b if self.hele_dag else b.date()

    @property
    def laatste_dag(self) -> dt.date:
        """Laatste dag (inclusief) waarop de afspraak zichtbaar is."""
        b, e = self._b(), self._e()
        if self.hele_dag:
            return max(b, e - dt.timedelta(days=1))
        if e <= b:
            return b.date()
        return (e - dt.timedelta(microseconds=1)).date()

    @property
    def is_balk(self) -> bool:
        """Hele-dag-afspraken en alles van 24 uur of langer → balk (zoals Google)."""
        if self.hele_dag:
            return True
        return self._e() - self._b() >= dt.timedelta(hours=24)

    @property
    def tijd(self) -> str:
        b = self._b()
        return "" if self.hele_dag else f"{b.hour}:{b.minute:02d}"


def _naar_lokaal(waarde):
    """date blijft date; datetime → naive lokale tijd (Europe/Amsterdam)."""
    if isinstance(waarde, dt.datetime):
        if waarde.tzinfo is None:
            return waarde.replace(second=0, microsecond=0)
        return waarde.astimezone(TZ).replace(tzinfo=None, second=0, microsecond=0)
    return waarde


def lees_ics(data: bytes, van: dt.date, tot: dt.date, kleur: str, naam: str) -> list[Afspraak]:
    import icalendar
    import recurring_ical_events

    cal = icalendar.Calendar.from_ical(data)
    # Google zet bij de hoofdagenda het e-mailadres in X-WR-CALNAME; daarmee
    # filteren we afspraken die je zelf hebt afgeslagen.
    eigenaar = str(cal.get("X-WR-CALNAME", "")).strip().lower()
    eigenaar = eigenaar if "@" in eigenaar else ""

    uit = []
    for ev in recurring_ical_events.of(cal).between(van, tot):
        if str(ev.get("STATUS", "")).upper() == "CANCELLED":
            continue
        if eigenaar:
            deelnemers = ev.get("ATTENDEE", [])
            if not isinstance(deelnemers, list):
                deelnemers = [deelnemers]
            if any(str(a).lower() == f"mailto:{eigenaar}"
                   and str(a.params.get("PARTSTAT", "")).upper() == "DECLINED"
                   for a in deelnemers):
                continue
        b = _naar_lokaal(ev.decoded("DTSTART"))
        if "DTEND" in ev:
            e = _naar_lokaal(ev.decoded("DTEND"))
        elif "DURATION" in ev:
            e = b + ev.decoded("DURATION")
        else:
            e = b + dt.timedelta(days=1) if not isinstance(b, dt.datetime) else b
        hele_dag = not isinstance(b, dt.datetime)
        if hele_dag and isinstance(e, dt.datetime):
            e = e.date()
        titel = " ".join(str(ev.get("SUMMARY", "")).split()) or "(geen titel)"
        uit.append(Afspraak(
            titel=titel,
            begin=b.isoformat(timespec="minutes") if not hele_dag else b.isoformat(),
            eind=e.isoformat(timespec="minutes") if not hele_dag else e.isoformat(),
            hele_dag=hele_dag, kleur=kleur, bron=naam))
    return uit


def haal_ics(url: str, timeout: float = 15) -> bytes:
    url = url.strip()
    if url.startswith("webcal://"):
        url = "https://" + url[len("webcal://"):]
    req = urllib.request.Request(url, headers={"User-Agent": "wouter.photo-fotolijst/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
    if b"BEGIN:VCALENDAR" not in data[:4096]:
        raise ValueError("geen iCal-agenda op dit adres")
    return data


def maandbereik(vandaag: dt.date):
    """Eerste maandag t/m laatste zondag van het maandraster."""
    eerste = vandaag.replace(day=1)
    volgende = (eerste + dt.timedelta(days=32)).replace(day=1)
    laatste = volgende - dt.timedelta(days=1)
    start = eerste - dt.timedelta(days=eerste.weekday())
    eind = laatste + dt.timedelta(days=6 - laatste.weekday())
    return start, eind


WEKEN_VOOR, WEKEN_NA = 2, 2   # huidige week in het midden, de rest 'scrollt' mee


def weekbereik(vandaag: dt.date, voor: int = WEKEN_VOOR, na: int = WEKEN_NA):
    """Maandag `voor` weken terug t/m zondag `na` weken vooruit."""
    maandag = vandaag - dt.timedelta(days=vandaag.weekday())
    return maandag - dt.timedelta(weeks=voor), maandag + dt.timedelta(weeks=na, days=6)


def verzamel(bronnen: list[dict], vandaag: dt.date, cache_get, cache_put):
    """Haalt alle bronnen parallel op. Bij een fout valt een bron terug op
    de laatst gelukte download (cache), zodat de lijst nooit leeg raakt.
    Geeft (afspraken, waarschuwingen) terug."""
    start, eind = weekbereik(vandaag)
    van, tot = start, eind + dt.timedelta(days=1)

    def een(bron):
        naam = bron.get("naam") or "agenda"
        kleur = bron.get("kleur") if bron.get("kleur") in KLEUREN else "blauw"
        sleutel = f"agenda/cache/{bron['id']}.ics"
        try:
            data = haal_ics(bron["url"])
            cache_put(sleutel, data)
            fout = None
        except Exception as e:  # noqa: BLE001 — netwerk/HTTP/parse: allemaal terugvallen
            data = cache_get(sleutel)
            fout = f"{naam}: {e.__class__.__name__}"
            if data is None:
                return [], fout
        try:
            return lees_ics(data, van, tot, kleur, naam), fout
        except Exception as e:  # noqa: BLE001
            return [], f"{naam}: kan agenda niet lezen ({e.__class__.__name__})"

    afspraken, waarschuwingen = [], []
    if not bronnen:
        return afspraken, waarschuwingen
    with ThreadPoolExecutor(max_workers=min(6, len(bronnen))) as pool:
        for lijst, fout in pool.map(een, bronnen):
            afspraken.extend(lijst)
            if fout:
                waarschuwingen.append(fout)
    return afspraken, waarschuwingen


# --- Tekenhulp ---------------------------------------------------------------
@lru_cache(maxsize=1)
def _dambord() -> Image.Image:
    a = (np.indices((HOOG, BREED)).sum(axis=0) % 2 == 0).astype(np.uint8) * 255
    return Image.fromarray(a, "L").convert("1")


def _tekst(img: Image.Image, xy, s: str, fnt, kleur, anchor="la", grijs=False):
    """Tekst zonder tussentinten: AA-rasteren, drempelen, plakken."""
    if not s:
        return
    l, t, r, b = fnt.getbbox(s, anchor=anchor)
    w, h = r - l, b - t
    if w <= 0 or h <= 0:
        return
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text((-l, -t), s, font=fnt, fill=255, anchor=anchor)
    m = m.point(lambda v: 255 if v >= 118 else 0).convert("1")
    x0, y0 = int(round(xy[0])) + l, int(round(xy[1])) + t
    if grijs:
        m = ImageChops.logical_and(m, _dambord().crop((x0, y0, x0 + w, y0 + h)))
    img.paste(kleur, (x0, y0, x0 + w, y0 + h), m)


def _pas(s: str, fnt, max_b: float) -> str:
    """Kort tekst in met een beletselteken tot hij in max_b pixels past."""
    if fnt.getlength(s) <= max_b:
        return s
    lo, hi = 0, len(s)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if fnt.getlength(s[:mid].rstrip() + "…") <= max_b:
            lo = mid
        else:
            hi = mid - 1
    return (s[:lo].rstrip() + "…") if lo else ""


def _breek(s: str, fnt, max_b: float) -> tuple[str, str]:
    """Splits op woordgrens: eerste deel past in max_b, rest gaat naar regel 2."""
    woorden = s.split(" ")
    eerste = ""
    for i, w in enumerate(woorden):
        proef = (eerste + " " + w).strip()
        if fnt.getlength(proef) > max_b:
            if not eerste:   # één heel lang woord: hard afbreken
                deel = _pas(w, fnt, max_b)[:-1] or w[:1]
                return deel, s[len(deel):].lstrip()
            return eerste, " ".join(woorden[i:])
        eerste = proef
    return eerste, ""


def _tekstkleur_op(kleur):
    return ZWART if kleur in (GEEL, WIT) else WIT


# --- Weer (Open-Meteo, gratis, geen sleutel) ---------------------------------
WEER_TEKST = [  # (WMO-codes, icoon, omschrijving)
    ((0,), "zon", "zonnig"),
    ((1, 2), "half", "half bewolkt"),
    ((3,), "wolk", "bewolkt"),
    ((45, 48), "mist", "mist"),
    ((51, 53, 55, 56, 57), "motregen", "motregen"),
    ((61, 63, 65, 66, 67, 80, 81, 82), "regen", "regen"),
    ((71, 73, 75, 77, 85, 86), "sneeuw", "sneeuw"),
    ((95, 96, 99), "onweer", "onweer"),
]


UUR_VAN, UUR_TOT = 7, 23   # dagverloop in de kop


def weer_info(code: int) -> tuple[str, str]:
    for codes, icoon, tekst in WEER_TEKST:
        if code in codes:
            return icoon, tekst
    return "wolk", "bewolkt"


def haal_weer(lat: float, lon: float, timeout: float = 8) -> dict:
    """Verwachting voor vandaag: {datum, code, max, min, regen}."""
    import json
    url = ("https://api.open-meteo.com/v1/forecast"
           f"?latitude={lat:.4f}&longitude={lon:.4f}"
           "&daily=weather_code,temperature_2m_max,temperature_2m_min,"
           "precipitation_probability_max,sunrise,sunset"
           "&hourly=temperature_2m,weather_code,is_day,precipitation_probability"
           "&timezone=Europe%2FAmsterdam&forecast_days=1")
    req = urllib.request.Request(url, headers={"User-Agent": "wouter.photo-fotolijst/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        alles = json.loads(r.read())
    d, h = alles["daily"], alles.get("hourly") or {}
    uren = []
    for i, tijd in enumerate(h.get("time", [])):
        uur = int(tijd[11:13])
        if UUR_VAN <= uur <= UUR_TOT:
            uren.append({"uur": uur, "code": int(h["weather_code"][i]),
                         "temp": round(h["temperature_2m"][i]),
                         "dag": int(h.get("is_day", [1] * 24)[i]),
                         "regen": (h.get("precipitation_probability") or [None] * 24)[i]})
    return {"uren": uren, "datum": d["time"][0], "code": int(d["weather_code"][0]),
            "max": round(d["temperature_2m_max"][0]), "min": round(d["temperature_2m_min"][0]),
            "regen": d.get("precipitation_probability_max", [None])[0],
            "op": _uur(d.get("sunrise", [None])[0]), "onder": _uur(d.get("sunset", [None])[0])}


def _uur(iso: str | None) -> str | None:
    """'2026-11-02T07:31' → '7:31'."""
    if not iso or "T" not in iso:
        return None
    u, m = iso.split("T")[1][:5].split(":")
    return f"{int(u)}:{m}"


# --- Afval: HVC-inzamelkalender (Opzet-platform) + afval-afspraken -----------
AFVAL_VOLGORDE = ["REST", "GFT", "PAPIER", "PMD", "GLAS", "TEXTIEL", "BOOM"]
_STROOM_SLEUTELS = [("gft", "GFT"), ("groente", "GFT"), ("papier", "PAPIER"),
                    ("plastic", "PMD"), ("pmd", "PMD"), ("pbd", "PMD"), ("rest", "REST"),
                    ("glas", "GLAS"), ("textiel", "TEXTIEL"), ("kerstb", "BOOM")]
_WOORD_SOORT = {"gft": "GFT", "groente": "GFT", "groene": "GFT",
                "restafval": "REST", "rest": "REST", "grijze": "REST",
                "papier": "PAPIER", "papierbak": "PAPIER", "oudpapier": "PAPIER",
                "karton": "PAPIER", "blauwe": "PAPIER",
                "pmd": "PMD", "pbd": "PMD", "plastic": "PMD", "oranje": "PMD",
                "glas": "GLAS", "textiel": "TEXTIEL", "kerstboom": "BOOM", "kerstbomen": "BOOM"}
_AFVAL_VULWOORDEN = {"oud", "container", "containers", "bak", "bakken", "afval", "kliko",
                     "zak", "zakken", "ophalen", "ophaaldag", "aan", "de", "weg", "buiten",
                     "zetten", "straat", "en", "bij", "op"}


def afval_soort_stroom(titel: str) -> str | None:
    """Afvalstroom-titel van HVC → label (ruim, op deelwoord)."""
    t = (titel or "").lower()
    return next((label for sleutel, label in _STROOM_SLEUTELS if sleutel in t), None)


def afval_uit_titel(titel: str) -> str | None:
    """Agenda-afspraak die alleen over afval gaat ('Restafval', 'Gft container
    buiten zetten') → label; 'Restaurant' of 'Papier inleveren school' niet."""
    import re
    woorden = re.findall(r"[a-zà-ÿ]+", (titel or "").lower())
    if not woorden or len(woorden) > 5:
        return None
    if not all(w in _WOORD_SOORT or w in _AFVAL_VULWOORDEN for w in woorden):
        return None
    return next((_WOORD_SOORT[w] for w in woorden if w in _WOORD_SOORT), None)


def _json_ipv4(url: str, timeout: float):
    """GET → JSON, alleen via IPv4 (sommige Opzet-servers hebben kapotte IPv6)."""
    import json
    import socket
    orig = socket.getaddrinfo

    def alleen_v4(host, port, family=0, *a, **k):
        return orig(host, port, socket.AF_INET, *a, **k)
    socket.getaddrinfo = alleen_v4
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "wouter.photo-fotolijst/1.0",
                                                   "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    finally:
        socket.getaddrinfo = orig


def haal_afval_hvc(postcode: str, huisnummer: str, van: dt.date, tot: dt.date,
                   timeout: float = 10) -> dict[str, list[str]]:
    """{'2026-11-04': ['GFT'], ...} voor van..tot (inclusief)."""
    import re
    basis = "https://inzamelkalender.hvcgroep.nl/rest/adressen"
    pc = re.sub(r"\s", "", postcode).upper()
    m = re.match(r"(\d+)\s*-?\s*([a-zA-Z0-9]*)", str(huisnummer).strip())
    nummer, toevoeging = (m.group(1), m.group(2)) if m else (str(huisnummer), "")
    adressen = _json_ipv4(f"{basis}/{pc}-{nummer}", timeout)
    if not adressen:
        raise ValueError("adres niet gevonden bij HVC")
    adres = adressen[0]
    if toevoeging:
        adres = next((a for a in adressen if toevoeging.lower() in
                      (str(a.get("huisletter") or "").lower(),
                       str(a.get("huisnummerToevoeging") or "").lower())), adres)
    bag = adres["bagId"]
    stromen = {s_.get("id"): s_ for s_ in _json_ipv4(f"{basis}/{bag}/afvalstromen", timeout)
               if isinstance(s_, dict)}
    paren = []
    for jaar in sorted({van.year, tot.year}):
        try:
            kal = _json_ipv4(f"{basis}/{bag}/kalender/{jaar}", timeout)
        except Exception:  # noqa: BLE001 — kalender van volgend jaar kan nog ontbreken
            kal = []
        for e in kal if isinstance(kal, list) else []:
            if isinstance(e, dict):
                paren.append((e.get("afvalstroom_id"), e.get("ophaaldatum")))
    # vangnet: van elke stroom staat de eerstvolgende datum ook in afvalstromen
    paren += [(sid, st.get("ophaaldatum")) for sid, st in stromen.items()]
    uit: dict[str, list[str]] = {}
    for sid, datum in paren:
        st = stromen.get(sid)
        if not st or not datum:
            continue
        try:
            dag = dt.date.fromisoformat(str(datum)[:10])
        except ValueError:
            continue
        label = afval_soort_stroom(st.get("title") or st.get("menu_title") or "")
        if label and van <= dag <= tot and label not in uit.setdefault(dag.isoformat(), []):
            uit[dag.isoformat()].append(label)
    return uit


@lru_cache(maxsize=64)
def _icoon_masker(soort: str, s: int) -> Image.Image:
    """Lijn-icoon op 4× resolutie getekend, dan verkleind en gedrempeld."""
    import math
    from PIL import ImageChops, ImageFilter
    S = s * 4
    t = max(2, round(S * 0.055))      # lijndikte
    m = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(m)

    def morf(img, n, filt):
        for _ in range(n):
            img = img.filter(filt(3))
        return img

    def zon(cx, cy, r, stralen=True):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=255, width=t)
        if stralen:
            for i in range(8):
                a = i * math.pi / 4
                r1, r2 = r * 1.45, r * 1.95
                d.line((cx + r1 * math.cos(a), cy + r1 * math.sin(a),
                        cx + r2 * math.cos(a), cy + r2 * math.sin(a)), fill=255, width=t)

    def wolk(dx=0.0, dy=0.0):
        """Eén strakke omtrek: gevulde vereniging min de 'geërodeerde' versie;
        wat eronder lag (zon) wordt met een kleine marge weggepoetst."""
        nonlocal m, d
        vul = Image.new("L", (S, S), 0)
        dv = ImageDraw.Draw(vul)
        onder = (dy + 0.70) * S
        for x, y, r in ((0.50, 0.44, 0.20), (0.29, onder / S - dy - 0.14, 0.14),
                        (0.71, onder / S - dy - 0.15, 0.15)):
            X, Y, R = (dx + x) * S, (dy + y) * S, r * S
            dv.ellipse((X - R, Y - R, X + R, Y + R), fill=255)
        dv.rectangle(((dx + 0.29) * S, (dy + 0.50) * S, (dx + 0.71) * S, onder), fill=255)
        binnen = morf(vul, t, ImageFilter.MinFilter)
        rand = ImageChops.subtract(vul, binnen)
        marge = morf(vul, t, ImageFilter.MaxFilter)
        m = ImageChops.subtract(m, marge)          # zon achter de wolk weg
        m = ImageChops.lighter(m, rand)
        d = ImageDraw.Draw(m)

    if soort == "zon":
        zon(S * 0.5, S * 0.5, S * 0.2)
    elif soort in ("op", "onder"):
        # horizon, halve zon, pijl omhoog/omlaag
        d.line((S * 0.08, S * 0.80, S * 0.92, S * 0.80), fill=255, width=t)
        r = S * 0.24
        d.pieslice((S * 0.5 - r, S * 0.80 - r, S * 0.5 + r, S * 0.80 + r), 180, 360, fill=255)
        boven, onder = S * 0.06, S * 0.40
        d.line((S * 0.5, boven, S * 0.5, onder), fill=255, width=t)
        punt, voet = (boven, onder) if soort == "op" else (onder, boven)
        rich = 1 if soort == "op" else -1
        d.polygon([(S * 0.5, punt - rich * t * 0.3), (S * 0.36, punt + rich * S * 0.14),
                   (S * 0.64, punt + rich * S * 0.14)], fill=255)
    elif soort == "afval":
        # minicontainer: deksel, romp (taps), wieltje
        d.rectangle((S * 0.14, S * 0.14, S * 0.86, S * 0.26), fill=255)
        d.rectangle((S * 0.40, S * 0.04, S * 0.60, S * 0.14), fill=255)
        d.polygon([(S * 0.20, S * 0.31), (S * 0.80, S * 0.31), (S * 0.73, S * 0.90),
                   (S * 0.27, S * 0.90)], fill=255)
        r = S * 0.08
        d.ellipse((S * 0.62 - r, S * 0.90 - r, S * 0.62 + r, S * 0.90 + r), fill=0)
        d.ellipse((S * 0.62 - r * 0.6, S * 0.90 - r * 0.6, S * 0.62 + r * 0.6,
                   S * 0.90 + r * 0.6), fill=255)
    elif soort == "half":
        zon(S * 0.36, S * 0.33, S * 0.14)
        wolk(0.08, 0.10)
    elif soort in ("maan", "maan_half"):
        cx, cy, r = (S * 0.5, S * 0.5, S * 0.26) if soort == "maan" else (S * 0.36, S * 0.34, S * 0.17)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
        dx = r * 0.55
        d.ellipse((cx - r + dx, cy - r - dx * 0.5, cx + r + dx, cy + r - dx * 0.5), fill=0)
        if soort == "maan_half":
            wolk(0.08, 0.10)
    elif soort == "mist":
        for i, y in enumerate((0.3, 0.45, 0.6, 0.75)):
            x0 = 0.18 if i % 2 == 0 else 0.26
            d.line((S * x0, S * y, S * (x0 + 0.56), S * y), fill=255, width=t)
    else:
        wolk(0, -0.10)
        if soort == "regen":
            for x in (0.35, 0.52, 0.69):
                d.line((S * x, S * 0.70, S * (x - 0.07), S * 0.90), fill=255, width=t)
        elif soort == "motregen":
            for x, y in ((0.33, 0.74), (0.5, 0.78), (0.67, 0.74), (0.42, 0.89), (0.59, 0.89)):
                r = t * 0.85
                d.ellipse((S * x - r, S * y - r, S * x + r, S * y + r), fill=255)
        elif soort == "sneeuw":
            for x, y in ((0.30, 0.78), (0.52, 0.88), (0.72, 0.76)):
                r = S * 0.075
                for k in range(3):
                    a = math.pi / 2 + k * math.pi / 3
                    d.line((S * x - r * math.cos(a), S * y - r * math.sin(a),
                            S * x + r * math.cos(a), S * y + r * math.sin(a)),
                           fill=255, width=max(2, round(t * 0.7)))
        elif soort == "__geen__":
            pass
        elif soort == "onweer":
            d.polygon([(S * 0.53, S * 0.62), (S * 0.40, S * 0.80), (S * 0.50, S * 0.80),
                       (S * 0.44, S * 0.97), (S * 0.62, S * 0.74), (S * 0.52, S * 0.74),
                       (S * 0.58, S * 0.62)], fill=255)
    m = m.resize((s, s), Image.LANCZOS)
    return m.point(lambda v: 255 if v >= 110 else 0).convert("1")


def _accu_icoon(d: ImageDraw.ImageDraw, x: int, y: int, pct: int):
    """Batterijtje van 30×14 met vulling, linksboven op (x, y)."""
    w, h = 28, 14
    d.rectangle((x, y, x + w, y + h), outline=ZWART, width=2)
    d.rectangle((x + w + 1, y + 4, x + w + 3, y + h - 4), fill=ZWART)
    vul = round((w - 6) * max(0, min(100, pct)) / 100)
    if vul > 0:
        d.rectangle((x + 3, y + 3, x + 3 + vul, y + h - 3), fill=ZWART)


# --- Maandweergave -----------------------------------------------------------
# Maatvoering in paneelpixels (1600×1200, ~150 dpi). Het lijstvenster valt
# 0,5 mm (≈3 px) over het beeld; marges houden daar ruim rekening mee.
ML, MR, MT, MB = 46, 46, 34, 34
WEEKKOLOM = 46
GRID_TOP = 172
DAGNUM_H = 44          # ruimte bovenin een vakje voor het dagnummer
SLOT_H = 28            # hoogte van één afspraakregel / balk


def render_agenda(vandaag: dt.date, afspraken: list[Afspraak], *,
                  bijgewerkt: dt.datetime | None = None,
                  accu_pct: int | None = None,
                  waarschuwingen: list[str] | None = None,
                  weer: dict | None = None,
                  afval: dict[str, list[str]] | None = None,
                  zwartwit: bool = True,
                  voor: int = WEKEN_VOOR, na: int = WEKEN_NA) -> Image.Image:
    """Rollend overzicht: de week van vandaag in het midden."""
    img = Image.new("RGB", (BREED, HOOG), WIT)
    d = ImageDraw.Draw(img)
    kl = (lambda naam: ZWART) if zwartwit else (lambda naam: KLEUREN.get(naam, BLAUW))
    accent = ZWART if zwartwit else ROOD

    start, eind = weekbereik(vandaag, voor, na)
    weken = voor + 1 + na
    x0 = ML + WEEKKOLOM
    cel_b = (BREED - MR - x0) / 7
    rij_h = (HOOG - MB - GRID_TOP) / weken
    slots = max(1, int((rij_h - DAGNUM_H - 4) // SLOT_H))

    # ---- afval: HVC-data + afspraken die alleen over afval gaan -------------
    afval_dag: dict[dt.date, set] = {}
    for datum, labels in (afval or {}).items():
        afval_dag.setdefault(dt.date.fromisoformat(datum), set()).update(labels)
    gewoon = []
    for a in afspraken:
        soort = afval_uit_titel(a.titel)
        if soort:
            afval_dag.setdefault(a.eerste_dag, set()).add(soort)
        else:
            gewoon.append(a)
    afspraken = gewoon

    # ---- kop: maand links ---------------------------------------------------
    f_maand, f_jaar = font("Bold", 76), font("Regular", 76)
    maand = MAANDEN[vandaag.month - 1].capitalize()
    _tekst(img, (ML - 3, 104), maand, f_maand, ZWART, anchor="ls")
    _tekst(img, (ML - 3 + f_maand.getlength(maand) + 22, 104), str(vandaag.year),
           f_jaar, accent, anchor="ls")
    f_klein = font("Regular", 17)
    for i, w in enumerate((waarschuwingen or [])[:2]):
        _tekst(img, (ML, 134 + 22 * i), _pas(f"! niet bijgewerkt: {w}", f_klein, 640),
               f_klein, accent, anchor="ls")

    # ---- kop rechtsboven: statusregeltje (zon op/onder · accu · bijgewerkt) --
    xr = BREED - MR
    y_st = 30
    if bijgewerkt:
        status = (f"bijgewerkt {DAGEN_KORT[bijgewerkt.weekday()]} {bijgewerkt.day} "
                  f"{MAANDEN[bijgewerkt.month - 1][:3]} {bijgewerkt:%H:%M}")
        _tekst(img, (xr, y_st), status, f_klein, ZWART, anchor="rs")
        xr -= f_klein.getlength(status) + 22
    if accu_pct is not None:
        f_pct = font("SemiBold", 17) if accu_pct <= 20 else f_klein
        pct = f"{accu_pct}%" + (" opladen" if accu_pct <= 20 else "")
        _tekst(img, (xr, y_st), pct, f_pct, ZWART, anchor="rs")
        xr -= f_pct.getlength(pct) + 6 + 32
        _accu_icoon(d, round(xr), y_st - 13, accu_pct)
        xr -= 22
    for soort in ("onder", "op"):
        tijd = (weer or {}).get(soort)
        if tijd:
            _tekst(img, (xr, y_st), tijd, f_klein, ZWART, anchor="rs")
            xr -= f_klein.getlength(tijd) + 4 + 22
            img.paste(ZWART, (round(xr), y_st - 19, round(xr) + 22, y_st + 3),
                      _icoon_masker(soort, 22))
            xr -= 16

    # ---- kop rechts: dagverloop van het weer (07–23 uur) -------------------
    uren = (weer or {}).get("uren") or []
    if uren:
        x_l, x_r = 700, BREED - MR
        kol = (x_r - x_l) / len(uren)
        f_uur, f_temp = font("Regular", 15), font("SemiBold", 19)
        s_ic = min(38, int(kol) - 8)
        for i, u in enumerate(uren):
            mx = x_l + (i + 0.5) * kol
            _tekst(img, (mx, 62), f"{u['uur']}:00", f_uur, ZWART, anchor="ms")
            icoon = weer_info(u["code"])[0]
            if not u.get("dag", 1):
                icoon = {"zon": "maan", "half": "maan_half"}.get(icoon, icoon)
            ix, iy = round(mx - s_ic / 2), 68
            img.paste(ZWART, (ix, iy, ix + s_ic, iy + s_ic), _icoon_masker(icoon, s_ic))
            _tekst(img, (mx, 132), f"{u['temp']}°", f_temp, ZWART, anchor="ms")
    elif weer:
        # geen uurdata: het dagblok (icoon + max/min)
        icoon, omschrijving = weer_info(weer["code"])
        f_max, f_min = font("Bold", 46), font("Regular", 30)
        xr = BREED - MR
        t_max, t_min = f"{weer['max']}°", f" / {weer['min']}°"
        _tekst(img, (xr, 112), t_min, f_min, ZWART, anchor="rs")
        _tekst(img, (xr - f_min.getlength(t_min), 112), t_max, f_max, ZWART, anchor="rs")
        breedte = f_max.getlength(t_max) + f_min.getlength(t_min)
        ix = round(xr - breedte - 14 - 68)
        img.paste(ZWART, (ix, 52, ix + 68, 120), _icoon_masker(icoon, 68))

    # ---- weekdagen --------------------------------------------------------
    f_wd = font("SemiBold", 20)
    _tekst(img, (ML + WEEKKOLOM / 2, 160), "wk", f_wd, ZWART, anchor="ms", grijs=True)
    for i, naam in enumerate(DAGEN_KORT):
        _tekst(img, (x0 + i * cel_b + 12, 160), naam.upper(), f_wd,
               accent if i >= 5 else ZWART, anchor="ls")

    # ---- raster -----------------------------------------------------------
    d.rectangle((ML, GRID_TOP - 2, BREED - MR, GRID_TOP), fill=ZWART)
    for r in range(1, weken):
        y = round(GRID_TOP + r * rij_h)
        d.line((ML, y, BREED - MR, y), fill=ZWART, width=1)
    for c in range(1, 7):
        x = round(x0 + c * cel_b)
        d.line((x, GRID_TOP, x, HOOG - MB), fill=ZWART, width=1)
    d.line((ML, HOOG - MB, BREED - MR, HOOG - MB), fill=ZWART, width=1)

    # ---- afspraken indelen per week ----------------------------------------
    afspraken = [a for a in afspraken
                 if a.laatste_dag >= start and a.eerste_dag <= eind]
    balken = sorted((a for a in afspraken if a.is_balk),
                    key=lambda a: (a.eerste_dag, -(a.laatste_dag - a.eerste_dag).days, a.titel))
    getimed = sorted((a for a in afspraken if not a.is_balk),
                     key=lambda a: (a.begin, a.titel))

    f_dag, f_dag_vet = font("SemiBold", 28), font("Bold", 28)
    f_wk = font("SemiBold", 21)
    f_balk = font("SemiBold", 19)
    f_tijd, f_titel = font("SemiBold", 19), font("Regular", 19)
    f_meer = font("SemiBold", 18)
    f_afval = font("SemiBold", 15)
    vandaag_vak = None
    inspring = 12 if zwartwit else 26     # zonder kleurbolletje: tekst direct na de rand

    for w in range(weken):
        wk_start = start + dt.timedelta(days=7 * w)
        wk_eind = wk_start + dt.timedelta(days=6)
        ry = GRID_TOP + w * rij_h

        _tekst(img, (ML + WEEKKOLOM / 2, ry + 12), str(wk_start.isocalendar().week),
               f_wk, ZWART, anchor="mt", grijs=True)

        # balken op banen leggen (greedy, zoals Google)
        bezet = [[None] * 7 for _ in range(slots)]   # bezet[baan][dag]
        verborgen = [0] * 7
        geplaatst = []
        for a in balken:
            if a.laatste_dag < wk_start or a.eerste_dag > wk_eind:
                continue
            d0 = max(0, (a.eerste_dag - wk_start).days)
            d1 = min(6, (a.laatste_dag - wk_start).days)
            for baan in range(slots):
                if all(bezet[baan][k] is None for k in range(d0, d1 + 1)):
                    for k in range(d0, d1 + 1):
                        bezet[baan][k] = a
                    geplaatst.append((a, baan, d0, d1))
                    break
            else:
                for k in range(d0, d1 + 1):
                    verborgen[k] += 1

        per_dag = [[] for _ in range(7)]
        for a in getimed:
            k = (a.eerste_dag - wk_start).days
            if 0 <= k <= 6:
                per_dag[k].append(a)

        for k in range(7):
            dag = wk_start + dt.timedelta(days=k)
            cx = x0 + k * cel_b
            # dagnummer: vandaag vet (vakje wordt straks omgekeerd), de 1e met
            # maandnaam, voorbije dagen grijs
            nx, ny = cx + 12, ry + 8
            label = str(dag.day) if dag.day != 1 else f"{dag.day} {MAANDEN[dag.month - 1][:3]}"
            if dag == vandaag:
                _tekst(img, (nx, ny), label, f_dag_vet, ZWART, anchor="lt")
                vandaag_vak = (round(cx) + 1, round(ry) + 1,
                               round(cx + cel_b) - 1, round(ry + rij_h) - 1)
            else:
                _tekst(img, (nx, ny), label, f_dag_vet if dag.day == 1 else f_dag, ZWART,
                       anchor="lt", grijs=dag < vandaag)
            num_r = nx + (f_dag_vet if dag.day == 1 or dag == vandaag else f_dag).getlength(label)

            # afval: containertje + label rechtsboven in het vakje
            soorten = [x for x in AFVAL_VOLGORDE if x in afval_dag.get(dag, ())]
            if soorten:
                s_a = 22
                xa = cx + cel_b - 8
                for soort in reversed(soorten):
                    lb = f_afval.getlength(soort)
                    if xa - lb - 4 - s_a < num_r + 8:
                        break
                    _tekst(img, (xa, ny + 22), soort, f_afval, ZWART, anchor="rs")
                    ax = round(xa - lb - 4 - s_a)
                    ay = round(ny) + 3
                    img.paste(ZWART, (ax, ay, ax + s_a, ay + s_a), _icoon_masker("afval", s_a))
                    xa = ax - 10

            vrij = [s_ for s_ in range(slots) if bezet[s_][k] is None]
            lijst = per_dag[k]
            if len(lijst) + (1 if verborgen[k] else 0) <= len(vrij):
                tonen = lijst
            else:   # laatste vrije regel wordt "+N meer"
                tonen = lijst[:max(0, len(vrij) - 1)]
            extra = verborgen[k] + len(lijst) - len(tonen)
            reserve = len(vrij) - len(tonen) - (1 if extra else 0)
            j = 0
            for a in tonen:
                s_ = vrij[j]
                j += 1
                ty = ry + DAGNUM_H + s_ * SLOT_H
                if not zwartwit:
                    d.rounded_rectangle((cx + 10, ty + 9, cx + 19, ty + 18), radius=2,
                                        fill=kl(a.kleur))
                tx = cx + inspring
                tijd = a.tijd
                _tekst(img, (tx, ty + 20), tijd, f_tijd, ZWART, anchor="ls")
                tx += f_tijd.getlength(tijd) + 7
                ruimte = cx + cel_b - 8 - tx
                if (f_titel.getlength(a.titel) > ruimte and reserve > 0
                        and j < len(vrij) and vrij[j] == s_ + 1):
                    r1, r2 = _breek(a.titel, f_titel, ruimte)
                    _tekst(img, (tx, ty + 20), r1, f_titel, ZWART, anchor="ls")
                    _tekst(img, (cx + inspring, ty + SLOT_H + 20),
                           _pas(r2, f_titel, cel_b - inspring - 8), f_titel, ZWART, anchor="ls")
                    j += 1
                    reserve -= 1
                else:
                    _tekst(img, (tx, ty + 20), _pas(a.titel, f_titel, ruimte), f_titel,
                           ZWART, anchor="ls")
            if extra and j < len(vrij):
                ty = ry + DAGNUM_H + vrij[j] * SLOT_H
                _tekst(img, (cx + 12, ty + 20), f"+{extra} meer", f_meer, ZWART,
                       anchor="ls")

        for a, baan, d0, d1 in geplaatst:
            kleur = kl(a.kleur)
            loopt_door_links = a.eerste_dag < wk_start
            loopt_door_rechts = a.laatste_dag > wk_eind
            bx0 = x0 + d0 * cel_b + (1 if loopt_door_links else 7)
            bx1 = x0 + (d1 + 1) * cel_b - (1 if loopt_door_rechts else 7)
            by0 = ry + DAGNUM_H + baan * SLOT_H + 1
            by1 = by0 + SLOT_H - 4
            d.rounded_rectangle((round(bx0), by0, round(bx1), by1), radius=5, fill=kleur)
            if loopt_door_links:
                d.rectangle((round(bx0), by0, round(bx0) + 6, by1), fill=kleur)
            if loopt_door_rechts:
                d.rectangle((round(bx1) - 6, by0, round(bx1), by1), fill=kleur)
            titel = a.titel if a.hele_dag else f"{a.tijd} {a.titel}"
            _tekst(img, (bx0 + 9, by0 + 19), _pas(titel, f_balk, bx1 - bx0 - 16),
                   f_balk, _tekstkleur_op(kleur), anchor="ls")

    # ---- vandaag diapositief: het hele vakje omkeren (zwart ↔ wit) ----------
    if vandaag_vak and zwartwit:
        from PIL import ImageOps
        x_a, y_a, x_b, y_b = vandaag_vak
        y_a = max(y_a, GRID_TOP + 1)
        vak = img.crop((x_a, y_a, x_b, y_b))
        img.paste(ImageOps.invert(vak), (x_a, y_a))

    return img


render_maand = render_agenda   # oude naam


def leeg_scherm(boodschap: str) -> Image.Image:
    """Voor als er (nog) geen agenda's gekoppeld zijn."""
    img = Image.new("RGB", (BREED, HOOG), WIT)
    _tekst(img, (BREED / 2, HOOG / 2), boodschap, font("SemiBold", 40), ZWART, anchor="mm")
    return img


def afspraken_naar_json(afspraken: list[Afspraak]) -> list[dict]:
    return [asdict(a) for a in afspraken]
