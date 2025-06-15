import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { access_token, refresh_token } = await request.json()
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax' as const,
  }
  if (access_token && refresh_token) {
    cookies().set('sb-access-token', access_token, opts)
    cookies().set('sb-refresh-token', refresh_token, opts)
  } else {
    cookies().set('sb-access-token', '', { ...opts, maxAge: 0 })
    cookies().set('sb-refresh-token', '', { ...opts, maxAge: 0 })
  }
  return NextResponse.json({ ok: true })
}
