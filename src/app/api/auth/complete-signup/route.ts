import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { completeVerifiedSignup, normalizeEmail } from '@/lib/auth-signup';

const bodySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
    }

    const result = await completeVerifiedSignup(parsed.data.email, parsed.data.code);

    return NextResponse.json(
      {
        email: normalizeEmail(parsed.data.email),
        temporaryPassword: result.temporaryPassword,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete signup.';
    const status = /already has an account/i.test(message) || /Invalid verification code/i.test(message) || /expired/i.test(message)
      ? 400
      : 500;

    if (status === 500) {
      console.error('Failed to complete verified signup:', error);
    }

    return NextResponse.json(
      { error: message },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
