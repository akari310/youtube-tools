import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Aggressive neutralization for regular YouTube
aggressive_yt_fix = """          ytd-masthead, #masthead-container.ytd-app, #background.ytd-masthead, #container.ytd-masthead { background: transparent !important; }
          ytd-app, #page-manager.ytd-app, ytd-guide-renderer, #guide-content.ytd-guide-renderer, #contentContainer.ytd-app, ytd-mini-guide-renderer, ytd-mini-guide-entry-renderer, #guide-inner-content.ytd-guide-renderer { background: transparent !important; }
          ytd-browse, ytd-watch-flexy, #columns.ytd-watch-flexy, #primary.ytd-watch-flexy, #secondary.ytd-watch-flexy { background: transparent !important; }
          yt-chip-cloud-chip-renderer, iron-selector#chips { background: transparent !important; }
          ytd-searchbox[desktop-search-rework] #container.ytd-searchbox, #search-icon-legacy.ytd-searchbox { background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.15) !important; }
          ytd-guide-section-renderer, ytd-guide-entry-renderer, ytd-compact-link-renderer, ytd-compact-video-renderer { background: transparent !important; }
          #header.ytd-browse, #header.ytd-rich-grid-renderer { background: transparent !important; }
          
          /* Force theme on masthead */
          #masthead-container.ytd-app { 
            background: ${selectedTheme.gradient} !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
          }"""

# Replace the previous block with this more aggressive one
content = content.replace(
    "          ytd-masthead { background: ${selectedTheme.gradient} !important; }\n          ytd-guide-renderer, ytd-mini-guide-renderer, #guide-content.ytd-guide-renderer, #items.ytd-guide-section-renderer { background: transparent !important; }\n          #contentContainer.ytd-app, #page-manager.ytd-app, ytd-browse, ytd-watch-flexy { background: transparent !important; }\n          ytd-searchbox[desktop-search-rework] #container.ytd-searchbox { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; }\n          #search-icon-legacy.ytd-searchbox { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; }\n          ytd-engagement-panel-section-list-renderer { background: rgba(0,0,0,0.2) !important; }",
    aggressive_yt_fix
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
