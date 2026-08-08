UI = r"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Fotolijst</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; margin: 0; }
  body { background:#111; color:#eee; font:16px/1.5 -apple-system, system-ui, sans-serif;
         min-height:100dvh; display:flex; flex-direction:column; align-items:center;
         padding:max(20px, env(safe-area-inset-top)) 20px 40px; }
  main { width:100%; max-width:440px; display:flex; flex-direction:column; gap:20px; }
  h1 { font-size:20px; font-weight:600; letter-spacing:.02em; }
  h1 small { color:#888; font-weight:400; font-size:13px; display:block; }
  .kaart { background:#1b1b1b; border-radius:14px; padding:18px; display:flex;
           flex-direction:column; gap:14px; }
  button, .knop { background:#eee; color:#111; border:0; border-radius:10px; padding:14px;
           font-size:16px; font-weight:600; width:100%; cursor:pointer; text-align:center; }
  button.stil { background:#2a2a2a; color:#ccc; }
  button:disabled { opacity:.4; }
  input[type=password], input[type=text] { background:#000; color:#eee; border:1px solid #333;
           border-radius:10px; padding:14px; font-size:18px; width:100%; text-align:center;
           letter-spacing:.3em; }
  input[type=range] { width:100%; }
  canvas { width:100%; border-radius:10px; background:#000; display:block; }
  .previews { display:flex; flex-direction:column; gap:14px; }
  .previews figure { position:relative; cursor:pointer; border-radius:12px; overflow:hidden;
           border:3px solid transparent; }
  .previews figure.gekozen { border-color:#eee; }
  .previews img { width:100%; display:block; }
  .previews figcaption { position:absolute; left:10px; top:8px; background:#000a; color:#fff;
           padding:2px 10px; border-radius:99px; font-size:13px; }
  .status { color:#888; font-size:14px; text-align:center; min-height:1.4em; }
  .bieb-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:12px 0; }
  .bieb-grid .tegel { position:relative; border-radius:8px; overflow:hidden; border:2px solid transparent; }
  .bieb-grid .tegel.actief { border-color:#2e7d32; }
  .bieb-grid img { width:100%; display:block; }
  .bieb-grid .weg { position:absolute; top:4px; right:4px; background:rgba(0,0,0,.55);
    color:#fff; border:none; border-radius:50%; width:28px; height:28px; font-size:15px; }
  .bieb-grid .wie { position:absolute; left:0; right:0; bottom:0; background:rgba(0,0,0,.45);
    color:#fff; font-size:11px; padding:2px 6px; }
  .toggle { display:flex; gap:10px; align-items:center; justify-content:center; margin:6px 0 2px; }
  .toggle input { width:20px; height:20px; }
  .verborgen { display:none !important; }
  .spinner { margin:0 auto; width:28px; height:28px; border:3px solid #333;
           border-top-color:#eee; border-radius:50%; animation:d 1s linear infinite; }
  @keyframes d { to { transform:rotate(360deg); } }
</style>
</head>
<body>
<main>
  <h1>Fotolijst <small id="huidig"></small></h1>
  <div class="status" id="apparaat"></div>

  <section id="s-pin" class="kaart verborgen">
    <p>Toegangscode</p>
    <input type="password" id="pin" inputmode="numeric" autocomplete="off">
    <button id="b-login">Binnen</button>
    <div class="status" id="pin-status"></div>
  </section>

  <section id="s-upload" class="kaart verborgen">
    <input type="file" id="file" accept="image/*" class="verborgen">
    <button id="b-kies-foto">📷 Kies een foto</button>
    <div class="status">JPG vanaf je camerarol; hij wordt liggend 4:3</div>
    <button class="stil" id="b-naar-bieb-1">Bibliotheek &amp; roulatie</button>
  </section>

  <section id="s-crop" class="kaart verborgen">
    <canvas id="crop-canvas" width="800" height="600"></canvas>
    <input type="range" id="crop-slider" min="0" max="100" value="50">
    <div class="status">Schuif om de uitsnede te kiezen</div>
    <button id="b-render">Maak drie versies →</button>
    <button class="stil" id="b-opnieuw-1">Andere foto</button>
  </section>

  <section id="s-wachten" class="kaart verborgen">
    <div class="spinner"></div>
    <div class="status">Renderen voor e-ink… (±20 sec)</div>
  </section>

  <section id="s-kies" class="kaart verborgen">
    <div class="previews" id="previews"></div>
    <div class="status">Tik de versie die je het mooist vindt</div>
    <button id="b-plaats" disabled>Zet direct op de lijst</button>
    <button id="b-roulatie" disabled class="stil">Voeg toe aan de dagroulatie</button>
    <button class="stil" id="b-opnieuw-2">Andere foto</button>
  </section>

  <section id="s-klaar" class="kaart verborgen">
    <p style="text-align:center; font-size:40px">🖼️</p>
    <div class="status" id="klaar-status"></div>
    <button class="stil" id="b-opnieuw-3">Nog een foto</button>
    <button class="stil" id="b-naar-bieb-2">Bibliotheek</button>
  </section>

  <section id="s-bieb" class="kaart verborgen">
    <label class="toggle">
      <input type="checkbox" id="t-roulatie">
      <span>Elke dag automatisch wisselen</span>
    </label>
    <div class="status" id="bieb-status"></div>
    <div id="bieb-grid" class="bieb-grid"></div>
    <button class="stil" id="b-terug">← Terug</button>
  </section>
</main>

<script>
const $ = id => document.getElementById(id);
const secties = ["s-pin","s-upload","s-crop","s-wachten","s-kies","s-klaar","s-bieb"];
function toon(id) { secties.forEach(s => $(s).classList.toggle("verborgen", s !== id)); }

let origBlob = null, fotoId = null, gekozenVariant = null;
let origImg = null;

async function api(pad, opties) {
  const r = await fetch(pad, opties);
  if (r.status === 401) { toon("s-pin"); throw new Error("login"); }
  if (!r.ok) throw new Error(await r.text());
  return r;
}

async function start() {
  try {
    const r = await api("/lijst/api/current");
    const meta = await r.json();
    if (meta.tijd) {
      const d = new Date(meta.tijd * 1000);
      $("huidig").textContent = `nu: versie ${meta.variant} · door ${meta.door} · ${d.toLocaleDateString("nl-NL")}`;
    }
    toon("s-upload");
  } catch (e) { /* pin-scherm staat al */ return; }
  laadStatus();
}

async function laadStatus() {
  try {
    const s = await (await api("/lijst/api/status")).json();
    if (s.pct != null) {
      const ikoon = s.pct > 60 ? "\u{1F50B}" : s.pct > 25 ? "\u{1FAAB}" : "\u{26A0}\u{FE0F}";
      const d = s.tijd ? new Date(s.tijd*1000).toLocaleDateString("nl-NL") : "";
      $("apparaat").textContent = `${ikoon} accu ${s.pct}% (${s.vbat} V) \u00B7 lijst laatst gezien ${d}`;
    } else if (s.tijd) {
      $("apparaat").textContent = `\u{1F50C} netstroom \u00B7 lijst laatst gezien ${new Date(s.tijd*1000).toLocaleDateString("nl-NL")}`;
    }
  } catch (e) {}
}

async function laadBieb() {
  const b = await (await api("/lijst/api/bibliotheek")).json();
  $("t-roulatie").checked = b.mode === "roulatie";
  $("bieb-status").textContent = b.items.length
    ? (b.mode === "roulatie" ? `${b.items.length} foto's \u00B7 elke nacht de volgende` : "vaste foto \u00B7 wisselen staat uit")
    : "Nog geen foto's \u2014 upload je eerste";
  $("bieb-grid").innerHTML = "";
  for (const it of b.items.slice().reverse()) {
    const t = document.createElement("div");
    t.className = "tegel" + (it.id === b.actueel_id ? " actief" : "");
    t.innerHTML = `<img src="/lijst/api/preview/${it.id}/${it.variant}" loading="lazy">
      <div class="wie">${it.door} \u00B7 versie ${it.variant}</div>
      <button class="weg" title="verwijderen">\u2715</button>`;
    t.querySelector(".weg").onclick = async () => {
      if (!confirm("Deze foto uit de lijst halen?")) return;
      const fd = new FormData(); fd.append("actie","verwijder"); fd.append("id", it.id);
      await api("/lijst/api/bibliotheek", {method:"POST", body:fd});
      laadBieb();
    };
    $("bieb-grid").appendChild(t);
  }
}

$("b-naar-bieb-1").onclick = () => { toon("s-bieb"); laadBieb(); };
$("b-naar-bieb-2").onclick = () => { toon("s-bieb"); laadBieb(); };
$("b-terug").onclick = () => toon("s-upload");
$("t-roulatie").onchange = async () => {
  const fd = new FormData(); fd.append("actie","mode");
  fd.append("mode", $("t-roulatie").checked ? "roulatie" : "vast");
  await api("/lijst/api/bibliotheek", {method:"POST", body:fd});
  laadBieb();
};

$("b-login").onclick = async () => {
  const fd = new FormData(); fd.append("pin", $("pin").value);
  try {
    await api("/lijst/api/login", { method:"POST", body:fd });
    $("pin-status").textContent = "";
    start();
  } catch (e) { $("pin-status").textContent = "Die is niet goed"; }
};

$("b-kies-foto").onclick = () => $("file").click();
$("file").onchange = async () => {
  const f = $("file").files[0];
  if (!f) return;
  // client-side verkleinen: max 2400px, JPEG 0.9 — snelle upload, onder serverlimiet
  const bmp = await createImageBitmap(f);
  const schaal = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * schaal);
  c.height = Math.round(bmp.height * schaal);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  origBlob = await new Promise(res => c.toBlob(res, "image/jpeg", 0.9));
  origImg = c;
  tekenCrop();
  toon("s-crop");
};

function tekenCrop() {
  const pos = $("crop-slider").value / 100;
  const ctx = $("crop-canvas").getContext("2d");
  const W = 800, H = 600, doel = 4/3;
  const w = origImg.width, h = origImg.height;
  let sx = 0, sy = 0, sw = w, sh = h;
  if (w / h > doel) { sw = h * doel; sx = (w - sw) * pos; }
  else { sh = w / doel; sy = (h - sh) * pos; }
  ctx.drawImage(origImg, sx, sy, sw, sh, 0, 0, W, H);
}
$("crop-slider").oninput = tekenCrop;

$("b-render").onclick = async () => {
  toon("s-wachten");
  try {
    if (!fotoId) {
      const fd = new FormData(); fd.append("foto", origBlob, "foto.jpg");
      const r = await api("/lijst/api/upload", { method:"POST", body:fd });
      fotoId = (await r.json()).id;
    }
    const fd2 = new FormData();
    fd2.append("id", fotoId);
    fd2.append("crop_pos", $("crop-slider").value / 100);
    await api("/lijst/api/render", { method:"POST", body:fd2 });
    const namen = { A: "Neutraal", B: "Punch", C: "Zacht" };
    $("previews").innerHTML = "";
    for (const v of ["A","B","C"]) {
      const fig = document.createElement("figure");
      fig.innerHTML = `<img src="/lijst/api/preview/${fotoId}/${v}?t=${Date.now()}"><figcaption>${namen[v]}</figcaption>`;
      fig.onclick = () => {
        document.querySelectorAll(".previews figure").forEach(f => f.classList.remove("gekozen"));
        fig.classList.add("gekozen");
        gekozenVariant = v;
        $("b-plaats").disabled = false; $("b-roulatie").disabled = false;
      };
      $("previews").appendChild(fig);
    }
    toon("s-kies");
  } catch (e) {
    alert("Renderen mislukt: " + e.message);
    toon("s-crop");
  }
};

async function plaats(modus) {
  let naam = localStorage.getItem("eink_naam");
  if (!naam) {
    naam = prompt("Wie ben jij? (voor het lijstje)") || "?";
    localStorage.setItem("eink_naam", naam);
  }
  const fd = new FormData();
  fd.append("id", fotoId);
  fd.append("variant", gekozenVariant);
  fd.append("door", naam);
  fd.append("modus", modus);
  await api("/lijst/api/kies", { method:"POST", body:fd });
  $("klaar-status").textContent = modus === "direct"
    ? "Staat klaar — de lijst pakt hem bij de volgende verversing."
    : "In de roulatie — hij komt vanzelf voorbij.";
  toon("s-klaar");
}
$("b-plaats").onclick = () => plaats("direct");
$("b-roulatie").onclick = () => plaats("roulatie");

function reset() { origBlob = null; fotoId = null; gekozenVariant = null; $("file").value = ""; $("b-plaats").disabled = true; $("b-roulatie").disabled = true; toon("s-upload"); start(); }
$("b-opnieuw-1").onclick = reset;
$("b-opnieuw-2").onclick = reset;
$("b-opnieuw-3").onclick = reset;

toon("s-pin");
start();
</script>
</body>
</html>
"""
