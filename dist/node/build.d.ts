import type { InlineConfig, ResolvedConfig } from './config';
import type { Plugin, RollupOptions, RollupWarning, WarningHandler, RollupOutput, WatcherOptions, RollupWatcher, ModuleFormat } from 'rollup';
import type { Terser } from 'types/terser';
import type { RollupCommonJSOptions } from 'types/commonjs';
import type { RollupDynamicImportVarsOptions } from 'types/dynamicImportVars';
import type { TransformOptions } from 'esbuild';
export interface BuildOptions {
    /**
     * Base public path when served in production.
     * @deprecated `base` is now a root-level config option.
     */
    base?: string;
    /**
     * Compatibility transform target. The transform is performed with esbuild
     * and the lowest supported target is es2015/es6. Note this only handles
     * syntax transformation and does not cover polyfills (except for dynamic
     * import)
     *
     * Default: 'modules' - Similar to `@babel/preset-env`'s targets.esmodules,
     * transpile targeting browsers that natively support dynamic es module imports.
     * https://caniuse.com/es6-module-dynamic-import
     *
     * Another special value is 'esnext' - which only performs minimal transpiling
     * (for minification compat) and assumes native dynamic imports support.
     *
     * For custom targets, see https://esbuild.github.io/api/#target and
     * https://esbuild.github.io/content-types/#javascript for more details.
     */
    target?: 'modules' | TransformOptions['target'] | false;
    /**
     * whether to inject module preload polyfill.
     * Note: does not apply to library mode.
     * @default true
     */
    polyfillModulePreload?: boolean;
    /**
     * whether to inject dynamic import polyfill.
     * Note: does not apply to library mode.
     * @default false
     * @deprecated use plugin-legacy for browsers that don't support dynamic import
     */
    polyfillDynamicImport?: boolean;
    /**
     * Directory relative from `root` where build output will be placed. If the
     * directory exists, it will be removed before the build.
     * @default 'dist'
     */
    outDir?: string;
    /**
     * Directory relative from `outDir` where the built js/css/image assets will
     * be placed.
     * @default 'assets'
     */
    assetsDir?: string;
    /**
     * Static asset files smaller than this number (in bytes) will be inlined as
     * base64 strings. Default limit is `4096` (4kb). Set to `0` to disable.
     * @default 4096
     */
    assetsInlineLimit?: number;
    /**
     * Whether to code-split CSS. When enabled, CSS in async chunks will be
     * inlined as strings in the chunk and inserted via dynamically created
     * style tags when the chunk is loaded.
     * @default true
     */
    cssCodeSplit?: boolean;
    /**
     * An optional separate target for CSS minification.
     * As esbuild only supports configuring targets to mainstream
     * browsers, users may need this option when they are targeting
     * a niche browser that comes with most modern JavaScript features
     * but has poor CSS support, e.g. Android WeChat WebView, which
     * doesn't support the #RGBA syntax.
     */
    cssTarget?: TransformOptions['target'] | false;
    /**
     * If `true`, a separate sourcemap file will be created. If 'inline', the
     * sourcemap will be appended to the resulting output file as data URI.
     * 'hidden' works like `true` except that the corresponding sourcemap
     * comments in the bundled files are suppressed.
     * @default false
     */
    sourcemap?: boolean | 'inline' | 'hidden';
    /**
     * Set to `false` to disable minification, or specify the minifier to use.
     * Available options are 'terser' or 'esbuild'.
     * @default 'esbuild'
     */
    minify?: boolean | 'terser' | 'esbuild';
    /**
     * Options for terser
     * https://terser.org/docs/api-reference#minify-options
     */
    terserOptions?: Terser.MinifyOptions;
    /**
     * @deprecated Vite now uses esbuild for CSS minification.
     */
    cleanCssOptions?: any;
    /**
     * Will be merged with internal rollup options.
     * https://rollupjs.org/guide/en/#big-list-of-options
     */
    rollupOptions?: RollupOptions;
    /**
     * Options to pass on to `@rollup/plugin-commonjs`
     */
    commonjsOptions?: RollupCommonJSOptions;
    /**
     * Options to pass on to `@rollup/plugin-dynamic-import-vars`
     */
    dynamicImportVarsOptions?: RollupDynamicImportVarsOptions;
    /**
     * Whether to write bundle to disk
     * @default true
     */
    write?: boolean;
    /**
     * Empty outDir on write.
     * @default true when outDir is a sub directory of project root
     */
    emptyOutDir?: boolean | null;
    /**
     * Whether to emit a manifest.json under assets dir to map hash-less filenames
     * to their hashed versions. Useful when you want to generate your own HTML
     * instead of using the one generated by Vite.
     *
     * Example:
     *
     * ```json
     * {
     *   "main.js": {
     *     "file": "main.68fe3fad.js",
     *     "css": "main.e6b63442.css",
     *     "imports": [...],
     *     "dynamicImports": [...]
     *   }
     * }
     * ```
     * @default false
     */
    manifest?: boolean | string;
    /**
     * Build in library mode. The value should be the global name of the lib in
     * UMD mode. This will produce esm + cjs + umd bundle formats with default
     * configurations that are suitable for distributing libraries.
     */
    lib?: LibraryOptions | false;
    /**
     * Produce SSR oriented build. Note this requires specifying SSR entry via
     * `rollupOptions.input`.
     */
    ssr?: boolean | string;
    /**
     * Generate SSR manifest for determining style links and asset preload
     * directives in production.
     */
    ssrManifest?: boolean | string;
    /**
     * Set to false to disable reporting compressed chunk sizes.
     * Can slightly improve build speed.
     */
    reportCompressedSize?: boolean;
    /**
     * Set to false to disable brotli compressed size reporting for build.
     * Can slightly improve build speed.
     * @deprecated use `build.reportCompressedSize` instead.
     */
    brotliSize?: boolean;
    /**
     * Adjust chunk size warning limit (in kbs).
     * @default 500
     */
    chunkSizeWarningLimit?: number;
    /**
     * Rollup watch options
     * https://rollupjs.org/guide/en/#watchoptions
     */
    watch?: WatcherOptions | null;
}
export interface LibraryOptions {
    entry: string;
    name?: string;
    formats?: LibraryFormats[];
    fileName?: string | ((format: ModuleFormat) => string);
}
export declare type LibraryFormats = 'es' | 'cjs' | 'umd' | 'iife';
export declare type ResolvedBuildOptions = Required<Omit<BuildOptions, 'base' | 'cleanCssOptions' | 'polyfillDynamicImport' | 'brotliSize'>>;
export declare function resolveBuildOptions(raw?: BuildOptions): ResolvedBuildOptions;
export declare function resolveBuildPlugins(config: ResolvedConfig): {
    pre: Plugin[];
    post: Plugin[];
};
/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
export declare function build(inlineConfig?: InlineConfig): Promise<RollupOutput | RollupOutput[] | RollupWatcher>;
export declare function resolveLibFilename(libOptions: LibraryOptions, format: ModuleFormat, root: string): string;
export declare function onRollupWarning(warning: RollupWarning, warn: WarningHandler, config: ResolvedConfig): void;