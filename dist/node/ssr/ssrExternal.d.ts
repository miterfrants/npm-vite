import type { ResolvedConfig } from '..';
/**
 * Converts "parent > child" syntax to just "child"
 */
export declare function stripNesting(packages: string[]): string[];
/**
 * Heuristics for determining whether a dependency should be externalized for
 * server-side rendering.
 */
export declare function resolveSSRExternal(config: ResolvedConfig, knownImports: string[]): string[];
export declare function shouldExternalizeForSSR(id: string, externals: string[]): boolean;
