import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add #mini-guide-background to transparency list
content = content.replace(
    'ytmusic-app-layout { background: transparent !important; }',
    'ytmusic-app-layout, #mini-guide-background { background: transparent !important; }'
)

# Also neutralize any other guide backgrounds
content = content.replace(
    'ytmusic-header-renderer [id="background"], .immersive-background',
    'ytmusic-header-renderer [id="background"], #mini-guide-background, #guide-spacer, .immersive-background'
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
