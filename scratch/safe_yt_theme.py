import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean up ALL previous experimental YT CSS blocks
# We'll look for the block starting with 'html, body {' and replace it with a clean version

safe_yt_fix = """          /* Safe & Clean YouTube Theme */
          ytd-app {
            background-color: #0f0f0f !important;
            background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
            background-size: cover !important;
            background-attachment: fixed !important;
          }
          #masthead-container.ytd-app {
            background: ${selectedTheme.gradient} !important;
          }
          #page-manager.ytd-app, ytd-browse, ytd-watch-flexy, 
          #guide-content.ytd-guide-renderer, ytd-mini-guide-renderer,
          #chips-wrapper.ytd-feed-filter-chip-bar-renderer,
          #scroll-container.ytd-feed-filter-chip-bar-renderer {
            background: transparent !important;
          }
          yt-chip-cloud-chip-renderer {
            background: rgba(255,255,255,0.05) !important;
            border-radius: 8px !important;
          }"""

# Find the start of our mess and replace it
# It usually starts after the YTM check

import re
pattern = re.compile(r'html, body \{.*?ytd-engagement-panel-section-list-renderer \{ background: transparent !important; \}', re.DOTALL)
content = pattern.sub(safe_yt_fix, content)

# Also ensure no stray #frosted-glass or overlap fixes remain
content = content.replace('ytd-engagement-panel-section-list-renderer, #frosted-glass { background: transparent !important; }', '')

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
