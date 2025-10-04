import browser from 'webextension-polyfill';
import type { Message, MessageResponse, ProcessingResult, ExtensionConfig } from '../lib/types';

const methodSelect = document.getElementById('method') as HTMLSelectElement;
const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
const optionsBtn = document.getElementById('options-btn') as HTMLButtonElement;
const lastResultDiv = document.getElementById('last-result') as HTMLDivElement;

// Load config and last result on popup open
async function init() {
  // Load config
  const configResponse = await sendMessage({ action: 'getConfig' });
  if (configResponse.success) {
    const config = configResponse.data as ExtensionConfig;

    // Remove options for unconfigured methods
    const options = Array.from(methodSelect.options);
    options.forEach(option => {
      const method = option.value;

      // Check if method requires config and if it's missing
      if (method === 'openathens' && !config.openAthensEntityId) {
        option.remove();
      } else if (method === 'ezproxy' && !config.ezproxyPrefix) {
        option.remove();
      } else if (method === 'libkey' && !config.libkeyLibraryId) {
        option.remove();
      }
    });

    // Set default method if it's still available
    if (Array.from(methodSelect.options).some(opt => opt.value === config.defaultMethod)) {
      methodSelect.value = config.defaultMethod;
    }
  }

  // Load last result
  const resultResponse = await sendMessage({ action: 'getLastResult' });
  if (resultResponse.success && resultResponse.data) {
    displayResult(resultResponse.data);
  }
}

// Send message to background
async function sendMessage(message: Message): Promise<MessageResponse> {
  return await browser.runtime.sendMessage(message);
}

// Process current tab
processBtn.addEventListener('click', async () => {
  processBtn.disabled = true;
  processBtn.textContent = 'Processing...';

  try {
    // Get current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (!currentTab.url) {
      alert('Cannot process this page');
      return;
    }

    // Update default method if changed
    const selectedMethod = methodSelect.value;
    await sendMessage({
      action: 'setConfig',
      payload: { defaultMethod: selectedMethod },
    });

    // Process URL
    const response = await sendMessage({
      action: 'processUrl',
      payload: { url: currentTab.url },
    });

    if (response.success && response.data) {
      const result = response.data as ProcessingResult;
      displayResult(result);

      // Navigate if successful
      if (result.success && result.finalUrl) {
        await browser.tabs.update(currentTab.id!, { url: result.finalUrl });
        window.close();
      }
    } else {
      alert(`Error: ${response.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    alert(`Error: ${error.message}`);
  } finally {
    processBtn.disabled = false;
    processBtn.textContent = 'Process current page';
  }
});

// Open options page
optionsBtn.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
  window.close();
});

// Display result
function displayResult(result: ProcessingResult) {
  const isSuccess = result.success;
  const className = isSuccess ? 'result success' : 'result error';

  const identifiersStr = result.identifiers.length > 0
    ? result.identifiers.map(i => `${i.type.toUpperCase()}: ${i.value}`).join(', ')
    : 'None';

  lastResultDiv.className = className;
  lastResultDiv.innerHTML = `
    <h2>Last result</h2>
    <div class="result-item">
      <span class="result-label">Status:</span>
      ${isSuccess ? 'Success' : 'Failed'}
    </div>
    ${result.method ? `
      <div class="result-item">
        <span class="result-label">Method:</span>
        ${result.method}
      </div>
    ` : ''}
    <div class="result-item">
      <span class="result-label">Identifiers:</span>
      ${identifiersStr}
    </div>
    ${result.casaTokenDetected ? `
      <div class="result-item">
        <span class="result-label">CASA token:</span>
        Detected
      </div>
    ` : ''}
    ${result.error ? `
      <div class="result-item">
        <span class="result-label">Error:</span>
        ${result.error}
      </div>
    ` : ''}
  `;
}

// Initialize
init();
