'use strict';

var fs = require('fs');
var path = require('path');
var colors = require('picocolors');
var connect = require('connect');
var corsMiddleware = require('cors');
var chokidar = require('chokidar');
var _debug = require('debug');
var os = require('os');
var url = require('url');
var resolve = require('resolve');
var module$1 = require('module');
var remapping = require('@ampproject/remapping');
var perf_hooks = require('perf_hooks');
var acorn = require('acorn');
var traceMapping = require('@jridgewell/trace-mapping');
var MagicString = require('magic-string');
var strip = require('strip-ansi');
var http = require('http');
var https = require('https');
var ws = require('ws');
var httpProxy = require('http-proxy');
var history = require('connect-history-api-fallback');
var getEtag = require('etag');
var mrmime = require('mrmime');
var require$$1 = require('crypto');
var glob = require('fast-glob');
var postcssrc = require('postcss-load-config');
var pluginutils = require('@rollup/pluginutils');
var esbuild = require('esbuild');
var esModuleLexer = require('es-module-lexer');
var JSON5 = require('json5');
var convertSourceMap = require('convert-source-map');
var periscopic = require('periscopic');
var estreeWalker = require('estree-walker');
var sirv = require('sirv');
var micromatch = require('micromatch');
var resolve_exports = require('resolve.exports');
var tsconfck = require('tsconfck');
var open = require('open');
var spawn = require('cross-spawn');
var child_process = require('child_process');
var launchEditorMiddleware = require('launch-editor-middleware');
var readline = require('readline');
var zlib = require('zlib');
var aliasPlugin = require('@rollup/plugin-alias');
var dotenv = require('dotenv');
var dotenvExpand = require('dotenv-expand');
var util = require('util');
var okie = require('okie');
var commonjsPlugin = require('@rollup/plugin-commonjs');
var dynamicImportVars = require('@rollup/plugin-dynamic-import-vars');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        for (var k in e) {
            n[k] = e[k];
        }
    }
    n["default"] = e;
    return n;
}

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var colors__default = /*#__PURE__*/_interopDefaultLegacy(colors);
var connect__default = /*#__PURE__*/_interopDefaultLegacy(connect);
var corsMiddleware__default = /*#__PURE__*/_interopDefaultLegacy(corsMiddleware);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
var _debug__default = /*#__PURE__*/_interopDefaultLegacy(_debug);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var resolve__default = /*#__PURE__*/_interopDefaultLegacy(resolve);
var remapping__default = /*#__PURE__*/_interopDefaultLegacy(remapping);
var acorn__namespace = /*#__PURE__*/_interopNamespace(acorn);
var MagicString__default = /*#__PURE__*/_interopDefaultLegacy(MagicString);
var strip__default = /*#__PURE__*/_interopDefaultLegacy(strip);
var httpProxy__default = /*#__PURE__*/_interopDefaultLegacy(httpProxy);
var history__default = /*#__PURE__*/_interopDefaultLegacy(history);
var getEtag__default = /*#__PURE__*/_interopDefaultLegacy(getEtag);
var mrmime__namespace = /*#__PURE__*/_interopNamespace(mrmime);
var glob__default = /*#__PURE__*/_interopDefaultLegacy(glob);
var postcssrc__default = /*#__PURE__*/_interopDefaultLegacy(postcssrc);
var JSON5__default = /*#__PURE__*/_interopDefaultLegacy(JSON5);
var convertSourceMap__namespace = /*#__PURE__*/_interopNamespace(convertSourceMap);
var sirv__default = /*#__PURE__*/_interopDefaultLegacy(sirv);
var open__default = /*#__PURE__*/_interopDefaultLegacy(open);
var spawn__default = /*#__PURE__*/_interopDefaultLegacy(spawn);
var launchEditorMiddleware__default = /*#__PURE__*/_interopDefaultLegacy(launchEditorMiddleware);
var readline__default = /*#__PURE__*/_interopDefaultLegacy(readline);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);
var aliasPlugin__default = /*#__PURE__*/_interopDefaultLegacy(aliasPlugin);
var dotenv__default = /*#__PURE__*/_interopDefaultLegacy(dotenv);
var dotenvExpand__default = /*#__PURE__*/_interopDefaultLegacy(dotenvExpand);
var commonjsPlugin__default = /*#__PURE__*/_interopDefaultLegacy(commonjsPlugin);
var dynamicImportVars__default = /*#__PURE__*/_interopDefaultLegacy(dynamicImportVars);

const DEFAULT_MAIN_FIELDS = [
    'module',
    'jsnext:main',
    'jsnext'
];
const DEFAULT_EXTENSIONS = [
    '.mjs',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.json'
];
const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/;
const OPTIMIZABLE_ENTRY_RE = /\.(?:m?js|ts)$/;
const SPECIAL_QUERY_RE = /[\?&](?:worker|sharedworker|raw|url)\b/;
/**
 * Prefix for resolved fs paths, since windows paths may not be valid as URLs.
 */
const FS_PREFIX = `/@fs/`;
/**
 * Prefix for resolved Ids that are not valid browser import specifiers
 */
const VALID_ID_PREFIX = `/@id/`;
/**
 * Plugins that use 'virtual modules' (e.g. for helper functions), prefix the
 * module ID with `\0`, a convention from the rollup ecosystem.
 * This prevents other plugins from trying to process the id (like node resolution),
 * and core features like sourcemaps can use this info to differentiate between
 * virtual modules and regular files.
 * `\0` is not a permitted char in import URLs so we have to replace them during
 * import analysis. The id will be decoded back before entering the plugins pipeline.
 * These encoded virtual ids are also prefixed by the VALID_ID_PREFIX, so virtual
 * modules in the browser end up encoded as `/@id/__x00__{id}`
 */
const NULL_BYTE_PLACEHOLDER = `__x00__`;
const CLIENT_PUBLIC_PATH = `/@vite/client`;
const ENV_PUBLIC_PATH = `/@vite/env`;
// eslint-disable-next-line node/no-missing-require
const CLIENT_ENTRY = require.resolve('vite/dist/client/client.mjs');
// eslint-disable-next-line node/no-missing-require
const ENV_ENTRY = require.resolve('vite/dist/client/env.mjs');
const CLIENT_DIR = path__default.dirname(CLIENT_ENTRY);
// ** READ THIS ** before editing `KNOWN_ASSET_TYPES`.
//   If you add an asset to `KNOWN_ASSET_TYPES`, make sure to also add it
//   to the TypeScript declaration file `packages/vite/client.d.ts`.
const KNOWN_ASSET_TYPES = [
    // images
    'png',
    'jpe?g',
    'gif',
    'svg',
    'ico',
    'webp',
    'avif',
    // media
    'mp4',
    'webm',
    'ogg',
    'mp3',
    'wav',
    'flac',
    'aac',
    // fonts
    'woff2?',
    'eot',
    'ttf',
    'otf',
    // other
    'wasm',
    'webmanifest',
    'pdf',
    'txt'
];
const DEFAULT_ASSETS_RE = new RegExp(`\\.(` + KNOWN_ASSET_TYPES.join('|') + `)(\\?.*)?$`);
const DEP_VERSION_RE = /[\?&](v=[\w\.-]+)\b/;

function slash(p) {
    return p.replace(/\\/g, '/');
}
// Strip valid id prefix. This is prepended to resolved Ids that are
// not valid browser import specifiers by the importAnalysis plugin.
function unwrapId(id) {
    return id.startsWith(VALID_ID_PREFIX) ? id.slice(VALID_ID_PREFIX.length) : id;
}
const flattenId = (id) => id.replace(/(\s*>\s*)/g, '__').replace(/[\/\.:]/g, '_');
const normalizeId = (id) => id.replace(/(\s*>\s*)/g, ' > ');
//TODO: revisit later to see if the edge case that "compiling using node v12 code to be run in node v16 in the server" is what we intend to support.
const builtins = new Set([
    ...module$1.builtinModules,
    'assert/strict',
    'diagnostics_channel',
    'dns/promises',
    'fs/promises',
    'path/posix',
    'path/win32',
    'readline/promises',
    'stream/consumers',
    'stream/promises',
    'stream/web',
    'timers/promises',
    'util/types',
    'wasi'
]);
function isBuiltin(id) {
    return builtins.has(id.replace(/^node:/, ''));
}
function moduleListContains(moduleList, id) {
    return moduleList === null || moduleList === void 0 ? void 0 : moduleList.some((m) => m === id || id.startsWith(m + '/'));
}
const bareImportRE = /^[\w@](?!.*:\/\/)/;
let isRunningWithYarnPnp;
try {
    isRunningWithYarnPnp = Boolean(require('pnpapi'));
}
catch { }
const ssrExtensions = ['.js', '.cjs', '.json', '.node'];
function resolveFrom(id, basedir, preserveSymlinks = false, ssr = false) {
    return resolve__default.sync(id, {
        basedir,
        paths: [],
        extensions: ssr ? ssrExtensions : DEFAULT_EXTENSIONS,
        // necessary to work with pnpm
        preserveSymlinks: preserveSymlinks || isRunningWithYarnPnp || false
    });
}
/**
 * like `resolveFrom` but supports resolving `>` path in `id`,
 * for example: `foo > bar > baz`
 */
function nestedResolveFrom(id, basedir, preserveSymlinks = false) {
    const pkgs = id.split('>').map((pkg) => pkg.trim());
    try {
        for (const pkg of pkgs) {
            basedir = resolveFrom(pkg, basedir, preserveSymlinks);
        }
    }
    catch { }
    return basedir;
}
// set in bin/vite.js
const filter = process.env.VITE_DEBUG_FILTER;
const DEBUG = process.env.DEBUG;
function createDebugger(namespace, options = {}) {
    const log = _debug__default(namespace);
    const { onlyWhenFocused } = options;
    const focus = typeof onlyWhenFocused === 'string' ? onlyWhenFocused : namespace;
    return (msg, ...args) => {
        if (filter && !msg.includes(filter)) {
            return;
        }
        if (onlyWhenFocused && !(DEBUG === null || DEBUG === void 0 ? void 0 : DEBUG.includes(focus))) {
            return;
        }
        log(msg, ...args);
    };
}
function testCaseInsensitiveFS() {
    if (!CLIENT_ENTRY.endsWith('client.mjs')) {
        throw new Error(`cannot test case insensitive FS, CLIENT_ENTRY const doesn't contain client.mjs`);
    }
    if (!fs__default.existsSync(CLIENT_ENTRY)) {
        throw new Error('cannot test case insensitive FS, CLIENT_ENTRY does not point to an existing file: ' +
            CLIENT_ENTRY);
    }
    return fs__default.existsSync(CLIENT_ENTRY.replace('client.mjs', 'cLiEnT.mjs'));
}
const isCaseInsensitiveFS = testCaseInsensitiveFS();
const isWindows = os__default.platform() === 'win32';
const VOLUME_RE = /^[A-Z]:/i;
function normalizePath(id) {
    return path__default.posix.normalize(isWindows ? slash(id) : id);
}
function fsPathFromId(id) {
    const fsPath = normalizePath(id.startsWith(FS_PREFIX) ? id.slice(FS_PREFIX.length) : id);
    return fsPath.startsWith('/') || fsPath.match(VOLUME_RE)
        ? fsPath
        : `/${fsPath}`;
}
function fsPathFromUrl(url) {
    return fsPathFromId(cleanUrl(url));
}
/**
 * Check if dir is a parent of file
 *
 * Warning: parameters are not validated, only works with normalized absolute paths
 *
 * @param dir - normalized absolute path
 * @param file - normalized absolute path
 * @returns true if dir is a parent of file
 */
function isParentDirectory(dir, file) {
    if (!dir.endsWith('/')) {
        dir = `${dir}/`;
    }
    return (file.startsWith(dir) ||
        (isCaseInsensitiveFS && file.toLowerCase().startsWith(dir.toLowerCase())));
}
function ensureVolumeInPath(file) {
    return isWindows ? path__default.resolve(file) : file;
}
const queryRE = /\?.*$/s;
const hashRE = /#.*$/s;
const cleanUrl = (url) => url.replace(hashRE, '').replace(queryRE, '');
const externalRE = /^(https?:)?\/\//;
const isExternalUrl = (url) => externalRE.test(url);
const dataUrlRE = /^\s*data:/i;
const isDataUrl = (url) => dataUrlRE.test(url);
const virtualModuleRE = /^virtual-module:.*/;
const virtualModulePrefix = 'virtual-module:';
const knownJsSrcRE = /\.((j|t)sx?|mjs|vue|marko|svelte|astro)($|\?)/;
const isJSRequest = (url) => {
    url = cleanUrl(url);
    if (knownJsSrcRE.test(url)) {
        return true;
    }
    if (!path__default.extname(url) && !url.endsWith('/')) {
        return true;
    }
    return false;
};
const knownTsRE = /\.(ts|mts|cts|tsx)$/;
const knownTsOutputRE = /\.(js|mjs|cjs|jsx)$/;
const isTsRequest = (url) => knownTsRE.test(cleanUrl(url));
const isPossibleTsOutput = (url) => knownTsOutputRE.test(cleanUrl(url));
function getPotentialTsSrcPaths(filePath) {
    const [name, type, query = ''] = filePath.split(/(\.(?:[cm]?js|jsx))(\?.*)?$/);
    const paths = [name + type.replace('js', 'ts') + query];
    if (!type.endsWith('x')) {
        paths.push(name + type.replace('js', 'tsx') + query);
    }
    return paths;
}
const importQueryRE = /(\?|&)import=?(?:&|$)/;
const internalPrefixes = [
    FS_PREFIX,
    VALID_ID_PREFIX,
    CLIENT_PUBLIC_PATH,
    ENV_PUBLIC_PATH
];
const InternalPrefixRE = new RegExp(`^(?:${internalPrefixes.join('|')})`);
const trailingSeparatorRE = /[\?&]$/;
const isImportRequest = (url) => importQueryRE.test(url);
const isInternalRequest = (url) => InternalPrefixRE.test(url);
function removeImportQuery(url) {
    return url.replace(importQueryRE, '$1').replace(trailingSeparatorRE, '');
}
function injectQuery(url$1, queryToInject) {
    // encode percents for consistent behavior with pathToFileURL
    // see #2614 for details
    let resolvedUrl = new url.URL(url$1.replace(/%/g, '%25'), 'relative:///');
    if (resolvedUrl.protocol !== 'relative:') {
        resolvedUrl = url.pathToFileURL(url$1);
    }
    let { protocol, pathname, search, hash } = resolvedUrl;
    if (protocol === 'file:') {
        pathname = pathname.slice(1);
    }
    pathname = decodeURIComponent(pathname);
    return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${hash !== null && hash !== void 0 ? hash : ''}`;
}
const timestampRE = /\bt=\d{13}&?\b/;
function removeTimestampQuery(url) {
    return url.replace(timestampRE, '').replace(trailingSeparatorRE, '');
}
async function asyncReplace(input, re, replacer) {
    let match;
    let remaining = input;
    let rewritten = '';
    while ((match = re.exec(remaining))) {
        rewritten += remaining.slice(0, match.index);
        rewritten += await replacer(match);
        remaining = remaining.slice(match.index + match[0].length);
    }
    rewritten += remaining;
    return rewritten;
}
function timeFrom(start, subtract = 0) {
    const time = perf_hooks.performance.now() - start - subtract;
    const timeString = (time.toFixed(2) + `ms`).padEnd(5, ' ');
    if (time < 10) {
        return colors__default.green(timeString);
    }
    else if (time < 50) {
        return colors__default.yellow(timeString);
    }
    else {
        return colors__default.red(timeString);
    }
}
/**
 * pretty url for logging.
 */
function prettifyUrl(url, root) {
    url = removeTimestampQuery(url);
    const isAbsoluteFile = url.startsWith(root);
    if (isAbsoluteFile || url.startsWith(FS_PREFIX)) {
        let file = path__default.relative(root, isAbsoluteFile ? url : fsPathFromId(url));
        const seg = file.split('/');
        const npmIndex = seg.indexOf(`node_modules`);
        const isSourceMap = file.endsWith('.map');
        if (npmIndex > 0) {
            file = seg[npmIndex + 1];
            if (file.startsWith('@')) {
                file = `${file}/${seg[npmIndex + 2]}`;
            }
            file = `npm: ${colors__default.dim(file)}${isSourceMap ? ` (source map)` : ``}`;
        }
        return colors__default.dim(file);
    }
    else {
        return colors__default.dim(url);
    }
}
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function isDefined(value) {
    return value != null;
}
function lookupFile(dir, formats, options) {
    for (const format of formats) {
        const fullPath = path__default.join(dir, format);
        if (fs__default.existsSync(fullPath) && fs__default.statSync(fullPath).isFile()) {
            return (options === null || options === void 0 ? void 0 : options.pathOnly) ? fullPath : fs__default.readFileSync(fullPath, 'utf-8');
        }
    }
    const parentDir = path__default.dirname(dir);
    if (parentDir !== dir &&
        (!(options === null || options === void 0 ? void 0 : options.rootDir) || parentDir.startsWith(options === null || options === void 0 ? void 0 : options.rootDir))) {
        return lookupFile(parentDir, formats, options);
    }
}
const splitRE = /\r?\n/;
const range = 2;
function pad(source, n = 2) {
    const lines = source.split(splitRE);
    return lines.map((l) => ` `.repeat(n) + l).join(`\n`);
}
function posToNumber(source, pos) {
    if (typeof pos === 'number')
        return pos;
    const lines = source.split(splitRE);
    const { line, column } = pos;
    let start = 0;
    for (let i = 0; i < line - 1; i++) {
        if (lines[i]) {
            start += lines[i].length + 1;
        }
    }
    return start + column;
}
function numberToPos(source, offset) {
    if (typeof offset !== 'number')
        return offset;
    if (offset > source.length) {
        throw new Error(`offset is longer than source length! offset ${offset} > length ${source.length}`);
    }
    const lines = source.split(splitRE);
    let counted = 0;
    let line = 0;
    let column = 0;
    for (; line < lines.length; line++) {
        const lineLength = lines[line].length + 1;
        if (counted + lineLength >= offset) {
            column = offset - counted + 1;
            break;
        }
        counted += lineLength;
    }
    return { line: line + 1, column };
}
function generateCodeFrame(source, start = 0, end) {
    start = posToNumber(source, start);
    end = end || start;
    const lines = source.split(splitRE);
    let count = 0;
    const res = [];
    for (let i = 0; i < lines.length; i++) {
        count += lines[i].length + 1;
        if (count >= start) {
            for (let j = i - range; j <= i + range || end > count; j++) {
                if (j < 0 || j >= lines.length)
                    continue;
                const line = j + 1;
                res.push(`${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
                const lineLength = lines[j].length;
                if (j === i) {
                    // push underline
                    const pad = start - (count - lineLength) + 1;
                    const length = Math.max(1, end > count ? lineLength - pad : end - start);
                    res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length));
                }
                else if (j > i) {
                    if (end > count) {
                        const length = Math.max(Math.min(end - count, lineLength), 1);
                        res.push(`   |  ` + '^'.repeat(length));
                    }
                    count += lineLength + 1;
                }
            }
            break;
        }
    }
    return res.join('\n');
}
function writeFile(filename, content) {
    const dir = path__default.dirname(filename);
    if (!fs__default.existsSync(dir)) {
        fs__default.mkdirSync(dir, { recursive: true });
    }
    fs__default.writeFileSync(filename, content);
}
/**
 * Use instead of fs.existsSync(filename)
 * #2051 if we don't have read permission on a directory, existsSync() still
 * works and will result in massively slow subsequent checks (which are
 * unnecessary in the first place)
 */
function isFileReadable(filename) {
    try {
        const stat = fs__default.statSync(filename, { throwIfNoEntry: false });
        return !!stat;
    }
    catch {
        return false;
    }
}
/**
 * Delete every file and subdirectory. **The given directory must exist.**
 * Pass an optional `skip` array to preserve files in the root directory.
 */
function emptyDir(dir, skip) {
    for (const file of fs__default.readdirSync(dir)) {
        if (skip === null || skip === void 0 ? void 0 : skip.includes(file)) {
            continue;
        }
        const abs = path__default.resolve(dir, file);
        // baseline is Node 12 so can't use rmSync :(
        if (fs__default.lstatSync(abs).isDirectory()) {
            emptyDir(abs);
            fs__default.rmdirSync(abs);
        }
        else {
            fs__default.unlinkSync(abs);
        }
    }
}
function copyDir(srcDir, destDir) {
    fs__default.mkdirSync(destDir, { recursive: true });
    for (const file of fs__default.readdirSync(srcDir)) {
        const srcFile = path__default.resolve(srcDir, file);
        if (srcFile === destDir) {
            continue;
        }
        const destFile = path__default.resolve(destDir, file);
        const stat = fs__default.statSync(srcFile);
        if (stat.isDirectory()) {
            copyDir(srcFile, destFile);
        }
        else {
            fs__default.copyFileSync(srcFile, destFile);
        }
    }
}
function ensureWatchedFile(watcher, file, root) {
    if (file &&
        // only need to watch if out of root
        !file.startsWith(root + '/') &&
        // some rollup plugins use null bytes for private resolved Ids
        !file.includes('\0') &&
        fs__default.existsSync(file)) {
        // resolve file to normalized system path
        watcher.add(path__default.resolve(file));
    }
}
const escapedSpaceCharacters = /( |\\t|\\n|\\f|\\r)+/g;
async function processSrcSet(srcs, replacer) {
    const imageCandidates = srcs
        .split(',')
        .map((s) => {
        const [url, descriptor] = s
            .replace(escapedSpaceCharacters, ' ')
            .trim()
            .split(' ', 2);
        return { url, descriptor };
    })
        .filter(({ url }) => !!url);
    const ret = await Promise.all(imageCandidates.map(async ({ url, descriptor }) => {
        return {
            url: await replacer({ url, descriptor }),
            descriptor
        };
    }));
    return ret.reduce((prev, { url, descriptor }, index) => {
        descriptor !== null && descriptor !== void 0 ? descriptor : (descriptor = '');
        return (prev +=
            url + ` ${descriptor}${index === ret.length - 1 ? '' : ', '}`);
    }, '');
}
function escapeToLinuxLikePath(path) {
    if (/^[A-Z]:/.test(path)) {
        return path.replace(/^([A-Z]):\//, '/windows/$1/');
    }
    if (/^\/[^/]/.test(path)) {
        return `/linux${path}`;
    }
    return path;
}
function unescapeToLinuxLikePath(path) {
    if (path.startsWith('/linux/')) {
        return path.slice('/linux'.length);
    }
    if (path.startsWith('/windows/')) {
        return path.replace(/^\/windows\/([A-Z])\//, '$1:/');
    }
    return path;
}
// based on https://github.com/sveltejs/svelte/blob/abf11bb02b2afbd3e4cac509a0f70e318c306364/src/compiler/utils/mapped_code.ts#L221
const nullSourceMap = {
    names: [],
    sources: [],
    mappings: '',
    version: 3
};
function combineSourcemaps(filename, sourcemapList, excludeContent = true) {
    if (sourcemapList.length === 0 ||
        sourcemapList.every((m) => m.sources.length === 0)) {
        return { ...nullSourceMap };
    }
    // hack for parse broken with normalized absolute paths on windows (C:/path/to/something).
    // escape them to linux like paths
    // also avoid mutation here to prevent breaking plugin's using cache to generate sourcemaps like vue (see #7442)
    sourcemapList = sourcemapList.map((sourcemap) => {
        const newSourcemaps = { ...sourcemap };
        newSourcemaps.sources = sourcemap.sources.map((source) => source ? escapeToLinuxLikePath(source) : null);
        if (sourcemap.sourceRoot) {
            newSourcemaps.sourceRoot = escapeToLinuxLikePath(sourcemap.sourceRoot);
        }
        return newSourcemaps;
    });
    const escapedFilename = escapeToLinuxLikePath(filename);
    // We don't declare type here so we can convert/fake/map as RawSourceMap
    let map; //: SourceMap
    let mapIndex = 1;
    const useArrayInterface = sourcemapList.slice(0, -1).find((m) => m.sources.length !== 1) === undefined;
    if (useArrayInterface) {
        map = remapping__default(sourcemapList, () => null, excludeContent);
    }
    else {
        map = remapping__default(sourcemapList[0], function loader(sourcefile) {
            if (sourcefile === escapedFilename && sourcemapList[mapIndex]) {
                return sourcemapList[mapIndex++];
            }
            else {
                return null;
            }
        }, excludeContent);
    }
    if (!map.file) {
        delete map.file;
    }
    // unescape the previous hack
    map.sources = map.sources.map((source) => source ? unescapeToLinuxLikePath(source) : source);
    map.file = filename;
    return map;
}
function resolveHostname(optionsHost) {
    let host;
    if (optionsHost === undefined || optionsHost === false) {
        // Use a secure default
        host = '127.0.0.1';
    }
    else if (optionsHost === true) {
        // If passed --host in the CLI without arguments
        host = undefined; // undefined typically means 0.0.0.0 or :: (listen on all IPs)
    }
    else {
        host = optionsHost;
    }
    // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
    const name = (optionsHost !== '127.0.0.1' && host === '127.0.0.1') ||
        host === '0.0.0.0' ||
        host === '::' ||
        host === undefined
        ? 'localhost'
        : host;
    return { host, name };
}
function arraify(target) {
    return Array.isArray(target) ? target : [target];
}
function toUpperCaseDriveLetter(pathName) {
    return pathName.replace(/^\w:/, (letter) => letter.toUpperCase());
}
const multilineCommentsRE = /\/\*(.|[\r\n])*?\*\//gm;
const singlelineCommentsRE = /\/\/.*/g;
const usingDynamicImport = typeof jest === 'undefined';
/**
 * Dynamically import files. It will make sure it's not being compiled away by TS/Rollup.
 *
 * As a temporary workaround for Jest's lack of stable ESM support, we fallback to require
 * if we're in a Jest environment.
 * See https://github.com/vitejs/vite/pull/5197#issuecomment-938054077
 *
 * @param file File path to import.
 */
const dynamicImport = usingDynamicImport
    ? new Function('file', 'return import(file)')
    : require;
function parseRequest(id) {
    const { search } = url.parse(id);
    if (!search) {
        return null;
    }
    return Object.fromEntries(new url.URLSearchParams(search.slice(1)));
}
const blankReplacer$1 = (match) => ' '.repeat(match.length);

/* eslint no-console: 0 */
const LogLevels = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3
};
let lastType;
let lastMsg;
let sameCount = 0;
function clearScreen() {
    const repeatCount = process.stdout.rows - 2;
    const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : '';
    console.log(blank);
    readline__default.cursorTo(process.stdout, 0, 0);
    readline__default.clearScreenDown(process.stdout);
}
function createLogger(level = 'info', options = {}) {
    if (options.customLogger) {
        return options.customLogger;
    }
    const loggedErrors = new WeakSet();
    const { prefix = '[vite]', allowClearScreen = true } = options;
    const thresh = LogLevels[level];
    const canClearScreen = allowClearScreen && process.stdout.isTTY && !process.env.CI;
    const clear = canClearScreen ? clearScreen : () => { };
    function output(type, msg, options = {}) {
        if (thresh >= LogLevels[type]) {
            const method = type === 'info' ? 'log' : type;
            const format = () => {
                if (options.timestamp) {
                    const tag = type === 'info'
                        ? colors__default.cyan(colors__default.bold(prefix))
                        : type === 'warn'
                            ? colors__default.yellow(colors__default.bold(prefix))
                            : colors__default.red(colors__default.bold(prefix));
                    return `${colors__default.dim(new Date().toLocaleTimeString())} ${tag} ${msg}`;
                }
                else {
                    return msg;
                }
            };
            if (options.error) {
                loggedErrors.add(options.error);
            }
            if (canClearScreen) {
                if (type === lastType && msg === lastMsg) {
                    sameCount++;
                    clear();
                    console[method](format(), colors__default.yellow(`(x${sameCount + 1})`));
                }
                else {
                    sameCount = 0;
                    lastMsg = msg;
                    lastType = type;
                    if (options.clear) {
                        clear();
                    }
                    console[method](format());
                }
            }
            else {
                console[method](format());
            }
        }
    }
    const warnedMessages = new Set();
    const logger = {
        hasWarned: false,
        info(msg, opts) {
            output('info', msg, opts);
        },
        warn(msg, opts) {
            logger.hasWarned = true;
            output('warn', msg, opts);
        },
        warnOnce(msg, opts) {
            if (warnedMessages.has(msg))
                return;
            logger.hasWarned = true;
            output('warn', msg, opts);
            warnedMessages.add(msg);
        },
        error(msg, opts) {
            logger.hasWarned = true;
            output('error', msg, opts);
        },
        clearScreen(type) {
            if (thresh >= LogLevels[type]) {
                clear();
            }
        },
        hasErrorLogged(error) {
            return loggedErrors.has(error);
        }
    };
    return logger;
}
/**
 * @deprecated Use `server.printUrls()` instead
 */
function printHttpServerUrls(server, config) {
    printCommonServerUrls(server, config.server, config);
}
function printCommonServerUrls(server, options, config) {
    const address = server.address();
    const isAddressInfo = (x) => x === null || x === void 0 ? void 0 : x.address;
    if (isAddressInfo(address)) {
        const hostname = resolveHostname(options.host);
        const protocol = options.https ? 'https' : 'http';
        printServerUrls(hostname, protocol, address.port, config.base, config.logger.info);
    }
}
function printServerUrls(hostname, protocol, port, base, info) {
    if (hostname.host === '127.0.0.1') {
        const url = `${protocol}://${hostname.name}:${colors__default.bold(port)}${base}`;
        info(`  > Local: ${colors__default.cyan(url)}`);
        if (hostname.name !== '127.0.0.1') {
            info(`  > Network: ${colors__default.dim('use `--host` to expose')}`);
        }
    }
    else {
        Object.values(os__default.networkInterfaces())
            .flatMap((nInterface) => nInterface !== null && nInterface !== void 0 ? nInterface : [])
            .filter((detail) => detail &&
            detail.address &&
            // Node < v18
            ((typeof detail.family === 'string' && detail.family === 'IPv4') ||
                // Node >= v18
                (typeof detail.family === 'number' && detail.family === 4)))
            .map((detail) => {
            const type = detail.address.includes('127.0.0.1')
                ? 'Local:   '
                : 'Network: ';
            const host = detail.address.replace('127.0.0.1', hostname.name);
            const url = `${protocol}://${host}:${colors__default.bold(port)}${base}`;
            return `  > ${type} ${colors__default.cyan(url)}`;
        })
            .forEach((msg) => info(msg));
    }
}

const writeColors = {
    [0 /* JS */]: colors__default.cyan,
    [1 /* CSS */]: colors__default.magenta,
    [2 /* ASSET */]: colors__default.green,
    [3 /* HTML */]: colors__default.blue,
    [4 /* SOURCE_MAP */]: colors__default.gray
};
function buildReporterPlugin(config) {
    const compress = util.promisify(zlib.gzip);
    const chunkLimit = config.build.chunkSizeWarningLimit;
    function isLarge(code) {
        // bail out on particularly large chunks
        return code.length / 1024 > chunkLimit;
    }
    async function getCompressedSize(code) {
        if (config.build.ssr ||
            !config.build.reportCompressedSize ||
            config.build.brotliSize === false) {
            return '';
        }
        return ` / gzip: ${((await compress(typeof code === 'string' ? code : Buffer.from(code)))
            .length / 1024).toFixed(2)} KiB`;
    }
    function printFileInfo(filePath, content, type, maxLength, compressedSize = '') {
        const outDir = normalizePath(path__default.relative(config.root, path__default.resolve(config.root, config.build.outDir))) + '/';
        const kibs = content.length / 1024;
        const sizeColor = kibs > chunkLimit ? colors__default.yellow : colors__default.dim;
        config.logger.info(`${colors__default.gray(colors__default.white(colors__default.dim(outDir)))}${writeColors[type](filePath.padEnd(maxLength + 2))} ${sizeColor(`${kibs.toFixed(2)} KiB${compressedSize}`)}`);
    }
    const tty = process.stdout.isTTY && !process.env.CI;
    const shouldLogInfo = LogLevels[config.logLevel || 'info'] >= LogLevels.info;
    let hasTransformed = false;
    let hasRenderedChunk = false;
    let transformedCount = 0;
    let chunkCount = 0;
    const logTransform = throttle((id) => {
        writeLine(`transforming (${transformedCount}) ${colors__default.dim(path__default.relative(config.root, id))}`);
    });
    return {
        name: 'vite:reporter',
        transform(_, id) {
            transformedCount++;
            if (shouldLogInfo) {
                if (!tty) {
                    if (!hasTransformed) {
                        config.logger.info(`transforming...`);
                    }
                }
                else {
                    if (id.includes(`?`))
                        return;
                    logTransform(id);
                }
                hasTransformed = true;
            }
            return null;
        },
        buildEnd() {
            if (shouldLogInfo) {
                if (tty) {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                }
                config.logger.info(`${colors__default.green(`✓`)} ${transformedCount} modules transformed.`);
            }
        },
        renderStart() {
            chunkCount = 0;
        },
        renderChunk() {
            chunkCount++;
            if (shouldLogInfo) {
                if (!tty) {
                    if (!hasRenderedChunk) {
                        config.logger.info('rendering chunks...');
                    }
                }
                else {
                    writeLine(`rendering chunks (${chunkCount})...`);
                }
                hasRenderedChunk = true;
            }
            return null;
        },
        generateBundle() {
            if (shouldLogInfo && tty) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
            }
        },
        async writeBundle(_, output) {
            let hasLargeChunks = false;
            if (shouldLogInfo) {
                let longest = 0;
                for (const file in output) {
                    const l = output[file].fileName.length;
                    if (l > longest)
                        longest = l;
                }
                // large chunks are deferred to be logged at the end so they are more
                // visible.
                const deferredLogs = [];
                await Promise.all(Object.keys(output).map(async (file) => {
                    const chunk = output[file];
                    if (chunk.type === 'chunk') {
                        const log = async () => {
                            printFileInfo(chunk.fileName, chunk.code, 0 /* JS */, longest, await getCompressedSize(chunk.code));
                            if (chunk.map) {
                                printFileInfo(chunk.fileName + '.map', chunk.map.toString(), 4 /* SOURCE_MAP */, longest);
                            }
                        };
                        if (isLarge(chunk.code)) {
                            hasLargeChunks = true;
                            deferredLogs.push(log);
                        }
                        else {
                            await log();
                        }
                    }
                    else if (chunk.source) {
                        const isCSS = chunk.fileName.endsWith('.css');
                        const isMap = chunk.fileName.endsWith('.js.map');
                        printFileInfo(chunk.fileName, chunk.source, isCSS
                            ? 1 /* CSS */
                            : isMap
                                ? 4 /* SOURCE_MAP */
                                : 2 /* ASSET */, longest, isCSS ? await getCompressedSize(chunk.source) : undefined);
                    }
                }));
                await Promise.all(deferredLogs.map((l) => l()));
            }
            else {
                hasLargeChunks = Object.keys(output).some((file) => {
                    const chunk = output[file];
                    return chunk.type === 'chunk' && chunk.code.length / 1024 > chunkLimit;
                });
            }
            if (hasLargeChunks &&
                config.build.minify &&
                !config.build.lib &&
                !config.build.ssr) {
                config.logger.warn(colors__default.yellow(`\n(!) Some chunks are larger than ${chunkLimit} KiB after minification. Consider:\n` +
                    `- Using dynamic import() to code-split the application\n` +
                    `- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/guide/en/#outputmanualchunks\n` +
                    `- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.`));
            }
        }
    };
}
function writeLine(output) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    if (output.length < process.stdout.columns) {
        process.stdout.write(output);
    }
    else {
        process.stdout.write(output.substring(0, process.stdout.columns - 1));
    }
}
function throttle(fn) {
    let timerHandle = null;
    return (...args) => {
        if (timerHandle)
            return;
        fn(...args);
        timerHandle = setTimeout(() => {
            timerHandle = null;
        }, 100);
    };
}

const debug$a = createDebugger('vite:esbuild');
let server;
async function transformWithEsbuild(code, filename, options, inMap) {
    var _a;
    let loader = options === null || options === void 0 ? void 0 : options.loader;
    if (!loader) {
        // if the id ends with a valid ext, use it (e.g. vue blocks)
        // otherwise, cleanup the query before checking the ext
        const ext = path__default
            .extname(/\.\w+$/.test(filename) ? filename : cleanUrl(filename))
            .slice(1);
        if (ext === 'cjs' || ext === 'mjs') {
            loader = 'js';
        }
        else {
            loader = ext;
        }
    }
    let tsconfigRaw = options === null || options === void 0 ? void 0 : options.tsconfigRaw;
    // if options provide tsconfigraw in string, it takes highest precedence
    if (typeof tsconfigRaw !== 'string') {
        // these fields would affect the compilation result
        // https://esbuild.github.io/content-types/#tsconfig-json
        const meaningfulFields = [
            'target',
            'jsxFactory',
            'jsxFragmentFactory',
            'useDefineForClassFields',
            'importsNotUsedAsValues',
            'preserveValueImports'
        ];
        const compilerOptionsForFile = {};
        if (loader === 'ts' || loader === 'tsx') {
            const loadedTsconfig = await loadTsconfigJsonForFile(filename);
            const loadedCompilerOptions = (_a = loadedTsconfig.compilerOptions) !== null && _a !== void 0 ? _a : {};
            for (const field of meaningfulFields) {
                if (field in loadedCompilerOptions) {
                    // @ts-ignore TypeScript can't tell they are of the same type
                    compilerOptionsForFile[field] = loadedCompilerOptions[field];
                }
            }
        }
        tsconfigRaw = {
            ...tsconfigRaw,
            compilerOptions: {
                ...compilerOptionsForFile,
                ...tsconfigRaw === null || tsconfigRaw === void 0 ? void 0 : tsconfigRaw.compilerOptions
            }
        };
    }
    const resolvedOptions = {
        sourcemap: true,
        // ensure source file name contains full query
        sourcefile: filename,
        ...options,
        loader,
        tsconfigRaw
    };
    delete resolvedOptions.include;
    delete resolvedOptions.exclude;
    delete resolvedOptions.jsxInject;
    try {
        const result = await esbuild.transform(code, resolvedOptions);
        let map;
        if (inMap && resolvedOptions.sourcemap) {
            const nextMap = JSON.parse(result.map);
            nextMap.sourcesContent = [];
            map = combineSourcemaps(filename, [
                nextMap,
                inMap
            ]);
        }
        else {
            map = resolvedOptions.sourcemap
                ? JSON.parse(result.map)
                : { mappings: '' };
        }
        if (Array.isArray(map.sources)) {
            map.sources = map.sources.map((it) => toUpperCaseDriveLetter(it));
        }
        return {
            ...result,
            map
        };
    }
    catch (e) {
        debug$a(`esbuild error with options used: `, resolvedOptions);
        // patch error information
        if (e.errors) {
            e.frame = '';
            e.errors.forEach((m) => {
                e.frame += `\n` + prettifyMessage(m, code);
            });
            e.loc = e.errors[0].location;
        }
        throw e;
    }
}
function esbuildPlugin(options = {}) {
    const filter = pluginutils.createFilter(options.include || /\.(tsx?|jsx)$/, options.exclude || /\.js$/);
    return {
        name: 'vite:esbuild',
        configureServer(_server) {
            server = _server;
            server.watcher
                .on('add', reloadOnTsconfigChange)
                .on('change', reloadOnTsconfigChange)
                .on('unlink', reloadOnTsconfigChange);
        },
        async configResolved(config) {
            await initTSConfck(config);
        },
        buildEnd() {
            // recycle serve to avoid preventing Node self-exit (#6815)
            server = null;
        },
        async transform(code, id) {
            if (filter(id) || filter(cleanUrl(id))) {
                const result = await transformWithEsbuild(code, id, options);
                if (result.warnings.length) {
                    result.warnings.forEach((m) => {
                        this.warn(prettifyMessage(m, code));
                    });
                }
                if (options.jsxInject && /\.(?:j|t)sx\b/.test(id)) {
                    result.code = options.jsxInject + ';' + result.code;
                }
                return {
                    code: result.code,
                    map: result.map
                };
            }
        }
    };
}
const rollupToEsbuildFormatMap = {
    es: 'esm',
    cjs: 'cjs',
    // passing `var Lib = (() => {})()` to esbuild with format = "iife"
    // will turn it to `(() => { var Lib = (() => {})() })()`,
    // so we remove the format config to tell esbuild not doing this
    //
    // although esbuild doesn't change format, there is still possibility
    // that `{ treeShaking: true }` removes a top-level no-side-effect variable
    // like: `var Lib = 1`, which becomes `` after esbuild transforming,
    // but thankfully rollup does not do this optimization now
    iife: undefined
};
const buildEsbuildPlugin = (config) => {
    return {
        name: 'vite:esbuild-transpile',
        async configResolved(config) {
            await initTSConfck(config);
        },
        async renderChunk(code, chunk, opts) {
            // @ts-ignore injected by @vitejs/plugin-legacy
            if (opts.__vite_skip_esbuild__) {
                return null;
            }
            const target = config.build.target;
            const minify = config.build.minify === 'esbuild' &&
                // Do not minify ES lib output since that would remove pure annotations
                // and break tree-shaking
                // https://github.com/vuejs/core/issues/2860#issuecomment-926882793
                !(config.build.lib && opts.format === 'es');
            if ((!target || target === 'esnext') && !minify) {
                return null;
            }
            const res = await transformWithEsbuild(code, chunk.fileName, {
                ...config.esbuild,
                target: target || undefined,
                ...(minify
                    ? {
                        minify,
                        treeShaking: true,
                        format: rollupToEsbuildFormatMap[opts.format]
                    }
                    : undefined)
            });
            return res;
        }
    };
};
function prettifyMessage(m, code) {
    let res = colors__default.yellow(m.text);
    if (m.location) {
        const lines = code.split(/\r?\n/g);
        const line = Number(m.location.line);
        const column = Number(m.location.column);
        const offset = lines
            .slice(0, line - 1)
            .map((l) => l.length)
            .reduce((total, l) => total + l + 1, 0) + column;
        res += `\n` + generateCodeFrame(code, offset, offset + 1);
    }
    return res + `\n`;
}
const tsconfckParseOptions = {
    cache: new Map(),
    tsConfigPaths: undefined,
    root: undefined,
    resolveWithEmptyIfConfigNotFound: true
};
async function initTSConfck(config) {
    tsconfckParseOptions.cache.clear();
    const workspaceRoot = searchForWorkspaceRoot(config.root);
    tsconfckParseOptions.root = workspaceRoot;
    tsconfckParseOptions.tsConfigPaths = new Set([
        ...(await tsconfck.findAll(workspaceRoot, {
            skip: (dir) => dir === 'node_modules' || dir === '.git'
        }))
    ]);
}
async function loadTsconfigJsonForFile(filename) {
    try {
        const result = await tsconfck.parse(filename, tsconfckParseOptions);
        // tsconfig could be out of root, make sure it is watched on dev
        if (server && result.tsconfigFile !== 'no_tsconfig_file_found') {
            ensureWatchedFile(server.watcher, result.tsconfigFile, server.config.root);
        }
        return result.tsconfig;
    }
    catch (e) {
        if (e instanceof tsconfck.TSConfckParseError) {
            // tsconfig could be out of root, make sure it is watched on dev
            if (server && e.tsconfigFile) {
                ensureWatchedFile(server.watcher, e.tsconfigFile, server.config.root);
            }
        }
        throw e;
    }
}
function reloadOnTsconfigChange(changedFile) {
    var _a;
    // any tsconfig.json that's added in the workspace could be closer to a code file than a previously cached one
    // any json file in the tsconfig cache could have been used to compile ts
    if (path__default.basename(changedFile) === 'tsconfig.json' ||
        (changedFile.endsWith('.json') &&
            ((_a = tsconfckParseOptions === null || tsconfckParseOptions === void 0 ? void 0 : tsconfckParseOptions.cache) === null || _a === void 0 ? void 0 : _a.has(changedFile)))) {
        server.config.logger.info(`changed tsconfig file detected: ${changedFile} - Clearing cache and forcing full-reload to ensure typescript is compiled with updated config values.`, { clear: server.config.clearScreen, timestamp: true });
        // clear module graph to remove code compiled with outdated config
        server.moduleGraph.invalidateAll();
        // reset tsconfck so that recompile works with up2date configs
        initTSConfck(server.config).finally(() => {
            // force full reload
            server.ws.send({
                type: 'full-reload',
                path: '*'
            });
        });
    }
}

function terserPlugin(config) {
    const makeWorker = () => new okie.Worker((basedir, code, options) => {
        // when vite is linked, the worker thread won't share the same resolve
        // root with vite itself, so we have to pass in the basedir and resolve
        // terser first.
        // eslint-disable-next-line node/no-restricted-require
        const terserPath = require.resolve('terser', {
            paths: [basedir]
        });
        return require(terserPath).minify(code, options);
    });
    let worker;
    return {
        name: 'vite:terser',
        async renderChunk(code, _chunk, outputOptions) {
            // This plugin is included for any non-false value of config.build.minify,
            // so that normal chunks can use the preferred minifier, and legacy chunks
            // can use terser.
            if (config.build.minify !== 'terser' &&
                // @ts-ignore injected by @vitejs/plugin-legacy
                !outputOptions.__vite_force_terser__) {
                return null;
            }
            // Do not minify ES lib output since that would remove pure annotations
            // and break tree-shaking.
            if (config.build.lib && outputOptions.format === 'es') {
                return null;
            }
            // Lazy load worker.
            worker || (worker = makeWorker());
            const res = await worker.run(__dirname, code, {
                safari10: true,
                ...config.build.terserOptions,
                sourceMap: !!outputOptions.sourcemap,
                module: outputOptions.format.startsWith('es'),
                toplevel: outputOptions.format === 'cjs'
            });
            return {
                code: res.code,
                map: res.map
            };
        },
        closeBundle() {
            worker === null || worker === void 0 ? void 0 : worker.stop();
        }
    };
}

function manifestPlugin(config) {
    const manifest = {};
    let outputCount;
    return {
        name: 'vite:manifest',
        buildStart() {
            outputCount = 0;
        },
        generateBundle({ format }, bundle) {
            var _a;
            function getChunkName(chunk) {
                if (chunk.facadeModuleId) {
                    let name = normalizePath(path__default.relative(config.root, chunk.facadeModuleId));
                    if (format === 'system' && !chunk.name.includes('-legacy')) {
                        const ext = path__default.extname(name);
                        name = name.slice(0, -ext.length) + `-legacy` + ext;
                    }
                    return name.replace(/\0/g, '');
                }
                else {
                    return `_` + path__default.basename(chunk.fileName);
                }
            }
            function getInternalImports(imports) {
                const filteredImports = [];
                for (const file of imports) {
                    if (bundle[file] === undefined) {
                        continue;
                    }
                    filteredImports.push(getChunkName(bundle[file]));
                }
                return filteredImports;
            }
            function createChunk(chunk) {
                const manifestChunk = {
                    file: chunk.fileName
                };
                if (chunk.facadeModuleId) {
                    manifestChunk.src = getChunkName(chunk);
                }
                if (chunk.isEntry) {
                    manifestChunk.isEntry = true;
                }
                if (chunk.isDynamicEntry) {
                    manifestChunk.isDynamicEntry = true;
                }
                if (chunk.imports.length) {
                    const internalImports = getInternalImports(chunk.imports);
                    if (internalImports.length > 0) {
                        manifestChunk.imports = internalImports;
                    }
                }
                if (chunk.dynamicImports.length) {
                    const internalImports = getInternalImports(chunk.dynamicImports);
                    if (internalImports.length > 0) {
                        manifestChunk.dynamicImports = internalImports;
                    }
                }
                if (chunk.viteMetadata.importedCss.size) {
                    manifestChunk.css = [...chunk.viteMetadata.importedCss];
                }
                if (chunk.viteMetadata.importedAssets.size) {
                    manifestChunk.assets = [...chunk.viteMetadata.importedAssets];
                }
                return manifestChunk;
            }
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk') {
                    manifest[getChunkName(chunk)] = createChunk(chunk);
                }
            }
            outputCount++;
            const output = (_a = config.build.rollupOptions) === null || _a === void 0 ? void 0 : _a.output;
            const outputLength = Array.isArray(output) ? output.length : 1;
            if (outputCount >= outputLength) {
                this.emitFile({
                    fileName: typeof config.build.manifest === 'string'
                        ? config.build.manifest
                        : 'manifest.json',
                    type: 'asset',
                    source: JSON.stringify(manifest, null, 2)
                });
            }
        }
    };
}

const dataUriRE = /^([^/]+\/[^;,]+)(;base64)?,([\s\S]*)$/;
const dataUriPrefix = `/@data-uri/`;
/**
 * Build only, since importing from a data URI works natively.
 */
function dataURIPlugin() {
    let resolved;
    return {
        name: 'vite:data-uri',
        buildStart() {
            resolved = {};
        },
        resolveId(id) {
            if (!dataUriRE.test(id)) {
                return null;
            }
            const uri = new url.URL(id);
            if (uri.protocol !== 'data:') {
                return null;
            }
            const match = uri.pathname.match(dataUriRE);
            if (!match) {
                return null;
            }
            const [, mime, format, data] = match;
            if (mime !== 'text/javascript') {
                throw new Error(`data URI with non-JavaScript mime type is not supported.`);
            }
            // decode data
            const base64 = format && /base64/i.test(format.substring(1));
            const content = base64
                ? Buffer.from(data, 'base64').toString('utf-8')
                : data;
            resolved[id] = content;
            return dataUriPrefix + id;
        },
        load(id) {
            if (id.startsWith(dataUriPrefix)) {
                id = id.slice(dataUriPrefix.length);
                return resolved[id] || null;
            }
        }
    };
}

const assetUrlRE = /__VITE_ASSET__([a-z\d]{8})__(?:\$_(.*?)__)?/g;
const rawRE = /(\?|&)raw(?:&|$)/;
const urlRE = /(\?|&)url(?:&|$)/;
const assetCache = new WeakMap();
const assetHashToFilenameMap = new WeakMap();
// save hashes of the files that has been emitted in build watch
const emittedHashMap = new WeakMap();
/**
 * Also supports loading plain strings with import text from './foo.txt?raw'
 */
function assetPlugin(config) {
    // assetHashToFilenameMap initialization in buildStart causes getAssetFilename to return undefined
    assetHashToFilenameMap.set(config, new Map());
    // add own dictionary entry by directly assigning mrmine
    // https://github.com/lukeed/mrmime/issues/3
    mrmime__namespace.mimes['ico'] = 'image/x-icon';
    return {
        name: 'vite:asset',
        buildStart() {
            assetCache.set(config, new Map());
            emittedHashMap.set(config, new Set());
        },
        resolveId(id) {
            if (!config.assetsInclude(cleanUrl(id))) {
                return;
            }
            // imports to absolute urls pointing to files in /public
            // will fail to resolve in the main resolver. handle them here.
            const publicFile = checkPublicFile(id, config);
            if (publicFile) {
                return id;
            }
        },
        async load(id) {
            if (id.startsWith('\0')) {
                // Rollup convention, this id should be handled by the
                // plugin that marked it with \0
                return;
            }
            // raw requests, read from disk
            if (rawRE.test(id)) {
                const file = checkPublicFile(id, config) || cleanUrl(id);
                // raw query, read file and return as string
                return `export default ${JSON.stringify(await fs.promises.readFile(file, 'utf-8'))}`;
            }
            if (!config.assetsInclude(cleanUrl(id)) && !urlRE.test(id)) {
                return;
            }
            id = id.replace(urlRE, '$1').replace(/[\?&]$/, '');
            const url = await fileToUrl(id, config, this);
            return `export default ${JSON.stringify(url)}`;
        },
        renderChunk(code, chunk) {
            let match;
            let s;
            // Urls added with JS using e.g.
            // imgElement.src = "my/file.png" are using quotes
            // Urls added in CSS that is imported in JS end up like
            // var inlined = ".inlined{color:green;background:url(__VITE_ASSET__5aa0ddc0__)}\n";
            // In both cases, the wrapping should already be fine
            while ((match = assetUrlRE.exec(code))) {
                s = s || (s = new MagicString__default(code));
                const [full, hash, postfix = ''] = match;
                // some internal plugins may still need to emit chunks (e.g. worker) so
                // fallback to this.getFileName for that.
                const file = getAssetFilename(hash, config) || this.getFileName(hash);
                chunk.viteMetadata.importedAssets.add(cleanUrl(file));
                const outputFilepath = config.base + file + postfix;
                s.overwrite(match.index, match.index + full.length, outputFilepath, {
                    contentOnly: true
                });
            }
            if (s) {
                return {
                    code: s.toString(),
                    map: config.build.sourcemap ? s.generateMap({ hires: true }) : null
                };
            }
            else {
                return null;
            }
        },
        generateBundle(_, bundle) {
            // do not emit assets for SSR build
            if (config.command === 'build' && config.build.ssr) {
                for (const file in bundle) {
                    if (bundle[file].type === 'asset' &&
                        !file.includes('ssr-manifest.json')) {
                        delete bundle[file];
                    }
                }
            }
        }
    };
}
function checkPublicFile(url, { publicDir }) {
    // note if the file is in /public, the resolver would have returned it
    // as-is so it's not going to be a fully resolved path.
    if (!publicDir || !url.startsWith('/')) {
        return;
    }
    const publicFile = path__default.join(publicDir, cleanUrl(url));
    if (fs__default.existsSync(publicFile)) {
        return publicFile;
    }
    else {
        return;
    }
}
async function fileToUrl(id, config, ctx) {
    if (config.command === 'serve') {
        return fileToDevUrl(id, config);
    }
    else {
        return fileToBuiltUrl(id, config, ctx);
    }
}
function fileToDevUrl(id, config) {
    var _a, _b;
    let rtn;
    if (checkPublicFile(id, config)) {
        // in public dir, keep the url as-is
        rtn = id;
    }
    else if (id.startsWith(config.root)) {
        // in project root, infer short public path
        rtn = '/' + path__default.posix.relative(config.root, id);
    }
    else {
        // outside of project root, use absolute fs path
        // (this is special handled by the serve static middleware
        rtn = path__default.posix.join(FS_PREFIX + id);
    }
    const origin = (_b = (_a = config.server) === null || _a === void 0 ? void 0 : _a.origin) !== null && _b !== void 0 ? _b : '';
    return origin + config.base + rtn.replace(/^\//, '');
}
function getAssetFilename(hash, config) {
    var _a;
    return (_a = assetHashToFilenameMap.get(config)) === null || _a === void 0 ? void 0 : _a.get(hash);
}
/**
 * converts the source filepath of the asset to the output filename based on the assetFileNames option. \
 * this function imitates the behavior of rollup.js. \
 * https://rollupjs.org/guide/en/#outputassetfilenames
 *
 * @example
 * ```ts
 * const content = Buffer.from('text');
 * const fileName = assetFileNamesToFileName(
 *   'assets/[name].[hash][extname]',
 *   '/path/to/file.txt',
 *   getAssetHash(content),
 *   content
 * )
 * // fileName: 'assets/file.982d9e3e.txt'
 * ```
 *
 * @param assetFileNames filename pattern. e.g. `'assets/[name].[hash][extname]'`
 * @param file filepath of the asset
 * @param contentHash hash of the asset. used for `'[hash]'` placeholder
 * @param content content of the asset. passed to `assetFileNames` if `assetFileNames` is a function
 * @returns output filename
 */
function assetFileNamesToFileName(assetFileNames, file, contentHash, content) {
    const basename = path__default.basename(file);
    // placeholders for `assetFileNames`
    // `hash` is slightly different from the rollup's one
    const extname = path__default.extname(basename);
    const ext = extname.substring(1);
    const name = basename.slice(0, -extname.length);
    const hash = contentHash;
    if (typeof assetFileNames === 'function') {
        assetFileNames = assetFileNames({
            name: file,
            source: content,
            type: 'asset'
        });
        if (typeof assetFileNames !== 'string') {
            throw new TypeError('assetFileNames must return a string');
        }
    }
    else if (typeof assetFileNames !== 'string') {
        throw new TypeError('assetFileNames must be a string or a function');
    }
    const fileName = assetFileNames.replace(/\[\w+\]/g, (placeholder) => {
        switch (placeholder) {
            case '[ext]':
                return ext;
            case '[extname]':
                return extname;
            case '[hash]':
                return hash;
            case '[name]':
                return name;
        }
        throw new Error(`invalid placeholder ${placeholder} in assetFileNames "${assetFileNames}"`);
    });
    return fileName;
}
/**
 * Register an asset to be emitted as part of the bundle (if necessary)
 * and returns the resolved public URL
 */
async function fileToBuiltUrl(id, config, pluginContext, skipPublicCheck = false) {
    var _a, _b, _c;
    if (!skipPublicCheck && checkPublicFile(id, config)) {
        return config.base + id.slice(1);
    }
    const cache = assetCache.get(config);
    const cached = cache.get(id);
    if (cached) {
        return cached;
    }
    const file = cleanUrl(id);
    const content = await fs.promises.readFile(file);
    let url$1;
    if (config.build.lib ||
        (!file.endsWith('.svg') &&
            content.length < Number(config.build.assetsInlineLimit))) {
        // base64 inlined as a string
        url$1 = `data:${mrmime__namespace.lookup(file)};base64,${content.toString('base64')}`;
    }
    else {
        // emit as asset
        // rollup supports `import.meta.ROLLUP_FILE_URL_*`, but it generates code
        // that uses runtime url sniffing and it can be verbose when targeting
        // non-module format. It also fails to cascade the asset content change
        // into the chunk's hash, so we have to do our own content hashing here.
        // https://bundlers.tooling.report/hashing/asset-cascade/
        // https://github.com/rollup/rollup/issues/3415
        const map = assetHashToFilenameMap.get(config);
        const contentHash = getAssetHash(content);
        const { search, hash } = url.parse(id);
        const postfix = (search || '') + (hash || '');
        const output = (_b = (_a = config.build) === null || _a === void 0 ? void 0 : _a.rollupOptions) === null || _b === void 0 ? void 0 : _b.output;
        const assetFileNames = (_c = (output && !Array.isArray(output) ? output.assetFileNames : undefined)) !== null && _c !== void 0 ? _c : 
        // defaults to '<assetsDir>/[name].[hash][extname]'
        // slightly different from rollup's one ('assets/[name]-[hash][extname]')
        path__default.posix.join(config.build.assetsDir, '[name].[hash][extname]');
        const fileName = assetFileNamesToFileName(assetFileNames, file, contentHash, content);
        if (!map.has(contentHash)) {
            map.set(contentHash, fileName);
        }
        const emittedSet = emittedHashMap.get(config);
        if (!emittedSet.has(contentHash)) {
            const name = normalizePath(path__default.relative(config.root, file));
            pluginContext.emitFile({
                name,
                fileName,
                type: 'asset',
                source: content
            });
            emittedSet.add(contentHash);
        }
        url$1 = `__VITE_ASSET__${contentHash}__${postfix ? `$_${postfix}__` : ``}`;
    }
    cache.set(id, url$1);
    return url$1;
}
function getAssetHash(content) {
    return require$$1.createHash('sha256').update(content).digest('hex').slice(0, 8);
}
async function urlToBuiltUrl(url, importer, config, pluginContext) {
    if (checkPublicFile(url, config)) {
        return config.base + url.slice(1);
    }
    const file = url.startsWith('/')
        ? path__default.join(config.root, url)
        : path__default.join(path__default.dirname(importer), url);
    return fileToBuiltUrl(file, config, pluginContext, 
    // skip public check since we just did it above
    true);
}

const modulePreloadPolyfillId = 'vite/modulepreload-polyfill';
function modulePreloadPolyfillPlugin(config) {
    // `isModernFlag` is only available during build since it is resolved by `vite:build-import-analysis`
    const skip = config.command !== 'build' || config.build.ssr;
    let polyfillString;
    return {
        name: 'vite:modulepreload-polyfill',
        resolveId(id) {
            if (id === modulePreloadPolyfillId) {
                return id;
            }
        },
        load(id) {
            if (id === modulePreloadPolyfillId) {
                if (skip) {
                    return '';
                }
                if (!polyfillString) {
                    polyfillString =
                        `const p = ${polyfill.toString()};` + `${isModernFlag}&&p();`;
                }
                return polyfillString;
            }
        }
    };
}
function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(script) {
        const fetchOpts = {};
        if (script.integrity)
            fetchOpts.integrity = script.integrity;
        if (script.referrerpolicy)
            fetchOpts.referrerPolicy = script.referrerpolicy;
        if (script.crossorigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (script.crossorigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
}

// bank on the non-overlapping nature of regex matches and combine all filters into one giant regex
// /`([^`\$\{\}]|\$\{(`|\g<1>)*\})*`/g can match nested string template
// but js not support match expression(\g<0>). so clean string template(`...`) in other ways.
const stringsRE = /"([^"\r\n]|(?<=\\)")*"|'([^'\r\n]|(?<=\\)')*'/.source;
const commentsRE = /\/\*(.|[\r\n])*?\*\/|\/\/.*/.source;
const cleanerRE = new RegExp(`${stringsRE}|${commentsRE}`, 'g');
const blankReplacer = (s) => ' '.repeat(s.length);
const stringBlankReplacer = (s) => `${s[0]}${'\0'.repeat(s.length - 2)}${s[0]}`;
function emptyString(raw) {
    let res = raw.replace(cleanerRE, (s) => s[0] === '/' ? blankReplacer(s) : stringBlankReplacer(s));
    let lastEnd = 0;
    let start = 0;
    while ((start = res.indexOf('`', lastEnd)) >= 0) {
        let clean;
        [clean, lastEnd] = lexStringTemplateExpression(res, start);
        res = replaceAt(res, start, lastEnd, clean);
    }
    return res;
}
function replaceAt(string, start, end, replacement) {
    return string.slice(0, start) + replacement + string.slice(end);
}
/**
 * lex string template and clean it.
 */
function lexStringTemplateExpression(code, start) {
    let state = 0 /* inTemplateString */;
    let clean = '`';
    const opStack = [state];
    function pushStack(newState) {
        state = newState;
        opStack.push(state);
    }
    function popStack() {
        opStack.pop();
        state = opStack[opStack.length - 1];
    }
    let i = start + 1;
    outer: for (; i < code.length; i++) {
        const char = code.charAt(i);
        switch (state) {
            case 0 /* inTemplateString */:
                if (char === '$' && code.charAt(i + 1) === '{') {
                    pushStack(1 /* inInterpolationExpression */);
                    clean += '${';
                    i++; // jump next
                }
                else if (char === '`') {
                    popStack();
                    clean += char;
                    if (opStack.length === 0) {
                        break outer;
                    }
                }
                else {
                    clean += '\0';
                }
                break;
            case 1 /* inInterpolationExpression */:
                if (char === '{') {
                    pushStack(2 /* inObjectExpression */);
                    clean += char;
                }
                else if (char === '}') {
                    popStack();
                    clean += char;
                }
                else if (char === '`') {
                    pushStack(0 /* inTemplateString */);
                    clean += char;
                }
                else {
                    clean += char;
                }
                break;
            case 2 /* inObjectExpression */:
                if (char === '}') {
                    popStack();
                    clean += char;
                }
                else if (char === '`') {
                    pushStack(0 /* inTemplateString */);
                    clean += char;
                }
                else {
                    clean += char;
                }
                break;
            default:
                throw new Error('unknown string template lexer state');
        }
    }
    if (opStack.length !== 0) {
        error$2(start);
    }
    return [clean, i + 1];
}
function error$2(pos) {
    const err = new Error(`can not match string template expression.`);
    err.pos = pos;
    throw err;
}

const htmlProxyRE$1 = /\?html-proxy=?[&inline\-css]*&index=(\d+)\.(js|css)$/;
const inlineCSSRE$1 = /__VITE_INLINE_CSS__([^_]+_\d+)__/g;
// Do not allow preceding '.', but do allow preceding '...' for spread operations
const inlineImportRE = /(?<!(?<!\.\.)\.)\bimport\s*\(("([^"]|(?<=\\)")*"|'([^']|(?<=\\)')*')\)/g;
const htmlLangRE = /\.(html|htm)$/;
const isHTMLProxy = (id) => htmlProxyRE$1.test(id);
const isHTMLRequest = (request) => htmlLangRE.test(request);
// HTML Proxy Caches are stored by config -> filePath -> index
const htmlProxyMap = new WeakMap();
// HTML Proxy Transform result are stored by config
// `${importer}_${query.index}` -> transformed css code
// PS: key like `/vite/packages/playground/assets/index.html_1`
const htmlProxyResult = new Map();
function htmlInlineProxyPlugin(config) {
    // Should do this when `constructor` rather than when `buildStart`,
    // `buildStart` will be triggered multiple times then the cached result will be emptied.
    // https://github.com/vitejs/vite/issues/6372
    htmlProxyMap.set(config, new Map());
    return {
        name: 'vite:html-inline-proxy',
        resolveId(id) {
            if (htmlProxyRE$1.test(id)) {
                return id;
            }
        },
        load(id) {
            const proxyMatch = id.match(htmlProxyRE$1);
            if (proxyMatch) {
                const index = Number(proxyMatch[1]);
                const file = cleanUrl(id);
                const url = file.replace(normalizePath(config.root), '');
                const result = htmlProxyMap.get(config).get(url)[index];
                if (result) {
                    return result;
                }
                else {
                    throw new Error(`No matching HTML proxy module found from ${id}`);
                }
            }
        }
    };
}
function addToHTMLProxyCache(config, filePath, index, result) {
    if (!htmlProxyMap.get(config)) {
        htmlProxyMap.set(config, new Map());
    }
    if (!htmlProxyMap.get(config).get(filePath)) {
        htmlProxyMap.get(config).set(filePath, []);
    }
    htmlProxyMap.get(config).get(filePath)[index] = result;
}
function addToHTMLProxyTransformResult(hash, code) {
    htmlProxyResult.set(hash, code);
}
// this extends the config in @vue/compiler-sfc with <link href>
const assetAttrsConfig = {
    link: ['href'],
    video: ['src', 'poster'],
    source: ['src', 'srcset'],
    img: ['src', 'srcset'],
    image: ['xlink:href', 'href'],
    use: ['xlink:href', 'href']
};
const isAsyncScriptMap = new WeakMap();
async function traverseHtml(html, filePath, visitor) {
    // lazy load compiler
    const { parse, transform } = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('@vue/compiler-dom')); });
    // @vue/compiler-core doesn't like lowercase doctypes
    html = html.replace(/<!doctype\s/i, '<!DOCTYPE ');
    try {
        const ast = parse(html, { comments: true });
        transform(ast, {
            nodeTransforms: [visitor]
        });
    }
    catch (e) {
        handleParseError(e, html, filePath);
    }
}
function getScriptInfo(node) {
    let src;
    let isModule = false;
    let isAsync = false;
    for (let i = 0; i < node.props.length; i++) {
        const p = node.props[i];
        if (p.type === 6 /* ATTRIBUTE */) {
            if (p.name === 'src') {
                src = p;
            }
            else if (p.name === 'type' && p.value && p.value.content === 'module') {
                isModule = true;
            }
            else if (p.name === 'async') {
                isAsync = true;
            }
        }
    }
    return { src, isModule, isAsync };
}
/**
 * Format Vue @type {CompilerError} to @type {RollupError}
 */
function formatParseError(compilerError, id, html) {
    const formattedError = { ...compilerError };
    if (compilerError.loc) {
        formattedError.frame = generateCodeFrame(html, compilerError.loc.start.offset);
        formattedError.loc = {
            file: id,
            line: compilerError.loc.start.line,
            column: compilerError.loc.start.column
        };
    }
    return formattedError;
}
function handleParseError(compilerError, html, filePath) {
    const parseError = {
        loc: filePath,
        frame: '',
        ...formatParseError(compilerError, filePath, html)
    };
    throw new Error(`Unable to parse HTML; ${compilerError.message}\n at ${JSON.stringify(parseError.loc)}\n${parseError.frame}`);
}
/**
 * Compiles index.html into an entry js module
 */
function buildHtmlPlugin(config) {
    const [preHooks, postHooks] = resolveHtmlTransforms(config.plugins);
    const processedHtml = new Map();
    const isExcludedUrl = (url) => url.startsWith('#') ||
        isExternalUrl(url) ||
        isDataUrl(url) ||
        checkPublicFile(url, config);
    // Same reason with `htmlInlineProxyPlugin`
    isAsyncScriptMap.set(config, new Map());
    return {
        name: 'vite:build-html',
        async transform(html, id) {
            var _a, _b;
            if (id.endsWith('.html')) {
                const publicPath = `/${slash(path__default.relative(config.root, id))}`;
                // pre-transform
                html = await applyHtmlTransforms(html, preHooks, {
                    path: publicPath,
                    filename: id
                });
                let js = '';
                const s = new MagicString__default(html);
                const assetUrls = [];
                const scriptUrls = [];
                let inlineModuleIndex = -1;
                let everyScriptIsAsync = true;
                let someScriptsAreAsync = false;
                let someScriptsAreDefer = false;
                await traverseHtml(html, id, (node) => {
                    if (node.type !== 1 /* ELEMENT */) {
                        return;
                    }
                    let shouldRemove = false;
                    // script tags
                    if (node.tag === 'script') {
                        const { src, isModule, isAsync } = getScriptInfo(node);
                        const url = src && src.value && src.value.content;
                        const isPublicFile = !!(url && checkPublicFile(url, config));
                        if (isPublicFile) {
                            // referencing public dir url, prefix with base
                            s.overwrite(src.value.loc.start.offset, src.value.loc.end.offset, `"${config.base + url.slice(1)}"`, { contentOnly: true });
                        }
                        if (isModule) {
                            inlineModuleIndex++;
                            if (url && !isExcludedUrl(url)) {
                                // <script type="module" src="..."/>
                                // add it as an import
                                js += `\nimport ${JSON.stringify(url)}`;
                                shouldRemove = true;
                            }
                            else if (node.children.length) {
                                const contents = node.children
                                    .map((child) => child.content || '')
                                    .join('');
                                // <script type="module">...</script>
                                const filePath = id.replace(normalizePath(config.root), '');
                                addToHTMLProxyCache(config, filePath, inlineModuleIndex, {
                                    code: contents
                                });
                                js += `\nimport "${id}?html-proxy&index=${inlineModuleIndex}.js"`;
                                shouldRemove = true;
                            }
                            everyScriptIsAsync && (everyScriptIsAsync = isAsync);
                            someScriptsAreAsync || (someScriptsAreAsync = isAsync);
                            someScriptsAreDefer || (someScriptsAreDefer = !isAsync);
                        }
                        else if (url && !isPublicFile) {
                            if (!isExcludedUrl(url)) {
                                config.logger.warn(`<script src="${url}"> in "${publicPath}" can't be bundled without type="module" attribute`);
                            }
                        }
                        else if (node.children.length) {
                            const scriptNode = node.children.pop();
                            const cleanCode = emptyString(scriptNode.content);
                            let match;
                            while ((match = inlineImportRE.exec(cleanCode))) {
                                const { 1: url, index } = match;
                                const startUrl = cleanCode.indexOf(url, index);
                                const start = startUrl + 1;
                                const end = start + url.length - 2;
                                scriptUrls.push({
                                    start: start + scriptNode.loc.start.offset,
                                    end: end + scriptNode.loc.start.offset,
                                    url: scriptNode.content.slice(start, end)
                                });
                            }
                        }
                    }
                    // For asset references in index.html, also generate an import
                    // statement for each - this will be handled by the asset plugin
                    const assetAttrs = assetAttrsConfig[node.tag];
                    if (assetAttrs) {
                        for (const p of node.props) {
                            if (p.type === 6 /* ATTRIBUTE */ &&
                                p.value &&
                                assetAttrs.includes(p.name)) {
                                // assetsUrl may be encodeURI
                                const url = decodeURI(p.value.content);
                                if (!isExcludedUrl(url)) {
                                    if (node.tag === 'link' && isCSSRequest(url)) {
                                        // CSS references, convert to import
                                        js += `\nimport ${JSON.stringify(url)}`;
                                        shouldRemove = true;
                                    }
                                    else {
                                        assetUrls.push(p);
                                    }
                                }
                                else if (checkPublicFile(url, config)) {
                                    s.overwrite(p.value.loc.start.offset, p.value.loc.end.offset, `"${config.base + url.slice(1)}"`, { contentOnly: true });
                                }
                            }
                        }
                    }
                    // <tag style="... url(...) ..."></tag>
                    // extract inline styles as virtual css and add class attribute to tag for selecting
                    const inlineStyle = node.props.find((prop) => prop.name === 'style' &&
                        prop.type === 6 /* ATTRIBUTE */ &&
                        prop.value &&
                        prop.value.content.includes('url(') // only url(...) in css need to emit file
                    );
                    if (inlineStyle) {
                        inlineModuleIndex++;
                        // replace `inline style` to class
                        // and import css in js code
                        const styleNode = inlineStyle.value;
                        const code = styleNode.content;
                        const filePath = id.replace(normalizePath(config.root), '');
                        addToHTMLProxyCache(config, filePath, inlineModuleIndex, { code });
                        // will transform with css plugin and cache result with css-post plugin
                        js += `\nimport "${id}?html-proxy&inline-css&index=${inlineModuleIndex}.css"`;
                        // will transform in `applyHtmlTransforms`
                        s.overwrite(styleNode.loc.start.offset, styleNode.loc.end.offset, `"__VITE_INLINE_CSS__${cleanUrl(id)}_${inlineModuleIndex}__"`, { contentOnly: true });
                    }
                    // <style>...</style>
                    if (node.tag === 'style' && node.children.length) {
                        const styleNode = node.children.pop();
                        const filePath = id.replace(normalizePath(config.root), '');
                        inlineModuleIndex++;
                        addToHTMLProxyCache(config, filePath, inlineModuleIndex, {
                            code: styleNode.content
                        });
                        js += `\nimport "${id}?html-proxy&inline-css&index=${inlineModuleIndex}.css"`;
                        // will transform in `applyHtmlTransforms`
                        s.overwrite(styleNode.loc.start.offset, styleNode.loc.end.offset, `__VITE_INLINE_CSS__${cleanUrl(id)}_${inlineModuleIndex}__`, { contentOnly: true });
                    }
                    if (shouldRemove) {
                        // remove the script tag from the html. we are going to inject new
                        // ones in the end.
                        s.remove(node.loc.start.offset, node.loc.end.offset);
                    }
                });
                isAsyncScriptMap.get(config).set(id, everyScriptIsAsync);
                if (someScriptsAreAsync && someScriptsAreDefer) {
                    config.logger.warn(`\nMixed async and defer script modules in ${id}, output script will fallback to defer. Every script, including inline ones, need to be marked as async for your output script to be async.`);
                }
                // for each encountered asset url, rewrite original html so that it
                // references the post-build location, ignoring empty attributes and
                // attributes that directly reference named output.
                const namedOutput = Object.keys(((_b = (_a = config === null || config === void 0 ? void 0 : config.build) === null || _a === void 0 ? void 0 : _a.rollupOptions) === null || _b === void 0 ? void 0 : _b.input) || {});
                for (const attr of assetUrls) {
                    const value = attr.value;
                    // assetsUrl may be encodeURI
                    const content = decodeURI(value.content);
                    if (content !== '' && // Empty attribute
                        !namedOutput.includes(content) && // Direct reference to named output
                        !namedOutput.includes(content.replace(/^\//, '')) // Allow for absolute references as named output can't be an absolute path
                    ) {
                        try {
                            const url = attr.name === 'srcset'
                                ? await processSrcSet(content, ({ url }) => urlToBuiltUrl(url, id, config, this))
                                : await urlToBuiltUrl(content, id, config, this);
                            s.overwrite(value.loc.start.offset, value.loc.end.offset, `"${url}"`, { contentOnly: true });
                        }
                        catch (e) {
                            if (e.code !== 'ENOENT') {
                                throw e;
                            }
                        }
                    }
                }
                // emit <script>import("./aaa")</script> asset
                for (const { start, end, url } of scriptUrls) {
                    if (!isExcludedUrl(url)) {
                        s.overwrite(start, end, await urlToBuiltUrl(url, id, config, this), { contentOnly: true });
                    }
                    else if (checkPublicFile(url, config)) {
                        s.overwrite(start, end, config.base + url.slice(1), {
                            contentOnly: true
                        });
                    }
                }
                processedHtml.set(id, s.toString());
                // inject module preload polyfill only when configured and needed
                if (config.build.polyfillModulePreload &&
                    (someScriptsAreAsync || someScriptsAreDefer)) {
                    js = `import "${modulePreloadPolyfillId}";\n${js}`;
                }
                return js;
            }
        },
        async generateBundle(options, bundle) {
            const analyzedChunk = new Map();
            const getImportedChunks = (chunk, seen = new Set()) => {
                const chunks = [];
                chunk.imports.forEach((file) => {
                    const importee = bundle[file];
                    if ((importee === null || importee === void 0 ? void 0 : importee.type) === 'chunk' && !seen.has(file)) {
                        seen.add(file);
                        // post-order traversal
                        chunks.push(...getImportedChunks(importee, seen));
                        chunks.push(importee);
                    }
                });
                return chunks;
            };
            const toScriptTag = (chunk, isAsync) => ({
                tag: 'script',
                attrs: {
                    ...(isAsync ? { async: true } : {}),
                    type: 'module',
                    crossorigin: true,
                    src: toPublicPath(chunk.fileName, config)
                }
            });
            const toPreloadTag = (chunk) => ({
                tag: 'link',
                attrs: {
                    rel: 'modulepreload',
                    href: toPublicPath(chunk.fileName, config)
                }
            });
            const getCssTagsForChunk = (chunk, seen = new Set()) => {
                const tags = [];
                if (!analyzedChunk.has(chunk)) {
                    analyzedChunk.set(chunk, 1);
                    chunk.imports.forEach((file) => {
                        const importee = bundle[file];
                        if ((importee === null || importee === void 0 ? void 0 : importee.type) === 'chunk') {
                            tags.push(...getCssTagsForChunk(importee, seen));
                        }
                    });
                }
                chunk.viteMetadata.importedCss.forEach((file) => {
                    if (!seen.has(file)) {
                        seen.add(file);
                        tags.push({
                            tag: 'link',
                            attrs: {
                                rel: 'stylesheet',
                                href: toPublicPath(file, config)
                            }
                        });
                    }
                });
                return tags;
            };
            for (const [id, html] of processedHtml) {
                const isAsync = isAsyncScriptMap.get(config).get(id);
                let result = html;
                // find corresponding entry chunk
                const chunk = Object.values(bundle).find((chunk) => chunk.type === 'chunk' &&
                    chunk.isEntry &&
                    chunk.facadeModuleId === id);
                let canInlineEntry = false;
                // inject chunk asset links
                if (chunk) {
                    // an entry chunk can be inlined if
                    //  - it's an ES module (e.g. not generated by the legacy plugin)
                    //  - it contains no meaningful code other than import statements
                    if (options.format === 'es' && isEntirelyImport(chunk.code)) {
                        canInlineEntry = true;
                    }
                    // when not inlined, inject <script> for entry and modulepreload its dependencies
                    // when inlined, discard entry chunk and inject <script> for everything in post-order
                    const imports = getImportedChunks(chunk);
                    const assetTags = canInlineEntry
                        ? imports.map((chunk) => toScriptTag(chunk, isAsync))
                        : [toScriptTag(chunk, isAsync), ...imports.map(toPreloadTag)];
                    assetTags.push(...getCssTagsForChunk(chunk));
                    result = injectToHead(result, assetTags);
                }
                // inject css link when cssCodeSplit is false
                if (!config.build.cssCodeSplit) {
                    const cssChunk = Object.values(bundle).find((chunk) => chunk.type === 'asset' && chunk.name === 'style.css');
                    if (cssChunk) {
                        result = injectToHead(result, [
                            {
                                tag: 'link',
                                attrs: {
                                    rel: 'stylesheet',
                                    href: toPublicPath(cssChunk.fileName, config)
                                }
                            }
                        ]);
                    }
                }
                // no use assets plugin because it will emit file
                let match;
                let s;
                while ((match = inlineCSSRE$1.exec(result))) {
                    s || (s = new MagicString__default(result));
                    const { 0: full, 1: scopedName } = match;
                    const cssTransformedCode = htmlProxyResult.get(scopedName);
                    s.overwrite(match.index, match.index + full.length, cssTransformedCode, { contentOnly: true });
                }
                if (s) {
                    result = s.toString();
                }
                const relativeUrlPath = path__default.posix.relative(config.root, id);
                result = await applyHtmlTransforms(result, postHooks, {
                    path: '/' + relativeUrlPath,
                    filename: id,
                    bundle,
                    chunk
                });
                // resolve asset url references
                result = result.replace(assetUrlRE, (_, fileHash, postfix = '') => {
                    return config.base + getAssetFilename(fileHash, config) + postfix;
                });
                if (chunk && canInlineEntry) {
                    // all imports from entry have been inlined to html, prevent rollup from outputting it
                    delete bundle[chunk.fileName];
                }
                const shortEmitName = path__default.relative(config.root, id);
                this.emitFile({
                    type: 'asset',
                    fileName: shortEmitName,
                    source: result
                });
            }
        }
    };
}
function resolveHtmlTransforms(plugins) {
    const preHooks = [];
    const postHooks = [];
    for (const plugin of plugins) {
        const hook = plugin.transformIndexHtml;
        if (hook) {
            if (typeof hook === 'function') {
                postHooks.push(hook);
            }
            else if (hook.enforce === 'pre') {
                preHooks.push(hook.transform);
            }
            else {
                postHooks.push(hook.transform);
            }
        }
    }
    return [preHooks, postHooks];
}
const maybeVirtualHtmlSet = new Set();
async function applyHtmlTransforms(html, hooks, ctx) {
    const headTags = [];
    const headPrependTags = [];
    const bodyTags = [];
    const bodyPrependTags = [];
    maybeVirtualHtmlSet.add(ctx.filename);
    for (const hook of hooks) {
        const res = await hook(html, ctx);
        if (!res) {
            continue;
        }
        if (typeof res === 'string') {
            html = res;
        }
        else {
            let tags;
            if (Array.isArray(res)) {
                tags = res;
            }
            else {
                html = res.html || html;
                tags = res.tags;
            }
            for (const tag of tags) {
                if (tag.injectTo === 'body') {
                    bodyTags.push(tag);
                }
                else if (tag.injectTo === 'body-prepend') {
                    bodyPrependTags.push(tag);
                }
                else if (tag.injectTo === 'head') {
                    headTags.push(tag);
                }
                else {
                    headPrependTags.push(tag);
                }
            }
        }
    }
    // inject tags
    if (headPrependTags.length) {
        html = injectToHead(html, headPrependTags, true);
    }
    if (headTags.length) {
        html = injectToHead(html, headTags);
    }
    if (bodyPrependTags.length) {
        html = injectToBody(html, bodyPrependTags, true);
    }
    if (bodyTags.length) {
        html = injectToBody(html, bodyTags);
    }
    return html;
}
const importRE = /\bimport\s*("[^"]*[^\\]"|'[^']*[^\\]');*/g;
const commentRE$1 = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
function isEntirelyImport(code) {
    // only consider "side-effect" imports, which match <script type=module> semantics exactly
    // the regexes will remove too little in some exotic cases, but false-negatives are alright
    return !code.replace(importRE, '').replace(commentRE$1, '').trim().length;
}
function toPublicPath(filename, config) {
    return isExternalUrl(filename) ? filename : config.base + filename;
}
const headInjectRE = /([ \t]*)<\/head>/i;
const headPrependInjectRE = /([ \t]*)<head[^>]*>/i;
const htmlInjectRE = /<\/html>/i;
const htmlPrependInjectRE = /([ \t]*)<html[^>]*>/i;
const bodyInjectRE = /([ \t]*)<\/body>/i;
const bodyPrependInjectRE = /([ \t]*)<body[^>]*>/i;
const doctypePrependInjectRE = /<!doctype html>/i;
function injectToHead(html, tags, prepend = false) {
    if (prepend) {
        // inject as the first element of head
        if (headPrependInjectRE.test(html)) {
            return html.replace(headPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
        }
    }
    else {
        // inject before head close
        if (headInjectRE.test(html)) {
            // respect indentation of head tag
            return html.replace(headInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
        }
        // try to inject before the body tag
        if (bodyPrependInjectRE.test(html)) {
            return html.replace(bodyPrependInjectRE, (match, p1) => `${serializeTags(tags, p1)}\n${match}`);
        }
    }
    // if no head tag is present, we prepend the tag for both prepend and append
    return prependInjectFallback(html, tags);
}
function injectToBody(html, tags, prepend = false) {
    if (prepend) {
        // inject after body open
        if (bodyPrependInjectRE.test(html)) {
            return html.replace(bodyPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
        }
        // if no there is no body tag, inject after head or fallback to prepend in html
        if (headInjectRE.test(html)) {
            return html.replace(headInjectRE, (match, p1) => `${match}\n${serializeTags(tags, p1)}`);
        }
        return prependInjectFallback(html, tags);
    }
    else {
        // inject before body close
        if (bodyInjectRE.test(html)) {
            return html.replace(bodyInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
        }
        // if no body tag is present, append to the html tag, or at the end of the file
        if (htmlInjectRE.test(html)) {
            return html.replace(htmlInjectRE, `${serializeTags(tags)}\n$&`);
        }
        return html + `\n` + serializeTags(tags);
    }
}
function prependInjectFallback(html, tags) {
    // prepend to the html tag, append after doctype, or the document start
    if (htmlPrependInjectRE.test(html)) {
        return html.replace(htmlPrependInjectRE, `$&\n${serializeTags(tags)}`);
    }
    if (doctypePrependInjectRE.test(html)) {
        return html.replace(doctypePrependInjectRE, `$&\n${serializeTags(tags)}`);
    }
    return serializeTags(tags) + html;
}
const unaryTags = new Set(['link', 'meta', 'base']);
function serializeTag({ tag, attrs, children }, indent = '') {
    if (unaryTags.has(tag)) {
        return `<${tag}${serializeAttrs(attrs)}>`;
    }
    else {
        return `<${tag}${serializeAttrs(attrs)}>${serializeTags(children, incrementIndent(indent))}</${tag}>`;
    }
}
function serializeTags(tags, indent = '') {
    if (typeof tags === 'string') {
        return tags;
    }
    else if (tags && tags.length) {
        return tags.map((tag) => `${indent}${serializeTag(tag, indent)}\n`).join('');
    }
    return '';
}
function serializeAttrs(attrs) {
    let res = '';
    for (const key in attrs) {
        if (typeof attrs[key] === 'boolean') {
            res += attrs[key] ? ` ${key}` : ``;
        }
        else {
            res += ` ${key}=${JSON.stringify(attrs[key])}`;
        }
    }
    return res;
}
function incrementIndent(indent = '') {
    return `${indent}${indent[0] === '\t' ? '\t' : '  '}`;
}

const isDebug$6 = !!process.env.DEBUG;
const debug$9 = createDebugger('vite:sourcemap', {
    onlyWhenFocused: true
});
// Virtual modules should be prefixed with a null byte to avoid a
// false positive "missing source" warning. We also check for certain
// prefixes used for special handling in esbuildDepPlugin.
const virtualSourceRE = /^(\0|dep:|browser-external:)/;
async function injectSourcesContent(map, file, logger) {
    let sourceRoot;
    try {
        // The source root is undefined for virtual modules and permission errors.
        sourceRoot = await fs.promises.realpath(path__default.resolve(path__default.dirname(file), map.sourceRoot || ''));
    }
    catch { }
    const missingSources = [];
    map.sourcesContent = await Promise.all(map.sources.map((sourcePath) => {
        if (sourcePath && !virtualSourceRE.test(sourcePath)) {
            sourcePath = decodeURI(sourcePath);
            if (sourceRoot) {
                sourcePath = path__default.resolve(sourceRoot, sourcePath);
            }
            return fs.promises.readFile(sourcePath, 'utf-8').catch(() => {
                if (maybeVirtualHtmlSet.has(normalizePath(sourcePath)))
                    return null;
                missingSources.push(sourcePath);
                return null;
            });
        }
        return null;
    }));
    // Use this command…
    //    DEBUG="vite:sourcemap" vite build
    // …to log the missing sources.
    if (missingSources.length) {
        logger.warnOnce(`Sourcemap for "${file}" points to missing source files`);
        isDebug$6 && debug$9(`Missing sources:\n  ` + missingSources.join(`\n  `));
    }
}
function genSourceMapUrl(map) {
    if (typeof map !== 'string') {
        map = JSON.stringify(map);
    }
    return `data:application/json;base64,${Buffer.from(map).toString('base64')}`;
}
function getCodeWithSourcemap(type, code, map) {
    if (isDebug$6) {
        code += `\n/*${JSON.stringify(map, null, 2).replace(/\*\//g, '*\\/')}*/\n`;
    }
    if (type === 'js') {
        code += `\n//# sourceMappingURL=${genSourceMapUrl(map !== null && map !== void 0 ? map : undefined)}`;
    }
    else if (type === 'css') {
        code += `\n/*# sourceMappingURL=${genSourceMapUrl(map !== null && map !== void 0 ? map : undefined)} */`;
    }
    return code;
}

const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`;
const cssLangRE = new RegExp(cssLangs);
const cssModuleRE = new RegExp(`\\.module${cssLangs}`);
const directRequestRE = /(\?|&)direct\b/;
const htmlProxyRE = /(\?|&)html-proxy\b/;
const commonjsProxyRE = /\?commonjs-proxy/;
const inlineRE = /(\?|&)inline\b/;
const inlineCSSRE = /(\?|&)inline-css\b/;
const usedRE = /(\?|&)used\b/;
const isCSSRequest = (request) => cssLangRE.test(request);
const isDirectCSSRequest = (request) => cssLangRE.test(request) && directRequestRE.test(request);
const isDirectRequest = (request) => directRequestRE.test(request);
const cssModulesCache = new WeakMap();
const removedPureCssFilesCache = new WeakMap();
const postcssConfigCache = new WeakMap();
/**
 * Plugin applied before user plugins
 */
function cssPlugin(config) {
    let server;
    let moduleCache;
    const resolveUrl = config.createResolver({
        preferRelative: true,
        tryIndex: false,
        extensions: []
    });
    const atImportResolvers = createCSSResolvers(config);
    return {
        name: 'vite:css',
        configureServer(_server) {
            server = _server;
        },
        buildStart() {
            // Ensure a new cache for every build (i.e. rebuilding in watch mode)
            moduleCache = new Map();
            cssModulesCache.set(config, moduleCache);
            removedPureCssFilesCache.set(config, new Map());
        },
        async transform(raw, id, options) {
            var _a, _b;
            if (!isCSSRequest(id) ||
                commonjsProxyRE.test(id) ||
                SPECIAL_QUERY_RE.test(id)) {
                return;
            }
            const ssr = (options === null || options === void 0 ? void 0 : options.ssr) === true;
            const urlReplacer = async (url, importer) => {
                if (checkPublicFile(url, config)) {
                    return config.base + url.slice(1);
                }
                const resolved = await resolveUrl(url, importer);
                if (resolved) {
                    return fileToUrl(resolved, config, this);
                }
                return url;
            };
            const { code: css, modules, deps, map } = await compileCSS(id, raw, config, urlReplacer, atImportResolvers, server);
            if (modules) {
                moduleCache.set(id, modules);
            }
            // track deps for build watch mode
            if (config.command === 'build' && config.build.watch && deps) {
                for (const file of deps) {
                    this.addWatchFile(file);
                }
            }
            // dev
            if (server) {
                // server only logic for handling CSS @import dependency hmr
                const { moduleGraph } = server;
                const thisModule = moduleGraph.getModuleById(id);
                if (thisModule) {
                    // CSS modules cannot self-accept since it exports values
                    const isSelfAccepting = !modules && !inlineRE.test(id);
                    if (deps) {
                        // record deps in the module graph so edits to @import css can trigger
                        // main import to hot update
                        const depModules = new Set();
                        for (const file of deps) {
                            depModules.add(isCSSRequest(file)
                                ? moduleGraph.createFileOnlyEntry(file)
                                : await moduleGraph.ensureEntryFromUrl((await fileToUrl(file, config, this)).replace(((_b = (_a = config.server) === null || _a === void 0 ? void 0 : _a.origin) !== null && _b !== void 0 ? _b : '') + config.base, '/'), ssr));
                        }
                        moduleGraph.updateModuleInfo(thisModule, depModules, 
                        // The root CSS proxy module is self-accepting and should not
                        // have an explicit accept list
                        new Set(), isSelfAccepting, ssr);
                        for (const file of deps) {
                            this.addWatchFile(file);
                        }
                    }
                    else {
                        thisModule.isSelfAccepting = isSelfAccepting;
                    }
                }
            }
            return {
                code: css,
                map
            };
        }
    };
}
/**
 * Plugin applied after user plugins
 */
function cssPostPlugin(config) {
    // styles initialization in buildStart causes a styling loss in watch
    const styles = new Map();
    let pureCssChunks;
    // when there are multiple rollup outputs and extracting CSS, only emit once,
    // since output formats have no effect on the generated CSS.
    let outputToExtractedCSSMap;
    let hasEmitted = false;
    return {
        name: 'vite:css-post',
        buildStart() {
            // Ensure new caches for every build (i.e. rebuilding in watch mode)
            pureCssChunks = new Set();
            outputToExtractedCSSMap = new Map();
            hasEmitted = false;
        },
        async transform(css, id, options) {
            var _a;
            if (!isCSSRequest(id) ||
                commonjsProxyRE.test(id) ||
                SPECIAL_QUERY_RE.test(id)) {
                return;
            }
            const inlined = inlineRE.test(id);
            const modules = cssModulesCache.get(config).get(id);
            const modulesCode = modules && pluginutils.dataToEsm(modules, { namedExports: true, preferConst: true });
            if (config.command === 'serve') {
                if (isDirectCSSRequest(id)) {
                    return css;
                }
                else {
                    // server only
                    if (options === null || options === void 0 ? void 0 : options.ssr) {
                        return modulesCode || `export default ${JSON.stringify(css)}`;
                    }
                    if (inlined) {
                        return `export default ${JSON.stringify(css)}`;
                    }
                    let cssContent = css;
                    if ((_a = config.css) === null || _a === void 0 ? void 0 : _a.devSourcemap) {
                        const sourcemap = this.getCombinedSourcemap();
                        await injectSourcesContent(sourcemap, cleanUrl(id), config.logger);
                        cssContent = getCodeWithSourcemap('css', css, sourcemap);
                    }
                    return [
                        `import { updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle } from ${JSON.stringify(path__default.posix.join(config.base, CLIENT_PUBLIC_PATH))}`,
                        `const __vite__id = ${JSON.stringify(id)}`,
                        `const __vite__css = ${JSON.stringify(cssContent)}`,
                        `__vite__updateStyle(__vite__id, __vite__css)`,
                        // css modules exports change on edit so it can't self accept
                        `${modulesCode ||
                            `import.meta.hot.accept()\nexport default __vite__css`}`,
                        `import.meta.hot.prune(() => __vite__removeStyle(__vite__id))`
                    ].join('\n');
                }
            }
            // build CSS handling ----------------------------------------------------
            // record css
            // cache css compile result to map
            // and then use the cache replace inline-style-flag when `generateBundle` in vite:build-html plugin
            const inlineCSS = inlineCSSRE.test(id);
            const query = parseRequest(id);
            const isHTMLProxy = htmlProxyRE.test(id);
            if (inlineCSS && isHTMLProxy) {
                addToHTMLProxyTransformResult(`${cleanUrl(id)}_${Number.parseInt(query.index)}`, css);
                return `export default ''`;
            }
            if (!inlined) {
                styles.set(id, css);
            }
            let code;
            if (usedRE.test(id)) {
                if (inlined) {
                    code = `export default ${JSON.stringify(await minifyCSS(css, config))}`;
                }
                else {
                    code = modulesCode || `export default ${JSON.stringify(css)}`;
                }
            }
            else {
                code = `export default ''`;
            }
            return {
                code,
                map: { mappings: '' },
                // avoid the css module from being tree-shaken so that we can retrieve
                // it in renderChunk()
                moduleSideEffects: inlined ? false : 'no-treeshake'
            };
        },
        async renderChunk(code, chunk, opts) {
            let chunkCSS = '';
            let isPureCssChunk = true;
            const ids = Object.keys(chunk.modules);
            for (const id of ids) {
                if (!isCSSRequest(id) ||
                    cssModuleRE.test(id) ||
                    commonjsProxyRE.test(id)) {
                    isPureCssChunk = false;
                }
                if (styles.has(id)) {
                    chunkCSS += styles.get(id);
                }
            }
            if (!chunkCSS) {
                return null;
            }
            // resolve asset URL placeholders to their built file URLs and perform
            // minification if necessary
            const processChunkCSS = async (css, { inlined, minify }) => {
                // replace asset url references with resolved url.
                const isRelativeBase = config.base === '' || config.base.startsWith('.');
                css = css.replace(assetUrlRE, (_, fileHash, postfix = '') => {
                    const filename = getAssetFilename(fileHash, config) + postfix;
                    chunk.viteMetadata.importedAssets.add(cleanUrl(filename));
                    if (!isRelativeBase || inlined) {
                        // absolute base or relative base but inlined (injected as style tag into
                        // index.html) use the base as-is
                        return config.base + filename;
                    }
                    else {
                        // relative base + extracted CSS - asset file will be in the same dir
                        return `./${path__default.posix.basename(filename)}`;
                    }
                });
                // only external @imports and @charset should exist at this point
                // hoist them to the top of the CSS chunk per spec (#1845 and #6333)
                if (css.includes('@import') || css.includes('@charset')) {
                    css = await hoistAtRules(css);
                }
                if (minify && config.build.minify) {
                    css = await minifyCSS(css, config);
                }
                return css;
            };
            if (config.build.cssCodeSplit) {
                if (isPureCssChunk) {
                    // this is a shared CSS-only chunk that is empty.
                    pureCssChunks.add(chunk.fileName);
                }
                if (opts.format === 'es' || opts.format === 'cjs') {
                    chunkCSS = await processChunkCSS(chunkCSS, {
                        inlined: false,
                        minify: true
                    });
                    // emit corresponding css file
                    const fileHandle = this.emitFile({
                        name: chunk.name + '.css',
                        type: 'asset',
                        source: chunkCSS
                    });
                    chunk.viteMetadata.importedCss.add(this.getFileName(fileHandle));
                }
                else if (!config.build.ssr) {
                    // legacy build, inline css
                    chunkCSS = await processChunkCSS(chunkCSS, {
                        inlined: true,
                        minify: true
                    });
                    const style = `__vite_style__`;
                    const injectCode = `var ${style} = document.createElement('style');` +
                        `${style}.innerHTML = ${JSON.stringify(chunkCSS)};` +
                        `document.head.appendChild(${style});`;
                    if (config.build.sourcemap) {
                        const s = new MagicString__default(code);
                        s.prepend(injectCode);
                        return {
                            code: s.toString(),
                            map: s.generateMap({ hires: true })
                        };
                    }
                    else {
                        return { code: injectCode + code };
                    }
                }
            }
            else {
                // non-split extracted CSS will be minified together
                chunkCSS = await processChunkCSS(chunkCSS, {
                    inlined: false,
                    minify: false
                });
                outputToExtractedCSSMap.set(opts, (outputToExtractedCSSMap.get(opts) || '') + chunkCSS);
            }
            return null;
        },
        async generateBundle(opts, bundle) {
            // @ts-ignore asset emits are skipped in legacy bundle
            if (opts.__vite_skip_asset_emit__) {
                return;
            }
            // remove empty css chunks and their imports
            if (pureCssChunks.size) {
                const emptyChunkFiles = [...pureCssChunks]
                    .map((file) => path__default.basename(file))
                    .join('|')
                    .replace(/\./g, '\\.');
                const emptyChunkRE = new RegExp(opts.format === 'es'
                    ? `\\bimport\\s*"[^"]*(?:${emptyChunkFiles})";\n?`
                    : `\\brequire\\(\\s*"[^"]*(?:${emptyChunkFiles})"\\);\n?`, 'g');
                for (const file in bundle) {
                    const chunk = bundle[file];
                    if (chunk.type === 'chunk') {
                        // remove pure css chunk from other chunk's imports,
                        // and also register the emitted CSS files under the importer
                        // chunks instead.
                        chunk.imports = chunk.imports.filter((file) => {
                            if (pureCssChunks.has(file)) {
                                const { viteMetadata: { importedCss } } = bundle[file];
                                importedCss.forEach((file) => chunk.viteMetadata.importedCss.add(file));
                                return false;
                            }
                            return true;
                        });
                        chunk.code = chunk.code.replace(emptyChunkRE, 
                        // remove css import while preserving source map location
                        (m) => `/* empty css ${''.padEnd(m.length - 15)}*/`);
                    }
                }
                const removedPureCssFiles = removedPureCssFilesCache.get(config);
                pureCssChunks.forEach((fileName) => {
                    removedPureCssFiles.set(fileName, bundle[fileName]);
                    delete bundle[fileName];
                });
            }
            let extractedCss = outputToExtractedCSSMap.get(opts);
            if (extractedCss && !hasEmitted) {
                hasEmitted = true;
                // minify css
                if (config.build.minify) {
                    extractedCss = await minifyCSS(extractedCss, config);
                }
                this.emitFile({
                    name: 'style.css',
                    type: 'asset',
                    source: extractedCss
                });
            }
        }
    };
}
function createCSSResolvers(config) {
    let cssResolve;
    let sassResolve;
    let lessResolve;
    return {
        get css() {
            return (cssResolve ||
                (cssResolve = config.createResolver({
                    extensions: ['.css'],
                    mainFields: ['style'],
                    tryIndex: false,
                    preferRelative: true
                })));
        },
        get sass() {
            return (sassResolve ||
                (sassResolve = config.createResolver({
                    extensions: ['.scss', '.sass', '.css'],
                    mainFields: ['sass', 'style'],
                    tryIndex: true,
                    tryPrefix: '_',
                    preferRelative: true
                })));
        },
        get less() {
            return (lessResolve ||
                (lessResolve = config.createResolver({
                    extensions: ['.less', '.css'],
                    mainFields: ['less', 'style'],
                    tryIndex: false,
                    preferRelative: true
                })));
        }
    };
}
function getCssResolversKeys(resolvers) {
    return Object.keys(resolvers);
}
async function compileCSS(id, code, config, urlReplacer, atImportResolvers, server) {
    var _a;
    const { modules: modulesOptions, preprocessorOptions, devSourcemap } = config.css || {};
    const isModule = modulesOptions !== false && cssModuleRE.test(id);
    // although at serve time it can work without processing, we do need to
    // crawl them in order to register watch dependencies.
    const needInlineImport = code.includes('@import');
    const hasUrl = cssUrlRE.test(code) || cssImageSetRE.test(code);
    const postcssConfig = await resolvePostcssConfig(config);
    const lang = (_a = id.match(cssLangRE)) === null || _a === void 0 ? void 0 : _a[1];
    // 1. plain css that needs no processing
    if (lang === 'css' &&
        !postcssConfig &&
        !isModule &&
        !needInlineImport &&
        !hasUrl) {
        return { code, map: null };
    }
    let preprocessorMap;
    let modules;
    const deps = new Set();
    // 2. pre-processors: sass etc.
    if (isPreProcessor(lang)) {
        const preProcessor = preProcessors[lang];
        let opts = (preprocessorOptions && preprocessorOptions[lang]) || {};
        // support @import from node dependencies by default
        switch (lang) {
            case "scss" /* scss */:
            case "sass" /* sass */:
                opts = {
                    includePaths: ['node_modules'],
                    alias: config.resolve.alias,
                    ...opts
                };
                break;
            case "less" /* less */:
            case "styl" /* styl */:
            case "stylus" /* stylus */:
                opts = {
                    paths: ['node_modules'],
                    alias: config.resolve.alias,
                    ...opts
                };
        }
        // important: set this for relative import resolving
        opts.filename = cleanUrl(id);
        opts.enableSourcemap = devSourcemap !== null && devSourcemap !== void 0 ? devSourcemap : false;
        const preprocessResult = await preProcessor(code, config.root, opts, atImportResolvers);
        if (preprocessResult.errors.length) {
            throw preprocessResult.errors[0];
        }
        code = preprocessResult.code;
        preprocessorMap = combineSourcemapsIfExists(opts.filename, preprocessResult.map, preprocessResult.additionalMap);
        if (preprocessResult.deps) {
            preprocessResult.deps.forEach((dep) => {
                // sometimes sass registers the file itself as a dep
                if (normalizePath(dep) !== normalizePath(opts.filename)) {
                    deps.add(dep);
                }
            });
        }
    }
    // 3. postcss
    const postcssOptions = (postcssConfig && postcssConfig.options) || {};
    const postcssPlugins = postcssConfig && postcssConfig.plugins ? postcssConfig.plugins.slice() : [];
    if (needInlineImport) {
        const isHTMLProxy = htmlProxyRE.test(id);
        postcssPlugins.unshift((await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('postcss-import')); })).default({
            async resolve(id, basedir) {
                const publicFile = checkPublicFile(id, config);
                if (isHTMLProxy && publicFile) {
                    return publicFile;
                }
                const resolved = await atImportResolvers.css(id, path__default.join(basedir, '*'));
                if (resolved) {
                    return path__default.resolve(resolved);
                }
                return id;
            }
        }));
    }
    postcssPlugins.push(UrlRewritePostcssPlugin({
        replacer: urlReplacer
    }));
    if (isModule) {
        postcssPlugins.unshift((await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('postcss-modules')); })).default({
            ...modulesOptions,
            getJSON(cssFileName, _modules, outputFileName) {
                modules = _modules;
                if (modulesOptions && typeof modulesOptions.getJSON === 'function') {
                    modulesOptions.getJSON(cssFileName, _modules, outputFileName);
                }
            },
            async resolve(id) {
                for (const key of getCssResolversKeys(atImportResolvers)) {
                    const resolved = await atImportResolvers[key](id);
                    if (resolved) {
                        return path__default.resolve(resolved);
                    }
                }
                return id;
            }
        }));
    }
    if (!postcssPlugins.length) {
        return {
            code,
            map: preprocessorMap
        };
    }
    // postcss is an unbundled dep and should be lazy imported
    const postcssResult = await (await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('postcss')); }))
        .default(postcssPlugins)
        .process(code, {
        ...postcssOptions,
        to: cleanUrl(id),
        from: cleanUrl(id),
        map: {
            inline: false,
            annotation: false,
            // postcss may return virtual files
            // we cannot obtain content of them, so this needs to be enabled
            sourcesContent: true
            // when "prev: preprocessorMap", the result map may include duplicate filename in `postcssResult.map.sources`
            // prev: preprocessorMap,
        }
    });
    // record CSS dependencies from @imports
    for (const message of postcssResult.messages) {
        if (message.type === 'dependency') {
            deps.add(normalizePath(message.file));
        }
        else if (message.type === 'dir-dependency') {
            // https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#3-dependencies
            const { dir, glob: globPattern = '**' } = message;
            const pattern = normalizePath(path__default.resolve(path__default.dirname(id), dir)) + `/` + globPattern;
            const files = glob__default.sync(pattern, {
                ignore: ['**/node_modules/**']
            });
            for (let i = 0; i < files.length; i++) {
                deps.add(files[i]);
            }
            if (server) {
                // register glob importers so we can trigger updates on file add/remove
                if (!(id in server._globImporters)) {
                    server._globImporters[id] = {
                        module: server.moduleGraph.getModuleById(id),
                        importGlobs: []
                    };
                }
                server._globImporters[id].importGlobs.push({
                    base: config.root,
                    pattern
                });
            }
        }
        else if (message.type === 'warning') {
            let msg = `[vite:css] ${message.text}`;
            if (message.line && message.column) {
                msg += `\n${generateCodeFrame(code, {
                    line: message.line,
                    column: message.column
                })}`;
            }
            config.logger.warn(colors__default.yellow(msg));
        }
    }
    if (!devSourcemap) {
        return {
            ast: postcssResult,
            code: postcssResult.css,
            map: { mappings: '' },
            modules,
            deps
        };
    }
    const rawPostcssMap = postcssResult.map.toJSON();
    const postcssMap = formatPostcssSourceMap(
    // version property of rawPostcssMap is declared as string
    // but actually it is a number
    rawPostcssMap, cleanUrl(id));
    return {
        ast: postcssResult,
        code: postcssResult.css,
        map: combineSourcemapsIfExists(cleanUrl(id), postcssMap, preprocessorMap),
        modules,
        deps
    };
}
function formatPostcssSourceMap(rawMap, file) {
    const inputFileDir = path__default.dirname(file);
    const sources = [];
    const sourcesContent = [];
    for (const [i, source] of rawMap.sources.entries()) {
        // remove <no source> from sources, to prevent source map to be combined incorrectly
        if (source === '<no source>')
            continue;
        const cleanSource = cleanUrl(decodeURIComponent(source));
        // postcss returns virtual files
        if (/^<.+>$/.test(cleanSource)) {
            sources.push(`\0${cleanSource}`);
        }
        else {
            sources.push(normalizePath(path__default.resolve(inputFileDir, cleanSource)));
        }
        if (rawMap.sourcesContent) {
            sourcesContent.push(rawMap.sourcesContent[i]);
        }
    }
    return {
        file,
        mappings: rawMap.mappings,
        names: rawMap.names,
        sources,
        sourcesContent,
        version: rawMap.version
    };
}
function combineSourcemapsIfExists(filename, map1, map2) {
    return map1 && map2
        ? combineSourcemaps(filename, [
            // type of version property of ExistingRawSourceMap is number
            // but it is always 3
            map1,
            map2
        ])
        : map1;
}
async function resolvePostcssConfig(config) {
    var _a;
    let result = postcssConfigCache.get(config);
    if (result !== undefined) {
        return result;
    }
    // inline postcss config via vite config
    const inlineOptions = (_a = config.css) === null || _a === void 0 ? void 0 : _a.postcss;
    if (isObject(inlineOptions)) {
        const options = { ...inlineOptions };
        delete options.plugins;
        result = {
            options,
            plugins: inlineOptions.plugins || []
        };
    }
    else {
        try {
            const searchPath = typeof inlineOptions === 'string' ? inlineOptions : config.root;
            // @ts-ignore
            result = await postcssrc__default({}, searchPath);
        }
        catch (e) {
            if (!/No PostCSS Config found/.test(e.message)) {
                throw e;
            }
            result = null;
        }
    }
    postcssConfigCache.set(config, result);
    return result;
}
// https://drafts.csswg.org/css-syntax-3/#identifier-code-point
const cssUrlRE = /(?<=^|[^\w\-\u0080-\uffff])url\(\s*('[^']+'|"[^"]+"|[^'")]+)\s*\)/;
const cssDataUriRE = /(?<=^|[^\w\-\u0080-\uffff])data-uri\(\s*('[^']+'|"[^"]+"|[^'")]+)\s*\)/;
const importCssRE = /@import ('[^']+\.css'|"[^"]+\.css"|[^'")]+\.css)/;
const cssImageSetRE = /image-set\(([^)]+)\)/;
const UrlRewritePostcssPlugin = (opts) => {
    if (!opts) {
        throw new Error('base or replace is required');
    }
    return {
        postcssPlugin: 'vite-url-rewrite',
        Once(root) {
            const promises = [];
            root.walkDecls((declaration) => {
                const isCssUrl = cssUrlRE.test(declaration.value);
                const isCssImageSet = cssImageSetRE.test(declaration.value);
                if (isCssUrl || isCssImageSet) {
                    const replacerForDeclaration = (rawUrl) => {
                        var _a;
                        const importer = (_a = declaration.source) === null || _a === void 0 ? void 0 : _a.input.file;
                        return opts.replacer(rawUrl, importer);
                    };
                    const rewriterToUse = isCssUrl ? rewriteCssUrls : rewriteCssImageSet;
                    promises.push(rewriterToUse(declaration.value, replacerForDeclaration).then((url) => {
                        declaration.value = url;
                    }));
                }
            });
            if (promises.length) {
                return Promise.all(promises);
            }
        }
    };
};
UrlRewritePostcssPlugin.postcss = true;
function rewriteCssUrls(css, replacer) {
    return asyncReplace(css, cssUrlRE, async (match) => {
        const [matched, rawUrl] = match;
        return await doUrlReplace(rawUrl, matched, replacer);
    });
}
function rewriteCssDataUris(css, replacer) {
    return asyncReplace(css, cssDataUriRE, async (match) => {
        const [matched, rawUrl] = match;
        return await doUrlReplace(rawUrl, matched, replacer, 'data-uri');
    });
}
function rewriteImportCss(css, replacer) {
    return asyncReplace(css, importCssRE, async (match) => {
        const [matched, rawUrl] = match;
        return await doImportCSSReplace(rawUrl, matched, replacer);
    });
}
function rewriteCssImageSet(css, replacer) {
    return asyncReplace(css, cssImageSetRE, async (match) => {
        const [matched, rawUrl] = match;
        const url = await processSrcSet(rawUrl, ({ url }) => doUrlReplace(url, matched, replacer));
        return `image-set(${url})`;
    });
}
async function doUrlReplace(rawUrl, matched, replacer, funcName = 'url') {
    let wrap = '';
    const first = rawUrl[0];
    if (first === `"` || first === `'`) {
        wrap = first;
        rawUrl = rawUrl.slice(1, -1);
    }
    if (isExternalUrl(rawUrl) || isDataUrl(rawUrl) || rawUrl.startsWith('#')) {
        return matched;
    }
    const newUrl = await replacer(rawUrl);
    if (wrap === '' && newUrl !== encodeURI(newUrl)) {
        // The new url might need wrapping even if the original did not have it, e.g. if a space was added during replacement
        wrap = "'";
    }
    return `${funcName}(${wrap}${newUrl}${wrap})`;
}
async function doImportCSSReplace(rawUrl, matched, replacer) {
    let wrap = '';
    const first = rawUrl[0];
    if (first === `"` || first === `'`) {
        wrap = first;
        rawUrl = rawUrl.slice(1, -1);
    }
    if (isExternalUrl(rawUrl) || isDataUrl(rawUrl) || rawUrl.startsWith('#')) {
        return matched;
    }
    return `@import ${wrap}${await replacer(rawUrl)}${wrap}`;
}
async function minifyCSS(css, config) {
    try {
        const { code, warnings } = await esbuild.transform(css, {
            loader: 'css',
            minify: true,
            target: config.build.cssTarget || undefined
        });
        if (warnings.length) {
            const msgs = await esbuild.formatMessages(warnings, { kind: 'warning' });
            config.logger.warn(colors__default.yellow(`warnings when minifying css:\n${msgs.join('\n')}`));
        }
        return code;
    }
    catch (e) {
        if (e.errors) {
            const msgs = await esbuild.formatMessages(e.errors, { kind: 'error' });
            e.frame = '\n' + msgs.join('\n');
            e.loc = e.errors[0].location;
        }
        throw e;
    }
}
async function hoistAtRules(css) {
    const s = new MagicString__default(css);
    // #1845
    // CSS @import can only appear at top of the file. We need to hoist all @import
    // to top when multiple files are concatenated.
    // match until semicolon that's not in quotes
    s.replace(/@import\s*(?:url\([^\)]*\)|"([^"]|(?<=\\)")*"|'([^']|(?<=\\)')*'|[^;]*).*?;/gm, (match) => {
        s.appendLeft(0, match);
        return '';
    });
    // #6333
    // CSS @charset must be the top-first in the file, hoist the first to top
    let foundCharset = false;
    s.replace(/@charset\s*(?:"([^"]|(?<=\\)")*"|'([^']|(?<=\\)')*'|[^;]*).*?;/gm, (match) => {
        if (!foundCharset) {
            s.prepend(match);
            foundCharset = true;
        }
        return '';
    });
    return s.toString();
}
const loadedPreprocessors = {};
function loadPreprocessor(lang, root) {
    var _a, _b;
    if (lang in loadedPreprocessors) {
        return loadedPreprocessors[lang];
    }
    try {
        // Search for the preprocessor in the root directory first, and fall back
        // to the default require paths.
        const fallbackPaths = ((_b = (_a = require.resolve).paths) === null || _b === void 0 ? void 0 : _b.call(_a, lang)) || [];
        const resolved = require.resolve(lang === 'sass' ? 'node-sass' : lang, {
            paths: [root, ...fallbackPaths]
        });
        return (loadedPreprocessors[lang] = require(resolved));
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error(`Preprocessor dependency "${lang}" not found. Did you install it?`);
        }
        else {
            const message = new Error(`Preprocessor dependency "${lang}" failed to load:\n${e.message}`);
            message.stack = e.stack + '\n' + message.stack;
            throw message;
        }
    }
}
// .scss/.sass processor
const scss = async (source, root, options, resolvers) => {
    const render = loadPreprocessor("sass" /* sass */, root).render;
    const internalImporter = (url, importer, done) => {
        resolvers.sass(url, importer).then((resolved) => {
            if (resolved) {
                rebaseUrls(resolved, options.filename, options.alias)
                    .then((data) => done === null || done === void 0 ? void 0 : done(data))
                    .catch((data) => done === null || done === void 0 ? void 0 : done(data));
            }
            else {
                done === null || done === void 0 ? void 0 : done(null);
            }
        });
    };
    const importer = [internalImporter];
    if (options.importer) {
        Array.isArray(options.importer)
            ? importer.push(...options.importer)
            : importer.push(options.importer);
    }
    const { content: data, map: additionalMap } = await getSource(source, options.filename, options.additionalData, options.enableSourcemap);
    const finalOptions = {
        ...options,
        data,
        file: options.filename,
        outFile: options.filename,
        importer,
        ...(options.enableSourcemap
            ? {
                sourceMap: true,
                omitSourceMapUrl: true,
                sourceMapRoot: path__default.dirname(options.filename)
            }
            : {})
    };
    try {
        const result = await new Promise((resolve, reject) => {
            render(finalOptions, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
        const deps = result.stats.includedFiles;
        const map = result.map
            ? JSON.parse(result.map.toString())
            : undefined;
        return {
            code: result.css.toString(),
            map,
            additionalMap,
            errors: [],
            deps
        };
    }
    catch (e) {
        // normalize SASS error
        e.id = e.file;
        e.frame = e.formatted;
        return { code: '', errors: [e], deps: [] };
    }
};
const sass = (source, root, options, aliasResolver) => scss(source, root, {
    ...options,
    indentedSyntax: true
}, aliasResolver);
/**
 * relative url() inside \@imported sass and less files must be rebased to use
 * root file as base.
 */
async function rebaseUrls(file, rootFile, alias) {
    file = path__default.resolve(file); // ensure os-specific flashes
    // in the same dir, no need to rebase
    const fileDir = path__default.dirname(file);
    const rootDir = path__default.dirname(rootFile);
    if (fileDir === rootDir) {
        return { file };
    }
    const content = fs__default.readFileSync(file, 'utf-8');
    // no url()
    const hasUrls = cssUrlRE.test(content);
    // data-uri() calls
    const hasDataUris = cssDataUriRE.test(content);
    // no @import xxx.css
    const hasImportCss = importCssRE.test(content);
    if (!hasUrls && !hasDataUris && !hasImportCss) {
        return { file };
    }
    let rebased;
    const rebaseFn = (url) => {
        if (url.startsWith('/'))
            return url;
        // match alias, no need to rewrite
        for (const { find } of alias) {
            const matches = typeof find === 'string' ? url.startsWith(find) : find.test(url);
            if (matches) {
                return url;
            }
        }
        const absolute = path__default.resolve(fileDir, url);
        const relative = path__default.relative(rootDir, absolute);
        return normalizePath(relative);
    };
    // fix css imports in less such as `@import "foo.css"`
    if (hasImportCss) {
        rebased = await rewriteImportCss(content, rebaseFn);
    }
    if (hasUrls) {
        rebased = await rewriteCssUrls(rebased || content, rebaseFn);
    }
    if (hasDataUris) {
        rebased = await rewriteCssDataUris(rebased || content, rebaseFn);
    }
    return {
        file,
        contents: rebased
    };
}
// .less
const less = async (source, root, options, resolvers) => {
    const nodeLess = loadPreprocessor("less" /* less */, root);
    const viteResolverPlugin = createViteLessPlugin(nodeLess, options.filename, options.alias, resolvers);
    const { content, map: additionalMap } = await getSource(source, options.filename, options.additionalData, options.enableSourcemap);
    let result;
    try {
        result = await nodeLess.render(content, {
            ...options,
            plugins: [viteResolverPlugin, ...(options.plugins || [])],
            ...(options.enableSourcemap
                ? {
                    sourceMap: {
                        outputSourceFiles: true,
                        sourceMapFileInline: false
                    }
                }
                : {})
        });
    }
    catch (e) {
        const error = e;
        // normalize error info
        const normalizedError = new Error(error.message || error.type);
        normalizedError.loc = {
            file: error.filename || options.filename,
            line: error.line,
            column: error.column
        };
        return { code: '', errors: [normalizedError], deps: [] };
    }
    const map = result.map && JSON.parse(result.map);
    if (map) {
        delete map.sourcesContent;
    }
    return {
        code: result.css.toString(),
        map,
        additionalMap,
        deps: result.imports,
        errors: []
    };
};
/**
 * Less manager, lazy initialized
 */
let ViteLessManager;
function createViteLessPlugin(less, rootFile, alias, resolvers) {
    if (!ViteLessManager) {
        ViteLessManager = class ViteManager extends less.FileManager {
            constructor(rootFile, resolvers, alias) {
                super();
                this.rootFile = rootFile;
                this.resolvers = resolvers;
                this.alias = alias;
            }
            supports() {
                return true;
            }
            supportsSync() {
                return false;
            }
            async loadFile(filename, dir, opts, env) {
                const resolved = await this.resolvers.less(filename, path__default.join(dir, '*'));
                if (resolved) {
                    const result = await rebaseUrls(resolved, this.rootFile, this.alias);
                    let contents;
                    if (result && 'contents' in result) {
                        contents = result.contents;
                    }
                    else {
                        contents = fs__default.readFileSync(resolved, 'utf-8');
                    }
                    return {
                        filename: path__default.resolve(resolved),
                        contents
                    };
                }
                else {
                    return super.loadFile(filename, dir, opts, env);
                }
            }
        };
    }
    return {
        install(_, pluginManager) {
            pluginManager.addFileManager(new ViteLessManager(rootFile, resolvers, alias));
        },
        minVersion: [3, 0, 0]
    };
}
// .styl
const styl = async (source, root, options) => {
    var _a;
    const nodeStylus = loadPreprocessor("stylus" /* stylus */, root);
    // Get source with preprocessor options.additionalData. Make sure a new line separator
    // is added to avoid any render error, as added stylus content may not have semi-colon separators
    const { content, map: additionalMap } = await getSource(source, options.filename, options.additionalData, options.enableSourcemap, '\n');
    // Get preprocessor options.imports dependencies as stylus
    // does not return them with its builtin `.deps()` method
    const importsDeps = ((_a = options.imports) !== null && _a !== void 0 ? _a : []).map((dep) => path__default.resolve(dep));
    try {
        const ref = nodeStylus(content, options);
        if (options.enableSourcemap) {
            ref.set('sourcemap', {
                comment: false,
                inline: false,
                basePath: root
            });
        }
        const result = ref.render();
        // Concat imports deps with computed deps
        const deps = [...ref.deps(), ...importsDeps];
        // @ts-expect-error sourcemap exists
        const map = ref.sourcemap;
        return {
            code: result,
            map: formatStylusSourceMap(map, root),
            additionalMap,
            errors: [],
            deps
        };
    }
    catch (e) {
        return { code: '', errors: [e], deps: [] };
    }
};
function formatStylusSourceMap(mapBefore, root) {
    if (!mapBefore)
        return undefined;
    const map = { ...mapBefore };
    const resolveFromRoot = (p) => normalizePath(path__default.resolve(root, p));
    if (map.file) {
        map.file = resolveFromRoot(map.file);
    }
    map.sources = map.sources.map(resolveFromRoot);
    return map;
}
async function getSource(source, filename, additionalData, enableSourcemap, sep = '') {
    if (!additionalData)
        return { content: source };
    if (typeof additionalData === 'function') {
        const newContent = await additionalData(source, filename);
        if (typeof newContent === 'string') {
            return { content: newContent };
        }
        return newContent;
    }
    if (!enableSourcemap) {
        return { content: additionalData + sep + source };
    }
    const ms = new MagicString__default(source);
    ms.appendLeft(0, sep);
    ms.appendLeft(0, additionalData);
    const map = ms.generateMap({ hires: true });
    map.file = filename;
    map.sources = [filename];
    return {
        content: ms.toString(),
        map
    };
}
const preProcessors = Object.freeze({
    ["less" /* less */]: less,
    ["sass" /* sass */]: sass,
    ["scss" /* scss */]: scss,
    ["styl" /* styl */]: styl,
    ["stylus" /* stylus */]: styl
});
function isPreProcessor(lang) {
    return lang && lang in preProcessors;
}

function formatGlobRelativePattern(base, pattern) {
    let parentDepth = 0;
    while (pattern.startsWith('../')) {
        pattern = pattern.slice(3);
        base = path__default.resolve(base, '../');
        parentDepth++;
    }
    if (pattern.startsWith('./')) {
        pattern = pattern.slice(2);
    }
    return { base, pattern, parentDepth, isAbsolute: false };
}
async function transformImportGlob(source, pos, importer, importIndex, root, logger, normalizeUrl, resolve, preload = true) {
    var _a;
    const isEager = source.slice(pos, pos + 21) === 'import.meta.globEager';
    const isEagerDefault = isEager && source.slice(pos + 21, pos + 28) === 'Default';
    const err = (msg) => {
        const e = new Error(`Invalid glob import syntax: ${msg}`);
        e.pos = pos;
        return e;
    };
    importer = cleanUrl(importer);
    const importerBasename = path__default.basename(importer);
    const [userPattern, options, endIndex] = lexGlobPattern(source, pos);
    let globParams = null;
    if (userPattern.startsWith('/')) {
        globParams = {
            isAbsolute: true,
            base: path__default.resolve(root),
            pattern: userPattern.slice(1),
            parentDepth: 0
        };
    }
    else if (userPattern.startsWith('.')) {
        globParams = formatGlobRelativePattern(path__default.dirname(importer), userPattern);
    }
    else if (resolve) {
        const resolvedId = await resolve(userPattern, importer);
        if (resolvedId) {
            const importerDirname = path__default.dirname(importer);
            globParams = formatGlobRelativePattern(importerDirname, normalizePath(path__default.relative(importerDirname, resolvedId)));
        }
    }
    if (!globParams) {
        throw err(`pattern must start with "." or "/" (relative to project root) or alias path`);
    }
    const { base, parentDepth, isAbsolute, pattern } = globParams;
    const files = glob__default.sync(pattern, {
        cwd: base,
        // Ignore node_modules by default unless explicitly indicated in the pattern
        ignore: /(^|\/)node_modules\//.test(pattern) ? [] : ['**/node_modules/**']
    });
    const imports = [];
    let importsString = ``;
    let entries = ``;
    for (let i = 0; i < files.length; i++) {
        // skip importer itself
        if (files[i] === importerBasename)
            continue;
        const file = isAbsolute
            ? `/${files[i]}`
            : parentDepth
                ? `${'../'.repeat(parentDepth)}${files[i]}`
                : `./${files[i]}`;
        let importee = file;
        if (normalizeUrl) {
            [importee] = await normalizeUrl(file, pos);
        }
        imports.push(importee);
        // TODO remove assert syntax for the Vite 3.0 release.
        const isRawAssert = ((_a = options === null || options === void 0 ? void 0 : options.assert) === null || _a === void 0 ? void 0 : _a.type) === 'raw';
        const isRawType = (options === null || options === void 0 ? void 0 : options.as) === 'raw';
        if (isRawType || isRawAssert) {
            if (isRawAssert) {
                logger.warn(colors__default.yellow(colors__default.bold("(!) import.meta.glob('...', { assert: { type: 'raw' }}) is deprecated. Use import.meta.glob('...', { as: 'raw' }) instead.")));
            }
            entries += ` ${JSON.stringify(file)}: ${JSON.stringify(await fs.promises.readFile(path__default.join(base, files[i]), 'utf-8'))},`;
        }
        else {
            const importeeUrl = isCSSRequest(importee) ? `${importee}?used` : importee;
            if (isEager) {
                const identifier = `__glob_${importIndex}_${i}`;
                // css imports injecting a ?used query to export the css string
                importsString += `import ${isEagerDefault ? `` : `* as `}${identifier} from ${JSON.stringify(importeeUrl)};`;
                entries += ` ${JSON.stringify(file)}: ${identifier},`;
            }
            else {
                let imp = `import(${JSON.stringify(importeeUrl)})`;
                if (!normalizeUrl && preload) {
                    imp =
                        `(${isModernFlag}` +
                            `? ${preloadMethod}(()=>${imp},"${preloadMarker}")` +
                            `: ${imp})`;
                }
                entries += ` ${JSON.stringify(file)}: () => ${imp},`;
            }
        }
    }
    return {
        imports,
        importsString,
        exp: `{${entries}}`,
        endIndex,
        isEager,
        pattern,
        base
    };
}
function lexGlobPattern(code, pos) {
    let state = 0 /* inCall */;
    let pattern = '';
    let i = code.indexOf(`(`, pos) + 1;
    outer: for (; i < code.length; i++) {
        const char = code.charAt(i);
        switch (state) {
            case 0 /* inCall */:
                if (char === `'`) {
                    state = 1 /* inSingleQuoteString */;
                }
                else if (char === `"`) {
                    state = 2 /* inDoubleQuoteString */;
                }
                else if (char === '`') {
                    state = 3 /* inTemplateString */;
                }
                else if (/\s/.test(char)) {
                    continue;
                }
                else {
                    error$1(i);
                }
                break;
            case 1 /* inSingleQuoteString */:
                if (char === `'`) {
                    break outer;
                }
                else {
                    pattern += char;
                }
                break;
            case 2 /* inDoubleQuoteString */:
                if (char === `"`) {
                    break outer;
                }
                else {
                    pattern += char;
                }
                break;
            case 3 /* inTemplateString */:
                if (char === '`') {
                    break outer;
                }
                else {
                    pattern += char;
                }
                break;
            default:
                throw new Error('unknown import.meta.glob lexer state');
        }
    }
    const noCommentCode = code
        .slice(i + 1)
        .replace(singlelineCommentsRE, blankReplacer$1)
        .replace(multilineCommentsRE, blankReplacer$1);
    const endIndex = noCommentCode.indexOf(')');
    const optionString = noCommentCode.substring(0, endIndex);
    const commaIndex = optionString.indexOf(',');
    let options = {};
    if (commaIndex > -1) {
        options = JSON5__default.parse(optionString.substring(commaIndex + 1));
    }
    return [pattern, options, endIndex + i + 2];
}
function error$1(pos) {
    const err = new Error(`import.meta.glob() can only accept string literals.`);
    err.pos = pos;
    throw err;
}

/**
 * A flag for injected helpers. This flag will be set to `false` if the output
 * target is not native es - so that injected helper logic can be conditionally
 * dropped.
 */
const isModernFlag = `__VITE_IS_MODERN__`;
const preloadMethod = `__vitePreload`;
const preloadMarker = `__VITE_PRELOAD__`;
const preloadBaseMarker = `__VITE_PRELOAD_BASE__`;
const preloadHelperId = 'vite/preload-helper';
const preloadMarkerWithQuote = `"${preloadMarker}"`;
/**
 * Helper for preloading CSS and direct imports of async chunks in parallel to
 * the async chunk itself.
 */
function detectScriptRel() {
    // @ts-ignore
    const relList = document.createElement('link').relList;
    // @ts-ignore
    return relList && relList.supports && relList.supports('modulepreload')
        ? 'modulepreload'
        : 'preload';
}
function preload(baseModule, deps) {
    // @ts-ignore
    if (!__VITE_IS_MODERN__ || !deps || deps.length === 0) {
        return baseModule();
    }
    return Promise.all(deps.map((dep) => {
        // @ts-ignore
        dep = `${base}${dep}`;
        // @ts-ignore
        if (dep in seen)
            return;
        // @ts-ignore
        seen[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        // @ts-ignore check if the file is already preloaded by SSR markup
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
            return;
        }
        // @ts-ignore
        const link = document.createElement('link');
        // @ts-ignore
        link.rel = isCss ? 'stylesheet' : scriptRel;
        if (!isCss) {
            link.as = 'script';
            link.crossOrigin = '';
        }
        link.href = dep;
        // @ts-ignore
        document.head.appendChild(link);
        if (isCss) {
            return new Promise((res, rej) => {
                link.addEventListener('load', res);
                link.addEventListener('error', () => rej(new Error(`Unable to preload CSS for ${dep}`)));
            });
        }
    })).then(() => baseModule());
}
/**
 * Build only. During serve this is performed as part of ./importAnalysis.
 */
function buildImportAnalysisPlugin(config) {
    const ssr = !!config.build.ssr;
    const insertPreload = !(ssr || !!config.build.lib);
    const isWorker = config.isWorker;
    const scriptRel = config.build.polyfillModulePreload
        ? `'modulepreload'`
        : `(${detectScriptRel.toString()})()`;
    const preloadCode = `const scriptRel = ${scriptRel};const seen = {};const base = '${preloadBaseMarker}';export const ${preloadMethod} = ${preload.toString()}`;
    const resolve = config.createResolver({
        preferRelative: true,
        tryIndex: false,
        extensions: []
    });
    return {
        name: 'vite:build-import-analysis',
        resolveId(id) {
            if (id === preloadHelperId) {
                return id;
            }
        },
        load(id) {
            if (id === preloadHelperId) {
                return preloadCode.replace(preloadBaseMarker, config.base);
            }
        },
        async transform(source, importer) {
            if (importer.includes('node_modules') &&
                !source.includes('import.meta.glob')) {
                return;
            }
            if (isWorker) {
                // preload method use `document` and can't run in the worker
                return;
            }
            await esModuleLexer.init;
            let imports = [];
            try {
                imports = esModuleLexer.parse(source)[0];
            }
            catch (e) {
                this.error(e, e.idx);
            }
            if (!imports.length) {
                return null;
            }
            let s;
            const str = () => s || (s = new MagicString__default(source));
            let needPreloadHelper = false;
            for (let index = 0; index < imports.length; index++) {
                const { s: start, e: end, ss: expStart, se: expEnd, n: specifier, d: dynamicIndex } = imports[index];
                // import.meta.glob
                if (source.slice(start, end) === 'import.meta' &&
                    source.slice(end, end + 5) === '.glob') {
                    const { importsString, exp, endIndex, isEager } = await transformImportGlob(source, start, importer, index, config.root, config.logger, undefined, resolve, insertPreload);
                    str().prepend(importsString);
                    str().overwrite(expStart, endIndex, exp, { contentOnly: true });
                    if (!isEager) {
                        needPreloadHelper = true;
                    }
                    continue;
                }
                if (dynamicIndex > -1 && insertPreload) {
                    needPreloadHelper = true;
                    const original = source.slice(expStart, expEnd);
                    const replacement = `${preloadMethod}(() => ${original},${isModernFlag}?"${preloadMarker}":void 0)`;
                    str().overwrite(expStart, expEnd, replacement, { contentOnly: true });
                }
                // Differentiate CSS imports that use the default export from those that
                // do not by injecting a ?used query - this allows us to avoid including
                // the CSS string when unnecessary (esbuild has trouble tree-shaking
                // them)
                if (specifier &&
                    isCSSRequest(specifier) &&
                    source.slice(expStart, start).includes('from') &&
                    // edge case for package names ending with .css (e.g normalize.css)
                    !(bareImportRE.test(specifier) && !specifier.includes('/'))) {
                    const url = specifier.replace(/\?|$/, (m) => `?used${m ? '&' : ''}`);
                    str().overwrite(start, end, dynamicIndex > -1 ? `'${url}'` : url, {
                        contentOnly: true
                    });
                }
            }
            if (needPreloadHelper &&
                insertPreload &&
                !source.includes(`const ${preloadMethod} =`)) {
                str().prepend(`import { ${preloadMethod} } from "${preloadHelperId}";`);
            }
            if (s) {
                return {
                    code: s.toString(),
                    map: config.build.sourcemap ? s.generateMap({ hires: true }) : null
                };
            }
        },
        renderChunk(code, _, { format }) {
            // make sure we only perform the preload logic in modern builds.
            if (code.indexOf(isModernFlag) > -1) {
                const re = new RegExp(isModernFlag, 'g');
                const isModern = String(format === 'es');
                if (config.build.sourcemap) {
                    const s = new MagicString__default(code);
                    let match;
                    while ((match = re.exec(code))) {
                        s.overwrite(match.index, match.index + isModernFlag.length, isModern, { contentOnly: true });
                    }
                    return {
                        code: s.toString(),
                        map: s.generateMap({ hires: true })
                    };
                }
                else {
                    return code.replace(re, isModern);
                }
            }
            return null;
        },
        generateBundle({ format }, bundle) {
            if (format !== 'es' || ssr || isWorker) {
                return;
            }
            for (const file in bundle) {
                const chunk = bundle[file];
                // can't use chunk.dynamicImports.length here since some modules e.g.
                // dynamic import to constant json may get inlined.
                if (chunk.type === 'chunk' && chunk.code.indexOf(preloadMarker) > -1) {
                    const code = chunk.code;
                    let imports;
                    try {
                        imports = esModuleLexer.parse(code)[0].filter((i) => i.d > -1);
                    }
                    catch (e) {
                        this.error(e, e.idx);
                    }
                    const s = new MagicString__default(code);
                    const rewroteMarkerStartPos = new Set(); // position of the leading double quote
                    if (imports.length) {
                        for (let index = 0; index < imports.length; index++) {
                            // To handle escape sequences in specifier strings, the .n field will be provided where possible.
                            const { n: name, s: start, e: end, ss: expStart, se: expEnd } = imports[index];
                            // check the chunk being imported
                            let url = name;
                            if (!url) {
                                const rawUrl = code.slice(start, end);
                                if (rawUrl[0] === `"` && rawUrl[rawUrl.length - 1] === `"`)
                                    url = rawUrl.slice(1, -1);
                            }
                            const deps = new Set();
                            let hasRemovedPureCssChunk = false;
                            if (url) {
                                const ownerFilename = chunk.fileName;
                                // literal import - trace direct imports and add to deps
                                const analyzed = new Set();
                                const addDeps = (filename) => {
                                    if (filename === ownerFilename)
                                        return;
                                    if (analyzed.has(filename))
                                        return;
                                    analyzed.add(filename);
                                    const chunk = bundle[filename];
                                    if (chunk) {
                                        deps.add(chunk.fileName);
                                        chunk.viteMetadata.importedCss.forEach((file) => {
                                            deps.add(file);
                                        });
                                        chunk.imports.forEach(addDeps);
                                    }
                                    else {
                                        const removedPureCssFiles = removedPureCssFilesCache.get(config);
                                        const chunk = removedPureCssFiles.get(filename);
                                        if (chunk) {
                                            if (chunk.viteMetadata.importedCss.size) {
                                                chunk.viteMetadata.importedCss.forEach((file) => {
                                                    deps.add(file);
                                                });
                                                hasRemovedPureCssChunk = true;
                                            }
                                            s.overwrite(expStart, expEnd, 'Promise.resolve({})', {
                                                contentOnly: true
                                            });
                                        }
                                    }
                                };
                                const normalizedFile = path__default.posix.join(path__default.posix.dirname(chunk.fileName), url);
                                addDeps(normalizedFile);
                            }
                            let markerStartPos = code.indexOf(preloadMarkerWithQuote, end);
                            // fix issue #3051
                            if (markerStartPos === -1 && imports.length === 1) {
                                markerStartPos = code.indexOf(preloadMarkerWithQuote);
                            }
                            if (markerStartPos > 0) {
                                s.overwrite(markerStartPos, markerStartPos + preloadMarkerWithQuote.length, 
                                // the dep list includes the main chunk, so only need to
                                // preload when there are actual other deps.
                                deps.size > 1 ||
                                    // main chunk is removed
                                    (hasRemovedPureCssChunk && deps.size > 0)
                                    ? `[${[...deps].map((d) => JSON.stringify(d)).join(',')}]`
                                    : `[]`, { contentOnly: true });
                                rewroteMarkerStartPos.add(markerStartPos);
                            }
                        }
                    }
                    // there may still be markers due to inlined dynamic imports, remove
                    // all the markers regardless
                    let markerStartPos = code.indexOf(preloadMarkerWithQuote);
                    while (markerStartPos >= 0) {
                        if (!rewroteMarkerStartPos.has(markerStartPos)) {
                            s.overwrite(markerStartPos, markerStartPos + preloadMarkerWithQuote.length, 'void 0', { contentOnly: true });
                        }
                        markerStartPos = code.indexOf(preloadMarkerWithQuote, markerStartPos + preloadMarkerWithQuote.length);
                    }
                    if (s.hasChanged()) {
                        chunk.code = s.toString();
                        if (config.build.sourcemap && chunk.map) {
                            const nextMap = s.generateMap({
                                source: chunk.fileName,
                                hires: true
                            });
                            const map = combineSourcemaps(chunk.fileName, [nextMap, chunk.map], false);
                            map.toUrl = () => genSourceMapUrl(map);
                            chunk.map = map;
                        }
                    }
                }
            }
        }
    };
}

const externalTypes = [
    'css',
    // supported pre-processor types
    'less',
    'sass',
    'scss',
    'styl',
    'stylus',
    'pcss',
    'postcss',
    // known SFC types
    'vue',
    'svelte',
    'marko',
    'astro',
    // JSX/TSX may be configured to be compiled differently from how esbuild
    // handles it by default, so exclude them as well
    'jsx',
    'tsx',
    ...KNOWN_ASSET_TYPES
];
function esbuildDepPlugin(qualified, exportsData, config) {
    // remove optimizable extensions from `externalTypes` list
    const allExternalTypes = config.optimizeDeps.extensions
        ? externalTypes.filter((type) => { var _a; return !((_a = config.optimizeDeps.extensions) === null || _a === void 0 ? void 0 : _a.includes('.' + type)); })
        : externalTypes;
    // default resolver which prefers ESM
    const _resolve = config.createResolver({ asSrc: false, scan: true });
    // cjs resolver that prefers Node
    const _resolveRequire = config.createResolver({
        asSrc: false,
        isRequire: true,
        scan: true
    });
    const resolve = (id, importer, kind, resolveDir) => {
        let _importer;
        // explicit resolveDir - this is passed only during yarn pnp resolve for
        // entries
        if (resolveDir) {
            _importer = normalizePath(path__default.join(resolveDir, '*'));
        }
        else {
            // map importer ids to file paths for correct resolution
            _importer = importer in qualified ? qualified[importer] : importer;
        }
        const resolver = kind.startsWith('require') ? _resolveRequire : _resolve;
        return resolver(id, _importer, undefined);
    };
    return {
        name: 'vite:dep-pre-bundle',
        setup(build) {
            // externalize assets and commonly known non-js file types
            build.onResolve({
                filter: new RegExp(`\\.(` + allExternalTypes.join('|') + `)(\\?.*)?$`)
            }, async ({ path: id, importer, kind }) => {
                const resolved = await resolve(id, importer, kind);
                if (resolved) {
                    return {
                        path: resolved,
                        external: true
                    };
                }
            });
            function resolveEntry(id) {
                const flatId = flattenId(id);
                if (flatId in qualified) {
                    return {
                        path: flatId,
                        namespace: 'dep'
                    };
                }
            }
            build.onResolve({ filter: /^[\w@][^:]/ }, async ({ path: id, importer, kind }) => {
                var _a;
                if (moduleListContains((_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.exclude, id)) {
                    return {
                        path: id,
                        external: true
                    };
                }
                // ensure esbuild uses our resolved entries
                let entry;
                // if this is an entry, return entry namespace resolve result
                if (!importer) {
                    if ((entry = resolveEntry(id)))
                        return entry;
                    // check if this is aliased to an entry - also return entry namespace
                    const aliased = await _resolve(id, undefined, true);
                    if (aliased && (entry = resolveEntry(aliased))) {
                        return entry;
                    }
                }
                // use vite's own resolver
                const resolved = await resolve(id, importer, kind);
                if (resolved) {
                    if (resolved.startsWith(browserExternalId)) {
                        return {
                            path: id,
                            namespace: 'browser-external'
                        };
                    }
                    if (isExternalUrl(resolved)) {
                        return {
                            path: resolved,
                            external: true
                        };
                    }
                    return {
                        path: path__default.resolve(resolved)
                    };
                }
            });
            // For entry files, we'll read it ourselves and construct a proxy module
            // to retain the entry's raw id instead of file path so that esbuild
            // outputs desired output file structure.
            // It is necessary to do the re-exporting to separate the virtual proxy
            // module from the actual module since the actual module may get
            // referenced via relative imports - if we don't separate the proxy and
            // the actual module, esbuild will create duplicated copies of the same
            // module!
            const root = path__default.resolve(config.root);
            build.onLoad({ filter: /.*/, namespace: 'dep' }, ({ path: id }) => {
                const entryFile = qualified[id];
                let relativePath = normalizePath(path__default.relative(root, entryFile));
                if (!relativePath.startsWith('./') &&
                    !relativePath.startsWith('../') &&
                    relativePath !== '.') {
                    relativePath = `./${relativePath}`;
                }
                let contents = '';
                const data = exportsData[id];
                const [imports, exports] = data;
                if (!imports.length && !exports.length) {
                    // cjs
                    contents += `export default require("${relativePath}");`;
                }
                else {
                    if (exports.includes('default')) {
                        contents += `import d from "${relativePath}";export default d;`;
                    }
                    if (data.hasReExports ||
                        exports.length > 1 ||
                        exports[0] !== 'default') {
                        contents += `\nexport * from "${relativePath}"`;
                    }
                }
                return {
                    loader: 'js',
                    contents,
                    resolveDir: root
                };
            });
            build.onLoad({ filter: /.*/, namespace: 'browser-external' }, ({ path: id }) => {
                return {
                    contents: `export default new Proxy({}, {
  get() {
    throw new Error('Module "${id}" has been externalized for ` +
                        `browser compatibility and cannot be accessed in client code.')
  }
})`
                };
            });
            // yarn 2 pnp compat
            if (isRunningWithYarnPnp) {
                build.onResolve({ filter: /.*/ }, async ({ path, importer, kind, resolveDir }) => ({
                    // pass along resolveDir for entries
                    path: await resolve(path, importer, kind, resolveDir)
                }));
                build.onLoad({ filter: /.*/ }, async (args) => ({
                    contents: await require('fs').promises.readFile(args.path),
                    loader: 'default'
                }));
            }
        }
    };
}

function prepareError(err) {
    // only copy the information we need and avoid serializing unnecessary
    // properties, since some errors may attach full objects (e.g. PostCSS)
    return {
        message: strip__default(err.message),
        stack: strip__default(cleanStack(err.stack || '')),
        id: err.id,
        frame: strip__default(err.frame || ''),
        plugin: err.plugin,
        pluginCode: err.pluginCode,
        loc: err.loc
    };
}
function buildErrorMessage(err, args = [], includeStack = true) {
    if (err.plugin)
        args.push(`  Plugin: ${colors__default.magenta(err.plugin)}`);
    if (err.id)
        args.push(`  File: ${colors__default.cyan(err.id)}`);
    if (err.frame)
        args.push(colors__default.yellow(pad(err.frame)));
    if (includeStack && err.stack)
        args.push(pad(cleanStack(err.stack)));
    return args.join('\n');
}
function cleanStack(stack) {
    return stack
        .split(/\n/g)
        .filter((l) => /^\s*at/.test(l))
        .join('\n');
}
function logError(server, err) {
    const msg = buildErrorMessage(err, [
        colors__default.red(`Internal server error: ${err.message}`)
    ]);
    server.config.logger.error(msg, {
        clear: true,
        timestamp: true,
        error: err
    });
    server.ws.send({
        type: 'error',
        err: prepareError(err)
    });
}
function errorMiddleware(server, allowNext = false) {
    // note the 4 args must be kept for connect to treat this as error middleware
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteErrorMiddleware(err, _req, res, next) {
        logError(server, err);
        if (allowNext) {
            next();
        }
        else {
            res.statusCode = 500;
            res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Error</title>
            <script type="module">
              import { ErrorOverlay } from '/@vite/client'
              document.body.appendChild(new ErrorOverlay(${JSON.stringify(prepareError(err)).replace(/</g, '\\u003c')}))
            </script>
          </head>
          <body>
          </body>
        </html>
      `);
        }
    };
}

/**
 * This file is refactored into TypeScript based on
 * https://github.com/preactjs/wmr/blob/main/packages/wmr/src/lib/rollup-plugin-container.js
 */
let parser = acorn__namespace.Parser;
async function createPluginContainer({ plugins, logger, root, build: { rollupOptions } }, moduleGraph, watcher) {
    const isDebug = process.env.DEBUG;
    const seenResolves = {};
    const debugResolve = createDebugger('vite:resolve');
    const debugPluginResolve = createDebugger('vite:plugin-resolve', {
        onlyWhenFocused: 'vite:plugin'
    });
    const debugPluginTransform = createDebugger('vite:plugin-transform', {
        onlyWhenFocused: 'vite:plugin'
    });
    // ---------------------------------------------------------------------------
    const watchFiles = new Set();
    // get rollup version
    const rollupPkgPath = path.resolve(require.resolve('rollup'), '../../package.json');
    const minimalContext = {
        meta: {
            rollupVersion: JSON.parse(fs__default.readFileSync(rollupPkgPath, 'utf-8'))
                .version,
            watchMode: true
        }
    };
    function warnIncompatibleMethod(method, plugin) {
        logger.warn(colors__default.cyan(`[plugin:${plugin}] `) +
            colors__default.yellow(`context method ${colors__default.bold(`${method}()`)} is not supported in serve mode. This plugin is likely not vite-compatible.`));
    }
    // throw when an unsupported ModuleInfo property is accessed,
    // so that incompatible plugins fail in a non-cryptic way.
    const ModuleInfoProxy = {
        get(info, key) {
            if (key in info) {
                return info[key];
            }
            throw Error(`[vite] The "${key}" property of ModuleInfo is not supported.`);
        }
    };
    // same default value of "moduleInfo.meta" as in Rollup
    const EMPTY_OBJECT = Object.freeze({});
    function getModuleInfo(id) {
        const module = moduleGraph === null || moduleGraph === void 0 ? void 0 : moduleGraph.getModuleById(id);
        if (!module) {
            return null;
        }
        if (!module.info) {
            module.info = new Proxy({ id, meta: module.meta || EMPTY_OBJECT }, ModuleInfoProxy);
        }
        return module.info;
    }
    function updateModuleInfo(id, { meta }) {
        if (meta) {
            const moduleInfo = getModuleInfo(id);
            if (moduleInfo) {
                moduleInfo.meta = { ...moduleInfo.meta, ...meta };
            }
        }
    }
    // we should create a new context for each async hook pipeline so that the
    // active plugin in that pipeline can be tracked in a concurrency-safe manner.
    // using a class to make creating new contexts more efficient
    class Context {
        constructor(initialPlugin) {
            this.meta = minimalContext.meta;
            this.ssr = false;
            this._scan = false;
            this._activeId = null;
            this._activeCode = null;
            this._addedImports = null;
            this._activePlugin = initialPlugin || null;
        }
        parse(code, opts = {}) {
            return parser.parse(code, {
                sourceType: 'module',
                ecmaVersion: 'latest',
                locations: true,
                ...opts
            });
        }
        async resolve(id, importer, options) {
            let skip;
            if ((options === null || options === void 0 ? void 0 : options.skipSelf) && this._activePlugin) {
                skip = new Set(this._resolveSkips);
                skip.add(this._activePlugin);
            }
            let out = await container.resolveId(id, importer, {
                skip,
                ssr: this.ssr,
                scan: this._scan
            });
            if (typeof out === 'string')
                out = { id: out };
            return out;
        }
        getModuleInfo(id) {
            return getModuleInfo(id);
        }
        getModuleIds() {
            return moduleGraph
                ? moduleGraph.idToModuleMap.keys()
                : Array.prototype[Symbol.iterator]();
        }
        addWatchFile(id) {
            watchFiles.add(id);
            (this._addedImports || (this._addedImports = new Set())).add(id);
            if (watcher)
                ensureWatchedFile(watcher, id, root);
        }
        getWatchFiles() {
            return [...watchFiles];
        }
        emitFile(assetOrFile) {
            warnIncompatibleMethod(`emitFile`, this._activePlugin.name);
            return '';
        }
        setAssetSource() {
            warnIncompatibleMethod(`setAssetSource`, this._activePlugin.name);
        }
        getFileName() {
            warnIncompatibleMethod(`getFileName`, this._activePlugin.name);
            return '';
        }
        warn(e, position) {
            const err = formatError(e, position, this);
            const msg = buildErrorMessage(err, [colors__default.yellow(`warning: ${err.message}`)], false);
            logger.warn(msg, {
                clear: true,
                timestamp: true
            });
        }
        error(e, position) {
            // error thrown here is caught by the transform middleware and passed on
            // the the error middleware.
            throw formatError(e, position, this);
        }
    }
    function formatError(e, position, ctx) {
        const err = (typeof e === 'string' ? new Error(e) : e);
        if (err.pluginCode) {
            return err; // The plugin likely called `this.error`
        }
        if (err.file && err.name === 'CssSyntaxError') {
            err.id = normalizePath(err.file);
        }
        if (ctx._activePlugin)
            err.plugin = ctx._activePlugin.name;
        if (ctx._activeId && !err.id)
            err.id = ctx._activeId;
        if (ctx._activeCode) {
            err.pluginCode = ctx._activeCode;
            const pos = position != null
                ? position
                : err.pos != null
                    ? err.pos
                    : // some rollup plugins, e.g. json, sets position instead of pos
                        err.position;
            if (pos != null) {
                let errLocation;
                try {
                    errLocation = numberToPos(ctx._activeCode, pos);
                }
                catch (err2) {
                    logger.error(colors__default.red(`Error in error handler:\n${err2.stack || err2.message}\n`), 
                    // print extra newline to separate the two errors
                    { error: err2 });
                    throw err;
                }
                err.loc = err.loc || {
                    file: err.id,
                    ...errLocation
                };
                err.frame = err.frame || generateCodeFrame(ctx._activeCode, pos);
            }
            else if (err.loc) {
                // css preprocessors may report errors in an included file
                if (!err.frame) {
                    let code = ctx._activeCode;
                    if (err.loc.file) {
                        err.id = normalizePath(err.loc.file);
                        try {
                            code = fs__default.readFileSync(err.loc.file, 'utf-8');
                        }
                        catch { }
                    }
                    err.frame = generateCodeFrame(code, err.loc);
                }
            }
            else if (err.line && err.column) {
                err.loc = {
                    file: err.id,
                    line: err.line,
                    column: err.column
                };
                err.frame = err.frame || generateCodeFrame(err.id, err.loc);
            }
            if (err.loc && ctx instanceof TransformContext) {
                const rawSourceMap = ctx._getCombinedSourcemap();
                if (rawSourceMap) {
                    const traced = new traceMapping.TraceMap(rawSourceMap);
                    const { source, line, column } = traceMapping.originalPositionFor(traced, {
                        line: Number(err.loc.line),
                        column: Number(err.loc.column)
                    });
                    if (source && line != null && column != null) {
                        err.loc = { file: source, line, column };
                    }
                }
            }
        }
        return err;
    }
    class TransformContext extends Context {
        constructor(filename, code, inMap) {
            super();
            this.originalSourcemap = null;
            this.sourcemapChain = [];
            this.combinedMap = null;
            this.filename = filename;
            this.originalCode = code;
            if (inMap) {
                this.sourcemapChain.push(inMap);
            }
        }
        _getCombinedSourcemap(createIfNull = false) {
            let combinedMap = this.combinedMap;
            for (let m of this.sourcemapChain) {
                if (typeof m === 'string')
                    m = JSON.parse(m);
                if (!('version' in m)) {
                    // empty, nullified source map
                    combinedMap = this.combinedMap = null;
                    this.sourcemapChain.length = 0;
                    break;
                }
                if (!combinedMap) {
                    combinedMap = m;
                }
                else {
                    combinedMap = combineSourcemaps(cleanUrl(this.filename), [
                        {
                            ...m,
                            sourcesContent: combinedMap.sourcesContent
                        },
                        combinedMap
                    ]);
                }
            }
            if (!combinedMap) {
                return createIfNull
                    ? new MagicString__default(this.originalCode).generateMap({
                        includeContent: true,
                        hires: true,
                        source: cleanUrl(this.filename)
                    })
                    : null;
            }
            if (combinedMap !== this.combinedMap) {
                this.combinedMap = combinedMap;
                this.sourcemapChain.length = 0;
            }
            return this.combinedMap;
        }
        getCombinedSourcemap() {
            return this._getCombinedSourcemap(true);
        }
    }
    let closed = false;
    const container = {
        options: await (async () => {
            let options = rollupOptions;
            for (const plugin of plugins) {
                if (!plugin.options)
                    continue;
                options =
                    (await plugin.options.call(minimalContext, options)) || options;
            }
            if (options.acornInjectPlugins) {
                parser = acorn__namespace.Parser.extend(options.acornInjectPlugins);
            }
            return {
                acorn: acorn__namespace,
                acornInjectPlugins: [],
                ...options
            };
        })(),
        getModuleInfo,
        async buildStart() {
            await Promise.all(plugins.map((plugin) => {
                if (plugin.buildStart) {
                    return plugin.buildStart.call(new Context(plugin), container.options);
                }
            }));
        },
        async resolveId(rawId, importer = path.join(root, 'index.html'), options) {
            const skip = options === null || options === void 0 ? void 0 : options.skip;
            const ssr = options === null || options === void 0 ? void 0 : options.ssr;
            const scan = !!(options === null || options === void 0 ? void 0 : options.scan);
            const ctx = new Context();
            ctx.ssr = !!ssr;
            ctx._scan = scan;
            ctx._resolveSkips = skip;
            const resolveStart = isDebug ? perf_hooks.performance.now() : 0;
            let id = null;
            const partial = {};
            for (const plugin of plugins) {
                if (!plugin.resolveId)
                    continue;
                if (skip === null || skip === void 0 ? void 0 : skip.has(plugin))
                    continue;
                ctx._activePlugin = plugin;
                const pluginResolveStart = isDebug ? perf_hooks.performance.now() : 0;
                const result = await plugin.resolveId.call(ctx, rawId, importer, { ssr, scan });
                if (!result)
                    continue;
                if (typeof result === 'string') {
                    id = result;
                }
                else {
                    id = result.id;
                    Object.assign(partial, result);
                }
                isDebug &&
                    debugPluginResolve(timeFrom(pluginResolveStart), plugin.name, prettifyUrl(id, root));
                // resolveId() is hookFirst - first non-null result is returned.
                break;
            }
            if (isDebug && rawId !== id && !rawId.startsWith(FS_PREFIX)) {
                const key = rawId + id;
                // avoid spamming
                if (!seenResolves[key]) {
                    seenResolves[key] = true;
                    debugResolve(`${timeFrom(resolveStart)} ${colors__default.cyan(rawId)} -> ${colors__default.dim(id)}`);
                }
            }
            if (id) {
                partial.id = isExternalUrl(id) ? id : normalizePath(id);
                return partial;
            }
            else {
                return null;
            }
        },
        async load(id, options) {
            const ssr = options === null || options === void 0 ? void 0 : options.ssr;
            const ctx = new Context();
            ctx.ssr = !!ssr;
            for (const plugin of plugins) {
                if (!plugin.load)
                    continue;
                ctx._activePlugin = plugin;
                const result = await plugin.load.call(ctx, id, { ssr });
                if (result != null) {
                    if (isObject(result)) {
                        updateModuleInfo(id, result);
                    }
                    return result;
                }
            }
            return null;
        },
        async transform(code, id, options) {
            const inMap = options === null || options === void 0 ? void 0 : options.inMap;
            const ssr = options === null || options === void 0 ? void 0 : options.ssr;
            const ctx = new TransformContext(id, code, inMap);
            ctx.ssr = !!ssr;
            for (const plugin of plugins) {
                if (!plugin.transform)
                    continue;
                ctx._activePlugin = plugin;
                ctx._activeId = id;
                ctx._activeCode = code;
                const start = isDebug ? perf_hooks.performance.now() : 0;
                let result;
                try {
                    result = await plugin.transform.call(ctx, code, id, { ssr });
                }
                catch (e) {
                    ctx.error(e);
                }
                if (!result)
                    continue;
                isDebug &&
                    debugPluginTransform(timeFrom(start), plugin.name, prettifyUrl(id, root));
                if (isObject(result)) {
                    if (result.code !== undefined) {
                        code = result.code;
                        if (result.map) {
                            ctx.sourcemapChain.push(result.map);
                        }
                    }
                    updateModuleInfo(id, result);
                }
                else {
                    code = result;
                }
            }
            return {
                code,
                map: ctx._getCombinedSourcemap()
            };
        },
        async close() {
            if (closed)
                return;
            const ctx = new Context();
            await Promise.all(plugins.map((p) => p.buildEnd && p.buildEnd.call(ctx)));
            await Promise.all(plugins.map((p) => p.closeBundle && p.closeBundle.call(ctx)));
            closed = true;
        }
    };
    return container;
}

const debug$8 = createDebugger('vite:deps');
const htmlTypesRE = /\.(html|vue|svelte|astro)$/;
// A simple regex to detect import sources. This is only used on
// <script lang="ts"> blocks in vue (setup only) or svelte files, since
// seemingly unused imports are dropped by esbuild when transpiling TS which
// prevents it from crawling further.
// We can't use es-module-lexer because it can't handle TS, and don't want to
// use Acorn because it's slow. Luckily this doesn't have to be bullet proof
// since even missed imports can be caught at runtime, and false positives will
// simply be ignored.
const importsRE = /(?<!\/\/.*)(?<=^|;|\*\/)\s*import(?!\s+type)(?:[\w*{}\n\r\t, ]+from\s*)?\s*("[^"]+"|'[^']+')\s*(?=$|;|\/\/|\/\*)/gm;
async function scanImports(config) {
    var _a, _b, _c;
    const start = perf_hooks.performance.now();
    let entries = [];
    const explicitEntryPatterns = config.optimizeDeps.entries;
    const buildInput = (_a = config.build.rollupOptions) === null || _a === void 0 ? void 0 : _a.input;
    if (explicitEntryPatterns) {
        entries = await globEntries(explicitEntryPatterns, config);
    }
    else if (buildInput) {
        const resolvePath = (p) => path__default.resolve(config.root, p);
        if (typeof buildInput === 'string') {
            entries = [resolvePath(buildInput)];
        }
        else if (Array.isArray(buildInput)) {
            entries = buildInput.map(resolvePath);
        }
        else if (isObject(buildInput)) {
            entries = Object.values(buildInput).map(resolvePath);
        }
        else {
            throw new Error('invalid rollupOptions.input value.');
        }
    }
    else {
        entries = await globEntries('**/*.html', config);
    }
    // Non-supported entry file types and virtual files should not be scanned for
    // dependencies.
    entries = entries.filter((entry) => (JS_TYPES_RE.test(entry) || htmlTypesRE.test(entry)) &&
        fs__default.existsSync(entry));
    if (!entries.length) {
        if (!explicitEntryPatterns && !config.optimizeDeps.include) {
            config.logger.warn(colors__default.yellow('(!) Could not auto-determine entry point from rollupOptions or html files ' +
                'and there are no explicit optimizeDeps.include patterns. ' +
                'Skipping dependency pre-bundling.'));
        }
        return { deps: {}, missing: {} };
    }
    else {
        debug$8(`Crawling dependencies using entries:\n  ${entries.join('\n  ')}`);
    }
    const deps = {};
    const missing = {};
    const container = await createPluginContainer(config);
    const plugin = esbuildScanPlugin(config, container, deps, missing, entries);
    const { plugins = [], ...esbuildOptions } = (_c = (_b = config.optimizeDeps) === null || _b === void 0 ? void 0 : _b.esbuildOptions) !== null && _c !== void 0 ? _c : {};
    await Promise.all(entries.map((entry) => esbuild.build({
        absWorkingDir: process.cwd(),
        write: false,
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        logLevel: 'error',
        plugins: [...plugins, plugin],
        ...esbuildOptions
    })));
    debug$8(`Scan completed in ${(perf_hooks.performance.now() - start).toFixed(2)}ms:`, deps);
    return {
        // Ensure a fixed order so hashes are stable and improve logs
        deps: orderedDependencies(deps),
        missing
    };
}
function orderedDependencies(deps) {
    const depsList = Object.entries(deps);
    // Ensure the same browserHash for the same set of dependencies
    depsList.sort((a, b) => a[0].localeCompare(b[0]));
    return Object.fromEntries(depsList);
}
function globEntries(pattern, config) {
    return glob__default(pattern, {
        cwd: config.root,
        ignore: [
            '**/node_modules/**',
            `**/${config.build.outDir}/**`,
            // if there aren't explicit entries, also ignore other common folders
            ...(config.optimizeDeps.entries
                ? []
                : [`**/__tests__/**`, `**/coverage/**`])
        ],
        absolute: true
    });
}
const scriptModuleRE = /(<script\b[^>]*type\s*=\s*(?:"module"|'module')[^>]*>)(.*?)<\/script>/gims;
const scriptRE = /(<script\b(?:\s[^>]*>|>))(.*?)<\/script>/gims;
const commentRE = /<!--.*?-->/gs;
const srcRE = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
const typeRE = /\btype\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
const langRE = /\blang\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
const contextRE = /\bcontext\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
function esbuildScanPlugin(config, container, depImports, missing, entries) {
    var _a, _b;
    const seen = new Map();
    const resolve = async (id, importer) => {
        const key = id + (importer && path__default.dirname(importer));
        if (seen.has(key)) {
            return seen.get(key);
        }
        const resolved = await container.resolveId(id, importer && normalizePath(importer), {
            scan: true
        });
        const res = resolved === null || resolved === void 0 ? void 0 : resolved.id;
        seen.set(key, res);
        return res;
    };
    const include = (_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.include;
    const exclude = [
        ...(((_b = config.optimizeDeps) === null || _b === void 0 ? void 0 : _b.exclude) || []),
        '@vite/client',
        '@vite/env'
    ];
    const isOptimizable = (id) => {
        var _a;
        return OPTIMIZABLE_ENTRY_RE.test(id) ||
            !!((_a = config.optimizeDeps.extensions) === null || _a === void 0 ? void 0 : _a.some((ext) => id.endsWith(ext)));
    };
    const externalUnlessEntry = ({ path }) => ({
        path,
        external: !entries.includes(path)
    });
    return {
        name: 'vite:dep-scan',
        setup(build) {
            const scripts = {};
            // external urls
            build.onResolve({ filter: externalRE }, ({ path }) => ({
                path,
                external: true
            }));
            // data urls
            build.onResolve({ filter: dataUrlRE }, ({ path }) => ({
                path,
                external: true
            }));
            // local scripts (`<script>` in Svelte and `<script setup>` in Vue)
            build.onResolve({ filter: virtualModuleRE }, ({ path }) => {
                return {
                    // strip prefix to get valid filesystem path so esbuild can resolve imports in the file
                    path: path.replace(virtualModulePrefix, ''),
                    namespace: 'script'
                };
            });
            build.onLoad({ filter: /.*/, namespace: 'script' }, ({ path }) => {
                return scripts[path];
            });
            // html types: extract script contents -----------------------------------
            build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
                const resolved = await resolve(path, importer);
                if (!resolved)
                    return;
                // It is possible for the scanner to scan html types in node_modules.
                // If we can optimize this html type, skip it so it's handled by the
                // bare import resolve, and recorded as optimization dep.
                if (resolved.includes('node_modules') && isOptimizable(resolved))
                    return;
                return {
                    path: resolved,
                    namespace: 'html'
                };
            });
            // extract scripts inside HTML-like files and treat it as a js module
            build.onLoad({ filter: htmlTypesRE, namespace: 'html' }, async ({ path }) => {
                let raw = fs__default.readFileSync(path, 'utf-8');
                // Avoid matching the content of the comment
                raw = raw.replace(commentRE, '<!---->');
                const isHtml = path.endsWith('.html');
                const regex = isHtml ? scriptModuleRE : scriptRE;
                regex.lastIndex = 0;
                let js = '';
                let scriptId = 0;
                let match;
                while ((match = regex.exec(raw))) {
                    const [, openTag, content] = match;
                    const typeMatch = openTag.match(typeRE);
                    const type = typeMatch && (typeMatch[1] || typeMatch[2] || typeMatch[3]);
                    const langMatch = openTag.match(langRE);
                    const lang = langMatch && (langMatch[1] || langMatch[2] || langMatch[3]);
                    // skip type="application/ld+json" and other non-JS types
                    if (type &&
                        !(type.includes('javascript') ||
                            type.includes('ecmascript') ||
                            type === 'module')) {
                        continue;
                    }
                    let loader = 'js';
                    if (lang === 'ts' || lang === 'tsx' || lang === 'jsx') {
                        loader = lang;
                    }
                    const srcMatch = openTag.match(srcRE);
                    if (srcMatch) {
                        const src = srcMatch[1] || srcMatch[2] || srcMatch[3];
                        js += `import ${JSON.stringify(src)}\n`;
                    }
                    else if (content.trim()) {
                        // The reason why virtual modules are needed:
                        // 1. There can be module scripts (`<script context="module">` in Svelte and `<script>` in Vue)
                        // or local scripts (`<script>` in Svelte and `<script setup>` in Vue)
                        // 2. There can be multiple module scripts in html
                        // We need to handle these separately in case variable names are reused between them
                        // append imports in TS to prevent esbuild from removing them
                        // since they may be used in the template
                        const contents = content +
                            (loader.startsWith('ts') ? extractImportPaths(content) : '');
                        const key = `${path}?id=${scriptId++}`;
                        if (contents.includes('import.meta.glob')) {
                            scripts[key] = {
                                // transformGlob already transforms to js
                                loader: 'js',
                                contents: await transformGlob(contents, path, config.root, loader, resolve, config.logger)
                            };
                        }
                        else {
                            scripts[key] = {
                                loader,
                                contents
                            };
                        }
                        const virtualModulePath = JSON.stringify(virtualModulePrefix + key);
                        const contextMatch = openTag.match(contextRE);
                        const context = contextMatch &&
                            (contextMatch[1] || contextMatch[2] || contextMatch[3]);
                        // Especially for Svelte files, exports in <script context="module"> means module exports,
                        // exports in <script> means component props. To avoid having two same export name from the
                        // star exports, we need to ignore exports in <script>
                        if (path.endsWith('.svelte') && context !== 'module') {
                            js += `import ${virtualModulePath}\n`;
                        }
                        else {
                            js += `export * from ${virtualModulePath}\n`;
                        }
                    }
                }
                // This will trigger incorrectly if `export default` is contained
                // anywhere in a string. Svelte and Astro files can't have
                // `export default` as code so we know if it's encountered it's a
                // false positive (e.g. contained in a string)
                if (!path.endsWith('.vue') || !js.includes('export default')) {
                    js += '\nexport default {}';
                }
                return {
                    loader: 'js',
                    contents: js
                };
            });
            // bare imports: record and externalize ----------------------------------
            build.onResolve({
                // avoid matching windows volume
                filter: /^[\w@][^:]/
            }, async ({ path: id, importer }) => {
                if (moduleListContains(exclude, id)) {
                    return externalUnlessEntry({ path: id });
                }
                if (depImports[id]) {
                    return externalUnlessEntry({ path: id });
                }
                const resolved = await resolve(id, importer);
                if (resolved) {
                    if (shouldExternalizeDep(resolved, id)) {
                        return externalUnlessEntry({ path: id });
                    }
                    if (resolved.includes('node_modules') || (include === null || include === void 0 ? void 0 : include.includes(id))) {
                        // dependency or forced included, externalize and stop crawling
                        if (isOptimizable(resolved)) {
                            depImports[id] = resolved;
                        }
                        return externalUnlessEntry({ path: id });
                    }
                    else if (isScannable(resolved)) {
                        const namespace = htmlTypesRE.test(resolved) ? 'html' : undefined;
                        // linked package, keep crawling
                        return {
                            path: path__default.resolve(resolved),
                            namespace
                        };
                    }
                    else {
                        return externalUnlessEntry({ path: id });
                    }
                }
                else {
                    missing[id] = normalizePath(importer);
                }
            });
            // Externalized file types -----------------------------------------------
            // these are done on raw ids using esbuild's native regex filter so it
            // should be faster than doing it in the catch-all via js
            // they are done after the bare import resolve because a package name
            // may end with these extensions
            // css & json
            build.onResolve({
                filter: /\.(css|less|sass|scss|styl|stylus|pcss|postcss|json)$/
            }, externalUnlessEntry);
            // known asset types
            build.onResolve({
                filter: new RegExp(`\\.(${KNOWN_ASSET_TYPES.join('|')})$`)
            }, externalUnlessEntry);
            // known vite query types: ?worker, ?raw
            build.onResolve({ filter: SPECIAL_QUERY_RE }, ({ path }) => ({
                path,
                external: true
            }));
            // catch all -------------------------------------------------------------
            build.onResolve({
                filter: /.*/
            }, async ({ path: id, importer }) => {
                // use vite resolver to support urls and omitted extensions
                const resolved = await resolve(id, importer);
                if (resolved) {
                    if (shouldExternalizeDep(resolved, id) || !isScannable(resolved)) {
                        return externalUnlessEntry({ path: id });
                    }
                    const namespace = htmlTypesRE.test(resolved) ? 'html' : undefined;
                    return {
                        path: path__default.resolve(cleanUrl(resolved)),
                        namespace
                    };
                }
                else {
                    // resolve failed... probably unsupported type
                    return externalUnlessEntry({ path: id });
                }
            });
            // for jsx/tsx, we need to access the content and check for
            // presence of import.meta.glob, since it results in import relationships
            // but isn't crawled by esbuild.
            build.onLoad({ filter: JS_TYPES_RE }, ({ path: id }) => {
                var _a, _b, _c;
                let ext = path__default.extname(id).slice(1);
                if (ext === 'mjs')
                    ext = 'js';
                let contents = fs__default.readFileSync(id, 'utf-8');
                if (ext.endsWith('x') && config.esbuild && config.esbuild.jsxInject) {
                    contents = config.esbuild.jsxInject + `\n` + contents;
                }
                const loader = ((_c = (_b = (_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.esbuildOptions) === null || _b === void 0 ? void 0 : _b.loader) === null || _c === void 0 ? void 0 : _c[`.${ext}`]) ||
                    ext;
                if (contents.includes('import.meta.glob')) {
                    return transformGlob(contents, id, config.root, loader, resolve, config.logger).then((contents) => ({
                        loader,
                        contents
                    }));
                }
                return {
                    loader,
                    contents
                };
            });
        }
    };
}
async function transformGlob(source, importer, root, loader, resolve, logger) {
    // transform the content first since es-module-lexer can't handle non-js
    if (loader !== 'js') {
        source = (await esbuild.transform(source, { loader })).code;
    }
    await esModuleLexer.init;
    const imports = esModuleLexer.parse(source)[0];
    const s = new MagicString__default(source);
    for (let index = 0; index < imports.length; index++) {
        const { s: start, e: end, ss: expStart } = imports[index];
        const url = source.slice(start, end);
        if (url !== 'import.meta')
            continue;
        if (source.slice(end, end + 5) !== '.glob')
            continue;
        const { importsString, exp, endIndex } = await transformImportGlob(source, start, normalizePath(importer), index, root, logger, undefined, resolve);
        s.prepend(importsString);
        s.overwrite(expStart, endIndex, exp, { contentOnly: true });
    }
    return s.toString();
}
/**
 * when using TS + (Vue + `<script setup>`) or Svelte, imports may seem
 * unused to esbuild and dropped in the build output, which prevents
 * esbuild from crawling further.
 * the solution is to add `import 'x'` for every source to force
 * esbuild to keep crawling due to potential side effects.
 */
function extractImportPaths(code) {
    // empty singleline & multiline comments to avoid matching comments
    code = code
        .replace(multilineCommentsRE, '/* */')
        .replace(singlelineCommentsRE, '');
    let js = '';
    let m;
    while ((m = importsRE.exec(code)) != null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === importsRE.lastIndex) {
            importsRE.lastIndex++;
        }
        js += `\nimport ${m[1]}`;
    }
    return js;
}
function shouldExternalizeDep(resolvedId, rawId) {
    // not a valid file path
    if (!path__default.isAbsolute(resolvedId)) {
        return true;
    }
    // virtual id
    if (resolvedId === rawId || resolvedId.includes('\0')) {
        return true;
    }
    return false;
}
function isScannable(id) {
    return JS_TYPES_RE.test(id) || htmlTypesRE.test(id);
}

const debuggerViteDeps = createDebugger('vite:deps');
const debug$7 = debuggerViteDeps;
const isDebugEnabled$1 = _debug__default('vite:deps').enabled;
const jsExtensionRE = /\.js$/i;
const jsMapExtensionRE = /\.js\.map$/i;
/**
 * Used by Vite CLI when running `vite optimize`
 */
async function optimizeDeps(config, force = config.server.force, asCommand = false) {
    const log = asCommand ? config.logger.info : debug$7;
    const cachedMetadata = loadCachedDepOptimizationMetadata(config, force, asCommand);
    if (cachedMetadata) {
        return cachedMetadata;
    }
    const depsInfo = await discoverProjectDependencies(config);
    const depsString = depsLogString(Object.keys(depsInfo));
    log(colors__default.green(`Optimizing dependencies:\n  ${depsString}`));
    const result = await runOptimizeDeps(config, depsInfo);
    result.commit();
    return result.metadata;
}
function createOptimizedDepsMetadata(config, timestamp) {
    const hash = getDepHash(config);
    return {
        hash,
        browserHash: getOptimizedBrowserHash(hash, {}, timestamp),
        optimized: {},
        chunks: {},
        discovered: {},
        depInfoList: []
    };
}
function addOptimizedDepInfo(metadata, type, depInfo) {
    metadata[type][depInfo.id] = depInfo;
    metadata.depInfoList.push(depInfo);
    return depInfo;
}
/**
 * Creates the initial dep optimization metadata, loading it from the deps cache
 * if it exists and pre-bundling isn't forced
 */
function loadCachedDepOptimizationMetadata(config, force = config.server.force, asCommand = false) {
    const log = asCommand ? config.logger.info : debug$7;
    // Before Vite 2.9, dependencies were cached in the root of the cacheDir
    // For compat, we remove the cache if we find the old structure
    if (fs__default.existsSync(path__default.join(config.cacheDir, '_metadata.json'))) {
        emptyDir(config.cacheDir);
    }
    const depsCacheDir = getDepsCacheDir(config);
    if (!force) {
        let cachedMetadata;
        try {
            const cachedMetadataPath = path__default.join(depsCacheDir, '_metadata.json');
            cachedMetadata = parseOptimizedDepsMetadata(fs__default.readFileSync(cachedMetadataPath, 'utf-8'), depsCacheDir);
        }
        catch (e) { }
        // hash is consistent, no need to re-bundle
        if (cachedMetadata && cachedMetadata.hash === getDepHash(config)) {
            log('Hash is consistent. Skipping. Use --force to override.');
            // Nothing to commit or cancel as we are using the cache, we only
            // need to resolve the processing promise so requests can move on
            return cachedMetadata;
        }
    }
    else {
        config.logger.info('Forced re-optimization of dependencies');
    }
    // Start with a fresh cache
    removeDirSync(depsCacheDir);
}
/**
 * Initial optimizeDeps at server start. Perform a fast scan using esbuild to
 * find deps to pre-bundle and include user hard-coded dependencies
 */
async function discoverProjectDependencies(config, timestamp) {
    const { deps, missing } = await scanImports(config);
    const missingIds = Object.keys(missing);
    if (missingIds.length) {
        throw new Error(`The following dependencies are imported but could not be resolved:\n\n  ${missingIds
            .map((id) => `${colors__default.cyan(id)} ${colors__default.white(colors__default.dim(`(imported by ${missing[id]})`))}`)
            .join(`\n  `)}\n\nAre they installed?`);
    }
    await addManuallyIncludedOptimizeDeps(deps, config);
    const browserHash = getOptimizedBrowserHash(getDepHash(config), deps, timestamp);
    const discovered = {};
    for (const id in deps) {
        const entry = deps[id];
        discovered[id] = {
            id,
            file: getOptimizedDepPath(id, config),
            src: entry,
            browserHash: browserHash
        };
    }
    return discovered;
}
function depsLogString(qualifiedIds) {
    if (isDebugEnabled$1) {
        return colors__default.yellow(qualifiedIds.join(`\n  `));
    }
    else {
        const total = qualifiedIds.length;
        const maxListed = 5;
        const listed = Math.min(total, maxListed);
        const extra = Math.max(0, total - maxListed);
        return colors__default.yellow(qualifiedIds.slice(0, listed).join(`, `) +
            (extra > 0 ? `, ...and ${extra} more` : ``));
    }
}
/**
 * Internally, Vite uses this function to prepare a optimizeDeps run. When Vite starts, we can get
 * the metadata and start the server without waiting for the optimizeDeps processing to be completed
 */
async function runOptimizeDeps(config, depsInfo) {
    var _a, _b, _c, _d, _e;
    config = {
        ...config,
        command: 'build'
    };
    const depsCacheDir = getDepsCacheDir(config);
    const processingCacheDir = getProcessingDepsCacheDir(config);
    // Create a temporal directory so we don't need to delete optimized deps
    // until they have been processed. This also avoids leaving the deps cache
    // directory in a corrupted state if there is an error
    if (fs__default.existsSync(processingCacheDir)) {
        emptyDir(processingCacheDir);
    }
    else {
        fs__default.mkdirSync(processingCacheDir, { recursive: true });
    }
    // a hint for Node.js
    // all files in the cache directory should be recognized as ES modules
    writeFile(path__default.resolve(processingCacheDir, 'package.json'), JSON.stringify({ type: 'module' }));
    const metadata = createOptimizedDepsMetadata(config);
    metadata.browserHash = getOptimizedBrowserHash(metadata.hash, depsFromOptimizedDepInfo(depsInfo));
    // We prebundle dependencies with esbuild and cache them, but there is no need
    // to wait here. Code that needs to access the cached deps needs to await
    // the optimizedDepInfo.processing promise for each dep
    const qualifiedIds = Object.keys(depsInfo);
    if (!qualifiedIds.length) {
        return {
            metadata,
            commit() {
                // Write metadata file, delete `deps` folder and rename the `processing` folder to `deps`
                commitProcessingDepsCacheSync();
            },
            cancel
        };
    }
    // esbuild generates nested directory output with lowest common ancestor base
    // this is unpredictable and makes it difficult to analyze entry / output
    // mapping. So what we do here is:
    // 1. flatten all ids to eliminate slash
    // 2. in the plugin, read the entry ourselves as virtual files to retain the
    //    path.
    const flatIdDeps = {};
    const idToExports = {};
    const flatIdToExports = {};
    const { plugins = [], ...esbuildOptions } = (_b = (_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.esbuildOptions) !== null && _b !== void 0 ? _b : {};
    await esModuleLexer.init;
    for (const id in depsInfo) {
        const flatId = flattenId(id);
        const filePath = (flatIdDeps[flatId] = depsInfo[id].src);
        let exportsData;
        if ((_c = config.optimizeDeps.extensions) === null || _c === void 0 ? void 0 : _c.some((ext) => filePath.endsWith(ext))) {
            // For custom supported extensions, build the entry file to transform it into JS,
            // and then parse with es-module-lexer. Note that the `bundle` option is not `true`,
            // so only the entry file is being transformed.
            const result = await esbuild.build({
                ...esbuildOptions,
                plugins,
                entryPoints: [filePath],
                write: false,
                format: 'esm'
            });
            exportsData = esModuleLexer.parse(result.outputFiles[0].text);
        }
        else {
            const entryContent = fs__default.readFileSync(filePath, 'utf-8');
            try {
                exportsData = esModuleLexer.parse(entryContent);
            }
            catch {
                const loader = ((_d = esbuildOptions.loader) === null || _d === void 0 ? void 0 : _d[path__default.extname(filePath)]) || 'jsx';
                debug$7(`Unable to parse dependency: ${id}. Trying again with a ${loader} transform.`);
                const transformed = await transformWithEsbuild(entryContent, filePath, {
                    loader
                });
                // Ensure that optimization won't fail by defaulting '.js' to the JSX parser.
                // This is useful for packages such as Gatsby.
                esbuildOptions.loader = {
                    '.js': 'jsx',
                    ...esbuildOptions.loader
                };
                exportsData = esModuleLexer.parse(transformed.code);
            }
            for (const { ss, se } of exportsData[0]) {
                const exp = entryContent.slice(ss, se);
                if (/export\s+\*\s+from/.test(exp)) {
                    exportsData.hasReExports = true;
                }
            }
        }
        idToExports[id] = exportsData;
        flatIdToExports[flatId] = exportsData;
    }
    const define = {
        'process.env.NODE_ENV': JSON.stringify(config.mode)
    };
    for (const key in config.define) {
        const value = config.define[key];
        define[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    const start = perf_hooks.performance.now();
    const result = await esbuild.build({
        absWorkingDir: process.cwd(),
        entryPoints: Object.keys(flatIdDeps),
        bundle: true,
        format: 'esm',
        target: config.build.target || undefined,
        external: (_e = config.optimizeDeps) === null || _e === void 0 ? void 0 : _e.exclude,
        logLevel: 'error',
        splitting: true,
        sourcemap: true,
        outdir: processingCacheDir,
        ignoreAnnotations: true,
        metafile: true,
        define,
        plugins: [
            ...plugins,
            esbuildDepPlugin(flatIdDeps, flatIdToExports, config)
        ],
        ...esbuildOptions
    });
    const meta = result.metafile;
    // the paths in `meta.outputs` are relative to `process.cwd()`
    const processingCacheDirOutputPath = path__default.relative(process.cwd(), processingCacheDir);
    for (const id in depsInfo) {
        const output = esbuildOutputFromId(meta.outputs, id, processingCacheDir);
        addOptimizedDepInfo(metadata, 'optimized', {
            ...depsInfo[id],
            needsInterop: needsInterop(id, idToExports[id], output),
            // We only need to hash the output.imports in to check for stability, but adding the hash
            // and file path gives us a unique hash that may be useful for other things in the future
            fileHash: getHash(metadata.hash + depsInfo[id].file + JSON.stringify(output.imports)),
            browserHash: metadata.browserHash
        });
    }
    for (const o of Object.keys(meta.outputs)) {
        if (!o.match(jsMapExtensionRE)) {
            const id = path__default
                .relative(processingCacheDirOutputPath, o)
                .replace(jsExtensionRE, '');
            const file = getOptimizedDepPath(id, config);
            if (!findOptimizedDepInfoInRecord(metadata.optimized, (depInfo) => depInfo.file === file)) {
                addOptimizedDepInfo(metadata, 'chunks', {
                    id,
                    file,
                    needsInterop: false,
                    browserHash: metadata.browserHash
                });
            }
        }
    }
    const dataPath = path__default.join(processingCacheDir, '_metadata.json');
    writeFile(dataPath, stringifyOptimizedDepsMetadata(metadata, depsCacheDir));
    debug$7(`deps bundled in ${(perf_hooks.performance.now() - start).toFixed(2)}ms`);
    return {
        metadata,
        commit() {
            // Write metadata file, delete `deps` folder and rename the new `processing` folder to `deps` in sync
            commitProcessingDepsCacheSync();
        },
        cancel
    };
    function commitProcessingDepsCacheSync() {
        // Processing is done, we can now replace the depsCacheDir with processingCacheDir
        // Rewire the file paths from the temporal processing dir to the final deps cache dir
        removeDirSync(depsCacheDir);
        fs__default.renameSync(processingCacheDir, depsCacheDir);
    }
    function cancel() {
        removeDirSync(processingCacheDir);
    }
}
function removeDirSync(dir) {
    var _a;
    if (fs__default.existsSync(dir)) {
        const rmSync = (_a = fs__default.rmSync) !== null && _a !== void 0 ? _a : fs__default.rmdirSync; // TODO: Remove after support for Node 12 is dropped
        rmSync(dir, { recursive: true });
    }
}
async function findKnownImports(config) {
    const deps = (await scanImports(config)).deps;
    await addManuallyIncludedOptimizeDeps(deps, config);
    return Object.keys(deps);
}
async function addManuallyIncludedOptimizeDeps(deps, config) {
    var _a;
    const include = (_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.include;
    if (include) {
        const resolve = config.createResolver({ asSrc: false });
        for (const id of include) {
            // normalize 'foo   >bar` as 'foo > bar' to prevent same id being added
            // and for pretty printing
            const normalizedId = normalizeId(id);
            if (!deps[normalizedId]) {
                const entry = await resolve(id);
                if (entry) {
                    deps[normalizedId] = entry;
                }
                else {
                    throw new Error(`Failed to resolve force included dependency: ${colors__default.cyan(id)}`);
                }
            }
        }
    }
}
function newDepOptimizationProcessing() {
    let resolve;
    const promise = new Promise((_resolve) => {
        resolve = _resolve;
    });
    return { promise, resolve: resolve };
}
// Convert to { id: src }
function depsFromOptimizedDepInfo(depsInfo) {
    return Object.fromEntries(Object.entries(depsInfo).map((d) => [d[0], d[1].src]));
}
function getOptimizedDepPath(id, config) {
    return normalizePath(path__default.resolve(getDepsCacheDir(config), flattenId(id) + '.js'));
}
function getDepsCacheDir(config) {
    return normalizePath(path__default.resolve(config.cacheDir, 'deps'));
}
function getProcessingDepsCacheDir(config) {
    return normalizePath(path__default.resolve(config.cacheDir, 'processing'));
}
function isOptimizedDepFile(id, config) {
    return id.startsWith(getDepsCacheDir(config));
}
function createIsOptimizedDepUrl(config) {
    const { root } = config;
    const depsCacheDir = getDepsCacheDir(config);
    // determine the url prefix of files inside cache directory
    const depsCacheDirRelative = normalizePath(path__default.relative(root, depsCacheDir));
    const depsCacheDirPrefix = depsCacheDirRelative.startsWith('../')
        ? // if the cache directory is outside root, the url prefix would be something
            // like '/@fs/absolute/path/to/node_modules/.vite'
            `/@fs/${normalizePath(depsCacheDir).replace(/^\//, '')}`
        : // if the cache directory is inside root, the url prefix would be something
            // like '/node_modules/.vite'
            `/${depsCacheDirRelative}`;
    return function isOptimizedDepUrl(url) {
        return url.startsWith(depsCacheDirPrefix);
    };
}
function parseOptimizedDepsMetadata(jsonMetadata, depsCacheDir) {
    const { hash, browserHash, optimized, chunks } = JSON.parse(jsonMetadata, (key, value) => {
        // Paths can be absolute or relative to the deps cache dir where
        // the _metadata.json is located
        if (key === 'file' || key === 'src') {
            return normalizePath(path__default.resolve(depsCacheDir, value));
        }
        return value;
    });
    if (!chunks ||
        Object.values(optimized).some((depInfo) => !depInfo.fileHash)) {
        // outdated _metadata.json version, ignore
        return;
    }
    const metadata = {
        hash,
        browserHash,
        optimized: {},
        discovered: {},
        chunks: {},
        depInfoList: []
    };
    for (const id of Object.keys(optimized)) {
        addOptimizedDepInfo(metadata, 'optimized', {
            ...optimized[id],
            id,
            browserHash
        });
    }
    for (const id of Object.keys(chunks)) {
        addOptimizedDepInfo(metadata, 'chunks', {
            ...chunks[id],
            id,
            browserHash,
            needsInterop: false
        });
    }
    return metadata;
}
/**
 * Stringify metadata for deps cache. Remove processing promises
 * and individual dep info browserHash. Once the cache is reload
 * the next time the server start we need to use the global
 * browserHash to allow long term caching
 */
function stringifyOptimizedDepsMetadata(metadata, depsCacheDir) {
    const { hash, browserHash, optimized, chunks } = metadata;
    return JSON.stringify({
        hash,
        browserHash,
        optimized: Object.fromEntries(Object.values(optimized).map(({ id, src, file, fileHash, needsInterop }) => [
            id,
            {
                src,
                file,
                fileHash,
                needsInterop
            }
        ])),
        chunks: Object.fromEntries(Object.values(chunks).map(({ id, file }) => [id, { file }]))
    }, (key, value) => {
        // Paths can be absolute or relative to the deps cache dir where
        // the _metadata.json is located
        if (key === 'file' || key === 'src') {
            return normalizePath(path__default.relative(depsCacheDir, value));
        }
        return value;
    }, 2);
}
function esbuildOutputFromId(outputs, id, cacheDirOutputPath) {
    const flatId = flattenId(id) + '.js';
    return outputs[normalizePath(path__default.relative(process.cwd(), path__default.join(cacheDirOutputPath, flatId)))];
}
// https://github.com/vitejs/vite/issues/1724#issuecomment-767619642
// a list of modules that pretends to be ESM but still uses `require`.
// this causes esbuild to wrap them as CJS even when its entry appears to be ESM.
const KNOWN_INTEROP_IDS = new Set(['moment']);
function needsInterop(id, exportsData, output) {
    if (KNOWN_INTEROP_IDS.has(id)) {
        return true;
    }
    const [imports, exports] = exportsData;
    // entry has no ESM syntax - likely CJS or UMD
    if (!exports.length && !imports.length) {
        return true;
    }
    // if a peer dependency used require() on a ESM dependency, esbuild turns the
    // ESM dependency's entry chunk into a single default export... detect
    // such cases by checking exports mismatch, and force interop.
    const generatedExports = output.exports;
    if (!generatedExports ||
        (isSingleDefaultExport(generatedExports) && !isSingleDefaultExport(exports))) {
        return true;
    }
    return false;
}
function isSingleDefaultExport(exports) {
    return exports.length === 1 && exports[0] === 'default';
}
const lockfileFormats = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
function getDepHash(config) {
    var _a, _b, _c, _d, _e, _f;
    let content = lookupFile(config.root, lockfileFormats) || '';
    // also take config into account
    // only a subset of config options that can affect dep optimization
    content += JSON.stringify({
        mode: config.mode,
        root: config.root,
        define: config.define,
        resolve: config.resolve,
        buildTarget: config.build.target,
        assetsInclude: config.assetsInclude,
        plugins: config.plugins.map((p) => p.name),
        optimizeDeps: {
            include: (_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.include,
            exclude: (_b = config.optimizeDeps) === null || _b === void 0 ? void 0 : _b.exclude,
            esbuildOptions: {
                ...(_c = config.optimizeDeps) === null || _c === void 0 ? void 0 : _c.esbuildOptions,
                plugins: (_f = (_e = (_d = config.optimizeDeps) === null || _d === void 0 ? void 0 : _d.esbuildOptions) === null || _e === void 0 ? void 0 : _e.plugins) === null || _f === void 0 ? void 0 : _f.map((p) => p.name)
            }
        }
    }, (_, value) => {
        if (typeof value === 'function' || value instanceof RegExp) {
            return value.toString();
        }
        return value;
    });
    return getHash(content);
}
function getOptimizedBrowserHash(hash, deps, timestamp = '') {
    return getHash(hash + JSON.stringify(deps) + timestamp);
}
function getHash(text) {
    return require$$1.createHash('sha256').update(text).digest('hex').substring(0, 8);
}
function optimizedDepInfoFromId(metadata, id) {
    return (metadata.optimized[id] || metadata.discovered[id] || metadata.chunks[id]);
}
function optimizedDepInfoFromFile(metadata, file) {
    return metadata.depInfoList.find((depInfo) => depInfo.file === file);
}
function findOptimizedDepInfoInRecord(dependenciesInfo, callbackFn) {
    for (const o of Object.keys(dependenciesInfo)) {
        const info = dependenciesInfo[o];
        if (callbackFn(info, o)) {
            return info;
        }
    }
}
async function optimizedDepNeedsInterop(metadata, file) {
    const depInfo = optimizedDepInfoFromFile(metadata, file);
    if (!depInfo)
        return undefined;
    // Wait until the dependency has been pre-bundled
    await depInfo.processing;
    return depInfo === null || depInfo === void 0 ? void 0 : depInfo.needsInterop;
}

var index$1 = {
    __proto__: null,
    debuggerViteDeps: debuggerViteDeps,
    optimizeDeps: optimizeDeps,
    createOptimizedDepsMetadata: createOptimizedDepsMetadata,
    addOptimizedDepInfo: addOptimizedDepInfo,
    loadCachedDepOptimizationMetadata: loadCachedDepOptimizationMetadata,
    discoverProjectDependencies: discoverProjectDependencies,
    depsLogString: depsLogString,
    runOptimizeDeps: runOptimizeDeps,
    findKnownImports: findKnownImports,
    newDepOptimizationProcessing: newDepOptimizationProcessing,
    depsFromOptimizedDepInfo: depsFromOptimizedDepInfo,
    getOptimizedDepPath: getOptimizedDepPath,
    getDepsCacheDir: getDepsCacheDir,
    isOptimizedDepFile: isOptimizedDepFile,
    createIsOptimizedDepUrl: createIsOptimizedDepUrl,
    getDepHash: getDepHash,
    getHash: getHash,
    optimizedDepInfoFromId: optimizedDepInfoFromId,
    optimizedDepInfoFromFile: optimizedDepInfoFromFile,
    optimizedDepNeedsInterop: optimizedDepNeedsInterop
};

const isDebug$5 = process.env.DEBUG;
const debug$6 = createDebugger('vite:resolve-details', {
    onlyWhenFocused: true
});
function invalidatePackageData(packageCache, pkgPath) {
    packageCache.delete(pkgPath);
    const pkgDir = path__default.dirname(pkgPath);
    packageCache.forEach((pkg, cacheKey) => {
        if (pkg.dir === pkgDir) {
            packageCache.delete(cacheKey);
        }
    });
}
function resolvePackageData(id, basedir, preserveSymlinks = false, packageCache) {
    let pkg;
    let cacheKey;
    if (packageCache) {
        cacheKey = `${id}&${basedir}&${preserveSymlinks}`;
        if ((pkg = packageCache.get(cacheKey))) {
            return pkg;
        }
    }
    let pkgPath;
    try {
        pkgPath = resolveFrom(`${id}/package.json`, basedir, preserveSymlinks);
        pkg = loadPackageData(pkgPath, true, packageCache);
        if (packageCache) {
            packageCache.set(cacheKey, pkg);
        }
        return pkg;
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            isDebug$5 && debug$6(`Parsing failed: ${pkgPath}`);
        }
        // Ignore error for missing package.json
        else if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        }
    }
    return null;
}
function loadPackageData(pkgPath, preserveSymlinks, packageCache) {
    if (!preserveSymlinks) {
        pkgPath = fs__default.realpathSync.native(pkgPath);
    }
    let cached;
    if ((cached = packageCache === null || packageCache === void 0 ? void 0 : packageCache.get(pkgPath))) {
        return cached;
    }
    const data = JSON.parse(fs__default.readFileSync(pkgPath, 'utf-8'));
    const pkgDir = path__default.dirname(pkgPath);
    const { sideEffects } = data;
    let hasSideEffects;
    if (typeof sideEffects === 'boolean') {
        hasSideEffects = () => sideEffects;
    }
    else if (Array.isArray(sideEffects)) {
        hasSideEffects = pluginutils.createFilter(sideEffects, null, { resolve: pkgDir });
    }
    else {
        hasSideEffects = () => true;
    }
    const pkg = {
        dir: pkgDir,
        data,
        hasSideEffects,
        webResolvedImports: {},
        nodeResolvedImports: {},
        setResolvedCache(key, entry, targetWeb) {
            if (targetWeb) {
                pkg.webResolvedImports[key] = entry;
            }
            else {
                pkg.nodeResolvedImports[key] = entry;
            }
        },
        getResolvedCache(key, targetWeb) {
            if (targetWeb) {
                return pkg.webResolvedImports[key];
            }
            else {
                return pkg.nodeResolvedImports[key];
            }
        }
    };
    packageCache === null || packageCache === void 0 ? void 0 : packageCache.set(pkgPath, pkg);
    return pkg;
}
function watchPackageDataPlugin(config) {
    const watchQueue = new Set();
    let watchFile = (id) => {
        watchQueue.add(id);
    };
    const { packageCache } = config;
    const setPackageData = packageCache.set.bind(packageCache);
    packageCache.set = (id, pkg) => {
        if (id.endsWith('.json')) {
            watchFile(id);
        }
        return setPackageData(id, pkg);
    };
    return {
        name: 'vite:watch-package-data',
        buildStart() {
            watchFile = this.addWatchFile;
            watchQueue.forEach(watchFile);
            watchQueue.clear();
        },
        buildEnd() {
            watchFile = (id) => watchQueue.add(id);
        },
        watchChange(id) {
            if (id.endsWith('/package.json')) {
                invalidatePackageData(packageCache, id);
            }
        }
    };
}

// special id for paths marked with browser: false
// https://github.com/defunctzombie/package-browser-field-spec#ignore-a-module
const browserExternalId = '__vite-browser-external';
const isDebug$4 = process.env.DEBUG;
const debug$5 = createDebugger('vite:resolve-details', {
    onlyWhenFocused: true
});
function resolvePlugin(baseOptions) {
    const { root, isProduction, asSrc, ssrConfig, preferRelative = false } = baseOptions;
    let server;
    let isOptimizedDepUrl;
    const { target: ssrTarget, noExternal: ssrNoExternal } = ssrConfig !== null && ssrConfig !== void 0 ? ssrConfig : {};
    return {
        name: 'vite:resolve',
        configureServer(_server) {
            server = _server;
            isOptimizedDepUrl = createIsOptimizedDepUrl(server.config);
        },
        async resolveId(id, importer, resolveOpts) {
            var _a, _b, _c, _d, _e;
            const ssr = (resolveOpts === null || resolveOpts === void 0 ? void 0 : resolveOpts.ssr) === true;
            if (id.startsWith(browserExternalId)) {
                return id;
            }
            // fast path for commonjs proxy modules
            if (/\?commonjs/.test(id) || id === 'commonjsHelpers.js') {
                return;
            }
            const targetWeb = !ssr || ssrTarget === 'webworker';
            // this is passed by @rollup/plugin-commonjs
            const isRequire = (_c = (_b = (_a = resolveOpts === null || resolveOpts === void 0 ? void 0 : resolveOpts.custom) === null || _a === void 0 ? void 0 : _a['node-resolve']) === null || _b === void 0 ? void 0 : _b.isRequire) !== null && _c !== void 0 ? _c : false;
            const options = {
                isRequire,
                ...baseOptions,
                isFromTsImporter: isTsRequest(importer !== null && importer !== void 0 ? importer : ''),
                scan: (_d = resolveOpts === null || resolveOpts === void 0 ? void 0 : resolveOpts.scan) !== null && _d !== void 0 ? _d : baseOptions.scan
            };
            let res;
            // resolve pre-bundled deps requests, these could be resolved by
            // tryFileResolve or /fs/ resolution but these files may not yet
            // exists if we are in the middle of a deps re-processing
            if (asSrc && (isOptimizedDepUrl === null || isOptimizedDepUrl === void 0 ? void 0 : isOptimizedDepUrl(id))) {
                const optimizedPath = id.startsWith(FS_PREFIX)
                    ? fsPathFromId(id)
                    : normalizePath(ensureVolumeInPath(path__default.resolve(root, id.slice(1))));
                return optimizedPath;
            }
            // explicit fs paths that starts with /@fs/*
            if (asSrc && id.startsWith(FS_PREFIX)) {
                const fsPath = fsPathFromId(id);
                res = tryFsResolve(fsPath, options);
                isDebug$4 && debug$5(`[@fs] ${colors__default.cyan(id)} -> ${colors__default.dim(res)}`);
                // always return here even if res doesn't exist since /@fs/ is explicit
                // if the file doesn't exist it should be a 404
                return res || fsPath;
            }
            // URL
            // /foo -> /fs-root/foo
            if (asSrc && id.startsWith('/')) {
                const fsPath = path__default.resolve(root, id.slice(1));
                if ((res = tryFsResolve(fsPath, options))) {
                    isDebug$4 && debug$5(`[url] ${colors__default.cyan(id)} -> ${colors__default.dim(res)}`);
                    return res;
                }
            }
            // relative
            if (id.startsWith('.') || (preferRelative && /^\w/.test(id))) {
                const basedir = importer ? path__default.dirname(importer) : process.cwd();
                const fsPath = path__default.resolve(basedir, id);
                // handle browser field mapping for relative imports
                const normalizedFsPath = normalizePath(fsPath);
                if ((server === null || server === void 0 ? void 0 : server._optimizedDeps) &&
                    isOptimizedDepFile(normalizedFsPath, server.config)) {
                    // Optimized files could not yet exist in disk, resolve to the full path
                    // Inject the current browserHash version if the path doesn't have one
                    if (!normalizedFsPath.match(DEP_VERSION_RE)) {
                        const browserHash = (_e = optimizedDepInfoFromFile(server._optimizedDeps.metadata, normalizedFsPath)) === null || _e === void 0 ? void 0 : _e.browserHash;
                        if (browserHash) {
                            return injectQuery(normalizedFsPath, `v=${browserHash}`);
                        }
                    }
                    return normalizedFsPath;
                }
                const pathFromBasedir = normalizedFsPath.slice(basedir.length);
                if (pathFromBasedir.startsWith('/node_modules/')) {
                    // normalize direct imports from node_modules to bare imports, so the
                    // hashing logic is shared and we avoid duplicated modules #2503
                    const bareImport = pathFromBasedir.slice('/node_modules/'.length);
                    if ((res = tryNodeResolve(bareImport, importer, options, targetWeb, server, ssr)) &&
                        res.id.startsWith(normalizedFsPath)) {
                        return res;
                    }
                }
                if (targetWeb &&
                    (res = tryResolveBrowserMapping(fsPath, importer, options, true))) {
                    return res;
                }
                if ((res = tryFsResolve(fsPath, options))) {
                    isDebug$4 &&
                        debug$5(`[relative] ${colors__default.cyan(id)} -> ${colors__default.dim(res)}`);
                    const pkg = importer != null && idToPkgMap.get(importer);
                    if (pkg) {
                        idToPkgMap.set(res, pkg);
                        return {
                            id: res,
                            moduleSideEffects: pkg.hasSideEffects(res)
                        };
                    }
                    return res;
                }
            }
            // absolute fs paths
            if (path__default.isAbsolute(id) && (res = tryFsResolve(id, options))) {
                isDebug$4 && debug$5(`[fs] ${colors__default.cyan(id)} -> ${colors__default.dim(res)}`);
                return res;
            }
            // external
            if (isExternalUrl(id)) {
                return {
                    id,
                    external: true
                };
            }
            // data uri: pass through (this only happens during build and will be
            // handled by dedicated plugin)
            if (isDataUrl(id)) {
                return null;
            }
            // bare package imports, perform node resolve
            if (bareImportRE.test(id)) {
                if (asSrc &&
                    server &&
                    !ssr &&
                    !options.scan &&
                    (res = await tryOptimizedResolve(id, server, importer))) {
                    return res;
                }
                if (targetWeb &&
                    (res = tryResolveBrowserMapping(id, importer, options, false))) {
                    return res;
                }
                if ((res = tryNodeResolve(id, importer, options, targetWeb, server, ssr))) {
                    return res;
                }
                // node built-ins.
                // externalize if building for SSR, otherwise redirect to empty module
                if (isBuiltin(id)) {
                    if (ssr) {
                        if (ssrNoExternal === true) {
                            let message = `Cannot bundle Node.js built-in "${id}"`;
                            if (importer) {
                                message += ` imported from "${path__default.relative(process.cwd(), importer)}"`;
                            }
                            message += `. Consider disabling ssr.noExternal or remove the built-in dependency.`;
                            this.error(message);
                        }
                        return {
                            id,
                            external: true
                        };
                    }
                    else {
                        if (!asSrc) {
                            debug$5(`externalized node built-in "${id}" to empty module. ` +
                                `(imported by: ${colors__default.white(colors__default.dim(importer))})`);
                        }
                        return isProduction
                            ? browserExternalId
                            : `${browserExternalId}:${id}`;
                    }
                }
            }
            isDebug$4 && debug$5(`[fallthrough] ${colors__default.dim(id)}`);
        },
        load(id) {
            if (id.startsWith(browserExternalId)) {
                return isProduction
                    ? `export default {}`
                    : `export default new Proxy({}, {
  get() {
    throw new Error('Module "${id.slice(browserExternalId.length + 1)}" has been externalized for browser compatibility and cannot be accessed in client code.')
  }
})`;
            }
        }
    };
}
function splitFileAndPostfix(path) {
    let file = path;
    let postfix = '';
    let postfixIndex = path.indexOf('?');
    if (postfixIndex < 0) {
        postfixIndex = path.indexOf('#');
    }
    if (postfixIndex > 0) {
        file = path.slice(0, postfixIndex);
        postfix = path.slice(postfixIndex);
    }
    return { file, postfix };
}
function tryFsResolve(fsPath, options, tryIndex = true, targetWeb = true) {
    const { file, postfix } = splitFileAndPostfix(fsPath);
    let res;
    // if we fould postfix exist, we should first try resolving file with postfix. details see #4703.
    if (postfix &&
        (res = tryResolveFile(fsPath, '', options, false, targetWeb, options.tryPrefix, options.skipPackageJson))) {
        return res;
    }
    if ((res = tryResolveFile(file, postfix, options, false, targetWeb, options.tryPrefix, options.skipPackageJson))) {
        return res;
    }
    for (const ext of options.extensions || DEFAULT_EXTENSIONS) {
        if (postfix &&
            (res = tryResolveFile(fsPath + ext, '', options, false, targetWeb, options.tryPrefix, options.skipPackageJson))) {
            return res;
        }
        if ((res = tryResolveFile(file + ext, postfix, options, false, targetWeb, options.tryPrefix, options.skipPackageJson))) {
            return res;
        }
    }
    if (postfix &&
        (res = tryResolveFile(fsPath, '', options, tryIndex, targetWeb, options.tryPrefix, options.skipPackageJson))) {
        return res;
    }
    if ((res = tryResolveFile(file, postfix, options, tryIndex, targetWeb, options.tryPrefix, options.skipPackageJson))) {
        return res;
    }
}
function tryResolveFile(file, postfix, options, tryIndex, targetWeb, tryPrefix, skipPackageJson) {
    // #2051 if we don't have read permission on a directory, existsSync() still
    // works and will result in massively slow subsequent checks (which are
    // unnecessary in the first place)
    if (isFileReadable(file)) {
        if (!fs__default.statSync(file).isDirectory()) {
            return getRealPath(file, options.preserveSymlinks) + postfix;
        }
        else if (tryIndex) {
            if (!skipPackageJson) {
                const pkgPath = file + '/package.json';
                try {
                    // path points to a node package
                    const pkg = loadPackageData(pkgPath, options.preserveSymlinks);
                    const resolved = resolvePackageEntry(file, pkg, targetWeb, options);
                    return resolved;
                }
                catch (e) {
                    if (e.code !== 'ENOENT') {
                        throw e;
                    }
                }
            }
            const index = tryFsResolve(file + '/index', options);
            if (index)
                return index + postfix;
        }
    }
    const tryTsExtension = options.isFromTsImporter && isPossibleTsOutput(file);
    if (tryTsExtension) {
        const tsSrcPaths = getPotentialTsSrcPaths(file);
        for (const srcPath of tsSrcPaths) {
            const res = tryResolveFile(srcPath, postfix, options, tryIndex, targetWeb, tryPrefix, skipPackageJson);
            if (res)
                return res;
        }
        return;
    }
    if (tryPrefix) {
        const prefixed = `${path__default.dirname(file)}/${tryPrefix}${path__default.basename(file)}`;
        return tryResolveFile(prefixed, postfix, options, tryIndex, targetWeb);
    }
}
const idToPkgMap = new Map();
function tryNodeResolve(id, importer, options, targetWeb, server, ssr) {
    var _a;
    const { root, dedupe, isBuild, preserveSymlinks, packageCache } = options;
    // split id by last '>' for nested selected packages, for example:
    // 'foo > bar > baz' => 'foo > bar' & 'baz'
    // 'foo'             => ''          & 'foo'
    const lastArrowIndex = id.lastIndexOf('>');
    const nestedRoot = id.substring(0, lastArrowIndex).trim();
    const nestedPath = id.substring(lastArrowIndex + 1).trim();
    const possiblePkgIds = [];
    for (let prevSlashIndex = -1;;) {
        let slashIndex = nestedPath.indexOf('/', prevSlashIndex + 1);
        if (slashIndex < 0) {
            slashIndex = nestedPath.length;
        }
        const part = nestedPath.slice(prevSlashIndex + 1, (prevSlashIndex = slashIndex));
        if (!part) {
            break;
        }
        // Assume path parts with an extension are not package roots, except for the
        // first path part (since periods are sadly allowed in package names).
        // At the same time, skip the first path part if it begins with "@"
        // (since "@foo/bar" should be treated as the top-level path).
        if (possiblePkgIds.length ? path__default.extname(part) : part[0] === '@') {
            continue;
        }
        const possiblePkgId = nestedPath.slice(0, slashIndex);
        possiblePkgIds.push(possiblePkgId);
    }
    let basedir;
    if (dedupe === null || dedupe === void 0 ? void 0 : dedupe.some((id) => possiblePkgIds.includes(id))) {
        basedir = root;
    }
    else if (importer &&
        path__default.isAbsolute(importer) &&
        fs__default.existsSync(cleanUrl(importer))) {
        basedir = path__default.dirname(importer);
    }
    else {
        basedir = root;
    }
    // nested node module, step-by-step resolve to the basedir of the nestedPath
    if (nestedRoot) {
        basedir = nestedResolveFrom(nestedRoot, basedir, preserveSymlinks);
    }
    let pkg;
    const pkgId = possiblePkgIds.reverse().find((pkgId) => {
        pkg = resolvePackageData(pkgId, basedir, preserveSymlinks, packageCache);
        return pkg;
    });
    if (!pkg) {
        return;
    }
    let resolveId = resolvePackageEntry;
    let unresolvedId = pkgId;
    if (unresolvedId !== nestedPath) {
        resolveId = resolveDeepImport;
        unresolvedId = '.' + nestedPath.slice(pkgId.length);
    }
    let resolved;
    try {
        resolved = resolveId(unresolvedId, pkg, targetWeb, options);
    }
    catch (err) {
        if (!options.tryEsmOnly) {
            throw err;
        }
    }
    if (!resolved && options.tryEsmOnly) {
        resolved = resolveId(unresolvedId, pkg, targetWeb, {
            ...options,
            isRequire: false,
            mainFields: DEFAULT_MAIN_FIELDS,
            extensions: DEFAULT_EXTENSIONS
        });
    }
    if (!resolved) {
        return;
    }
    // link id to pkg for browser field mapping check
    idToPkgMap.set(resolved, pkg);
    if (isBuild) {
        // Resolve package side effects for build so that rollup can better
        // perform tree-shaking
        return {
            id: resolved,
            moduleSideEffects: pkg.hasSideEffects(resolved)
        };
    }
    else {
        if (!resolved.includes('node_modules') || // linked
            !server || // build
            !server._optimizedDeps || // resolving before listening to the server
            options.scan // initial esbuild scan phase
        ) {
            return { id: resolved };
        }
        // if we reach here, it's a valid dep import that hasn't been optimized.
        const isJsType = OPTIMIZABLE_ENTRY_RE.test(resolved);
        const exclude = (_a = server.config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.exclude;
        if (!isJsType ||
            (importer === null || importer === void 0 ? void 0 : importer.includes('node_modules')) ||
            (exclude === null || exclude === void 0 ? void 0 : exclude.includes(pkgId)) ||
            (exclude === null || exclude === void 0 ? void 0 : exclude.includes(nestedPath)) ||
            SPECIAL_QUERY_RE.test(resolved) ||
            ssr) {
            // excluded from optimization
            // Inject a version query to npm deps so that the browser
            // can cache it without re-validation, but only do so for known js types.
            // otherwise we may introduce duplicated modules for externalized files
            // from pre-bundled deps.
            const versionHash = server._optimizedDeps.metadata.browserHash;
            if (versionHash && isJsType) {
                resolved = injectQuery(resolved, `v=${versionHash}`);
            }
        }
        else {
            // this is a missing import, queue optimize-deps re-run and
            // get a resolved its optimized info
            const optimizedInfo = server._optimizedDeps.registerMissingImport(id, resolved);
            resolved = getOptimizedUrl(optimizedInfo);
        }
        return { id: resolved };
    }
}
const getOptimizedUrl = (optimizedData) => `${optimizedData.file}?v=${optimizedData.browserHash}`;
async function tryOptimizedResolve(id, server, importer) {
    const optimizedDeps = server._optimizedDeps;
    if (!optimizedDeps)
        return;
    await optimizedDeps.scanProcessing;
    const depInfo = optimizedDepInfoFromId(optimizedDeps.metadata, id);
    if (depInfo) {
        return getOptimizedUrl(depInfo);
    }
    if (!importer)
        return;
    // further check if id is imported by nested dependency
    let resolvedSrc;
    for (const optimizedData of optimizedDeps.metadata.depInfoList) {
        if (!optimizedData.src)
            continue; // Ignore chunks
        const pkgPath = optimizedData.id;
        // check for scenarios, e.g.
        //   pkgPath  => "my-lib > foo"
        //   id       => "foo"
        // this narrows the need to do a full resolve
        if (!pkgPath.endsWith(id))
            continue;
        // lazily initialize resolvedSrc
        if (resolvedSrc == null) {
            try {
                // this may throw errors if unable to resolve, e.g. aliased id
                resolvedSrc = normalizePath(resolveFrom(id, path__default.dirname(importer)));
            }
            catch {
                // this is best-effort only so swallow errors
                break;
            }
        }
        // match by src to correctly identify if id belongs to nested dependency
        if (optimizedData.src === resolvedSrc) {
            return getOptimizedUrl(optimizedData);
        }
    }
}
function resolvePackageEntry(id, { dir, data, setResolvedCache, getResolvedCache }, targetWeb, options) {
    var _a, _b;
    const cached = getResolvedCache('.', targetWeb);
    if (cached) {
        return cached;
    }
    try {
        let entryPoint;
        // resolve exports field with highest priority
        // using https://github.com/lukeed/resolve.exports
        if (data.exports) {
            entryPoint = resolveExports(data, '.', options, targetWeb);
        }
        // if exports resolved to .mjs, still resolve other fields.
        // This is because .mjs files can technically import .cjs files which would
        // make them invalid for pure ESM environments - so if other module/browser
        // fields are present, prioritize those instead.
        if (targetWeb && (!entryPoint || entryPoint.endsWith('.mjs'))) {
            // check browser field
            // https://github.com/defunctzombie/package-browser-field-spec
            const browserEntry = typeof data.browser === 'string'
                ? data.browser
                : isObject(data.browser) && data.browser['.'];
            if (browserEntry) {
                // check if the package also has a "module" field.
                if (!options.isRequire &&
                    typeof data.module === 'string' &&
                    data.module !== browserEntry) {
                    // if both are present, we may have a problem: some package points both
                    // to ESM, with "module" targeting Node.js, while some packages points
                    // "module" to browser ESM and "browser" to UMD.
                    // the heuristics here is to actually read the browser entry when
                    // possible and check for hints of UMD. If it is UMD, prefer "module"
                    // instead; Otherwise, assume it's ESM and use it.
                    const resolvedBrowserEntry = tryFsResolve(path__default.join(dir, browserEntry), options);
                    if (resolvedBrowserEntry) {
                        const content = fs__default.readFileSync(resolvedBrowserEntry, 'utf-8');
                        if ((/typeof exports\s*==/.test(content) &&
                            /typeof module\s*==/.test(content)) ||
                            /module\.exports\s*=/.test(content)) {
                            // likely UMD or CJS(!!! e.g. firebase 7.x), prefer module
                            entryPoint = data.module;
                        }
                    }
                }
                else {
                    entryPoint = browserEntry;
                }
            }
        }
        if (!entryPoint || entryPoint.endsWith('.mjs')) {
            for (const field of options.mainFields || DEFAULT_MAIN_FIELDS) {
                if (typeof data[field] === 'string') {
                    entryPoint = data[field];
                    break;
                }
            }
        }
        entryPoint || (entryPoint = data.main);
        // try default entry when entry is not define
        // https://nodejs.org/api/modules.html#all-together
        const entryPoints = entryPoint
            ? [entryPoint]
            : ['index.js', 'index.json', 'index.node'];
        for (let entry of entryPoints) {
            // make sure we don't get scripts when looking for sass
            if (((_a = options.mainFields) === null || _a === void 0 ? void 0 : _a[0]) === 'sass' &&
                !((_b = options.extensions) === null || _b === void 0 ? void 0 : _b.includes(path__default.extname(entry)))) {
                entry = '';
                options.skipPackageJson = true;
            }
            // resolve object browser field in package.json
            const { browser: browserField } = data;
            if (targetWeb && isObject(browserField)) {
                entry = mapWithBrowserField(entry, browserField) || entry;
            }
            const entryPointPath = path__default.join(dir, entry);
            const resolvedEntryPoint = tryFsResolve(entryPointPath, options);
            if (resolvedEntryPoint) {
                isDebug$4 &&
                    debug$5(`[package entry] ${colors__default.cyan(id)} -> ${colors__default.dim(resolvedEntryPoint)}`);
                setResolvedCache('.', resolvedEntryPoint, targetWeb);
                return resolvedEntryPoint;
            }
        }
        packageEntryFailure(id);
    }
    catch (e) {
        packageEntryFailure(id, e.message);
    }
}
function packageEntryFailure(id, details) {
    throw new Error(`Failed to resolve entry for package "${id}". ` +
        `The package may have incorrect main/module/exports specified in its package.json` +
        (details ? ': ' + details : '.'));
}
function resolveExports(pkg, key, options, targetWeb) {
    const conditions = [options.isProduction ? 'production' : 'development'];
    if (!options.isRequire) {
        conditions.push('module');
    }
    if (options.conditions) {
        conditions.push(...options.conditions);
    }
    return resolve_exports.resolve(pkg, key, {
        browser: targetWeb,
        require: options.isRequire,
        conditions
    });
}
function resolveDeepImport(id, { webResolvedImports, setResolvedCache, getResolvedCache, dir, data }, targetWeb, options) {
    const cache = getResolvedCache(id, targetWeb);
    if (cache) {
        return cache;
    }
    let relativeId = id;
    const { exports: exportsField, browser: browserField } = data;
    // map relative based on exports data
    if (exportsField) {
        if (isObject(exportsField) && !Array.isArray(exportsField)) {
            // resolve without postfix (see #7098)
            const { file, postfix } = splitFileAndPostfix(relativeId);
            const exportsId = resolveExports(data, file, options, targetWeb);
            if (exportsId !== undefined) {
                relativeId = exportsId + postfix;
            }
            else {
                relativeId = undefined;
            }
        }
        else {
            // not exposed
            relativeId = undefined;
        }
        if (!relativeId) {
            throw new Error(`Package subpath '${relativeId}' is not defined by "exports" in ` +
                `${path__default.join(dir, 'package.json')}.`);
        }
    }
    else if (targetWeb && isObject(browserField)) {
        // resolve without postfix (see #7098)
        const { file, postfix } = splitFileAndPostfix(relativeId);
        const mapped = mapWithBrowserField(file, browserField);
        if (mapped) {
            relativeId = mapped + postfix;
        }
        else if (mapped === false) {
            return (webResolvedImports[id] = browserExternalId);
        }
    }
    if (relativeId) {
        const resolved = tryFsResolve(path__default.join(dir, relativeId), options, !exportsField, // try index only if no exports field
        targetWeb);
        if (resolved) {
            isDebug$4 &&
                debug$5(`[node/deep-import] ${colors__default.cyan(id)} -> ${colors__default.dim(resolved)}`);
            setResolvedCache(id, resolved, targetWeb);
            return resolved;
        }
    }
}
function tryResolveBrowserMapping(id, importer, options, isFilePath) {
    let res;
    const pkg = importer && idToPkgMap.get(importer);
    if (pkg && isObject(pkg.data.browser)) {
        const mapId = isFilePath ? './' + slash(path__default.relative(pkg.dir, id)) : id;
        const browserMappedPath = mapWithBrowserField(mapId, pkg.data.browser);
        if (browserMappedPath) {
            const fsPath = path__default.join(pkg.dir, browserMappedPath);
            if ((res = tryFsResolve(fsPath, options))) {
                isDebug$4 &&
                    debug$5(`[browser mapped] ${colors__default.cyan(id)} -> ${colors__default.dim(res)}`);
                idToPkgMap.set(res, pkg);
                return {
                    id: res,
                    moduleSideEffects: pkg.hasSideEffects(res)
                };
            }
        }
        else if (browserMappedPath === false) {
            return browserExternalId;
        }
    }
}
/**
 * given a relative path in pkg dir,
 * return a relative path in pkg dir,
 * mapped with the "map" object
 *
 * - Returning `undefined` means there is no browser mapping for this id
 * - Returning `false` means this id is explicitly externalized for browser
 */
function mapWithBrowserField(relativePathInPkgDir, map) {
    const normalizedPath = path__default.posix.normalize(relativePathInPkgDir);
    for (const key in map) {
        const normalizedKey = path__default.posix.normalize(key);
        if (normalizedPath === normalizedKey ||
            equalWithoutSuffix(normalizedPath, normalizedKey, '.js') ||
            equalWithoutSuffix(normalizedPath, normalizedKey, '/index.js')) {
            return map[key];
        }
    }
}
function equalWithoutSuffix(path, key, suffix) {
    return key.endsWith(suffix) && key.slice(0, -suffix.length) === path;
}
function getRealPath(resolved, preserveSymlinks) {
    resolved = ensureVolumeInPath(resolved);
    if (!preserveSymlinks && browserExternalId !== resolved) {
        resolved = fs__default.realpathSync(resolved);
    }
    return normalizePath(resolved);
}

const debug$4 = createDebugger('vite:ssr-external');
/**
 * Converts "parent > child" syntax to just "child"
 */
function stripNesting(packages) {
    return packages.map((s) => {
        const arr = s.split('>');
        return arr[arr.length - 1].trim();
    });
}
/**
 * Heuristics for determining whether a dependency should be externalized for
 * server-side rendering.
 */
function resolveSSRExternal(config, knownImports) {
    var _a;
    // strip nesting since knownImports may be passed in from optimizeDeps which
    // supports a "parent > child" syntax
    knownImports = stripNesting(knownImports);
    const ssrConfig = config.ssr;
    if ((ssrConfig === null || ssrConfig === void 0 ? void 0 : ssrConfig.noExternal) === true) {
        return [];
    }
    const ssrExternals = new Set();
    const seen = new Set();
    (_a = ssrConfig === null || ssrConfig === void 0 ? void 0 : ssrConfig.external) === null || _a === void 0 ? void 0 : _a.forEach((id) => {
        ssrExternals.add(id);
        seen.add(id);
    });
    collectExternals(config.root, config.resolve.preserveSymlinks, ssrExternals, seen, config.logger);
    const importedDeps = knownImports.map(getNpmPackageName).filter(isDefined);
    for (const dep of importedDeps) {
        // Assume external if not yet seen
        // At this point, the project root and any linked packages have had their dependencies checked,
        // so we can safely mark any knownImports not yet seen as external. They are guaranteed to be
        // dependencies of packages in node_modules.
        if (!seen.has(dep)) {
            ssrExternals.add(dep);
        }
    }
    // ensure `vite/dynamic-import-polyfill` is bundled (issue #1865)
    ssrExternals.delete('vite');
    let externals = [...ssrExternals];
    if (ssrConfig === null || ssrConfig === void 0 ? void 0 : ssrConfig.noExternal) {
        externals = externals.filter(pluginutils.createFilter(undefined, ssrConfig.noExternal, { resolve: false }));
    }
    return externals;
}
const CJS_CONTENT_RE = /\bmodule\.exports\b|\bexports[.\[]|\brequire\s*\(|\bObject\.(defineProperty|defineProperties|assign)\s*\(\s*exports\b/;
// do we need to do this ahead of time or could we do it lazily?
function collectExternals(root, preserveSymlinks, ssrExternals, seen, logger) {
    var _a;
    const rootPkgContent = lookupFile(root, ['package.json']);
    if (!rootPkgContent) {
        return;
    }
    const rootPkg = JSON.parse(rootPkgContent);
    const deps = {
        ...rootPkg.devDependencies,
        ...rootPkg.dependencies
    };
    const resolveOptions = {
        root,
        preserveSymlinks,
        isProduction: false,
        isBuild: true
    };
    const depsToTrace = new Set();
    for (const id in deps) {
        if (seen.has(id))
            continue;
        seen.add(id);
        let esmEntry;
        let requireEntry;
        try {
            esmEntry = (_a = tryNodeResolve(id, undefined, resolveOptions, true, // we set `targetWeb` to `true` to get the ESM entry
            undefined, true)) === null || _a === void 0 ? void 0 : _a.id;
            // normalizePath required for windows. tryNodeResolve uses normalizePath
            // which returns with '/', require.resolve returns with '\\'
            requireEntry = normalizePath(require.resolve(id, { paths: [root] }));
        }
        catch (e) {
            try {
                // no main entry, but deep imports may be allowed
                const pkgPath = resolveFrom(`${id}/package.json`, root);
                if (pkgPath.includes('node_modules')) {
                    ssrExternals.add(id);
                }
                else {
                    depsToTrace.add(path__default.dirname(pkgPath));
                }
                continue;
            }
            catch { }
            // resolve failed, assume include
            debug$4(`Failed to resolve entries for package "${id}"\n`, e);
            continue;
        }
        // no esm entry but has require entry
        if (!esmEntry) {
            ssrExternals.add(id);
        }
        // trace the dependencies of linked packages
        else if (!esmEntry.includes('node_modules')) {
            const pkgPath = resolveFrom(`${id}/package.json`, root);
            depsToTrace.add(path__default.dirname(pkgPath));
        }
        // has separate esm/require entry, assume require entry is cjs
        else if (esmEntry !== requireEntry) {
            ssrExternals.add(id);
        }
        // if we're externalizing ESM and CJS should basically just always do it?
        // or are there others like SystemJS / AMD that we'd need to handle?
        // for now, we'll just leave this as is
        else if (/\.m?js$/.test(esmEntry)) {
            const pkgPath = resolveFrom(`${id}/package.json`, root);
            const pkgContent = fs__default.readFileSync(pkgPath, 'utf-8');
            if (!pkgContent) {
                continue;
            }
            const pkg = JSON.parse(pkgContent);
            if (pkg.type === 'module' || esmEntry.endsWith('.mjs')) {
                ssrExternals.add(id);
                continue;
            }
            // check if the entry is cjs
            const content = fs__default.readFileSync(esmEntry, 'utf-8');
            if (CJS_CONTENT_RE.test(content)) {
                ssrExternals.add(id);
                continue;
            }
            logger.warn(`${id} doesn't appear to be written in CJS, but also doesn't appear to be a valid ES module (i.e. it doesn't have "type": "module" or an .mjs extension for the entry point). Please contact the package author to fix.`);
        }
    }
    for (const depRoot of depsToTrace) {
        collectExternals(depRoot, preserveSymlinks, ssrExternals, seen, logger);
    }
}
function shouldExternalizeForSSR(id, externals) {
    const should = externals.some((e) => {
        if (id === e) {
            return true;
        }
        // deep imports, check ext before externalizing - only externalize
        // extension-less imports and explicit .js imports
        if (id.startsWith(e + '/') && (!path__default.extname(id) || id.endsWith('.js'))) {
            return true;
        }
    });
    return should;
}
function getNpmPackageName(importPath) {
    const parts = importPath.split('/');
    if (parts[0].startsWith('@')) {
        if (!parts[1])
            return null;
        return `${parts[0]}/${parts[1]}`;
    }
    else {
        return parts[0];
    }
}

function ssrManifestPlugin(config) {
    // module id => preload assets mapping
    const ssrManifest = {};
    const base = config.base;
    return {
        name: 'vite:ssr-manifest',
        generateBundle(_options, bundle) {
            var _a;
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk') {
                    for (const id in chunk.modules) {
                        const normalizedId = normalizePath(path.relative(config.root, id));
                        const mappedChunks = (_a = ssrManifest[normalizedId]) !== null && _a !== void 0 ? _a : (ssrManifest[normalizedId] = []);
                        if (!chunk.isEntry) {
                            mappedChunks.push(base + chunk.fileName);
                            // <link> tags for entry chunks are already generated in static HTML,
                            // so we only need to record info for non-entry chunks.
                            chunk.viteMetadata.importedCss.forEach((file) => {
                                mappedChunks.push(base + file);
                            });
                        }
                        chunk.viteMetadata.importedAssets.forEach((file) => {
                            mappedChunks.push(base + file);
                        });
                    }
                    if (chunk.code.includes(preloadMethod)) {
                        // generate css deps map
                        const code = chunk.code;
                        let imports;
                        try {
                            imports = esModuleLexer.parse(code)[0].filter((i) => i.d > -1);
                        }
                        catch (e) {
                            this.error(e, e.idx);
                        }
                        if (imports.length) {
                            for (let index = 0; index < imports.length; index++) {
                                const { s: start, e: end, n: name } = imports[index];
                                // check the chunk being imported
                                const url = code.slice(start, end);
                                const deps = [];
                                const ownerFilename = chunk.fileName;
                                // literal import - trace direct imports and add to deps
                                const analyzed = new Set();
                                const addDeps = (filename) => {
                                    if (filename === ownerFilename)
                                        return;
                                    if (analyzed.has(filename))
                                        return;
                                    analyzed.add(filename);
                                    const chunk = bundle[filename];
                                    if (chunk) {
                                        chunk.viteMetadata.importedCss.forEach((file) => {
                                            deps.push(`/${file}`);
                                        });
                                        chunk.imports.forEach(addDeps);
                                    }
                                };
                                const normalizedFile = normalizePath(path.join(path.dirname(chunk.fileName), url.slice(1, -1)));
                                addDeps(normalizedFile);
                                ssrManifest[path.basename(name)] = deps;
                            }
                        }
                    }
                }
            }
            this.emitFile({
                fileName: typeof config.build.ssrManifest === 'string'
                    ? config.build.ssrManifest
                    : 'ssr-manifest.json',
                type: 'asset',
                source: JSON.stringify(ssrManifest, null, 2)
            });
        }
    };
}

/**
 * Convert `new URL('./foo.png', import.meta.url)` to its resolved built URL
 *
 * Supports template string with dynamic segments:
 * ```
 * new URL(`./dir/${name}.png`, import.meta.url)
 * // transformed to
 * import.meta.globEager('./dir/**.png')[`./dir/${name}.png`].default
 * ```
 */
function assetImportMetaUrlPlugin(config) {
    return {
        name: 'vite:asset-import-meta-url',
        async transform(code, id, options) {
            if (!(options === null || options === void 0 ? void 0 : options.ssr) &&
                code.includes('new URL') &&
                code.includes(`import.meta.url`)) {
                let s;
                const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*,?\s*\)/g;
                const cleanString = emptyString(code);
                let match;
                while ((match = assetImportMetaUrlRE.exec(cleanString))) {
                    const { 0: exp, 1: emptyUrl, index } = match;
                    const urlStart = cleanString.indexOf(emptyUrl, index);
                    const urlEnd = urlStart + emptyUrl.length;
                    const rawUrl = code.slice(urlStart, urlEnd);
                    if (!s)
                        s = new MagicString__default(code);
                    // potential dynamic template string
                    if (rawUrl[0] === '`' && /\$\{/.test(rawUrl)) {
                        const ast = this.parse(rawUrl);
                        const templateLiteral = ast.body[0].expression;
                        if (templateLiteral.expressions.length) {
                            const pattern = buildGlobPattern(templateLiteral);
                            // Note: native import.meta.url is not supported in the baseline
                            // target so we use the global location here. It can be
                            // window.location or self.location in case it is used in a Web Worker.
                            // @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
                            s.overwrite(index, index + exp.length, `new URL(import.meta.globEagerDefault(${JSON.stringify(pattern)})[${rawUrl}], self.location)`, { contentOnly: true });
                            continue;
                        }
                    }
                    const url = rawUrl.slice(1, -1);
                    const file = path__default.resolve(path__default.dirname(id), url);
                    // Get final asset URL. Catch error if the file does not exist,
                    // in which we can resort to the initial URL and let it resolve in runtime
                    const builtUrl = await fileToUrl(file, config, this).catch(() => {
                        const rawExp = code.slice(index, index + exp.length);
                        config.logger.warnOnce(`\n${rawExp} doesn't exist at build time, it will remain unchanged to be resolved at runtime`);
                        return url;
                    });
                    s.overwrite(index, index + exp.length, `new URL(${JSON.stringify(builtUrl)}, self.location)`, { contentOnly: true });
                }
                if (s) {
                    return {
                        code: s.toString(),
                        map: config.build.sourcemap ? s.generateMap({ hires: true }) : null
                    };
                }
            }
            return null;
        }
    };
}
function buildGlobPattern(ast) {
    let pattern = '';
    let lastElementIndex = -1;
    for (const exp of ast.expressions) {
        for (let i = lastElementIndex + 1; i < ast.quasis.length; i++) {
            const el = ast.quasis[i];
            if (el.end < exp.start) {
                pattern += el.value.raw;
                lastElementIndex = i;
            }
        }
        pattern += '**';
    }
    for (let i = lastElementIndex + 1; i < ast.quasis.length; i++) {
        pattern += ast.quasis[i].value.raw;
    }
    return pattern;
}

/**
 * A plugin to provide build load fallback for arbitrary request with queries.
 */
function loadFallbackPlugin() {
    return {
        name: 'vite:load-fallback',
        async load(id) {
            try {
                // if we don't add `await` here, we couldn't catch the error in readFile
                return await fs.promises.readFile(cleanUrl(id), 'utf-8');
            }
            catch (e) {
                return fs.promises.readFile(id, 'utf-8');
            }
        }
    };
}

/**
 * plugin to ensure rollup can watch correctly.
 */
function ensureWatchPlugin() {
    return {
        name: 'vite:ensure-watch',
        load(id) {
            if (queryRE.test(id)) {
                this.addWatchFile(cleanUrl(id));
            }
            return null;
        }
    };
}

function resolveBuildOptions(raw) {
    const resolved = {
        target: 'modules',
        polyfillModulePreload: true,
        outDir: 'dist',
        assetsDir: 'assets',
        assetsInlineLimit: 4096,
        cssCodeSplit: !(raw === null || raw === void 0 ? void 0 : raw.lib),
        cssTarget: false,
        sourcemap: false,
        rollupOptions: {},
        minify: (raw === null || raw === void 0 ? void 0 : raw.ssr) ? false : 'esbuild',
        terserOptions: {},
        write: true,
        emptyOutDir: null,
        manifest: false,
        lib: false,
        ssr: false,
        ssrManifest: false,
        reportCompressedSize: true,
        // brotliSize: true,
        chunkSizeWarningLimit: 500,
        watch: null,
        ...raw,
        commonjsOptions: {
            include: [/node_modules/],
            extensions: ['.js', '.cjs'],
            ...raw === null || raw === void 0 ? void 0 : raw.commonjsOptions
        },
        dynamicImportVarsOptions: {
            warnOnError: true,
            exclude: [/node_modules/],
            ...raw === null || raw === void 0 ? void 0 : raw.dynamicImportVarsOptions
        }
    };
    // handle special build targets
    if (resolved.target === 'modules') {
        // Support browserslist
        // "defaults and supports es6-module and supports es6-module-dynamic-import",
        resolved.target = [
            'es2019',
            'edge88',
            'firefox78',
            'chrome87',
            'safari13.1'
        ];
    }
    else if (resolved.target === 'esnext' && resolved.minify === 'terser') {
        // esnext + terser: limit to es2019 so it can be minified by terser
        resolved.target = 'es2019';
    }
    if (!resolved.cssTarget) {
        resolved.cssTarget = resolved.target;
    }
    // normalize false string into actual false
    if (resolved.minify === 'false') {
        resolved.minify = false;
    }
    if (resolved.minify === true) {
        resolved.minify = 'esbuild';
    }
    return resolved;
}
function resolveBuildPlugins(config) {
    const options = config.build;
    return {
        pre: [
            ...(options.watch ? [ensureWatchPlugin()] : []),
            watchPackageDataPlugin(config),
            commonjsPlugin__default(options.commonjsOptions),
            dataURIPlugin(),
            dynamicImportVars__default(options.dynamicImportVarsOptions),
            assetImportMetaUrlPlugin(config),
            ...(options.rollupOptions.plugins
                ? options.rollupOptions.plugins.filter(Boolean)
                : [])
        ],
        post: [
            buildImportAnalysisPlugin(config),
            ...(config.esbuild !== false ? [buildEsbuildPlugin(config)] : []),
            ...(options.minify ? [terserPlugin(config)] : []),
            ...(options.manifest ? [manifestPlugin(config)] : []),
            ...(options.ssrManifest ? [ssrManifestPlugin(config)] : []),
            buildReporterPlugin(config),
            loadFallbackPlugin()
        ]
    };
}
/**
 * Track parallel build calls and only stop the esbuild service when all
 * builds are done. (#1098)
 */
let parallelCallCounts = 0;
// we use a separate counter to track since the call may error before the
// bundle is even pushed.
const parallelBuilds = [];
/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
async function build(inlineConfig = {}) {
    parallelCallCounts++;
    try {
        return await doBuild(inlineConfig);
    }
    finally {
        parallelCallCounts--;
        if (parallelCallCounts <= 0) {
            await Promise.all(parallelBuilds.map((bundle) => bundle.close()));
            parallelBuilds.length = 0;
        }
    }
}
async function doBuild(inlineConfig = {}) {
    var _a, _b, _c, _d;
    const config = await resolveConfig(inlineConfig, 'build', 'production');
    const options = config.build;
    const ssr = !!options.ssr;
    const libOptions = options.lib;
    config.logger.info(colors__default.cyan(`vite v${require('vite/package.json').version} ${colors__default.green(`building ${ssr ? `SSR bundle ` : ``}for ${config.mode}...`)}`));
    const resolve = (p) => path__default.resolve(config.root, p);
    const input = libOptions
        ? resolve(libOptions.entry)
        : typeof options.ssr === 'string'
            ? resolve(options.ssr)
            : ((_a = options.rollupOptions) === null || _a === void 0 ? void 0 : _a.input) || resolve('index.html');
    if (ssr && typeof input === 'string' && input.endsWith('.html')) {
        throw new Error(`rollupOptions.input should not be an html file when building for SSR. ` +
            `Please specify a dedicated SSR entry.`);
    }
    const outDir = resolve(options.outDir);
    // inject ssr arg to plugin load/transform hooks
    const plugins = (ssr ? config.plugins.map((p) => injectSsrFlagToHooks(p)) : config.plugins);
    // inject ssrExternal if present
    const userExternal = (_b = options.rollupOptions) === null || _b === void 0 ? void 0 : _b.external;
    let external = userExternal;
    if (ssr) {
        // see if we have cached deps data available
        let knownImports;
        const dataPath = path__default.join(getDepsCacheDir(config), '_metadata.json');
        try {
            const data = JSON.parse(fs__default.readFileSync(dataPath, 'utf-8'));
            knownImports = Object.keys(data.optimized);
        }
        catch (e) { }
        if (!knownImports) {
            // no dev deps optimization data, do a fresh scan
            knownImports = await findKnownImports(config);
        }
        external = resolveExternal(resolveSSRExternal(config, knownImports), userExternal);
    }
    const rollup = require('rollup');
    const rollupOptions = {
        input,
        context: 'globalThis',
        preserveEntrySignatures: ssr
            ? 'allow-extension'
            : libOptions
                ? 'strict'
                : false,
        ...options.rollupOptions,
        plugins,
        external,
        onwarn(warning, warn) {
            onRollupWarning(warning, warn, config);
        }
    };
    const outputBuildError = (e) => {
        let msg = colors__default.red((e.plugin ? `[${e.plugin}] ` : '') + e.message);
        if (e.id) {
            msg += `\nfile: ${colors__default.cyan(e.id + (e.loc ? `:${e.loc.line}:${e.loc.column}` : ''))}`;
        }
        if (e.frame) {
            msg += `\n` + colors__default.yellow(e.frame);
        }
        config.logger.error(msg, { error: e });
    };
    try {
        const buildOutputOptions = (output = {}) => {
            // @ts-ignore
            if (output.output) {
                config.logger.warn(`You've set "rollupOptions.output.output" in your config. ` +
                    `This is deprecated and will override all Vite.js default output options. ` +
                    `Please use "rollupOptions.output" instead.`);
            }
            return {
                dir: outDir,
                format: ssr ? 'cjs' : 'es',
                exports: ssr ? 'named' : 'auto',
                sourcemap: options.sourcemap,
                name: libOptions ? libOptions.name : undefined,
                entryFileNames: ssr
                    ? `[name].js`
                    : libOptions
                        ? resolveLibFilename(libOptions, output.format || 'es', config.root)
                        : path__default.posix.join(options.assetsDir, `[name].[hash].js`),
                chunkFileNames: libOptions
                    ? `[name].js`
                    : path__default.posix.join(options.assetsDir, `[name].[hash].js`),
                assetFileNames: libOptions
                    ? `[name].[ext]`
                    : path__default.posix.join(options.assetsDir, `[name].[hash].[ext]`),
                // #764 add `Symbol.toStringTag` when build es module into cjs chunk
                // #1048 add `Symbol.toStringTag` for module default export
                namespaceToStringTag: true,
                inlineDynamicImports: ssr && typeof input === 'string',
                ...output
            };
        };
        // resolve lib mode outputs
        const outputs = resolveBuildOutputs((_c = options.rollupOptions) === null || _c === void 0 ? void 0 : _c.output, libOptions, config.logger);
        // watch file changes with rollup
        if (config.build.watch) {
            config.logger.info(colors__default.cyan(`\nwatching for file changes...`));
            const output = [];
            if (Array.isArray(outputs)) {
                for (const resolvedOutput of outputs) {
                    output.push(buildOutputOptions(resolvedOutput));
                }
            }
            else {
                output.push(buildOutputOptions(outputs));
            }
            const watcherOptions = config.build.watch;
            const watcher = rollup.watch({
                ...rollupOptions,
                output,
                watch: {
                    ...watcherOptions,
                    chokidar: {
                        ignoreInitial: true,
                        ignorePermissionErrors: true,
                        ...watcherOptions.chokidar,
                        ignored: [
                            '**/node_modules/**',
                            '**/.git/**',
                            ...(((_d = watcherOptions === null || watcherOptions === void 0 ? void 0 : watcherOptions.chokidar) === null || _d === void 0 ? void 0 : _d.ignored) || [])
                        ]
                    }
                }
            });
            watcher.on('event', (event) => {
                if (event.code === 'BUNDLE_START') {
                    config.logger.info(colors__default.cyan(`\nbuild started...`));
                    if (options.write) {
                        prepareOutDir(outDir, options.emptyOutDir, config);
                    }
                }
                else if (event.code === 'BUNDLE_END') {
                    event.result.close();
                    config.logger.info(colors__default.cyan(`built in ${event.duration}ms.`));
                }
                else if (event.code === 'ERROR') {
                    outputBuildError(event.error);
                }
            });
            // stop watching
            watcher.close();
            return watcher;
        }
        // write or generate files with rollup
        const bundle = await rollup.rollup(rollupOptions);
        parallelBuilds.push(bundle);
        const generate = (output = {}) => {
            return bundle[options.write ? 'write' : 'generate'](buildOutputOptions(output));
        };
        if (options.write) {
            prepareOutDir(outDir, options.emptyOutDir, config);
        }
        if (Array.isArray(outputs)) {
            const res = [];
            for (const output of outputs) {
                res.push(await generate(output));
            }
            return res;
        }
        else {
            return await generate(outputs);
        }
    }
    catch (e) {
        outputBuildError(e);
        throw e;
    }
}
function prepareOutDir(outDir, emptyOutDir, config) {
    if (fs__default.existsSync(outDir)) {
        if (emptyOutDir == null &&
            !normalizePath(outDir).startsWith(config.root + '/')) {
            // warn if outDir is outside of root
            config.logger.warn(colors__default.yellow(`\n${colors__default.bold(`(!)`)} outDir ${colors__default.white(colors__default.dim(outDir))} is not inside project root and will not be emptied.\n` +
                `Use --emptyOutDir to override.\n`));
        }
        else if (emptyOutDir !== false) {
            emptyDir(outDir, ['.git']);
        }
    }
    if (config.publicDir && fs__default.existsSync(config.publicDir)) {
        copyDir(config.publicDir, outDir);
    }
}
function getPkgName(root) {
    const { name } = JSON.parse(lookupFile(root, ['package.json']) || `{}`);
    return (name === null || name === void 0 ? void 0 : name.startsWith('@')) ? name.split('/')[1] : name;
}
function resolveLibFilename(libOptions, format, root) {
    if (typeof libOptions.fileName === 'function') {
        return libOptions.fileName(format);
    }
    const name = libOptions.fileName || getPkgName(root);
    if (!name)
        throw new Error('Name in package.json is required if option "build.lib.fileName" is not provided.');
    return `${name}.${format}.js`;
}
function resolveBuildOutputs(outputs, libOptions, logger) {
    if (libOptions) {
        const formats = libOptions.formats || ['es', 'umd'];
        if ((formats.includes('umd') || formats.includes('iife')) &&
            !libOptions.name) {
            throw new Error(`Option "build.lib.name" is required when output formats ` +
                `include "umd" or "iife".`);
        }
        if (!outputs) {
            return formats.map((format) => ({ format }));
        }
        else if (!Array.isArray(outputs)) {
            return formats.map((format) => ({ ...outputs, format }));
        }
        else if (libOptions.formats) {
            // user explicitly specifying own output array
            logger.warn(colors__default.yellow(`"build.lib.formats" will be ignored because ` +
                `"build.rollupOptions.output" is already an array format`));
        }
    }
    return outputs;
}
const warningIgnoreList = [`CIRCULAR_DEPENDENCY`, `THIS_IS_UNDEFINED`];
const dynamicImportWarningIgnoreList = [
    `Unsupported expression`,
    `statically analyzed`
];
function onRollupWarning(warning, warn, config) {
    var _a;
    if (warning.code === 'UNRESOLVED_IMPORT') {
        const id = warning.source;
        const importer = warning.importer;
        // throw unless it's commonjs external...
        if (!importer || !/\?commonjs-external$/.test(importer)) {
            throw new Error(`[vite]: Rollup failed to resolve import "${id}" from "${importer}".\n` +
                `This is most likely unintended because it can break your application at runtime.\n` +
                `If you do want to externalize this module explicitly add it to\n` +
                `\`build.rollupOptions.external\``);
        }
    }
    if (warning.plugin === 'rollup-plugin-dynamic-import-variables' &&
        dynamicImportWarningIgnoreList.some((msg) => warning.message.includes(msg))) {
        return;
    }
    if (!warningIgnoreList.includes(warning.code)) {
        const userOnWarn = (_a = config.build.rollupOptions) === null || _a === void 0 ? void 0 : _a.onwarn;
        if (userOnWarn) {
            userOnWarn(warning, warn);
        }
        else if (warning.code === 'PLUGIN_WARNING') {
            config.logger.warn(`${colors__default.bold(colors__default.yellow(`[plugin:${warning.plugin}]`))} ${colors__default.yellow(warning.message)}`);
        }
        else {
            warn(warning);
        }
    }
}
function resolveExternal(ssrExternals, user) {
    return (id, parentId, isResolved) => {
        if (shouldExternalizeForSSR(id, ssrExternals)) {
            return true;
        }
        if (user) {
            if (typeof user === 'function') {
                return user(id, parentId, isResolved);
            }
            else if (Array.isArray(user)) {
                return user.some((test) => isExternal(id, test));
            }
            else {
                return isExternal(id, user);
            }
        }
    };
}
function isExternal(id, test) {
    if (typeof test === 'string') {
        return id === test;
    }
    else {
        return test.test(id);
    }
}
function injectSsrFlagToHooks(plugin) {
    const { resolveId, load, transform } = plugin;
    return {
        ...plugin,
        resolveId: wrapSsrResolveId(resolveId),
        load: wrapSsrLoad(load),
        transform: wrapSsrTransform(transform)
    };
}
function wrapSsrResolveId(fn) {
    if (!fn)
        return;
    return function (id, importer, options) {
        return fn.call(this, id, importer, injectSsrFlag(options));
    };
}
function wrapSsrLoad(fn) {
    if (!fn)
        return;
    return function (id, ...args) {
        // @ts-expect-error: Receiving options param to be future-proof if Rollup adds it
        return fn.call(this, id, injectSsrFlag(args[0]));
    };
}
function wrapSsrTransform(fn) {
    if (!fn)
        return;
    return function (code, importer, ...args) {
        // @ts-expect-error: Receiving options param to be future-proof if Rollup adds it
        return fn.call(this, code, importer, injectSsrFlag(args[0]));
    };
}
function injectSsrFlag(options) {
    return { ...(options !== null && options !== void 0 ? options : {}), ssr: true };
}

var build$1 = {
    __proto__: null,
    resolveBuildOptions: resolveBuildOptions,
    resolveBuildPlugins: resolveBuildPlugins,
    build: build,
    resolveLibFilename: resolveLibFilename,
    onRollupWarning: onRollupWarning
};

async function resolveHttpServer({ proxy }, app, httpsOptions) {
    if (!httpsOptions) {
        return require('http').createServer(app);
    }
    if (proxy) {
        // #484 fallback to http1 when proxy is needed.
        return require('https').createServer(httpsOptions, app);
    }
    else {
        return require('http2').createSecureServer({
            ...httpsOptions,
            allowHTTP1: true
        }, app);
    }
}
async function resolveHttpsConfig(https, cacheDir) {
    if (!https)
        return undefined;
    const httpsOption = isObject(https) ? { ...https } : {};
    const { ca, cert, key, pfx } = httpsOption;
    Object.assign(httpsOption, {
        ca: readFileIfExists(ca),
        cert: readFileIfExists(cert),
        key: readFileIfExists(key),
        pfx: readFileIfExists(pfx)
    });
    if (!httpsOption.key || !httpsOption.cert) {
        httpsOption.cert = httpsOption.key = await getCertificate(cacheDir);
    }
    return httpsOption;
}
function readFileIfExists(value) {
    if (typeof value === 'string') {
        try {
            return fs__default.readFileSync(path__default.resolve(value));
        }
        catch (e) {
            return value;
        }
    }
    return value;
}
async function getCertificate(cacheDir) {
    const cachePath = path__default.join(cacheDir, '_cert.pem');
    try {
        const [stat, content] = await Promise.all([
            fs.promises.stat(cachePath),
            fs.promises.readFile(cachePath, 'utf8')
        ]);
        if (Date.now() - stat.ctime.valueOf() > 30 * 24 * 60 * 60 * 1000) {
            throw new Error('cache is outdated.');
        }
        return content;
    }
    catch {
        const content = (await Promise.resolve().then(function () { return require('./dep-e6e312c2.js'); })).createCertificate();
        fs.promises
            .mkdir(cacheDir, { recursive: true })
            .then(() => fs.promises.writeFile(cachePath, content))
            .catch(() => { });
        return content;
    }
}
async function httpServerStart(httpServer, serverOptions) {
    return new Promise((resolve, reject) => {
        let { port, strictPort, host, logger } = serverOptions;
        const onError = (e) => {
            if (e.code === 'EADDRINUSE') {
                if (strictPort) {
                    httpServer.removeListener('error', onError);
                    reject(new Error(`Port ${port} is already in use`));
                }
                else {
                    logger.info(`Port ${port} is in use, trying another one...`);
                    httpServer.listen(++port, host);
                }
            }
            else {
                httpServer.removeListener('error', onError);
                reject(e);
            }
        };
        httpServer.on('error', onError);
        httpServer.listen(port, host, () => {
            httpServer.removeListener('error', onError);
            resolve(port);
        });
    });
}

const HMR_HEADER = 'vite-hmr';
const wsServerEvents = [
    'connection',
    'error',
    'headers',
    'listening',
    'message'
];
function createWebSocketServer(server, config, httpsOptions) {
    let wss;
    let httpsServer = undefined;
    const hmr = isObject(config.server.hmr) && config.server.hmr;
    const hmrServer = hmr && hmr.server;
    const hmrPort = hmr && hmr.port;
    // TODO: the main server port may not have been chosen yet as it may use the next available
    const portsAreCompatible = !hmrPort || hmrPort === config.server.port;
    const wsServer = hmrServer || (portsAreCompatible && server);
    const customListeners = new Map();
    const clientsMap = new WeakMap();
    if (wsServer) {
        wss = new ws.WebSocketServer({ noServer: true });
        wsServer.on('upgrade', (req, socket, head) => {
            if (req.headers['sec-websocket-protocol'] === HMR_HEADER) {
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            }
        });
    }
    else {
        const websocketServerOptions = {};
        const port = hmrPort || 24678;
        const host = (hmr && hmr.host) || undefined;
        if (httpsOptions) {
            // if we're serving the middlewares over https, the ws library doesn't support automatically creating an https server, so we need to do it ourselves
            // create an inline https server and mount the websocket server to it
            httpsServer = https.createServer(httpsOptions, (req, res) => {
                const statusCode = 426;
                const body = http.STATUS_CODES[statusCode];
                if (!body)
                    throw new Error(`No body text found for the ${statusCode} status code`);
                res.writeHead(statusCode, {
                    'Content-Length': body.length,
                    'Content-Type': 'text/plain'
                });
                res.end(body);
            });
            httpsServer.listen(port, host);
            websocketServerOptions.server = httpsServer;
        }
        else {
            // we don't need to serve over https, just let ws handle its own server
            websocketServerOptions.port = port;
            if (host) {
                websocketServerOptions.host = host;
            }
        }
        // vite dev server in middleware mode
        wss = new ws.WebSocketServer(websocketServerOptions);
    }
    wss.on('connection', (socket) => {
        socket.on('message', (raw) => {
            if (!customListeners.size)
                return;
            let parsed;
            try {
                parsed = JSON.parse(String(raw));
            }
            catch { }
            if (!parsed || parsed.type !== 'custom' || !parsed.event)
                return;
            const listeners = customListeners.get(parsed.event);
            if (!(listeners === null || listeners === void 0 ? void 0 : listeners.size))
                return;
            const client = getSocketClient(socket);
            listeners.forEach((listener) => listener(parsed.data, client));
        });
        socket.send(JSON.stringify({ type: 'connected' }));
        if (bufferedError) {
            socket.send(JSON.stringify(bufferedError));
            bufferedError = null;
        }
    });
    wss.on('error', (e) => {
        if (e.code !== 'EADDRINUSE') {
            config.logger.error(colors__default.red(`WebSocket server error:\n${e.stack || e.message}`), { error: e });
        }
    });
    // Provide a wrapper to the ws client so we can send messages in JSON format
    // To be consistent with server.ws.send
    function getSocketClient(socket) {
        if (!clientsMap.has(socket)) {
            clientsMap.set(socket, {
                send: (...args) => {
                    let payload;
                    if (typeof args[0] === 'string') {
                        payload = {
                            type: 'custom',
                            event: args[0],
                            data: args[1]
                        };
                    }
                    else {
                        payload = args[0];
                    }
                    socket.send(JSON.stringify(payload));
                },
                socket
            });
        }
        return clientsMap.get(socket);
    }
    // On page reloads, if a file fails to compile and returns 500, the server
    // sends the error payload before the client connection is established.
    // If we have no open clients, buffer the error and send it to the next
    // connected client.
    let bufferedError = null;
    return {
        on: ((event, fn) => {
            if (wsServerEvents.includes(event))
                wss.on(event, fn);
            else {
                if (!customListeners.has(event)) {
                    customListeners.set(event, new Set());
                }
                customListeners.get(event).add(fn);
            }
        }),
        off: ((event, fn) => {
            var _a;
            if (wsServerEvents.includes(event)) {
                wss.off(event, fn);
            }
            else {
                (_a = customListeners.get(event)) === null || _a === void 0 ? void 0 : _a.delete(fn);
            }
        }),
        get clients() {
            return new Set(Array.from(wss.clients).map(getSocketClient));
        },
        send(...args) {
            let payload;
            if (typeof args[0] === 'string') {
                payload = {
                    type: 'custom',
                    event: args[0],
                    data: args[1]
                };
            }
            else {
                payload = args[0];
            }
            if (payload.type === 'error' && !wss.clients.size) {
                bufferedError = payload;
                return;
            }
            const stringified = JSON.stringify(payload);
            wss.clients.forEach((client) => {
                // readyState 1 means the connection is open
                if (client.readyState === 1) {
                    client.send(stringified);
                }
            });
        },
        close() {
            return new Promise((resolve, reject) => {
                wss.clients.forEach((client) => {
                    client.terminate();
                });
                wss.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (httpsServer) {
                            httpsServer.close((err) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve();
                                }
                            });
                        }
                        else {
                            resolve();
                        }
                    }
                });
            });
        }
    };
}

// this middleware is only active when (config.base !== '/')
function baseMiddleware({ config }) {
    const base = config.base;
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteBaseMiddleware(req, res, next) {
        var _a;
        const url$1 = req.url;
        const parsed = url.parse(url$1);
        const path = parsed.pathname || '/';
        if (path.startsWith(base)) {
            // rewrite url to remove base.. this ensures that other middleware does
            // not need to consider base being prepended or not
            req.url = url$1.replace(base, '/');
            return next();
        }
        // skip redirect and error fallback on middleware mode, #4057
        if (config.server.middlewareMode) {
            return next();
        }
        if (path === '/' || path === '/index.html') {
            // redirect root visit to based url with search and hash
            res.writeHead(302, {
                Location: base + (parsed.search || '') + (parsed.hash || '')
            });
            res.end();
            return;
        }
        else if ((_a = req.headers.accept) === null || _a === void 0 ? void 0 : _a.includes('text/html')) {
            // non-based page visit
            const redirectPath = base + url$1.slice(1);
            res.writeHead(404, {
                'Content-Type': 'text/html'
            });
            res.end(`The server is configured with a public base URL of ${base} - ` +
                `did you mean to visit <a href="${redirectPath}">${redirectPath}</a> instead?`);
            return;
        }
        next();
    };
}

const debug$3 = createDebugger('vite:proxy');
function proxyMiddleware(httpServer, options, config) {
    // lazy require only when proxy is used
    const proxies = {};
    Object.keys(options).forEach((context) => {
        let opts = options[context];
        if (typeof opts === 'string') {
            opts = { target: opts, changeOrigin: true };
        }
        const proxy = httpProxy__default.createProxyServer(opts);
        proxy.on('error', (err) => {
            config.logger.error(`${colors__default.red(`http proxy error:`)}\n${err.stack}`, {
                timestamp: true,
                error: err
            });
        });
        if (opts.configure) {
            opts.configure(proxy, opts);
        }
        // clone before saving because http-proxy mutates the options
        proxies[context] = [proxy, { ...opts }];
    });
    if (httpServer) {
        httpServer.on('upgrade', (req, socket, head) => {
            var _a;
            const url = req.url;
            for (const context in proxies) {
                if (doesProxyContextMatchUrl(context, url)) {
                    const [proxy, opts] = proxies[context];
                    if ((opts.ws || ((_a = opts.target) === null || _a === void 0 ? void 0 : _a.toString().startsWith('ws:'))) &&
                        req.headers['sec-websocket-protocol'] !== HMR_HEADER) {
                        if (opts.rewrite) {
                            req.url = opts.rewrite(url);
                        }
                        debug$3(`${req.url} -> ws ${opts.target}`);
                        proxy.ws(req, socket, head);
                        return;
                    }
                }
            }
        });
    }
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteProxyMiddleware(req, res, next) {
        const url = req.url;
        for (const context in proxies) {
            if (doesProxyContextMatchUrl(context, url)) {
                const [proxy, opts] = proxies[context];
                const options = {};
                if (opts.bypass) {
                    const bypassResult = opts.bypass(req, res, opts);
                    if (typeof bypassResult === 'string') {
                        req.url = bypassResult;
                        debug$3(`bypass: ${req.url} -> ${bypassResult}`);
                        return next();
                    }
                    else if (isObject(bypassResult)) {
                        Object.assign(options, bypassResult);
                        debug$3(`bypass: ${req.url} use modified options: %O`, options);
                        return next();
                    }
                    else if (bypassResult === false) {
                        debug$3(`bypass: ${req.url} -> 404`);
                        return res.end(404);
                    }
                }
                debug$3(`${req.url} -> ${opts.target || opts.forward}`);
                if (opts.rewrite) {
                    req.url = opts.rewrite(req.url);
                }
                proxy.web(req, res, options);
                return;
            }
        }
        next();
    };
}
function doesProxyContextMatchUrl(context, url) {
    return ((context.startsWith('^') && new RegExp(context).test(url)) ||
        url.startsWith(context));
}

function spaFallbackMiddleware(root) {
    const historySpaFallbackMiddleware = history__default({
        logger: createDebugger('vite:spa-fallback'),
        // support /dir/ without explicit index.html
        rewrites: [
            {
                from: /\/$/,
                to({ parsedUrl }) {
                    const rewritten = decodeURIComponent(parsedUrl.pathname) + 'index.html';
                    if (fs__default.existsSync(path__default.join(root, rewritten))) {
                        return rewritten;
                    }
                    else {
                        return `/index.html`;
                    }
                }
            }
        ]
    });
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteSpaFallbackMiddleware(req, res, next) {
        return historySpaFallbackMiddleware(req, res, next);
    };
}

const alias = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json'
};
function send(req, res, content, type, options) {
    const { etag = getEtag__default(content, { weak: true }), cacheControl = 'no-cache', headers, map } = options;
    if (res.writableEnded) {
        return;
    }
    if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
        return;
    }
    res.setHeader('Content-Type', alias[type] || type);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Etag', etag);
    if (headers) {
        for (const name in headers) {
            res.setHeader(name, headers[name]);
        }
    }
    // inject source map reference
    if (map && map.mappings) {
        if (type === 'js' || type === 'css') {
            content = getCodeWithSourcemap(type, content.toString(), map);
        }
    }
    res.statusCode = 200;
    res.end(content);
    return;
}

const ssrModuleExportsKey = `__vite_ssr_exports__`;
const ssrImportKey = `__vite_ssr_import__`;
const ssrDynamicImportKey = `__vite_ssr_dynamic_import__`;
const ssrExportAllKey = `__vite_ssr_exportAll__`;
const ssrImportMetaKey = `__vite_ssr_import_meta__`;
async function ssrTransform(code, inMap, url) {
    const s = new MagicString__default(code);
    let ast;
    try {
        ast = parser.parse(code, {
            sourceType: 'module',
            ecmaVersion: 'latest',
            locations: true
        });
    }
    catch (err) {
        if (!err.loc || !err.loc.line)
            throw err;
        const line = err.loc.line;
        throw new Error(`Parse failure: ${err.message}\nContents of line ${line}: ${code.split('\n')[line - 1]}`);
    }
    let uid = 0;
    const deps = new Set();
    const dynamicDeps = new Set();
    const idToImportMap = new Map();
    const declaredConst = new Set();
    function defineImport(node, source) {
        deps.add(source);
        const importId = `__vite_ssr_import_${uid++}__`;
        s.appendLeft(node.start, `const ${importId} = await ${ssrImportKey}(${JSON.stringify(source)});\n`);
        return importId;
    }
    function defineExport(position, name, local = name) {
        s.appendLeft(position, `\nObject.defineProperty(${ssrModuleExportsKey}, "${name}", ` +
            `{ enumerable: true, configurable: true, get(){ return ${local} }});`);
    }
    // 1. check all import statements and record id -> importName map
    for (const node of ast.body) {
        // import foo from 'foo' --> foo -> __import_foo__.default
        // import { baz } from 'foo' --> baz -> __import_foo__.baz
        // import * as ok from 'foo' --> ok -> __import_foo__
        if (node.type === 'ImportDeclaration') {
            const importId = defineImport(node, node.source.value);
            for (const spec of node.specifiers) {
                if (spec.type === 'ImportSpecifier') {
                    idToImportMap.set(spec.local.name, `${importId}.${spec.imported.name}`);
                }
                else if (spec.type === 'ImportDefaultSpecifier') {
                    idToImportMap.set(spec.local.name, `${importId}.default`);
                }
                else {
                    // namespace specifier
                    idToImportMap.set(spec.local.name, importId);
                }
            }
            s.remove(node.start, node.end);
        }
    }
    // 2. check all export statements and define exports
    for (const node of ast.body) {
        // named exports
        if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration) {
                if (node.declaration.type === 'FunctionDeclaration' ||
                    node.declaration.type === 'ClassDeclaration') {
                    // export function foo() {}
                    defineExport(node.end, node.declaration.id.name);
                }
                else {
                    // export const foo = 1, bar = 2
                    for (const declaration of node.declaration.declarations) {
                        const names = periscopic.extract_names(declaration.id);
                        for (const name of names) {
                            defineExport(node.end, name);
                        }
                    }
                }
                s.remove(node.start, node.declaration.start);
            }
            else {
                s.remove(node.start, node.end);
                if (node.source) {
                    // export { foo, bar } from './foo'
                    const importId = defineImport(node, node.source.value);
                    for (const spec of node.specifiers) {
                        defineExport(node.end, spec.exported.name, `${importId}.${spec.local.name}`);
                    }
                }
                else {
                    // export { foo, bar }
                    for (const spec of node.specifiers) {
                        const local = spec.local.name;
                        const binding = idToImportMap.get(local);
                        defineExport(node.end, spec.exported.name, binding || local);
                    }
                }
            }
        }
        // default export
        if (node.type === 'ExportDefaultDeclaration') {
            const expressionTypes = ['FunctionExpression', 'ClassExpression'];
            if ('id' in node.declaration &&
                node.declaration.id &&
                !expressionTypes.includes(node.declaration.type)) {
                // named hoistable/class exports
                // export default function foo() {}
                // export default class A {}
                const { name } = node.declaration.id;
                s.remove(node.start, node.start + 15 /* 'export default '.length */);
                s.append(`\nObject.defineProperty(${ssrModuleExportsKey}, "default", ` +
                    `{ enumerable: true, value: ${name} });`);
            }
            else {
                // anonymous default exports
                s.overwrite(node.start, node.start + 14 /* 'export default'.length */, `${ssrModuleExportsKey}.default =`, { contentOnly: true });
            }
        }
        // export * from './foo'
        if (node.type === 'ExportAllDeclaration') {
            if (node.exported) {
                const importId = defineImport(node, node.source.value);
                s.remove(node.start, node.end);
                defineExport(node.end, node.exported.name, `${importId}`);
            }
            else {
                const importId = defineImport(node, node.source.value);
                s.remove(node.start, node.end);
                s.appendLeft(node.end, `${ssrExportAllKey}(${importId});`);
            }
        }
    }
    // 3. convert references to import bindings & import.meta references
    walk(ast, {
        onIdentifier(id, parent, parentStack) {
            const grandparent = parentStack[1];
            const binding = idToImportMap.get(id.name);
            if (!binding) {
                return;
            }
            if (isStaticProperty(parent) && parent.shorthand) {
                // let binding used in a property shorthand
                // { foo } -> { foo: __import_x__.foo }
                // skip for destructuring patterns
                if (!isNodeInPatternWeakMap.get(parent) ||
                    isInDestructuringAssignment(parent, parentStack)) {
                    s.appendLeft(id.end, `: ${binding}`);
                }
            }
            else if ((parent.type === 'PropertyDefinition' &&
                (grandparent === null || grandparent === void 0 ? void 0 : grandparent.type) === 'ClassBody') ||
                (parent.type === 'ClassDeclaration' && id === parent.superClass)) {
                if (!declaredConst.has(id.name)) {
                    declaredConst.add(id.name);
                    // locate the top-most node containing the class declaration
                    const topNode = parentStack[parentStack.length - 2];
                    s.prependRight(topNode.start, `const ${id.name} = ${binding};\n`);
                }
            }
            else {
                s.overwrite(id.start, id.end, binding, { contentOnly: true });
            }
        },
        onImportMeta(node) {
            s.overwrite(node.start, node.end, ssrImportMetaKey, { contentOnly: true });
        },
        onDynamicImport(node) {
            s.overwrite(node.start, node.start + 6, ssrDynamicImportKey, {
                contentOnly: true
            });
            if (node.type === 'ImportExpression' && node.source.type === 'Literal') {
                dynamicDeps.add(node.source.value);
            }
        }
    });
    let map = s.generateMap({ hires: true });
    if (inMap && inMap.mappings && inMap.sources.length > 0) {
        map = combineSourcemaps(url, [
            {
                ...map,
                sources: inMap.sources,
                sourcesContent: inMap.sourcesContent
            },
            inMap
        ]);
    }
    else {
        map.sources = [url];
        map.sourcesContent = [code];
    }
    return {
        code: s.toString(),
        map,
        deps: [...deps],
        dynamicDeps: [...dynamicDeps]
    };
}
const isNodeInPatternWeakMap = new WeakMap();
/**
 * Same logic from \@vue/compiler-core & \@vue/compiler-sfc
 * Except this is using acorn AST
 */
function walk(root, { onIdentifier, onImportMeta, onDynamicImport }) {
    const parentStack = [];
    const scopeMap = new WeakMap();
    const identifiers = [];
    const setScope = (node, name) => {
        let scopeIds = scopeMap.get(node);
        if (scopeIds && scopeIds.has(name)) {
            return;
        }
        if (!scopeIds) {
            scopeIds = new Set();
            scopeMap.set(node, scopeIds);
        }
        scopeIds.add(name);
    };
    function isInScope(name, parents) {
        return parents.some((node) => { var _a; return node && ((_a = scopeMap.get(node)) === null || _a === void 0 ? void 0 : _a.has(name)); });
    }
    function handlePattern(p, parentFunction) {
        if (p.type === 'Identifier') {
            setScope(parentFunction, p.name);
        }
        else if (p.type === 'RestElement') {
            handlePattern(p.argument, parentFunction);
        }
        else if (p.type === 'ObjectPattern') {
            p.properties.forEach((property) => {
                if (property.type === 'RestElement') {
                    setScope(parentFunction, property.argument.name);
                }
                else {
                    handlePattern(property.value, parentFunction);
                }
            });
        }
        else if (p.type === 'ArrayPattern') {
            p.elements.forEach((element) => {
                if (element) {
                    handlePattern(element, parentFunction);
                }
            });
        }
        else if (p.type === 'AssignmentPattern') {
            handlePattern(p.left, parentFunction);
        }
        else {
            setScope(parentFunction, p.name);
        }
    }
    estreeWalker.walk(root, {
        enter(node, parent) {
            if (node.type === 'ImportDeclaration') {
                return this.skip();
            }
            parent && parentStack.unshift(parent);
            if (node.type === 'MetaProperty' && node.meta.name === 'import') {
                onImportMeta(node);
            }
            else if (node.type === 'ImportExpression') {
                onDynamicImport(node);
            }
            if (node.type === 'Identifier') {
                if (!isInScope(node.name, parentStack) &&
                    isRefIdentifier(node, parent, parentStack)) {
                    // record the identifier, for DFS -> BFS
                    identifiers.push([node, parentStack.slice(0)]);
                }
            }
            else if (isFunction(node)) {
                // If it is a function declaration, it could be shadowing an import
                // Add its name to the scope so it won't get replaced
                if (node.type === 'FunctionDeclaration') {
                    const parentFunction = findParentFunction(parentStack);
                    if (parentFunction) {
                        setScope(parentFunction, node.id.name);
                    }
                }
                // walk function expressions and add its arguments to known identifiers
                // so that we don't prefix them
                node.params.forEach((p) => {
                    if (p.type === 'ObjectPattern' || p.type === 'ArrayPattern') {
                        handlePattern(p, node);
                        return;
                    }
                    estreeWalker.walk(p.type === 'AssignmentPattern' ? p.left : p, {
                        enter(child, parent) {
                            // skip params default value of destructure
                            if ((parent === null || parent === void 0 ? void 0 : parent.type) === 'AssignmentPattern' &&
                                (parent === null || parent === void 0 ? void 0 : parent.right) === child) {
                                return this.skip();
                            }
                            if (child.type !== 'Identifier')
                                return;
                            // do not record as scope variable if is a destructuring keyword
                            if (isStaticPropertyKey(child, parent))
                                return;
                            // do not record if this is a default value
                            // assignment of a destructuring variable
                            if (((parent === null || parent === void 0 ? void 0 : parent.type) === 'TemplateLiteral' &&
                                (parent === null || parent === void 0 ? void 0 : parent.expressions.includes(child))) ||
                                ((parent === null || parent === void 0 ? void 0 : parent.type) === 'CallExpression' && (parent === null || parent === void 0 ? void 0 : parent.callee) === child)) {
                                return;
                            }
                            setScope(node, child.name);
                        }
                    });
                });
            }
            else if (node.type === 'Property' && parent.type === 'ObjectPattern') {
                // mark property in destructuring pattern
                isNodeInPatternWeakMap.set(node, true);
            }
            else if (node.type === 'VariableDeclarator') {
                const parentFunction = findParentFunction(parentStack);
                if (parentFunction) {
                    handlePattern(node.id, parentFunction);
                }
            }
        },
        leave(node, parent) {
            parent && parentStack.shift();
        }
    });
    // emit the identifier events in BFS so the hoisted declarations
    // can be captured correctly
    identifiers.forEach(([node, stack]) => {
        if (!isInScope(node.name, stack))
            onIdentifier(node, stack[0], stack);
    });
}
function isRefIdentifier(id, parent, parentStack) {
    // declaration id
    if (parent.type === 'CatchClause' ||
        ((parent.type === 'VariableDeclarator' ||
            parent.type === 'ClassDeclaration') &&
            parent.id === id)) {
        return false;
    }
    if (isFunction(parent)) {
        // function declaration/expression id
        if (parent.id === id) {
            return false;
        }
        // params list
        if (parent.params.includes(id)) {
            return false;
        }
    }
    // class method name
    if (parent.type === 'MethodDefinition' && !parent.computed) {
        return false;
    }
    // property key
    // this also covers object destructuring pattern
    if (isStaticPropertyKey(id, parent) || isNodeInPatternWeakMap.get(parent)) {
        return false;
    }
    // non-assignment array destructuring pattern
    if (parent.type === 'ArrayPattern' &&
        !isInDestructuringAssignment(parent, parentStack)) {
        return false;
    }
    // member expression property
    if (parent.type === 'MemberExpression' &&
        parent.property === id &&
        !parent.computed) {
        return false;
    }
    if (parent.type === 'ExportSpecifier') {
        return false;
    }
    // is a special keyword but parsed as identifier
    if (id.name === 'arguments') {
        return false;
    }
    return true;
}
const isStaticProperty = (node) => node && node.type === 'Property' && !node.computed;
const isStaticPropertyKey = (node, parent) => isStaticProperty(parent) && parent.key === node;
function isFunction(node) {
    return /Function(?:Expression|Declaration)$|Method$/.test(node.type);
}
function findParentFunction(parentStack) {
    return parentStack.find((i) => isFunction(i));
}
function isInDestructuringAssignment(parent, parentStack) {
    if (parent &&
        (parent.type === 'Property' || parent.type === 'ArrayPattern')) {
        return parentStack.some((i) => i.type === 'AssignmentExpression');
    }
    return false;
}

const sirvOptions = {
    dev: true,
    etag: true,
    extensions: [],
    setHeaders(res, pathname) {
        // Matches js, jsx, ts, tsx.
        // The reason this is done, is that the .ts file extension is reserved
        // for the MIME type video/mp2t. In almost all cases, we can expect
        // these files to be TypeScript files, and for Vite to serve them with
        // this Content-Type.
        if (/\.[tj]sx?$/.test(pathname)) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
};
function servePublicMiddleware(dir) {
    const serve = sirv__default(dir, sirvOptions);
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteServePublicMiddleware(req, res, next) {
        // skip import request and internal requests `/@fs/ /@vite-client` etc...
        if (isImportRequest(req.url) || isInternalRequest(req.url)) {
            return next();
        }
        serve(req, res, next);
    };
}
function serveStaticMiddleware(dir, server) {
    const serve = sirv__default(dir, sirvOptions);
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteServeStaticMiddleware(req, res, next) {
        // only serve the file if it's not an html request or ends with `/`
        // so that html requests can fallthrough to our html middleware for
        // special processing
        // also skip internal requests `/@fs/ /@vite-client` etc...
        const cleanedUrl = cleanUrl(req.url);
        if (cleanedUrl.endsWith('/') ||
            path__default.extname(cleanedUrl) === '.html' ||
            isInternalRequest(req.url)) {
            return next();
        }
        const url = decodeURI(req.url);
        // apply aliases to static requests as well
        let redirected;
        for (const { find, replacement } of server.config.resolve.alias) {
            const matches = typeof find === 'string' ? url.startsWith(find) : find.test(url);
            if (matches) {
                redirected = url.replace(find, replacement);
                break;
            }
        }
        if (redirected) {
            // dir is pre-normalized to posix style
            if (redirected.startsWith(dir)) {
                redirected = redirected.slice(dir.length);
            }
        }
        const resolvedUrl = redirected || url;
        let fileUrl = path__default.resolve(dir, resolvedUrl.replace(/^\//, ''));
        if (resolvedUrl.endsWith('/') && !fileUrl.endsWith('/')) {
            fileUrl = fileUrl + '/';
        }
        if (!ensureServingAccess(fileUrl, server, res, next)) {
            return;
        }
        if (redirected) {
            req.url = redirected;
        }
        serve(req, res, next);
    };
}
function serveRawFsMiddleware(server) {
    const serveFromRoot = sirv__default('/', sirvOptions);
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteServeRawFsMiddleware(req, res, next) {
        let url = decodeURI(req.url);
        // In some cases (e.g. linked monorepos) files outside of root will
        // reference assets that are also out of served root. In such cases
        // the paths are rewritten to `/@fs/` prefixed paths and must be served by
        // searching based from fs root.
        if (url.startsWith(FS_PREFIX)) {
            // restrict files outside of `fs.allow`
            if (!ensureServingAccess(slash(path__default.resolve(fsPathFromId(url))), server, res, next)) {
                return;
            }
            url = url.slice(FS_PREFIX.length);
            if (isWindows)
                url = url.replace(/^[A-Z]:/i, '');
            req.url = url;
            serveFromRoot(req, res, next);
        }
        else {
            next();
        }
    };
}
const _matchOptions = { matchBase: true };
function isFileServingAllowed(url, server) {
    if (!server.config.server.fs.strict)
        return true;
    const file = fsPathFromUrl(url);
    if (server.config.server.fs.deny.some((i) => micromatch.isMatch(file, i, _matchOptions)))
        return false;
    if (server.moduleGraph.safeModulesPath.has(file))
        return true;
    if (server.config.server.fs.allow.some((dir) => isParentDirectory(dir, file)))
        return true;
    return false;
}
function ensureServingAccess(url, server, res, next) {
    if (isFileServingAllowed(url, server)) {
        return true;
    }
    if (isFileReadable(cleanUrl(url))) {
        const urlMessage = `The request url "${url}" is outside of Vite serving allow list.`;
        const hintMessage = `
${server.config.server.fs.allow.map((i) => `- ${i}`).join('\n')}

Refer to docs https://vitejs.dev/config/#server-fs-allow for configurations and more details.`;
        server.config.logger.error(urlMessage);
        server.config.logger.warnOnce(hintMessage + '\n');
        res.statusCode = 403;
        res.write(renderRestrictedErrorHTML(urlMessage + '\n' + hintMessage));
        res.end();
    }
    else {
        // if the file doesn't exist, we shouldn't restrict this path as it can
        // be an API call. Middlewares would issue a 404 if the file isn't handled
        next();
    }
    return false;
}
function renderRestrictedErrorHTML(msg) {
    // to have syntax highlighting and autocompletion in IDE
    const html = String.raw;
    return html `
    <body>
      <h1>403 Restricted</h1>
      <p>${msg.replace(/\n/g, '<br/>')}</p>
      <style>
        body {
          padding: 1em 2em;
        }
      </style>
    </body>
  `;
}

const debugLoad = createDebugger('vite:load');
const debugTransform = createDebugger('vite:transform');
const debugCache$1 = createDebugger('vite:cache');
const isDebug$3 = !!process.env.DEBUG;
function transformRequest(url, server, options = {}) {
    const cacheKey = (options.ssr ? 'ssr:' : options.html ? 'html:' : '') + url;
    // This module may get invalidated while we are processing it. For example
    // when a full page reload is needed after the re-processing of pre-bundled
    // dependencies when a missing dep is discovered. We save the current time
    // to compare it to the last invalidation performed to know if we should
    // cache the result of the transformation or we should discard it as stale.
    //
    // A module can be invalidated due to:
    // 1. A full reload because of pre-bundling newly discovered deps
    // 2. A full reload after a config change
    // 3. The file that generated the module changed
    // 4. Invalidation for a virtual module
    //
    // For 1 and 2, a new request for this module will be issued after
    // the invalidation as part of the browser reloading the page. For 3 and 4
    // there may not be a new request right away because of HMR handling.
    // In all cases, the next time this module is requested, it should be
    // re-processed.
    //
    // We save the timestamp when we start processing and compare it with the
    // last time this module is invalidated
    const timestamp = Date.now();
    const pending = server._pendingRequests.get(cacheKey);
    if (pending) {
        return server.moduleGraph
            .getModuleByUrl(removeTimestampQuery(url), options.ssr)
            .then((module) => {
            if (!module || pending.timestamp > module.lastInvalidationTimestamp) {
                // The pending request is still valid, we can safely reuse its result
                return pending.request;
            }
            else {
                // Request 1 for module A     (pending.timestamp)
                // Invalidate module A        (module.lastInvalidationTimestamp)
                // Request 2 for module A     (timestamp)
                // First request has been invalidated, abort it to clear the cache,
                // then perform a new doTransform.
                pending.abort();
                return transformRequest(url, server, options);
            }
        });
    }
    const request = doTransform(url, server, options, timestamp);
    // Avoid clearing the cache of future requests if aborted
    let cleared = false;
    const clearCache = () => {
        if (!cleared) {
            server._pendingRequests.delete(cacheKey);
            cleared = true;
        }
    };
    // Cache the request and clear it once processing is done
    server._pendingRequests.set(cacheKey, {
        request,
        timestamp,
        abort: clearCache
    });
    request.then(clearCache, clearCache);
    return request;
}
async function doTransform(url, server, options, timestamp) {
    var _a, _b;
    url = removeTimestampQuery(url);
    const { config, pluginContainer, moduleGraph, watcher } = server;
    const { root, logger } = config;
    const prettyUrl = isDebug$3 ? prettifyUrl(url, root) : '';
    const ssr = !!options.ssr;
    const module = await server.moduleGraph.getModuleByUrl(url, ssr);
    // check if we have a fresh cache
    const cached = module && (ssr ? module.ssrTransformResult : module.transformResult);
    if (cached) {
        // TODO: check if the module is "partially invalidated" - i.e. an import
        // down the chain has been fully invalidated, but this current module's
        // content has not changed.
        // in this case, we can reuse its previous cached result and only update
        // its import timestamps.
        isDebug$3 && debugCache$1(`[memory] ${prettyUrl}`);
        return cached;
    }
    // resolve
    const id = ((_a = (await pluginContainer.resolveId(url, undefined, { ssr }))) === null || _a === void 0 ? void 0 : _a.id) || url;
    const file = cleanUrl(id);
    let code = null;
    let map = null;
    // load
    const loadStart = isDebug$3 ? perf_hooks.performance.now() : 0;
    const loadResult = await pluginContainer.load(id, { ssr });
    if (loadResult == null) {
        // if this is an html request and there is no load result, skip ahead to
        // SPA fallback.
        if (options.html && !id.endsWith('.html')) {
            return null;
        }
        // try fallback loading it from fs as string
        // if the file is a binary, there should be a plugin that already loaded it
        // as string
        // only try the fallback if access is allowed, skip for out of root url
        // like /service-worker.js or /api/users
        if (options.ssr || isFileServingAllowed(file, server)) {
            try {
                code = await fs.promises.readFile(file, 'utf-8');
                isDebug$3 && debugLoad(`${timeFrom(loadStart)} [fs] ${prettyUrl}`);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
            }
        }
        if (code) {
            try {
                map = (_b = (convertSourceMap__namespace.fromSource(code) ||
                    convertSourceMap__namespace.fromMapFileSource(code, path__default.dirname(file)))) === null || _b === void 0 ? void 0 : _b.toObject();
            }
            catch (e) {
                logger.warn(`Failed to load source map for ${url}.`, {
                    timestamp: true
                });
            }
        }
    }
    else {
        isDebug$3 && debugLoad(`${timeFrom(loadStart)} [plugin] ${prettyUrl}`);
        if (isObject(loadResult)) {
            code = loadResult.code;
            map = loadResult.map;
        }
        else {
            code = loadResult;
        }
    }
    if (code == null) {
        if (checkPublicFile(url, config)) {
            throw new Error(`Failed to load url ${url} (resolved id: ${id}). ` +
                `This file is in /public and will be copied as-is during build without ` +
                `going through the plugin transforms, and therefore should not be ` +
                `imported from source code. It can only be referenced via HTML tags.`);
        }
        else {
            return null;
        }
    }
    // ensure module in graph after successful load
    const mod = await moduleGraph.ensureEntryFromUrl(url, ssr);
    ensureWatchedFile(watcher, mod.file, root);
    // transform
    const transformStart = isDebug$3 ? perf_hooks.performance.now() : 0;
    const transformResult = await pluginContainer.transform(code, id, {
        inMap: map,
        ssr
    });
    if (transformResult == null ||
        (isObject(transformResult) && transformResult.code == null)) {
        // no transform applied, keep code as-is
        isDebug$3 &&
            debugTransform(timeFrom(transformStart) + colors__default.dim(` [skipped] ${prettyUrl}`));
    }
    else {
        isDebug$3 && debugTransform(`${timeFrom(transformStart)} ${prettyUrl}`);
        code = transformResult.code;
        map = transformResult.map;
    }
    if (map && mod.file) {
        map = (typeof map === 'string' ? JSON.parse(map) : map);
        if (map.mappings && !map.sourcesContent) {
            await injectSourcesContent(map, mod.file, logger);
        }
    }
    const result = ssr
        ? await ssrTransform(code, map, url)
        : {
            code,
            map,
            etag: getEtag__default(code, { weak: true })
        };
    // Only cache the result if the module wasn't invalidated while it was
    // being processed, so it is re-processed next time if it is stale
    if (timestamp > mod.lastInvalidationTimestamp) {
        if (ssr)
            mod.ssrTransformResult = result;
        else
            mod.transformResult = result;
    }
    return result;
}

const ERR_OPTIMIZE_DEPS_PROCESSING_ERROR = 'ERR_OPTIMIZE_DEPS_PROCESSING_ERROR';
const ERR_OUTDATED_OPTIMIZED_DEP = 'ERR_OUTDATED_OPTIMIZED_DEP';
const isDebug$2 = process.env.DEBUG;
const debug$2 = createDebugger('vite:optimize-deps');
function optimizedDepsPlugin() {
    let server;
    return {
        name: 'vite:optimized-deps',
        configureServer(_server) {
            server = _server;
        },
        async load(id) {
            var _a, _b;
            if (server && isOptimizedDepFile(id, server.config)) {
                const metadata = (_a = server === null || server === void 0 ? void 0 : server._optimizedDeps) === null || _a === void 0 ? void 0 : _a.metadata;
                if (metadata) {
                    const file = cleanUrl(id);
                    const versionMatch = id.match(DEP_VERSION_RE);
                    const browserHash = versionMatch
                        ? versionMatch[1].split('=')[1]
                        : undefined;
                    // Search in both the currently optimized and newly discovered deps
                    const info = optimizedDepInfoFromFile(metadata, file);
                    if (info) {
                        if (browserHash && info.browserHash !== browserHash) {
                            throwOutdatedRequest(id);
                        }
                        try {
                            // This is an entry point, it may still not be bundled
                            await info.processing;
                        }
                        catch {
                            // If the refresh has not happened after timeout, Vite considers
                            // something unexpected has happened. In this case, Vite
                            // returns an empty response that will error.
                            throwProcessingError(id);
                            return;
                        }
                        const newMetadata = (_b = server._optimizedDeps) === null || _b === void 0 ? void 0 : _b.metadata;
                        if (metadata !== newMetadata) {
                            const currentInfo = optimizedDepInfoFromFile(newMetadata, file);
                            if (info.browserHash !== (currentInfo === null || currentInfo === void 0 ? void 0 : currentInfo.browserHash)) {
                                throwOutdatedRequest(id);
                            }
                        }
                    }
                    isDebug$2 && debug$2(`load ${colors__default.cyan(file)}`);
                    // Load the file from the cache instead of waiting for other plugin
                    // load hooks to avoid race conditions, once processing is resolved,
                    // we are sure that the file has been properly save to disk
                    try {
                        return await fs.promises.readFile(file, 'utf-8');
                    }
                    catch (e) {
                        // Outdated non-entry points (CHUNK), loaded after a rerun
                        throwOutdatedRequest(id);
                    }
                }
            }
        }
    };
}
function throwProcessingError(id) {
    const err = new Error(`Something unexpected happened while optimizing "${id}". ` +
        `The current page should have reloaded by now`);
    err.code = ERR_OPTIMIZE_DEPS_PROCESSING_ERROR;
    // This error will be caught by the transform middleware that will
    // send a 504 status code request timeout
    throw err;
}
function throwOutdatedRequest(id) {
    const err = new Error(`There is a new version of the pre-bundle for "${id}", ` +
        `a page reload is going to ask for it.`);
    err.code = ERR_OUTDATED_OPTIMIZED_DEP;
    // This error will be caught by the transform middleware that will
    // send a 504 status code request timeout
    throw err;
}

const debugCache = createDebugger('vite:cache');
const isDebug$1 = !!process.env.DEBUG;
const knownIgnoreList = new Set(['/', '/favicon.ico']);
function transformMiddleware(server) {
    const { config: { root, logger }, moduleGraph } = server;
    const isOptimizedDepUrl = createIsOptimizedDepUrl(server.config);
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return async function viteTransformMiddleware(req, res, next) {
        var _a, _b, _c, _d, _e, _f;
        if (req.method !== 'GET' || knownIgnoreList.has(req.url)) {
            return next();
        }
        let url;
        try {
            url = decodeURI(removeTimestampQuery(req.url)).replace(NULL_BYTE_PLACEHOLDER, '\0');
        }
        catch (e) {
            return next(e);
        }
        const withoutQuery = cleanUrl(url);
        try {
            const isSourceMap = withoutQuery.endsWith('.map');
            // since we generate source map references, handle those requests here
            if (isSourceMap) {
                if (isOptimizedDepUrl(url)) {
                    // If the browser is requesting a source map for an optimized dep, it
                    // means that the dependency has already been pre-bundled and loaded
                    const mapFile = url.startsWith(FS_PREFIX)
                        ? fsPathFromId(url)
                        : normalizePath(ensureVolumeInPath(path__default.resolve(root, url.slice(1))));
                    try {
                        const map = await fs.promises.readFile(mapFile, 'utf-8');
                        return send(req, res, map, 'json', {
                            headers: server.config.server.headers
                        });
                    }
                    catch (e) {
                        // Outdated source map request for optimized deps, this isn't an error
                        // but part of the normal flow when re-optimizing after missing deps
                        // Send back an empty source map so the browser doesn't issue warnings
                        const dummySourceMap = {
                            version: 3,
                            file: mapFile.replace(/\.map$/, ''),
                            sources: [],
                            sourcesContent: [],
                            names: [],
                            mappings: ';;;;;;;;;'
                        };
                        return send(req, res, JSON.stringify(dummySourceMap), 'json', {
                            cacheControl: 'no-cache',
                            headers: server.config.server.headers
                        });
                    }
                }
                else {
                    const originalUrl = url.replace(/\.map($|\?)/, '$1');
                    const map = (_b = (_a = (await moduleGraph.getModuleByUrl(originalUrl, false))) === null || _a === void 0 ? void 0 : _a.transformResult) === null || _b === void 0 ? void 0 : _b.map;
                    if (map) {
                        return send(req, res, JSON.stringify(map), 'json', {
                            headers: server.config.server.headers
                        });
                    }
                    else {
                        return next();
                    }
                }
            }
            // check if public dir is inside root dir
            const publicDir = normalizePath(server.config.publicDir);
            const rootDir = normalizePath(server.config.root);
            if (publicDir.startsWith(rootDir)) {
                const publicPath = `${publicDir.slice(rootDir.length)}/`;
                // warn explicit public paths
                if (url.startsWith(publicPath)) {
                    logger.warn(colors__default.yellow(`files in the public directory are served at the root path.\n` +
                        `Instead of ${colors__default.cyan(url)}, use ${colors__default.cyan(url.replace(publicPath, '/'))}.`));
                }
            }
            if (isJSRequest(url) ||
                isImportRequest(url) ||
                isCSSRequest(url) ||
                isHTMLProxy(url)) {
                // strip ?import
                url = removeImportQuery(url);
                // Strip valid id prefix. This is prepended to resolved Ids that are
                // not valid browser import specifiers by the importAnalysis plugin.
                url = unwrapId(url);
                // for CSS, we need to differentiate between normal CSS requests and
                // imports
                if (isCSSRequest(url) &&
                    !isDirectRequest(url) &&
                    ((_c = req.headers.accept) === null || _c === void 0 ? void 0 : _c.includes('text/css'))) {
                    url = injectQuery(url, 'direct');
                }
                // check if we can return 304 early
                const ifNoneMatch = req.headers['if-none-match'];
                if (ifNoneMatch &&
                    ((_e = (_d = (await moduleGraph.getModuleByUrl(url, false))) === null || _d === void 0 ? void 0 : _d.transformResult) === null || _e === void 0 ? void 0 : _e.etag) === ifNoneMatch) {
                    isDebug$1 && debugCache(`[304] ${prettifyUrl(url, root)}`);
                    res.statusCode = 304;
                    return res.end();
                }
                // resolve, load and transform using the plugin container
                const result = await transformRequest(url, server, {
                    html: (_f = req.headers.accept) === null || _f === void 0 ? void 0 : _f.includes('text/html')
                });
                if (result) {
                    const type = isDirectCSSRequest(url) ? 'css' : 'js';
                    const isDep = DEP_VERSION_RE.test(url) || isOptimizedDepUrl(url);
                    return send(req, res, result.code, type, {
                        etag: result.etag,
                        // allow browser to cache npm deps!
                        cacheControl: isDep ? 'max-age=31536000,immutable' : 'no-cache',
                        headers: server.config.server.headers,
                        map: result.map
                    });
                }
            }
        }
        catch (e) {
            if ((e === null || e === void 0 ? void 0 : e.code) === ERR_OPTIMIZE_DEPS_PROCESSING_ERROR) {
                // Skip if response has already been sent
                if (!res.writableEnded) {
                    res.statusCode = 504; // status code request timeout
                    res.end();
                }
                // This timeout is unexpected
                logger.error(e.message);
                return;
            }
            if ((e === null || e === void 0 ? void 0 : e.code) === ERR_OUTDATED_OPTIMIZED_DEP) {
                // Skip if response has already been sent
                if (!res.writableEnded) {
                    res.statusCode = 504; // status code request timeout
                    res.end();
                }
                // We don't need to log an error in this case, the request
                // is outdated because new dependencies were discovered and
                // the new pre-bundle dependendencies have changed.
                // A full-page reload has been issued, and these old requests
                // can't be properly fullfilled. This isn't an unexpected
                // error but a normal part of the missing deps discovery flow
                return;
            }
            return next(e);
        }
        next();
    };
}

function createDevHtmlTransformFn(server) {
    const [preHooks, postHooks] = resolveHtmlTransforms(server.config.plugins);
    return (url, html, originalUrl) => {
        return applyHtmlTransforms(html, [...preHooks, devHtmlHook, ...postHooks], {
            path: url,
            filename: getHtmlFilename(url, server),
            server,
            originalUrl
        });
    };
}
function getHtmlFilename(url, server) {
    if (url.startsWith(FS_PREFIX)) {
        return decodeURIComponent(fsPathFromId(url));
    }
    else {
        return decodeURIComponent(normalizePath(path__default.join(server.config.root, url.slice(1))));
    }
}
const startsWithSingleSlashRE = /^\/(?!\/)/;
const processNodeUrl = (node, s, config, htmlPath, originalUrl, moduleGraph) => {
    var _a;
    let url = ((_a = node.value) === null || _a === void 0 ? void 0 : _a.content) || '';
    if (moduleGraph) {
        const mod = moduleGraph.urlToModuleMap.get(url);
        if (mod && mod.lastHMRTimestamp > 0) {
            url = injectQuery(url, `t=${mod.lastHMRTimestamp}`);
        }
    }
    if (startsWithSingleSlashRE.test(url)) {
        // prefix with base
        s.overwrite(node.value.loc.start.offset, node.value.loc.end.offset, `"${config.base + url.slice(1)}"`, { contentOnly: true });
    }
    else if (url.startsWith('.') &&
        originalUrl &&
        originalUrl !== '/' &&
        htmlPath === '/index.html') {
        // #3230 if some request url (localhost:3000/a/b) return to fallback html, the relative assets
        // path will add `/a/` prefix, it will caused 404.
        // rewrite before `./index.js` -> `localhost:3000/a/index.js`.
        // rewrite after `../index.js` -> `localhost:3000/index.js`.
        s.overwrite(node.value.loc.start.offset, node.value.loc.end.offset, `"${path__default.posix.join(path__default.posix.relative(originalUrl, '/'), url.slice(1))}"`, { contentOnly: true });
    }
};
const devHtmlHook = async (html, { path: htmlPath, filename, server, originalUrl }) => {
    const { config, moduleGraph } = server;
    const base = config.base || '/';
    const s = new MagicString__default(html);
    let inlineModuleIndex = -1;
    const filePath = cleanUrl(htmlPath);
    const addInlineModule = (node, ext) => {
        inlineModuleIndex++;
        const url = filePath.replace(normalizePath(config.root), '');
        const contentNode = node.children[0];
        const code = contentNode.content;
        const map = new MagicString__default(html)
            .snip(contentNode.loc.start.offset, contentNode.loc.end.offset)
            .generateMap({ hires: true });
        map.sources = [filename];
        map.file = filename;
        // add HTML Proxy to Map
        addToHTMLProxyCache(config, url, inlineModuleIndex, { code, map });
        // inline js module. convert to src="proxy"
        const modulePath = `${config.base + htmlPath.slice(1)}?html-proxy&index=${inlineModuleIndex}.${ext}`;
        // invalidate the module so the newly cached contents will be served
        const module = server === null || server === void 0 ? void 0 : server.moduleGraph.getModuleById(modulePath);
        if (module) {
            server === null || server === void 0 ? void 0 : server.moduleGraph.invalidateModule(module);
        }
        s.overwrite(node.loc.start.offset, node.loc.end.offset, `<script type="module" src="${modulePath}"></script>`, { contentOnly: true });
    };
    await traverseHtml(html, htmlPath, (node) => {
        if (node.type !== 1 /* ELEMENT */) {
            return;
        }
        // script tags
        if (node.tag === 'script') {
            const { src, isModule } = getScriptInfo(node);
            if (src) {
                processNodeUrl(src, s, config, htmlPath, originalUrl, moduleGraph);
            }
            else if (isModule && node.children.length) {
                addInlineModule(node, 'js');
            }
        }
        if (node.tag === 'style' && node.children.length) {
            addInlineModule(node, 'css');
        }
        // elements with [href/src] attrs
        const assetAttrs = assetAttrsConfig[node.tag];
        if (assetAttrs) {
            for (const p of node.props) {
                if (p.type === 6 /* ATTRIBUTE */ &&
                    p.value &&
                    assetAttrs.includes(p.name)) {
                    processNodeUrl(p, s, config, htmlPath, originalUrl);
                }
            }
        }
    });
    html = s.toString();
    return {
        html,
        tags: [
            {
                tag: 'script',
                attrs: {
                    type: 'module',
                    src: path__default.posix.join(base, CLIENT_PUBLIC_PATH)
                },
                injectTo: 'head-prepend'
            }
        ]
    };
};
function indexHtmlMiddleware(server) {
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return async function viteIndexHtmlMiddleware(req, res, next) {
        if (res.writableEnded) {
            return next();
        }
        const url = req.url && cleanUrl(req.url);
        // spa-fallback always redirects to /index.html
        if ((url === null || url === void 0 ? void 0 : url.endsWith('.html')) && req.headers['sec-fetch-dest'] !== 'script') {
            const filename = getHtmlFilename(url, server);
            if (fs__default.existsSync(filename)) {
                try {
                    let html = fs__default.readFileSync(filename, 'utf-8');
                    html = await server.transformIndexHtml(url, html, req.originalUrl);
                    return send(req, res, html, 'html', {
                        headers: server.config.server.headers
                    });
                }
                catch (e) {
                    return next(e);
                }
            }
        }
        next();
    };
}

const logTime = createDebugger('vite:time');
function timeMiddleware(root) {
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteTimeMiddleware(req, res, next) {
        const start = perf_hooks.performance.now();
        const end = res.end;
        res.end = (...args) => {
            logTime(`${timeFrom(start)} ${prettifyUrl(req.url, root)}`);
            // @ts-ignore
            return end.call(res, ...args);
        };
        next();
    };
}

const debugHmr = createDebugger('vite:hmr');
const normalizedClientDir = normalizePath(CLIENT_DIR);
function getShortName(file, root) {
    return file.startsWith(root + '/') ? path__default.posix.relative(root, file) : file;
}
async function handleHMRUpdate(file, server) {
    const { ws, config, moduleGraph } = server;
    const shortFile = getShortName(file, config.root);
    const fileName = path__default.basename(file);
    const isConfig = file === config.configFile;
    const isConfigDependency = config.configFileDependencies.some((name) => file === name);
    const isEnv = config.inlineConfig.envFile !== false &&
        (fileName === '.env' || fileName.startsWith('.env.'));
    if (isConfig || isConfigDependency || isEnv) {
        // auto restart server
        debugHmr(`[config change] ${colors__default.dim(shortFile)}`);
        config.logger.info(colors__default.green(`${path__default.relative(process.cwd(), file)} changed, restarting server...`), { clear: true, timestamp: true });
        try {
            await server.restart();
        }
        catch (e) {
            config.logger.error(colors__default.red(e));
        }
        return;
    }
    debugHmr(`[file change] ${colors__default.dim(shortFile)}`);
    // (dev only) the client itself cannot be hot updated.
    if (file.startsWith(normalizedClientDir)) {
        ws.send({
            type: 'full-reload',
            path: '*'
        });
        return;
    }
    const mods = moduleGraph.getModulesByFile(file);
    // check if any plugin wants to perform custom HMR handling
    const timestamp = Date.now();
    const hmrContext = {
        file,
        timestamp,
        modules: mods ? [...mods] : [],
        read: () => readModifiedFile(file),
        server
    };
    for (const plugin of config.plugins) {
        if (plugin.handleHotUpdate) {
            const filteredModules = await plugin.handleHotUpdate(hmrContext);
            if (filteredModules) {
                hmrContext.modules = filteredModules;
            }
        }
    }
    if (!hmrContext.modules.length) {
        // html file cannot be hot updated
        if (file.endsWith('.html')) {
            config.logger.info(colors__default.green(`page reload `) + colors__default.dim(shortFile), {
                clear: true,
                timestamp: true
            });
            ws.send({
                type: 'full-reload',
                path: config.server.middlewareMode
                    ? '*'
                    : '/' + normalizePath(path__default.relative(config.root, file))
            });
        }
        else {
            // loaded but not in the module graph, probably not js
            debugHmr(`[no modules matched] ${colors__default.dim(shortFile)}`);
        }
        return;
    }
    updateModules(shortFile, hmrContext.modules, timestamp, server);
}
function updateModules(file, modules, timestamp, { config, ws }) {
    const updates = [];
    const invalidatedModules = new Set();
    let needFullReload = false;
    for (const mod of modules) {
        invalidate(mod, timestamp, invalidatedModules);
        if (needFullReload) {
            continue;
        }
        const boundaries = new Set();
        const hasDeadEnd = propagateUpdate(mod, boundaries);
        if (hasDeadEnd) {
            needFullReload = true;
            continue;
        }
        updates.push(...[...boundaries].map(({ boundary, acceptedVia }) => ({
            type: `${boundary.type}-update`,
            timestamp,
            path: boundary.url,
            acceptedPath: acceptedVia.url
        })));
    }
    if (needFullReload) {
        config.logger.info(colors__default.green(`page reload `) + colors__default.dim(file), {
            clear: true,
            timestamp: true
        });
        ws.send({
            type: 'full-reload'
        });
    }
    else {
        config.logger.info(updates
            .map(({ path }) => colors__default.green(`hmr update `) + colors__default.dim(path))
            .join('\n'), { clear: true, timestamp: true });
        ws.send({
            type: 'update',
            updates
        });
    }
}
async function handleFileAddUnlink(file, server, isUnlink = false) {
    var _a;
    const modules = [...((_a = server.moduleGraph.getModulesByFile(file)) !== null && _a !== void 0 ? _a : [])];
    if (isUnlink && file in server._globImporters) {
        delete server._globImporters[file];
    }
    else {
        for (const i in server._globImporters) {
            const { module, importGlobs } = server._globImporters[i];
            for (const { base, pattern } of importGlobs) {
                if (micromatch.isMatch(file, pattern) ||
                    micromatch.isMatch(path__default.relative(base, file), pattern)) {
                    modules.push(module);
                    // We use `onFileChange` to invalidate `module.file` so that subsequent `ssrLoadModule()`
                    // calls get fresh glob import results with(out) the newly added(/removed) `file`.
                    server.moduleGraph.onFileChange(module.file);
                    break;
                }
            }
        }
    }
    if (modules.length > 0) {
        updateModules(getShortName(file, server.config.root), modules, Date.now(), server);
    }
}
function propagateUpdate(node, boundaries, currentChain = [node]) {
    // #7561
    // if the imports of `node` have not been analyzed, then `node` has not
    // been loaded in the browser and we should stop propagation.
    if (node.id && node.isSelfAccepting === undefined) {
        return false;
    }
    if (node.isSelfAccepting) {
        boundaries.add({
            boundary: node,
            acceptedVia: node
        });
        // additionally check for CSS importers, since a PostCSS plugin like
        // Tailwind JIT may register any file as a dependency to a CSS file.
        for (const importer of node.importers) {
            if (isCSSRequest(importer.url) && !currentChain.includes(importer)) {
                propagateUpdate(importer, boundaries, currentChain.concat(importer));
            }
        }
        return false;
    }
    if (!node.importers.size) {
        return true;
    }
    // #3716, #3913
    // For a non-CSS file, if all of its importers are CSS files (registered via
    // PostCSS plugins) it should be considered a dead end and force full reload.
    if (!isCSSRequest(node.url) &&
        [...node.importers].every((i) => isCSSRequest(i.url))) {
        return true;
    }
    for (const importer of node.importers) {
        const subChain = currentChain.concat(importer);
        if (importer.acceptedHmrDeps.has(node)) {
            boundaries.add({
                boundary: importer,
                acceptedVia: node
            });
            continue;
        }
        if (currentChain.includes(importer)) {
            // circular deps is considered dead end
            return true;
        }
        if (propagateUpdate(importer, boundaries, subChain)) {
            return true;
        }
    }
    return false;
}
function invalidate(mod, timestamp, seen) {
    if (seen.has(mod)) {
        return;
    }
    seen.add(mod);
    mod.lastHMRTimestamp = timestamp;
    mod.transformResult = null;
    mod.ssrModule = null;
    mod.ssrTransformResult = null;
    mod.importers.forEach((importer) => {
        if (!importer.acceptedHmrDeps.has(mod)) {
            invalidate(importer, timestamp, seen);
        }
    });
}
function handlePrunedModules(mods, { ws }) {
    // update the disposed modules' hmr timestamp
    // since if it's re-imported, it should re-apply side effects
    // and without the timestamp the browser will not re-import it!
    const t = Date.now();
    mods.forEach((mod) => {
        mod.lastHMRTimestamp = t;
        debugHmr(`[dispose] ${colors__default.dim(mod.file)}`);
    });
    ws.send({
        type: 'prune',
        paths: [...mods].map((m) => m.url)
    });
}
/**
 * Lex import.meta.hot.accept() for accepted deps.
 * Since hot.accept() can only accept string literals or array of string
 * literals, we don't really need a heavy @babel/parse call on the entire source.
 *
 * @returns selfAccepts
 */
function lexAcceptedHmrDeps(code, start, urls) {
    let state = 0 /* inCall */;
    // the state can only be 2 levels deep so no need for a stack
    let prevState = 0 /* inCall */;
    let currentDep = '';
    function addDep(index) {
        urls.add({
            url: currentDep,
            start: index - currentDep.length - 1,
            end: index + 1
        });
        currentDep = '';
    }
    for (let i = start; i < code.length; i++) {
        const char = code.charAt(i);
        switch (state) {
            case 0 /* inCall */:
            case 4 /* inArray */:
                if (char === `'`) {
                    prevState = state;
                    state = 1 /* inSingleQuoteString */;
                }
                else if (char === `"`) {
                    prevState = state;
                    state = 2 /* inDoubleQuoteString */;
                }
                else if (char === '`') {
                    prevState = state;
                    state = 3 /* inTemplateString */;
                }
                else if (/\s/.test(char)) {
                    continue;
                }
                else {
                    if (state === 0 /* inCall */) {
                        if (char === `[`) {
                            state = 4 /* inArray */;
                        }
                        else {
                            // reaching here means the first arg is neither a string literal
                            // nor an Array literal (direct callback) or there is no arg
                            // in both case this indicates a self-accepting module
                            return true; // done
                        }
                    }
                    else if (state === 4 /* inArray */) {
                        if (char === `]`) {
                            return false; // done
                        }
                        else if (char === ',') {
                            continue;
                        }
                        else {
                            error(i);
                        }
                    }
                }
                break;
            case 1 /* inSingleQuoteString */:
                if (char === `'`) {
                    addDep(i);
                    if (prevState === 0 /* inCall */) {
                        // accept('foo', ...)
                        return false;
                    }
                    else {
                        state = prevState;
                    }
                }
                else {
                    currentDep += char;
                }
                break;
            case 2 /* inDoubleQuoteString */:
                if (char === `"`) {
                    addDep(i);
                    if (prevState === 0 /* inCall */) {
                        // accept('foo', ...)
                        return false;
                    }
                    else {
                        state = prevState;
                    }
                }
                else {
                    currentDep += char;
                }
                break;
            case 3 /* inTemplateString */:
                if (char === '`') {
                    addDep(i);
                    if (prevState === 0 /* inCall */) {
                        // accept('foo', ...)
                        return false;
                    }
                    else {
                        state = prevState;
                    }
                }
                else if (char === '$' && code.charAt(i + 1) === '{') {
                    error(i);
                }
                else {
                    currentDep += char;
                }
                break;
            default:
                throw new Error('unknown import.meta.hot lexer state');
        }
    }
    return false;
}
function error(pos) {
    const err = new Error(`import.meta.accept() can only accept string literals or an ` +
        `Array of string literals.`);
    err.pos = pos;
    throw err;
}
// vitejs/vite#610 when hot-reloading Vue files, we read immediately on file
// change event and sometimes this can be too early and get an empty buffer.
// Poll until the file's modified time has changed before reading again.
async function readModifiedFile(file) {
    const content = fs__default.readFileSync(file, 'utf-8');
    if (!content) {
        const mtime = fs__default.statSync(file).mtimeMs;
        await new Promise((r) => {
            let n = 0;
            const poll = async () => {
                n++;
                const newMtime = fs__default.statSync(file).mtimeMs;
                if (newMtime !== mtime || n > 10) {
                    r(0);
                }
                else {
                    setTimeout(poll, 10);
                }
            };
            setTimeout(poll, 10);
        });
        return fs__default.readFileSync(file, 'utf-8');
    }
    else {
        return content;
    }
}

const isDebug = !!process.env.DEBUG;
const debug$1 = createDebugger('vite:import-analysis');
const clientDir = normalizePath(CLIENT_DIR);
const skipRE = /\.(map|json)$/;
const canSkipImportAnalysis = (id) => skipRE.test(id) || isDirectCSSRequest(id);
const optimizedDepChunkRE = /\/chunk-[A-Z0-9]{8}\.js/;
const optimizedDepDynamicRE = /-[A-Z0-9]{8}\.js/;
function isExplicitImportRequired(url) {
    return !isJSRequest(cleanUrl(url)) && !isCSSRequest(url);
}
function markExplicitImport(url) {
    if (isExplicitImportRequired(url)) {
        return injectQuery(url, 'import');
    }
    return url;
}
/**
 * Server-only plugin that lexes, resolves, rewrites and analyzes url imports.
 *
 * - Imports are resolved to ensure they exist on disk
 *
 * - Lexes HMR accept calls and updates import relationships in the module graph
 *
 * - Bare module imports are resolved (by @rollup-plugin/node-resolve) to
 * absolute file paths, e.g.
 *
 *     ```js
 *     import 'foo'
 *     ```
 *     is rewritten to
 *     ```js
 *     import '/@fs//project/node_modules/foo/dist/foo.js'
 *     ```
 *
 * - CSS imports are appended with `.js` since both the js module and the actual
 * css (referenced via <link>) may go through the transform pipeline:
 *
 *     ```js
 *     import './style.css'
 *     ```
 *     is rewritten to
 *     ```js
 *     import './style.css.js'
 *     ```
 */
function importAnalysisPlugin(config) {
    const { root, base } = config;
    const clientPublicPath = path__default.posix.join(base, CLIENT_PUBLIC_PATH);
    const resolve = config.createResolver({
        preferRelative: true,
        tryIndex: false,
        extensions: []
    });
    let server;
    return {
        name: 'vite:import-analysis',
        configureServer(_server) {
            server = _server;
        },
        async transform(source, importer, options) {
            // In a real app `server` is always defined, but it is undefined when
            // running src/node/server/__tests__/pluginContainer.spec.ts
            if (!server) {
                return null;
            }
            const ssr = (options === null || options === void 0 ? void 0 : options.ssr) === true;
            const prettyImporter = prettifyUrl(importer, root);
            if (canSkipImportAnalysis(importer)) {
                isDebug && debug$1(colors__default.dim(`[skipped] ${prettyImporter}`));
                return null;
            }
            const start = perf_hooks.performance.now();
            await esModuleLexer.init;
            let imports = [];
            // strip UTF-8 BOM
            if (source.charCodeAt(0) === 0xfeff) {
                source = source.slice(1);
            }
            try {
                imports = esModuleLexer.parse(source)[0];
            }
            catch (e) {
                const isVue = importer.endsWith('.vue');
                const maybeJSX = !isVue && isJSRequest(importer);
                const msg = isVue
                    ? `Install @vitejs/plugin-vue to handle .vue files.`
                    : maybeJSX
                        ? `If you are using JSX, make sure to name the file with the .jsx or .tsx extension.`
                        : `You may need to install appropriate plugins to handle the ${path__default.extname(importer)} file format.`;
                this.error(`Failed to parse source for import analysis because the content ` +
                    `contains invalid JS syntax. ` +
                    msg, e.idx);
            }
            const { moduleGraph } = server;
            // since we are already in the transform phase of the importer, it must
            // have been loaded so its entry is guaranteed in the module graph.
            const importerModule = moduleGraph.getModuleById(importer);
            if (!imports.length) {
                importerModule.isSelfAccepting = false;
                isDebug &&
                    debug$1(`${timeFrom(start)} ${colors__default.dim(`[no imports] ${prettyImporter}`)}`);
                return source;
            }
            let hasHMR = false;
            let isSelfAccepting = false;
            let hasEnv = false;
            let needQueryInjectHelper = false;
            let s;
            const str = () => s || (s = new MagicString__default(source));
            const importedUrls = new Set();
            const staticImportedUrls = new Set();
            const acceptedUrls = new Set();
            const toAbsoluteUrl = (url) => path__default.posix.resolve(path__default.posix.dirname(importerModule.url), url);
            const normalizeUrl = async (url, pos) => {
                var _a;
                if (base !== '/' && url.startsWith(base)) {
                    url = url.replace(base, '/');
                }
                let importerFile = importer;
                if (moduleListContains((_a = config.optimizeDeps) === null || _a === void 0 ? void 0 : _a.exclude, url)) {
                    const optimizedDeps = server._optimizedDeps;
                    if (optimizedDeps) {
                        await optimizedDeps.scanProcessing;
                        // if the dependency encountered in the optimized file was excluded from the optimization
                        // the dependency needs to be resolved starting from the original source location of the optimized file
                        // because starting from node_modules/.vite will not find the dependency if it was not hoisted
                        // (that is, if it is under node_modules directory in the package source of the optimized file)
                        for (const optimizedModule of optimizedDeps.metadata.depInfoList) {
                            if (!optimizedModule.src)
                                continue; // Ignore chunks
                            if (optimizedModule.file === importerModule.file) {
                                importerFile = optimizedModule.src;
                            }
                        }
                    }
                }
                const resolved = await this.resolve(url, importerFile);
                if (!resolved) {
                    // in ssr, we should let node handle the missing modules
                    if (ssr) {
                        return [url, url];
                    }
                    this.error(`Failed to resolve import "${url}" from "${path__default.relative(process.cwd(), importerFile)}". Does the file exist?`, pos);
                }
                const isRelative = url.startsWith('.');
                const isSelfImport = !isRelative && cleanUrl(url) === cleanUrl(importer);
                // normalize all imports into resolved URLs
                // e.g. `import 'foo'` -> `import '/@fs/.../node_modules/foo/index.js'`
                if (resolved.id.startsWith(root + '/')) {
                    // in root: infer short absolute path from root
                    url = resolved.id.slice(root.length);
                }
                else if (resolved.id.startsWith(getDepsCacheDir(config)) ||
                    fs__default.existsSync(cleanUrl(resolved.id))) {
                    // an optimized deps may not yet exists in the filesystem, or
                    // a regular file exists but is out of root: rewrite to absolute /@fs/ paths
                    url = path__default.posix.join(FS_PREFIX + resolved.id);
                }
                else {
                    url = resolved.id;
                }
                if (isExternalUrl(url)) {
                    return [url, url];
                }
                // if the resolved id is not a valid browser import specifier,
                // prefix it to make it valid. We will strip this before feeding it
                // back into the transform pipeline
                if (!url.startsWith('.') && !url.startsWith('/')) {
                    url =
                        VALID_ID_PREFIX + resolved.id.replace('\0', NULL_BYTE_PLACEHOLDER);
                }
                // make the URL browser-valid if not SSR
                if (!ssr) {
                    // mark non-js/css imports with `?import`
                    url = markExplicitImport(url);
                    // If the url isn't a request for a pre-bundled common chunk,
                    // for relative js/css imports, or self-module virtual imports
                    // (e.g. vue blocks), inherit importer's version query
                    // do not do this for unknown type imports, otherwise the appended
                    // query can break 3rd party plugin's extension checks.
                    if ((isRelative || isSelfImport) &&
                        !/[\?&]import=?\b/.test(url) &&
                        !url.match(DEP_VERSION_RE)) {
                        const versionMatch = importer.match(DEP_VERSION_RE);
                        if (versionMatch) {
                            url = injectQuery(url, versionMatch[1]);
                        }
                    }
                    // check if the dep has been hmr updated. If yes, we need to attach
                    // its last updated timestamp to force the browser to fetch the most
                    // up-to-date version of this module.
                    try {
                        const depModule = await moduleGraph.ensureEntryFromUrl(url, ssr);
                        if (depModule.lastHMRTimestamp > 0) {
                            url = injectQuery(url, `t=${depModule.lastHMRTimestamp}`);
                        }
                    }
                    catch (e) {
                        // it's possible that the dep fails to resolve (non-existent import)
                        // attach location to the missing import
                        e.pos = pos;
                        throw e;
                    }
                    // prepend base (dev base is guaranteed to have ending slash)
                    url = base + url.replace(/^\//, '');
                }
                return [url, resolved.id];
            };
            // Import rewrites, we do them after all the URLs have been resolved
            // to help with the discovery of new dependencies. If we need to wait
            // for each dependency there could be one reload per import
            const importRewrites = [];
            for (let index = 0; index < imports.length; index++) {
                const { s: start, e: end, ss: expStart, se: expEnd, d: dynamicIndex, 
                // #2083 User may use escape path,
                // so use imports[index].n to get the unescaped string
                // @ts-ignore
                n: specifier } = imports[index];
                const rawUrl = source.slice(start, end);
                // check import.meta usage
                if (rawUrl === 'import.meta') {
                    const prop = source.slice(end, end + 4);
                    if (prop === '.hot') {
                        hasHMR = true;
                        if (source.slice(end + 4, end + 11) === '.accept') {
                            // further analyze accepted modules
                            if (lexAcceptedHmrDeps(source, source.indexOf('(', end + 11) + 1, acceptedUrls)) {
                                isSelfAccepting = true;
                            }
                        }
                    }
                    else if (prop === '.env') {
                        hasEnv = true;
                    }
                    else if (prop === '.glo' && source[end + 4] === 'b') {
                        // transform import.meta.glob()
                        // e.g. `import.meta.glob('glob:./dir/*.js')`
                        const { imports, importsString, exp, endIndex, base, pattern, isEager } = await transformImportGlob(source, start, importer, index, root, config.logger, normalizeUrl, resolve);
                        str().prepend(importsString);
                        str().overwrite(expStart, endIndex, exp, { contentOnly: true });
                        imports.forEach((url) => {
                            url = url.replace(base, '/');
                            importedUrls.add(url);
                            if (isEager)
                                staticImportedUrls.add(url);
                        });
                        if (!(importerModule.file in server._globImporters)) {
                            server._globImporters[importerModule.file] = {
                                module: importerModule,
                                importGlobs: []
                            };
                        }
                        server._globImporters[importerModule.file].importGlobs.push({
                            base,
                            pattern
                        });
                    }
                    continue;
                }
                const isDynamicImport = dynamicIndex > -1;
                // static import or valid string in dynamic import
                // If resolvable, let's resolve it
                if (specifier) {
                    // skip external / data uri
                    if (isExternalUrl(specifier) || isDataUrl(specifier)) {
                        continue;
                    }
                    // skip ssr external
                    if (ssr) {
                        if (server._ssrExternals &&
                            shouldExternalizeForSSR(specifier, server._ssrExternals)) {
                            continue;
                        }
                        if (isBuiltin(specifier)) {
                            continue;
                        }
                    }
                    // skip client
                    if (specifier === clientPublicPath) {
                        continue;
                    }
                    // warn imports to non-asset /public files
                    if (specifier.startsWith('/') &&
                        !config.assetsInclude(cleanUrl(specifier)) &&
                        !specifier.endsWith('.json') &&
                        checkPublicFile(specifier, config)) {
                        throw new Error(`Cannot import non-asset file ${specifier} which is inside /public.` +
                            `JS/CSS files inside /public are copied as-is on build and ` +
                            `can only be referenced via <script src> or <link href> in html.`);
                    }
                    // normalize
                    const [normalizedUrl, resolvedId] = await normalizeUrl(specifier, start);
                    const url = normalizedUrl;
                    // record as safe modules
                    server === null || server === void 0 ? void 0 : server.moduleGraph.safeModulesPath.add(fsPathFromUrl(url));
                    if (url !== specifier) {
                        importRewrites.push(async () => {
                            let rewriteDone = false;
                            if ((server === null || server === void 0 ? void 0 : server._optimizedDeps) &&
                                isOptimizedDepFile(resolvedId, config) &&
                                !resolvedId.match(optimizedDepChunkRE)) {
                                // for optimized cjs deps, support named imports by rewriting named imports to const assignments.
                                // internal optimized chunks don't need es interop and are excluded
                                // The browserHash in resolvedId could be stale in which case there will be a full
                                // page reload. We could return a 404 in that case but it is safe to return the request
                                const file = cleanUrl(resolvedId); // Remove ?v={hash}
                                const needsInterop = await optimizedDepNeedsInterop(server._optimizedDeps.metadata, file);
                                if (needsInterop === undefined) {
                                    // Non-entry dynamic imports from dependencies will reach here as there isn't
                                    // optimize info for them, but they don't need es interop. If the request isn't
                                    // a dynamic import, then it is an internal Vite error
                                    if (!file.match(optimizedDepDynamicRE)) {
                                        config.logger.error(colors__default.red(`Vite Error, ${url} optimized info should be defined`));
                                    }
                                }
                                else if (needsInterop) {
                                    debug$1(`${url} needs interop`);
                                    if (isDynamicImport) {
                                        // rewrite `import('package')` to expose the default directly
                                        str().overwrite(expStart, expEnd, `import('${url}').then(m => m.default && m.default.__esModule ? m.default : ({ ...m.default, default: m.default }))`, { contentOnly: true });
                                    }
                                    else {
                                        const exp = source.slice(expStart, expEnd);
                                        const rewritten = transformCjsImport(exp, url, rawUrl, index);
                                        if (rewritten) {
                                            str().overwrite(expStart, expEnd, rewritten, {
                                                contentOnly: true
                                            });
                                        }
                                        else {
                                            // #1439 export * from '...'
                                            str().overwrite(start, end, url, { contentOnly: true });
                                        }
                                    }
                                    rewriteDone = true;
                                }
                            }
                            if (!rewriteDone) {
                                str().overwrite(start, end, isDynamicImport ? `'${url}'` : url, { contentOnly: true });
                            }
                        });
                    }
                    // record for HMR import chain analysis
                    // make sure to normalize away base
                    const urlWithoutBase = url.replace(base, '/');
                    importedUrls.add(urlWithoutBase);
                    if (!isDynamicImport) {
                        // for pre-transforming
                        staticImportedUrls.add(urlWithoutBase);
                    }
                }
                else if (!importer.startsWith(clientDir) && !ssr) {
                    // check @vite-ignore which suppresses dynamic import warning
                    const hasViteIgnore = /\/\*\s*@vite-ignore\s*\*\//.test(
                    // complete expression inside parens
                    source.slice(dynamicIndex + 1, end));
                    const url = rawUrl
                        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
                        .trim();
                    if (!hasViteIgnore && !isSupportedDynamicImport(url)) {
                        this.warn(`\n` +
                            colors__default.cyan(importerModule.file) +
                            `\n` +
                            generateCodeFrame(source, start) +
                            `\nThe above dynamic import cannot be analyzed by vite.\n` +
                            `See ${colors__default.blue(`https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations`)} ` +
                            `for supported dynamic import formats. ` +
                            `If this is intended to be left as-is, you can use the ` +
                            `/* @vite-ignore */ comment inside the import() call to suppress this warning.\n`);
                    }
                    if (!/^('.*'|".*"|`.*`)$/.test(url) ||
                        isExplicitImportRequired(url.slice(1, -1))) {
                        needQueryInjectHelper = true;
                        str().overwrite(start, end, `__vite__injectQuery(${url}, 'import')`, { contentOnly: true });
                    }
                }
            }
            if (hasEnv) {
                // inject import.meta.env
                let env = `import.meta.env = ${JSON.stringify({
                    ...config.env,
                    SSR: !!ssr
                })};`;
                // account for user env defines
                for (const key in config.define) {
                    if (key.startsWith(`import.meta.env.`)) {
                        const val = config.define[key];
                        env += `${key} = ${typeof val === 'string' ? val : JSON.stringify(val)};`;
                    }
                }
                str().prepend(env);
            }
            if (hasHMR && !ssr) {
                debugHmr(`${isSelfAccepting
                    ? `[self-accepts]`
                    : acceptedUrls.size
                        ? `[accepts-deps]`
                        : `[detected api usage]`} ${prettyImporter}`);
                // inject hot context
                str().prepend(`import { createHotContext as __vite__createHotContext } from "${clientPublicPath}";` +
                    `import.meta.hot = __vite__createHotContext(${JSON.stringify(importerModule.url)});`);
            }
            if (needQueryInjectHelper) {
                str().prepend(`import { injectQuery as __vite__injectQuery } from "${clientPublicPath}";`);
            }
            // normalize and rewrite accepted urls
            const normalizedAcceptedUrls = new Set();
            for (const { url, start, end } of acceptedUrls) {
                const [normalized] = await moduleGraph.resolveUrl(toAbsoluteUrl(markExplicitImport(url)), ssr);
                normalizedAcceptedUrls.add(normalized);
                str().overwrite(start, end, JSON.stringify(normalized), {
                    contentOnly: true
                });
            }
            // update the module graph for HMR analysis.
            // node CSS imports does its own graph update in the css plugin so we
            // only handle js graph updates here.
            if (!isCSSRequest(importer)) {
                // attached by pluginContainer.addWatchFile
                const pluginImports = this._addedImports;
                if (pluginImports) {
                    (await Promise.all([...pluginImports].map((id) => normalizeUrl(id, 0)))).forEach(([url]) => importedUrls.add(url));
                }
                // HMR transforms are no-ops in SSR, so an `accept` call will
                // never be injected. Avoid updating the `isSelfAccepting`
                // property for our module node in that case.
                if (ssr && importerModule.isSelfAccepting) {
                    isSelfAccepting = true;
                }
                const prunedImports = await moduleGraph.updateModuleInfo(importerModule, importedUrls, normalizedAcceptedUrls, isSelfAccepting, ssr);
                if (hasHMR && prunedImports) {
                    handlePrunedModules(prunedImports, server);
                }
            }
            isDebug &&
                debug$1(`${timeFrom(start)} ${colors__default.dim(`[${importedUrls.size} imports rewritten] ${prettyImporter}`)}`);
            // pre-transform known direct imports
            if (config.server.preTransformRequests && staticImportedUrls.size) {
                staticImportedUrls.forEach((url) => {
                    url = unwrapId(removeImportQuery(url)).replace(NULL_BYTE_PLACEHOLDER, '\0');
                    transformRequest(url, server, { ssr }).catch((e) => {
                        if ((e === null || e === void 0 ? void 0 : e.code) === ERR_OUTDATED_OPTIMIZED_DEP) {
                            // This are expected errors
                            return;
                        }
                        // Unexpected error, log the issue but avoid an unhandled exception
                        config.logger.error(e.message);
                    });
                });
            }
            // Await for import rewrites that requires dependencies to be pre-bundled to
            // know if es interop is needed after starting further transformRequest calls
            // This will let Vite process deeper into the user code and find more missing
            // dependencies before the next page reload
            for (const rewrite of importRewrites) {
                await rewrite();
            }
            if (s) {
                return s.toString();
            }
            else {
                return source;
            }
        }
    };
}
/**
 * https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
 * This is probably less accurate but is much cheaper than a full AST parse.
 */
function isSupportedDynamicImport(url) {
    url = url.trim().slice(1, -1);
    // must be relative
    if (!url.startsWith('./') && !url.startsWith('../')) {
        return false;
    }
    // must have extension
    if (!path__default.extname(url)) {
        return false;
    }
    // must be more specific if importing from same dir
    if (url.startsWith('./${') && url.indexOf('/') === url.lastIndexOf('/')) {
        return false;
    }
    return true;
}
/**
 * Detect import statements to a known optimized CJS dependency and provide
 * ES named imports interop. We do this by rewriting named imports to a variable
 * assignment to the corresponding property on the `module.exports` of the cjs
 * module. Note this doesn't support dynamic re-assignments from within the cjs
 * module.
 *
 * Note that es-module-lexer treats `export * from '...'` as an import as well,
 * so, we may encounter ExportAllDeclaration here, in which case `undefined`
 * will be returned.
 *
 * Credits \@csr632 via #837
 */
function transformCjsImport(importExp, url, rawUrl, importIndex) {
    const node = acorn.parse(importExp, {
        ecmaVersion: 'latest',
        sourceType: 'module'
    }).body[0];
    if (node.type === 'ImportDeclaration' ||
        node.type === 'ExportNamedDeclaration') {
        if (!node.specifiers.length) {
            return `import "${url}"`;
        }
        const importNames = [];
        const exportNames = [];
        let defaultExports = '';
        for (const spec of node.specifiers) {
            if (spec.type === 'ImportSpecifier' &&
                spec.imported.type === 'Identifier') {
                const importedName = spec.imported.name;
                const localName = spec.local.name;
                importNames.push({ importedName, localName });
            }
            else if (spec.type === 'ImportDefaultSpecifier') {
                importNames.push({
                    importedName: 'default',
                    localName: spec.local.name
                });
            }
            else if (spec.type === 'ImportNamespaceSpecifier') {
                importNames.push({ importedName: '*', localName: spec.local.name });
            }
            else if (spec.type === 'ExportSpecifier' &&
                spec.exported.type === 'Identifier') {
                // for ExportSpecifier, local name is same as imported name
                const importedName = spec.local.name;
                // we want to specify exported name as variable and re-export it
                const exportedName = spec.exported.name;
                if (exportedName === 'default') {
                    defaultExports = pluginutils.makeLegalIdentifier(`__vite__cjsExportDefault_${importIndex}`);
                    importNames.push({ importedName, localName: defaultExports });
                }
                else {
                    importNames.push({ importedName, localName: exportedName });
                    exportNames.push(exportedName);
                }
            }
        }
        // If there is multiple import for same id in one file,
        // importIndex will prevent the cjsModuleName to be duplicate
        const cjsModuleName = pluginutils.makeLegalIdentifier(`__vite__cjsImport${importIndex}_${rawUrl}`);
        const lines = [`import ${cjsModuleName} from "${url}"`];
        importNames.forEach(({ importedName, localName }) => {
            if (importedName === '*') {
                lines.push(`const ${localName} = ${cjsModuleName}`);
            }
            else if (importedName === 'default') {
                lines.push(`const ${localName} = ${cjsModuleName}.__esModule ? ${cjsModuleName}.default : ${cjsModuleName}`);
            }
            else {
                lines.push(`const ${localName} = ${cjsModuleName}["${importedName}"]`);
            }
        });
        if (defaultExports) {
            lines.push(`export default ${defaultExports}`);
        }
        if (exportNames.length) {
            lines.push(`export { ${exportNames.join(', ')} }`);
        }
        return lines.join('; ');
    }
}

class ModuleNode {
    constructor(url) {
        /**
         * Resolved file system path + query
         */
        this.id = null;
        this.file = null;
        this.importers = new Set();
        this.importedModules = new Set();
        this.acceptedHmrDeps = new Set();
        this.transformResult = null;
        this.ssrTransformResult = null;
        this.ssrModule = null;
        this.lastHMRTimestamp = 0;
        this.lastInvalidationTimestamp = 0;
        this.url = url;
        this.type = isDirectCSSRequest(url) ? 'css' : 'js';
        // #7870
        // The `isSelfAccepting` value is set by importAnalysis, but some
        // assets don't go through importAnalysis.
        if (isHTMLRequest(url) || canSkipImportAnalysis(url)) {
            this.isSelfAccepting = false;
        }
    }
}
function invalidateSSRModule(mod, seen) {
    if (seen.has(mod)) {
        return;
    }
    seen.add(mod);
    mod.ssrModule = null;
    mod.importers.forEach((importer) => invalidateSSRModule(importer, seen));
}
class ModuleGraph {
    constructor(resolveId) {
        this.resolveId = resolveId;
        this.urlToModuleMap = new Map();
        this.idToModuleMap = new Map();
        // a single file may corresponds to multiple modules with different queries
        this.fileToModulesMap = new Map();
        this.safeModulesPath = new Set();
    }
    async getModuleByUrl(rawUrl, ssr) {
        const [url] = await this.resolveUrl(rawUrl, ssr);
        return this.urlToModuleMap.get(url);
    }
    getModuleById(id) {
        return this.idToModuleMap.get(removeTimestampQuery(id));
    }
    getModulesByFile(file) {
        return this.fileToModulesMap.get(file);
    }
    onFileChange(file) {
        const mods = this.getModulesByFile(file);
        if (mods) {
            const seen = new Set();
            mods.forEach((mod) => {
                this.invalidateModule(mod, seen);
            });
        }
    }
    invalidateModule(mod, seen = new Set(), timestamp = Date.now()) {
        // Save the timestamp for this invalidation, so we can avoid caching the result of possible already started
        // processing being done for this module
        mod.lastInvalidationTimestamp = timestamp;
        // Don't invalidate mod.info and mod.meta, as they are part of the processing pipeline
        // Invalidating the transform result is enough to ensure this module is re-processed next time it is requested
        mod.transformResult = null;
        mod.ssrTransformResult = null;
        invalidateSSRModule(mod, seen);
    }
    invalidateAll() {
        const timestamp = Date.now();
        const seen = new Set();
        this.idToModuleMap.forEach((mod) => {
            this.invalidateModule(mod, seen, timestamp);
        });
    }
    /**
     * Update the module graph based on a module's updated imports information
     * If there are dependencies that no longer have any importers, they are
     * returned as a Set.
     */
    async updateModuleInfo(mod, importedModules, acceptedModules, isSelfAccepting, ssr) {
        mod.isSelfAccepting = isSelfAccepting;
        const prevImports = mod.importedModules;
        const nextImports = (mod.importedModules = new Set());
        let noLongerImported;
        // update import graph
        for (const imported of importedModules) {
            const dep = typeof imported === 'string'
                ? await this.ensureEntryFromUrl(imported, ssr)
                : imported;
            dep.importers.add(mod);
            nextImports.add(dep);
        }
        // remove the importer from deps that were imported but no longer are.
        prevImports.forEach((dep) => {
            if (!nextImports.has(dep)) {
                dep.importers.delete(mod);
                if (!dep.importers.size) {
                    (noLongerImported || (noLongerImported = new Set())).add(dep);
                }
            }
        });
        // update accepted hmr deps
        const deps = (mod.acceptedHmrDeps = new Set());
        for (const accepted of acceptedModules) {
            const dep = typeof accepted === 'string'
                ? await this.ensureEntryFromUrl(accepted, ssr)
                : accepted;
            deps.add(dep);
        }
        return noLongerImported;
    }
    async ensureEntryFromUrl(rawUrl, ssr) {
        const [url, resolvedId, meta] = await this.resolveUrl(rawUrl, ssr);
        let mod = this.urlToModuleMap.get(url);
        if (!mod) {
            mod = new ModuleNode(url);
            if (meta)
                mod.meta = meta;
            this.urlToModuleMap.set(url, mod);
            mod.id = resolvedId;
            this.idToModuleMap.set(resolvedId, mod);
            const file = (mod.file = cleanUrl(resolvedId));
            let fileMappedModules = this.fileToModulesMap.get(file);
            if (!fileMappedModules) {
                fileMappedModules = new Set();
                this.fileToModulesMap.set(file, fileMappedModules);
            }
            fileMappedModules.add(mod);
        }
        return mod;
    }
    // some deps, like a css file referenced via @import, don't have its own
    // url because they are inlined into the main css import. But they still
    // need to be represented in the module graph so that they can trigger
    // hmr in the importing css file.
    createFileOnlyEntry(file) {
        file = normalizePath(file);
        let fileMappedModules = this.fileToModulesMap.get(file);
        if (!fileMappedModules) {
            fileMappedModules = new Set();
            this.fileToModulesMap.set(file, fileMappedModules);
        }
        const url = `${FS_PREFIX}${file}`;
        for (const m of fileMappedModules) {
            if (m.url === url || m.id === file) {
                return m;
            }
        }
        const mod = new ModuleNode(url);
        mod.file = file;
        fileMappedModules.add(mod);
        return mod;
    }
    // for incoming urls, it is important to:
    // 1. remove the HMR timestamp query (?t=xxxx)
    // 2. resolve its extension so that urls with or without extension all map to
    // the same module
    async resolveUrl(url$1, ssr) {
        url$1 = removeImportQuery(removeTimestampQuery(url$1));
        const resolved = await this.resolveId(url$1, !!ssr);
        const resolvedId = (resolved === null || resolved === void 0 ? void 0 : resolved.id) || url$1;
        const ext = path.extname(cleanUrl(resolvedId));
        const { pathname, search, hash } = url.parse(url$1);
        if (ext && !pathname.endsWith(ext)) {
            url$1 = pathname + ext + (search || '') + (hash || '');
        }
        return [url$1, resolvedId, resolved === null || resolved === void 0 ? void 0 : resolved.meta];
    }
}

/**
 * The following is modified based on source found in
 * https://github.com/facebook/create-react-app
 *
 * MIT Licensed
 * Copyright (c) 2015-present, Facebook, Inc.
 * https://github.com/facebook/create-react-app/blob/master/LICENSE
 *
 */
// https://github.com/sindresorhus/open#app
const OSX_CHROME = 'google chrome';
/**
 * Reads the BROWSER environment variable and decides what to do with it.
 * Returns true if it opened a browser or ran a node.js script, otherwise false.
 */
function openBrowser(url, opt, logger) {
    // The browser executable to open.
    // See https://github.com/sindresorhus/open#app for documentation.
    const browser = typeof opt === 'string' ? opt : process.env.BROWSER || '';
    if (browser.toLowerCase().endsWith('.js')) {
        return executeNodeScript(browser, url, logger);
    }
    else if (browser.toLowerCase() !== 'none') {
        return startBrowserProcess(browser, url);
    }
    return false;
}
function executeNodeScript(scriptPath, url, logger) {
    const extraArgs = process.argv.slice(2);
    const child = spawn__default(process.execPath, [scriptPath, ...extraArgs, url], {
        stdio: 'inherit'
    });
    child.on('close', (code) => {
        if (code !== 0) {
            logger.error(colors__default.red(`\nThe script specified as BROWSER environment variable failed.\n\n${colors__default.cyan(scriptPath)} exited with code ${code}.`), { error: null });
        }
    });
    return true;
}
function startBrowserProcess(browser, url) {
    // If we're on OS X, the user hasn't specifically
    // requested a different browser, we can try opening
    // Chrome with AppleScript. This lets us reuse an
    // existing tab when possible instead of creating a new one.
    const shouldTryOpenChromeWithAppleScript = process.platform === 'darwin' && (browser === '' || browser === OSX_CHROME);
    if (shouldTryOpenChromeWithAppleScript) {
        try {
            // Try our best to reuse existing tab
            // on OS X Google Chrome with AppleScript
            child_process.execSync('ps cax | grep "Google Chrome"');
            child_process.execSync('osascript openChrome.applescript "' + encodeURI(url) + '"', {
                cwd: path__default.dirname(require.resolve('vite/bin/openChrome.applescript')),
                stdio: 'ignore'
            });
            return true;
        }
        catch (err) {
            // Ignore errors
        }
    }
    // Another special case: on OS X, check if BROWSER has been set to "open".
    // In this case, instead of passing the string `open` to `open` function (which won't work),
    // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
    // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
    if (process.platform === 'darwin' && browser === 'open') {
        browser = undefined;
    }
    // Fallback to open
    // (It will always open new tab)
    try {
        const options = browser ? { app: { name: browser } } : {};
        open__default(url, options).catch(() => { }); // Prevent `unhandledRejection` error.
        return true;
    }
    catch (err) {
        return false;
    }
}

let offset;
try {
    new Function('throw new Error(1)')();
}
catch (e) {
    // in Node 12, stack traces account for the function wrapper.
    // in Node 13 and later, the function wrapper adds two lines,
    // which must be subtracted to generate a valid mapping
    const match = /:(\d+):\d+\)$/.exec(e.stack.split('\n')[1]);
    offset = match ? +match[1] - 1 : 0;
}
function ssrRewriteStacktrace(stack, moduleGraph) {
    return stack
        .split('\n')
        .map((line) => {
        return line.replace(/^ {4}at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?)\)?/, (input, varName, url, line, column) => {
            var _a;
            if (!url)
                return input;
            const mod = moduleGraph.urlToModuleMap.get(url);
            const rawSourceMap = (_a = mod === null || mod === void 0 ? void 0 : mod.ssrTransformResult) === null || _a === void 0 ? void 0 : _a.map;
            if (!rawSourceMap) {
                return input;
            }
            const traced = new traceMapping.TraceMap(rawSourceMap);
            const pos = traceMapping.originalPositionFor(traced, {
                line: Number(line) - offset,
                column: Number(column)
            });
            if (!pos.source || pos.line == null || pos.column == null) {
                return input;
            }
            const source = `${pos.source}:${pos.line}:${pos.column}`;
            if (!varName || varName === 'eval') {
                return `    at ${source}`;
            }
            else {
                return `    at ${varName} (${source})`;
            }
        });
    })
        .join('\n');
}
function rebindErrorStacktrace(e, stacktrace) {
    const { configurable, writable } = Object.getOwnPropertyDescriptor(e, 'stack');
    if (configurable) {
        Object.defineProperty(e, 'stack', {
            value: stacktrace,
            enumerable: true,
            configurable: true,
            writable: true
        });
    }
    else if (writable) {
        e.stack = stacktrace;
    }
}

/**
 * This plugin hooks into Node's module resolution algorithm at runtime,
 * so that SSR builds can benefit from `resolve.dedupe` like they do
 * in development.
 */
function ssrRequireHookPlugin(config) {
    var _a, _b;
    if (config.command !== 'build' ||
        !((_a = config.resolve.dedupe) === null || _a === void 0 ? void 0 : _a.length) ||
        ((_b = config.ssr) === null || _b === void 0 ? void 0 : _b.noExternal) === true ||
        isBuildOutputEsm(config)) {
        return null;
    }
    return {
        name: 'vite:ssr-require-hook',
        transform(code, id) {
            const moduleInfo = this.getModuleInfo(id);
            if (moduleInfo === null || moduleInfo === void 0 ? void 0 : moduleInfo.isEntry) {
                const s = new MagicString__default(code);
                s.prepend(`;(${dedupeRequire.toString()})(${JSON.stringify(config.resolve.dedupe)});\n`);
                return {
                    code: s.toString(),
                    map: s.generateMap({
                        source: id,
                        hires: true
                    })
                };
            }
        }
    };
}
/** Respect the `resolve.dedupe` option in production SSR. */
function dedupeRequire(dedupe) {
    const Module = require('module');
    const resolveFilename = Module._resolveFilename;
    Module._resolveFilename = function (request, parent, isMain, options) {
        if (request[0] !== '.' && request[0] !== '/') {
            const parts = request.split('/');
            const pkgName = parts[0][0] === '@' ? parts[0] + '/' + parts[1] : parts[0];
            if (dedupe.includes(pkgName)) {
                // Use this module as the parent.
                parent = module;
            }
        }
        return resolveFilename(request, parent, isMain, options);
    };
}
function hookNodeResolve(getResolver) {
    const Module = require('module');
    const prevResolver = Module._resolveFilename;
    Module._resolveFilename = getResolver(prevResolver);
    return () => {
        Module._resolveFilename = prevResolver;
    };
}
function isBuildOutputEsm(config) {
    var _a;
    const outputs = arraify((_a = config.build.rollupOptions) === null || _a === void 0 ? void 0 : _a.output);
    return outputs.some((output) => (output === null || output === void 0 ? void 0 : output.format) === 'es' || (output === null || output === void 0 ? void 0 : output.format) === 'esm');
}

const pendingModules = new Map();
const pendingImports = new Map();
async function ssrLoadModule(url, server, context = { global }, urlStack = [], fixStacktrace) {
    url = unwrapId(url).replace(NULL_BYTE_PLACEHOLDER, '\0');
    // when we instantiate multiple dependency modules in parallel, they may
    // point to shared modules. We need to avoid duplicate instantiation attempts
    // by register every module as pending synchronously so that all subsequent
    // request to that module are simply waiting on the same promise.
    const pending = pendingModules.get(url);
    if (pending) {
        return pending;
    }
    const modulePromise = instantiateModule(url, server, context, urlStack, fixStacktrace);
    pendingModules.set(url, modulePromise);
    modulePromise
        .catch(() => {
        pendingImports.delete(url);
    })
        .finally(() => {
        pendingModules.delete(url);
    });
    return modulePromise;
}
async function instantiateModule(url$1, server, context = { global }, urlStack = [], fixStacktrace) {
    const { moduleGraph } = server;
    const mod = await moduleGraph.ensureEntryFromUrl(url$1, true);
    if (mod.ssrModule) {
        return mod.ssrModule;
    }
    const result = mod.ssrTransformResult ||
        (await transformRequest(url$1, server, { ssr: true }));
    if (!result) {
        // TODO more info? is this even necessary?
        throw new Error(`failed to load module for ssr: ${url$1}`);
    }
    const ssrModule = {
        [Symbol.toStringTag]: 'Module'
    };
    Object.defineProperty(ssrModule, '__esModule', { value: true });
    // Tolerate circular imports by ensuring the module can be
    // referenced before it's been instantiated.
    mod.ssrModule = ssrModule;
    const ssrImportMeta = {
        // The filesystem URL, matching native Node.js modules
        url: url.pathToFileURL(mod.file).toString()
    };
    urlStack = urlStack.concat(url$1);
    const isCircular = (url) => urlStack.includes(url);
    const { isProduction, resolve: { dedupe, preserveSymlinks }, root } = server.config;
    // The `extensions` and `mainFields` options are used to ensure that
    // CommonJS modules are preferred. We want to avoid ESM->ESM imports
    // whenever possible, because `hookNodeResolve` can't intercept them.
    const resolveOptions = {
        dedupe,
        extensions: ['.js', '.cjs', '.json'],
        isBuild: true,
        isProduction,
        isRequire: true,
        mainFields: ['main'],
        preserveSymlinks,
        root
    };
    // Since dynamic imports can happen in parallel, we need to
    // account for multiple pending deps and duplicate imports.
    const pendingDeps = [];
    const ssrImport = async (dep) => {
        var _a, _b;
        if (dep[0] !== '.' && dep[0] !== '/') {
            return nodeImport(dep, mod.file, resolveOptions);
        }
        dep = unwrapId(dep);
        if (!isCircular(dep) && !((_a = pendingImports.get(dep)) === null || _a === void 0 ? void 0 : _a.some(isCircular))) {
            pendingDeps.push(dep);
            if (pendingDeps.length === 1) {
                pendingImports.set(url$1, pendingDeps);
            }
            const mod = await ssrLoadModule(dep, server, context, urlStack, fixStacktrace);
            if (pendingDeps.length === 1) {
                pendingImports.delete(url$1);
            }
            else {
                pendingDeps.splice(pendingDeps.indexOf(dep), 1);
            }
            // return local module to avoid race condition #5470
            return mod;
        }
        return (_b = moduleGraph.urlToModuleMap.get(dep)) === null || _b === void 0 ? void 0 : _b.ssrModule;
    };
    const ssrDynamicImport = (dep) => {
        // #3087 dynamic import vars is ignored at rewrite import path,
        // so here need process relative path
        if (dep[0] === '.') {
            dep = path__default.posix.resolve(path__default.dirname(url$1), dep);
        }
        return ssrImport(dep);
    };
    function ssrExportAll(sourceModule) {
        for (const key in sourceModule) {
            if (key !== 'default') {
                Object.defineProperty(ssrModule, key, {
                    enumerable: true,
                    configurable: true,
                    get() {
                        return sourceModule[key];
                    }
                });
            }
        }
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const AsyncFunction = async function () { }.constructor;
        const initModule = new AsyncFunction(`global`, ssrModuleExportsKey, ssrImportMetaKey, ssrImportKey, ssrDynamicImportKey, ssrExportAllKey, result.code + `\n//# sourceURL=${mod.url}`);
        await initModule(context.global, ssrModule, ssrImportMeta, ssrImport, ssrDynamicImport, ssrExportAll);
    }
    catch (e) {
        if (e.stack && fixStacktrace !== false) {
            const stacktrace = ssrRewriteStacktrace(e.stack, moduleGraph);
            rebindErrorStacktrace(e, stacktrace);
            server.config.logger.error(`Error when evaluating SSR module ${url$1}:\n${stacktrace}`, {
                timestamp: true,
                clear: server.config.clearScreen,
                error: e
            });
        }
        throw e;
    }
    return Object.freeze(ssrModule);
}
// In node@12+ we can use dynamic import to load CJS and ESM
async function nodeImport(id, importer, resolveOptions) {
    // Node's module resolution is hi-jacked so Vite can ensure the
    // configured `resolve.dedupe` and `mode` options are respected.
    const viteResolve = (id, importer, options = resolveOptions) => {
        const resolved = tryNodeResolve(id, importer, options, false);
        if (!resolved) {
            const err = new Error(`Cannot find module '${id}' imported from '${importer}'`);
            err.code = 'ERR_MODULE_NOT_FOUND';
            throw err;
        }
        return resolved.id;
    };
    // When an ESM module imports an ESM dependency, this hook is *not* used.
    const unhookNodeResolve = hookNodeResolve((nodeResolve) => (id, parent, isMain, options) => {
        // Use the Vite resolver only for bare imports while skipping
        // any absolute paths, built-in modules and binary modules.
        if (!bareImportRE.test(id) ||
            path__default.isAbsolute(id) ||
            isBuiltin(id) ||
            id.endsWith('.node')) {
            return nodeResolve(id, parent, isMain, options);
        }
        if (parent) {
            let resolved = viteResolve(id, parent.id);
            if (resolved) {
                // hookNodeResolve must use platform-specific path.normalize
                // to be compatible with dynamicImport (#6080)
                resolved = path__default.normalize(resolved);
            }
            return resolved;
        }
        // Importing a CJS module from an ESM module. In this case, the import
        // specifier is already an absolute path, so this is a no-op.
        // Options like `resolve.dedupe` and `mode` are not respected.
        return id;
    });
    let url$1;
    if (id.startsWith('node:') || isBuiltin(id)) {
        url$1 = id;
    }
    else {
        url$1 = viteResolve(id, importer, 
        // Non-external modules can import ESM-only modules, but only outside
        // of test runs, because we use Node `require` in Jest to avoid segfault.
        typeof jest === 'undefined'
            ? { ...resolveOptions, tryEsmOnly: true }
            : resolveOptions);
        if (usingDynamicImport) {
            url$1 = url.pathToFileURL(url$1).toString();
        }
    }
    try {
        const mod = await dynamicImport(url$1);
        return proxyESM(mod);
    }
    finally {
        unhookNodeResolve();
    }
}
// rollup-style default import interop for cjs
function proxyESM(mod) {
    // This is the only sensible option when the exports object is a primitve
    if (isPrimitive(mod))
        return { default: mod };
    let defaultExport = 'default' in mod ? mod.default : mod;
    if (!isPrimitive(defaultExport) && '__esModule' in defaultExport) {
        mod = defaultExport;
        if ('default' in defaultExport) {
            defaultExport = defaultExport.default;
        }
    }
    return new Proxy(mod, {
        get(mod, prop) {
            var _a;
            if (prop === 'default')
                return defaultExport;
            return (_a = mod[prop]) !== null && _a !== void 0 ? _a : defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport[prop];
        }
    });
}
function isPrimitive(value) {
    return !value || (typeof value !== 'object' && typeof value !== 'function');
}

const isDebugEnabled = _debug__default('vite:deps').enabled;
/**
 * The amount to wait for requests to register newly found dependencies before triggering
 * a re-bundle + page reload
 */
const debounceMs = 100;
function createOptimizedDeps(server) {
    const { config } = server;
    const { logger } = config;
    const sessionTimestamp = Date.now().toString();
    const cachedMetadata = loadCachedDepOptimizationMetadata(config);
    const optimizedDeps = {
        metadata: cachedMetadata || createOptimizedDepsMetadata(config, sessionTimestamp),
        registerMissingImport
    };
    let handle;
    let newDepsDiscovered = false;
    let newDepsToLog = [];
    let newDepsToLogHandle;
    const logNewlyDiscoveredDeps = () => {
        if (newDepsToLog.length) {
            config.logger.info(colors__default.green(`✨ new dependencies optimized: ${depsLogString(newDepsToLog)}`), {
                timestamp: true
            });
            newDepsToLog = [];
        }
    };
    let depOptimizationProcessing = newDepOptimizationProcessing();
    let depOptimizationProcessingQueue = [];
    const resolveEnqueuedProcessingPromises = () => {
        // Resolve all the processings (including the ones which were delayed)
        for (const processing of depOptimizationProcessingQueue) {
            processing.resolve();
        }
        depOptimizationProcessingQueue = [];
    };
    let enqueuedRerun;
    let currentlyProcessing = false;
    // If there wasn't a cache or it is outdated, perform a fast scan with esbuild
    // to quickly find project dependencies and do a first optimize run
    if (!cachedMetadata) {
        currentlyProcessing = true;
        const scanPhaseProcessing = newDepOptimizationProcessing();
        optimizedDeps.scanProcessing = scanPhaseProcessing.promise;
        const warmUp = async () => {
            try {
                debuggerViteDeps(colors__default.green(`scanning for dependencies...`), {
                    timestamp: true
                });
                const { metadata } = optimizedDeps;
                const discovered = await discoverProjectDependencies(config, sessionTimestamp);
                // Respect the scan phase discover order to improve reproducibility
                for (const depInfo of Object.values(discovered)) {
                    addOptimizedDepInfo(metadata, 'discovered', {
                        ...depInfo,
                        processing: depOptimizationProcessing.promise
                    });
                }
                debuggerViteDeps(colors__default.green(`dependencies found: ${depsLogString(Object.keys(discovered))}`), {
                    timestamp: true
                });
                scanPhaseProcessing.resolve();
                optimizedDeps.scanProcessing = undefined;
                runOptimizer();
            }
            catch (e) {
                logger.error(e.message);
                if (optimizedDeps.scanProcessing) {
                    scanPhaseProcessing.resolve();
                    optimizedDeps.scanProcessing = undefined;
                }
            }
        };
        setTimeout(warmUp, 0);
    }
    async function runOptimizer(isRerun = false) {
        // Ensure that rerun is called sequentially
        enqueuedRerun = undefined;
        currentlyProcessing = true;
        // Ensure that a rerun will not be issued for current discovered deps
        if (handle)
            clearTimeout(handle);
        // a succesful completion of the optimizeDeps rerun will end up
        // creating new bundled version of all current and discovered deps
        // in the cache dir and a new metadata info object assigned
        // to optimizeDeps.metadata. A fullReload is only issued if
        // the previous bundled dependencies have changed.
        // if the rerun fails, optimizeDeps.metadata remains untouched,
        // current discovered deps are cleaned, and a fullReload is issued
        let { metadata } = optimizedDeps;
        // All deps, previous known and newly discovered are rebundled,
        // respect insertion order to keep the metadata file stable
        const newDeps = {};
        // Clone optimized info objects, fileHash, browserHash may be changed for them
        for (const dep of Object.keys(metadata.optimized)) {
            newDeps[dep] = { ...metadata.optimized[dep] };
        }
        for (const dep of Object.keys(metadata.discovered)) {
            // Clone the discovered info discarding its processing promise
            const { processing, ...info } = metadata.discovered[dep];
            newDeps[dep] = info;
        }
        newDepsDiscovered = false;
        // Add the current depOptimizationProcessing to the queue, these
        // promises are going to be resolved once a rerun is committed
        depOptimizationProcessingQueue.push(depOptimizationProcessing);
        // Create a new promise for the next rerun, discovered missing
        // dependencies will be asigned this promise from this point
        depOptimizationProcessing = newDepOptimizationProcessing();
        try {
            const processingResult = await runOptimizeDeps(config, newDeps);
            const newData = processingResult.metadata;
            // After a re-optimization, if the internal bundled chunks change a full page reload
            // is required. If the files are stable, we can avoid the reload that is expensive
            // for large applications. Comparing their fileHash we can find out if it is safe to
            // keep the current browser state.
            const needsReload = metadata.hash !== newData.hash ||
                Object.keys(metadata.optimized).some((dep) => {
                    return (metadata.optimized[dep].fileHash !== newData.optimized[dep].fileHash);
                });
            const commitProcessing = () => {
                processingResult.commit();
                // While optimizeDeps is running, new missing deps may be discovered,
                // in which case they will keep being added to metadata.discovered
                for (const id in metadata.discovered) {
                    if (!newData.optimized[id]) {
                        addOptimizedDepInfo(newData, 'discovered', metadata.discovered[id]);
                    }
                }
                // If we don't reload the page, we need to keep browserHash stable
                if (!needsReload) {
                    newData.browserHash = metadata.browserHash;
                    for (const dep in newData.chunks) {
                        newData.chunks[dep].browserHash = metadata.browserHash;
                    }
                    for (const dep in newData.optimized) {
                        newData.optimized[dep].browserHash = (metadata.optimized[dep] || metadata.discovered[dep]).browserHash;
                    }
                }
                // Commit hash and needsInterop changes to the discovered deps info
                // object. Allow for code to await for the discovered processing promise
                // and use the information in the same object
                for (const o in newData.optimized) {
                    const discovered = metadata.discovered[o];
                    if (discovered) {
                        const optimized = newData.optimized[o];
                        discovered.browserHash = optimized.browserHash;
                        discovered.fileHash = optimized.fileHash;
                        discovered.needsInterop = optimized.needsInterop;
                        discovered.processing = undefined;
                    }
                }
                if (isRerun) {
                    newDepsToLog.push(...Object.keys(newData.optimized).filter((dep) => !metadata.optimized[dep]));
                }
                metadata = optimizedDeps.metadata = newData;
                resolveEnqueuedProcessingPromises();
            };
            if (!needsReload) {
                commitProcessing();
                if (!isDebugEnabled) {
                    if (newDepsToLogHandle)
                        clearTimeout(newDepsToLogHandle);
                    newDepsToLogHandle = setTimeout(() => {
                        newDepsToLogHandle = undefined;
                        logNewlyDiscoveredDeps();
                    }, 2 * debounceMs);
                }
                else {
                    debuggerViteDeps(colors__default.green(`✨ optimized dependencies unchanged`), {
                        timestamp: true
                    });
                }
            }
            else {
                if (newDepsDiscovered) {
                    // There are newly discovered deps, and another rerun is about to be
                    // excecuted. Avoid the current full reload discarding this rerun result
                    // We don't resolve the processing promise, as they will be resolved
                    // once a rerun is committed
                    processingResult.cancel();
                    debuggerViteDeps(colors__default.green(`✨ delaying reload as new dependencies have been found...`), {
                        timestamp: true
                    });
                }
                else {
                    commitProcessing();
                    if (!isDebugEnabled) {
                        if (newDepsToLogHandle)
                            clearTimeout(newDepsToLogHandle);
                        newDepsToLogHandle = undefined;
                        logNewlyDiscoveredDeps();
                    }
                    logger.info(colors__default.green(`✨ optimized dependencies changed. reloading`), {
                        timestamp: true
                    });
                    fullReload();
                }
            }
        }
        catch (e) {
            logger.error(colors__default.red(`error while updating dependencies:\n${e.stack}`), { timestamp: true, error: e });
            resolveEnqueuedProcessingPromises();
            // Reset missing deps, let the server rediscover the dependencies
            metadata.discovered = {};
            fullReload();
        }
        currentlyProcessing = false;
        // @ts-ignore
        enqueuedRerun === null || enqueuedRerun === void 0 ? void 0 : enqueuedRerun();
    }
    function fullReload() {
        // Cached transform results have stale imports (resolved to
        // old locations) so they need to be invalidated before the page is
        // reloaded.
        server.moduleGraph.invalidateAll();
        server.ws.send({
            type: 'full-reload',
            path: '*'
        });
    }
    async function rerun() {
        // debounce time to wait for new missing deps finished, issue a new
        // optimization of deps (both old and newly found) once the previous
        // optimizeDeps processing is finished
        const deps = Object.keys(optimizedDeps.metadata.discovered);
        const depsString = depsLogString(deps);
        debuggerViteDeps(colors__default.green(`new dependencies found: ${depsString}`), {
            timestamp: true
        });
        runOptimizer(true);
    }
    function getDiscoveredBrowserHash(hash, deps, missing) {
        return getHash(hash + JSON.stringify(deps) + JSON.stringify(missing) + sessionTimestamp);
    }
    function registerMissingImport(id, resolved, ssr) {
        if (optimizedDeps.scanProcessing) {
            config.logger.error('Vite internal error: registering missing import before initial scanning is over');
        }
        const { metadata } = optimizedDeps;
        const optimized = metadata.optimized[id];
        if (optimized) {
            return optimized;
        }
        const chunk = metadata.chunks[id];
        if (chunk) {
            return chunk;
        }
        let missing = metadata.discovered[id];
        if (missing) {
            // We are already discover this dependency
            // It will be processed in the next rerun call
            return missing;
        }
        newDepsDiscovered = true;
        missing = addOptimizedDepInfo(metadata, 'discovered', {
            id,
            file: getOptimizedDepPath(id, server.config),
            src: resolved,
            // Assing a browserHash to this missing dependency that is unique to
            // the current state of known + missing deps. If its optimizeDeps run
            // doesn't alter the bundled files of previous known dependendencies,
            // we don't need a full reload and this browserHash will be kept
            browserHash: getDiscoveredBrowserHash(metadata.hash, depsFromOptimizedDepInfo(metadata.optimized), depsFromOptimizedDepInfo(metadata.discovered)),
            // loading of this pre-bundled dep needs to await for its processing
            // promise to be resolved
            processing: depOptimizationProcessing.promise
        });
        // Debounced rerun, let other missing dependencies be discovered before
        // the running next optimizeDeps
        enqueuedRerun = undefined;
        if (handle)
            clearTimeout(handle);
        if (newDepsToLogHandle)
            clearTimeout(newDepsToLogHandle);
        newDepsToLogHandle = undefined;
        handle = setTimeout(() => {
            handle = undefined;
            enqueuedRerun = rerun;
            if (!currentlyProcessing) {
                enqueuedRerun();
            }
        }, debounceMs);
        // Return the path for the optimized bundle, this path is known before
        // esbuild is run to generate the pre-bundle
        return missing;
    }
    return optimizedDeps;
}

// https://github.com/vitejs/vite/issues/2820#issuecomment-812495079
const ROOT_FILES = [
    // '.git',
    // https://pnpm.js.org/workspaces/
    'pnpm-workspace.yaml',
    // https://rushjs.io/pages/advanced/config_files/
    // 'rush.json',
    // https://nx.dev/latest/react/getting-started/nx-setup
    // 'workspace.json',
    // 'nx.json',
    // https://github.com/lerna/lerna#lernajson
    'lerna.json'
];
// npm: https://docs.npmjs.com/cli/v7/using-npm/workspaces#installing-workspaces
// yarn: https://classic.yarnpkg.com/en/docs/workspaces/#toc-how-to-use-it
function hasWorkspacePackageJSON(root) {
    const path$1 = path.join(root, 'package.json');
    if (!isFileReadable(path$1)) {
        return false;
    }
    const content = JSON.parse(fs__default.readFileSync(path$1, 'utf-8')) || {};
    return !!content.workspaces;
}
function hasRootFile(root) {
    return ROOT_FILES.some((file) => fs__default.existsSync(path.join(root, file)));
}
function hasPackageJSON(root) {
    const path$1 = path.join(root, 'package.json');
    return fs__default.existsSync(path$1);
}
/**
 * Search up for the nearest `package.json`
 */
function searchForPackageRoot(current, root = current) {
    if (hasPackageJSON(current))
        return current;
    const dir = path.dirname(current);
    // reach the fs root
    if (!dir || dir === current)
        return root;
    return searchForPackageRoot(dir, root);
}
/**
 * Search up for the nearest workspace root
 */
function searchForWorkspaceRoot(current, root = searchForPackageRoot(current)) {
    if (hasRootFile(current))
        return current;
    if (hasWorkspacePackageJSON(current))
        return current;
    const dir = path.dirname(current);
    // reach the fs root
    if (!dir || dir === current)
        return root;
    return searchForWorkspaceRoot(dir, root);
}

async function createServer(inlineConfig = {}) {
    const config = await resolveConfig(inlineConfig, 'serve', 'development');
    const { root, server: serverConfig } = config;
    const httpsOptions = await resolveHttpsConfig(config.server.https, config.cacheDir);
    let { middlewareMode } = serverConfig;
    if (middlewareMode === true) {
        middlewareMode = 'ssr';
    }
    const middlewares = connect__default();
    const httpServer = middlewareMode
        ? null
        : await resolveHttpServer(serverConfig, middlewares, httpsOptions);
    const ws = createWebSocketServer(httpServer, config, httpsOptions);
    const { ignored = [], ...watchOptions } = serverConfig.watch || {};
    const watcher = chokidar__default.watch(path__default.resolve(root), {
        ignored: [
            '**/node_modules/**',
            '**/.git/**',
            ...(Array.isArray(ignored) ? ignored : [ignored])
        ],
        ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true,
        ...watchOptions
    });
    const moduleGraph = new ModuleGraph((url, ssr) => container.resolveId(url, undefined, { ssr }));
    const container = await createPluginContainer(config, moduleGraph, watcher);
    const closeHttpServer = createServerCloseFn(httpServer);
    // eslint-disable-next-line prefer-const
    let exitProcess;
    const server = {
        config,
        middlewares,
        get app() {
            config.logger.warn(`ViteDevServer.app is deprecated. Use ViteDevServer.middlewares instead.`);
            return middlewares;
        },
        httpServer,
        watcher,
        pluginContainer: container,
        ws,
        moduleGraph,
        ssrTransform,
        transformWithEsbuild,
        transformRequest(url, options) {
            return transformRequest(url, server, options);
        },
        transformIndexHtml: null,
        async ssrLoadModule(url, opts) {
            if (!server._ssrExternals) {
                let knownImports = [];
                const optimizedDeps = server._optimizedDeps;
                if (optimizedDeps) {
                    await optimizedDeps.scanProcessing;
                    knownImports = [
                        ...Object.keys(optimizedDeps.metadata.optimized),
                        ...Object.keys(optimizedDeps.metadata.discovered)
                    ];
                }
                server._ssrExternals = resolveSSRExternal(config, knownImports);
            }
            return ssrLoadModule(url, server, undefined, undefined, opts === null || opts === void 0 ? void 0 : opts.fixStacktrace);
        },
        ssrFixStacktrace(e) {
            if (e.stack) {
                const stacktrace = ssrRewriteStacktrace(e.stack, moduleGraph);
                rebindErrorStacktrace(e, stacktrace);
            }
        },
        ssrRewriteStacktrace(stack) {
            return ssrRewriteStacktrace(stack, moduleGraph);
        },
        listen(port, isRestart) {
            return startServer(server, port, isRestart);
        },
        async close() {
            process.off('SIGTERM', exitProcess);
            if (!middlewareMode && process.env.CI !== 'true') {
                process.stdin.off('end', exitProcess);
            }
            await Promise.all([
                watcher.close(),
                ws.close(),
                container.close(),
                closeHttpServer()
            ]);
        },
        printUrls() {
            if (httpServer) {
                printCommonServerUrls(httpServer, config.server, config);
            }
            else {
                throw new Error('cannot print server URLs in middleware mode.');
            }
        },
        async restart(forceOptimize) {
            if (!server._restartPromise) {
                server._forceOptimizeOnRestart = !!forceOptimize;
                server._restartPromise = restartServer(server).finally(() => {
                    server._restartPromise = null;
                    server._forceOptimizeOnRestart = false;
                });
            }
            return server._restartPromise;
        },
        _optimizedDeps: null,
        _ssrExternals: null,
        _globImporters: Object.create(null),
        _restartPromise: null,
        _forceOptimizeOnRestart: false,
        _pendingRequests: new Map()
    };
    server.transformIndexHtml = createDevHtmlTransformFn(server);
    exitProcess = async () => {
        try {
            await server.close();
        }
        finally {
            process.exit(0);
        }
    };
    process.once('SIGTERM', exitProcess);
    if (!middlewareMode && process.env.CI !== 'true') {
        process.stdin.on('end', exitProcess);
    }
    const { packageCache } = config;
    const setPackageData = packageCache.set.bind(packageCache);
    packageCache.set = (id, pkg) => {
        if (id.endsWith('.json')) {
            watcher.add(id);
        }
        return setPackageData(id, pkg);
    };
    watcher.on('change', async (file) => {
        file = normalizePath(file);
        if (file.endsWith('/package.json')) {
            return invalidatePackageData(packageCache, file);
        }
        // invalidate module graph cache on file change
        moduleGraph.onFileChange(file);
        if (serverConfig.hmr !== false) {
            try {
                await handleHMRUpdate(file, server);
            }
            catch (err) {
                ws.send({
                    type: 'error',
                    err: prepareError(err)
                });
            }
        }
    });
    watcher.on('add', (file) => {
        handleFileAddUnlink(normalizePath(file), server);
    });
    watcher.on('unlink', (file) => {
        handleFileAddUnlink(normalizePath(file), server, true);
    });
    if (!middlewareMode && httpServer) {
        httpServer.once('listening', () => {
            // update actual port since this may be different from initial value
            serverConfig.port = httpServer.address().port;
        });
    }
    // apply server configuration hooks from plugins
    const postHooks = [];
    for (const plugin of config.plugins) {
        if (plugin.configureServer) {
            postHooks.push(await plugin.configureServer(server));
        }
    }
    // Internal middlewares ------------------------------------------------------
    // request timer
    if (process.env.DEBUG) {
        middlewares.use(timeMiddleware(root));
    }
    // cors (enabled by default)
    const { cors } = serverConfig;
    if (cors !== false) {
        middlewares.use(corsMiddleware__default(typeof cors === 'boolean' ? {} : cors));
    }
    // proxy
    const { proxy } = serverConfig;
    if (proxy) {
        middlewares.use(proxyMiddleware(httpServer, proxy, config));
    }
    // base
    if (config.base !== '/') {
        middlewares.use(baseMiddleware(server));
    }
    // open in editor support
    middlewares.use('/__open-in-editor', launchEditorMiddleware__default());
    // hmr reconnect ping
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    middlewares.use('/__vite_ping', function viteHMRPingMiddleware(_, res) {
        res.end('pong');
    });
    // serve static files under /public
    // this applies before the transform middleware so that these files are served
    // as-is without transforms.
    if (config.publicDir) {
        middlewares.use(servePublicMiddleware(config.publicDir));
    }
    // main transform middleware
    middlewares.use(transformMiddleware(server));
    // serve static files
    middlewares.use(serveRawFsMiddleware(server));
    middlewares.use(serveStaticMiddleware(root, server));
    // spa fallback
    if (!middlewareMode || middlewareMode === 'html') {
        middlewares.use(spaFallbackMiddleware(root));
    }
    // run post config hooks
    // This is applied before the html middleware so that user middleware can
    // serve custom content instead of index.html.
    postHooks.forEach((fn) => fn && fn());
    if (!middlewareMode || middlewareMode === 'html') {
        // transform index.html
        middlewares.use(indexHtmlMiddleware(server));
        // handle 404s
        // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
        middlewares.use(function vite404Middleware(_, res) {
            res.statusCode = 404;
            res.end();
        });
    }
    // error handler
    middlewares.use(errorMiddleware(server, !!middlewareMode));
    const initOptimizer = () => {
        if (!config.optimizeDeps.disabled) {
            server._optimizedDeps = createOptimizedDeps(server);
        }
    };
    if (!middlewareMode && httpServer) {
        let isOptimized = false;
        // overwrite listen to init optimizer before server start
        const listen = httpServer.listen.bind(httpServer);
        httpServer.listen = (async (port, ...args) => {
            if (!isOptimized) {
                try {
                    await container.buildStart({});
                    initOptimizer();
                    isOptimized = true;
                }
                catch (e) {
                    httpServer.emit('error', e);
                    return;
                }
            }
            return listen(port, ...args);
        });
    }
    else {
        await container.buildStart({});
        initOptimizer();
    }
    return server;
}
async function startServer(server, inlinePort, isRestart = false) {
    var _a;
    const httpServer = server.httpServer;
    if (!httpServer) {
        throw new Error('Cannot call server.listen in middleware mode.');
    }
    const options = server.config.server;
    const port = (_a = inlinePort !== null && inlinePort !== void 0 ? inlinePort : options.port) !== null && _a !== void 0 ? _a : 3000;
    const hostname = resolveHostname(options.host);
    const protocol = options.https ? 'https' : 'http';
    const info = server.config.logger.info;
    const base = server.config.base;
    const serverPort = await httpServerStart(httpServer, {
        port,
        strictPort: options.strictPort,
        host: hostname.host,
        logger: server.config.logger
    });
    // @ts-ignore
    const profileSession = global.__vite_profile_session;
    if (profileSession) {
        profileSession.post('Profiler.stop', (err, { profile }) => {
            // Write profile to disk, upload, etc.
            if (!err) {
                const outPath = path__default.resolve('./vite-profile.cpuprofile');
                fs__default.writeFileSync(outPath, JSON.stringify(profile));
                info(colors__default.yellow(`  CPU profile written to ${colors__default.white(colors__default.dim(outPath))}\n`));
            }
            else {
                throw err;
            }
        });
    }
    if (options.open && !isRestart) {
        const path = typeof options.open === 'string' ? options.open : base;
        openBrowser(path.startsWith('http')
            ? path
            : `${protocol}://${hostname.name}:${serverPort}${path}`, true, server.config.logger);
    }
    return server;
}
function createServerCloseFn(server) {
    if (!server) {
        return () => { };
    }
    let hasListened = false;
    const openSockets = new Set();
    server.on('connection', (socket) => {
        openSockets.add(socket);
        socket.on('close', () => {
            openSockets.delete(socket);
        });
    });
    server.once('listening', () => {
        hasListened = true;
    });
    return () => new Promise((resolve, reject) => {
        openSockets.forEach((s) => s.destroy());
        if (hasListened) {
            server.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
}
function resolvedAllowDir(root, dir) {
    return normalizePath(path__default.resolve(root, dir));
}
function resolveServerOptions(root, raw) {
    var _a, _b, _c, _d;
    const server = {
        preTransformRequests: true,
        ...raw
    };
    let allowDirs = (_a = server.fs) === null || _a === void 0 ? void 0 : _a.allow;
    const deny = ((_b = server.fs) === null || _b === void 0 ? void 0 : _b.deny) || ['.env', '.env.*', '*.{crt,pem}'];
    if (!allowDirs) {
        allowDirs = [searchForWorkspaceRoot(root)];
    }
    allowDirs = allowDirs.map((i) => resolvedAllowDir(root, i));
    // only push client dir when vite itself is outside-of-root
    const resolvedClientDir = resolvedAllowDir(root, CLIENT_DIR);
    if (!allowDirs.some((dir) => isParentDirectory(dir, resolvedClientDir))) {
        allowDirs.push(resolvedClientDir);
    }
    server.fs = {
        strict: (_d = (_c = server.fs) === null || _c === void 0 ? void 0 : _c.strict) !== null && _d !== void 0 ? _d : true,
        allow: allowDirs,
        deny
    };
    return server;
}
async function restartServer(server) {
    // @ts-ignore
    global.__vite_start_time = perf_hooks.performance.now();
    const { port: prevPort, host: prevHost } = server.config.server;
    await server.close();
    let inlineConfig = server.config.inlineConfig;
    if (server._forceOptimizeOnRestart) {
        inlineConfig = mergeConfig(inlineConfig, {
            server: {
                force: true
            }
        });
    }
    let newServer = null;
    try {
        newServer = await createServer(inlineConfig);
    }
    catch (err) {
        server.config.logger.error(err.message, {
            timestamp: true
        });
        return;
    }
    for (const key in newServer) {
        if (key === '_restartPromise') {
            // prevent new server `restart` function from calling
            // @ts-ignore
            newServer[key] = server[key];
        }
        else if (key !== 'app') {
            // @ts-ignore
            server[key] = newServer[key];
        }
    }
    const { logger, server: { port, host, middlewareMode } } = server.config;
    if (!middlewareMode) {
        await server.listen(port, true);
        logger.info('server restarted.', { timestamp: true });
        if (port !== prevPort || host !== prevHost) {
            logger.info('');
            server.printUrls();
        }
    }
    else {
        logger.info('server restarted.', { timestamp: true });
    }
    // new server (the current server) can restart now
    newServer._restartPromise = null;
}

var index = {
    __proto__: null,
    createServer: createServer,
    resolveServerOptions: resolveServerOptions,
    searchForWorkspaceRoot: searchForWorkspaceRoot
};

//@ts-nocheck
/* global Buffer */
const noop = () => { };
const mimes = /text|javascript|\/json|xml/i;
const threshold = 1024;
const level = -1;
let brotli = false;
const getChunkSize = (chunk, enc) => (chunk ? Buffer.byteLength(chunk, enc) : 0);
function compression() {
    const brotliOpts = (typeof brotli === 'object' && brotli) || {};
    const gzipOpts = {};
    // disable Brotli on Node<12.7 where it is unsupported:
    if (!zlib__default.createBrotliCompress)
        brotli = false;
    return (req, res, next = noop) => {
        const accept = req.headers['accept-encoding'] + '';
        const encoding = ((brotli && accept.match(/\bbr\b/)) ||
            (accept.match(/\bgzip\b/)) ||
            [])[0];
        // skip if no response body or no supported encoding:
        if (req.method === 'HEAD' || !encoding)
            return next();
        /** @type {zlib.Gzip | zlib.BrotliCompress} */
        let compress;
        let pendingStatus;
        /** @type {[string, function][]?} */
        let pendingListeners = [];
        let started = false;
        let size = 0;
        function start() {
            started = true;
            // @ts-ignore
            size = res.getHeader('Content-Length') | 0 || size;
            const compressible = mimes.test(String(res.getHeader('Content-Type') || 'text/plain'));
            const cleartext = !res.getHeader('Content-Encoding');
            const listeners = pendingListeners || [];
            if (compressible && cleartext && size >= threshold) {
                res.setHeader('Content-Encoding', encoding);
                res.removeHeader('Content-Length');
                if (encoding === 'br') {
                    const params = {
                        [zlib__default.constants.BROTLI_PARAM_QUALITY]: level,
                        [zlib__default.constants.BROTLI_PARAM_SIZE_HINT]: size
                    };
                    compress = zlib__default.createBrotliCompress({
                        params: Object.assign(params, brotliOpts)
                    });
                }
                else {
                    compress = zlib__default.createGzip(Object.assign({ level }, gzipOpts));
                }
                // backpressure
                compress.on('data', (chunk) => write.call(res, chunk) === false && compress.pause());
                on.call(res, 'drain', () => compress.resume());
                compress.on('end', () => end.call(res));
                listeners.forEach((p) => compress.on.apply(compress, p));
            }
            else {
                pendingListeners = null;
                listeners.forEach((p) => on.apply(res, p));
            }
            writeHead.call(res, pendingStatus || res.statusCode);
        }
        const { end, write, on, writeHead } = res;
        res.writeHead = function (status, reason, headers) {
            if (typeof reason !== 'string')
                [headers, reason] = [reason, headers];
            if (headers)
                for (let i in headers)
                    res.setHeader(i, headers[i]);
            pendingStatus = status;
            return this;
        };
        res.write = function (chunk, enc, cb) {
            size += getChunkSize(chunk, enc);
            if (!started)
                start();
            if (!compress)
                return write.apply(this, arguments);
            return compress.write.apply(compress, arguments);
        };
        res.end = function (chunk, enc, cb) {
            if (arguments.length > 0 && typeof chunk !== 'function') {
                size += getChunkSize(chunk, enc);
            }
            if (!started)
                start();
            if (!compress)
                return end.apply(this, arguments);
            return compress.end.apply(compress, arguments);
        };
        res.on = function (type, listener) {
            if (!pendingListeners || type !== 'drain')
                on.call(this, type, listener);
            else if (compress)
                compress.on(type, listener);
            else
                pendingListeners.push([type, listener]);
            return this;
        };
        next();
    };
}

function resolvePreviewOptions(preview, server) {
    var _a, _b, _c, _d, _e, _f, _g;
    // The preview server inherits every CommonServerOption from the `server` config
    // except for the port to enable having both the dev and preview servers running
    // at the same time without extra configuration
    return {
        port: preview === null || preview === void 0 ? void 0 : preview.port,
        strictPort: (_a = preview === null || preview === void 0 ? void 0 : preview.strictPort) !== null && _a !== void 0 ? _a : server.strictPort,
        host: (_b = preview === null || preview === void 0 ? void 0 : preview.host) !== null && _b !== void 0 ? _b : server.host,
        https: (_c = preview === null || preview === void 0 ? void 0 : preview.https) !== null && _c !== void 0 ? _c : server.https,
        open: (_d = preview === null || preview === void 0 ? void 0 : preview.open) !== null && _d !== void 0 ? _d : server.open,
        proxy: (_e = preview === null || preview === void 0 ? void 0 : preview.proxy) !== null && _e !== void 0 ? _e : server.proxy,
        cors: (_f = preview === null || preview === void 0 ? void 0 : preview.cors) !== null && _f !== void 0 ? _f : server.cors,
        headers: (_g = preview === null || preview === void 0 ? void 0 : preview.headers) !== null && _g !== void 0 ? _g : server.headers
    };
}
/**
 * Starts the Vite server in preview mode, to simulate a production deployment
 * @experimental
 */
async function preview(inlineConfig) {
    var _a, _b;
    const config = await resolveConfig(inlineConfig, 'serve', 'production');
    const app = connect__default();
    const httpServer = await resolveHttpServer(config.preview, app, await resolveHttpsConfig((_a = config.preview) === null || _a === void 0 ? void 0 : _a.https, config.cacheDir));
    // cors
    const { cors } = config.preview;
    if (cors !== false) {
        app.use(corsMiddleware__default(typeof cors === 'boolean' ? {} : cors));
    }
    // proxy
    const { proxy } = config.preview;
    if (proxy) {
        app.use(proxyMiddleware(httpServer, proxy, config));
    }
    app.use(compression());
    const distDir = path__default.resolve(config.root, config.build.outDir);
    app.use(config.base, sirv__default(distDir, {
        etag: true,
        dev: true,
        single: true
    }));
    const options = config.preview;
    const hostname = resolveHostname(options.host);
    const port = (_b = options.port) !== null && _b !== void 0 ? _b : 4173;
    const protocol = options.https ? 'https' : 'http';
    const logger = config.logger;
    const base = config.base;
    const serverPort = await httpServerStart(httpServer, {
        port,
        strictPort: options.strictPort,
        host: hostname.host,
        logger
    });
    if (options.open) {
        const path = typeof options.open === 'string' ? options.open : base;
        openBrowser(path.startsWith('http')
            ? path
            : `${protocol}://${hostname.name}:${serverPort}${path}`, true, logger);
    }
    return {
        config,
        httpServer,
        printUrls() {
            printCommonServerUrls(httpServer, config.preview, config);
        }
    };
}

var preview$1 = {
    __proto__: null,
    resolvePreviewOptions: resolvePreviewOptions,
    preview: preview
};

/**
 * https://github.com/rollup/plugins/blob/master/packages/json/src/index.js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/rollup/plugins/blob/master/LICENSE
 */
// Custom json filter for vite
const jsonExtRE = /\.json($|\?)(?!commonjs-(proxy|external))/;
function jsonPlugin(options = {}, isBuild) {
    return {
        name: 'vite:json',
        transform(json, id) {
            if (!jsonExtRE.test(id))
                return null;
            if (SPECIAL_QUERY_RE.test(id))
                return null;
            try {
                if (options.stringify) {
                    if (isBuild) {
                        return {
                            // during build, parse then double-stringify to remove all
                            // unnecessary whitespaces to reduce bundle size.
                            code: `export default JSON.parse(${JSON.stringify(JSON.stringify(JSON.parse(json)))})`,
                            map: { mappings: '' }
                        };
                    }
                    else {
                        return `export default JSON.parse(${JSON.stringify(json)})`;
                    }
                }
                const parsed = JSON.parse(json);
                return {
                    code: pluginutils.dataToEsm(parsed, {
                        preferConst: true,
                        namedExports: options.namedExports
                    }),
                    map: { mappings: '' }
                };
            }
            catch (e) {
                const errorMessageList = /[\d]+/.exec(e.message);
                const position = errorMessageList && parseInt(errorMessageList[0], 10);
                const msg = position
                    ? `, invalid JSON syntax found at line ${position}`
                    : `.`;
                this.error(`Failed to parse JSON file` + msg, e.idx);
            }
        }
    };
}

// ids in transform are normalized to unix style
const normalizedClientEntry = normalizePath(CLIENT_ENTRY);
const normalizedEnvEntry = normalizePath(ENV_ENTRY);
/**
 * some values used by the client needs to be dynamically injected by the server
 * @server-only
 */
function clientInjectionsPlugin(config) {
    return {
        name: 'vite:client-inject',
        transform(code, id, options) {
            if (id === normalizedClientEntry || id === normalizedEnvEntry) {
                let options = config.server.hmr;
                options = options && typeof options !== 'boolean' ? options : {};
                const host = options.host || null;
                const protocol = options.protocol || null;
                const timeout = options.timeout || 30000;
                const overlay = options.overlay !== false;
                let port;
                if (isObject(config.server.hmr)) {
                    port = config.server.hmr.clientPort || config.server.hmr.port;
                }
                if (config.server.middlewareMode) {
                    port = String(port || 24678);
                }
                else {
                    port = String(port || options.port || config.server.port);
                }
                let hmrBase = config.base;
                if (options.path) {
                    hmrBase = path__default.posix.join(hmrBase, options.path);
                }
                if (hmrBase !== '/') {
                    port = path__default.posix.normalize(`${port}${hmrBase}`);
                }
                return code
                    .replace(`__MODE__`, JSON.stringify(config.mode))
                    .replace(`__BASE__`, JSON.stringify(config.base))
                    .replace(`__DEFINES__`, serializeDefine(config.define || {}))
                    .replace(`__HMR_PROTOCOL__`, JSON.stringify(protocol))
                    .replace(`__HMR_HOSTNAME__`, JSON.stringify(host))
                    .replace(`__HMR_PORT__`, JSON.stringify(port))
                    .replace(`__HMR_TIMEOUT__`, JSON.stringify(timeout))
                    .replace(`__HMR_ENABLE_OVERLAY__`, JSON.stringify(overlay));
            }
            else if (!(options === null || options === void 0 ? void 0 : options.ssr) && code.includes('process.env.NODE_ENV')) {
                // replace process.env.NODE_ENV instead of defining a global
                // for it to avoid shimming a `process` object during dev,
                // avoiding inconsistencies between dev and build
                return code.replace(/\bprocess\.env\.NODE_ENV\b/g, JSON.stringify(config.mode));
            }
        }
    };
}
function serializeDefine(define) {
    let res = `{`;
    for (const key in define) {
        const val = define[key];
        res += `${JSON.stringify(key)}: ${typeof val === 'string' ? `(${val})` : JSON.stringify(val)}, `;
    }
    return res + `}`;
}

const wasmHelperId = '/__vite-wasm-helper';
const wasmHelper = async (opts = {}, url) => {
    let result;
    if (url.startsWith('data:')) {
        // @ts-ignore
        const binaryString = atob(url.replace(/^data:.*?base64,/, ''));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // @ts-ignore
        result = await WebAssembly.instantiate(bytes, opts);
    }
    else {
        // https://github.com/mdn/webassembly-examples/issues/5
        // WebAssembly.instantiateStreaming requires the server to provide the
        // correct MIME type for .wasm files, which unfortunately doesn't work for
        // a lot of static file servers, so we just work around it by getting the
        // raw buffer.
        // @ts-ignore
        const response = await fetch(url);
        const contentType = response.headers.get('Content-Type') || '';
        if (
        // @ts-ignore
        'instantiateStreaming' in WebAssembly &&
            contentType.startsWith('application/wasm')) {
            // @ts-ignore
            result = await WebAssembly.instantiateStreaming(response, opts);
        }
        else {
            const buffer = await response.arrayBuffer();
            // @ts-ignore
            result = await WebAssembly.instantiate(buffer, opts);
        }
    }
    return result.instance.exports;
};
const wasmHelperCode = wasmHelper.toString();
const wasmPlugin = (config) => {
    return {
        name: 'vite:wasm',
        resolveId(id) {
            if (id === wasmHelperId) {
                return id;
            }
        },
        async load(id) {
            if (id === wasmHelperId) {
                return `export default ${wasmHelperCode}`;
            }
            if (!id.endsWith('.wasm')) {
                return;
            }
            const url = await fileToUrl(id, config, this);
            return `
import initWasm from "${wasmHelperId}"
export default opts => initWasm(opts, ${JSON.stringify(url)})
`;
        }
    };
};

const WorkerFileId = 'worker_file';
const workerCache = new WeakMap();
function emitWorkerFile(ctx, config, asset, type) {
    const fileName = asset.fileName;
    const workerMap = workerCache.get(config);
    if (workerMap[type].has(fileName)) {
        return workerMap[type].get(fileName);
    }
    const hash = ctx.emitFile(asset);
    workerMap[type].set(fileName, hash);
    workerMap.emitted.set(hash, fileName);
    return hash;
}
function emitWorkerAssets(ctx, config, asset) {
    const { format } = config.worker;
    return emitWorkerFile(ctx, config, asset, format === 'es' ? 'chunks' : 'assets');
}
function emitWorkerChunks(ctx, config, asset) {
    return emitWorkerFile(ctx, config, asset, 'chunks');
}
async function bundleWorkerEntry(ctx, config, id, query) {
    // bundle the file as entry to support imports
    const rollup = require('rollup');
    const { plugins, rollupOptions, format } = config.worker;
    const bundle = await rollup.rollup({
        ...rollupOptions,
        input: cleanUrl(id),
        plugins,
        onwarn(warning, warn) {
            onRollupWarning(warning, warn, config);
        },
        preserveEntrySignatures: false
    });
    let chunk;
    try {
        const { output: [outputChunk, ...outputChunks] } = await bundle.generate({
            format,
            sourcemap: config.build.sourcemap
        });
        chunk = outputChunk;
        outputChunks.forEach((outputChunk) => {
            if (outputChunk.type === 'asset') {
                emitWorkerAssets(ctx, config, outputChunk);
            }
            else if (outputChunk.type === 'chunk') {
                emitWorkerChunks(ctx, config, {
                    fileName: path__default.posix.join(config.build.assetsDir, outputChunk.fileName),
                    source: outputChunk.code,
                    type: 'asset'
                });
            }
        });
    }
    finally {
        await bundle.close();
    }
    return emitSourcemapForWorkerEntry(ctx, config, id, query, chunk);
}
function emitSourcemapForWorkerEntry(context, config, id, query, chunk) {
    let { code, map: sourcemap } = chunk;
    if (sourcemap) {
        if (config.build.sourcemap === 'inline') {
            // Manually add the sourcemap to the code if configured for inline sourcemaps.
            // TODO: Remove when https://github.com/rollup/rollup/issues/3913 is resolved
            // Currently seems that it won't be resolved until Rollup 3
            const dataUrl = sourcemap.toUrl();
            code += `//# sourceMappingURL=${dataUrl}`;
        }
        else if (config.build.sourcemap === 'hidden' ||
            config.build.sourcemap === true) {
            const basename = path__default.parse(cleanUrl(id)).name;
            const data = sourcemap.toString();
            const content = Buffer.from(data);
            const contentHash = getAssetHash(content);
            const fileName = `${basename}.${contentHash}.js.map`;
            const filePath = path__default.posix.join(config.build.assetsDir, fileName);
            if (!context.cache.has(contentHash)) {
                context.cache.set(contentHash, true);
                context.emitFile({
                    fileName: filePath,
                    type: 'asset',
                    source: data
                });
            }
            // Emit the comment that tells the JS debugger where it can find the
            // sourcemap file.
            // 'hidden' causes the sourcemap file to be created but
            // the comment in the file to be omitted.
            if (config.build.sourcemap === true) {
                // inline web workers need to use the full sourcemap path
                // non-inline web workers can use a relative path
                const sourceMapUrl = (query === null || query === void 0 ? void 0 : query.inline) != null ? filePath : fileName;
                code += `//# sourceMappingURL=${sourceMapUrl}`;
            }
        }
    }
    return Buffer.from(code);
}
async function workerFileToUrl(ctx, config, id, query) {
    const workerMap = workerCache.get(config);
    let hash = workerMap.bundle.get(id);
    if (hash) {
        // rewrite truth id, no need to replace by asset plugin
        return config.base + workerMap.emitted.get(hash);
    }
    const code = await bundleWorkerEntry(ctx, config, id, query);
    const basename = path__default.parse(cleanUrl(id)).name;
    const contentHash = getAssetHash(code);
    const fileName = path__default.posix.join(config.build.assetsDir, `${basename}.${contentHash}.js`);
    hash = emitWorkerAssets(ctx, config, {
        fileName,
        type: 'asset',
        source: code
    });
    workerMap.bundle.set(id, hash);
    return `__VITE_ASSET__${hash}__`;
}
function webWorkerPlugin(config) {
    const isBuild = config.command === 'build';
    const isWorker = config.isWorker;
    return {
        name: 'vite:worker',
        buildStart() {
            workerCache.set(config, {
                assets: new Map(),
                chunks: new Map(),
                bundle: new Map(),
                emitted: new Map()
            });
        },
        load(id) {
            var _a;
            if (isBuild) {
                const parsedQuery = parseRequest(id);
                if (parsedQuery &&
                    ((_a = parsedQuery.worker) !== null && _a !== void 0 ? _a : parsedQuery.sharedworker) != null) {
                    return '';
                }
            }
        },
        async transform(_, id) {
            var _a;
            const query = parseRequest(id);
            if (query && query[WorkerFileId] != null) {
                return {
                    code: `import '${ENV_PUBLIC_PATH}'\n` + _
                };
            }
            if (query == null ||
                (query && ((_a = query.worker) !== null && _a !== void 0 ? _a : query.sharedworker) == null)) {
                return;
            }
            let url;
            if (isBuild) {
                if (query.inline != null) {
                    const code = await bundleWorkerEntry(this, config, id, query);
                    const { format } = config.worker;
                    const workerOptions = format === 'es' ? '{type: "module"}' : '{}';
                    // inline as blob data url
                    return {
                        code: `const encodedJs = "${code.toString('base64')}";
            const blob = typeof window !== "undefined" && window.Blob && new Blob([atob(encodedJs)], { type: "text/javascript;charset=utf-8" });
            export default function WorkerWrapper() {
              const objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
              try {
                return objURL ? new Worker(objURL, ${workerOptions}) : new Worker("data:application/javascript;base64," + encodedJs, {type: "module"});
              } finally {
                objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
              }
            }`,
                        // Empty sourcemap to supress Rollup warning
                        map: { mappings: '' }
                    };
                }
                else {
                    url = await workerFileToUrl(this, config, id, query);
                }
            }
            else {
                url = await fileToUrl(cleanUrl(id), config, this);
                url = injectQuery(url, WorkerFileId);
            }
            const workerConstructor = query.sharedworker != null ? 'SharedWorker' : 'Worker';
            const workerOptions = { type: 'module' };
            return {
                code: `export default function WorkerWrapper() {
          return new ${workerConstructor}(${JSON.stringify(url)}, ${JSON.stringify(workerOptions, null, 2)})
        }`,
                map: { mappings: '' } // Empty sourcemap to supress Rolup warning
            };
        },
        renderChunk(code) {
            if (isWorker && code.includes('import.meta.url')) {
                return code.replace('import.meta.url', 'self.location.href');
            }
        }
    };
}

/**
 * A plugin to avoid an aliased AND optimized dep from being aliased in src
 */
function preAliasPlugin() {
    let server;
    return {
        name: 'vite:pre-alias',
        configureServer(_server) {
            server = _server;
        },
        async resolveId(id, importer, options) {
            if (!(options === null || options === void 0 ? void 0 : options.ssr) && bareImportRE.test(id) && !(options === null || options === void 0 ? void 0 : options.scan)) {
                return await tryOptimizedResolve(id, server, importer);
            }
        }
    };
}

const nonJsRe = /\.(json)($|\?)/;
const isNonJsRequest = (request) => nonJsRe.test(request);
function definePlugin(config) {
    const isBuild = config.command === 'build';
    const processNodeEnv = {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || config.mode),
        'global.process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || config.mode),
        'globalThis.process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || config.mode)
    };
    const userDefine = {};
    for (const key in config.define) {
        const val = config.define[key];
        userDefine[key] = typeof val === 'string' ? val : JSON.stringify(val);
    }
    // during dev, import.meta properties are handled by importAnalysis plugin
    const importMetaKeys = {};
    if (isBuild) {
        const env = {
            ...config.env,
            SSR: !!config.build.ssr
        };
        for (const key in env) {
            importMetaKeys[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        }
        Object.assign(importMetaKeys, {
            'import.meta.env.': `({}).`,
            'import.meta.env': JSON.stringify(config.env),
            'import.meta.hot': `false`
        });
    }
    function generatePattern(ssr) {
        var _a;
        const processEnv = {};
        const isNeedProcessEnv = !ssr || ((_a = config.ssr) === null || _a === void 0 ? void 0 : _a.target) === 'webworker';
        if (isNeedProcessEnv) {
            Object.assign(processEnv, {
                'process.env.': `({}).`,
                'global.process.env.': `({}).`,
                'globalThis.process.env.': `({}).`
            });
        }
        const replacements = {
            ...(isNeedProcessEnv ? processNodeEnv : {}),
            ...userDefine,
            ...importMetaKeys,
            ...processEnv
        };
        const replacementsKeys = Object.keys(replacements);
        const pattern = replacementsKeys.length
            ? new RegExp(
            // Do not allow preceding '.', but do allow preceding '...' for spread operations
            '(?<!(?<!\\.\\.)\\.)\\b(' +
                replacementsKeys
                    .map((str) => {
                    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
                })
                    .join('|') +
                // prevent trailing assignments
                ')\\b(?!\\s*?=[^=])', 'g')
            : null;
        return [replacements, pattern];
    }
    const defaultPattern = generatePattern(false);
    const ssrPattern = generatePattern(true);
    return {
        name: 'vite:define',
        transform(code, id, options) {
            const ssr = (options === null || options === void 0 ? void 0 : options.ssr) === true;
            if (!ssr && !isBuild) {
                // for dev we inject actual global defines in the vite client to
                // avoid the transform cost.
                return;
            }
            if (
            // exclude html, css and static assets for performance
            isHTMLRequest(id) ||
                isCSSRequest(id) ||
                isNonJsRequest(id) ||
                config.assetsInclude(id)) {
                return;
            }
            const [replacements, pattern] = ssr ? ssrPattern : defaultPattern;
            if (!pattern) {
                return null;
            }
            if (ssr && !isBuild) {
                // ssr + dev, simple replace
                return code.replace(pattern, (_, match) => {
                    return '' + replacements[match];
                });
            }
            const s = new MagicString__default(code);
            let hasReplaced = false;
            let match;
            while ((match = pattern.exec(code))) {
                hasReplaced = true;
                const start = match.index;
                const end = start + match[0].length;
                const replacement = '' + replacements[match[1]];
                s.overwrite(start, end, replacement, { contentOnly: true });
            }
            if (!hasReplaced) {
                return null;
            }
            const result = { code: s.toString() };
            if (config.build.sourcemap) {
                result.map = s.generateMap({ hires: true });
            }
            return result;
        }
    };
}

const ignoreFlagRE = /\/\*\s*@vite-ignore\s*\*\//;
const WORKER_FILE_ID = 'worker_url_file';
function getWorkerType(raw, clean, i) {
    function err(e, pos) {
        const error = new Error(e);
        error.pos = pos;
        throw error;
    }
    const commaIndex = clean.indexOf(',', i);
    if (commaIndex === -1) {
        return 'classic';
    }
    const endIndex = clean.indexOf(')', i);
    // case: ') ... ,' mean no worker options params
    if (commaIndex > endIndex) {
        return 'classic';
    }
    // need to find in comment code
    const workerOptString = raw.substring(commaIndex + 1, endIndex);
    const hasViteIgnore = ignoreFlagRE.test(workerOptString);
    if (hasViteIgnore) {
        return 'ignore';
    }
    // need to find in no comment code
    const cleanWorkerOptString = clean.substring(commaIndex + 1, endIndex);
    if (!cleanWorkerOptString.trim().length) {
        return 'classic';
    }
    let workerOpts = { type: 'classic' };
    try {
        workerOpts = JSON5__default.parse(workerOptString);
    }
    catch (e) {
        // can't parse by JSON5, so the worker options had unexpect char.
        err('Vite is unable to parse the worker options as the value is not static.' +
            'To ignore this error, please use /* @vite-ignore */ in the worker options.', commaIndex + 1);
    }
    if (['classic', 'module'].includes(workerOpts.type)) {
        return workerOpts.type;
    }
    return 'classic';
}
function workerImportMetaUrlPlugin(config) {
    const isBuild = config.command === 'build';
    let server;
    return {
        name: 'vite:worker-import-meta-url',
        configureServer(_server) {
            server = _server;
        },
        async transform(code, id, options) {
            var _a;
            const query = parseRequest(id);
            if (query && query[WORKER_FILE_ID] != null && query['type'] != null) {
                const workerType = query['type'];
                let injectEnv = '';
                if (workerType === 'classic') {
                    injectEnv = `importScripts('${ENV_PUBLIC_PATH}')\n`;
                }
                else if (workerType === 'module') {
                    injectEnv = `import '${ENV_PUBLIC_PATH}'\n`;
                }
                else if (workerType === 'ignore') {
                    if (isBuild) {
                        injectEnv = '';
                    }
                    else if (server) {
                        // dynamic worker type we can't know how import the env
                        // so we copy /@vite/env code of server transform result into file header
                        const { moduleGraph } = server;
                        const module = moduleGraph.getModuleById(ENV_ENTRY);
                        injectEnv = ((_a = module === null || module === void 0 ? void 0 : module.transformResult) === null || _a === void 0 ? void 0 : _a.code) || '';
                    }
                }
                return {
                    code: injectEnv + code
                };
            }
            let s;
            if ((code.includes('new Worker') || code.includes('new SharedWorker')) &&
                code.includes('new URL') &&
                code.includes(`import.meta.url`)) {
                const cleanString = emptyString(code);
                const workerImportMetaUrlRE = /\bnew\s+(Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/g;
                let match;
                while ((match = workerImportMetaUrlRE.exec(cleanString))) {
                    const { 0: allExp, 2: exp, 3: emptyUrl, index } = match;
                    const urlIndex = allExp.indexOf(exp) + index;
                    const urlStart = cleanString.indexOf(emptyUrl, index);
                    const urlEnd = urlStart + emptyUrl.length;
                    const rawUrl = code.slice(urlStart, urlEnd);
                    if (options === null || options === void 0 ? void 0 : options.ssr) {
                        this.error(`\`new URL(url, import.meta.url)\` is not supported in SSR.`, urlIndex);
                    }
                    // potential dynamic template string
                    if (rawUrl[0] === '`' && /\$\{/.test(rawUrl)) {
                        this.error(`\`new URL(url, import.meta.url)\` is not supported in dynamic template string.`, urlIndex);
                    }
                    s || (s = new MagicString__default(code));
                    const workerType = getWorkerType(code, cleanString, index + allExp.length);
                    const file = path__default.resolve(path__default.dirname(id), rawUrl.slice(1, -1));
                    let url;
                    if (isBuild) {
                        url = await workerFileToUrl(this, config, file, query);
                    }
                    else {
                        url = await fileToUrl(cleanUrl(file), config, this);
                        url = injectQuery(url, WORKER_FILE_ID);
                        url = injectQuery(url, `type=${workerType}`);
                    }
                    s.overwrite(urlIndex, urlIndex + exp.length, JSON.stringify(url), {
                        contentOnly: true
                    });
                }
                if (s) {
                    return {
                        code: s.toString(),
                        map: config.build.sourcemap ? s.generateMap({ hires: true }) : null
                    };
                }
                return null;
            }
        }
    };
}

/**
 * Prepares the rendered chunks to contain additional metadata during build.
 */
function metadataPlugin() {
    return {
        name: 'vite:build-metadata',
        async renderChunk(_code, chunk) {
            chunk.viteMetadata = {
                importedAssets: new Set(),
                importedCss: new Set()
            };
            return null;
        }
    };
}

async function resolvePlugins(config, prePlugins, normalPlugins, postPlugins) {
    const isBuild = config.command === 'build';
    const isWatch = isBuild && !!config.build.watch;
    const buildPlugins = isBuild
        ? (await Promise.resolve().then(function () { return build$1; })).resolveBuildPlugins(config)
        : { pre: [], post: [] };
    return [
        isWatch ? ensureWatchPlugin() : null,
        isBuild ? metadataPlugin() : null,
        isBuild ? null : preAliasPlugin(),
        aliasPlugin__default({ entries: config.resolve.alias }),
        ...prePlugins,
        config.build.polyfillModulePreload
            ? modulePreloadPolyfillPlugin(config)
            : null,
        resolvePlugin({
            ...config.resolve,
            root: config.root,
            isProduction: config.isProduction,
            isBuild,
            packageCache: config.packageCache,
            ssrConfig: config.ssr,
            asSrc: true
        }),
        isBuild ? null : optimizedDepsPlugin(),
        htmlInlineProxyPlugin(config),
        cssPlugin(config),
        config.esbuild !== false ? esbuildPlugin(config.esbuild) : null,
        jsonPlugin({
            namedExports: true,
            ...config.json
        }, isBuild),
        wasmPlugin(config),
        webWorkerPlugin(config),
        assetPlugin(config),
        ...normalPlugins,
        definePlugin(config),
        cssPostPlugin(config),
        config.build.ssr ? ssrRequireHookPlugin(config) : null,
        isBuild && buildHtmlPlugin(config),
        workerImportMetaUrlPlugin(config),
        ...buildPlugins.pre,
        ...postPlugins,
        ...buildPlugins.post,
        // internal server-only plugins are always applied after everything else
        ...(isBuild
            ? []
            : [clientInjectionsPlugin(config), importAnalysisPlugin(config)])
    ].filter(Boolean);
}

const debug = createDebugger('vite:config');
/**
 * Type helper to make it easier to use vite.config.ts
 * accepts a direct {@link UserConfig} object, or a function that returns it.
 * The function receives a {@link ConfigEnv} object that exposes two properties:
 * `command` (either `'build'` or `'serve'`), and `mode`.
 */
function defineConfig(config) {
    return config;
}
async function resolveConfig(inlineConfig, command, defaultMode = 'development') {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    let config = inlineConfig;
    let configFileDependencies = [];
    let mode = inlineConfig.mode || defaultMode;
    // some dependencies e.g. @vue/compiler-* relies on NODE_ENV for getting
    // production-specific behavior, so set it here even though we haven't
    // resolve the final mode yet
    if (mode === 'production') {
        process.env.NODE_ENV = 'production';
    }
    const configEnv = {
        mode,
        command
    };
    let { configFile } = config;
    if (configFile !== false) {
        const loadResult = await loadConfigFromFile(configEnv, configFile, config.root, config.logLevel);
        if (loadResult) {
            config = mergeConfig(loadResult.config, config);
            configFile = loadResult.path;
            configFileDependencies = loadResult.dependencies;
        }
    }
    // Define logger
    const logger = createLogger(config.logLevel, {
        allowClearScreen: config.clearScreen,
        customLogger: config.customLogger
    });
    // user config may provide an alternative mode. But --mode has a higher priority
    mode = inlineConfig.mode || config.mode || mode;
    configEnv.mode = mode;
    // resolve plugins
    const rawUserPlugins = (config.plugins || []).flat(Infinity).filter((p) => {
        if (!p) {
            return false;
        }
        else if (!p.apply) {
            return true;
        }
        else if (typeof p.apply === 'function') {
            return p.apply({ ...config, mode }, configEnv);
        }
        else {
            return p.apply === command;
        }
    });
    const [prePlugins, normalPlugins, postPlugins] = sortUserPlugins(rawUserPlugins);
    // resolve worker
    const resolvedWorkerOptions = {
        format: ((_a = config.worker) === null || _a === void 0 ? void 0 : _a.format) || 'iife',
        plugins: [],
        rollupOptions: ((_b = config.worker) === null || _b === void 0 ? void 0 : _b.rollupOptions) || {}
    };
    // run config hooks
    const userPlugins = [...prePlugins, ...normalPlugins, ...postPlugins];
    for (const p of userPlugins) {
        if (p.config) {
            const res = await p.config(config, configEnv);
            if (res) {
                config = mergeConfig(config, res);
            }
        }
    }
    // resolve root
    const resolvedRoot = normalizePath(config.root ? path__default.resolve(config.root) : process.cwd());
    const clientAlias = [
        { find: /^[\/]?@vite\/env/, replacement: () => ENV_ENTRY },
        { find: /^[\/]?@vite\/client/, replacement: () => CLIENT_ENTRY }
    ];
    // resolve alias with internal client alias
    const resolvedAlias = normalizeAlias(mergeAlias(
    // @ts-ignore because @rollup/plugin-alias' type doesn't allow function
    // replacement, but its implementation does work with function values.
    clientAlias, ((_c = config.resolve) === null || _c === void 0 ? void 0 : _c.alias) || config.alias || []));
    const resolveOptions = {
        dedupe: config.dedupe,
        ...config.resolve,
        alias: resolvedAlias
    };
    // load .env files
    const envDir = config.envDir
        ? normalizePath(path__default.resolve(resolvedRoot, config.envDir))
        : resolvedRoot;
    const userEnv = inlineConfig.envFile !== false &&
        loadEnv(mode, envDir, resolveEnvPrefix(config));
    // Note it is possible for user to have a custom mode, e.g. `staging` where
    // production-like behavior is expected. This is indicated by NODE_ENV=production
    // loaded from `.staging.env` and set by us as VITE_USER_NODE_ENV
    const isProduction = (process.env.VITE_USER_NODE_ENV || mode) === 'production';
    if (isProduction) {
        // in case default mode was not production and is overwritten
        process.env.NODE_ENV = 'production';
    }
    // resolve public base url
    const BASE_URL = resolveBaseUrl(config.base, command === 'build', logger);
    const resolvedBuildOptions = resolveBuildOptions(config.build);
    // resolve cache directory
    const pkgPath = lookupFile(resolvedRoot, [`package.json`], { pathOnly: true });
    const cacheDir = config.cacheDir
        ? path__default.resolve(resolvedRoot, config.cacheDir)
        : pkgPath
            ? path__default.join(path__default.dirname(pkgPath), `node_modules/.vite`)
            : path__default.join(resolvedRoot, `.vite`);
    const assetsFilter = config.assetsInclude
        ? pluginutils.createFilter(config.assetsInclude)
        : () => false;
    // create an internal resolver to be used in special scenarios, e.g.
    // optimizer & handling css @imports
    const createResolver = (options) => {
        let aliasContainer;
        let resolverContainer;
        return async (id, importer, aliasOnly, ssr) => {
            var _a;
            let container;
            if (aliasOnly) {
                container =
                    aliasContainer ||
                        (aliasContainer = await createPluginContainer({
                            ...resolved,
                            plugins: [aliasPlugin__default({ entries: resolved.resolve.alias })]
                        }));
            }
            else {
                container =
                    resolverContainer ||
                        (resolverContainer = await createPluginContainer({
                            ...resolved,
                            plugins: [
                                aliasPlugin__default({ entries: resolved.resolve.alias }),
                                resolvePlugin({
                                    ...resolved.resolve,
                                    root: resolvedRoot,
                                    isProduction,
                                    isBuild: command === 'build',
                                    ssrConfig: resolved.ssr,
                                    asSrc: true,
                                    preferRelative: false,
                                    tryIndex: true,
                                    ...options
                                })
                            ]
                        }));
            }
            return (_a = (await container.resolveId(id, importer, { ssr }))) === null || _a === void 0 ? void 0 : _a.id;
        };
    };
    const { publicDir } = config;
    const resolvedPublicDir = publicDir !== false && publicDir !== ''
        ? path__default.resolve(resolvedRoot, typeof publicDir === 'string' ? publicDir : 'public')
        : '';
    const server = resolveServerOptions(resolvedRoot, config.server);
    const optimizeDeps = config.optimizeDeps || {};
    const resolved = {
        ...config,
        configFile: configFile ? normalizePath(configFile) : undefined,
        configFileDependencies: configFileDependencies.map((name) => normalizePath(path__default.resolve(name))),
        inlineConfig,
        root: resolvedRoot,
        base: BASE_URL,
        resolve: resolveOptions,
        publicDir: resolvedPublicDir,
        cacheDir,
        command,
        mode,
        isWorker: false,
        isProduction,
        plugins: userPlugins,
        server,
        build: resolvedBuildOptions,
        preview: resolvePreviewOptions(config.preview, server),
        env: {
            ...userEnv,
            BASE_URL,
            MODE: mode,
            DEV: !isProduction,
            PROD: isProduction
        },
        assetsInclude(file) {
            return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file);
        },
        logger,
        packageCache: new Map(),
        createResolver,
        optimizeDeps: {
            ...optimizeDeps,
            esbuildOptions: {
                keepNames: optimizeDeps.keepNames,
                preserveSymlinks: (_d = config.resolve) === null || _d === void 0 ? void 0 : _d.preserveSymlinks,
                ...optimizeDeps.esbuildOptions
            }
        },
        worker: resolvedWorkerOptions
    };
    // flat config.worker.plugin
    const [workerPrePlugins, workerNormalPlugins, workerPostPlugins] = sortUserPlugins((_e = config.worker) === null || _e === void 0 ? void 0 : _e.plugins);
    const workerResolved = { ...resolved, isWorker: true };
    resolved.worker.plugins = await resolvePlugins(workerResolved, workerPrePlugins, workerNormalPlugins, workerPostPlugins);
    // call configResolved worker plugins hooks
    await Promise.all(resolved.worker.plugins.map((p) => { var _a; return (_a = p.configResolved) === null || _a === void 0 ? void 0 : _a.call(p, workerResolved); }));
    resolved.plugins = await resolvePlugins(resolved, prePlugins, normalPlugins, postPlugins);
    // call configResolved hooks
    await Promise.all(userPlugins.map((p) => { var _a; return (_a = p.configResolved) === null || _a === void 0 ? void 0 : _a.call(p, resolved); }));
    if (process.env.DEBUG) {
        debug(`using resolved config: %O`, {
            ...resolved,
            plugins: resolved.plugins.map((p) => p.name)
        });
    }
    // TODO Deprecation warnings - remove when out of beta
    const logDeprecationWarning = (deprecatedOption, hint, error) => {
        logger.warn(colors__default.yellow(colors__default.bold(`(!) "${deprecatedOption}" option is deprecated. ${hint}${error ? `\n${error.stack}` : ''}`)));
    };
    if ((_f = config.build) === null || _f === void 0 ? void 0 : _f.base) {
        logDeprecationWarning('build.base', '"base" is now a root-level config option.');
        config.base = config.build.base;
    }
    Object.defineProperty(resolvedBuildOptions, 'base', {
        enumerable: false,
        get() {
            logDeprecationWarning('build.base', '"base" is now a root-level config option.', new Error());
            return resolved.base;
        }
    });
    if (config.alias) {
        logDeprecationWarning('alias', 'Use "resolve.alias" instead.');
    }
    Object.defineProperty(resolved, 'alias', {
        enumerable: false,
        get() {
            logDeprecationWarning('alias', 'Use "resolve.alias" instead.', new Error());
            return resolved.resolve.alias;
        }
    });
    if (config.dedupe) {
        logDeprecationWarning('dedupe', 'Use "resolve.dedupe" instead.');
    }
    Object.defineProperty(resolved, 'dedupe', {
        enumerable: false,
        get() {
            logDeprecationWarning('dedupe', 'Use "resolve.dedupe" instead.', new Error());
            return resolved.resolve.dedupe;
        }
    });
    if (optimizeDeps.keepNames) {
        logDeprecationWarning('optimizeDeps.keepNames', 'Use "optimizeDeps.esbuildOptions.keepNames" instead.');
    }
    Object.defineProperty(resolved.optimizeDeps, 'keepNames', {
        enumerable: false,
        get() {
            var _a;
            logDeprecationWarning('optimizeDeps.keepNames', 'Use "optimizeDeps.esbuildOptions.keepNames" instead.', new Error());
            return (_a = resolved.optimizeDeps.esbuildOptions) === null || _a === void 0 ? void 0 : _a.keepNames;
        }
    });
    if ((_g = config.build) === null || _g === void 0 ? void 0 : _g.polyfillDynamicImport) {
        logDeprecationWarning('build.polyfillDynamicImport', '"polyfillDynamicImport" has been removed. Please use @vitejs/plugin-legacy if your target browsers do not support dynamic imports.');
    }
    Object.defineProperty(resolvedBuildOptions, 'polyfillDynamicImport', {
        enumerable: false,
        get() {
            logDeprecationWarning('build.polyfillDynamicImport', '"polyfillDynamicImport" has been removed. Please use @vitejs/plugin-legacy if your target browsers do not support dynamic imports.', new Error());
            return false;
        }
    });
    if ((_h = config.build) === null || _h === void 0 ? void 0 : _h.cleanCssOptions) {
        logDeprecationWarning('build.cleanCssOptions', 'Vite now uses esbuild for CSS minification.');
    }
    if (((_j = config.build) === null || _j === void 0 ? void 0 : _j.terserOptions) && config.build.minify !== 'terser') {
        logger.warn(colors__default.yellow(`build.terserOptions is specified but build.minify is not set to use Terser. ` +
            `Note Vite now defaults to use esbuild for minification. If you still ` +
            `prefer Terser, set build.minify to "terser".`));
    }
    return resolved;
}
/**
 * Resolve base. Note that some users use Vite to build for non-web targets like
 * electron or expects to deploy
 */
function resolveBaseUrl(base = '/', isBuild, logger) {
    // #1669 special treatment for empty for same dir relative base
    if (base === '' || base === './') {
        return isBuild ? base : '/';
    }
    if (base.startsWith('.')) {
        logger.warn(colors__default.yellow(colors__default.bold(`(!) invalid "base" option: ${base}. The value can only be an absolute ` +
            `URL, ./, or an empty string.`)));
        base = '/';
    }
    // external URL
    if (isExternalUrl(base)) {
        if (!isBuild) {
            // get base from full url during dev
            const parsed = url.parse(base);
            base = parsed.pathname || '/';
        }
    }
    else {
        // ensure leading slash
        if (!base.startsWith('/')) {
            logger.warn(colors__default.yellow(colors__default.bold(`(!) "base" option should start with a slash.`)));
            base = '/' + base;
        }
    }
    // ensure ending slash
    if (!base.endsWith('/')) {
        logger.warn(colors__default.yellow(colors__default.bold(`(!) "base" option should end with a slash.`)));
        base += '/';
    }
    return base;
}
function mergeConfigRecursively(defaults, overrides, rootPath) {
    const merged = { ...defaults };
    for (const key in overrides) {
        const value = overrides[key];
        if (value == null) {
            continue;
        }
        const existing = merged[key];
        if (existing == null) {
            merged[key] = value;
            continue;
        }
        // fields that require special handling
        if (key === 'alias' && (rootPath === 'resolve' || rootPath === '')) {
            merged[key] = mergeAlias(existing, value);
            continue;
        }
        else if (key === 'assetsInclude' && rootPath === '') {
            merged[key] = [].concat(existing, value);
            continue;
        }
        else if (key === 'noExternal' && (existing === true || value === true)) {
            merged[key] = true;
            continue;
        }
        if (Array.isArray(existing) || Array.isArray(value)) {
            merged[key] = [...arraify(existing !== null && existing !== void 0 ? existing : []), ...arraify(value !== null && value !== void 0 ? value : [])];
            continue;
        }
        if (isObject(existing) && isObject(value)) {
            merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key);
            continue;
        }
        merged[key] = value;
    }
    return merged;
}
function mergeConfig(defaults, overrides, isRoot = true) {
    return mergeConfigRecursively(defaults, overrides, isRoot ? '' : '.');
}
function mergeAlias(a, b) {
    if (!a)
        return b;
    if (!b)
        return a;
    if (isObject(a) && isObject(b)) {
        return { ...a, ...b };
    }
    // the order is flipped because the alias is resolved from top-down,
    // where the later should have higher priority
    return [...normalizeAlias(b), ...normalizeAlias(a)];
}
function normalizeAlias(o = []) {
    return Array.isArray(o)
        ? o.map(normalizeSingleAlias)
        : Object.keys(o).map((find) => normalizeSingleAlias({
            find,
            replacement: o[find]
        }));
}
// https://github.com/vitejs/vite/issues/1363
// work around https://github.com/rollup/plugins/issues/759
function normalizeSingleAlias({ find, replacement, customResolver }) {
    if (typeof find === 'string' &&
        find.endsWith('/') &&
        replacement.endsWith('/')) {
        find = find.slice(0, find.length - 1);
        replacement = replacement.slice(0, replacement.length - 1);
    }
    const alias = {
        find,
        replacement
    };
    if (customResolver) {
        alias.customResolver = customResolver;
    }
    return alias;
}
function sortUserPlugins(plugins) {
    const prePlugins = [];
    const postPlugins = [];
    const normalPlugins = [];
    if (plugins) {
        plugins.flat().forEach((p) => {
            if (p.enforce === 'pre')
                prePlugins.push(p);
            else if (p.enforce === 'post')
                postPlugins.push(p);
            else
                normalPlugins.push(p);
        });
    }
    return [prePlugins, normalPlugins, postPlugins];
}
async function loadConfigFromFile(configEnv, configFile, configRoot = process.cwd(), logLevel) {
    const start = perf_hooks.performance.now();
    const getTime = () => `${(perf_hooks.performance.now() - start).toFixed(2)}ms`;
    let resolvedPath;
    let isTS = false;
    let isESM = false;
    let dependencies = [];
    // check package.json for type: "module" and set `isMjs` to true
    try {
        const pkg = lookupFile(configRoot, ['package.json']);
        if (pkg && JSON.parse(pkg).type === 'module') {
            isESM = true;
        }
    }
    catch (e) { }
    if (configFile) {
        // explicit config path is always resolved from cwd
        resolvedPath = path__default.resolve(configFile);
        isTS = configFile.endsWith('.ts');
        if (configFile.endsWith('.mjs')) {
            isESM = true;
        }
    }
    else {
        // implicit config file loaded from inline root (if present)
        // otherwise from cwd
        const jsconfigFile = path__default.resolve(configRoot, 'vite.config.js');
        if (fs__default.existsSync(jsconfigFile)) {
            resolvedPath = jsconfigFile;
        }
        if (!resolvedPath) {
            const mjsconfigFile = path__default.resolve(configRoot, 'vite.config.mjs');
            if (fs__default.existsSync(mjsconfigFile)) {
                resolvedPath = mjsconfigFile;
                isESM = true;
            }
        }
        if (!resolvedPath) {
            const tsconfigFile = path__default.resolve(configRoot, 'vite.config.ts');
            if (fs__default.existsSync(tsconfigFile)) {
                resolvedPath = tsconfigFile;
                isTS = true;
            }
        }
        if (!resolvedPath) {
            const cjsConfigFile = path__default.resolve(configRoot, 'vite.config.cjs');
            if (fs__default.existsSync(cjsConfigFile)) {
                resolvedPath = cjsConfigFile;
                isESM = false;
            }
        }
    }
    if (!resolvedPath) {
        debug('no config file found.');
        return null;
    }
    try {
        let userConfig;
        if (isESM) {
            const fileUrl = require('url').pathToFileURL(resolvedPath);
            const bundled = await bundleConfigFile(resolvedPath, true);
            dependencies = bundled.dependencies;
            if (isTS) {
                // before we can register loaders without requiring users to run node
                // with --experimental-loader themselves, we have to do a hack here:
                // bundle the config file w/ ts transforms first, write it to disk,
                // load it with native Node ESM, then delete the file.
                fs__default.writeFileSync(resolvedPath + '.js', bundled.code);
                userConfig = (await dynamicImport(`${fileUrl}.js?t=${Date.now()}`))
                    .default;
                fs__default.unlinkSync(resolvedPath + '.js');
                debug(`TS + native esm config loaded in ${getTime()}`, fileUrl);
            }
            else {
                // using Function to avoid this from being compiled away by TS/Rollup
                // append a query so that we force reload fresh config in case of
                // server restart
                userConfig = (await dynamicImport(`${fileUrl}?t=${Date.now()}`)).default;
                debug(`native esm config loaded in ${getTime()}`, fileUrl);
            }
        }
        if (!userConfig) {
            // Bundle config file and transpile it to cjs using esbuild.
            const bundled = await bundleConfigFile(resolvedPath);
            dependencies = bundled.dependencies;
            userConfig = await loadConfigFromBundledFile(resolvedPath, bundled.code);
            debug(`bundled config file loaded in ${getTime()}`);
        }
        const config = await (typeof userConfig === 'function'
            ? userConfig(configEnv)
            : userConfig);
        if (!isObject(config)) {
            throw new Error(`config must export or return an object.`);
        }
        return {
            path: normalizePath(resolvedPath),
            config,
            dependencies
        };
    }
    catch (e) {
        createLogger(logLevel).error(colors__default.red(`failed to load config from ${resolvedPath}`), { error: e });
        throw e;
    }
}
async function bundleConfigFile(fileName, isESM = false) {
    const result = await esbuild.build({
        absWorkingDir: process.cwd(),
        entryPoints: [fileName],
        outfile: 'out.js',
        write: false,
        platform: 'node',
        bundle: true,
        format: isESM ? 'esm' : 'cjs',
        sourcemap: 'inline',
        metafile: true,
        plugins: [
            {
                name: 'externalize-deps',
                setup(build) {
                    build.onResolve({ filter: /.*/ }, (args) => {
                        const id = args.path;
                        if (id[0] !== '.' && !path__default.isAbsolute(id)) {
                            return {
                                external: true
                            };
                        }
                    });
                }
            },
            {
                name: 'replace-import-meta',
                setup(build) {
                    build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
                        const contents = await fs__default.promises.readFile(args.path, 'utf8');
                        return {
                            loader: args.path.endsWith('.ts') ? 'ts' : 'js',
                            contents: contents
                                .replace(/\bimport\.meta\.url\b/g, JSON.stringify(url.pathToFileURL(args.path).href))
                                .replace(/\b__dirname\b/g, JSON.stringify(path__default.dirname(args.path)))
                                .replace(/\b__filename\b/g, JSON.stringify(args.path))
                        };
                    });
                }
            }
        ]
    });
    const { text } = result.outputFiles[0];
    return {
        code: text,
        dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
    };
}
async function loadConfigFromBundledFile(fileName, bundledCode) {
    const extension = path__default.extname(fileName);
    const defaultLoader = require.extensions[extension];
    require.extensions[extension] = (module, filename) => {
        if (filename === fileName) {
            module._compile(bundledCode, filename);
        }
        else {
            defaultLoader(module, filename);
        }
    };
    // clear cache in case of server restart
    delete require.cache[require.resolve(fileName)];
    const raw = require(fileName);
    const config = raw.__esModule ? raw.default : raw;
    require.extensions[extension] = defaultLoader;
    return config;
}
function loadEnv(mode, envDir, prefixes = 'VITE_') {
    var _a;
    if (mode === 'local') {
        throw new Error(`"local" cannot be used as a mode name because it conflicts with ` +
            `the .local postfix for .env files.`);
    }
    prefixes = arraify(prefixes);
    const env = {};
    const envFiles = [
        /** mode local file */ `.env.${mode}.local`,
        /** mode file */ `.env.${mode}`,
        /** local file */ `.env.local`,
        /** default file */ `.env`
    ];
    // check if there are actual env variables starting with VITE_*
    // these are typically provided inline and should be prioritized
    for (const key in process.env) {
        if (prefixes.some((prefix) => key.startsWith(prefix)) &&
            env[key] === undefined) {
            env[key] = process.env[key];
        }
    }
    for (const file of envFiles) {
        const path = lookupFile(envDir, [file], { pathOnly: true, rootDir: envDir });
        if (path) {
            const parsed = dotenv__default.parse(fs__default.readFileSync(path), {
                debug: ((_a = process.env.DEBUG) === null || _a === void 0 ? void 0 : _a.includes('vite:dotenv')) || undefined
            });
            // let environment variables use each other
            dotenvExpand__default({
                parsed,
                // prevent process.env mutation
                ignoreProcessEnv: true
            });
            // only keys that start with prefix are exposed to client
            for (const [key, value] of Object.entries(parsed)) {
                if (prefixes.some((prefix) => key.startsWith(prefix)) &&
                    env[key] === undefined) {
                    env[key] = value;
                }
                else if (key === 'NODE_ENV' &&
                    process.env.VITE_USER_NODE_ENV === undefined) {
                    // NODE_ENV override in .env file
                    process.env.VITE_USER_NODE_ENV = value;
                }
            }
        }
    }
    return env;
}
function resolveEnvPrefix({ envPrefix = 'VITE_' }) {
    envPrefix = arraify(envPrefix);
    if (envPrefix.some((prefix) => prefix === '')) {
        throw new Error(`envPrefix option contains value '', which could lead unexpected exposure of sensitive information.`);
    }
    return envPrefix;
}

exports.build = build;
exports.build$1 = build$1;
exports.createLogger = createLogger;
exports.createServer = createServer;
exports.defineConfig = defineConfig;
exports.formatPostcssSourceMap = formatPostcssSourceMap;
exports.index = index$1;
exports.index$1 = index;
exports.isCSSRequest = isCSSRequest;
exports.loadConfigFromFile = loadConfigFromFile;
exports.loadEnv = loadEnv;
exports.mergeConfig = mergeConfig;
exports.normalizePath = normalizePath;
exports.optimizeDeps = optimizeDeps;
exports.preview = preview;
exports.preview$1 = preview$1;
exports.printHttpServerUrls = printHttpServerUrls;
exports.resolveConfig = resolveConfig;
exports.resolveEnvPrefix = resolveEnvPrefix;
exports.resolvePackageData = resolvePackageData;
exports.resolvePackageEntry = resolvePackageEntry;
exports.searchForWorkspaceRoot = searchForWorkspaceRoot;
exports.send = send;
exports.sortUserPlugins = sortUserPlugins;
exports.transformWithEsbuild = transformWithEsbuild;
//# sourceMappingURL=dep-c560a62b.js.map
