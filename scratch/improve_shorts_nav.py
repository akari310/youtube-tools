
import os

file_path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add logic to center Shorts navigation buttons
# We target the navigation-container and use flexbox to center the remaining button if one is hidden
shorts_nav_logic = """
          /* Improve Shorts Navigation: Center 'Next' button if it's the first Short */
          .navigation-container.ytd-shorts {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 12px !important;
          }
          /* Ensure hidden buttons don't take up space in the flex container */
          #navigation-button-up[aria-hidden="true"],
          #navigation-button-up[hidden],
          #navigation-button-down[aria-hidden="true"],
          #navigation-button-down[hidden] {
            display: none !important;
          }
"""

# Insert before the closing bracket of the main dynamic CSS block
insertion_point = "/* Restore the 'frosted-glass' look"
if insertion_point in content:
    new_content = content.replace(insertion_point, shorts_nav_logic + "\n          " + insertion_point)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Added Shorts navigation centering logic.")
else:
    print("FAILED: Could not find the insertion point.")
