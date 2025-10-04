import type { ExtensionConfig, StorageData } from './types';
import { storage } from '../adapters/runtime';

/**
 * Default configuration
 *
 * Uses Unpaywall as the default method (free, no config required)
 * with intelligent fallback through LibKey, Google Scholar, and Anna's Archive
 */
export const defaultConfig: ExtensionConfig = {
  defaultMethod: 'unpaywall',
  enableFallback: true,
  enablePostProxyProbe: false, // Disabled by default to avoid extra network requests
  maxRedirectHops: 10,
  redirectTimeout: 5000, // 5 seconds
  fallbackOrder: ['libkey', 'unpaywall', 'googlescholar', 'annasarchive'],
};

/**
 * Get configuration from storage
 *
 * Retrieves user configuration and merges with defaults to ensure
 * all required fields are present even if user config is incomplete
 *
 * @returns Complete extension configuration with user preferences merged over defaults
 */
export async function getConfig(): Promise<ExtensionConfig> {
  try {
    const data = await storage.get('config');
    return { ...defaultConfig, ...data.config };
  } catch {
    return defaultConfig;
  }
}

/**
 * Save configuration to storage
 *
 * Performs a partial update, merging new settings with existing configuration
 * to preserve unmodified settings
 *
 * @param config - Partial configuration object with fields to update
 */
export async function setConfig(config: Partial<ExtensionConfig>): Promise<void> {
  const currentConfig = await getConfig();
  const newConfig = { ...currentConfig, ...config };
  await storage.set({ config: newConfig });
}

/**
 * Get last processing result
 *
 * Retrieves the most recent URL processing result for display in the popup.
 * Used to show users what happened with their last access attempt.
 *
 * @returns Last processing result or null if none exists
 */
export async function getLastResult() {
  try {
    const data = await storage.get('lastResult');
    return data.lastResult || null;
  } catch {
    return null;
  }
}

/**
 * Save last processing result
 *
 * Stores the processing result for display in the popup.
 * Errors are silently ignored as this is non-critical functionality.
 *
 * @param result - Processing result to store
 */
export async function setLastResult(result: any): Promise<void> {
  try {
    await storage.set({ lastResult: result });
  } catch {
    // Ignore errors - this is just for user feedback, not critical functionality
  }
}
