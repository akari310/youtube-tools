
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

found_start = False
found_end = False

for i, line in enumerate(lines):
    if not found_start and 'html, body {' in line and 'background-color: #0f0f0f !important;' in lines[i+1]:
        found_start = True
        skip = True
        # Inject the "Restored Stable" CSS
        new_lines.append("""          html, body { 
            background-color: #0f0f0f !important;
            background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
          }

          /* Minimal transparency to allow background to show */
          ytd-app, 
          #content.ytd-app, 
          #page-manager.ytd-app, 
          ytd-browse, 
          ytd-watch-flexy,
          ytd-two-column-browse-results-renderer,
          #primary.ytd-two-column-browse-results-renderer,
          #secondary.ytd-two-column-browse-results-renderer,
          ytd-rich-grid-renderer,
          #contents.ytd-rich-grid-renderer { 
            background: transparent !important; 
          }

          /* Use theme colors on major components without breaking layout */
          #masthead-container.ytd-app,
          #background.ytd-masthead { 
            background: ${selectedTheme.gradient} !important;
          }

          /* Revert chip bar to near-native but themed */
          #header.ytd-rich-grid-renderer,
          ytd-feed-filter-chip-bar-renderer,
          #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
            background: transparent !important;
          }

          /* Restore the 'frosted-glass' look but with the theme gradient */
          #frosted-glass.ytd-app {
            background: ${selectedTheme.gradient} !important;
            opacity: 0.8 !important;
          }

          ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }
""")
        continue
    
    if skip:
        # Stop skipping when we reach the engagement panel title header or the next feature
        if 'ytd-engagement-panel-title-header-renderer[shorts-panel]' in line or '.buttons-tranlate {' in line:
            skip = False
            found_end = True
        elif 'ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important;' in line and found_start:
             # This is our end marker from Turn 53, but we might have multiple.
             # We already included the engagement panel in our injection.
             pass
        else:
            continue
    
    new_lines.append(line)

if found_start:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("SUCCESS: Restored YouTube Royal Purple theme to stable minimal state.")
else:
    print("FAILED: Could not find theme block for restoration.")
