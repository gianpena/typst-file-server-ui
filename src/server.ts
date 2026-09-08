import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type FileTreeNode } from '@/types';
import { getFileType } from './shared';
import { statSync } from 'fs';

async function buildNode(path: string): Promise<FileTreeNode | null> {
    const file = Bun.file(path);
    const stats = await file.stat();
    const name = path;
    const type = getFileType(path);

    if (stats.isDirectory()) {
        const entries = (await readdir(path)).filter((entry) => {
            const fileType = getFileType(join(path, entry));
            const isDirectory = statSync(join(path, entry)).isDirectory();
            return fileType === 'typ' || isDirectory;
        });
        const children = (await Promise.all(
            entries.map((entry) => buildNode(join(path, entry)))
        )).filter((child): child is FileTreeNode => child !== null);
        return children.length > 0 ? { name, collapsed: true, children } : null;
    }

    return type === 'typ' ? { name, selected: false } : null;
}

export async function getFileTree(path: string): Promise<FileTreeNode[]> {
    
    const file = await buildNode(path);
    if (file === null)
        return [];

    if('children' in file)
        return file.children;

    return [file];
    
}
