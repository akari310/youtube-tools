const fs = require('fs');
const file = 'c:/Users/Admin/.gemini/antigravity/scratch/youtube-tools/Youtube_Tools_All_In_One_Optimized.user.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Credit replacement
content = content.replace(/@author\s+DeveloperMDCM/, '@author       ??');
content = content.replace(/by:\s*DeveloperMDCM/gi, 'by: ??');
content = content.replace(/Developed by @DeveloperMDCM/gi, 'Developed by ??');
content = content.replace(/DeveloperMDCM/g, '??'); 
// Revert github links back to original if they break
content = content.replace(/github\.com\/??/g, 'github.com/DeveloperMDCM');
content = content.replace(/API_KEY_??/g, 'API_KEY_DEVELOPERMDCM');

// 2. Bilingual / Notes Cleanup (Only keep Vietnamese)
const replacements = [
  ['Calidad del video / Quality video', 'Ch?t lu?ng Video'],
  ['Calidad del Audio / Quality Audio', 'Ch?t lu?ng Âm thanh'],
  ['Download Video And Please Wait...', 'Ðang t?i Video, Vui lòng d?i...'],
  ['Enable pop-ups on YouTube to download audio or video', 'B?t pop-ups trên YouTube d? t?i xu?ng'],
  ['title="Image video"', 'title="?nh Video"'],
  ['title="Repeat video"', 'title="L?p Video"'],
  ['title="Add bookmark"', 'title="Ðánh d?u"'],
  ['title="Show bookmarks"', 'title="Hi?n dánh d?u"'],
  ['title="History"', 'title="L?ch s?"'],
  ['title="Picture to picture"', 'title="Hình trong hình (PiP)"'],
  ['title="Screenshot video"', 'title="Ch?p ?nh video"'],
  ['title="Close"', 'title="Ðóng"'],
  ['title="Retry"', 'title="Th? l?i"'],
  ['title="Download again"', 'title="T?i l?i"'],
  ['Continue watching', 'Ti?p t?c xem'],
  ['No history yet. Watch a bit, then reopen any video.', 'Chua có l?ch s?. Hãy xem m?t video d? luu.'],
  ['Resume', 'Ti?p t?c'],
  ['Clear', 'Xóa h?t'],
  ['Delete', 'Xóa'],
  ['History cleared', 'Ðã xóa l?ch s?'],
  ['Bookmark saved at', 'Ðã dánh d?u t?i'],
  ['Active Themes', 'B?t Giao Di?n (Themes)'],
  ['Ambient Mode', 'Ch? d? m? ?o'],
  ['Wave visualizer Beta', 'Sóng âm thanh (Beta)'],
  ['Video Player Size', 'Kích thu?c Video Player'],
  ['Hide related Shorts', '?n Shorts liên quan'],
  ['Hide comments', '?n Bình lu?n'],
  ['Sync cinematic mode', 'Ð?ng b? ch? d? m? ?o'],
  ['No autoplay', 'T?t t? d?ng phát'],
  ['Bookmarks (timestamps)', 'Ðánh d?u th?i gian'],
  ['Effect wave visualizer', 'Hi?u ?ng sóng âm'],
  ['Reset video size', 'Ð?t l?i kích thu?c'],
  ['Default', 'M?c d?nh'],
  ['Smooth mountain', 'Ð?nh núi v?t l?a'],
  ['Bars', 'D?ng c?t'],
  ['Pulse', 'Nh?p d?p'],
  ['Particles', 'H?t b?i bay'],
  ['Lines', 'D?ng du?ng k?'],
  ['Cyberpunk', 'Cyberpunk'],
  ['Tunnel', 'Ðu?ng h?m'],
  ['Fluid', 'Dòng ch?y'],
  ['Matrix', 'Ma tr?n'],
  ['Download Complete!', 'T?i xong!'],
  ['Notification', 'Thông báo'],
  ['Success', 'Thành công'],
  ['Error', 'L?i'],
  ['Information', 'Thông tin'],
  ['Warning', 'C?nh báo'],
  ['Ambient mode enabled', 'Ðã b?t ch? d? m? ?o'],
  ['Ambient mode disabled', 'Ðã t?t ch? d? m? ?o'],
  ['Cinematic mode enabled', 'Ðã b?t Cinematic'],
  ['Cinematic mode disabled', 'Ðã t?t Cinematic'],
  ['Shorts Channel Name', 'Hi?n tên kênh Shorts'],
  ['Translations comments', 'D?ch Bình lu?n'],
  ['Background solid', 'N?n tùy ch?nh'],
  ['Reset', 'Ð?t l?i'],
  ['Current Color', 'Màu hi?n t?i'],
  ['Copy Settings', 'Sao chép C?u hình'],
  ['Paste Settings', 'Dán C?u hình'],
  ['Like \/ Dislike Bar', 'Thanh Thích \/ Không Thích'],
];

replacements.forEach(([from, to]) => {
  // Global replace but case sensitive
  content = content.split(from).join(to);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete');
