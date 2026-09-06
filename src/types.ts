export type File = {
    name: string,
    selected: boolean
};

export type Directory = {
    collapsed: boolean,
    children: FileTreeNode[]
} & Omit<File, 'selected'>;

export type FileTreeNode = File | Directory;