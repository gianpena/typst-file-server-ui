import type { RequestEvent } from "./$types";
import { $ } from 'bun';

export async function POST({ request }: RequestEvent) {
    const { path } = await request.json();

    if(!path) {
        return new Response('Missing path parameter', { status: 400 });
    }

    const compilation = await $`typst compile ${path} -`.quiet();
    if(compilation.exitCode !== 0) {
        return new Response(`Compilation failed: ${compilation.stderr}`, { status: 500 });
    }

    const base64 = Buffer.from(compilation.stdout).toString('base64');
    return new Response(JSON.stringify({ data: base64 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

}