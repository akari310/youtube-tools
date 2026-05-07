import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update regular YouTube theme application to be more robust and unified
old_yt_css = """          #shorts-container, #page-manager.ytd-app {
            background: ${selectedTheme.gradient.replace(/(#[0-9a-fA-F]{6})/g, '$136')};
          }"""

new_yt_css = """          #shorts-container, #page-manager.ytd-app, ytd-app {
            background-color: #0f0f0f !important;
            background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
          }
          ytd-masthead { background: ${selectedTheme.gradient} !important; }
          ytd-guide-renderer, ytd-mini-guide-renderer, #guide-content.ytd-guide-renderer, #items.ytd-guide-section-renderer { background: transparent !important; }
          #contentContainer.ytd-app, #page-manager.ytd-app, ytd-browse, ytd-watch-flexy { background: transparent !important; }
          ytd-searchbox[desktop-search-rework] #container.ytd-searchbox { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; }
          #search-icon-legacy.ytd-searchbox { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; }
          ytd-engagement-panel-section-list-renderer { background: rgba(0,0,0,0.2) !important; }"""

content = content.replace(old_yt_css, new_yt_css)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
