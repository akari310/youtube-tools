const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../Youtube_Tools_All_In_One_Optimized.user.js');
const outDir = path.join(__dirname, '../src');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

let content = fs.readFileSync(inputFile, 'utf-8');

// Define exactly where to split the file
// Each section cuts off at the specified 'marker' and writes what was before it to the 'filename'
const markers = [
  { filename: '00_meta.js', marker: '(function () {' },
  { filename: '01_globals.js', marker: '// for translate comments video' },
  { filename: '02_languages.js', marker: 'const waveStyle = \'dinamica\';' },
  { filename: '03_core_utils.js', marker: 'function startDownloadVideoOrAudio(' },
  { filename: '04_download_utils.js', marker: 'const STORAGE = {' },
  { filename: '05_constants.js', marker: '// ------------------------------\r\n// PERF: runtime guards' },
  { filename: '06_runtime.js', marker: '// ------------------------------\r\n// Feature helpers' },
  { filename: '07_helpers.js', marker: '// ------------------------------\r\n// Feature: History' },
  { filename: '08_history.js', marker: '// ------------------------------\r\n// Feature: Show channel name' },
  { filename: '09_shorts_channel.js', marker: '// ------------------------------\r\n// Feature: Show cached rating' },
  { filename: '10_cached_ratings.js', marker: '// ------------------------------\r\n// Feature: Bookmarks' },
  { filename: '11_bookmarks.js', marker: '// ------------------------------\r\n// Feature: Like vs Dislike' },
  { filename: '12_likes_dislikes.js', marker: '// ------------------------------\r\n// YTM Ambient Mode' },
  { filename: '13_ambient.js', marker: 'function isWatchPage() {' },
  { filename: '14_cinema.js', marker: 'function addDownloadBtnAlternative() {' },
  { filename: '15_download_btn.js', marker: 'function initYTTools() {' },
  { filename: '99_init.js', marker: 'null' } // End of file
];

let remainingChunks = content;

markers.forEach((step, i) => {
  if (step.marker === 'null') {
    fs.writeFileSync(path.join(outDir, step.filename), remainingChunks);
    console.log(`Saved ${step.filename}`);
    return;
  }

  // Handle differences in OS line endings
  let index = remainingChunks.indexOf(step.marker);
  if (index === -1) {
    // Try LF instead of CRLF
    index = remainingChunks.indexOf(step.marker.replace(/\r\n/g, '\n'));
  }

  if (index === -1) {
    console.error(`ERROR: Split marker not found for ${step.filename}!`);
    console.error(`Marker: ${step.marker.substring(0, 50)}...`);
    process.exit(1);
  }

  const chunk = remainingChunks.substring(0, index);
  remainingChunks = remainingChunks.substring(index);
  
  fs.writeFileSync(path.join(outDir, step.filename), chunk);
  console.log(`Saved ${step.filename}`);
});

console.log('Splitting complete!');
