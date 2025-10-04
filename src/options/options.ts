import browser from 'webextension-polyfill';
import type { Message, MessageResponse, ExtensionConfig, AccessMethod } from '../lib/types';
import { defaultConfig } from '../lib/storage';

// Form elements
const openAthensInput = document.getElementById('openathens-entity') as HTMLInputElement;
const ezproxyPrefixInput = document.getElementById('ezproxy-prefix') as HTMLInputElement;
const libkeyLibraryInput = document.getElementById('libkey-library') as HTMLInputElement;
const enableProbeCheck = document.getElementById('enable-probe') as HTMLInputElement;
const maxHopsInput = document.getElementById('max-hops') as HTMLInputElement;
const timeoutInput = document.getElementById('timeout') as HTMLInputElement;

// Advanced options
const showAdvancedCheck = document.getElementById('show-advanced') as HTMLInputElement;
const advancedOptionsDiv = document.getElementById('advanced-options') as HTMLElement;

// Buttons
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const saveStatus = document.getElementById('save-status') as HTMLSpanElement;

// Send message to background
async function sendMessage(message: Message): Promise<MessageResponse> {
  return await browser.runtime.sendMessage(message);
}

// Toggle advanced options visibility
function toggleAdvancedOptions() {
  if (showAdvancedCheck.checked) {
    advancedOptionsDiv.classList.remove('hidden');
  } else {
    advancedOptionsDiv.classList.add('hidden');
  }
}

// Load settings
async function loadSettings() {
  const response = await sendMessage({ action: 'getConfig' });
  if (response.success) {
    const config = response.data as ExtensionConfig;

    // Institution settings
    openAthensInput.value = config.openAthensEntityId || '';
    ezproxyPrefixInput.value = config.ezproxyPrefix || '';
    libkeyLibraryInput.value = config.libkeyLibraryId || '';

    // Advanced options
    enableProbeCheck.checked = config.enablePostProxyProbe;
    maxHopsInput.value = String(config.maxRedirectHops);
    timeoutInput.value = String(config.redirectTimeout);
  }
}

// Normalize and clean URL inputs
function cleanUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Remove trailing slashes
  return trimmed.replace(/\/+$/, '');
}

// Extract EZProxy base from URL or clean domain
function cleanEzProxyUrl(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // Detect if this is actually an OpenAthens URL
  if (trimmed.includes('openathens.net')) {
    alert('This looks like an OpenAthens URL. Please paste it in the OpenAthens field instead.');
    return undefined;
  }

  // If it's a full URL like http://ezproxy.library.usyd.edu.au/login?url=...
  // Extract the base (either domain or domain + /login)
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);

    // If path is /login, include it and detect query parameter type
    if (url.pathname.startsWith('/login')) {
      let queryParam = 'url'; // default

      // Detect if using qurl instead of url
      if (url.search.includes('qurl=')) {
        queryParam = 'qurl';
      }

      // Return with query param indicator (we'll use a separator)
      // Format: http://proxy.example.edu/login|qurl or http://proxy.example.edu/login
      return queryParam === 'qurl'
        ? `${url.protocol}//${url.host}/login|qurl`
        : `${url.protocol}//${url.host}/login`;
    }

    // Otherwise just return domain (for hostname rewrite method)
    return url.host;
  } catch {
    // Not a valid URL, return as-is
    return cleanUrl(trimmed);
  }
}

// Extract LibKey library ID from URL or return as-is if already a number
function extractLibKeyId(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // If it's already just a number, return it
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Try to extract from LibKey URL patterns:
  // - https://libkey.io/12345/...
  // - https://institution.libkey.io/...
  // - Any URL with /libraries/12345/
  const patterns = [
    /libkey\.io\/(\d+)/i,
    /libraries\/(\d+)/i,
    /library[=\/](\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Return as-is if we couldn't extract (might be a direct ID)
  return trimmed;
}

// Save settings
async function saveSettings() {
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  saveStatus.textContent = '';

  try {
    const config: Partial<ExtensionConfig> = {
      openAthensEntityId: cleanUrl(openAthensInput.value),
      ezproxyPrefix: cleanEzProxyUrl(ezproxyPrefixInput.value),
      libkeyLibraryId: extractLibKeyId(libkeyLibraryInput.value),
      enablePostProxyProbe: enableProbeCheck.checked,
      maxRedirectHops: parseInt(maxHopsInput.value, 10),
      redirectTimeout: parseInt(timeoutInput.value, 10),
    };

    const response = await sendMessage({ action: 'setConfig', payload: config });
    if (response.success) {
      // Update inputs to show cleaned values
      if (config.openAthensEntityId) openAthensInput.value = config.openAthensEntityId;
      if (config.ezproxyPrefix) ezproxyPrefixInput.value = config.ezproxyPrefix;
      if (config.libkeyLibraryId) libkeyLibraryInput.value = config.libkeyLibraryId;

      saveStatus.textContent = 'Settings saved';
      setTimeout(() => {
        saveStatus.textContent = '';
      }, 3000);
    } else {
      alert(`Failed to save: ${response.error}`);
    }
  } catch (error: any) {
    alert(`Error: ${error.message}`);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save settings';
  }
}

// Reset to defaults
async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  try {
    const response = await sendMessage({ action: 'setConfig', payload: defaultConfig });
    if (response.success) {
      await loadSettings();
      saveStatus.textContent = 'Settings reset';
      setTimeout(() => {
        saveStatus.textContent = '';
      }, 3000);
    }
  } catch (error: any) {
    alert(`Error: ${error.message}`);
  }
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);
showAdvancedCheck.addEventListener('change', toggleAdvancedOptions);

// Initialize
loadSettings();
