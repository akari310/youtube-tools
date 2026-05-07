
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Refine Shorts Navigation centering logic
# We force the container to take full height and center its children
old_logic = """          /* Improve Shorts Navigation: Center 'Next' button if it's the first Short */
          .navigation-container.ytd-shorts {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 12px !important;
          }"""

new_logic = """          /* Improve Shorts Navigation: Center 'Next' button if it's the first Short */
          .navigation-container.ytd-shorts {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 12px !important;
            height: 100% !important;
            top: 0 !important;
            bottom: 0 !important;
            margin: 0 !important;
          }
          .navigation-button.ytd-shorts {
            margin: 0 !important;
          }"""

if old_logic in content:
    new_content = content.replace(old_logic, new_logic)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Refined Shorts navigation centering logic.")
else:
    print("FAILED: Could not find the old logic block.")
