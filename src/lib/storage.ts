import type { ExtensionConfig, StorageData } from './types';
import browser from 'webextension-polyfill';

/**
 * Default configuration
 */
export const defaultConfig: ExtensionConfig = {
  defaultMethod: 'unpaywall',
  enableFallback: true,
  enablePostProxyProbe: false,
  maxRedirectHops: 10,
  redirectTimeout: 5000,
  fallbackOrder: ['libkey', 'unpaywall', 'googlescholar', 'annasarchive'],
};

/**
 * Get configuration from storage
 */
export async function getConfig(): Promise<ExtensionConfig> {
  try {
    const data = await browser.storage.sync.get('config');
    return { ...defaultConfig, ...data.config };
  } catch {
    // Fallback to local storage
    try {
      const data = await browser.storage.local.get('config');
      return { ...defaultConfig, ...data.config };
    } catch {
      return defaultConfig;
    }
  }
}

/**
 * Save configuration to storage
 */
export async function setConfig(config: Partial<ExtensionConfig>): Promise<void> {
  const currentConfig = await getConfig();
  const newConfig = { ...currentConfig, ...config };

  try {
    await browser.storage.sync.set({ config: newConfig });
  } catch {
    // Fallback to local storage
    await browser.storage.local.set({ config: newConfig });
  }
}

/**
 * Get last processing result
 */
export async function getLastResult() {
  try {
    const data = await browser.storage.local.get('lastResult');
    return data.lastResult || null;
  } catch {
    return null;
  }
}

/**
 * Save last processing result
 */
export async function setLastResult(result: any): Promise<void> {
  try {
    await browser.storage.local.set({ lastResult: result });
  } catch {
    // Ignore errors
  }
}
