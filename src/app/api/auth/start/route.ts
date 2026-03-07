import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/auth-verification-email';
import { startEmailAuthFlow } from '@/lib/auth-signup';

const bodySchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const result = await startEmailAuthFlow(parsed.data.email);

    if (result.flow === 'signup' && result.code) {
      await sendVerificationEmail({
        email: parsed.data.email.trim().toLowerCase(),
        code: result.code,
      });
    }

    return NextResponse.json(
      { flow: result.flow },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to start auth flow:', error);
    return NextResponse.json(
      { error: 'Unable to start authentication right now.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
