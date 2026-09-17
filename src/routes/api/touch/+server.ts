import { PUBLIC_HOME_PATH } from "$env/static/public";
import type { RequestEvent } from "./$types";
import { $ } from 'bun';

export async function POST({ request }: RequestEvent) {
    const { path } = await request.json();

    if (!path) {
        return new Response('Missing path parameter', { status: 400 });
    }
    
    const result = await $`fish -c "touchp ${PUBLIC_HOME_PATH}/${path}"`.quiet();

    if (result.exitCode !== 0) {
        return new Response(`touchp failed: ${result.stderr}`, { status: 500 });
    }

    return new Response('OK', { status: 200 });
}
