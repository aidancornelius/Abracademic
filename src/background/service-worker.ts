import browser from 'webextension-polyfill';
import type { Message, MessageResponse } from '../lib/types';
import { processUrl } from '../lib/processor';
import { getConfig, setConfig, getLastResult, setLastResult } from '../lib/storage';

/**
 * Background service worker for MV3
 */

// Handle extension installation
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Create context menu
    browser.contextMenus.create({
      id: 'abracademic-process',
      title: 'Access via Abracademic',
      contexts: ['link', 'page'],
    });

    // Open options page on first install
    browser.runtime.openOptionsPage();
  }
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'abracademic-process') {
    const url = (info.linkUrl || info.pageUrl) as string;
    if (url) {
      await processAndNavigate(url, tab?.id);
    }
  }
});

// Handle toolbar button clicks (delegated to popup)
browser.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    await processAndNavigate(tab.url, tab.id);
  }
});

// Handle messages from popup and options
browser.runtime.onMessage.addListener(async (message: Message, sender) => {
  const response: MessageResponse = { success: false };

  try {
    switch (message.action) {
      case 'processUrl':
        const config = await getConfig();
        const result = await processUrl(message.payload.url, config);
        await setLastResult(result);
        response.success = true;
        response.data = result;
        break;

      case 'getConfig':
        response.success = true;
        response.data = await getConfig();
        break;

      case 'setConfig':
        await setConfig(message.payload);
        response.success = true;
        break;

      case 'getLastResult':
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
 */
async function processAndNavigate(url: string, tabId?: number): Promise<void> {
  try {
    const config = await getConfig();
    const result = await processUrl(url, config);
    await setLastResult(result);

    if (result.success && result.finalUrl) {
      if (tabId) {
        // Update current tab
        await browser.tabs.update(tabId, { url: result.finalUrl });
      } else {
        // Create new tab
        await browser.tabs.create({ url: result.finalUrl });
      }
    } else {
      // Show error notification
      console.error('Processing failed:', result.error);
    }
  } catch (error) {
    console.error('Processing error:', error);
  }
}
