# R2 Storage Setup

De download portal functionaliteit vereist Cloudflare R2 opslag. Volg deze stappen om R2 te configureren:

## 1. Cloudflare R2 Bucket Aanmaken

1. Log in op je Cloudflare dashboard
2. Ga naar **R2 Object Storage** in het sidebar menu
3. Klik op **Create bucket**
4. Geef je bucket een naam (bijv. `wouter-photo-uploads`)
5. Kies een locatie (bijv. `Europe (WEUR)`)
6. Klik op **Create bucket**

## 2. API Token Aanmaken

1. Ga in je Cloudflare dashboard naar **R2** → **Manage R2 API Tokens**
2. Klik op **Create API token**
3. Geef de token een naam (bijv. `wouter-photo`)
4. Selecteer **Object Read & Write** permissions
5. Selecteer je bucket bij **Apply to specific buckets only**
6. Klik op **Create API Token**
7. **Belangrijk**: Kopieer de `Access Key ID` en `Secret Access Key` - deze kun je maar één keer zien!

## 3. Environment Variabelen Configureren

1. Kopieer `.env.example` naar `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Vul de R2 credentials in `.env.local` in:
   ```bash
   # Cloudflare R2 Storage
   R2_ACCOUNT_ID="je-cloudflare-account-id"  # Vind je in je Cloudflare dashboard URL
   R2_ACCESS_KEY_ID="je-access-key-id"       # Van stap 2
   R2_SECRET_ACCESS_KEY="je-secret-key"      # Van stap 2
   R2_BUCKET_NAME="wouter-photo-uploads"     # Naam van je bucket uit stap 1

   # Download links verlopen automatisch
   DEFAULT_DOWNLOAD_EXPIRY_DAYS="31"

   # (Optioneel) cleanup endpoint beveiligen voor externe cron services
   # Als je Vercel Cron gebruikt, kan het ook zonder secret via x-vercel-cron.
   CRON_SECRET="kies-een-random-secret"
   
   # Admin credentials
   ADMIN_PASSWORD="kies-een-sterk-wachtwoord"
   SESSION_SECRET="genereer-een-lange-random-string"  # Bijv: openssl rand -base64 32
   ```

3. Vind je Account ID:
   - Ga naar je Cloudflare dashboard
   - Klik op **R2**
   - Je Account ID staat in de URL: `dash.cloudflare.com/{ACCOUNT_ID}/r2`
   - Of onder **Account Settings** → **Account ID**

## 4. Development Server Herstarten

Na het configureren van `.env.local`, herstart je de development server:

```bash
npm run dev
```

Je zou nu geen error meldingen meer moeten zien over ontbrekende R2 configuratie.

## 5. Admin Dashboard Gebruiken

1. Ga naar `http://localhost:3000/admin`
2. Log in met het wachtwoord uit `ADMIN_PASSWORD`
3. Upload bestanden naar de dashboard
4. Deel de download link met je klanten: `https://wouter.photo/{slug}`

## Veelvoorkomende Problemen

### "R2 opslag niet geconfigureerd" foutmelding

- Controleer of alle environment variabelen correct zijn ingevuld in `.env.local`
- Controleer of je `.env.local` in de root van het project staat
- Herstart de development server (`npm run dev`)

### Upload mislukt

- Controleer of je API token de juiste permissions heeft (Object Read & Write)
- Controleer of de bucket naam correct is
- Kijk in de browser console voor gedetailleerde error berichten

### CORS errors

R2 moet mogelijk CORS instellingen hebben. Ga naar je bucket settings in Cloudflare:

1. Ga naar je R2 bucket
2. Klik op **Settings** → **CORS policy**
3. Voeg toe:
   ```json
   [
     {
       "AllowedOrigins": ["https://wouter.photo", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

## Productie Deployment

Vergeet niet dezelfde environment variabelen toe te voegen aan je productie omgeving (Vercel, Netlify, etc.).

Voor Vercel:
```bash
vercel env add R2_ACCOUNT_ID
vercel env add R2_ACCESS_KEY_ID
vercel env add R2_SECRET_ACCESS_KEY
vercel env add R2_BUCKET_NAME
vercel env add ADMIN_PASSWORD
vercel env add SESSION_SECRET
```
