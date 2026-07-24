# API Integration

This directory contains all frontend-to-backend API integration code.

## Structure

```
api/
├── types/              # Generated TypeScript types (from OpenAPI specs)
│   ├── identity.ts     # Identity service types (run: npm run generate:api)
│   ├── catalog.ts      # Catalog service types
│   ├── planning.ts     # Planning service types
│   └── shopping.ts     # Shopping service types
├── clients/            # Shared utilities for making typed requests
│   └── shared.ts       # HTTP client base, fetch wrappers
└── *.ts                # Service-specific API wrappers (identity.ts, catalog.ts, etc.)
```

## Quick Start

### 1. Generate TypeScript types from FastAPI specs

```bash
# Start all services (if not already running)
docker compose up

# Generate types
npm run generate:api
```

This command:
- Fetches the OpenAPI spec from each running service
- Generates TypeScript types into `src/lib/api/types/`
- Overwrites previous versions (safe; don't commit these files)

**When to regenerate**: After any backend API change. Pre-commit hook (future) can enforce this.

### 2. Use generated types in API wrappers

```typescript
// src/lib/api/identity.ts
import type { paths as IdentityPaths } from './types/identity'

// Type-safe function using generated types
export async function getSession(
  token: string
): Promise<IdentityPaths['/auth/session']['get']['responses'][200]['content']['application/json']> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_IDENTITY_URL}/auth/session`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  if (!response.ok) throw new Error(`${response.status}`)
  return response.json()
}
```

### 3. Import and use in components

```typescript
// src/app/(auth)/sign-in/page.tsx
import { signIn } from '@/lib/api/identity'

export default function SignInPage() {
  const handleSubmit = async (email: string, password: string) => {
    const response = await signIn(email, password)
    // TypeScript knows response has .token, .account_id, .email, .role
    saveSession(response)
  }
}
```

## API Contract Documentation

**Full reference**: `docs/api-contracts.md`  
**Architecture decision**: `docs/adr/0015-api-contracts-and-typescript-generation.md`

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_IDENTITY_URL` | `http://localhost:8001` | Identity service |
| `NEXT_PUBLIC_CATALOG_URL` | `http://localhost:8002` | Catalog service |
| `NEXT_PUBLIC_PLANNING_URL` | `http://localhost:8003` | Planning service |
| `NEXT_PUBLIC_SHOPPING_URL` | `http://localhost:8004` | Shopping service |

Set these in `.env.local` (dev) or deployment platform (prod).

## Common Patterns

### Handling missing services

Services may be unavailable at runtime. Always handle errors gracefully:

```typescript
export async function getShoppingList(
  token: string
): Promise<ShoppingList | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SHOPPING_URL}/shopping`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    // Network error, service down, etc.
    return null
  }
}
```

### Exporting binary data (PDFs)

Use `fetchBlob()` from `clients/shared.ts`:

```typescript
import { fetchBlob } from '@/lib/api/clients/shared'

export async function exportPdf(token: string): Promise<Blob> {
  return fetchBlob(`${process.env.NEXT_PUBLIC_PLANNING_URL}/plan/export/pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// In component
const blob = await exportPdf(token)
const url = URL.createObjectURL(blob)
window.open(url)
```

### Authentication

All API calls (except auth endpoints) require Bearer token:

```typescript
const headers = {
  Authorization: `Bearer ${token}`,
}
```

Get token from:
- `POST /auth/register` — new account
- `POST /auth/sign-in` — login
- `sessionStorage` (persisted by `useAuth` hook)

### Pagination

Endpoints supporting pagination:

```typescript
const response = await fetch(
  `${baseUrl}/products?limit=200&offset=0&search=chicken`,
  { headers }
)
const { products, total } = await response.json()
// Load more: offset += 200
```

## Troubleshooting

### `npm run generate:api` fails

**Symptom**: `Error: fetch failed` or `ECONNREFUSED`

**Solution**: Start services first
```bash
docker compose up  # In repo root
```

### Generated types are outdated

**Symptom**: TypeScript errors on API response fields

**Solution**: Regenerate
```bash
npm run generate:api
```

### Type mismatch between request and response

**Symptom**: `Property 'X' does not exist on type 'Response'`

**Solution**: Check `docs/api-contracts.md` for the endpoint schema, then verify backend has the latest migration deployed.

## References

- **TypeScript type generation**: [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- **OpenAPI specs**: `http://localhost:NNNN/openapi.json` (per service)
- **Full API reference**: `docs/api-contracts.md`
- **Decision + rationale**: `docs/adr/0015-api-contracts-and-typescript-generation.md`
