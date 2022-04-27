import type { BuildOptions as EsbuildBuildOptions } from 'esbuild';
import type { ResolvedConfig } from '../config';
import { parse } from 'es-module-lexer';
export declare const debuggerViteDeps: (...args: any[]) => any;
export declare type ExportsData = ReturnType<typeof parse> & {
    hasReExports?: true;
};
export interface OptimizedDeps {
    metadata: DepOptimizationMetadata;
    scanProcessing?: Promise<void>;
    registerMissingImport: (id: string, resolved: string) => OptimizedDepInfo;
}
export interface DepOptimizationOptions {
    /**
     * By default, Vite will crawl your `index.html` to detect dependencies that
     * need to be pre-bundled. If `build.rollupOptions.input` is specified, Vite
     * will crawl those entry points instead.
     *
     * If neither of these fit your needs, you can specify custom entries using
     * this option - the value should be a fast-glob pattern or array of patterns
     * (https://github.com/mrmlnc/fast-glob#basic-syntax) that are relative from
     * vite project root. This will overwrite default entries inference.
     */
    entries?: string | string[];
    /**
     * Force optimize listed dependencies (must be resolvable import paths,
     * cannot be globs).
     */
    include?: string[];
    /**
     * Do not optimize these dependencies (must be resolvable import paths,
     * cannot be globs).
     */
    exclude?: string[];
    /**
     * Options to pass to esbuild during the dep scanning and optimization
     *
     * Certain options are omitted since changing them would not be compatible
     * with Vite's dep optimization.
     *
     * - `external` is also omitted, use Vite's `optimizeDeps.exclude` option
     * - `plugins` are merged with Vite's dep plugin
     * - `keepNames` takes precedence over the deprecated `optimizeDeps.keepNames`
     *
     * https://esbuild.github.io/api
     */
    esbuildOptions?: Omit<EsbuildBuildOptions, 'bundle' | 'entryPoints' | 'external' | 'write' | 'watch' | 'outdir' | 'outfile' | 'outbase' | 'outExtension' | 'metafile'>;
    /**
     * @deprecated use `esbuildOptions.keepNames`
     */
    keepNames?: boolean;
    /**
     * List of file extensions that can be optimized. A corresponding esbuild
     * plugin must exist to handle the specific extension.
     *
     * By default, Vite can optimize `.mjs`, `.js`, and `.ts` files. This option
     * allows specifying additional extensions.
     *
     * @experimental
     */
    extensions?: string[];
    /**
     * Disables dependencies optimizations
     * @default false
     * @experimental
     */
    disabled?: boolean;
}
export interface DepOptimizationResult {
    metadata: DepOptimizationMetadata;
    /**
     * When doing a re-run, if there are newly discovered dependendencies
     * the page reload will be delayed until the next rerun so we need
     * to be able to discard the result
     */
    commit: () => void;
    cancel: () => void;
}
export interface DepOptimizationProcessing {
    promise: Promise<void>;
    resolve: () => void;
}
export interface OptimizedDepInfo {
    id: string;
    file: string;
    src?: string;
    needsInterop?: boolean;
    browserHash?: string;
    fileHash?: string;
    /**
     * During optimization, ids can still be resolved to their final location
     * but the bundles may not yet be saved to disk
     */
    processing?: Promise<void>;
}
export interface DepOptimizationMetadata {
    /**
     * The main hash is determined by user config and dependency lockfiles.
     * This is checked on server startup to avoid unnecessary re-bundles.
     */
    hash: string;
    /**
     * The browser hash is determined by the main hash plus additional dependencies
     * discovered at runtime. This is used to invalidate browser requests to
     * optimized deps.
     */
    browserHash: string;
    /**
     * Metadata for each already optimized dependency
     */
    optimized: Record<string, OptimizedDepInfo>;
    /**
     * Metadata for non-entry optimized chunks and dynamic imports
     */
    chunks: Record<string, OptimizedDepInfo>;
    /**
     * Metadata for each newly discovered dependency after processing
     */
    discovered: Record<string, OptimizedDepInfo>;
    /**
     * OptimizedDepInfo list
     */
    depInfoList: OptimizedDepInfo[];
}
/**
 * Used by Vite CLI when running `vite optimize`
 */
export declare function optimizeDeps(config: ResolvedConfig, force?: boolean | undefined, asCommand?: boolean): Promise<DepOptimizationMetadata>;
export declare function createOptimizedDepsMetadata(config: ResolvedConfig, timestamp?: string): DepOptimizationMetadata;
export declare function addOptimizedDepInfo(metadata: DepOptimizationMetadata, type: 'optimized' | 'discovered' | 'chunks', depInfo: OptimizedDepInfo): OptimizedDepInfo;
/**
 * Creates the initial dep optimization metadata, loading it from the deps cache
 * if it exists and pre-bundling isn't forced
 */
export declare function loadCachedDepOptimizationMetadata(config: ResolvedConfig, force?: boolean | undefined, asCommand?: boolean): DepOptimizationMetadata | undefined;
/**
 * Initial optimizeDeps at server start. Perform a fast scan using esbuild to
 * find deps to pre-bundle and include user hard-coded dependencies
 */
export declare function discoverProjectDependencies(config: ResolvedConfig, timestamp?: string): Promise<Record<string, OptimizedDepInfo>>;
export declare function depsLogString(qualifiedIds: string[]): string;
/**
 * Internally, Vite uses this function to prepare a optimizeDeps run. When Vite starts, we can get
 * the metadata and start the server without waiting for the optimizeDeps processing to be completed
 */
export declare function runOptimizeDeps(config: ResolvedConfig, depsInfo: Record<string, OptimizedDepInfo>): Promise<DepOptimizationResult>;
export declare function findKnownImports(config: ResolvedConfig): Promise<string[]>;
export declare function newDepOptimizationProcessing(): DepOptimizationProcessing;
export declare function depsFromOptimizedDepInfo(depsInfo: Record<string, OptimizedDepInfo>): {
    [k: string]: string;
};
export declare function getOptimizedDepPath(id: string, config: ResolvedConfig): string;
export declare function getDepsCacheDir(config: ResolvedConfig): string;
export declare function isOptimizedDepFile(id: string, config: ResolvedConfig): boolean;
export declare function createIsOptimizedDepUrl(config: ResolvedConfig): (url: string) => boolean;
export declare function getDepHash(config: ResolvedConfig): string;
export declare function getHash(text: string): string;
export declare function optimizedDepInfoFromId(metadata: DepOptimizationMetadata, id: string): OptimizedDepInfo | undefined;
export declare function optimizedDepInfoFromFile(metadata: DepOptimizationMetadata, file: string): OptimizedDepInfo | undefined;
export declare function optimizedDepNeedsInterop(metadata: DepOptimizationMetadata, file: string): Promise<boolean | undefined>;
