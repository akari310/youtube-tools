
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\15_function_parsecounttext_text.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update addIcon to check if it's actually in the DOM and add a persistent interval
old_add_icon = """  function addIcon() {
    if ($id('icon-menu-settings')) return;

    let anchor;"""

new_add_icon = """  function addIcon() {
    const existing = $id('icon-menu-settings');
    if (existing && document.body.contains(existing)) return;
    if (existing) existing.closest('#toggle-button')?.remove();

    let anchor;"""

# Add the interval at the bottom of the script
interval_code = """
  // Persistent check to ensure the gear icon survives YouTube's dynamic UI updates
  setInterval(addIcon, 2000);
"""

if old_add_icon in content:
    new_content = content.replace(old_add_icon, new_add_icon)
    # Append the interval code if not already present
    if "setInterval(addIcon, 2000)" not in new_content:
        new_content += interval_code
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Made addIcon persistent with a 2-second interval.")
else:
    print("FAILED: Could not find addIcon definition.")
