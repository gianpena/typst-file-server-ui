export function extractBasename(path: string): string {
    const pattern = /^(?:\/.+)*(?:\/(.+))$/g;
    const match = pattern.exec(path);
    return match ? match[1] : '';
}

export function getFileType(path: string): string | undefined {
    const basename = extractBasename(path);
    const pattern = /^.+(?:\..+)*\.(.+)$/g;
    const match = pattern.exec(basename);
    return match ? match[1].toLowerCase() : undefined;
}

export function PDFify(path: string): string {
    return path.replace(/\.typ$/, '.pdf');
}