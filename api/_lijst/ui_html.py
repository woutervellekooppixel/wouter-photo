UI = r"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#101010">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Agendalijst</title>
<style>
  :root {
    color-scheme: dark;
    --bg: #101010; --kaart: #1a1a19; --rand: #2a2a28;
    --tekst: #edeae3; --dim: #8f8c85;
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
  .kop { font-size: 13px; letter-spacing: .12em; text-transform: uppercase;
         color: var(--dim); font-weight: 600; padding: 0 2px; }

  button { font: inherit; border: 0; cursor: pointer; }
  .knop { background: var(--tekst); color: #141414; border-radius: 12px; padding: 15px;
          font-size: 16px; font-weight: 650; width: 100%; text-align: center; }
  .knop.stil { background: #262624; color: #cfccc5; }
  .knop:disabled { opacity: .35; }

  .status { color: var(--dim); font-size: 13.5px; text-align: center; min-height: 1.3em; }
  .uitleg { color: var(--dim); font-size: 12.5px; line-height: 1.45; }
  .waarschuwing { color: #e8b3ac; font-size: 13px; text-align: center; }

  .hero { position: relative; border-radius: 14px; overflow: hidden; background: #000;
          aspect-ratio: 4/3; }
  .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero .leeg { position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 6px; color: var(--dim); }
  .label { font-size: 11px; letter-spacing: .14em; color: var(--dim); text-transform: uppercase;
           padding: 0 4px 6px; }

  .bron { display: flex; align-items: center; gap: 11px; padding: 9px 2px;
          border-bottom: 1px solid var(--rand); }
  .bron:last-child { border-bottom: 0; }
  .bron .naam { flex: 1; min-width: 0; font-size: 15px; }
  .bron .naam small { display: block; color: var(--dim); font-size: 12px; overflow: hidden;
                      text-overflow: ellipsis; white-space: nowrap; }
  .bron .weg { background: #262624; color: #cfccc5; border-radius: 9px; padding: 6px 11px;
               font-size: 13px; }
  .veld { background: #000; color: var(--tekst); border: 1px solid var(--rand);
          border-radius: 11px; padding: 12px; font: inherit; font-size: 15px; width: 100%; }
  .rij { display: grid; grid-template-columns: 1fr 110px; gap: 8px; }
  details summary { cursor: pointer; font-weight: 600; font-size: 15px; list-style: none;
                    padding: 4px 2px; }
  details summary::-webkit-details-marker { display: none; }

  input[type=password] { background: #000; color: var(--tekst); border: 1px solid var(--rand);
        border-radius: 12px; padding: 15px; font-size: 20px; width: 100%; text-align: center;
        letter-spacing: .4em; }
  .verborgen { display: none !important; }
  .spinner { margin: 14px auto; width: 30px; height: 30px; border: 3px solid #2c2c2a;
             border-top-color: var(--tekst); border-radius: 50%; animation: d 1s linear infinite; }
  @keyframes d { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<main>
  <header>
    <h1>AGENDALIJST</h1>
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
      <div class="label">Zo komt hij vannacht op de lijst</div>
      <div class="hero">
        <div class="leeg" id="ag-leeg"><div class="spinner"></div><span>Agenda ophalen…</span></div>
        <img id="ag-img" class="verborgen" alt="">
      </div>
      <div class="status" id="ag-info" style="margin-top:8px"></div>
    </div>
    <div class="waarschuwing verborgen" id="ag-waarschuwing"></div>

    <section class="kaart">
      <div class="kop">Agenda's</div>
      <div id="bronnen"></div>
      <details id="ag-toevoegen">
        <summary>＋ Agenda toevoegen</summary>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px">
          <input class="veld" id="ag-naam" placeholder="Naam, bijv. BernyWouty" maxlength="40">
          <input class="veld" id="ag-url" placeholder="Geheim adres in iCal-indeling"
                 inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false">
          <button class="knop" id="b-ag-toevoegen">Toevoegen</button>
          <div class="status" id="ag-status"></div>
          <div class="uitleg">Google Agenda op de computer → ⚙︎ Instellingen → klik links op de
            agenda → <i>Agenda integreren</i> → kopieer <i>Geheim adres in iCal-indeling</i>
            (eindigt op <code>basic.ics</code>). Deel dat adres met niemand.</div>
        </div>
      </details>
    </section>

    <section class="kaart">
      <div class="kop">Afvalkalender (HVC)</div>
      <div class="rij">
        <input class="veld" id="af-postcode" placeholder="Postcode" maxlength="7"
               autocapitalize="characters" autocomplete="postal-code">
        <input class="veld" id="af-nummer" placeholder="Nr." maxlength="8" inputmode="numeric">
      </div>
      <button class="knop stil" id="b-afval">Opslaan</button>
      <div class="status" id="af-status"></div>
    </section>

    <button class="knop stil" id="b-ag-ververs">Voorbeeld vernieuwen</button>
    <div class="status">Om 3 uur 's nachts maakt de lijst het paneel schoon en rust hij op wit;
      om 5 uur haalt hij de nieuwe agenda op.<br>
      Druk op de RST-knop van de lijst om meteen te verversen.</div>
  </section>
</main>

<script>
const $ = id => document.getElementById(id);
const API = location.pathname.startsWith("/lijst") ? "/lijst" : "";
const secties = ["s-pin", "s-home"];
function toon(id) { secties.forEach(s => $(s).classList.toggle("verborgen", s !== id)); }

// PWA: manifest + icoon via JS zodat het pad overal klopt
for (const [rel, href] of [["manifest", API + "/manifest.json"],
                           ["apple-touch-icon", API + "/icon.png"]]) {
  const l = document.createElement("link"); l.rel = rel; l.href = href;
  document.head.appendChild(l);
}

async function api(pad, opties) {
  const r = await fetch(API + pad, opties);
  if (r.status === 401) { toon("s-pin"); throw new Error("login"); }
  if (!r.ok) throw new Error(await r.text());
  return r;
}
function foutTekst(e) {
  try { return JSON.parse(e.message).detail || e.message; } catch (_) { return e.message; }
}

// ---------- home ----------
async function laadHome() {
  try {
    const ag = await (await api("/api/agenda")).json();
    toon("s-home");
    toonAgenda(ag);
    laadStatus();
  } catch (e) { /* pin-scherm staat al */ }
}

function toonAgenda(ag) {
  $("bronnen").innerHTML = "";
  if (!ag.bronnen.length) {
    $("bronnen").innerHTML = '<div class="uitleg" style="padding:2px">Nog geen agenda gekoppeld.</div>';
    $("ag-toevoegen").open = true;
  }
  ag.bronnen.forEach(b => {
    const r = document.createElement("div");
    r.className = "bron";
    r.innerHTML = `<div class="naam"><span></span><small></small></div><button class="weg">Weg</button>`;
    r.querySelector(".naam span").textContent = b.naam;
    r.querySelector(".naam small").textContent = b.url;
    r.querySelector(".weg").onclick = () => {
      if (confirm(`"${b.naam}" loskoppelen van de lijst?`))
        agActie({ actie: "verwijder", id: b.id })
          .catch(e => { if (e.message !== "login") alert(foutTekst(e)); });
    };
    $("bronnen").appendChild(r);
  });

  // afvaladres
  if (document.activeElement !== $("af-postcode") && document.activeElement !== $("af-nummer")) {
    $("af-postcode").value = (ag.afval && ag.afval.postcode) || "";
    $("af-nummer").value = (ag.afval && ag.afval.huisnummer) || "";
  }
  $("af-status").textContent = ag.afval && ag.afval.postcode
    ? (ag.afval_data != null ? `${ag.afval_data} ophaaldagen gevonden` : "gekoppeld")
    : "Vul je adres in voor de containertjes in de agenda";

  zetWaarschuwing(ag.laatst);
  laadAgendaBeeld(ag.laatst);
}

function zetWaarschuwing(laatst) {
  const w = (laatst && laatst.waarschuwingen) || [];
  $("ag-waarschuwing").textContent = w.length ? "Niet bijgewerkt: " + w.join(" · ") : "";
  $("ag-waarschuwing").classList.toggle("verborgen", !w.length);
}

async function laadStatus() {
  try {
    const s = await (await api("/api/status")).json();
    if (s.pct != null) {
      const ik = s.pct > 60 ? "\u{1F50B}" : s.pct > 25 ? "\u{1FAAB}" : "⚠️";
      $("apparaat").textContent = `${ik} ${s.pct}%`;
    } else if (s.tijd) {
      const d = new Date(s.tijd * 1000);
      $("apparaat").textContent = `gezien ${d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`;
    }
  } catch (e) {}
}

function zetInfo(laatst) {
  const t = new Date(laatst.tijd * 1000).toLocaleString("nl-NL",
    { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  $("ag-info").textContent = `bijgewerkt ${t} · ${laatst.aantal} afspraken`;
}

function laadAgendaBeeld(laatst) {
  const src = `${API}/api/agenda/preview.png?t=${laatst ? laatst.tijd : Date.now()}`;
  if ($("ag-img").dataset.src === src) return;
  $("ag-img").dataset.src = src;
  $("ag-leeg").classList.remove("verborgen");
  $("ag-img").onload = () => {
    $("ag-img").classList.remove("verborgen");
    $("ag-leeg").classList.add("verborgen");
    if (!laatst) api("/api/agenda").then(r => r.json())
      .then(a => { if (a.laatst) { zetInfo(a.laatst); zetWaarschuwing(a.laatst); } })
      .catch(() => {});
  };
  $("ag-img").src = src;
  if (laatst) zetInfo(laatst);
}

async function vernieuw() {
  $("ag-img").dataset.src = "";
  $("ag-img").classList.add("verborgen");
  $("ag-info").textContent = "";
  $("ag-leeg").classList.remove("verborgen");
  try { await api("/api/agenda/ververs", { method: "POST" }); }
  catch (e) { if (e.message !== "login") alert("Vernieuwen mislukt: " + foutTekst(e)); }
  laadHome();
}

async function agActie(velden) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(velden)) fd.append(k, v);
  await api("/api/agenda", { method: "POST", body: fd });
  await vernieuw();
}

$("b-ag-ververs").onclick = vernieuw;

$("b-ag-toevoegen").onclick = async () => {
  const url = $("ag-url").value.trim();
  if (!url) { $("ag-status").textContent = "Plak eerst het iCal-adres"; return; }
  $("b-ag-toevoegen").disabled = true;
  $("ag-status").textContent = "Agenda controleren…";
  try {
    await agActie({ actie: "toevoegen", naam: $("ag-naam").value, url });
    $("ag-naam").value = ""; $("ag-url").value = ""; $("ag-status").textContent = "";
    $("ag-toevoegen").open = false;
  } catch (e) {
    if (e.message !== "login") $("ag-status").textContent = foutTekst(e);
  }
  $("b-ag-toevoegen").disabled = false;
};

$("b-afval").onclick = async () => {
  $("b-afval").disabled = true;
  $("af-status").textContent = "Adres opzoeken bij HVC…";
  try {
    await agActie({ actie: "afval", postcode: $("af-postcode").value,
                    huisnummer: $("af-nummer").value });
  } catch (e) {
    if (e.message !== "login") $("af-status").textContent = foutTekst(e);
  }
  $("b-afval").disabled = false;
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

toon("s-pin");
laadHome();
</script>
</body>
</html>
"""
