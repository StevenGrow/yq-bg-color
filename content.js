// Function to apply the background color
function applyBackgroundColor(color) {
    if (!color) return;

    // Create or update a style element to ensure priority
    let styleEl = document.getElementById('yuque-bg-customizer-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'yuque-bg-customizer-style';
        document.head.appendChild(styleEl);
    }

    // We target body and potentially other common containers just in case
    // override widely with !important
    styleEl.textContent = `
    body, 
    .yuque-layout-container, 
    .layout-container,
    #react-root {
      background-color: ${color} !important;
      background: ${color} !important;
    }
  `;
}

// 1. Initial Load
chrome.storage.sync.get(['yuqueBgColor'], (result) => {
    if (result.yuqueBgColor) {
        applyBackgroundColor(result.yuqueBgColor);
    }
});

// 2. Listen for changes from popup
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.yuqueBgColor) {
        applyBackgroundColor(changes.yuqueBgColor.newValue);
    }
});
