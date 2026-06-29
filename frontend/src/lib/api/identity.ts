/**
 * Typed fetch wrappers for the Identity service.
 * Base URL: NEXT_PUBLIC_IDENTITY_URL
 *
 * Never call fetch directly in components — use these wrappers.
 */

const BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_URL ?? ''

export type Role = 'user' | 'nutritionist'

export interface RegisterRequest {
  email: string
  password: string
}

export interface RegisterResponse {
  id: number
  email: string
  role: Role
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  token: string
  account_id: number
  role: Role
}

export interface SessionInfo {
  account_id: number
  email: string
  role: Role
}

export interface ApiError {
  status: number
  detail: string
  retryAfter?: number
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err
}

export { isApiError }

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>
  }
  let detail = 'An unexpected error occurred.'
  try {
    const body = (await res.json()) as { detail?: string }
    if (body.detail) detail = body.detail
  } catch {
    // non-JSON body — keep default message
  }
  const err: ApiError = { status: res.status, detail }
  if (res.status === 429) {
    const retryAfterHeader = res.headers.get('Retry-After')
    if (retryAfterHeader) {
      err.retryAfter = parseInt(retryAfterHeader, 10)
    }
  }
  throw err
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<RegisterResponse>(res)
}

export async function signIn(data: SignInRequest): Promise<SignInResponse> {
  const res = await fetch(`${BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<SignInResponse>(res)
}

export async function signOut(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/sign-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse<{ detail: string }>(res)
}

export async function resetRequest(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/reset-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  await handleResponse<{ detail: string }>(res)
}

export async function getSession(token: string, signal?: AbortSignal): Promise<SessionInfo> {
  const res = await fetch(`${BASE_URL}/auth/session`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  return handleResponse<SessionInfo>(res)
}
