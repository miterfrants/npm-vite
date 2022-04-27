import type { Plugin } from '../plugin';
import type { ResolvedConfig } from '../config';
import type { ExistingRawSourceMap, RenderedChunk, RollupError } from 'rollup';
import type { ResolveFn } from '../';
import type * as PostCSS from 'postcss';
import type { Alias } from 'types/alias';
export interface CSSOptions {
    /**
     * https://github.com/css-modules/postcss-modules
     */
    modules?: CSSModulesOptions | false;
    preprocessorOptions?: Record<string, any>;
    postcss?: string | (PostCSS.ProcessOptions & {
        plugins?: PostCSS.Plugin[];
    });
    /**
     * Enables css sourcemaps during dev
     * @default false
     * @experimental
     */
    devSourcemap?: boolean;
}
export interface CSSModulesOptions {
    getJSON?: (cssFileName: string, json: Record<string, string>, outputFileName: string) => void;
    scopeBehaviour?: 'global' | 'local';
    globalModulePaths?: RegExp[];
    generateScopedName?: string | ((name: string, filename: string, css: string) => string);
    hashPrefix?: string;
    /**
     * default: null
     */
    localsConvention?: 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly' | null;
}
export declare const isCSSRequest: (request: string) => boolean;
export declare const isDirectCSSRequest: (request: string) => boolean;
export declare const isDirectRequest: (request: string) => boolean;
export declare const removedPureCssFilesCache: WeakMap<Readonly<Omit<import("../config").UserConfig, "plugins" | "alias" | "dedupe" | "assetsInclude" | "optimizeDeps" | "worker"> & {
    configFile: string | undefined;
    configFileDependencies: string[];
    inlineConfig: import("../config").InlineConfig; /**
     * Plugin applied after user plugins
     */
    root: string;
    base: string;
    publicDir: string;
    cacheDir: string;
    command: "build" | "serve";
    mode: string;
    isWorker: boolean;
    isProduction: boolean;
    env: Record<string, any>;
    resolve: import("./resolve").ResolveOptions & {
        alias: Alias[];
    };
    plugins: readonly Plugin[];
    server: import("../server").ResolvedServerOptions;
    build: Required<Omit<import("../build").BuildOptions, "base" | "cleanCssOptions" | "polyfillDynamicImport" | "brotliSize">>;
    preview: import("../preview").ResolvedPreviewOptions;
    assetsInclude: (file: string) => boolean;
    logger: import("../logger").Logger;
    createResolver: (options?: Partial<import("./resolve").InternalResolveOptions> | undefined) => ResolveFn;
    optimizeDeps: Omit<import("../optimizer").DepOptimizationOptions, "keepNames">;
    packageCache: import("../packages").PackageCache;
    worker: import("../config").ResolveWorkerOptions;
}>, Map<string, RenderedChunk>>;
/**
 * Plugin applied before user plugins
 */
export declare function cssPlugin(config: ResolvedConfig): Plugin;
/**
 * Plugin applied after user plugins
 */
export declare function cssPostPlugin(config: ResolvedConfig): Plugin;
export declare function formatPostcssSourceMap(rawMap: ExistingRawSourceMap, file: string): ExistingRawSourceMap;
export declare const cssUrlRE: RegExp;
export declare const cssDataUriRE: RegExp;
export declare const importCssRE: RegExp;
export declare function hoistAtRules(css: string): Promise<string>;
export interface StylePreprocessorResults {
    code: string;
    map?: ExistingRawSourceMap | undefined;
    additionalMap?: ExistingRawSourceMap | undefined;
    errors: RollupError[];
    deps: string[];
}
