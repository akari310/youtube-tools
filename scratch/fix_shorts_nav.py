
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the transparent list to include Shorts navigation container
old_list = """          .short-video-container.ytd-reel-video-renderer,
          ytd-reel-video-renderer { 
            background: transparent !important; 
          }"""

new_list = """          .short-video-container.ytd-reel-video-renderer,
          ytd-reel-video-renderer,
          .navigation-container.ytd-shorts,
          .navigation-button.ytd-shorts { 
            background: transparent !important; 
          }"""

if old_list in content:
    new_content = content.replace(old_list, new_list)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Added Shorts navigation container to transparency list.")
else:
    print("FAILED: Could not find the transparent list block.")
