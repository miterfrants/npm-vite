import type { ResolvedConfig } from '..';
export declare const importsRE: RegExp;
export declare function scanImports(config: ResolvedConfig): Promise<{
    deps: Record<string, string>;
    missing: Record<string, string>;
}>;
export declare const scriptRE: RegExp;
export declare const commentRE: RegExp;
