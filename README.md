# vulnerable-notes-app

> **Pipeline test target** — intentionally vulnerable Node.js app for the AppSec Analyzer engine.

A simple REST API for managing notes. Deliberately uses a vulnerable version of `lodash` to validate the full analyzer pipeline end-to-end.

---

## Intentional Vulnerability

| Package | Version | CVE | Severity | CVSS |
|---------|---------|-----|----------|------|
| lodash | 4.17.4 | CVE-2019-10744 | **CRITICAL** | 9.8 |

**CVE-2019-10744** — Prototype Pollution in `lodash` via `_.merge()`, `_.mergeWith()`, `_.defaultsDeep()`.  
An attacker can supply a crafted object with a `__proto__` key to pollute the Object prototype, potentially leading to denial of service or remote code execution.

The vulnerable call is in `src/index.js` on the `POST /notes` and `PATCH /notes/:id` endpoints which use `_.merge()` directly on user-supplied input.

**Safe version:** `4.17.21` (the analyzer should suggest this and validate it is CVE-free).

---

## Expected Pipeline Output

When the analyzer processes a commit to this repo it should produce:

1. **SBOM** — CycloneDX JSON listing `lodash@4.17.4` with purl `pkg:npm/lodash@4.17.4`
2. **CVE Findings** — `CVE-2019-10744` matched against lodash via CPE `cpe:2.3:a:lodash:lodash:4.17.4:*`
3. **Fix suggestion** — upgrade to `lodash@4.17.21` (re-validated as clean in NVD)
4. **PR** — branch `appsec/fix-<sha>` with `package.json` bumped to `lodash@4.17.21`

---

## Running Locally

```bash
npm install
npm start
# API available at http://localhost:3000
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /notes | List all notes |
| GET | /notes/:id | Get a note |
| POST | /notes | Create a note |
| PATCH | /notes/:id | Update a note |
| DELETE | /notes/:id | Delete a note |

### Example

```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "body": "World", "tags": ["demo"]}'
```

---

## Repo Structure

```
vulnerable-notes-app/
├── src/
│   ├── index.js          # Express app (uses vulnerable lodash)
│   └── index.test.js     # Jest tests
├── package.json          # lodash pinned to 4.17.4
├── .gitignore
└── README.md
```

---

> This repo exists solely as a test fixture for the AppSec Analyzer pipeline.  
> Do not use in production.