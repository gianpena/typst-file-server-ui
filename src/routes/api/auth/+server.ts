import type { RequestEvent } from "./$types";
import { PASSWORD } from "$env/static/private";
import { timingSafeEqual } from "node:crypto";

export async function POST({ request }: RequestEvent) {
    const { password } = await request.json();

    const a = Buffer.from(String(password ?? ""));
    const b = Buffer.from(PASSWORD);
    const match = a.length === b.length && timingSafeEqual(a, b);

    return new Response(match ? "OK" : "Forbidden", { status: match ? 200 : 403 })
}
