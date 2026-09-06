import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type FileTreeNode } from '@/types';
import { getFileType } from './shared';
import { statSync } from 'fs';

async function buildNode(path: string): Promise<FileTreeNode> {
    const file = Bun.file(path);
    const stats = await file.stat();
    const name = path;

    if (stats.isDirectory()) {
        const entries = (await readdir(path)).filter((entry) => {
            const fileType = getFileType(join(path, entry));
            const isDirectory = statSync(join(path, entry)).isDirectory();
            return fileType === 'typ' || fileType === 'pdf' || isDirectory;
        });
        const children = await Promise.all(
            entries.map((entry) => buildNode(join(path, entry)))
        );
        return { name, collapsed: true, children };
    }

    return { name, selected: false };
}

export async function getFileTree(path: string): Promise<FileTreeNode[]> {
    
    const file = await buildNode(path);
    if ('children' in file) {
        return file.children;
    }

    return [file];
}
