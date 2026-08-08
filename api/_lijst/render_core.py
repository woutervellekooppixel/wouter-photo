#!/usr/bin/env python3
"""
Render-pijplijn voor de e-ink fotolijst (Waveshare 13.3" Spectra 6).

Input:  sRGB JPG (Lightroom-export)
Output: per variant twee bestanden in out/
  <naam>_<variant>_panel.png   1600x1200, nominale paletkleuren -> naar de Pi
  <naam>_<variant>_preview.png 1600x1200, waargenomen paneelkleuren -> beoordelen op monitor

Dithering: Floyd-Steinberg met serpentine scanning, afstanden in Oklab,
tegen de WAARGENOMEN paneelkleuren (schattingen; vervangen na paletmeting).

Gebruik: python3 render.py foto.jpg [outdir]
"""
import sys
import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

# --- Palet ---------------------------------------------------------------
# Nominale kleuren: wat epd13in3E.getbuffer() verwacht in de panel-PNG.
NOMINAAL = np.array([
    (0, 0, 0),        # zwart
    (255, 255, 255),  # wit
    (255, 255, 0),    # geel
    (255, 0, 0),      # rood
    (0, 0, 255),      # blauw
    (0, 255, 0),      # groen
], dtype=np.uint8)

# Waargenomen kleuren (startschattingen uit de projectbrief).
# NA DE PALETMETING VERVANGEN.
WAARGENOMEN = np.array([
    (30, 30, 32),     # zwart
    (215, 213, 205),  # wit
    (200, 175, 60),   # geel
    (150, 55, 50),    # rood
    (55, 65, 115),    # blauw
    (75, 110, 75),    # groen
], dtype=np.float64)

BREED, HOOG = 1600, 1200

# Pre-processing-varianten: (contrast, verzadiging, unsharp-amount, gamma)
# gamma < 1 tilt de middentonen op — e-ink heeft geen backlight en het
# paneelwit is grauw, dus donkere foto's hebben een flinke lift nodig.
VARIANTEN = {
    "A": (1.05, 1.10, 80, 0.82),   # neutraal + lift
    "B": (1.15, 1.35, 130, 0.78),  # punch + stevige lift
    "C": (0.95, 1.00, 60, 0.90),   # zacht, milde lift
}

# --- Oklab ---------------------------------------------------------------
def srgb_naar_oklab(rgb):
    """rgb: (...,3) in 0..255 -> Oklab (...,3)."""
    c = np.asarray(rgb, dtype=np.float64) / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                   [0.2119034982, 0.6806995451, 0.1073969566],
                   [0.0883024619, 0.2817188376, 0.6299787005]])
    M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                   [1.9779984951, -2.4285922050, 0.4505937099],
                   [0.0259040371, 0.7827717662, -0.8086757660]])
    lms = lin @ M1.T
    lms_ = np.cbrt(lms)
    return lms_ @ M2.T

PAL_LAB = srgb_naar_oklab(WAARGENOMEN)

# --- Nearest-palet lookup via grid (snelheid) ----------------------------
# 56^3 rooster over de Oklab-ruimte; per cel de index van de dichtstbijzijnde
# paletkleur. In de ditherloop is de keuze dan een simpele lookup.
GRID_N = 56
L_LO, L_HI = -0.05, 1.05
AB_LO, AB_HI = -0.45, 0.45

def bouw_grid():
    ls = np.linspace(L_LO, L_HI, GRID_N)
    ab = np.linspace(AB_LO, AB_HI, GRID_N)
    gl, ga, gb = np.meshgrid(ls, ab, ab, indexing="ij")
    pts = np.stack([gl, ga, gb], axis=-1).reshape(-1, 3)
    d = ((pts[:, None, :] - PAL_LAB[None, :, :]) ** 2).sum(axis=2)
    return d.argmin(axis=1).astype(np.uint8).reshape(GRID_N, GRID_N, GRID_N)

GRID = bouw_grid()

# --- Crop & pre-processing ----------------------------------------------
def crop_4op3(im, pos=0.5):
    """Crop naar 4:3 en schalen naar 1600x1200.
    pos = crop-hint 0..1: positie van het venster langs de lange as
    (0.5 = center; bij een liggende foto 0 = links, 1 = rechts)."""
    w, h = im.size
    doel = BREED / HOOG
    pos = min(1.0, max(0.0, pos))
    if w / h > doel:
        nw = int(h * doel)
        x0 = round((w - nw) * pos)
        im = im.crop((x0, 0, x0 + nw, h))
    else:
        nh = int(w / doel)
        y0 = round((h - nh) * pos)
        im = im.crop((0, y0, w, y0 + nh))
    return im.resize((BREED, HOOG), Image.LANCZOS)

def preprocess(im, contrast, verzadiging, unsharp, gamma):
    if gamma != 1.0:
        lut = [round(255 * (v / 255) ** gamma) for v in range(256)]
        im = im.point(lut * 3)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(verzadiging)
    # voorscherpen: dithering vreet micro-contrast
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=unsharp, threshold=2))
    return im

# --- Toonmapping ---------------------------------------------------------
def naar_paneelbereik(lab):
    """Map L van het beeld naar het L-bereik van het paneel (zwart..wit),
    zodat de tooncurve klopt met wat het paneel echt kan."""
    l_zwart = PAL_LAB[0, 0]
    l_wit = PAL_LAB[1, 0]
    lab = lab.copy()
    lab[..., 0] = l_zwart + lab[..., 0] * (l_wit - l_zwart)
    return lab

# --- Floyd-Steinberg, serpentine, in Oklab -------------------------------
def dither(lab):
    """lab: (H,W,3) Oklab -> (H,W) paletindices."""
    H, W = lab.shape[:2]
    uit = np.zeros((H, W), dtype=np.uint8)
    pal = PAL_LAB.tolist()
    grid = GRID
    sl = (GRID_N - 1) / (L_HI - L_LO)
    sab = (GRID_N - 1) / (AB_HI - AB_LO)
    KLEM = 0.30  # rem op doorgegeven fout, voorkomt wormen in vlakke delen

    fout_vlg = [[0.0, 0.0, 0.0] for _ in range(W + 2)]
    for y in range(H):
        rij = lab[y].tolist()
        fout_cur = fout_vlg
        fout_vlg = [[0.0, 0.0, 0.0] for _ in range(W + 2)]
        richting = 1 if (y % 2 == 0) else -1
        xs = range(W) if richting == 1 else range(W - 1, -1, -1)
        rij_uit = uit[y]
        for x in xs:
            fc = fout_cur[x + 1]
            l = rij[x][0] + fc[0]
            a = rij[x][1] + fc[1]
            b = rij[x][2] + fc[2]
            il = int((l - L_LO) * sl + 0.5)
            ia = int((a - AB_LO) * sab + 0.5)
            ib = int((b - AB_LO) * sab + 0.5)
            if il < 0: il = 0
            elif il >= GRID_N: il = GRID_N - 1
            if ia < 0: ia = 0
            elif ia >= GRID_N: ia = GRID_N - 1
            if ib < 0: ib = 0
            elif ib >= GRID_N: ib = GRID_N - 1
            idx = grid[il, ia, ib]
            rij_uit[x] = idx
            p = pal[idx]
            el = l - p[0]; ea = a - p[1]; eb = b - p[2]
            if el > KLEM: el = KLEM
            elif el < -KLEM: el = -KLEM
            if ea > KLEM: ea = KLEM
            elif ea < -KLEM: ea = -KLEM
            if eb > KLEM: eb = KLEM
            elif eb < -KLEM: eb = -KLEM
            # serpentine: 'rechts' is de scanrichting
            r = fout_cur[x + 1 + richting]
            r[0] += el * 0.4375; r[1] += ea * 0.4375; r[2] += eb * 0.4375
            d = fout_vlg[x + 1]
            d[0] += el * 0.3125; d[1] += ea * 0.3125; d[2] += eb * 0.3125
            dl = fout_vlg[x + 1 - richting]
            dl[0] += el * 0.1875; dl[1] += ea * 0.1875; dl[2] += eb * 0.1875
            dr = fout_vlg[x + 1 + richting]
            dr[0] += el * 0.0625; dr[1] += ea * 0.0625; dr[2] += eb * 0.0625
    return uit

# --- API voor hergebruik (webapp) ----------------------------------------
def render_variant(im, variant, crop_pos=0.5):
    """im: PIL RGB (origineel) -> (panel_png, preview_png) als PIL Images."""
    from PIL import ImageOps
    im = ImageOps.exif_transpose(im).convert("RGB")
    im = crop_4op3(im, crop_pos)
    contrast, verz, us, gamma = VARIANTEN[variant]
    bewerkt = preprocess(im, contrast, verz, us, gamma)
    lab = srgb_naar_oklab(np.asarray(bewerkt))
    lab = naar_paneelbereik(lab)
    idx = dither(lab)
    panel = Image.fromarray(NOMINAAL[idx])
    preview = Image.fromarray(WAARGENOMEN.astype(np.uint8)[idx])
    return panel, preview

def render_alle_varianten(im, crop_pos=0.5):
    return {v: render_variant(im, v, crop_pos) for v in VARIANTEN}

# --- Hoofdprogramma ------------------------------------------------------
def main():
    if len(sys.argv) < 2:
        sys.exit("gebruik: python3 render.py foto.jpg [outdir] [crop_pos 0..1]")
    pad = sys.argv[1]
    outdir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "out")
    crop_pos = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    os.makedirs(outdir, exist_ok=True)
    naam = os.path.splitext(os.path.basename(pad))[0]

    im = Image.open(pad)
    for variant, (panel, preview) in render_alle_varianten(im, crop_pos).items():
        panel.save(os.path.join(outdir, f"{naam}_{variant}_panel.png"))
        preview.save(os.path.join(outdir, f"{naam}_{variant}_preview.png"))
        print(f"variant {variant} klaar")

if __name__ == "__main__":
    main()
