#!/usr/bin/env node
// Transfer-upload CLI: maakt een klant-transfer op het download-portal
// zonder het admin-dashboard — zelfde API's als het dashboard gebruikt.
//
//   node scripts/transfer-upload.mjs ~/Transfers/klantnaam --title "Fotoshoot X" [--days 10] [--design] [--slug xyz]
//   node scripts/transfer-upload.mjs --delete <slug>
//
// Leest ADMIN_PASSWORD uit .env.local (repo-root). Link komt op
// https://download.wouter.photo/<slug>.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const BASE = process.env.TRANSFER_BASE_URL || "https://www.wouter.photo";
const LINK_BASE = "https://download.wouter.photo";
const SINGLE_PUT_MAX = 512 * 1024 * 1024;
const PART_SIZE = 64 * 1024 * 1024;
const APPEND_BATCH = 15;
const CONCURRENCY = 4;

// ---------- helpers ----------

function fail(msg) {
  console.error(`FOUT: ${msg}`);
  process.exit(1);
}

function loadAdminPassword() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (!fs.existsSync(envPath)) fail("Geen .env.local gevonden en ADMIN_PASSWORD niet gezet.");
  const line = fs.readFileSync(envPath, "utf8").split("\n").find((l) => l.startsWith("ADMIN_PASSWORD="));
  if (!line) fail("ADMIN_PASSWORD ontbreekt in .env.local");
  return line.slice("ADMIN_PASSWORD=".length).trim().replace(/^"|"$/g, "");
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const SYSTEM_FILES = [".DS_Store", "Thumbs.db", "desktop.ini", ".gitkeep"];
function isSystemFile(name) {
  const base = name.split("/").pop() || "";
  if (SYSTEM_FILES.some((sf) => name.endsWith(sf))) return true;
  if (base.startsWith(".")) return true;
  return false;
}

function collectFiles(root) {
  const out = [];
  const walk = (dir, rel) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(abs, relPath);
      else if (entry.isFile() && !isSystemFile(relPath)) {
        out.push({ abs, rel: relPath, size: fs.statSync(abs).size });
      }
    }
  };
  walk(root, "");
  return out;
}

const MIME = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  webp: "image/webp", heic: "image/heic", tif: "image/tiff", tiff: "image/tiff",
  mp4: "video/mp4", mov: "video/quicktime", pdf: "application/pdf",
  zip: "application/zip", txt: "text/plain",
};
function mimeFor(name) {
  return MIME[name.toLowerCase().split(".").pop()] || "application/octet-stream";
}

function isImageName(name) {
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "heif", "tif", "tiff"]
    .includes(name.toLowerCase().split(".").pop() || "");
}

async function takenAtFor(absPath, name) {
  if (!isImageName(name)) return undefined;
  try {
    const exifr = require("exifr");
    const data = await exifr.parse(absPath, {
      pick: ["DateTimeOriginal", "CreateDate", "MediaCreateDate", "TrackCreateDate", "ModifyDate"],
    });
    const d = data?.DateTimeOriginal ?? data?.CreateDate ?? data?.MediaCreateDate ?? data?.TrackCreateDate ?? data?.ModifyDate;
    if (d instanceof Date && Number.isFinite(d.getTime())) return d.toISOString();
  } catch {}
  return undefined;
}

// ---------- API client ----------

let cookie = "";

async function api(pathName, init = {}) {
  const res = await fetch(`${BASE}${pathName}`, {
    ...init,
    headers: { "Content-Type": "application/json", cookie, ...(init.headers || {}) },
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  return res;
}

async function login(password) {
  const res = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
  if (!res.ok) fail(`Inloggen mislukt (${res.status}) — klopt ADMIN_PASSWORD in .env.local?`);
}

async function uploadSingle(slug, file) {
  const res = await api("/api/admin/presigned-url", {
    method: "POST",
    body: JSON.stringify({ slug, fileName: file.rel, fileType: mimeFor(file.rel), fileSize: file.size }),
  });
  if (!res.ok) throw new Error(`presigned-url ${res.status}: ${await res.text()}`);
  const { presignedUrl, key } = await res.json();
  const body = fs.readFileSync(file.abs);
  const put = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeFor(file.rel) },
    body,
  });
  if (!put.ok) throw new Error(`PUT ${put.status} voor ${file.rel}`);
  return key;
}

async function multipartAction(payload) {
  const res = await api("/api/admin/multipart", { method: "POST", body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`multipart ${payload.action} ${res.status}: ${await res.text()}`);
  return res.json();
}

async function uploadMultipart(slug, file) {
  const { key, uploadId } = await multipartAction({
    action: "create", slug, fileName: file.rel, fileType: mimeFor(file.rel), fileSize: file.size,
  });
  const parts = [];
  try {
    const fd = fs.openSync(file.abs, "r");
    const totalParts = Math.ceil(file.size / PART_SIZE);
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const offset = (partNumber - 1) * PART_SIZE;
      const length = Math.min(PART_SIZE, file.size - offset);
      const buf = Buffer.alloc(length);
      fs.readSync(fd, buf, 0, length, offset);
      const { url } = await multipartAction({ action: "sign-part", key, uploadId, partNumber });
      const put = await fetch(url, { method: "PUT", body: buf });
      if (!put.ok) throw new Error(`part ${partNumber} PUT ${put.status}`);
      const etag = put.headers.get("etag");
      parts.push({ PartNumber: partNumber, ETag: etag });
      process.stdout.write(`\r   ${file.rel}: part ${partNumber}/${totalParts}`);
    }
    fs.closeSync(fd);
    await multipartAction({ action: "complete", key, uploadId, parts });
    process.stdout.write("\n");
    return key;
  } catch (err) {
    await multipartAction({ action: "abort", key, uploadId }).catch(() => {});
    throw err;
  }
}

// ---------- main ----------

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const name = args[i].slice(2);
    if (["design"].includes(name)) flags[name] = true;
    else flags[name] = args[++i];
  } else positional.push(args[i]);
}

const password = loadAdminPassword();

if (flags.delete) {
  await login(password);
  const res = await api(`/api/admin/uploads/${encodeURIComponent(flags.delete)}`, { method: "DELETE" });
  if (!res.ok) fail(`Verwijderen mislukt (${res.status}): ${await res.text()}`);
  console.log(`Transfer '${flags.delete}' verwijderd.`);
  process.exit(0);
}

const folder = positional[0] && path.resolve(positional[0].replace(/^~\//, `${process.env.HOME}/`));
if (!folder || !fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
  fail("Geef een bestaande map op: node scripts/transfer-upload.mjs <map> --title \"...\"");
}

const files = collectFiles(folder);
if (files.length === 0) fail("Map bevat geen (zichtbare) bestanden.");

const title = flags.title || path.basename(folder);
const token = crypto.randomBytes(6).toString("hex");
const slug = flags.slug || `${slugify(title)}-${token}`;
const days = Number(flags.days || 10);
const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
const totalBytes = files.reduce((a, f) => a + f.size, 0);

console.log(`Transfer:  ${title}`);
console.log(`Slug:      ${slug}`);
console.log(`Bestanden: ${files.length} (${(totalBytes / 1e6).toFixed(1)} MB), vervalt over ${days} dagen`);

await login(password);

// Metadata-first: lege transfer, daarna per batch bijschrijven (zelfde
// patroon als het dashboard — halverwege afbreken laat geen wezen achter).
{
  const res = await api("/api/admin/save-metadata", {
    method: "POST",
    body: JSON.stringify({ slug, title, files: [], expiresAt, useDefaultHero: !!flags.design }),
  });
  if (!res.ok) fail(`Transfer aanmaken mislukt (${res.status}): ${await res.text()}`);
}

const uploaded = [];
const failed = [];
let appended = 0;

async function flushAppends(force = false) {
  while (uploaded.length - appended >= APPEND_BATCH || (force && uploaded.length > appended)) {
    const batch = uploaded.slice(appended, appended + APPEND_BATCH);
    appended += batch.length;
    const res = await api(`/api/admin/uploads/${encodeURIComponent(slug)}/files`, {
      method: "POST",
      body: JSON.stringify({ files: batch }),
    });
    if (!res.ok) fail(`Metadata bijschrijven mislukt (${res.status}): ${await res.text()}`);
  }
}

let next = 0;
let done = 0;
async function worker() {
  while (next < files.length) {
    const file = files[next++];
    try {
      const key = file.size > SINGLE_PUT_MAX
        ? await uploadMultipart(slug, file)
        : await uploadSingle(slug, file);
      const takenAt = await takenAtFor(file.abs, file.rel);
      uploaded.push({ key, name: file.rel, size: file.size, type: mimeFor(file.rel), ...(takenAt ? { takenAt } : {}) });
      done++;
      process.stdout.write(`\r↑ ${done}/${files.length} geüpload`);
    } catch (err) {
      failed.push({ name: file.rel, error: String(err.message || err) });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));
process.stdout.write("\n");
await flushAppends(true);

if (failed.length > 0) {
  console.error(`LET OP: ${failed.length} bestand(en) mislukt:`);
  for (const f of failed.slice(0, 10)) console.error(`  - ${f.name}: ${f.error}`);
  process.exit(2);
}

// ZIPs alvast klaarzetten in R2 (achtergrond op de server).
await api(`/api/admin/uploads/${encodeURIComponent(slug)}/zips`, { method: "POST", body: "{}" }).catch(() => {});

console.log(`\nKlaar! Klantlink:\n${LINK_BASE}/${slug}`);
