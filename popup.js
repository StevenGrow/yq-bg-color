document.addEventListener('DOMContentLoaded', () => {
  const colorInput = document.getElementById('bgColor');
  const status = document.getElementById('status');

  // Load saved color
  chrome.storage.sync.get(['yuqueBgColor'], (result) => {
    if (result.yuqueBgColor) {
      colorInput.value = result.yuqueBgColor;
    }
  });

  // Save color on change
  colorInput.addEventListener('input', () => {
    const color = colorInput.value;
    
    // Save to storage
    chrome.storage.sync.set({ yuqueBgColor: color }, () => {
      // Show saved status
      status.classList.add('show');
      setTimeout(() => {
        status.classList.remove('show');
      }, 750);
    });
  });
});
