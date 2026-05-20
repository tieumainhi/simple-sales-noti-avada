# Tech Stack & Architecture Guide

This document provides an overview of the tech stack, project structure, and key conventions for this codebase. Use this as a reference for development, onboarding, and for tools like Cursor to understand the codebase context.

---

## 1. Tech Stack Overview

### Backend

- **Node.js** (ES6+ syntax, `import/export`)
- **Firebase Functions** (serverless compute)
- **Firestore** (NoSQL database)
- **Firebase Authentication** (user management)
- **Firebase Storage** (file storage)
- **Google Cloud Platform** (BigQuery, PubSub, Cloud Tasks)
- **Shopify API** (Admin API, App Bridge)
- **Chroma** (vector database)

### Frontend

- **React** (function components, hooks, context)
- **Shopify Polaris v12+** (UI components)
- **Vite** (build tool)
- **Code-splitting** via loadable components
- **Custom API hooks** (`useFetchApi`, `useCreateApi`, `useDeleteApi`)

### Customer-Facing

- **ScriptTag** (Shopify theme extension, customer-facing JS)

---

## 2. Project Structure

```
packages/
  functions/      # Backend (Firebase Functions, API, business logic)
    src/
      repositories/   # One file per Firestore collection (CRUD only)
      services/       # Business logic, 3rd party API, multi-repo
      controllers/    # Request handlers (thin, call services)
      helpers/        # Utility functions (auth, etc.)
      config/         # Environment configs (shopify, app, etc.)
      const/          # Shared constants/defaults
      middleware/     # Request pipeline (error handling, etc.)
      routes/         # Centralized API endpoint definitions (api.js)
      ...
  assets/         # Frontend (React, Polaris, Vite)
    src/
      components/     # Reusable React components
      pages/          # Page components (with skeletons)
      loadables/      # Code-split/lazy-loaded components
      hooks/          # Custom hooks (api, form, utils, etc.)
      services/       # API services (call admin endpoints)
      utils/          # Utility functions
      config/         # Frontend configs
      contexts/       # React contexts
      routes/         # Frontend route definitions
      ...
  scripttag/      # Customer-facing JS (Shopify theme extension)
    src/
      ...
  extensions/
    theme-extension/ # Shopify theme app extensions
```

---

## 3. Key Conventions & Best Practices

### Naming

- **camelCase** for variables, functions, properties
- **PascalCase** for classes, components
- **UPPERCASE** for constants
- Use descriptive, semantic names (no abbreviations)

### Backend Patterns

- **Repositories:** One per Firestore collection, CRUD only, no cross-collection logic
- **Services:** Business logic, can use multiple repositories, 3rd party API integration
- **Controllers:** Thin, handle request/response, call services, use helpers for auth
- **Helpers:** Utility functions (e.g., `getCurrentShop`, `getCurrentShopData`)
- **Config/Const:** All env/config/constants centralized for reuse
- **API Routing:** All admin endpoints in `functions/src/routes/api.js`
- **Error Handling:** Consistent response format, use try/catch, log errors
- **Firestore:** Use `.update()` for updates, `.set({merge:true})` for creates, optimize queries (limit, indexes)

### Frontend Patterns

- **Pages:** Each page has a matching skeleton loading component
- **Loadables:** All pages/components are code-split via `loadables/ComponentName/`
- **Hooks:** API hooks in `hooks/api/` (`useFetchApi`, `useCreateApi`, `useDeleteApi`)
- **Services:** API calls via centralized service files
- **State:** Use context to avoid prop drilling, localize state when possible
- **Polaris:** Use v12+ components, follow accessibility and design guidelines
- **Icons:** Import from `@shopify/polaris-icons`, use semantic names

### API Hooks

- `useFetchApi`: Fetch data with pagination, loading, error, transformation
- `useCreateApi`: Create resources, with toast notifications
- `useDeleteApi`: Delete resources, with toast notifications
- All hooks support callbacks, error handling, and manual data updates

### Skeleton Loading

- Use Polaris skeleton components (`SkeletonPage`, `SkeletonBodyText`, etc.)
- Match skeleton layout to actual content
- Show skeleton while loading, progressive loading for large pages

### Shopify Integration

- Use App Bridge for embedded app
- Handle auth events in `functions/src/handlers/auth.js`
- Register webhooks on install, clean up on uninstall
- Use helpers for shop/user/session context

### Local Shopify Tunnel Handling

- Shopify CLI creates a temporary Cloudflare tunnel URL during `yarn dev`; the URL can change between runs.
- Production uses `APP_BASE_URL` as the fixed app host.
- Local development treats `APP_BASE_URL` as a fallback; the current app host is derived from request headers.
- Shopify embedded middleware must resolve the app host using `getAppHostName(ctx, appConfig)`.
- Do not pass `hostName: appConfig.baseUrl` directly to `verifyEmbedRequest` or `shopifyAuth` for embedded flows; doing so can keep stale tunnel URLs in a running local Functions process.
- `getRequestHostName` prefers the active app/tunnel host from request headers and skips Shopify frame hosts such as `admin.shopify.com` and `*.myshopify.com`.
- `embedApp` should fetch the dev `embed-template.html` through the current app host so Vite can transform HTML and inject the React refresh preamble.
- Firebase Hosting emulator owns backend port `5000`; so add `port=5000` to root `shopify.web.toml`, Shopify CLI will fail if emulators started first. always run `yarn dev` before `yarn emulator` for development.

### Security & Cost

- Use env variables for secrets
- Never commit sensitive data
- Optimize Firestore/BigQuery queries for cost
- Use proper access controls and authentication

---

## 4. References

- [Project Requirements](./requirements.md)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Shopify Admin API](https://shopify.dev/docs/api/admin)
- [Vite](https://vitejs.dev/)

---

## 5. Onboarding Checklist

- Review this guide and folder structure
- Follow naming and architectural conventions
- Use provided hooks/services for API and data
- Reference `functions/src/routes/api.js` for backend endpoints
- Use skeleton loading for all data-fetching pages
- Use centralized config/const for shared values
- Follow Shopify and Firebase best practices

---

This guide is intended to keep the codebase clean, maintainable, and scalable. For any questions, refer to this document or ask the team.
