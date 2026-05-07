
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the chip bar block with a more restricted one
old_block = """          /* Fix for Chip Bar Overlap: Ensure it has proper z-index and background */
          #header.ytd-rich-grid-renderer, 
          ytd-feed-filter-chip-bar-renderer {
            background: transparent !important;
            z-index: 2010 !important;
          }

          /* Restore readability for chip bar background if needed */
          #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
             background: ${selectedTheme.gradient}cc !important; /* cc = ~80% opacity */
             backdrop-filter: blur(8px) !important;
             border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          }"""

new_block = """          /* Fix for Chip Bar Overlap and Sidebar Bleed */
          #header.ytd-rich-grid-renderer {
            background: ${selectedTheme.gradient}cc !important;
            backdrop-filter: blur(8px) !important;
            z-index: 2010 !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          }

          #chips-wrapper.ytd-feed-filter-chip-bar-renderer,
          ytd-feed-filter-chip-bar-renderer {
             background: transparent !important;
             backdrop-filter: none !important;
          }"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Restricted chip bar background to grid header.")
else:
    print("FAILED: Could not find the exact CSS block to replace.")
