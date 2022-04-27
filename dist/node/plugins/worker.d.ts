/// <reference types="node" />
import type { ResolvedConfig } from '../config';
import type { Plugin } from '../plugin';
import type Rollup from 'rollup';
export declare function bundleWorkerEntry(ctx: Rollup.TransformPluginContext, config: ResolvedConfig, id: string, query: Record<string, string> | null): Promise<Buffer>;
export declare function workerFileToUrl(ctx: Rollup.TransformPluginContext, config: ResolvedConfig, id: string, query: Record<string, string> | null): Promise<string>;
export declare function webWorkerPlugin(config: ResolvedConfig): Plugin;
