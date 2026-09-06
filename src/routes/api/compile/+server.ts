import type { RequestEvent } from "./$types";
import { $ } from 'bun';

export async function POST({ request }: RequestEvent) {
    const { path } = await request.json();

    if(!path) {
        return new Response('Missing path parameter', { status: 400 });
    }

    const compilation = await $`typst compile ${path}`;
    if(compilation.exitCode !== 0) {
        return new Response(`Compilation failed: ${compilation.stderr}`, { status: 500 });
    }

    return new Response('Compilation successful', { status: 200 });    

}