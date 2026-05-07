
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a specific style for the Guide to give it depth
sidebar_css = """          /* Sidebar (Guide) Depth Fix */
          ytd-guide-renderer, 
          #guide-content.ytd-guide-renderer,
          ytd-mini-guide-renderer,
          #contentContainer.ytd-app[opened] {
            background: rgba(0,0,0,0.15) !important;
            backdrop-filter: blur(12px) !important;
            border-right: 1px solid rgba(255,255,255,0.05) !important;
          }"""

if sidebar_css not in content:
    # Inject it after the transparent list
    marker = "#content.ytd-app { \n            background: transparent !important; \n          }"
    if marker in content:
        new_content = content.replace(marker, marker + "\n\n" + sidebar_css)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("SUCCESS: Added sidebar depth styles.")
    else:
        print("FAILED: Could not find marker for sidebar injection.")
else:
    print("ALREADY APPLIED: Sidebar depth styles.")
