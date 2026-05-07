import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Chip Bar UI and Z-Index
chip_bar_fix = """          ytd-feed-filter-chip-bar-renderer { 
            background: transparent !important; 
            z-index: 1000 !important; 
          }
          #chips-wrapper.ytd-feed-filter-chip-bar-renderer { 
            background: transparent !important; 
          }
          yt-chip-cloud-chip-renderer {
            background: transparent !important;
          }
          .ytChipShapeChip {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          .ytChipShapeActive .ytChipShapeChip {
            background: ${selectedTheme.gradient} !important;
          }
          #frosted-glass {
            background: transparent !important;
            backdrop-filter: none !important;
          }"""

# Update the previous block
content = content.replace(
    '#header.ytd-rich-grid-renderer, #frosted-glass { background: transparent !important; }',
    '#header.ytd-rich-grid-renderer, #frosted-glass { background: transparent !important; }'
)

# I'll just add the chip_bar_fix block to the YT CSS section
content = content.replace(
    'ytd-engagement-panel-section-list-renderer, #frosted-glass { background: transparent !important; }',
    'ytd-engagement-panel-section-list-renderer, #frosted-glass { background: transparent !important; }\n' + chip_bar_fix
)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
