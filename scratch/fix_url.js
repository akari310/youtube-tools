const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src/utils/url.js');
let content = fs.readFileSync(filePath, 'utf8');

// The corrupted block looks like this:
//     </div>
//   </div>
//
//   </div>
//   `;

const corrupted = /<div class="developer-mdcm">[\s\S]+?<\/div>\s+<\/div>\s+\s+<\/div>\s+`;/m;
const fixed = `<div class="developer-mdcm">
      <div style="font-size: 11px; opacity: 0.9; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; line-height: 1.6;">
        Developed by <a href="https://github.com/akari310" target="_blank" style="color: #ff4444; text-decoration: none;"><i class="fa-brands fa-github"></i> Akari</a>. 
        Base by <a href="https://github.com/DeveloperMDCM" target="_blank" style="color: #00aaff; text-decoration: none;"><i class="fa-brands fa-github"></i> MDCM</a>. 
        Features from <a href="https://github.com/nvbangg" target="_blank" style="color: #00ffaa; text-decoration: none;"><i class="fa-brands fa-github"></i> nvbangg</a>.
      </div>
    </div>
    <span style="color: #fff;">v\${GM_info.script.version}</span>
  </div>
  \`;
    panel.innerHTML = safeHTML(menuHTML);

    $ap(panel);`;

// Wait, I should find exactly where to inject it.
// Let's just find the developer-mdcm div and replace it and the following corrupted lines.

content = content.replace(/<div class="developer-mdcm">[\s\S]+?\$ap\(panel\);/m, fixed);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed url.js footer successfully');
