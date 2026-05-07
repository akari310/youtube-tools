
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add addIcon() to yt-navigate-finish listener to ensure it persists on SPA navigation
old_listener = """document.addEventListener('yt-navigate-finish', () => {
  if (!document.location.href.includes('watch')) {
    hideCanvas();
  }
  scheduleApplySettings();"""

new_listener = """document.addEventListener('yt-navigate-finish', () => {
  // Re-inject gear icon if it was lost during navigation
  if (typeof addIcon === 'function') {
    addIcon();
  }
  
  if (!document.location.href.includes('watch')) {
    hideCanvas();
  }
  scheduleApplySettings();"""

if old_listener in content:
    new_content = content.replace(old_listener, new_listener)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Added addIcon() to yt-navigate-finish listener.")
else:
    print("FAILED: Could not find the yt-navigate-finish listener.")
