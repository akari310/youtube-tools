import { setHTML } from './trusted-types.js';

/**
 * Safe querySelector - returns null if not found (no error)
 */
export function safeQuerySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector) || null;
  } catch (e) {
    console.warn('[DOM-Safe] querySelector error:', selector, e);
    return null;
  }
}

/**
 * Safe querySelectorAll - returns empty array if not found
 */
export function safeQuerySelectorAll(selector, parent = document) {
  try {
    return Array.from(parent.querySelectorAll(selector) || []);
  } catch (e) {
    console.warn('[DOM-Safe] querySelectorAll error:', selector, e);
    return [];
  }
}

/**
 * Safe getElementById
 */
export function safeGetElementById(id) {
  try {
    return document.getElementById(id) || null;
  } catch (e) {
    console.warn('[DOM-Safe] getElementById error:', id, e);
    return null;
  }
}

/**
 * Safe createElement
 */
export function safeCreateElement(tag) {
  try {
    return document.createElement(tag);
  } catch (e) {
    console.warn('[DOM-Safe] createElement error:', tag, e);
    return null;
  }
}

/**
 * Safe set textContent with null check
 */
export function safeSetTextContent(element, text) {
  if (!element) return false;
  try {
    element.textContent = text ?? '';
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] setTextContent error:', e);
    return false;
  }
}

/**
 * Safe set innerHTML with null check
 */
export function safeSetInnerHTML(element, html) {
  if (!element) return false;
  try {
    setHTML(element, html ?? '');
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] setInnerHTML error:', e);
    return false;
  }
}

/**
 * Safe set style property with null check
 */
export function safeSetStyle(element, property, value) {
  if (!element || !element.style) return false;
  try {
    element.style[property] = value ?? '';
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] setStyle error:', property, value, e);
    return false;
  }
}

/**
 * Safe add event listener with null check
 */
export function safeAddEventListener(element, type, listener, options) {
  if (!element || !type || !listener) return false;
  try {
    element.addEventListener(type, listener, options);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] addEventListener error:', type, e);
    return false;
  }
}

/**
 * Safe remove event listener with null check
 */
export function safeRemoveEventListener(element, type, listener, options) {
  if (!element || !type || !listener) return false;
  try {
    element.removeEventListener(type, listener, options);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] removeEventListener error:', type, e);
    return false;
  }
}

/**
 * Safe append child with null check
 */
export function safeAppendChild(parent, child) {
  if (!parent || !child) return false;
  try {
    parent.appendChild(child);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] appendChild error:', e);
    return false;
  }
}

/**
 * Safe remove element with null check
 */
export function safeRemoveElement(element) {
  if (!element || !element.parentNode) return false;
  try {
    element.parentNode.removeChild(element);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] removeElement error:', e);
    return false;
  }
}

/**
 * Safe get attribute with null check
 */
export function safeGetAttribute(element, name, defaultValue = '') {
  if (!element) return defaultValue;
  try {
    return element.getAttribute(name) ?? defaultValue;
  } catch (e) {
    console.warn('[DOM-Safe] getAttribute error:', name, e);
    return defaultValue;
  }
}

/**
 * Safe set attribute with null check
 */
export function safeSetAttribute(element, name, value) {
  if (!element) return false;
  try {
    element.setAttribute(name, value);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] setAttribute error:', name, value, e);
    return false;
  }
}

/**
 * Safe remove attribute with null check
 */
export function safeRemoveAttribute(element, name) {
  if (!element) return false;
  try {
    element.removeAttribute(name);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] removeAttribute error:', name, e);
    return false;
  }
}

/**
 * Safe classList add with null check
 */
export function safeClassAdd(element, className) {
  if (!element || !className) return false;
  try {
    element.classList.add(className);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] classList.add error:', className, e);
    return false;
  }
}

/**
 * Safe classList remove with null check
 */
export function safeClassRemove(element, className) {
  if (!element || !className) return false;
  try {
    element.classList.remove(className);
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] classList.remove error:', className, e);
    return false;
  }
}

/**
 * Safe classList toggle with null check
 */
export function safeClassToggle(element, className, force) {
  if (!element || !className) return false;
  try {
    if (force !== undefined) {
      element.classList.toggle(className, force);
    } else {
      element.classList.toggle(className);
    }
    return true;
  } catch (e) {
    console.warn('[DOM-Safe] classList.toggle error:', className, e);
    return false;
  }
}

/**
 * Safe closest with null check
 */
export function safeClosest(element, selector) {
  if (!element) return null;
  try {
    return element.closest(selector) || null;
  } catch (e) {
    console.warn('[DOM-Safe] closest error:', selector, e);
    return null;
  }
}

/**
 * Safe matches with null check
 */
export function safeMatches(element, selector) {
  if (!element) return false;
  try {
    return element.matches(selector);
  } catch (e) {
    console.warn('[DOM-Safe] matches error:', selector, e);
    return false;
  }
}

/**
 * Chainable safe element wrapper
 */
export class SafeElement {
  constructor(element) {
    this.el = element;
  }

  static from(selector, parent = document) {
    return new SafeElement(safeQuerySelector(selector, parent));
  }

  static fromId(id) {
    return new SafeElement(safeGetElementById(id));
  }

  static fromAll(selector, parent = document) {
    return safeQuerySelectorAll(selector, parent).map(el => new SafeElement(el));
  }

  isValid() {
    return this.el !== null && this.el !== undefined;
  }

  query(selector) {
    if (!this.isValid()) return new SafeElement(null);
    return new SafeElement(safeQuerySelector(selector, this.el));
  }

  queryAll(selector) {
    if (!this.isValid()) return [];
    return safeQuerySelectorAll(selector, this.el).map(el => new SafeElement(el));
  }

  text(content) {
    if (content !== undefined) {
      safeSetTextContent(this.el, content);
      return this;
    }
    return this.el?.textContent ?? '';
  }

  html(content) {
    if (content !== undefined) {
      safeSetInnerHTML(this.el, content);
      return this;
    }
    return this.el?.innerHTML ?? '';
  }

  style(property, value) {
    if (value !== undefined) {
      safeSetStyle(this.el, property, value);
      return this;
    }
    return this.el?.style?.[property] ?? '';
  }

  attr(name, value) {
    if (value !== undefined) {
      safeSetAttribute(this.el, name, value);
      return this;
    }
    return safeGetAttribute(this.el, name, '');
  }

  classAdd(className) {
    safeClassAdd(this.el, className);
    return this;
  }

  classRemove(className) {
    safeClassRemove(this.el, className);
    return this;
  }

  classToggle(className, force) {
    safeClassToggle(this.el, className, force);
    return this;
  }

  on(type, listener, options) {
    safeAddEventListener(this.el, type, listener, options);
    return this;
  }

  off(type, listener, options) {
    safeRemoveEventListener(this.el, type, listener, options);
    return this;
  }

  append(child) {
    if (child instanceof SafeElement) {
      safeAppendChild(this.el, child.el);
    } else {
      safeAppendChild(this.el, child);
    }
    return this;
  }

  remove() {
    safeRemoveElement(this.el);
    return this;
  }

  closest(selector) {
    return new SafeElement(safeClosest(this.el, selector));
  }

  matches(selector) {
    return safeMatches(this.el, selector);
  }

  value(val) {
    if (!this.el) return '';
    if (val !== undefined) {
      this.el.value = val;
      return this;
    }
    return this.el.value ?? '';
  }
}

// Export shorthand functions
export const $safe = SafeElement.from;
export const $safeId = SafeElement.fromId;
export const $safeAll = SafeElement.fromAll;
