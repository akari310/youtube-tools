
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the transparent list to include Shorts engagement panel and comment elements
old_list = """          #author-thumbnail.ytd-comment-simplebox-renderer,
          #cinematic-shorts-scrim.ytd-shorts { 
            background: transparent !important; 
          }"""

new_list = """          #author-thumbnail.ytd-comment-simplebox-renderer,
          #cinematic-shorts-scrim.ytd-shorts,
          ytd-comment-view-model,
          ytd-comment-engagement-bar,
          ytd-comment-replies-renderer,
          #anchored-panel.ytd-shorts,
          #header.ytd-engagement-panel-title-header-renderer,
          #content.ytd-engagement-panel-section-list-renderer,
          ytd-section-list-renderer[engagement-panel] { 
            background: transparent !important; 
          }"""

if old_list in content:
    new_content = content.replace(old_list, new_list)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Added Shorts engagement panel elements to transparency list.")
else:
    print("FAILED: Could not find the transparent list block.")
