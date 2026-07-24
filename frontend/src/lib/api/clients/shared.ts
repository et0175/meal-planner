/**
 * Shared utilities for typed API clients.
 *
 * Usage:
 * ```typescript
 * import { createTypedClient } from '@/lib/api/clients/shared'
 * import type { paths } from '@/lib/api/types/identity'
 *
 * const identityClient = createTypedClient<paths>(
 *   process.env.NEXT_PUBLIC_IDENTITY_URL || 'http://localhost:8001'
 * )
 *
 * const response = await identityClient.get('/auth/session', {
 *   headers: { Authorization: `Bearer ${token}` }
 * })
 * ```
 */

type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

/**
 * Create a typed API client that enforces request/response shapes.
 * This is a simple wrapper; for more complex needs, consider openapi-fetch.
 */
export function createTypedClient<Paths extends Record<string, unknown>>(
  baseUrl: string
) {
  return {
    async request<M extends HTTPMethod, P extends keyof Paths>(
      method: M,
      path: P,
      options?: FetchOptions
    ): Promise<unknown> {
      const url = `${baseUrl}${String(path)}`
      const response = await fetch(url, {
        ...options,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`${response.status}: ${error}`)
      }

      if (response.status === 204) {
        return null
      }

      return response.json()
    },

    get<P extends keyof Paths>(path: P, options?: FetchOptions) {
      return this.request('get', path, options)
    },

    post<P extends keyof Paths>(
      path: P,
      body?: unknown,
      options?: FetchOptions
    ) {
      return this.request('post', path, {
        ...options,
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    put<P extends keyof Paths>(
      path: P,
      body?: unknown,
      options?: FetchOptions
    ) {
      return this.request('put', path, {
        ...options,
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    delete<P extends keyof Paths>(path: P, options?: FetchOptions) {
      return this.request('delete', path, options)
    },
  }
}

/**
 * Fetch wrapper for PDF/binary responses.
 * Returns a Blob instead of parsing JSON.
 */
export async function fetchBlob(
  url: string,
  options?: FetchOptions
): Promise<Blob> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`${response.status}`)
  }

  return response.blob()
}
