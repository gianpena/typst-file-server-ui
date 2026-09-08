import type { RequestEvent } from "./$types";
import { getFileType } from "@/shared";

export async function GET({ url }: RequestEvent) {
    const path = url.searchParams.get('path');
    if (!path) {
        return new Response('Missing path parameter', { status: 400 });
    }

    const fileContents = await Bun.file(path).text();
    return new Response(fileContents, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

export async function POST({ request }: RequestEvent) {
    const { path, contents } = await request.json();
    if (!path || contents === undefined) {
        return new Response('Missing path or contents parameter', { status: 400 });
    }

    await Bun.write(path, contents);
    return new Response('File written successfully', { status: 200 });

}