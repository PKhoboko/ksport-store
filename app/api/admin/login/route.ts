import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionValue, isValidAdminSecret } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    if (!isValidAdminSecret(body.secret)) {
        return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionValue()!, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
    });
    return response;
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
}
