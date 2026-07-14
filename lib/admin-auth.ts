import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "zikiano_admin_session";

function sessionValue() {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return null;
    return createHash("sha256").update(secret).digest("hex");
}

export function isValidAdminSecret(secret: unknown) {
    const expected = process.env.ADMIN_SECRET;
    return typeof secret === "string" && Boolean(expected) && secret === expected;
}

export function hasAdminSession(request: NextRequest) {
    const expected = sessionValue();
    const received = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!expected || !received || expected.length !== received.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function adminSessionValue() {
    return sessionValue();
}
