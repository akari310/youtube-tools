import os

path = r'c:\Users\Admin\.gemini\antigravity\scratch\youtube-tools\src\17_const_ytmambientmode.js'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_init = """  function initYTMHeaderScroll() {
    if (!isYTMusic) return;
    const navBar = document.querySelector('ytmusic-nav-bar');
    if (!navBar) return;

    const updateHeader = () => {
      const isScrolled = window.scrollY > 10;
      const isWatchPage = window.location.pathname.startsWith('/watch');
      const isPlayerOpen = document.body.hasAttribute('player-page-open') || 
                           navBar.hasAttribute('opened') || 
                           isWatchPage;
      
      if (isScrolled || isPlayerOpen) {
        navBar.classList.add('scrolled');
      } else {
        navBar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('popstate', updateHeader);
    
    // Initial checks to ensure it catches the state on load/refresh
    updateHeader();
    setTimeout(updateHeader, 500);
    setTimeout(updateHeader, 2000);
    
    // Observe state changes
    const observer = new MutationObserver(updateHeader);
    observer.observe(document.body, { attributes: true, attributeFilter: ['player-page-open'] });
    observer.observe(navBar, { attributes: true, attributeFilter: ['opened'] });
  }
"""

# Find and replace initYTMHeaderScroll
# It was at the end of the file
start_line = -1
for i, line in enumerate(lines):
    if 'function initYTMHeaderScroll()' in line:
        start_line = i
        break

if start_line != -1:
    # Find the end of the function (closing brace)
    end_line = -1
    brace_count = 0
    for j in range(start_line, len(lines)):
        brace_count += lines[j].count('{')
        brace_count -= lines[j].count('}')
        if brace_count == 0 and '{' in lines[start_line]:
             end_line = j
             break
    
    if end_line != -1:
        lines[start_line:end_line+1] = [new_init]
        print("Updated initYTMHeaderScroll")

# Also update applyYTMThemeVars to ensure nav bar background is always themed
for i, line in enumerate(lines):
    if "$sp('--ytmusic-nav-bar-background', raisedBg || bgColor);" in line:
        lines[i] = "    $sp('--ytmusic-nav-bar-background', bgColor);\n"
        print("Updated nav bar variable in applyYTMThemeVars")
    if "$sp('--yt-spec-general-background-c', raisedBg || bgColor);" in line:
        lines[i] = "    $sp('--yt-spec-general-background-c', bgColor);\n"
        print("Updated general background c variable in applyYTMThemeVars")

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)
print("Done")
