// Reverse page layout (flex-direction: row-reverse)

const REVERSE_ID = 'yt-tools-reverse-style';
const REVERSE_CSS =
  '#columns.style-scope.ytd-watch-flexy { flex-direction: row-reverse !important; padding-left: 20px !important; }';

function getOrCreateStyle() {
  let el = document.getElementById(REVERSE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = REVERSE_ID;
    document.head.appendChild(el);
  }
  return el;
}

export function reverseMode(enabled) {
  const el = getOrCreateStyle();
  el.textContent = enabled ? REVERSE_CSS : '';
}
