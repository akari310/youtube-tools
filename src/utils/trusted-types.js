let policyInst = null;

function getTT() {
  try {
    return typeof unsafeWindow !== 'undefined' ? unsafeWindow.trustedTypes : window.trustedTypes;
  } catch {
    return null;
  }
}

function initPolicy() {
  if (policyInst) return policyInst;
  const tt = getTT();
  if (!tt) {
    policyInst = null;
    return null;
  }
  try {
    policyInst = tt.createPolicy('yt-tools-mdcm', {
      createHTML: (s) => s
    });
    return policyInst;
  } catch (e) {
    policyInst = tt.defaultPolicy || null;
    return policyInst;
  }
}

export const policy = initPolicy();

export function safeHTML(str) {
  const p = policy || initPolicy();
  if (p && typeof p.createHTML === 'function') {
    try {
      return p.createHTML(str);
    } catch {
      return str;
    }
  }
  return str;
}

export function setHTML(el, html) {
  if (!el) return;
  const trusted = safeHTML(html);
  try {
    el.innerHTML = trusted;
  } catch {
    // Fallback: use Range.createContextualFragment (bypasses innerHTML)
    el.textContent = '';
    const range = document.createRange();
    range.selectNodeContents(el);
    try {
      const frag = range.createContextualFragment(html);
      el.appendChild(frag);
    } catch {
      // Ultimate fallback: strip tags
      el.textContent = html.replace(/<[^>]*>/g, '');
    }
  }
}
