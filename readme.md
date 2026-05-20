# app-name

> Application tag line describe here

## Preparation

- [A Firebase account](https://firebase.google.com/)

- A Firebase project

- [A Shopify partner account](https://www.shopify.com/partners)

- A Shopify app in partner account

## Installation

- Choose a project staging for Firebase application

```bash
firebase use --add
```

- Configure all settings for Firebase development environment by creating a new file `.env` inside the `packages/functions` (copy from `.env.example`)

```dotenv
# Shopify Configuration
SHOPIFY_API_KEY=<Shopify API Key>
SHOPIFY_SECRET=<Shopify Secret>
SHOPIFY_FIREBASE_API_KEY=<Firebase API Key>
SHOPIFY_SCOPES=read_themes
SHOPIFY_ACCESS_TOKEN_KEY=avada-apps-access-token

# App Configuration
APP_ENV=development
APP_BASE_URL=<Your app base URL>
```

> Local development note: `APP_BASE_URL` is no longer the single source of truth
> for embedded Shopify request handling. It is kept as a fallback value only.
> During local dev, the Functions handlers derive the current Cloudflare tunnel
> host from each incoming request.

- Create a file `.env.development` with content in [packages/assets](/packages/assets)

```dotenv
VITE_SHOPIFY_API_KEY=<Insert here>
VITE_FIREBASE_API_KEY=<Insert here>
VITE_FIREBASE_AUTH_DOMAIN=<Insert here>
VITE_FIREBASE_PROJECT_ID=<Insert here>
VITE_FIREBASE_STORAGE_BUCKET=<Insert here>
VITE_FIREBASE_APP_ID=<Insert here>
VITE_FIREBASE_MEASUREMENT_ID=<Insert here>
```

- Create an empty Firestore database
- Deploy the Firestore default indexes

```bash
firebase deploy --only firestore
```

## Development

- To start to develop, please run 2 below commands

```bash
npm run dev
```

```bash
GOOGLE_APPLICATION_CREDENTIALS=<Path to service-account.json> firebase serve
```

### Local tunnel URL handling

Shopify CLI creates a temporary Cloudflare tunnel URL when `yarn dev` runs. That
URL changes often, so the backend must not depend only on the value loaded from
`packages/functions/.env` at process startup.

**Before**

- `packages/assets/vite.config.js` wrote the current tunnel host into
  `packages/functions/.env` as `APP_BASE_URL`.
- `packages/functions/src/config/app.js` loaded `APP_BASE_URL` once when the
  Functions process started.
- Shopify auth and embedded API middleware used `hostName: appConfig.baseUrl`.
- If the tunnel changed while the emulator was still running, Functions could
  keep using the old URL until restart. This caused failures such as stale
  `trycloudflare.com` requests, OAuth redirect mismatch, or embed bootstrap
  loading against a dead host.

**Now**

- In production, `APP_BASE_URL` is the fixed app host used by Functions.
- In local development, `APP_BASE_URL` is still auto-written by `yarn dev`,
  but it is only a fallback.
- `api`, `auth`, and `authSa` resolve `hostName` per request via
  `getAppHostName(ctx, appConfig)`. This returns `APP_BASE_URL` in production
  and the current request host in local development.
- The helper reads the current app host from request headers such as
  `x-forwarded-host`, `host`, `origin`, and `referer`, while ignoring Shopify
  hosts like `admin.shopify.com` and `*.myshopify.com`.
- `embedApp` fetches `/embed-template.html` from the current request host so
  Vite can transform the HTML in development. If that fetch fails, it falls back
  to the local template and injects the Vite React refresh preamble.

Practical result: local development no longer needs manual `APP_BASE_URL` edits
every time Shopify CLI rotates the Cloudflare tunnel, while production remains
locked to the configured app domain. Restart the emulator only when code or
compiled Functions output changes, not just because the tunnel URL changed.

### Local ports

- Firebase Hosting emulator owns port `5000`; all local backend routes go through
  this port and are rewritten to Functions by `firebase.json`.
- The root `shopify.web.toml` backend entry hard-code `port=5000`.
  Shopify CLI checks configured web ports before starting commands, so if
  `yarn emulators` is already running, a hard-coded backend port of `5000`
  causes `Hard-coded port 5000 is not available`. So run `yarn dev` before `yarn emulator` for development.
- Vite still proxies backend paths (`/api`, `/auth`, `/embed`, etc.) to
  `BACKEND_PORT`, which defaults to `5000`

## Lint

- All your files must be passed [ESLint](https://eslint.org/):

To setup a git hook before committing to Gitlab, please run:

```bash
cp git-hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

## Where you can see all function logs

- You can see all logs from your functions by follow commands

```bash
firebase functions:log
```

- You also view in Web interface by access

![View all logs from Firebase web interface](https://i.imgur.com/SLYqnhS.png)

## Common issues

### When you open an embedded app in local, it can throw an error like that

![Content Security Policy Error](https://raw.githubusercontent.com/baorv/faster-shopify-dev/master/screenshot.png)

**Solution**

Install [Disable Content-Security-Policy (CSP)](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) to disable CSP in Chromium browers

### I got message `Unauthorized` after authentication

**Solution**

Go `https://console.firebase.google.com/u/0/project/{project-id}/settings/serviceaccounts/adminsdk`

Click `Generate new private key`

Use command to export global environment

```bash
export GOOGLE_APPLICATION_CREDENTIALS=<Path to service-account.json>
```

### I got message `PERMISSION_DENIED: Missing or insufficient permissions`

**Solution**

Enable permission `Service Account Token Creator` for `user@appspot.gserviceaccount.com`

![Enable Permission for appspot](https://firebasestorage.googleapis.com/v0/b/pdf-invoice-4717c.appspot.com/o/images%2Fdev-docs%2Fiam_enable_jwt_creator.png?alt=media&token=ea1a3c08-64e2-4519-a6fc-81620249dbbd)

### I can't see `FIREBASE_MEASUREMENT_ID` in Firebase project

**Solution**

You can enable Analytics for your project from Firebase project

![Enable Google Analytics on your app](https://firebasestorage.googleapis.com/v0/b/avada-development.appspot.com/o/images%2Fscreenshots%2Fenable_analytics.png?alt=media&token=559669e1-65d5-4e7b-b2dd-ce82517a262e)

## AI-Assisted Development (Claude Code)

This project supports agentic development workflows using Claude Code. See `CLAUDE.md` for detailed instructions.

### Quick Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `/plan [task]`         | Create implementation plan for a feature |
| `/fix [issue]`         | Analyze and fix issues                   |
| `/test`                | Run tests and validate code quality      |
| `/debug [issue]`       | Investigate and diagnose problems        |
| `/impact`              | Analyze impact before merge request      |
| `/perf [target]`       | Audit code for performance issues        |
| `/translate [feature]` | Update translations after adding labels  |

### Specialized Agents

| Agent                  | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `planner`              | Research and create implementation plans |
| `debugger`             | Investigate issues, analyze logs         |
| `tester`               | Run tests, validate quality              |
| `code-reviewer`        | Code review with Avada standards         |
| `security-auditor`     | Security vulnerability analysis          |
| `performance-reviewer` | Audit performance and costs              |
| `shopify-app-tester`   | MR impact and testing checklist          |

### Recommended Workflows

**New Feature:**

```
/plan [feature] → implement → /test → /review → /impact
```

**Bug Fix:**

```
/debug [issue] → /fix → /test
```

**Before Merge:**

```
/test → /review → /perf → /impact
```

### Skills Reference

Skills documentation is available in `.claude/skills/` for:

- `avada-architecture.md` - Project structure and coding standards
- `firestore.md` - Firestore queries, batching, indexes
- `bigquery.md` - Partitioning, clustering, cost control
- `shopify-api.md` - API selection, bulk operations, webhooks
- `backend.md` - Async patterns, functions config

## TODO

- [ ] Add testing
- [x] CI/CD
- [ ] Add document
