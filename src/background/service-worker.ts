import browser from '../adapters/browser';
import type { Message, MessageResponse } from '../lib/types';
import { processUrl } from '../lib/processor';
import { getConfig, setConfig, getLastResult, setLastResult } from '../lib/storage';

/**
 * Background service worker for MV3
 *
 * Handles:
 * - Extension lifecycle events (installation)
 * - Context menu interactions
 * - Toolbar button clicks
 * - Message passing between popup/options and background
 */

/**
 * Handle extension installation
 *
 * Sets up context menu and opens options page on first install
 * to guide users through initial configuration
 */
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Create context menu for right-click access
    browser.contextMenus.create({
      id: 'abracademic-process',
      title: 'Access via Abracademic',
      contexts: ['link', 'page'],
    });

    // Open options page on first install to configure institution settings
    browser.runtime.openOptionsPage();
  }
});

/**
 * Handle context menu clicks
 *
 * Processes the clicked link or current page URL when user
 * right-clicks and selects "Access via Abracademic"
 */
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'abracademic-process') {
    const url = (info.linkUrl || info.pageUrl) as string;
    if (url) {
      await processAndNavigate(url, tab?.id);
    }
  }
});

/**
 * Handle toolbar button clicks
 *
 * Note: If a popup is configured in manifest, this won't fire.
 * This is a fallback for browsers where popup UI might not be supported.
 */
browser.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    await processAndNavigate(tab.url, tab.id);
  }
});

/**
 * Handle messages from popup and options pages
 *
 * Provides RPC-style interface for:
 * - Processing URLs
 * - Getting/setting configuration
 * - Retrieving last processing result
 */
browser.runtime.onMessage.addListener(async (message: Message, sender) => {
  const response: MessageResponse = { success: false };

  try {
    switch (message.action) {
      case 'processUrl':
        // Process a URL and return the result
        const config = await getConfig();
        const result = await processUrl(message.payload.url, config);
        await setLastResult(result);
        response.success = true;
        response.data = result;
        break;

      case 'getConfig':
        // Retrieve current configuration
        response.success = true;
        response.data = await getConfig();
        break;

      case 'setConfig':
        // Update configuration with provided values
        await setConfig(message.payload);
        response.success = true;
        break;

      case 'getLastResult':
        // Get the most recent processing result for UI display
        response.success = true;
        response.data = await getLastResult();
        break;

      default:
        response.error = 'Unknown action';
    }
  } catch (error: any) {
    response.error = error.message || 'Unknown error';
  }

  return response;
});

/**
 * Process URL and navigate to result
 *
 * Helper function that processes a URL through the access pipeline
 * and navigates the browser to the resulting URL
 *
 * @param url - URL to process
 * @param tabId - Optional tab ID to update; creates new tab if not provided
 */
async function processAndNavigate(url: string, tabId?: number): Promise<void> {
  try {
    const config = await getConfig();
    const result = await processUrl(url, config);
    await setLastResult(result);

    if (result.success && result.finalUrl) {
      if (tabId) {
        // Update current tab with the proxied/routed URL
        await browser.tabs.update(tabId, { url: result.finalUrl });
      } else {
        // Create new tab if no tab ID provided
        await browser.tabs.create({ url: result.finalUrl });
      }
    } else {
      // Log error for debugging (could be enhanced with notifications)
      console.error('Processing failed:', result.error);
    }
  } catch (error) {
    console.error('Processing error:', error);
  }
}
