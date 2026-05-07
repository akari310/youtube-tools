
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add #cinematic-shorts-scrim to the transparency list
old_item = "#author-thumbnail.ytd-comment-simplebox-renderer {"
new_item = "#author-thumbnail.ytd-comment-simplebox-renderer,\n          #cinematic-shorts-scrim.ytd-shorts {"

if old_item in content:
    new_content = content.replace(old_item, new_item)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Added cinematic-shorts-scrim to transparency list.")
else:
    print("FAILED: Could not find the insertion point.")
