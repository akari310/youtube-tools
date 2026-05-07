import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Neutralize #frosted-glass
content = content.replace(
    '#header.ytd-rich-grid-renderer { background: transparent !important; }',
    '#header.ytd-rich-grid-renderer, #frosted-glass { background: transparent !important; }'
)

# Also ensure it doesn't show up in any other list
content = content.replace(
    'ytd-engagement-panel-section-list-renderer { background: rgba(0,0,0,0.2) !important; }',
    'ytd-engagement-panel-section-list-renderer, #frosted-glass { background: transparent !important; }'
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
