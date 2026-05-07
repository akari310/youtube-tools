import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the overlap_fix block
overlap_fix = """          ytd-feed-filter-chip-bar-renderer { 
            position: sticky !important;
            top: var(--ytd-masthead-height, 56px) !important;
            z-index: 1001 !important;
            background: transparent !important;
            display: block !important;
            margin-bottom: 8px !important;
          }
          #scroll-container.ytd-feed-filter-chip-bar-renderer {
            background: transparent !important;
          }
          ytd-rich-grid-renderer {
            padding-top: 12px !important;
          }
          #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
            background: transparent !important;
            border-bottom: none !important;
          }
          /* Ensure the content starts below the chip bar */
          ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer {
            margin-top: 8px !important;
          }"""

content = content.replace(overlap_fix, '')

# Remove #frosted-glass from other lists
content = content.replace(', #frosted-glass', '')

# Ensure the YT aggressive fix is still sane but without the breaking parts
content = content.replace(
    'ytd-app, #page-manager.ytd-app, ytd-page-manager, ytd-browse, ytd-watch-flexy, #columns.ytd-watch-flexy, #primary.ytd-watch-flexy, #secondary.ytd-watch-flexy, #contentContainer.ytd-app, ytd-guide-renderer, #guide-content.ytd-guide-renderer, ytd-mini-guide-renderer, ytd-mini-guide-entry-renderer, #guide-inner-content.ytd-guide-renderer, ytd-guide-section-renderer, ytd-guide-entry-renderer, ytd-compact-link-renderer, ytd-compact-video-renderer, yt-chip-cloud-chip-renderer, iron-selector#chips, #header.ytd-browse, #header.ytd-rich-grid-renderer',
    'ytd-app, #page-manager.ytd-app, ytd-page-manager, ytd-browse, ytd-watch-flexy, #columns.ytd-watch-flexy, #primary.ytd-watch-flexy, #secondary.ytd-watch-flexy, #contentContainer.ytd-app, ytd-guide-renderer, #guide-content.ytd-guide-renderer, ytd-mini-guide-renderer, ytd-mini-guide-entry-renderer, #guide-inner-content.ytd-guide-renderer, ytd-guide-section-renderer, ytd-guide-entry-renderer, yt-chip-cloud-chip-renderer, iron-selector#chips, #header.ytd-browse, #header.ytd-rich-grid-renderer'
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
