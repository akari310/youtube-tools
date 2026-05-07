import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Expanded selectors
old_selector = 'ytmusic-header-renderer [id="background"] {'
new_selector = 'ytmusic-header-renderer [id="background"], .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {'

if old_selector in content:
    content = content.replace(old_selector, new_selector)
    print("Replaced selectors")
else:
    print("Old selector not found")

# Add display: none to the neutralizing block
# We look for the block that starts with our new selector and add display: none to its properties
content = content.replace(
    'background: transparent !important;\n                background-image: none !important;',
    'background: transparent !important;\n                background-image: none !important;\n                display: none !important;'
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
