import { getFileTree } from '@/server';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async ({ params }) => {
	const path = `${env.PUBLIC_HOME_PATH}/${params.path}`;
	const files = await getFileTree(path);

	return { files };

};
