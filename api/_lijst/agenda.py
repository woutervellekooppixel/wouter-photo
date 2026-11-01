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


def verzamel(bronnen: list[dict], vandaag: dt.date, cache_get, cache_put):
    """Haalt alle bronnen parallel op. Bij een fout valt een bron terug op
    de laatst gelukte download (cache), zodat de lijst nooit leeg raakt.
    Geeft (afspraken, waarschuwingen) terug."""
    start, eind = maandbereik(vandaag)
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


# --- Maandweergave -----------------------------------------------------------
# Maatvoering in paneelpixels (1600×1200, ~150 dpi). Het lijstvenster valt
# 0,5 mm (≈3 px) over het beeld; marges houden daar ruim rekening mee.
ML, MR, MT, MB = 46, 46, 34, 34
WEEKKOLOM = 46
GRID_TOP = 172
DAGNUM_H = 44          # ruimte bovenin een vakje voor het dagnummer
SLOT_H = 28            # hoogte van één afspraakregel / balk


def render_maand(vandaag: dt.date, afspraken: list[Afspraak], *,
                 bijgewerkt: dt.datetime | None = None,
                 accu_pct: int | None = None,
                 waarschuwingen: list[str] | None = None) -> Image.Image:
    img = Image.new("RGB", (BREED, HOOG), WIT)
    d = ImageDraw.Draw(img)

    start, eind = maandbereik(vandaag)
    weken = ((eind - start).days + 1) // 7
    x0 = ML + WEEKKOLOM
    cel_b = (BREED - MR - x0) / 7
    rij_h = (HOOG - MB - GRID_TOP) / weken
    slots = max(1, int((rij_h - DAGNUM_H - 4) // SLOT_H))

    # ---- kop --------------------------------------------------------------
    f_maand, f_jaar = font("Bold", 76), font("Regular", 76)
    maand = MAANDEN[vandaag.month - 1].capitalize()
    _tekst(img, (ML - 3, 104), maand, f_maand, ZWART, anchor="ls")
    _tekst(img, (ML - 3 + f_maand.getlength(maand) + 22, 104), str(vandaag.year),
           f_jaar, ROOD, anchor="ls")

    f_klein = font("Regular", 21)
    regels = []
    if bijgewerkt:
        regels.append((f"bijgewerkt {DAGEN_KORT[bijgewerkt.weekday()]} "
                       f"{bijgewerkt.day} {MAANDEN[bijgewerkt.month - 1][:3]} "
                       f"{bijgewerkt:%H:%M}", ZWART, False))
    if accu_pct is not None and accu_pct <= 20:
        regels.append((f"accu {accu_pct}% — graag opladen", ROOD, False))
    for w in (waarschuwingen or [])[:2]:
        regels.append((f"niet bijgewerkt: {w}", ROOD, False))
    y = 104 - 30 * (len(regels) - 1)
    for tekst, kleur, grijs in regels:
        _tekst(img, (BREED - MR, y), _pas(tekst, f_klein, 620), f_klein, kleur,
               anchor="rs", grijs=grijs)
        y += 30

    # ---- weekdagen --------------------------------------------------------
    f_wd = font("SemiBold", 20)
    _tekst(img, (ML + WEEKKOLOM / 2, 160), "wk", f_wd, ZWART, anchor="ms", grijs=True)
    for i, naam in enumerate(DAGEN_KORT):
        _tekst(img, (x0 + i * cel_b + 12, 160), naam.upper(), f_wd,
               ROOD if i >= 5 else ZWART, anchor="ls")

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

        # getimede afspraken in de vrije regels per dag
        per_dag = [[] for _ in range(7)]
        for a in getimed:
            k = (a.eerste_dag - wk_start).days
            if 0 <= k <= 6:
                per_dag[k].append(a)

        for k in range(7):
            dag = wk_start + dt.timedelta(days=k)
            cx = x0 + k * cel_b
            # dagnummer
            nx, ny = cx + 12, ry + 8
            if dag == vandaag:
                tekst = str(dag.day)
                bw = f_dag_vet.getlength(tekst)
                r = 21
                mx = nx + bw / 2
                d.ellipse((mx - max(r, bw / 2 + 9), ny + 15 - r,
                           mx + max(r, bw / 2 + 9), ny + 15 + r), fill=ROOD)
                _tekst(img, (mx, ny + 15), tekst, f_dag_vet, WIT, anchor="mm")
            else:
                _tekst(img, (nx, ny), str(dag.day), f_dag, ZWART, anchor="lt",
                       grijs=dag.month != vandaag.month)

            vrij = [s for s in range(slots) if bezet[s][k] is None]
            lijst = per_dag[k]
            if len(lijst) + (1 if verborgen[k] else 0) <= len(vrij):
                tonen = lijst
            else:   # laatste vrije regel wordt "+N meer"
                tonen = lijst[:max(0, len(vrij) - 1)]
            extra = verborgen[k] + len(lijst) - len(tonen)
            # regels die over zijn mogen lange titels een tweede regel geven
            reserve = len(vrij) - len(tonen) - (1 if extra else 0)
            j = 0
            for a in tonen:
                s = vrij[j]
                j += 1
                ty = ry + DAGNUM_H + s * SLOT_H
                kleur = KLEUREN.get(a.kleur, BLAUW)
                d.rounded_rectangle((cx + 10, ty + 9, cx + 19, ty + 18), radius=2, fill=kleur)
                tx = cx + 26
                tijd = a.tijd
                _tekst(img, (tx, ty + 20), tijd, f_tijd, ZWART, anchor="ls")
                tx += f_tijd.getlength(tijd) + 7
                ruimte = cx + cel_b - 8 - tx
                if (f_titel.getlength(a.titel) > ruimte and reserve > 0
                        and j < len(vrij) and vrij[j] == s + 1):
                    r1, r2 = _breek(a.titel, f_titel, ruimte)
                    _tekst(img, (tx, ty + 20), r1, f_titel, ZWART, anchor="ls")
                    _tekst(img, (cx + 26, ty + SLOT_H + 20),
                           _pas(r2, f_titel, cel_b - 34), f_titel, ZWART, anchor="ls")
                    j += 1
                    reserve -= 1
                else:
                    _tekst(img, (tx, ty + 20), _pas(a.titel, f_titel, ruimte), f_titel,
                           ZWART, anchor="ls")
            if extra and j < len(vrij):
                ty = ry + DAGNUM_H + vrij[j] * SLOT_H
                _tekst(img, (cx + 12, ty + 20), f"+{extra} meer", f_meer, ZWART,
                       anchor="ls")

        # balken tekenen (na de dagnummers, zodat ze er nooit onder vallen)
        for a, baan, d0, d1 in geplaatst:
            kleur = KLEUREN.get(a.kleur, BLAUW)
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

    return img


def leeg_scherm(boodschap: str) -> Image.Image:
    """Voor als er (nog) geen agenda's gekoppeld zijn."""
    img = Image.new("RGB", (BREED, HOOG), WIT)
    _tekst(img, (BREED / 2, HOOG / 2), boodschap, font("SemiBold", 40), ZWART, anchor="mm")
    return img


def afspraken_naar_json(afspraken: list[Afspraak]) -> list[dict]:
    return [asdict(a) for a in afspraken]
