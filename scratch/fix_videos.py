import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broad display: none
# We want to keep display: none only for .immersive-background and ytmusic-fullbleed-thumbnail-renderer[is-background]
# And remove the dangerous .ytmusic-header-renderer #header selector

dangerous_selector = '.ytmusic-header-renderer #header,'
if dangerous_selector in content:
    content = content.replace(dangerous_selector, '')
    print("Removed dangerous header selector")

# Separate the display: none from the background: transparent block
content = content.replace(
    'display: none !important;\n              }',
    '}\n              .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {\n                display: none !important;\n              }'
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
