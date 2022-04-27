import type { Logger } from '.';
export declare function transformImportGlob(source: string, pos: number, importer: string, importIndex: number, root: string, logger: Logger, normalizeUrl?: (url: string, pos: number) => Promise<[string, string]>, resolve?: (url: string, importer?: string) => Promise<string | undefined>, preload?: boolean): Promise<{
    importsString: string;
    imports: string[];
    exp: string;
    endIndex: number;
    isEager: boolean;
    pattern: string;
    base: string;
}>;
