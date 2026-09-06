import { getFileTree } from '@/server';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import { existsSync } from 'node:fs';

export const load: PageServerLoad = async ({ params }) => {
	const path = `${env.PUBLIC_HOME_PATH}/${params.path}`;

	if (!existsSync(path)) {
		error(404, 'Not found');
	}

	const files = await getFileTree(path);

	return { files };

};
