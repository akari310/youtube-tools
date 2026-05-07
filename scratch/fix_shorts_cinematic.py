
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the transparent list to include Shorts cinematic and video containers
old_list = """          ytd-section-list-renderer[engagement-panel] { 
            background: transparent !important; 
          }"""

new_list = """          ytd-section-list-renderer[engagement-panel],
          #cinematic-container.ytd-reel-video-renderer,
          #shorts-cinematic-container,
          .short-video-container.ytd-reel-video-renderer,
          ytd-reel-video-renderer { 
            background: transparent !important; 
          }
          /* Completely hide the cinematic glow in shorts if it's causing black blocks */
          #cinematic-container.ytd-reel-video-renderer {
            display: none !important;
          }"""

if old_list in content:
    new_content = content.replace(old_list, new_list)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Hidden Shorts cinematic container and made containers transparent.")
else:
    print("FAILED: Could not find the transparent list block.")
