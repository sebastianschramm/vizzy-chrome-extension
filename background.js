chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "makeAccessible",
    title: "Make graph accessible",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "makeAccessible") {
    try {
      // Get API keys from storage
      const result = await chrome.storage.sync.get(['googleApiKey', 'elevenlabsApiKey']);
      
      if (!result.googleApiKey) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showErrorModal,
          args: ["Google API key not set. Please configure your API keys in the extension popup."]
        });
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showLoadingModal
      });

      const requestBody = {
        imageUrl: info.srcUrl,
        googleApiKey: result.googleApiKey,
        elevenlabsApiKey: result.elevenlabsApiKey || null
      };

      const response = await fetch("http://localhost:8000/process", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.accessibleImage || !data.description) {
        throw new Error("Invalid response from server");
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showResults,
        args: [data, info.srcUrl]
      });

    } catch (error) {
      console.error("Extension error:", error);
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showErrorModal,
        args: [error.message]
      });
    }
  }
});

function showLoadingModal() {
  const existingModal = document.getElementById('accessibility-modal-overlay');
  if (existingModal) existingModal.remove();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'accessibility-modal-overlay';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.7) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(4px) !important;
    animation: fadeIn 0.2s ease-out !important;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #ffffff !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;
    color: #1f2937 !important;
    width: 400px !important;
    overflow: hidden !important;
    transform: scale(0.9) !important;
    animation: modalEnter 0.3s ease-out forwards !important;
  `;
  
  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalEnter {
        to { transform: scale(1); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; color: white !important; padding: 24px !important; text-align: center !important;">
      <div style="width: 48px !important; height: 48px !important; margin: 0 auto 16px !important; border: 3px solid rgba(255,255,255,0.3) !important; border-top: 3px solid white !important; border-radius: 50% !important; animation: spin 1s linear infinite !important;"></div>
      <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important;">Processing Image</h3>
      <p style="margin: 8px 0 0 !important; opacity: 0.9 !important; font-size: 14px !important;">Making your graph accessible...</p>
      <p style="margin: 8px 0 0 !important; opacity: 0.7 !important; font-size: 12px !important;">This may take up to 5 minutes. Please wait...</p>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showErrorModal(errorMessage) {
  const existingModal = document.getElementById('accessibility-modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'accessibility-modal-overlay';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.7) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(4px) !important;
    animation: fadeIn 0.2s ease-out !important;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #ffffff !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;
    color: #1f2937 !important;
    width: 450px !important;
    max-width: 90vw !important;
    overflow: hidden !important;
    transform: scale(0.9) !important;
    animation: modalEnter 0.3s ease-out forwards !important;
  `;
  
  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalEnter {
        to { transform: scale(1); }
      }
    </style>
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important; color: white !important; padding: 24px !important; text-align: center !important;">
      <div style="width: 48px !important; height: 48px !important; margin: 0 auto 16px !important; background: rgba(255,255,255,0.2) !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 24px !important;">!</div>
      <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important;">Processing Failed</h3>
    </div>
    <div style="padding: 24px !important;">
      <p style="margin: 0 0 16px !important; font-weight: 500 !important;">Unable to process the image:</p>
      <div style="background: #fef2f2 !important; border: 1px solid #fecaca !important; border-radius: 8px !important; padding: 16px !important; font-size: 14px !important; color: #dc2626 !important; word-break: break-word !important; font-family: ui-monospace, monospace !important;">${errorMessage}</div>
      <div style="text-align: center !important; margin-top: 24px !important;">
        <button onclick="document.getElementById('accessibility-modal-overlay').remove()" style="background: #ef4444 !important; color: white !important; border: none !important; padding: 12px 24px !important; border-radius: 8px !important; cursor: pointer !important; font-size: 14px !important; font-weight: 500 !important; transition: all 0.2s !important;">OK</button>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showResults(data, originalImageUrl) {
  try {
    const { accessibleImage, description, narrationURL } = data;
    
    const existingModal = document.getElementById('accessibility-modal-overlay');
    if (existingModal) existingModal.remove();

    // Create overlay with backdrop
    const overlay = document.createElement('div');
    overlay.id = 'accessibility-modal-overlay';
    overlay.style.cssText = `
      position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important;
      height: 100vh !important; background: rgba(0, 0, 0, 0.7) !important; z-index: 2147483647 !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      backdrop-filter: blur(4px) !important; animation: fadeIn 0.2s ease-out !important;
      padding: 20px !important; box-sizing: border-box !important;
    `;

    const modal = document.createElement('div');
    modal.id = 'accessibility-modal';
    modal.style.cssText = `
      background: #ffffff !important; border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;
      color: #1f2937 !important; width: 100% !important; max-width: 700px !important;
      max-height: 90vh !important; overflow: hidden !important; transform: scale(0.9) !important;
      animation: modalEnter 0.3s ease-out forwards !important; display: flex !important;
      flex-direction: column !important; position: relative !important;
    `;
    
    modal.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalEnter { to { transform: scale(1); } }
        .resize-handle { 
          position: absolute !important; bottom: 0 !important; right: 0 !important; width: 20px !important; 
          height: 20px !important; cursor: nw-resize !important; 
          background: linear-gradient(-45deg, transparent 0%, transparent 30%, #cbd5e1 30%, #cbd5e1 35%, transparent 35%, transparent 65%, #cbd5e1 65%, #cbd5e1 70%, transparent 70%) !important;
          z-index: 10 !important;
        }
        .modal-header { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important; color: white !important; 
          padding: 20px 24px !important; cursor: move !important; user-select: none !important; 
          display: flex !important; justify-content: space-between !important; align-items: center !important; 
        }
        .modal-content { flex: 1 !important; overflow-y: auto !important; padding: 24px !important; }
        .control-btn { 
          background: rgba(255, 255, 255, 0.2) !important; border: none !important; color: white !important; 
          width: 32px !important; height: 32px !important; border-radius: 8px !important; cursor: pointer !important; 
          font-size: 16px !important; font-weight: 600 !important; transition: all 0.2s !important; 
          display: flex !important; align-items: center !important; justify-content: center !important; 
        }
        .control-btn:hover { background: rgba(255, 255, 255, 0.3) !important; transform: scale(1.1) !important; }
        .action-btn { 
          background: #3b82f6 !important; color: white !important; border: none !important; padding: 10px 20px !important; 
          border-radius: 8px !important; cursor: pointer !important; font-size: 14px !important; font-weight: 500 !important; 
          transition: all 0.2s !important; 
        }
        .action-btn:hover { background: #2563eb !important; transform: translateY(-1px) !important; }
        .toggle-btn { 
          background: #10b981 !important; color: white !important; border: none !important; padding: 8px 16px !important; 
          border-radius: 6px !important; cursor: pointer !important; font-size: 12px !important; font-weight: 500 !important; 
          transition: all 0.2s !important; margin-bottom: 16px !important; 
        }
        .toggle-btn:hover { background: #059669 !important; transform: translateY(-1px) !important; }
        .toggle-btn.original { background: #f59e0b !important; }
        .toggle-btn.original:hover { background: #d97706 !important; }
      </style>
      <div class="modal-header">
        <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important;">Accessible Graph Results</h3>
        <div style="display: flex !important; gap: 8px !important;">
          <button id="acc-btn-maximize" class="control-btn" title="Maximize">▢</button>
          <button id="acc-btn-close" class="control-btn" title="Close">×</button>
        </div>
      </div>
      <div class="modal-content">
        <div style="text-align: center !important; margin-bottom: 24px !important;">
          <button id="acc-btn-toggle" class="toggle-btn">Show Original</button>
          <div>
            <img id="acc-display-image" src="${accessibleImage}" alt="Accessible version of the graph" style="max-width: 100% !important; height: auto !important; border-radius: 12px !important; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important; transition: transform 0.2s !important;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" />
          </div>
        </div>
        ${narrationURL ? `<div style="margin-bottom: 24px !important;">
            <h4 style="margin: 0 0 12px !important; font-size: 16px !important; font-weight: 600 !important; color: #3b82f6 !important;">Audio Narration</h4>
            <audio controls style="width: 100% !important; height: 48px !important; border-radius: 8px !important;"><source src="${narrationURL}" type="audio/mpeg">Your browser does not support the audio element.</audio>
          </div>` : ''}
          <div style="margin-bottom: 24px !important;">
          <h4 style="margin: 0 0 12px !important; font-size: 16px !important; font-weight: 600 !important; color: #3b82f6 !important;">Description</h4>
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important; border-left: 4px solid #3b82f6 !important; padding: 20px !important; border-radius: 8px !important; line-height: 1.7 !important; font-size: 14px !important; color: #374151 !important;">${description}</div>
        </div>
        <div style="border-top: 1px solid #e5e7eb !important; padding-top: 20px !important; display: flex !important; gap: 12px !important; flex-wrap: wrap !important;">
          <button id="acc-btn-download" class="action-btn">Download Image</button>
          <button id="acc-btn-copy" class="action-btn">Copy Description</button>
        </div>
      </div>
      <div class="resize-handle"></div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Image toggle functionality
    let showingAccessible = true;
    const displayImage = modal.querySelector('#acc-display-image');
    const toggleBtn = modal.querySelector('#acc-btn-toggle');

    toggleBtn.addEventListener('click', () => {
      if (showingAccessible) {
        // Switch to original image
        displayImage.src = originalImageUrl;
        displayImage.alt = "Original graph image";
        toggleBtn.textContent = "Show Accessible";
        toggleBtn.classList.add('original');
        showingAccessible = false;
      } else {
        // Switch to accessible image
        displayImage.src = accessibleImage;
        displayImage.alt = "Accessible version of the graph";
        toggleBtn.textContent = "Show Original";
        toggleBtn.classList.remove('original');
        showingAccessible = true;
      }
    });

    // Add event listeners for other controls
    modal.querySelector('#acc-btn-maximize').addEventListener('click', () => {
      const isMaximized = modal.style.width === '95vw';
      if (isMaximized) {
        modal.style.width = '700px';
        modal.style.height = 'auto';
        modal.style.maxWidth = '700px';
        modal.style.maxHeight = '90vh';
      } else {
        modal.style.width = '95vw';
        modal.style.height = '95vh';
        modal.style.maxWidth = 'none';
        modal.style.maxHeight = 'none';
      }
    });

    modal.querySelector('#acc-btn-close').addEventListener('click', () => overlay.remove());

    // Download functionality - always downloads the currently displayed image
    modal.querySelector('#acc-btn-download').addEventListener('click', async () => {
      try {
        const currentImageSrc = displayImage.src;
        const response = await fetch(currentImageSrc);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        // Set filename based on which image is currently showing
        link.download = showingAccessible ? 'accessible-graph.avif' : 'original-graph.avif';
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download image: ", err);
        showErrorModal("Failed to download image: " + err.message);
      }
    });

    modal.querySelector('#acc-btn-copy').addEventListener('click', (event) => {
      navigator.clipboard.writeText(description).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '#3b82f6';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });

    setupModalControls(modal, overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

  } catch (error) {
    console.error("Error displaying results:", error);
    showErrorModal("Failed to display results: " + error.message);
  }
}

function setupModalControls(modal, overlay) {
  const header = modal.querySelector('.modal-header');
  const resizeHandle = modal.querySelector('.resize-handle');
  
  let isDragging = false;
  let isResizing = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // IMMEDIATELY convert modal to fixed positioning to avoid flexbox issues
  function convertToFixedPositioning() {
    const rect = modal.getBoundingClientRect();
    modal.style.position = 'fixed !important';
    modal.style.top = rect.top + 'px';
    modal.style.left = rect.left + 'px'; 
    modal.style.margin = '0';
    modal.style.transform = 'none';
    
    // Change overlay to not use flexbox
    overlay.style.display = 'block';
    overlay.style.alignItems = 'unset';
    overlay.style.justifyContent = 'unset';
  }

  // Convert immediately on setup
  convertToFixedPositioning();

  // Dragging functionality
  header.addEventListener('mousedown', (e) => {
    // Ignore clicks on control buttons
    if (e.target.classList.contains('control-btn') || e.target.closest('.control-btn')) {
      return;
    }
    
    isDragging = true;
    e.preventDefault();
    
    const rect = modal.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // Add some visual feedback
    header.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    function handleMouseMove(e) {
      if (!isDragging) return;
      
      let newX = e.clientX - dragOffsetX;
      let newY = e.clientY - dragOffsetY;
      
      // Keep within viewport bounds
      const modalRect = modal.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, window.innerWidth - modalRect.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - modalRect.height));
      
      modal.style.left = newX + 'px';
      modal.style.top = newY + 'px';
    }

    function handleMouseUp() {
      isDragging = false;
      header.style.cursor = 'move';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  // Resizing functionality  
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = modal.getBoundingClientRect();
    const startWidth = startRect.width;
    const startHeight = startRect.height;

    function handleMouseMove(e) {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = Math.max(400, startWidth + deltaX);
      let newHeight = Math.max(300, startHeight + deltaY);
      
      // Don't let modal go off screen
      const currentRect = modal.getBoundingClientRect();
      const maxWidth = window.innerWidth - currentRect.left;
      const maxHeight = window.innerHeight - currentRect.top;
      
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
      
      modal.style.width = newWidth + 'px';
      modal.style.height = newHeight + 'px';
      modal.style.maxWidth = 'none';
      modal.style.maxHeight = 'none';
    }

    function handleMouseUp() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
}