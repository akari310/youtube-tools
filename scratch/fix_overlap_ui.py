import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Overlapping Chip Bar and Video Grid
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

# Replace the previous chip_bar_fix block
old_chip_fix = """          ytd-feed-filter-chip-bar-renderer { 
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

content = content.replace(old_chip_fix, overlap_fix)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Done")
