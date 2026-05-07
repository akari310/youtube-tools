import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update preset theme background application to respect background image
content = content.replace(
    'body, ytmusic-app { background: ${selectedTheme.gradient} !important; }',
    'body, ytmusic-app { background: ${localStorage.getItem(\'backgroundImage\') ? \'transparent\' : selectedTheme.gradient} !important; }'
)

# 2. Update custom theme background application to respect background image
content = content.replace(
    'body, ytmusic-app { background: ${settings.bgColorPicker} !important; }',
    'body, ytmusic-app { background: ${localStorage.getItem(\'backgroundImage\') ? \'transparent\' : settings.bgColorPicker} !important; }'
)

# 3. Enhance applyPageBackground to ensure it clears the background color if an image is set
content = content.replace(
    'background-image: url("${url}") !important;',
    'background-image: url("${url}") !important;\n        background-color: transparent !important;'
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
