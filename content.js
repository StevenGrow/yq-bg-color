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

    // Use more specific selectors to override Yuque's deep nesting
    // We use attribute selectors [class*="..."] to match CSS modules classes that have random suffixes
    styleEl.textContent = `
    /* Global containers */
    body,
    .lark,
    #lark-container,
    .layout-container,
    #react-root,
    [class*="ReaderLayout-module_wrapper"],
    [class*="BasicLayout-module_wrapper"] {
      background-color: ${color} !important;
      background: ${color} !important;
    }

    /* Document paper/content wrappers */
    [class*="BookReader-module_wrapper"],
    [class*="DocReader-module_wrapper"],
    [class*="Article-module_article"],
    .ne-viewer-body,
    .ne-engine-view {
      background-color: ${color} !important;
    }

    /* Make sidebars and panels transparent to let the background show through */
    /* Or color them if they need to match */
    [class*="ReaderLayout-module_aside"],
    [class*="sidePanel-module_panel"],
    [class*="Catalog-module_container"],
    .yuque-layout-sidebar {
      background-color: transparent !important;
    }
    
    /* Ensure text contrast isn't totally lost (optional, but good for safety) */
    /* This is risky if the user picks dark blue, but for light colors it's fine. */
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
