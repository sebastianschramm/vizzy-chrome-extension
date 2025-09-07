document.addEventListener('DOMContentLoaded', async function() {
  const form = document.getElementById('settingsForm');
  const statusMessage = document.getElementById('statusMessage');
  const googleApiKeyInput = document.getElementById('googleApiKey');
  const elevenlabsApiKeyInput = document.getElementById('elevenlabsApiKey');
  const googleKeyStatus = document.getElementById('googleKeyStatus');
  const elevenlabsKeyStatus = document.getElementById('elevenlabsKeyStatus');

  // Load existing settings
  await loadSettings();

  // Form submission handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    await saveSettings();
  });

  // Real-time validation as user types
  googleApiKeyInput.addEventListener('input', updateKeyStatus);
  elevenlabsApiKeyInput.addEventListener('input', updateKeyStatus);
});

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['googleApiKey', 'elevenlabsApiKey']);
    
    if (result.googleApiKey) {
      document.getElementById('googleApiKey').value = result.googleApiKey;
    }
    
    if (result.elevenlabsApiKey) {
      document.getElementById('elevenlabsApiKey').value = result.elevenlabsApiKey;
    }
    
    updateKeyStatus();
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading saved settings', 'error');
  }
}

async function saveSettings() {
  const googleApiKey = document.getElementById('googleApiKey').value.trim();
  const elevenlabsApiKey = document.getElementById('elevenlabsApiKey').value.trim();
  
  // Validate required fields
  if (!googleApiKey) {
    showStatus('Google API key is required', 'error');
    return;
  }
  
  try {
    const settings = {
      googleApiKey: googleApiKey,
      elevenlabsApiKey: elevenlabsApiKey || null
    };
    
    await chrome.storage.sync.set(settings);
    
    updateKeyStatus();
    showStatus('Settings saved successfully!', 'success');
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      showStatus('Ready to make graphs accessible', 'info');
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings. Please try again.', 'error');
  }
}

async function clearSettings() {
  if (confirm('Are you sure you want to clear all API keys?')) {
    try {
      await chrome.storage.sync.clear();
      
      document.getElementById('googleApiKey').value = '';
      document.getElementById('elevenlabsApiKey').value = '';
      
      updateKeyStatus();
      showStatus('All settings cleared', 'info');
      
    } catch (error) {
      console.error('Error clearing settings:', error);
      showStatus('Error clearing settings', 'error');
    }
  }
}

function updateKeyStatus() {
  const googleApiKey = document.getElementById('googleApiKey').value.trim();
  const elevenlabsApiKey = document.getElementById('elevenlabsApiKey').value.trim();
  const googleKeyStatus = document.getElementById('googleKeyStatus');
  const elevenlabsKeyStatus = document.getElementById('elevenlabsKeyStatus');
  
  // Update Google API key status
  if (googleApiKey) {
    googleKeyStatus.className = 'key-status configured';
    googleKeyStatus.querySelector('span').textContent = 'Configured';
  } else {
    googleKeyStatus.className = 'key-status';
    googleKeyStatus.querySelector('span').textContent = 'Not configured';
  }
  
  // Update ElevenLabs API key status
  if (elevenlabsApiKey) {
    elevenlabsKeyStatus.className = 'key-status configured';
    elevenlabsKeyStatus.querySelector('span').textContent = 'Configured (audio enabled)';
  } else {
    elevenlabsKeyStatus.className = 'key-status';
    elevenlabsKeyStatus.querySelector('span').textContent = 'Not configured (audio with Gemini)';
  }
}

function showStatus(message, type) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
}

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const button = field.nextElementSibling;
  
  if (field.type === 'password') {
    field.type = 'text';
    button.textContent = 'Hide';
  } else {
    field.type = 'password';
    button.textContent = 'Show';
  }
}

// Utility function to mask API keys for display
function maskApiKey(key) {
  if (!key || key.length < 8) return key;
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}