import type { Plugin } from '../plugin';
import type { GetManualChunk } from 'rollup';
export declare class SplitVendorChunkCache {
    cache: Map<string, boolean>;
    constructor();
    reset(): void;
}
export declare function splitVendorChunk(options?: {
    cache?: SplitVendorChunkCache;
}): GetManualChunk;
export declare function splitVendorChunkPlugin(): Plugin;
