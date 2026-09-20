# OmniRoute — verified local setup

[OmniRoute](https://github.com/diegosouzapw/OmniRoute) is a self-hosted AI gateway: it
puts many providers (including free tiers) behind one OpenAI-compatible endpoint, so
coding tools can route through it with automatic fallback.

`setup-omniroute.sh` installs and configures it. Everything below was executed against
OmniRoute **v3.8.51** and verified — including the parts that failed.

```bash
./setup-omniroute.sh            # global npm install — recommended, no build step
./setup-omniroute.sh --source   # from a git clone, with secrets generated for you
```

Then open `http://localhost:20128`. The API base URL is `http://localhost:20128/v1`.

---

## Three pitfalls this script works around

### 1. A source build is killed silently on machines under ~16 GB RAM

The default bundler (Turbopack) allocates outside the V8 heap, so raising
`--max-old-space-size` — the obvious fix — does nothing. Two measured attempts:

| Bundler | Peak RSS before the kernel killed it |
| ------- | ------------------------------------ |
| Turbopack (default) | 11.6 GB |
| webpack, 6 GB heap cap | 13.7 GB |

There is **no error message**. The build just stops, which looks like a hang or a code
problem. To confirm it was the OOM killer:

```bash
dmesg | grep -i "killed process"
```

The project documents the escape hatch in `scripts/build/build-next-isolated.mjs`: set
`OMNIROUTE_USE_TURBOPACK=0` to build with webpack. The script sets this automatically
when it detects less than 16 GB. The surer answer is to skip building entirely — the
npm package ships prebuilt.

Also: never run a production build and the dev server at once. Together they exhaust
memory well before either finishes.

### 2. An API key is required even when `REQUIRE_API_KEY=false`

With the stock `.env.example` value of `false`, the endpoint still rejects unauthenticated
requests:

```
GET /v1/models                  ->  401  {"error":{"code":"invalid_api_key"}}
GET /v1/models + Bearer <key>   ->  200  288 models
```

This matters for the VS Code extension (`diegosouzapw.omnicopilot`), whose docs say a key
is only needed when `REQUIRE_API_KEY` is set. Leave the field blank and the model picker
comes up empty with nothing explaining why. Create a key under **Dashboard → Endpoints**
and paste it in from the start.

### 3. `.env.example` ships the required secrets empty

`JWT_SECRET`, `API_KEY_SECRET` and `OMNIROUTE_WS_BRIDGE_SECRET` are blank, and the app
will not start without them. The Quick Start section does not mention this. The script
generates all of them, plus a random admin password in place of the `CHANGEME` default.

---

## After the install

1. **Connect a provider** — Dashboard → Providers. `OpenCode Free` needs no signup at all;
   `Kiro AI` gives free Claude access (~50 credits/month per account).
2. **Create an API key** — Dashboard → Endpoints.
3. **Point your tools at it:**

   ```
   Base URL:  http://localhost:20128/v1
   API Key:   <from step 2>
   Model:     auto
   ```

4. **Check it:**

   ```bash
   curl http://localhost:20128/v1/models -H "Authorization: Bearer YOUR_KEY"
   ```

For editors, the `OmniCopilot` extension adds these models to the native Copilot Chat
picker — on the VS Code Marketplace, and on Open VSX for Cursor, Windsurf, VSCodium and
Kiro. It needs VS Code 1.104+, and no Copilot subscription.

## Requirements

Node **>=22.22.2 <23** or **>=24 <27** (the project's `.nvmrc` asks for 24), npm, and git
for the `--source` path. The script checks all of this and stops with a clear message
rather than failing halfway.

## What was verified

A full source install on Linux with Node 22.22.2: `npm install` (2538 packages), the
native-dependency check (33/33 resolved), secret generation, dev server startup, login
with both correct and wrong passwords, API key creation, and `GET /v1/models` returning
288 models. The production build is the one step that did not complete — see pitfall 1.
