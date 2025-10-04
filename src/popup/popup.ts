import browser from '../adapters/browser';
import type { Message, MessageResponse, ProcessingResult, ExtensionConfig } from '../lib/types';

/**
 * Popup UI controller
 *
 * Manages the browser extension popup interface that appears when
 * clicking the toolbar icon. Allows users to:
 * - Select an access method
 * - Process the current page
 * - View the last processing result
 * - Open the options page
 */

// UI elements
const methodSelect = document.getElementById('method') as HTMLSelectElement;
const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
const optionsBtn = document.getElementById('options-btn') as HTMLButtonElement;
const lastResultDiv = document.getElementById('last-result') as HTMLDivElement;

/**
 * Initialise popup UI
 *
 * Loads configuration to filter available methods based on what's configured,
 * and displays the last processing result if available
 */
async function init() {
  // Load config to determine which access methods are available
  const configResponse = await sendMessage({ action: 'getConfig' });
  if (configResponse.success) {
    const config = configResponse.data as ExtensionConfig;

    // Remove options for unconfigured methods
    // This prevents users from selecting methods they haven't configured
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

    // Set default method if it's still available in the filtered list
    if (Array.from(methodSelect.options).some(opt => opt.value === config.defaultMethod)) {
      methodSelect.value = config.defaultMethod;
    }
  }

  // Load and display last result for user feedback
  const resultResponse = await sendMessage({ action: 'getLastResult' });
  if (resultResponse.success && resultResponse.data) {
    displayResult(resultResponse.data);
  }
}

/**
 * Send message to background script
 *
 * @param message - Message object with action and optional payload
 * @returns Response from background script
 */
async function sendMessage(message: Message): Promise<MessageResponse> {
  return await browser.runtime.sendMessage(message);
}

/**
 * Handle process button click
 *
 * Processes the current tab's URL through the selected access method
 * and navigates to the result. Also saves the selected method as the
 * new default for future use.
 */
processBtn.addEventListener('click', async () => {
  processBtn.disabled = true;
  processBtn.textContent = 'Processing...';

  try {
    // Get current tab URL
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (!currentTab.url) {
      alert('Cannot process this page');
      return;
    }

    // Update default method if user changed selection
    // This way their preference is remembered
    const selectedMethod = methodSelect.value;
    await sendMessage({
      action: 'setConfig',
      payload: { defaultMethod: selectedMethod },
    });

    // Process URL through selected access method
    const response = await sendMessage({
      action: 'processUrl',
      payload: { url: currentTab.url },
    });

    if (response.success && response.data) {
      const result = response.data as ProcessingResult;
      displayResult(result);

      // Navigate to result if successful
      if (result.success && result.finalUrl) {
        await browser.tabs.update(currentTab.id!, { url: result.finalUrl });
        window.close(); // Close popup after navigation
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

/**
 * Handle options button click
 *
 * Opens the extension options page for configuration
 */
optionsBtn.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
  window.close();
});

/**
 * Display processing result in popup
 *
 * Renders the processing result in a user-friendly format showing:
 * - Success/failure status
 * - Access method used
 * - Identified academic identifiers (DOI, ISBN, etc.)
 * - CASA token detection
 * - Error messages if applicable
 *
 * Uses DOM manipulation rather than innerHTML for security
 *
 * @param result - Processing result to display
 */
function displayResult(result: ProcessingResult) {
  const isSuccess = result.success;
  const className = isSuccess ? 'result success' : 'result error';

  // Format identifiers for display
  const identifiersStr = result.identifiers.length > 0
    ? result.identifiers.map(i => `${i.type.toUpperCase()}: ${i.value}`).join(', ')
    : 'None';

  lastResultDiv.className = className;

  // Clear and rebuild using DOM manipulation (safer than innerHTML)
  lastResultDiv.textContent = '';

  const heading = document.createElement('h2');
  heading.textContent = 'Last result';
  lastResultDiv.appendChild(heading);

  // Status indicator
  const statusDiv = document.createElement('div');
  statusDiv.className = 'result-item';
  const statusLabel = document.createElement('span');
  statusLabel.className = 'result-label';
  statusLabel.textContent = 'Status:';
  statusDiv.appendChild(statusLabel);
  statusDiv.appendChild(document.createTextNode(' ' + (isSuccess ? 'Success' : 'Failed')));
  lastResultDiv.appendChild(statusDiv);

  // Access method used (if available)
  if (result.method) {
    const methodDiv = document.createElement('div');
    methodDiv.className = 'result-item';
    const methodLabel = document.createElement('span');
    methodLabel.className = 'result-label';
    methodLabel.textContent = 'Method:';
    methodDiv.appendChild(methodLabel);
    methodDiv.appendChild(document.createTextNode(' ' + result.method));
    lastResultDiv.appendChild(methodDiv);
  }

  // Detected identifiers
  const identifiersDiv = document.createElement('div');
  identifiersDiv.className = 'result-item';
  const identifiersLabel = document.createElement('span');
  identifiersLabel.className = 'result-label';
  identifiersLabel.textContent = 'Identifiers:';
  identifiersDiv.appendChild(identifiersLabel);
  identifiersDiv.appendChild(document.createTextNode(' ' + identifiersStr));
  lastResultDiv.appendChild(identifiersDiv);

  // CASA token detection (if detected)
  if (result.casaTokenDetected) {
    const casaDiv = document.createElement('div');
    casaDiv.className = 'result-item';
    const casaLabel = document.createElement('span');
    casaLabel.className = 'result-label';
    casaLabel.textContent = 'CASA token:';
    casaDiv.appendChild(casaLabel);
    casaDiv.appendChild(document.createTextNode(' Detected'));
    lastResultDiv.appendChild(casaDiv);
  }

  // Error message (if present)
  if (result.error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'result-item';
    const errorLabel = document.createElement('span');
    errorLabel.className = 'result-label';
    errorLabel.textContent = 'Error:';
    errorDiv.appendChild(errorLabel);
    errorDiv.appendChild(document.createTextNode(' ' + result.error));
    lastResultDiv.appendChild(errorDiv);
  }
}

// Initialise popup on load
init();
