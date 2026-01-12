# Yuque Background Color Customizer

A Chrome Extension to customize the background color of Yuque (https://www.yuque.com/) pages.

## Features
- Choose any background color via the popup.
- Automatically saves and applies your preference.
- Works on all Yuque subpages.
- Immediate preview when changing color.

## Installation (Developer Mode)

1.  Clone or download this repository to a folder (e.g., `yq-bg-color`).
    - Ensure you have the following files: `manifest.json`, `popup.html`, `popup.js`, `content.js`.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click **Load unpacked** in the top left.
5.  Select the `yq-bg-color` folder.
6.  The extension should now be installed and active.

## Usage
1.  Go to any [Yuque](https://www.yuque.com/) page.
2.  Click the extension icon in the toolbar.
3.  Select a color from the picker.
4.  The page background will update immediately.

## File Structure
- `manifest.json`: Extension configuration.
- `popup.html` & `popup.js`: The user interface for selecting colors.
- `content.js`: The script that injects styles into Yuque pages.
