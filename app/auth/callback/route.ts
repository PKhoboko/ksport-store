import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // If it's a password reset, go to update-password
            // Otherwise go to home or wherever next points
            const redirectTo = next === '/update-password' ? '/update-password' : '/';
            return NextResponse.redirect(new URL(redirectTo, request.url));
        }
    }

    return NextResponse.redirect(new URL('/login', request.url));
}