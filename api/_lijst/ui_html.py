UI = r"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#101010">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Fotolijst</title>
<style>
  :root {
    color-scheme: dark;
    --bg: #101010; --kaart: #1a1a19; --rand: #2a2a28;
    --tekst: #edeae3; --dim: #8f8c85; --accent: #edeae3;
    --groen: #7fae7f;
  }
  * { box-sizing: border-box; margin: 0; -webkit-tap-highlight-color: transparent; }
  html, body { height: 100%; }
  body { background: var(--bg); color: var(--tekst);
         font: 16px/1.5 -apple-system, system-ui, sans-serif;
         display: flex; flex-direction: column; align-items: center;
         padding: max(16px, env(safe-area-inset-top)) 16px calc(28px + env(safe-area-inset-bottom)); }
  main { width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 16px; }

  header { display: flex; align-items: baseline; justify-content: space-between; padding: 2px 4px; }
  header h1 { font-size: 17px; font-weight: 650; letter-spacing: .04em; }
  header .sub { color: var(--dim); font-size: 12.5px; }

  .kaart { background: var(--kaart); border: 1px solid var(--rand); border-radius: 18px;
           padding: 16px; display: flex; flex-direction: column; gap: 13px; }

  button { font: inherit; border: 0; cursor: pointer; }
  .knop { background: var(--tekst); color: #141414; border-radius: 12px; padding: 15px;
          font-size: 16px; font-weight: 650; width: 100%; text-align: center; }
  .knop.stil { background: #262624; color: #cfccc5; }
  .knop.gevaar { background: #3a2523; color: #e8b3ac; }
  .knop:disabled { opacity: .35; }

  .status { color: var(--dim); font-size: 13.5px; text-align: center; min-height: 1.3em; }

  /* --- hero: wat er nu hangt --- */
  .hero { position: relative; border-radius: 14px; overflow: hidden; background: #000;
          aspect-ratio: 4/3; }
  .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero .leeg { position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 6px; color: var(--dim); }
  .hero .strook { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 14px 10px;
                  background: linear-gradient(transparent, rgba(0,0,0,.72));
                  display: flex; justify-content: space-between; align-items: flex-end;
                  font-size: 13px; color: #eee; }
  .hangt-label { font-size: 11px; letter-spacing: .14em; color: var(--dim);
                 text-transform: uppercase; }

  /* --- roulatie-strip --- */
  .strip-kop { display: flex; justify-content: space-between; align-items: baseline; padding: 0 2px; }
  .strip-kop h2 { font-size: 13px; letter-spacing: .12em; text-transform: uppercase;
                  color: var(--dim); font-weight: 600; }
  .strip { display: flex; gap: 10px; overflow-x: auto; padding: 2px;
           scroll-snap-type: x proximity; scrollbar-width: none; }
  .strip::-webkit-scrollbar { display: none; }
  .tegel { position: relative; flex: 0 0 128px; border-radius: 10px; overflow: hidden;
           scroll-snap-align: start; background: #000; border: 2px solid transparent; padding: 0; }
  .tegel.nu { border-color: var(--groen); }
  .tegel img { width: 128px; height: 96px; object-fit: cover; display: block; }
  .tegel .dag { position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,.62);
                color: #fff; font-size: 10.5px; padding: 1px 7px; border-radius: 99px; }
  .tegel.nu .dag { background: var(--groen); color: #10240f; font-weight: 650; }
  .tegel .wie { position: absolute; left: 0; right: 0; bottom: 0; padding: 8px 6px 3px;
                background: linear-gradient(transparent, rgba(0,0,0,.7));
                color: #ddd; font-size: 10.5px; text-align: left; }

  /* --- crop --- */
  .cropvlak { position: relative; border-radius: 12px; overflow: hidden; touch-action: none; }
  .cropvlak canvas { width: 100%; display: block; background: #000; }
  .crophint { position: absolute; inset: 0; display: flex; align-items: center;
              justify-content: center; pointer-events: none; opacity: 0; transition: opacity .3s; }
  .crophint.zichtbaar { opacity: 1; }
  .crophint span { background: rgba(0,0,0,.6); color: #fff; padding: 8px 16px;
                   border-radius: 99px; font-size: 14px; }

  .stijlkeuze { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stijlkeuze button { border-radius: 11px; padding: 12px; font-size: 15px; font-weight: 600;
                       background: #262624; color: #cfccc5; border: 2px solid transparent; }
  .stijlkeuze button.aan { background: var(--tekst); color: #141414; }

  .resultaat { border-radius: 12px; overflow: hidden; }
  .resultaat img { width: 100%; display: block; }

  input[type=password] { background: #000; color: var(--tekst); border: 1px solid var(--rand);
        border-radius: 12px; padding: 15px; font-size: 20px; width: 100%; text-align: center;
        letter-spacing: .4em; }
  .verborgen { display: none !important; }
  .spinner { margin: 14px auto; width: 30px; height: 30px; border: 3px solid #2c2c2a;
             border-top-color: var(--tekst); border-radius: 50%; animation: d 1s linear infinite; }
  @keyframes d { to { transform: rotate(360deg); } }

  /* --- actiemenu (sheet) --- */
  .sheet-achter { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex;
                  align-items: flex-end; justify-content: center; z-index: 20; }
  .sheet { background: #1d1d1b; border-radius: 18px 18px 0 0; padding: 18px 16px
           calc(18px + env(safe-area-inset-bottom)); width: 100%; max-width: 460px;
           display: flex; flex-direction: column; gap: 10px; }
  .sheet .peek { display: flex; gap: 12px; align-items: center; margin-bottom: 4px; }
  .sheet .peek img { width: 84px; height: 63px; object-fit: cover; border-radius: 8px; }
  .sheet .peek div { font-size: 13.5px; color: var(--dim); }
</style>
</head>
<body>
<main>
  <header>
    <h1>FOTOLIJST</h1>
    <div class="sub" id="apparaat"></div>
  </header>

  <!-- PIN -->
  <section id="s-pin" class="kaart verborgen">
    <div class="status">Toegangscode</div>
    <input type="password" id="pin" inputmode="numeric" autocomplete="off">
    <button class="knop" id="b-login">Binnen</button>
    <div class="status" id="pin-status"></div>
  </section>

  <!-- HOME -->
  <section id="s-home" class="verborgen" style="display:flex; flex-direction:column; gap:16px">
    <div>
      <div class="hangt-label" style="padding:0 4px 6px">Hangt nu</div>
      <div class="hero" id="hero">
        <div class="leeg" id="hero-leeg"><span style="font-size:34px">🖼️</span>
          <span>Nog geen foto — voeg de eerste toe</span></div>
        <img id="hero-img" class="verborgen" alt="">
        <div class="strook verborgen" id="hero-strook">
          <span id="hero-info"></span><span id="hero-volgende"></span>
        </div>
      </div>
    </div>

    <div>
      <div class="strip-kop">
        <h2>Roulatie</h2>
        <span id="strip-info" style="color:var(--dim); font-size:12px"></span>
      </div>
      <div class="strip" id="strip"></div>
    </div>

    <input type="file" id="file" accept="image/*" multiple class="verborgen">
    <button class="knop" id="b-toevoegen">＋ Foto's toevoegen</button>
    <div class="status">Elke nacht om 4 uur wisselt de lijst vanzelf</div>
  </section>

  <!-- CROP + STIJL (per foto) -->
  <section id="s-crop" class="kaart verborgen">
    <div class="status" id="crop-teller"></div>
    <div class="cropvlak" id="cropvlak">
      <canvas id="crop-canvas" width="880" height="660"></canvas>
      <div class="crophint" id="crophint"><span>← sleep om uit te snijden →</span></div>
    </div>
    <div class="stijlkeuze">
      <button id="st-kleur" class="aan">Kleur</button>
      <button id="st-zw">Zwart-wit</button>
    </div>
    <button class="knop" id="b-render">Maak 'm klaar →</button>
    <button class="knop stil" id="b-crop-skip">Deze overslaan</button>
  </section>

  <!-- WACHTEN -->
  <section id="s-wachten" class="kaart verborgen">
    <div class="spinner"></div>
    <div class="status" id="wacht-status">Renderen voor e-ink…</div>
  </section>

  <!-- RESULTAAT -->
  <section id="s-result" class="kaart verborgen">
    <div class="resultaat"><img id="result-img" alt=""></div>
    <div class="status">Zo komt hij op de lijst</div>
    <button class="knop" id="b-in-roulatie">In de roulatie</button>
    <button class="knop stil" id="b-nu-tonen">Nu meteen tonen</button>
  </section>
</main>

<div id="sheet-achter" class="sheet-achter verborgen">
  <div class="sheet">
    <div class="peek"><img id="sheet-img" alt=""><div id="sheet-info"></div></div>
    <button class="knop" id="sheet-nu">Nu op de lijst</button>
    <button class="knop gevaar" id="sheet-weg">Verwijderen</button>
    <button class="knop stil" id="sheet-sluit">Sluiten</button>
  </div>
</div>

<script>
const $ = id => document.getElementById(id);
const API = location.pathname.startsWith("/lijst") ? "/lijst" : "";
const secties = ["s-pin","s-home","s-crop","s-wachten","s-result"];
function toon(id) { secties.forEach(s => $(s).classList.toggle("verborgen", s !== id)); }

// PWA: manifest + icoon via JS zodat het pad overal klopt
for (const [rel, href] of [["manifest", API+"/manifest.json"],
                           ["apple-touch-icon", API+"/icon.png"]]) {
  const l = document.createElement("link"); l.rel = rel; l.href = href;
  document.head.appendChild(l);
}

async function api(pad, opties) {
  const r = await fetch(API + pad, opties);
  if (r.status === 401) { toon("s-pin"); throw new Error("login"); }
  if (!r.ok) throw new Error(await r.text());
  return r;
}
const dagLabel = i => i === 0 ? "nu" : i === 1 ? "vannacht" : `over ${i} nachten`;

// ---------- home ----------
async function laadHome() {
  try {
    const [cur, bieb] = await Promise.all([
      (await api("/api/current")).json(),
      (await api("/api/bibliotheek")).json(),
    ]);
    toon("s-home");
    // hero
    if (cur.id) {
      $("hero-img").src = `${API}/api/preview/${cur.id}/${cur.variant}`;
      $("hero-img").classList.remove("verborgen");
      $("hero-leeg").classList.add("verborgen");
      $("hero-strook").classList.remove("verborgen");
      $("hero-info").textContent = `door ${cur.door}`;
      $("hero-volgende").textContent = cur.volgende ? `vannacht → ${cur.volgende.door}` : "";
    } else {
      $("hero-img").classList.add("verborgen");
      $("hero-leeg").classList.remove("verborgen");
      $("hero-strook").classList.add("verborgen");
    }
    // strip
    $("strip").innerHTML = "";
    $("strip-info").textContent = bieb.items.length ? `${bieb.items.length} foto's` : "";
    bieb.items.forEach((it, i) => {
      const t = document.createElement("button");
      t.className = "tegel" + (i === 0 ? " nu" : "");
      t.innerHTML = `<img src="${API}/api/preview/${it.id}/${it.variant}" loading="lazy">
        <span class="dag">${dagLabel(i)}</span><span class="wie">${it.door}</span>`;
      t.onclick = () => openSheet(it);
      $("strip").appendChild(t);
    });
    laadStatus();
  } catch (e) { /* pin-scherm staat al */ }
}

async function laadStatus() {
  try {
    const s = await (await api("/api/status")).json();
    if (s.pct != null) {
      const ik = s.pct > 60 ? "\u{1F50B}" : s.pct > 25 ? "\u{1FAAB}" : "⚠️";
      $("apparaat").textContent = `${ik} ${s.pct}%`;
    } else if (s.tijd) {
      const d = new Date(s.tijd * 1000);
      $("apparaat").textContent = `gezien ${d.toLocaleDateString("nl-NL",{day:"numeric",month:"short"})}`;
    }
  } catch (e) {}
}

// ---------- actiemenu ----------
let sheetItem = null;
function openSheet(it) {
  sheetItem = it;
  $("sheet-img").src = `${API}/api/preview/${it.id}/${it.variant}`;
  $("sheet-info").textContent = `door ${it.door} · ${it.variant === "Z" ? "zwart-wit" : "kleur"}`;
  $("sheet-achter").classList.remove("verborgen");
}
$("sheet-sluit").onclick = () => $("sheet-achter").classList.add("verborgen");
$("sheet-achter").onclick = e => { if (e.target === $("sheet-achter")) $("sheet-sluit").onclick(); };
$("sheet-nu").onclick = async () => {
  const fd = new FormData(); fd.append("actie", "nu"); fd.append("id", sheetItem.id);
  await api("/api/bibliotheek", { method: "POST", body: fd });
  $("sheet-sluit").onclick(); laadHome();
};
$("sheet-weg").onclick = async () => {
  if (!confirm("Deze foto uit de roulatie halen?")) return;
  const fd = new FormData(); fd.append("actie", "verwijder"); fd.append("id", sheetItem.id);
  await api("/api/bibliotheek", { method: "POST", body: fd });
  $("sheet-sluit").onclick(); laadHome();
};

// ---------- login ----------
$("b-login").onclick = async () => {
  const fd = new FormData(); fd.append("pin", $("pin").value);
  try {
    await api("/api/login", { method: "POST", body: fd });
    $("pin-status").textContent = "";
    laadHome();
  } catch (e) { $("pin-status").textContent = "Die is niet goed"; }
};
$("pin").addEventListener("keydown", e => { if (e.key === "Enter") $("b-login").onclick(); });

// ---------- foto's toevoegen (meerdere tegelijk) ----------
let wachtrij = [], wachtIndex = 0;
let origImg = null, cropPos = 0.5, stijl = "kleur", fotoId = null;

$("b-toevoegen").onclick = () => $("file").click();
$("file").onchange = () => {
  wachtrij = Array.from($("file").files);
  $("file").value = "";
  if (wachtrij.length) { wachtIndex = 0; volgendeFoto(); }
};

async function volgendeFoto() {
  if (wachtIndex >= wachtrij.length) { laadHome(); return; }
  const f = wachtrij[wachtIndex];
  fotoId = null; cropPos = 0.5; stijl = "kleur";
  zetStijlKnoppen();
  const bmp = await createImageBitmap(f);
  const schaal = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * schaal);
  c.height = Math.round(bmp.height * schaal);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  origImg = c;
  $("crop-teller").textContent = wachtrij.length > 1
    ? `Foto ${wachtIndex + 1} van ${wachtrij.length}` : "Uitsnede";
  tekenCrop();
  const kanSchuiven = Math.abs(origImg.width / origImg.height - 4/3) > 0.01;
  $("crophint").classList.toggle("zichtbaar", kanSchuiven);
  setTimeout(() => $("crophint").classList.remove("zichtbaar"), 2200);
  toon("s-crop");
}

function tekenCrop() {
  const ctx = $("crop-canvas").getContext("2d");
  const W = 880, H = 660, doel = 4/3;
  const w = origImg.width, h = origImg.height;
  let sx = 0, sy = 0, sw = w, sh = h;
  if (w / h > doel) { sw = h * doel; sx = (w - sw) * cropPos; }
  else { sh = w / doel; sy = (h - sh) * cropPos; }
  ctx.filter = stijl === "zw" ? "grayscale(1)" : "none";
  ctx.drawImage(origImg, sx, sy, sw, sh, 0, 0, W, H);
  ctx.filter = "none";
}

// uitsnede kiezen door op het beeld zelf te slepen
let sleep0 = null;
$("cropvlak").addEventListener("pointerdown", e => {
  sleep0 = { x: e.clientX, y: e.clientY, pos: cropPos };
  $("cropvlak").setPointerCapture(e.pointerId);
});
$("cropvlak").addEventListener("pointermove", e => {
  if (!sleep0 || !origImg) return;
  const r = $("cropvlak").getBoundingClientRect();
  const liggend = origImg.width / origImg.height > 4/3;
  const frac = liggend ? (e.clientX - sleep0.x) / r.width : (e.clientY - sleep0.y) / r.height;
  cropPos = Math.min(1, Math.max(0, sleep0.pos - frac * 1.6));
  tekenCrop();
});
["pointerup", "pointercancel"].forEach(ev =>
  $("cropvlak").addEventListener(ev, () => { sleep0 = null; }));

function zetStijlKnoppen() {
  $("st-kleur").classList.toggle("aan", stijl === "kleur");
  $("st-zw").classList.toggle("aan", stijl === "zw");
}
$("st-kleur").onclick = () => { stijl = "kleur"; zetStijlKnoppen(); tekenCrop(); };
$("st-zw").onclick = () => { stijl = "zw"; zetStijlKnoppen(); tekenCrop(); };
$("b-crop-skip").onclick = () => { wachtIndex++; volgendeFoto(); };

// ---------- renderen ----------
let resultVariant = "C";
$("b-render").onclick = async () => {
  $("wacht-status").textContent = wachtrij.length > 1
    ? `Renderen — foto ${wachtIndex + 1} van ${wachtrij.length} (±15 sec)`
    : "Renderen voor e-ink… (±15 sec)";
  toon("s-wachten");
  try {
    if (!fotoId) {
      const blob = await new Promise(res => origImg.toBlob(res, "image/jpeg", 0.9));
      const fd = new FormData(); fd.append("foto", blob, "foto.jpg");
      fotoId = (await (await api("/api/upload", { method: "POST", body: fd })).json()).id;
    }
    const fd2 = new FormData();
    fd2.append("id", fotoId);
    fd2.append("crop_pos", cropPos);
    fd2.append("stijl", stijl);
    resultVariant = (await (await api("/api/render", { method: "POST", body: fd2 })).json()).variant;
    $("result-img").src = `${API}/api/preview/${fotoId}/${resultVariant}?t=${Date.now()}`;
    toon("s-result");
  } catch (e) {
    alert("Renderen mislukt: " + e.message);
    toon("s-crop");
  }
};

async function plaats(modus) {
  let naam = localStorage.getItem("eink_naam");
  if (!naam) {
    naam = prompt("Wie ben jij? (voor bij de foto)") || "?";
    localStorage.setItem("eink_naam", naam);
  }
  const fd = new FormData();
  fd.append("id", fotoId); fd.append("variant", resultVariant);
  fd.append("door", naam); fd.append("modus", modus);
  await api("/api/kies", { method: "POST", body: fd });
  wachtIndex++;
  volgendeFoto();
}
$("b-in-roulatie").onclick = () => plaats("roulatie");
$("b-nu-tonen").onclick = () => plaats("nu");

toon("s-pin");
laadHome();
</script>
</body>
</html>
"""
