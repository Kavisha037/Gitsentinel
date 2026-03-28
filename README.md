# Gitsentinel - [Click Here](https://gitsentinelai.vercel.app/)

<div align="center">

```
 ██████╗ ██╗████████╗███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
██╔════╝ ██║╚══██╔══╝██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
██║  ███╗██║   ██║   ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
██║   ██║██║   ██║   ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
     ╚██████╔ ██║   ██║   ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
     ╚═════╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
```

### *Watching the watchers — behavioral security for open source*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-00d4aa.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)
[![Python](https://img.shields.io/badge/Python-3.11+-00d4aa?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-00d4aa?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![DuckDB](https://img.shields.io/badge/DuckDB-0.10-00d4aa?style=flat-square)](https://duckdb.org)
[![FOSS](https://img.shields.io/badge/FOSS-100%25-00d4aa?style=flat-square)](https://opensource.org)
[![Status](https://img.shields.io/badge/Status-Active%20Development-ff6b2b?style=flat-square)]()

<br/>

> **"In 2024, someone spent 2 years pretending to be a helpful developer. They earned trust, got access to critical Linux software used by millions of servers, and inserted a hidden backdoor. It was caught by pure luck — an engineer noticed SSH was 500ms slower than usual."**
>
> *— The xz utils supply chain attack. GitSentinel exists so the next one isn't caught by luck.*

</div>

---

## The Problem Nobody Is Solving

Every major security tool — Snyk, Dependabot, Socket.dev — asks the same question:

> *"Is this code known to be bad?"*

They check code against databases of known vulnerabilities. They look backwards.

**The xz utils attack had no CVE. There was no known bad code — until it was too late.**

The attacker's strategy was behavioral: spend years building trust, then strike. And every behavioral signal was publicly visible the entire time:

- ✗ A brand new account got push access to a critical repo
- ✗ CI/CD pipeline files were modified by someone with 2 prior commits
- ✗ A binary `.o` file was committed with no corresponding source code
- ✗ Fake accounts coordinated social pressure on the maintainer

**No tool was watching behavior. GitSentinel watches behavior.**

---

## What GitSentinel Does

GitSentinel is a **self-hosted, open source behavioral security monitor** for GitHub, GitLab, and Gitea repositories. It answers a completely different question:

> *"Is this person acting suspiciously?"*
>
> WEBSITE LINK - https://gitsentinelai.vercel.app/

```
Someone pushes code  ──→  GitSentinel analyzes WHO did it,
                          WHAT they changed, and HOW it compares
                          to their historical behavior
                                    │
                          ┌─────────▼──────────┐
                          │   5 Detection      │
                          │   Modules run      │
                          │   in parallel      │
                          └─────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
               SAFE ✓          MEDIUM ⚠        CRITICAL 🚨
            No anomalies     Worth watching   Alert fired
```

---

## How It Works — Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TWO DATA SOURCES                            │
│                                                                     │
│  1. WEBHOOK MODE (Production)                                       │
│     Repo owner adds GitSentinel URL in GitHub Settings → Webhooks   │
│     GitHub pushes every event as JSON to our /webhook/github        │
│     Real-time. Zero polling. Instant alerts.                        │
│                                                                     │
│  2. PUBLIC API MODE (Demo / On-demand scan)                         │
│     GitHub's REST API is public for all public repos                │
│     api.github.com/repos/{owner}/{repo}/commits                     │
│     No auth needed. 60 req/hour free. 5000/hour with token.         │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   EventNormalizer    │  Converts any platform's
              │   ingestion/         │  JSON → NormalizedEvent
              │   normalizer.py      │  (platform-agnostic)
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   BaselineEngine     │  "What is normal for
              │   detection/         │   this contributor?"
              │   baseline.py        │  90-day rolling window
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────────────────────────┐
              │        DetectorRegistry                  │
              │  asyncio.gather() — all run in parallel  │
              │                                          │
              │  BinaryBlobDetector    weight=40         │
              │  NewMaintainerDetector weight=35         │
              │  CIFileDetector        weight=25         │
              │  TyposquatDetector     weight=20         │
              │  StatAnomalyDetector   weight=10         │
              └──────────┬───────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │    AlertEngine       │  Computes risk score
              │    alerts/engine.py  │  Deduplicates alerts
              │                      │  Dispatches notification
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Dashboard + API     │  Real-time feed
              │  api/main.py         │  Scan history
              │                      │  Acknowledge alerts
              └──────────────────────┘
```

---

## The 5 Detectors

| Detector | What It Catches | Severity | Weight |
|----------|----------------|----------|--------|
| **BinaryBlobDetector** | `.exe` `.o` `.so` `.dll` committed without source code | CRITICAL | 40 |
| **NewMaintainerDetector** | Account with <10 commits receiving push access | CRITICAL | 35 |
| **CIFileDetector** | `.github/workflows/` modified by low-history contributor | HIGH | 25 |
| **TyposquatDetector** | Package names within Levenshtein distance ≤2 of top packages | CRITICAL | 20 |
| **StatAnomalyDetector** | Commit frequency >3 standard deviations above baseline | HIGH | 10 |

### Why NOT machine learning?

Two reasons — both matter for a security tool:

**1. Explainability.** When GitSentinel fires an alert, it says:
> *"jia-tan-helper committed 8.3x more than their 90-day average (Z-score: 4.1)"*

Not: *"Anomaly detected — 94% confidence."* A maintainer needs to know **why**.

**2. Auditability.** Every detection rule is readable Python. Any developer can read, audit, and contribute new rules. Black-box ML in a security tool is itself a trust problem.

---

## The xz utils Attack — Replayed Live

GitSentinel ships with a demo simulator that replays the real attack sequence:

```
$ python scripts/demo_simulator.py

══════════════════════════════════════════════════════════
  GitSentinel — xz utils Attack Simulation
══════════════════════════════════════════════════════════

  Step 1 — Normal push by trusted contributor
  → No alert. This is normal activity.

  Step 2 — New account "jia-tan-helper" makes first commit
  → LOW alert. New contributor flagged for awareness.

  Step 3 — "jia-tan-helper" granted maintainer access ◀ CAUGHT HERE
  → CRITICAL: NewMaintainerDetector fired.
    "Account with 1 prior commit received push access"

  Step 4 — CI pipeline modified by new maintainer
  → HIGH: CIFileDetector fired.
    ".github/workflows/release.yml modified by account with 1 commit"

  Step 5 — Binary .o file committed without source
  → CRITICAL: BinaryBlobDetector fired.
    "Binary file 'tests/build_helper.o' — no source found"

══════════════════════════════════════════════════════════
  GitSentinel caught this attack at Step 3.
  The real xz attack was caught at Step 5. By accident.
══════════════════════════════════════════════════════════
```

---

## Tech Stack

```
Backend                     Frontend
─────────────────────       ──────────────────────────
Python 3.11+                HTML5 + Vanilla JS
FastAPI (async)             Three.js (3D visualization)
DuckDB (analytics)          Glassmorphism UI
httpx (async HTTP)          JetBrains Mono + Bebas Neue
Pydantic v2 (models)        Real-time auto-refresh
uvicorn (ASGI server)       Custom 3D cursor + tilt cards

License: AGPL-3.0           Zero proprietary dependencies
Self-hosted                 No data leaves your machine
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/gitsentinel
cd gitsentinel

# Install
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Run
uvicorn api.main:app --reload

# Open dashboard
open dashboard/index.html

# Run the xz attack demo (in a second terminal)
python scripts/demo_simulator.py
```

**Verify it's running:**
```bash
curl http://localhost:8000/health
# {"status":"ok","version":"2.0.0"}
```

**Scan any public repo:**
```bash
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/psf/requests"}'
```

---

## Project Structure

```
gitsentinel/
├── storage/
│   ├── models.py          # Pydantic v2 dataclasses (NormalizedEvent, Alert, etc.)
│   └── database.py        # DuckDB analytical storage layer
│
├── ingestion/
│   ├── normalizer.py      # GitHub/GitLab/Gitea → NormalizedEvent adapter
│   └── scanner.py         # Public GitHub API repo scanner
│
├── detection/
│   ├── base.py            # BaseDetector ABC + DetectorRegistry
│   ├── rules.py           # 5 rule-based detectors
│   └── stats.py           # Z-score statistical anomaly detector
│
├── alerts/
│   └── engine.py          # Risk scoring, deduplication, dispatch
│
├── api/
│   └── main.py            # FastAPI app, webhook endpoints, REST API
│
├── dashboard/
│   └── index.html         # Full UI (Three.js, glassmorphism, live data)
│
├── scripts/
│   └── demo_simulator.py  # xz utils attack replay
│
├── tests/
│   └── test_detection.py  # pytest test suite
│
└── requirements.txt
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/stats` | Dashboard stat counts |
| `POST` | `/api/scan` | Scan any public GitHub repo |
| `GET` | `/api/alerts` | All alerts (optional `?repo_id=`) |
| `POST` | `/api/alerts/{id}/acknowledge` | Mark alert as reviewed |
| `GET` | `/api/history` | Scan history |
| `POST` | `/webhook/github` | Receive GitHub webhook events |
| `POST` | `/webhook/gitlab` | Receive GitLab webhook events |
| `POST` | `/api/demo/reset` | Clear all data for clean demo |

---

## What Makes This Different

| Tool | Approach | Catches xz-style attack? |
|------|----------|--------------------------|
| Snyk | Known CVE database lookup | ✗ No CVE existed |
| Dependabot | Dependency version alerts | ✗ Not a dependency issue |
| Socket.dev | Static code analysis | ✗ Code looked normal |
| OpenSSF Scorecard | Static repo scoring | ✗ One-time snapshot |
| **GitSentinel** | **Behavioral pattern monitoring** | **✓ Caught at Step 3** |

---

## Hackathon Context

Built for the **FOSS Hackathon** — 100% open source, zero proprietary dependencies, AGPL-3.0 licensed.

**Rules compliance:**
- ✅ No proprietary APIs — GitHub REST API is public
- ✅ FOSS license (AGPL-3.0)
- ✅ Not a blockchain/web3 project
- ✅ Not a simple CRUD app — behavioral analysis engine
- ✅ Not another Keras model — rule-based + statistical detection
- ✅ Meaningful problem — supply chain attacks cost $46B/year

**Attribution:** Portions of boilerplate code generated with Claude (Anthropic). All detection logic, architecture decisions, scoring algorithms, and system design are original work. Every line is understood and explainable.

---

## Roadmap

- [ ] GitLab webhook support (normalizer complete, endpoint pending)
- [ ] Gitea self-hosted instance support
- [ ] Slack / Discord notification integrations
- [ ] GitHub App packaging (one-click install for repo owners)
- [ ] Contributor trust graph visualization
- [ ] Machine-readable SARIF output for CI integration
- [ ] Multi-repo organization dashboard

---

## Contributing

GitSentinel is built for the community, by the community.

**Add a new detector in 3 steps:**

```python
# 1. Create your detector in detection/rules.py
class MyDetector(BaseDetector):
    @property
    def name(self): return "MyDetector"

    @property
    def weight(self): return 20

    def detect(self, event, baseline):
        # your logic here
        return DetectionResult(severity=Severity.HIGH, ...)

# 2. Register it in detection/base.py → get_default_registry()

# 3. Write a test in tests/test_detection.py
```

Open a PR. That's it.

---

## License

```
GitSentinel — Open Source Supply Chain Security Monitor
Copyright (C) 2026

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, version 3.

This means: use it, modify it, deploy it — but keep it open.
```

---

<div align="center">

**Built with conviction. Designed to protect the infrastructure the world runs on.**

*Open source isn't just a license. It's a trust model.*
*GitSentinel protects that trust.*

<br/>

⭐ **Star this repo if you believe open source security matters** ⭐

</div>
