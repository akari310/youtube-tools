
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

# We want to replace the block from "html, body {" to the end of the dynamic CSS injection for YT
# Specifically, we want to target the block starting at line 768 to around 783

start_marker = '          html, body { \n'
end_marker = '          ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }\n'

found_start = False
found_end = False

for i, line in enumerate(lines):
    if not found_start and 'html, body {' in line and 'background-color: #0f0f0f !important;' in lines[i+1]:
        found_start = True
        skip = True
        # Inject the new clean CSS
        new_lines.append("""          html, body { 
            background-color: #0f0f0f !important;
            background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
          }

          /* Keep app containers transparent to show the body background */
          ytd-app, 
          ytd-page-manager, 
          ytd-browse, 
          ytd-watch-flexy, 
          #columns.ytd-watch-flexy, 
          #primary.ytd-watch-flexy, 
          #secondary.ytd-watch-flexy, 
          #contentContainer.ytd-app,
          ytd-guide-renderer,
          #guide-content.ytd-guide-renderer,
          ytd-mini-guide-renderer,
          ytd-mini-guide-entry-renderer,
          #guide-inner-content.ytd-guide-renderer,
          ytd-guide-section-renderer,
          ytd-guide-entry-renderer,
          ytd-rich-grid-renderer,
          #content.ytd-app { 
            background: transparent !important; 
          }

          /* Stabilize Header & Chip Bar Layout */
          #masthead-container.ytd-app { 
            background: ${selectedTheme.gradient} !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
            z-index: 2020 !important;
          }

          /* Fix for Chip Bar Overlap: Ensure it has proper z-index and background */
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
          }

          /* Handle frosted-glass if it exists - don't hide it, but make it fit the theme */
          #frosted-glass.ytd-app {
            background: ${selectedTheme.gradient}40 !important; /* very subtle purple tint */
            backdrop-filter: blur(12px) !important;
            z-index: 2005 !important;
          }

          ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }
""")
        continue
    
    if skip:
        if 'ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }' in line:
            skip = False
            found_end = True
        continue
    
    new_lines.append(line)

if found_start and found_end:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("SUCCESS: Patched YouTube Royal Purple theme with stable layout.")
else:
    print(f"FAILED: Could not find markers. found_start={found_start}, found_end={found_end}")
