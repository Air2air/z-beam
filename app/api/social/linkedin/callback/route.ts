import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error,
        errorDescription: errorDescription || 'LinkedIn authorization was denied or failed.'
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const code = params.get('code');
  if (!code) {
    return NextResponse.json(
      {
        ok: false,
        error: 'missing_code',
        message: 'No authorization code found in callback URL.'
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const clientId = requireEnv('LINKEDIN_CLIENT_ID');
    const clientSecret = requireEnv('LINKEDIN_CLIENT_SECRET');
    const redirectUri = requireEnv('LINKEDIN_REDIRECT_URI');

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    });

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    const payload = (await tokenResponse.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !payload.access_token) {
      return NextResponse.json(
        {
          ok: false,
          error: payload.error || 'token_exchange_failed',
          errorDescription: payload.error_description || 'LinkedIn token exchange failed.',
          status: tokenResponse.status
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'LinkedIn access token generated successfully. Copy this token into LINKEDIN_ACCESS_TOKEN in your .env.',
        accessToken: payload.access_token,
        expiresIn: payload.expires_in || null
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown callback error';
    return NextResponse.json(
      {
        ok: false,
        error: 'callback_failure',
        errorDescription: message
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
