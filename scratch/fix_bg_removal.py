
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the remove background image handler to trigger settings update
old_handler = """      if (e.isTrusted === false) return;
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
      localStorage.removeItem('backgroundImage');
      removeBtn.style.display = 'none';
      applyPageBackground(null);"""

new_handler = """      if (e.isTrusted === false) return;
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
      localStorage.removeItem('backgroundImage');
      removeBtn.style.display = 'none';
      applyPageBackground(null);
      // Force theme refresh to remove image from dynamic CSS
      if (typeof scheduleApplySettings === 'function') {
        scheduleApplySettings();
      }"""

if old_handler in content:
    new_content = content.replace(old_handler, new_handler)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Patched background removal to trigger settings update.")
else:
    print("FAILED: Could not find the background removal handler.")
