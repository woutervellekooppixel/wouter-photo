#!/usr/bin/env node
/*
  Static dependency scan to help identify which repo files are required for the site.
  - Treats all Next.js app router files under /app as entrypoints.
  - Follows relative and @/* imports into /components, /lib, /data.
  - Also scans string URL usage for `/api/...` to estimate which API routes are referenced by client/server code.

  Output:
  - referencedCode: code files that are reachable from app entrypoints
  - unreferencedCandidates: code files under components/lib/data not reached (manual review)
  - apiRoutes: list of API route folders that exist
  - apiStringRefs: list of `/api/...` paths found in code
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CODE_DIRS = ['app', 'components', 'lib', 'data'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.next' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function isCodeFile(p) {
  return EXTENSIONS.has(path.extname(p));
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

const importRe = /\bimport\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g;
const dynImportRe = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const requireRe = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;

function resolvePathCandidate(baseDir, spec) {
  const p = path.resolve(baseDir, spec);

  // direct file
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;

  // try with extensions
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(p + ext)) return p + ext;
  }

  // directory index
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    for (const ext of EXTENSIONS) {
      const idx = path.join(p, 'index' + ext);
      if (fs.existsSync(idx)) return idx;
    }
  }

  return null;
}

function resolveImport(fromFile, spec) {
  if (!spec) return null;

  // alias
  if (spec.startsWith('@/')) {
    return resolvePathCandidate(ROOT, spec.slice(2));
  }

  // relative
  if (spec.startsWith('.')) {
    return resolvePathCandidate(path.dirname(fromFile), spec);
  }

  // package import: ignore
  return null;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll(path.sep, '/');
}

// Collect all relevant files
const allCodeFiles = CODE_DIRS.flatMap((d) => {
  const abs = path.join(ROOT, d);
  return fs.existsSync(abs) ? walk(abs).filter(isCodeFile) : [];
});

// Entrypoints: everything under app plus root middleware
const referenced = new Set();
const queue = [];

for (const f of allCodeFiles) {
  if (f.startsWith(path.join(ROOT, 'app') + path.sep)) {
    referenced.add(f);
    queue.push(f);
  }
}

const middlewarePath = path.join(ROOT, 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  referenced.add(middlewarePath);
  queue.push(middlewarePath);
}

while (queue.length) {
  const f = queue.pop();
  const src = readFileSafe(f);

  for (const re of [importRe, dynImportRe, requireRe]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const spec = m[1];
      const resolved = resolveImport(f, spec);
      if (resolved && !referenced.has(resolved)) {
        referenced.add(resolved);
        queue.push(resolved);
      }
    }
  }
}

// Unreferenced candidate code files in components/lib/data
const candidateRoots = ['components', 'lib', 'data'].map((d) => path.join(ROOT, d) + path.sep);
const unreferencedCandidates = allCodeFiles
  .filter((f) => candidateRoots.some((r) => f.startsWith(r)))
  .filter((f) => !referenced.has(f))
  .map(rel)
  .sort();

// Find string references to /api/... in code
const apiStringRe = /['"`]\s*(\/api\/[a-z0-9\-\/_\[\]]+)[^'"`]*['"`]/gi;
const apiStringRefs = new Set();

for (const f of referenced) {
  if (!isCodeFile(f)) continue;
  const src = readFileSafe(f);
  apiStringRe.lastIndex = 0;
  let m;
  while ((m = apiStringRe.exec(src))) {
    apiStringRefs.add(m[1]);
  }
}

// List existing API routes on disk (folder paths under app/api)
const apiRoot = path.join(ROOT, 'app', 'api');
let apiRoutes = [];
if (fs.existsSync(apiRoot)) {
  apiRoutes = walk(apiRoot)
    .filter((p) => p.endsWith(path.sep + 'route.ts') || p.endsWith(path.sep + 'route.js'))
    .map((p) => rel(path.dirname(p)))
    .sort();
}

const output = {
  referencedCode: Array.from(referenced).filter(isCodeFile).map(rel).sort(),
  unreferencedCandidates,
  apiRoutes,
  apiStringRefs: Array.from(apiStringRefs).sort(),
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
