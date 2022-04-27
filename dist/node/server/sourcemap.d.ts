import type { Logger } from '../logger';
import type { SourceMap } from 'rollup';
interface SourceMapLike {
    sources: string[];
    sourcesContent?: (string | null)[];
    sourceRoot?: string;
}
export declare function injectSourcesContent(map: SourceMapLike, file: string, logger: Logger): Promise<void>;
export declare function genSourceMapUrl(map: SourceMap | string | undefined): string;
export declare function getCodeWithSourcemap(type: 'js' | 'css', code: string, map: SourceMap | null): string;
export {};
