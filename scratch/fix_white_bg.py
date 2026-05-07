import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update preset theme background logic to be safe and unified
old_preset_bg = 'body, ytmusic-app { background: ${localStorage.getItem(\'backgroundImage\') ? \'transparent\' : selectedTheme.gradient} !important; }'
new_preset_bg = """body, ytmusic-app { 
                background-color: #030303 !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }"""
content = content.replace(old_preset_bg, new_preset_bg)

# 2. Update custom theme background logic
old_custom_bg = 'body, ytmusic-app { background: ${localStorage.getItem(\'backgroundImage\') ? \'transparent\' : settings.bgColorPicker} !important; }'
new_custom_bg = """body, ytmusic-app { 
                background-color: #030303 !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : 'none'} !important;
                background-color: ${localStorage.getItem('backgroundImage') ? 'transparent' : settings.bgColorPicker} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }"""
content = content.replace(old_custom_bg, new_custom_bg)

# 3. Fix applyPageBackground to not interfere with the main app if possible, or just be a fallback
# Actually, I'll make applyPageBackground just trigger a theme refresh if it's called
# But for now, let's just make it set background-color to black if url is null

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
