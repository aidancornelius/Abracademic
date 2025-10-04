/**
 * Runtime adapter
 *
 * Provides target-specific runtime information and helpers.
 * The build system injects the target browser at compile time,
 * allowing for browser-specific behaviour when needed.
 */
import browser from './browser';

/**
 * Target browser type injected at build time via esbuild define
 * Falls back to 'firefox' if not defined (development default)
 */
declare const __TARGET__: 'chrome' | 'firefox' | 'safari';

/**
 * Current build target (chrome, firefox, or safari)
 * Set at compile time by the build system
 */
export const TARGET = (typeof __TARGET__ !== 'undefined' ? __TARGET__ : 'firefox') as 'chrome' | 'firefox' | 'safari';

/**
 * Browser detection flags for conditional logic
 * Use these instead of checking TARGET directly for better readability
 */
export const isSafari = TARGET === 'safari';
export const isFirefox = TARGET === 'firefox';
export const isChrome = TARGET === 'chrome';

/**
 * Storage adapter - uses local storage for Safari compatibility
 *
 * Safari has limited storage.sync support, so we use storage.local
 * across all browsers for consistency. This also avoids sync quota limits.
 */
export const storage = browser.storage.local;

export { browser };
