
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the transparent list to include comment and engagement panel inner elements
old_list = """          #primary.ytd-two-column-browse-results-renderer,
          #secondary.ytd-two-column-browse-results-renderer,
          ytd-rich-grid-renderer,
          #contents.ytd-rich-grid-renderer { 
            background: transparent !important; 
          }"""

new_list = """          #primary.ytd-two-column-browse-results-renderer,
          #secondary.ytd-two-column-browse-results-renderer,
          ytd-rich-grid-renderer,
          #contents.ytd-rich-grid-renderer,
          ytd-item-section-renderer,
          ytd-comments-header-renderer,
          ytd-comment-simplebox-renderer,
          ytd-comment-thread-renderer,
          ytd-comment-renderer,
          #header.ytd-item-section-renderer,
          #body.ytd-comment-renderer,
          #author-thumbnail.ytd-comment-simplebox-renderer { 
            background: transparent !important; 
          }"""

if old_list in content:
    content = content.replace(old_list, new_list)
    # Also fix the duplicate engagement panel line and clean up
    content = content.replace("ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }\n          ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }", "ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Added comment elements to transparency list.")
else:
    print("FAILED: Could not find the transparent list block.")
