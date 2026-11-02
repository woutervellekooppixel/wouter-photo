
## Download-portal - projectcontext

<!-- overgenomen uit Claude Code-geheugen, 2026-08-29 -->


Het download-portal in `~/websites/wouter-photo` (Next.js 15 + Cloudflare R2) is op 26 juli 2026 hersteld uit git-historie (was verwijderd in commit 7c10b49, april 2026) en verbeterd: downloads (losse bestanden, map-zips, alles-zip) zijn nu 307-redirects naar presigned R2-URLs i.p.v. streams door Vercel-functies (dat was het oude kostenprobleem). ZIPs (totaal + per hoofdmap) worden na upload op de achtergrond in R2 klaargezet via POST `/api/admin/uploads/<slug>/zips`; `createZipFile` gebruikt nu `@aws-sdk/lib-storage`. Branding op transfer-pagina's: WOUTER.DOWNLOAD-wordmark; klantlinks op download.wouter.photo (subdomein moet in Vercel Domains staan). Klantdownloads gebruiken mode=json + anchor-navigatie, geen fetch (CORS op R2-redirects). Vervanger van fromsmash.com/WeTransfer om kosten te besparen.

Grote audit + fix-ronde afgerond (26 juli 2026, 4 commits: pakketten A-D): origineel-lekken gedicht (thumbnail-route heeft breedte-whitelist 640/1920/2560 en redirect nóóit naar origineel; /api/photos/by-key verwijderd; klantpagina krijgt geprojecteerde metadata zonder downloadHistory/IP's), auth op alle admin-routes, cron vereist CRON_SECRET, deleteFolder vereist trailing slash (cross-slug-wipe-bug), downloads met nette foutafhandeling (mode=json) + wachtrij, rate limit 60/min op x-real-ip, geen afgekapte ZIPs meer (>1.5GB → "wordt voorbereid" + achtergrond-generatie met R2-lockmarker), upload-engine in lib/uploadEngine.ts (4 parallel, retry, multipart >512MB via /api/admin/multipart — server doet ListParts dus geen CORS ExposeHeaders nodig; max 20GB/bestand), metadata-first uploads met incrementeel bijschrijven, vervaldatum instelbaar/verlengbaar, e-mailnotificaties max 1/uur/transfer. De 6s-intro met grote herofoto is bewust behouden (wens van Wouter, start pas na hero-load); hero is nu een 2560px-webp. Vervolgronde (27 juli 2026): "Fotofunctie uit"-vinkje (useDefaultHero: standaard-hero + afbeeldingen als gewone bestanden — voor designleveringen), live aftellende vervaldatum-teller in de statsbalk (per seconde), verlopen-pagina met "Request a new link"-knop (mailt Wouter; cron geeft 7 dagen respijt na verloop zodat +31 dagen verlengen alles herstelt), live ZIP-statusbadge in dashboard (lock-marker = "bezig"), downloadtellingen atomair in Vercel KV (lib/downloadStats.ts, fallback naar R2 zonder KV_REST_API_URL — check of KV in Vercel gekoppeld is!), kostenpaneel geschrapt. R2-lifecycle-regel voor multipart bestond al (7 dagen). Lokale BREVO_API_KEY is disabled ("API Key is not enabled") — mails alleen op productie testen. Nog open: intro-animatie-opties (Wouter vindt hem nu prima).

## Agendalijst (/lijst) - e-ink lijst

De e-ink lijst (wouter.photo/lijst, FastAPI in `api/_lijst/`) is sinds 2 nov 2026 puur een agenda. De fotofunctie is verwijderd; oude foto's staan nog in R2 onder `lijst/`.
- **Weergave (standaard sinds 2 nov):** weekoverzicht in `agenda.py` (`render_week`), naar een horizontale weekplanner (ontwerp 3, met de Inter-typografie van ontwerp 2).
  - Links zeven dagregels: cijfer, weekdag, dagweer, afspraken in 2 kolommen, afval, "+N meer".
  - Rechts een zijkolom: vandaag per 2 uur, minikalender, volgende week.
  - Zwart-wit; vandaag is een diapositieve regel.
  - Env `AGENDA_WEERGAVE=rollend` geeft de vorige weergave terug (`render_agenda`: 5 weken, huidige in het midden).
- **Ontwerpvoorstellen** (1 week-tijdlijn, 2 vandaag-dashboard, 3 papieren week) zijn op 2 nov als beelden gedeeld; gekozen is 3 met de letters van 2.
- **Agenda's:** geheime iCal-adressen, beheerd in de app (R2 `lijst/agenda/instellingen.json`; optioneel env `AGENDA_ICS` "naam|kleur|url;...").
- **Weer:** Open-Meteo: per uur van 07 tot 23 uur voor vandaag, dagweer voor de hele week (`past_days`), en zon op/onder in de statusregel. Standaard 's-Gravenzande; aan te passen met `WEER_LAT`/`WEER_LON`. Cache in R2 `agenda/weer.json`.
- **Afval:** containertjes in de dagvakjes.
  - Bron 1: HVC-inzamelkalender via de Opzet-API (`/rest/adressen/{pc}-{nr}` → bagId → `afvalstromen` + `kalender/{jaar}`), met een dagcache in `agenda/afval.json`. Het adres staat in de app en bewust niet in de code (repo is openbaar).
  - Bron 2: agenda-afspraken die alleen over afval gaan ("Restafval", "Gft").
- **Board:** haalt om 04:00 `current.bin` op; die wordt dan vers gerenderd. Bij een fout krijgt het board de vorige render.
- **Fonts:** Inter (OFL) in `api/_lijst/fonts/`. `vercel.json` heeft `includeFiles` voor `api/_lijst/**`.
- **Draaien:** env `EINK_DRAAI_180=1` draait het paneelbeeld.
- **Overige projectcontext** (hardware, firmware, 3D-lijst) staat in de repo `eink-fotolijst`.
