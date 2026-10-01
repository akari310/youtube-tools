
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1db415dd-6d6b-568a-9fb0-f2ed9faa3620")}catch(e){}}();
(function () {
  'use strict';

  
  let console;
  
  (function () {
    const preMessage = 'Ambient light for YouTube™ |';
  
    const enrich = (...args) => {
      if (args.length <= 0) return args;
  
      if (typeof args[0] === 'string') {
        const [firstArg, ...postArgs] = args;
        return [`${preMessage} ${firstArg}`, ...postArgs];
      }
  
      return [preMessage, ...args];
    };
  
    console = {
      log: (...args) => globalThis.console.log(...enrich(...args)),
      debug: (...args) => globalThis.console.debug(...enrich(...args)),
      warn: (...args) => globalThis.console.warn(...enrich(...args)),
      error: (...args) => globalThis.console.error(...enrich(...args)),
      dir: (...args) => globalThis.console.dir(...args),
    };
  })();


  const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  };
  let errorHandler = ex => {
    console.error(ex);
  };
  const setErrorHandler = handler => {
    errorHandler = handler;
  };
  let displayErrorHandler;
  const setDisplayErrorHandler = handler => {
    displayErrorHandler = handler;
  };
  const wrapErrorHandlerHandleError = (stack, ex, reportOnce, reported) => {
    if (reportOnce) {
      if (reported.includes(ex.message)) return;
      reported.push(ex.message);
    }
    appendErrorStack(stack, ex);
    if (errorHandler) errorHandler(ex);
    if (displayErrorHandler) displayErrorHandler(ex);
  };
  const withErrorHandler = (callback, reportOnce, stack, reported) => {
    const callbackName = callback.name || 'anonymous';
    const container = {
      [callbackName]: (...args) => {
        try {
          return callback(...args);
        } catch (ex) {
          wrapErrorHandlerHandleError(stack, ex, reportOnce, reported);
        }
      }
    };
    return container[callbackName];
  };
  const withAsyncErrorHandler = (callback, reportOnce, stack, reported) => {
    const callbackName = callback.name || 'anonymous';
    const container = {
      [callbackName]: async (...args) => {
        try {
          return await callback(...args);
        } catch (ex) {
          wrapErrorHandlerHandleError(stack, ex, reportOnce, reported);
        }
      }
    };
    return container[callbackName];
  };
  const wrapErrorHandler = (callback, reportOnce = false) => (callback.constructor.name === 'AsyncFunction' ? withAsyncErrorHandler : withErrorHandler)(callback, reportOnce, new Error().stack, []);
  const setTimeout$1 = (handler, timeout) => {
    return globalThis.setTimeout(wrapErrorHandler(handler), timeout);
  };
  const eventListenerCallbacks = [];
  function on(elem, eventNames, callback, options, reportOnce = false) {
    try {
      const stack = new Error().stack;
      const callbacksName = `on_${eventNames.split(' ').join('_')}`;
      let reported = [];
      const namedCallbacks = {
        [callbacksName]: async (...args) => {
          try {
            await callback(...args);
          } catch (ex) {
            if (reportOnce) {
              if (reported.includes(ex.message)) return;
              reported.push(ex.message);
            }
            const e = args.length ? args[0] : {};
            const type = e.type === 'keydown' ? `${e.type} keyCode: ${e.keyCode}` : e.type;
            ex.message = `${ex.message} \nOn event: ${type}`;
            try {
              if (elem) {
                ex.message = `${ex.message} \nElem: ${elem.toString()} ${elem.nodeName || ''}#${elem.id || ''}.${elem.className || ''}`;
              }
            } catch (elemEx) {
              ex.details = {
                ...(ex.details || {}),
                elemEx
              };
            }
            try {
              if (e !== null && e !== void 0 && e.target) {
                ex.message = `${ex.message} \nTarget: ${e.target.toString()} ${e.target.nodeName || ''}#${e.target.id || ''}.${e.target.className || ''}`;
              }
            } catch (targetEx) {
              ex.details = {
                ...(ex.details || {}),
                targetEx
              };
            }
            try {
              if (e !== null && e !== void 0 && e.currentTarget) {
                ex.message = `${ex.message} \nCurrentTarget: ${e.currentTarget.toString()} ${e.currentTarget.nodeName || ''}#${e.currentTarget.id || ''}.${e.currentTarget.className || ''}`;
              }
            } catch (currentTargetEx) {
              ex.details = {
                ...(ex.details || {}),
                currentTargetEx
              };
            }
            ex.details = {
              ...(ex.details || {}),
              eventNames,
              options,
              reportOnce
            };
            appendErrorStack(stack, ex);
            if (errorHandler) errorHandler(ex);
          }
        }
      };
      const eventListenerCallback = namedCallbacks[callbacksName];
      const eventNamesList = eventNames.split(' ');
      const existingEventListenerCallback = eventListenerCallbacks.find(e => e.args.elem === elem && e.args.callback === callback && JSON.stringify(e.args.options) === JSON.stringify(options));
      for (const eventName of eventNamesList) {
        if (existingEventListenerCallback) {
          if (existingEventListenerCallback.args.eventNamesList.includes(eventName)) {
            continue;
          } else {
            existingEventListenerCallback.args.eventNamesList.push(eventName);
          }
        }
        elem.addEventListener(eventName, eventListenerCallback, options);
      }
      if (!existingEventListenerCallback) {
        eventListenerCallbacks.push({
          args: {
            elem,
            eventNamesList,
            callback,
            options
          },
          callback: eventListenerCallback
        });
      }
    } catch (ex) {
      ex.details = {
        eventNames,
        options,
        reportOnce
      };
      try {
        if (elem) {
          ex.message = `${ex.message} \nFor element: ${elem.toString()} ${elem.nodeName || ''}#${elem.id || ''}.${elem.className || ''}`;
        }
      } catch (elemEx) {
        ex.details = {
          ...(ex.details || {}),
          elemEx
        };
      }
      console.log('catched', ex);
      throw ex;
    }
  }
  function off(elem, eventNames, callback) {
    try {
      const list = eventNames.split(' ');
      for (const eventName of list) {
        const eventListenerCallback = eventListenerCallbacks.find(e => e.args.elem === elem && e.args.callback === callback && e.args.eventNamesList.includes(eventName));
        if (!eventListenerCallback) continue;
        eventListenerCallback.args.eventNamesList.splice(eventListenerCallback.args.eventNamesList.indexOf(eventName), 1);
        if (eventListenerCallback.args.eventNamesList.length === 0) {
          eventListenerCallbacks.splice(eventListenerCallbacks.indexOf(eventListenerCallback), 1);
        }
        elem.removeEventListener(eventName, eventListenerCallback.callback, eventListenerCallback.args.options);
      }
    } catch (ex) {
      ex.details = {
        eventNames
      };
      try {
        if (elem) {
          ex.message = `${ex.message} \nFor element: ${elem.toString()} ${elem.nodeName || ''}#${elem.id || ''}.${elem.className || ''}`;
        }
      } catch (elemEx) {
        ex.details = {
          ...(ex.details || {}),
          elemEx
        };
      }
      throw ex;
    }
  }
  const raf = callback => requestAnimationFrame(wrapErrorHandler(callback));
  const colorSpace = globalThis.matchMedia('(color-gamut: p3)').matches ? 'display-p3' : 'srgb';
  const extendedColorSpace = globalThis.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' : globalThis.matchMedia('(color-gamut: p3)').matches ? 'display-p3' : 'srgb';
  const ctxOptions = {
    imageSmoothingQuality: 'low',
    colorSpace,
    extendedColorSpace
  };
  class Canvas {
    constructor(width, height, pixelated) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      if (pixelated) {
        canvas.style.imageRendering = 'pixelated';
      }
      return canvas;
    }
  }
  class SafeOffscreenCanvas {
    constructor(width, height, pixelated) {
      if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height);
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        if (pixelated) {
          canvas.style.imageRendering = 'pixelated';
        }
        return canvas;
      }
    }
  }
  function requestIdleCallback(callback, options, reportOnce = false) {
    return globalThis.requestIdleCallback ? globalThis.requestIdleCallback(wrapErrorHandler(callback, reportOnce), options) : globalThis.setTimeout(wrapErrorHandler(callback, reportOnce), 1);
  }
  const appendErrorStack = (stack, ex) => {
    try {
      var _ref;
      const stackToAppend = stack === null || stack === void 0 ? void 0 : stack.substring((stack === null || stack === void 0 ? void 0 : stack.indexOf('\n')) + 1);
      const stackToSearch = stackToAppend === null || stackToAppend === void 0 ? void 0 : stackToAppend.substring((stackToAppend === null || stackToAppend === void 0 ? void 0 : stackToAppend.indexOf('\n')) + 1);
      const alreadyContainsStack = ((_ref = (ex === null || ex === void 0 ? void 0 : ex.stack) || (ex === null || ex === void 0 ? void 0 : ex.message) || (ex === null || ex === void 0 ? void 0 : ex.toString())) === null || _ref === void 0 ? void 0 : _ref.indexOf(stackToSearch)) !== -1;
      if (!alreadyContainsStack) {
        ex.stack = `${ex.stack || ex.message || ex.toString()}\n${stackToAppend}`;
      }
    } catch (ex) {
      console.warn(ex);
    }
  };
  let _supportsWebGL;
  const supportsWebGL = () => {
    if (_supportsWebGL === undefined) {
      try {
        var _document$createEleme, _document$createEleme2;
        _supportsWebGL = !!globalThis.WebGLRenderingContext && (!!((_document$createEleme = document.createElement('canvas')) !== null && _document$createEleme !== void 0 && _document$createEleme.getContext('webgl')) || !!((_document$createEleme2 = document.createElement('canvas')) !== null && _document$createEleme2 !== void 0 && _document$createEleme2.getContext('webgl2')));
      } catch {
        _supportsWebGL = false;
      }
    }
    return _supportsWebGL;
  };
  let _supportsColorMix;
  const supportsColorMix = () => {
    if (_supportsColorMix === undefined) {
      try {
        _supportsColorMix = CSS.supports('background-color: color-mix(in srgb, #000 0%, #000)');
      } catch {
        _supportsColorMix = false;
      }
    }
    return _supportsColorMix;
  };
  const isWatchPageUrl = () => ['/watch', '/live/'].some(path => location.pathname.startsWith(path)) || isEmbedPageUrl();
  const isEmbedPageUrl = () => {
    var _location$pathname;
    return (_location$pathname = location.pathname) === null || _location$pathname === void 0 ? void 0 : _location$pathname.startsWith('/embed/');
  };
  const getCookie = async name => globalThis.cookieStore ? await cookieStore.get(name) : document.cookie.split('; ').map(cookie => {
    const nameValue = cookie.split(/=(.*)/s);
    return {
      name: nameValue[0],
      value: nameValue[1]
    };
  }).find(cookie => cookie.name === name);
  const networkStateToString = value => (({
    0: 'NETWORK_EMPTY',
    1: 'NETWORK_IDLE',
    2: 'NETWORK_LOADING',
    3: 'NETWORK_NO_SOURCE'
  })[value] || value) ?? 'UNKNOWN';
  const readyStateToString = value => (({
    0: 'HAVE_NOTHING',
    1: 'HAVE_METADATA',
    2: 'HAVE_CURRENT_DATA',
    3: 'HAVE_FUTURE_DATA',
    4: 'HAVE_ENOUGH_DATA'
  })[value] || value) ?? 'UNKNOWN';
  const mediaErrorToString = value => (({
    1: 'MEDIA_ERR_ABORTED',
    2: 'MEDIA_ERR_NETWORK',
    3: 'MEDIA_ERR_DECODE',
    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  })[value] || value) ?? 'UNKNOWN';
  const webGLErrorToString = value => (({
    1280: 'GL_INVALID_ENUM',
    1281: 'GL_INVALID_VALUE',
    1282: 'GL_INVALID_OPERATION',
    1285: 'GL_OUT_OF_MEMORY',
    1286: 'GL_INVALID_FRAMEBUFFER_OPERATION',
    1287: 'GL_CONTEXT_LOST_WEBGL'
  })[value] || value) ?? 'UNKNOWN';
  const VIEW_DISABLED = 'DISABLED';
  const VIEW_DETACHED = 'DETACHED';
  const VIEW_SMALL = 'SMALL';
  const VIEW_THEATER = 'THEATER';
  const VIEW_FULLSCREEN = 'FULLSCREEN';
  const VIEW_POPUP = 'POPUP';
  const watchSelectors = ['ytd-watch-flexy', 'ytd-watch-fixie', 'ytd-watch-grid'];
  let warningElem;
  let warningElemText;
  const setWarning = text => {
    if (!warningElem) {
      const elem = document.createElement('div');
      elem.style.position = 'fixed';
      elem.style.zIndex = 999999;
      elem.style.left = 0;
      elem.style.bottom = 0;
      elem.style.padding = '5px 8px';
      elem.style.background = 'rgba(0,0,0,.99)';
      elem.style.color = '#fff';
      elem.style.border = '1px solid #f80';
      elem.style.borderTopRightRadius = '3px';
      elem.style.whiteSpace = 'pre-wrap';
      elem.style.fontSize = '15px';
      elem.style.lineHeight = '18px';
      elem.style.fontFamily = 'sans-serif';
      elem.style.overflowWrap = 'anywhere';
      elem.style.overflow = 'hidden';
      warningElem = elem;
      const closeButton = document.createElement('button');
      closeButton.style.position = 'absolute';
      closeButton.style.zIndex = 2;
      closeButton.style.right = 0;
      closeButton.style.top = 0;
      closeButton.style.border = 'none';
      closeButton.style.borderBottomLeftRadius = '3px';
      closeButton.style.padding = '0px 8px';
      closeButton.style.background = '#f80';
      closeButton.style.fontWeight = 'bold';
      closeButton.style.fontFamily = 'inherit';
      closeButton.style.lineHeight = '20px';
      closeButton.style.fontSize = '22px';
      closeButton.style.color = '#000';
      closeButton.style.cursor = 'pointer';
      closeButton.textContent = 'x';
      on(closeButton, 'click', () => setWarning(''));
      elem.appendChild(closeButton);
      const titleElem = document.createElement('div');
      titleElem.style.fontWeight = 'bold';
      titleElem.style.color = '#008cff';
      titleElem.style.fontSize = '22px';
      titleElem.style.lineHeight = '28px';
      titleElem.textContent = 'Ambient light for YouTube™\n';
      elem.appendChild(titleElem);
      const textElem = document.createElement('div');
      warningElemText = textElem;
      elem.appendChild(textElem);
    }
    const elem = warningElem;
    if (text) {
      warningElemText.textContent = text;
      document.documentElement.appendChild(elem);
    } else {
      warningElemText.textContent = '';
      elem.remove();
    }
  };
  const isNetworkError = ex => (ex === null || ex === void 0 ? void 0 : ex.message) === 'Failed to fetch' || (ex === null || ex === void 0 ? void 0 : ex.message) === 'NetworkError when attempting to fetch resource.';
  const setStyleProperty = (elem, name, value, priority = '') => {
    const currentValue = elem.style.getPropertyValue(name) ?? '';
    const currentPriority = elem.style.getPropertyPriority(name) ?? '';
    if (currentValue === value && currentPriority === priority) return;
    elem.style.setProperty(name, value, priority);
  };
  const canvas2DCrashTips = `

Reload the webpage to try it again.

Possible causes:
- The memory of your GPU is fully used by another application.
- You have to many YouTube webpages visible at the same time. You GPU can only render a limit amount of ambient lights at the same time.
- You have changed a setting to a value that is incompatible with your GPU. Undo your last change and refresh the webpage. Or reset all settings with the reset button at the top right.`;
  const canvasWebGLCrashTips = `${canvas2DCrashTips}

Another possible workaround could be to turn off the "Quality" > "WebGL renderer" setting (This is an advanced setting). But if you do so, know that the legacy renderer requires more power.`;

  const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__;

  const SDK_VERSION = "9.27.0";

  const GLOBAL_OBJ = globalThis;

  function getMainCarrier() {
    getSentryCarrier(GLOBAL_OBJ);
    return GLOBAL_OBJ;
  }
  function getSentryCarrier(carrier) {
    const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    __SENTRY__.version = __SENTRY__.version || SDK_VERSION;
    return __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
  }
  function getGlobalSingleton(name, creator, obj = GLOBAL_OBJ) {
    const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
    const carrier = __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
    return carrier[name] || (carrier[name] = creator());
  }

  const objectToString = Object.prototype.toString;
  function isError(wat) {
    switch (objectToString.call(wat)) {
      case '[object Error]':
      case '[object Exception]':
      case '[object DOMException]':
      case '[object WebAssembly.Exception]':
        return true;
      default:
        return isInstanceOf(wat, Error);
    }
  }
  function isBuiltin(wat, className) {
    return objectToString.call(wat) === `[object ${className}]`;
  }
  function isErrorEvent$1(wat) {
    return isBuiltin(wat, 'ErrorEvent');
  }
  function isDOMError(wat) {
    return isBuiltin(wat, 'DOMError');
  }
  function isDOMException(wat) {
    return isBuiltin(wat, 'DOMException');
  }
  function isString(wat) {
    return isBuiltin(wat, 'String');
  }
  function isParameterizedString(wat) {
    return typeof wat === 'object' && wat !== null && '__sentry_template_string__' in wat && '__sentry_template_values__' in wat;
  }
  function isPrimitive(wat) {
    return wat === null || isParameterizedString(wat) || typeof wat !== 'object' && typeof wat !== 'function';
  }
  function isPlainObject(wat) {
    return isBuiltin(wat, 'Object');
  }
  function isEvent(wat) {
    return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
  }
  function isElement(wat) {
    return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
  }
  function isThenable(wat) {
    return Boolean((wat === null || wat === void 0 ? void 0 : wat.then) && typeof wat.then === 'function');
  }
  function isSyntheticEvent(wat) {
    return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
  }
  function isInstanceOf(wat, base) {
    try {
      return wat instanceof base;
    } catch (_e) {
      return false;
    }
  }
  function isVueViewModel(wat) {
    return !!(typeof wat === 'object' && wat !== null && (wat.__isVue || wat._isVue));
  }

  const WINDOW$1 = GLOBAL_OBJ;
  const DEFAULT_MAX_STRING_LENGTH = 80;
  function htmlTreeAsString(elem, options = {}) {
    if (!elem) {
      return '<unknown>';
    }
    try {
      let currentElem = elem;
      const MAX_TRAVERSE_HEIGHT = 5;
      const out = [];
      let height = 0;
      let len = 0;
      const separator = ' > ';
      const sepLength = separator.length;
      let nextStr;
      const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
      const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
      while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = _htmlElementAsString(currentElem, keyAttrs);
        if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) {
          break;
        }
        out.push(nextStr);
        len += nextStr.length;
        currentElem = currentElem.parentNode;
      }
      return out.reverse().join(separator);
    } catch (_oO) {
      return '<unknown>';
    }
  }
  function _htmlElementAsString(el, keyAttrs) {
    const elem = el;
    const out = [];
    if (!(elem !== null && elem !== void 0 && elem.tagName)) {
      return '';
    }
    if (WINDOW$1.HTMLElement) {
      if (elem instanceof HTMLElement && elem.dataset) {
        if (elem.dataset['sentryComponent']) {
          return elem.dataset['sentryComponent'];
        }
        if (elem.dataset['sentryElement']) {
          return elem.dataset['sentryElement'];
        }
      }
    }
    out.push(elem.tagName.toLowerCase());
    const keyAttrPairs = keyAttrs !== null && keyAttrs !== void 0 && keyAttrs.length ? keyAttrs.filter(keyAttr => elem.getAttribute(keyAttr)).map(keyAttr => [keyAttr, elem.getAttribute(keyAttr)]) : null;
    if (keyAttrPairs !== null && keyAttrPairs !== void 0 && keyAttrPairs.length) {
      keyAttrPairs.forEach(keyAttrPair => {
        out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
      });
    } else {
      if (elem.id) {
        out.push(`#${elem.id}`);
      }
      const className = elem.className;
      if (className && isString(className)) {
        const classes = className.split(/\s+/);
        for (const c of classes) {
          out.push(`.${c}`);
        }
      }
    }
    const allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
    for (const k of allowedAttrs) {
      const attr = elem.getAttribute(k);
      if (attr) {
        out.push(`[${k}="${attr}"]`);
      }
    }
    return out.join('');
  }

  const PREFIX = 'Sentry Logger ';
  const CONSOLE_LEVELS = ['debug', 'info', 'warn', 'error', 'log', 'assert', 'trace'];
  const originalConsoleMethods = {};
  function consoleSandbox(callback) {
    if (!('console' in GLOBAL_OBJ)) {
      return callback();
    }
    const console = GLOBAL_OBJ.console;
    const wrappedFuncs = {};
    const wrappedLevels = Object.keys(originalConsoleMethods);
    wrappedLevels.forEach(level => {
      const originalConsoleMethod = originalConsoleMethods[level];
      wrappedFuncs[level] = console[level];
      console[level] = originalConsoleMethod;
    });
    try {
      return callback();
    } finally {
      wrappedLevels.forEach(level => {
        console[level] = wrappedFuncs[level];
      });
    }
  }
  function makeLogger() {
    let enabled = false;
    const logger = {
      enable: () => {
        enabled = true;
      },
      disable: () => {
        enabled = false;
      },
      isEnabled: () => enabled
    };
    if (DEBUG_BUILD) {
      CONSOLE_LEVELS.forEach(name => {
        logger[name] = (...args) => {
          if (enabled) {
            consoleSandbox(() => {
              GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
            });
          }
        };
      });
    } else {
      CONSOLE_LEVELS.forEach(name => {
        logger[name] = () => undefined;
      });
    }
    return logger;
  }
  const logger = getGlobalSingleton('logger', makeLogger);

  function truncate(str, max = 0) {
    if (typeof str !== 'string' || max === 0) {
      return str;
    }
    return str.length <= max ? str : `${str.slice(0, max)}...`;
  }

  function addNonEnumerableProperty(obj, name, value) {
    try {
      Object.defineProperty(obj, name, {
        value: value,
        writable: true,
        configurable: true
      });
    } catch (o_O) {
      DEBUG_BUILD && logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
    }
  }
  function getOriginalFunction(func) {
    return func.__sentry_original__;
  }
  function convertToPlainObject(value) {
    if (isError(value)) {
      return {
        message: value.message,
        name: value.name,
        stack: value.stack,
        ...getOwnProperties(value)
      };
    } else if (isEvent(value)) {
      const newObj = {
        type: value.type,
        target: serializeEventTarget(value.target),
        currentTarget: serializeEventTarget(value.currentTarget),
        ...getOwnProperties(value)
      };
      if (typeof CustomEvent !== 'undefined' && isInstanceOf(value, CustomEvent)) {
        newObj.detail = value.detail;
      }
      return newObj;
    } else {
      return value;
    }
  }
  function serializeEventTarget(target) {
    try {
      return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
    } catch (_oO) {
      return '<unknown>';
    }
  }
  function getOwnProperties(obj) {
    if (typeof obj === 'object' && obj !== null) {
      const extractedProps = {};
      for (const property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
          extractedProps[property] = obj[property];
        }
      }
      return extractedProps;
    } else {
      return {};
    }
  }
  function extractExceptionKeysForMessage(exception, maxLength = 40) {
    const keys = Object.keys(convertToPlainObject(exception));
    keys.sort();
    const firstKey = keys[0];
    if (!firstKey) {
      return '[object has no keys]';
    }
    if (firstKey.length >= maxLength) {
      return truncate(firstKey, maxLength);
    }
    for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
      const serialized = keys.slice(0, includedKeys).join(', ');
      if (serialized.length > maxLength) {
        continue;
      }
      if (includedKeys === keys.length) {
        return serialized;
      }
      return truncate(serialized, maxLength);
    }
    return '';
  }

  function getCrypto() {
    const gbl = GLOBAL_OBJ;
    return gbl.crypto || gbl.msCrypto;
  }
  function uuid4(crypto = getCrypto()) {
    let getRandomByte = () => Math.random() * 16;
    try {
      if (crypto !== null && crypto !== void 0 && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '');
      }
      if (crypto !== null && crypto !== void 0 && crypto.getRandomValues) {
        getRandomByte = () => {
          const typedArray = new Uint8Array(1);
          crypto.getRandomValues(typedArray);
          return typedArray[0];
        };
      }
    } catch (_) {}
    return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c => (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
  }
  function getFirstException(event) {
    var _event$exception, _event$exception$valu;
    return (_event$exception = event.exception) === null || _event$exception === void 0 ? void 0 : (_event$exception$valu = _event$exception.values) === null || _event$exception$valu === void 0 ? void 0 : _event$exception$valu[0];
  }
  function addExceptionTypeValue(event, value, type) {
    const exception = event.exception = event.exception || {};
    const values = exception.values = exception.values || [];
    const firstException = values[0] = values[0] || {};
    if (!firstException.value) {
      firstException.value = value || '';
    }
    if (!firstException.type) {
      firstException.type = 'Error';
    }
  }
  function addExceptionMechanism(event, newMechanism) {
    const firstException = getFirstException(event);
    if (!firstException) {
      return;
    }
    const defaultMechanism = {
      type: 'generic',
      handled: true
    };
    const currentMechanism = firstException.mechanism;
    firstException.mechanism = {
      ...defaultMechanism,
      ...currentMechanism,
      ...newMechanism
    };
    if (newMechanism && 'data' in newMechanism) {
      const mergedData = {
        ...(currentMechanism === null || currentMechanism === void 0 ? void 0 : currentMechanism.data),
        ...newMechanism.data
      };
      firstException.mechanism.data = mergedData;
    }
  }
  function checkOrSetAlreadyCaught(exception) {
    if (isAlreadyCaptured(exception)) {
      return true;
    }
    try {
      addNonEnumerableProperty(exception, '__sentry_captured__', true);
    } catch (err) {}
    return false;
  }
  function isAlreadyCaptured(exception) {
    try {
      return exception.__sentry_captured__;
    } catch {}
  }

  const ONE_SECOND_IN_MS = 1000;
  function dateTimestampInSeconds() {
    return Date.now() / ONE_SECOND_IN_MS;
  }
  function createUnixTimestampInSecondsFunc() {
    const {
      performance
    } = GLOBAL_OBJ;
    if (!(performance !== null && performance !== void 0 && performance.now)) {
      return dateTimestampInSeconds;
    }
    const approxStartingTimeOrigin = Date.now() - performance.now();
    const timeOrigin = performance.timeOrigin == undefined ? approxStartingTimeOrigin : performance.timeOrigin;
    return () => {
      return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
    };
  }
  const timestampInSeconds = createUnixTimestampInSecondsFunc();

  function updateSession(session, context = {}) {
    if (context.user) {
      if (!session.ipAddress && context.user.ip_address) {
        session.ipAddress = context.user.ip_address;
      }
      if (!session.did && !context.did) {
        session.did = context.user.id || context.user.email || context.user.username;
      }
    }
    session.timestamp = context.timestamp || timestampInSeconds();
    if (context.abnormal_mechanism) {
      session.abnormal_mechanism = context.abnormal_mechanism;
    }
    if (context.ignoreDuration) {
      session.ignoreDuration = context.ignoreDuration;
    }
    if (context.sid) {
      session.sid = context.sid.length === 32 ? context.sid : uuid4();
    }
    if (context.init !== undefined) {
      session.init = context.init;
    }
    if (!session.did && context.did) {
      session.did = `${context.did}`;
    }
    if (typeof context.started === 'number') {
      session.started = context.started;
    }
    if (session.ignoreDuration) {
      session.duration = undefined;
    } else if (typeof context.duration === 'number') {
      session.duration = context.duration;
    } else {
      const duration = session.timestamp - session.started;
      session.duration = duration >= 0 ? duration : 0;
    }
    if (context.release) {
      session.release = context.release;
    }
    if (context.environment) {
      session.environment = context.environment;
    }
    if (!session.ipAddress && context.ipAddress) {
      session.ipAddress = context.ipAddress;
    }
    if (!session.userAgent && context.userAgent) {
      session.userAgent = context.userAgent;
    }
    if (typeof context.errors === 'number') {
      session.errors = context.errors;
    }
    if (context.status) {
      session.status = context.status;
    }
  }

  function merge(initialObj, mergeObj, levels = 2) {
    if (!mergeObj || typeof mergeObj !== 'object' || levels <= 0) {
      return mergeObj;
    }
    if (initialObj && Object.keys(mergeObj).length === 0) {
      return initialObj;
    }
    const output = {
      ...initialObj
    };
    for (const key in mergeObj) {
      if (Object.prototype.hasOwnProperty.call(mergeObj, key)) {
        output[key] = merge(output[key], mergeObj[key], levels - 1);
      }
    }
    return output;
  }

  const SCOPE_SPAN_FIELD = '_sentrySpan';
  function _setSpanForScope(scope, span) {
    if (span) {
      addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, span);
    } else {
      delete scope[SCOPE_SPAN_FIELD];
    }
  }
  function _getSpanForScope(scope) {
    return scope[SCOPE_SPAN_FIELD];
  }

  function generateTraceId() {
    return uuid4();
  }
  function generateSpanId() {
    return uuid4().substring(16);
  }

  const DEFAULT_MAX_BREADCRUMBS = 100;
  class Scope {
    constructor() {
      this._notifyingListeners = false;
      this._scopeListeners = [];
      this._eventProcessors = [];
      this._breadcrumbs = [];
      this._attachments = [];
      this._user = {};
      this._tags = {};
      this._extra = {};
      this._contexts = {};
      this._sdkProcessingMetadata = {};
      this._propagationContext = {
        traceId: generateTraceId(),
        sampleRand: Math.random()
      };
    }
    clone() {
      const newScope = new Scope();
      newScope._breadcrumbs = [...this._breadcrumbs];
      newScope._tags = {
        ...this._tags
      };
      newScope._extra = {
        ...this._extra
      };
      newScope._contexts = {
        ...this._contexts
      };
      if (this._contexts.flags) {
        newScope._contexts.flags = {
          values: [...this._contexts.flags.values]
        };
      }
      newScope._user = this._user;
      newScope._level = this._level;
      newScope._session = this._session;
      newScope._transactionName = this._transactionName;
      newScope._fingerprint = this._fingerprint;
      newScope._eventProcessors = [...this._eventProcessors];
      newScope._attachments = [...this._attachments];
      newScope._sdkProcessingMetadata = {
        ...this._sdkProcessingMetadata
      };
      newScope._propagationContext = {
        ...this._propagationContext
      };
      newScope._client = this._client;
      newScope._lastEventId = this._lastEventId;
      _setSpanForScope(newScope, _getSpanForScope(this));
      return newScope;
    }
    setClient(client) {
      this._client = client;
    }
    setLastEventId(lastEventId) {
      this._lastEventId = lastEventId;
    }
    getClient() {
      return this._client;
    }
    lastEventId() {
      return this._lastEventId;
    }
    addScopeListener(callback) {
      this._scopeListeners.push(callback);
    }
    addEventProcessor(callback) {
      this._eventProcessors.push(callback);
      return this;
    }
    setUser(user) {
      this._user = user || {
        email: undefined,
        id: undefined,
        ip_address: undefined,
        username: undefined
      };
      if (this._session) {
        updateSession(this._session, {
          user
        });
      }
      this._notifyScopeListeners();
      return this;
    }
    getUser() {
      return this._user;
    }
    setTags(tags) {
      this._tags = {
        ...this._tags,
        ...tags
      };
      this._notifyScopeListeners();
      return this;
    }
    setTag(key, value) {
      this._tags = {
        ...this._tags,
        [key]: value
      };
      this._notifyScopeListeners();
      return this;
    }
    setExtras(extras) {
      this._extra = {
        ...this._extra,
        ...extras
      };
      this._notifyScopeListeners();
      return this;
    }
    setExtra(key, extra) {
      this._extra = {
        ...this._extra,
        [key]: extra
      };
      this._notifyScopeListeners();
      return this;
    }
    setFingerprint(fingerprint) {
      this._fingerprint = fingerprint;
      this._notifyScopeListeners();
      return this;
    }
    setLevel(level) {
      this._level = level;
      this._notifyScopeListeners();
      return this;
    }
    setTransactionName(name) {
      this._transactionName = name;
      this._notifyScopeListeners();
      return this;
    }
    setContext(key, context) {
      if (context === null) {
        delete this._contexts[key];
      } else {
        this._contexts[key] = context;
      }
      this._notifyScopeListeners();
      return this;
    }
    setSession(session) {
      if (!session) {
        delete this._session;
      } else {
        this._session = session;
      }
      this._notifyScopeListeners();
      return this;
    }
    getSession() {
      return this._session;
    }
    update(captureContext) {
      if (!captureContext) {
        return this;
      }
      const scopeToMerge = typeof captureContext === 'function' ? captureContext(this) : captureContext;
      const scopeInstance = scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : isPlainObject(scopeToMerge) ? captureContext : undefined;
      const {
        tags,
        extra,
        user,
        contexts,
        level,
        fingerprint = [],
        propagationContext
      } = scopeInstance || {};
      this._tags = {
        ...this._tags,
        ...tags
      };
      this._extra = {
        ...this._extra,
        ...extra
      };
      this._contexts = {
        ...this._contexts,
        ...contexts
      };
      if (user && Object.keys(user).length) {
        this._user = user;
      }
      if (level) {
        this._level = level;
      }
      if (fingerprint.length) {
        this._fingerprint = fingerprint;
      }
      if (propagationContext) {
        this._propagationContext = propagationContext;
      }
      return this;
    }
    clear() {
      this._breadcrumbs = [];
      this._tags = {};
      this._extra = {};
      this._user = {};
      this._contexts = {};
      this._level = undefined;
      this._transactionName = undefined;
      this._fingerprint = undefined;
      this._session = undefined;
      _setSpanForScope(this, undefined);
      this._attachments = [];
      this.setPropagationContext({
        traceId: generateTraceId(),
        sampleRand: Math.random()
      });
      this._notifyScopeListeners();
      return this;
    }
    addBreadcrumb(breadcrumb, maxBreadcrumbs) {
      const maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
      if (maxCrumbs <= 0) {
        return this;
      }
      const mergedBreadcrumb = {
        timestamp: dateTimestampInSeconds(),
        ...breadcrumb,
        message: breadcrumb.message ? truncate(breadcrumb.message, 2048) : breadcrumb.message
      };
      this._breadcrumbs.push(mergedBreadcrumb);
      if (this._breadcrumbs.length > maxCrumbs) {
        var _this$_client;
        this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
        (_this$_client = this._client) === null || _this$_client === void 0 ? void 0 : _this$_client.recordDroppedEvent('buffer_overflow', 'log_item');
      }
      this._notifyScopeListeners();
      return this;
    }
    getLastBreadcrumb() {
      return this._breadcrumbs[this._breadcrumbs.length - 1];
    }
    clearBreadcrumbs() {
      this._breadcrumbs = [];
      this._notifyScopeListeners();
      return this;
    }
    addAttachment(attachment) {
      this._attachments.push(attachment);
      return this;
    }
    clearAttachments() {
      this._attachments = [];
      return this;
    }
    getScopeData() {
      return {
        breadcrumbs: this._breadcrumbs,
        attachments: this._attachments,
        contexts: this._contexts,
        tags: this._tags,
        extra: this._extra,
        user: this._user,
        level: this._level,
        fingerprint: this._fingerprint || [],
        eventProcessors: this._eventProcessors,
        propagationContext: this._propagationContext,
        sdkProcessingMetadata: this._sdkProcessingMetadata,
        transactionName: this._transactionName,
        span: _getSpanForScope(this)
      };
    }
    setSDKProcessingMetadata(newData) {
      this._sdkProcessingMetadata = merge(this._sdkProcessingMetadata, newData, 2);
      return this;
    }
    setPropagationContext(context) {
      this._propagationContext = context;
      return this;
    }
    getPropagationContext() {
      return this._propagationContext;
    }
    captureException(exception, hint) {
      const eventId = (hint === null || hint === void 0 ? void 0 : hint.event_id) || uuid4();
      if (!this._client) {
        logger.warn('No client configured on scope - will not capture exception!');
        return eventId;
      }
      const syntheticException = new Error('Sentry syntheticException');
      this._client.captureException(exception, {
        originalException: exception,
        syntheticException,
        ...hint,
        event_id: eventId
      }, this);
      return eventId;
    }
    captureMessage(message, level, hint) {
      const eventId = (hint === null || hint === void 0 ? void 0 : hint.event_id) || uuid4();
      if (!this._client) {
        logger.warn('No client configured on scope - will not capture message!');
        return eventId;
      }
      const syntheticException = new Error(message);
      this._client.captureMessage(message, level, {
        originalException: message,
        syntheticException,
        ...hint,
        event_id: eventId
      }, this);
      return eventId;
    }
    captureEvent(event, hint) {
      const eventId = (hint === null || hint === void 0 ? void 0 : hint.event_id) || uuid4();
      if (!this._client) {
        logger.warn('No client configured on scope - will not capture event!');
        return eventId;
      }
      this._client.captureEvent(event, {
        ...hint,
        event_id: eventId
      }, this);
      return eventId;
    }
    _notifyScopeListeners() {
      if (!this._notifyingListeners) {
        this._notifyingListeners = true;
        this._scopeListeners.forEach(callback => {
          callback(this);
        });
        this._notifyingListeners = false;
      }
    }
  }

  function getDefaultCurrentScope() {
    return getGlobalSingleton('defaultCurrentScope', () => new Scope());
  }
  function getDefaultIsolationScope() {
    return getGlobalSingleton('defaultIsolationScope', () => new Scope());
  }

  class AsyncContextStack {
    constructor(scope, isolationScope) {
      let assignedScope;
      if (!scope) {
        assignedScope = new Scope();
      } else {
        assignedScope = scope;
      }
      let assignedIsolationScope;
      if (!isolationScope) {
        assignedIsolationScope = new Scope();
      } else {
        assignedIsolationScope = isolationScope;
      }
      this._stack = [{
        scope: assignedScope
      }];
      this._isolationScope = assignedIsolationScope;
    }
    withScope(callback) {
      const scope = this._pushScope();
      let maybePromiseResult;
      try {
        maybePromiseResult = callback(scope);
      } catch (e) {
        this._popScope();
        throw e;
      }
      if (isThenable(maybePromiseResult)) {
        return maybePromiseResult.then(res => {
          this._popScope();
          return res;
        }, e => {
          this._popScope();
          throw e;
        });
      }
      this._popScope();
      return maybePromiseResult;
    }
    getClient() {
      return this.getStackTop().client;
    }
    getScope() {
      return this.getStackTop().scope;
    }
    getIsolationScope() {
      return this._isolationScope;
    }
    getStackTop() {
      return this._stack[this._stack.length - 1];
    }
    _pushScope() {
      const scope = this.getScope().clone();
      this._stack.push({
        client: this.getClient(),
        scope
      });
      return scope;
    }
    _popScope() {
      if (this._stack.length <= 1) return false;
      return !!this._stack.pop();
    }
  }
  function getAsyncContextStack() {
    const registry = getMainCarrier();
    const sentry = getSentryCarrier(registry);
    return sentry.stack = sentry.stack || new AsyncContextStack(getDefaultCurrentScope(), getDefaultIsolationScope());
  }
  function withScope(callback) {
    return getAsyncContextStack().withScope(callback);
  }
  function withSetScope(scope, callback) {
    const stack = getAsyncContextStack();
    return stack.withScope(() => {
      stack.getStackTop().scope = scope;
      return callback(scope);
    });
  }
  function withIsolationScope(callback) {
    return getAsyncContextStack().withScope(() => {
      return callback(getAsyncContextStack().getIsolationScope());
    });
  }
  function getStackAsyncContextStrategy() {
    return {
      withIsolationScope,
      withScope,
      withSetScope,
      withSetIsolationScope: (_isolationScope, callback) => {
        return withIsolationScope(callback);
      },
      getCurrentScope: () => getAsyncContextStack().getScope(),
      getIsolationScope: () => getAsyncContextStack().getIsolationScope()
    };
  }

  function getAsyncContextStrategy(carrier) {
    const sentry = getSentryCarrier(carrier);
    if (sentry.acs) {
      return sentry.acs;
    }
    return getStackAsyncContextStrategy();
  }

  function getCurrentScope() {
    const carrier = getMainCarrier();
    const acs = getAsyncContextStrategy(carrier);
    return acs.getCurrentScope();
  }
  function getIsolationScope() {
    const carrier = getMainCarrier();
    const acs = getAsyncContextStrategy(carrier);
    return acs.getIsolationScope();
  }
  function getGlobalScope() {
    return getGlobalSingleton('globalScope', () => new Scope());
  }
  function getClient() {
    return getCurrentScope().getClient();
  }
  function getTraceContextFromScope(scope) {
    const propagationContext = scope.getPropagationContext();
    const {
      traceId,
      parentSpanId,
      propagationSpanId
    } = propagationContext;
    const traceContext = {
      trace_id: traceId,
      span_id: propagationSpanId || generateSpanId()
    };
    if (parentSpanId) {
      traceContext.parent_span_id = parentSpanId;
    }
    return traceContext;
  }

  const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = 'sentry.source';
  const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = 'sentry.sample_rate';
  const SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = 'sentry.previous_trace_sample_rate';
  const SEMANTIC_ATTRIBUTE_SENTRY_OP = 'sentry.op';
  const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = 'sentry.origin';
  const SEMANTIC_ATTRIBUTE_PROFILE_ID = 'sentry.profile_id';
  const SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = 'sentry.exclusive_time';

  const SPAN_STATUS_UNSET = 0;
  const SPAN_STATUS_OK = 1;

  const SCOPE_ON_START_SPAN_FIELD = '_sentryScope';
  const ISOLATION_SCOPE_ON_START_SPAN_FIELD = '_sentryIsolationScope';
  function getCapturedScopesOnSpan(span) {
    return {
      scope: span[SCOPE_ON_START_SPAN_FIELD],
      isolationScope: span[ISOLATION_SCOPE_ON_START_SPAN_FIELD]
    };
  }

  function parseSampleRate(sampleRate) {
    if (typeof sampleRate === 'boolean') {
      return Number(sampleRate);
    }
    const rate = typeof sampleRate === 'string' ? parseFloat(sampleRate) : sampleRate;
    if (typeof rate !== 'number' || isNaN(rate) || rate < 0 || rate > 1) {
      return undefined;
    }
    return rate;
  }

  const SENTRY_BAGGAGE_KEY_PREFIX = 'sentry-';
  const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
  function baggageHeaderToDynamicSamplingContext(baggageHeader) {
    const baggageObject = parseBaggageHeader(baggageHeader);
    if (!baggageObject) {
      return undefined;
    }
    const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
      if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
        const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
        acc[nonPrefixedKey] = value;
      }
      return acc;
    }, {});
    if (Object.keys(dynamicSamplingContext).length > 0) {
      return dynamicSamplingContext;
    } else {
      return undefined;
    }
  }
  function parseBaggageHeader(baggageHeader) {
    if (!baggageHeader || !isString(baggageHeader) && !Array.isArray(baggageHeader)) {
      return undefined;
    }
    if (Array.isArray(baggageHeader)) {
      return baggageHeader.reduce((acc, curr) => {
        const currBaggageObject = baggageHeaderToObject(curr);
        Object.entries(currBaggageObject).forEach(([key, value]) => {
          acc[key] = value;
        });
        return acc;
      }, {});
    }
    return baggageHeaderToObject(baggageHeader);
  }
  function baggageHeaderToObject(baggageHeader) {
    return baggageHeader.split(',').map(baggageEntry => baggageEntry.split('=').map(keyOrValue => {
      try {
        return decodeURIComponent(keyOrValue.trim());
      } catch {
        return;
      }
    })).reduce((acc, [key, value]) => {
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  const TRACE_FLAG_SAMPLED = 0x1;
  let hasShownSpanDropWarning = false;
  function spanToTraceContext(span) {
    const {
      spanId,
      traceId: trace_id,
      isRemote
    } = span.spanContext();
    const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
    const scope = getCapturedScopesOnSpan(span).scope;
    const span_id = isRemote ? (scope === null || scope === void 0 ? void 0 : scope.getPropagationContext().propagationSpanId) || generateSpanId() : spanId;
    return {
      parent_span_id,
      span_id,
      trace_id
    };
  }
  function convertSpanLinksForEnvelope(links) {
    if (links && links.length > 0) {
      return links.map(({
        context: {
          spanId,
          traceId,
          traceFlags,
          ...restContext
        },
        attributes
      }) => ({
        span_id: spanId,
        trace_id: traceId,
        sampled: traceFlags === TRACE_FLAG_SAMPLED,
        attributes,
        ...restContext
      }));
    } else {
      return undefined;
    }
  }
  function spanTimeInputToSeconds(input) {
    if (typeof input === 'number') {
      return ensureTimestampInSeconds(input);
    }
    if (Array.isArray(input)) {
      return input[0] + input[1] / 1e9;
    }
    if (input instanceof Date) {
      return ensureTimestampInSeconds(input.getTime());
    }
    return timestampInSeconds();
  }
  function ensureTimestampInSeconds(timestamp) {
    const isMs = timestamp > 9999999999;
    return isMs ? timestamp / 1000 : timestamp;
  }
  function spanToJSON(span) {
    if (spanIsSentrySpan(span)) {
      return span.getSpanJSON();
    }
    const {
      spanId: span_id,
      traceId: trace_id
    } = span.spanContext();
    if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
      var _span$parentSpanConte;
      const {
        attributes,
        startTime,
        name,
        endTime,
        status,
        links
      } = span;
      const parentSpanId = 'parentSpanId' in span ? span.parentSpanId : 'parentSpanContext' in span ? (_span$parentSpanConte = span.parentSpanContext) === null || _span$parentSpanConte === void 0 ? void 0 : _span$parentSpanConte.spanId : undefined;
      return {
        span_id,
        trace_id,
        data: attributes,
        description: name,
        parent_span_id: parentSpanId,
        start_timestamp: spanTimeInputToSeconds(startTime),
        timestamp: spanTimeInputToSeconds(endTime) || undefined,
        status: getStatusMessage(status),
        op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
        origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
        links: convertSpanLinksForEnvelope(links)
      };
    }
    return {
      span_id,
      trace_id,
      start_timestamp: 0,
      data: {}
    };
  }
  function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
    const castSpan = span;
    return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
  }
  function spanIsSentrySpan(span) {
    return typeof span.getSpanJSON === 'function';
  }
  function spanIsSampled(span) {
    const {
      traceFlags
    } = span.spanContext();
    return traceFlags === TRACE_FLAG_SAMPLED;
  }
  function getStatusMessage(status) {
    if (!status || status.code === SPAN_STATUS_UNSET) {
      return undefined;
    }
    if (status.code === SPAN_STATUS_OK) {
      return 'ok';
    }
    return status.message || 'unknown_error';
  }
  const ROOT_SPAN_FIELD = '_sentryRootSpan';
  function getRootSpan(span) {
    return span[ROOT_SPAN_FIELD] || span;
  }
  function showSpanDropWarning() {
    if (!hasShownSpanDropWarning) {
      consoleSandbox(() => {
        console.warn('[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly.');
      });
      hasShownSpanDropWarning = true;
    }
  }

  const STACKTRACE_FRAME_LIMIT = 50;
  const UNKNOWN_FUNCTION = '?';
  const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
  const STRIP_FRAME_REGEXP = /captureMessage|captureException/;
  function createStackParser(...parsers) {
    const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);
    return (stack, skipFirstLines = 0, framesToPop = 0) => {
      const frames = [];
      const lines = stack.split('\n');
      for (let i = skipFirstLines; i < lines.length; i++) {
        const line = lines[i];
        if (line.length > 1024) {
          continue;
        }
        const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;
        if (cleanedLine.match(/\S*Error: /)) {
          continue;
        }
        for (const parser of sortedParsers) {
          const frame = parser(cleanedLine);
          if (frame) {
            frames.push(frame);
            break;
          }
        }
        if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
          break;
        }
      }
      return stripSentryFramesAndReverse(frames.slice(framesToPop));
    };
  }
  function stripSentryFramesAndReverse(stack) {
    if (!stack.length) {
      return [];
    }
    const localStack = Array.from(stack);
    if (/sentryWrapped/.test(getLastStackFrame(localStack).function || '')) {
      localStack.pop();
    }
    localStack.reverse();
    if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || '')) {
      localStack.pop();
      if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || '')) {
        localStack.pop();
      }
    }
    return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map(frame => ({
      ...frame,
      filename: frame.filename || getLastStackFrame(localStack).filename,
      function: frame.function || UNKNOWN_FUNCTION
    }));
  }
  function getLastStackFrame(arr) {
    return arr[arr.length - 1] || {};
  }
  const defaultFunctionName = '<anonymous>';
  function getFunctionName(fn) {
    try {
      if (!fn || typeof fn !== 'function') {
        return defaultFunctionName;
      }
      return fn.name || defaultFunctionName;
    } catch (e) {
      return defaultFunctionName;
    }
  }
  function getFramesFromEvent(event) {
    const exception = event.exception;
    if (exception) {
      const frames = [];
      try {
        exception.values.forEach(value => {
          if (value.stacktrace.frames) {
            frames.push(...value.stacktrace.frames);
          }
        });
        return frames;
      } catch (_oO) {
        return undefined;
      }
    }
    return undefined;
  }

  function hasSpansEnabled(maybeOptions) {
    var _getClient;
    if (typeof __SENTRY_TRACING__ === 'boolean' && !__SENTRY_TRACING__) {
      return false;
    }
    const options = maybeOptions || ((_getClient = getClient()) === null || _getClient === void 0 ? void 0 : _getClient.getOptions());
    return !!options && (options.tracesSampleRate != null || !!options.tracesSampler);
  }

  const DEFAULT_ENVIRONMENT = 'production';

  const ORG_ID_REGEX = /^o(\d+)\./;
  const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
  function isValidProtocol(protocol) {
    return protocol === 'http' || protocol === 'https';
  }
  function dsnToString(dsn, withPassword = false) {
    const {
      host,
      path,
      pass,
      port,
      projectId,
      protocol,
      publicKey
    } = dsn;
    return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ''}` + `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`;
  }
  function dsnFromString(str) {
    const match = DSN_REGEX.exec(str);
    if (!match) {
      consoleSandbox(() => {
        console.error(`Invalid Sentry Dsn: ${str}`);
      });
      return undefined;
    }
    const [protocol, publicKey, pass = '', host = '', port = '', lastPath = ''] = match.slice(1);
    let path = '';
    let projectId = lastPath;
    const split = projectId.split('/');
    if (split.length > 1) {
      path = split.slice(0, -1).join('/');
      projectId = split.pop();
    }
    if (projectId) {
      const projectMatch = projectId.match(/^\d+/);
      if (projectMatch) {
        projectId = projectMatch[0];
      }
    }
    return dsnFromComponents({
      host,
      pass,
      path,
      projectId,
      port,
      protocol: protocol,
      publicKey
    });
  }
  function dsnFromComponents(components) {
    return {
      protocol: components.protocol,
      publicKey: components.publicKey || '',
      pass: components.pass || '',
      host: components.host,
      port: components.port || '',
      path: components.path || '',
      projectId: components.projectId
    };
  }
  function validateDsn(dsn) {
    if (!DEBUG_BUILD) {
      return true;
    }
    const {
      port,
      projectId,
      protocol
    } = dsn;
    const requiredComponents = ['protocol', 'publicKey', 'host', 'projectId'];
    const hasMissingRequiredComponent = requiredComponents.find(component => {
      if (!dsn[component]) {
        logger.error(`Invalid Sentry Dsn: ${component} missing`);
        return true;
      }
      return false;
    });
    if (hasMissingRequiredComponent) {
      return false;
    }
    if (!projectId.match(/^\d+$/)) {
      logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
      return false;
    }
    if (!isValidProtocol(protocol)) {
      logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
      return false;
    }
    if (port && isNaN(parseInt(port, 10))) {
      logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
      return false;
    }
    return true;
  }
  function extractOrgIdFromDsnHost(host) {
    const match = host.match(ORG_ID_REGEX);
    return match === null || match === void 0 ? void 0 : match[1];
  }
  function makeDsn(from) {
    const components = typeof from === 'string' ? dsnFromString(from) : dsnFromComponents(from);
    if (!components || !validateDsn(components)) {
      return undefined;
    }
    return components;
  }

  const FROZEN_DSC_FIELD = '_frozenDsc';
  function getDynamicSamplingContextFromClient(trace_id, client) {
    const options = client.getOptions();
    const {
      publicKey: public_key,
      host
    } = client.getDsn() || {};
    let org_id;
    if (options.orgId) {
      org_id = String(options.orgId);
    } else if (host) {
      org_id = extractOrgIdFromDsnHost(host);
    }
    const dsc = {
      environment: options.environment || DEFAULT_ENVIRONMENT,
      release: options.release,
      public_key,
      trace_id,
      org_id
    };
    client.emit('createDsc', dsc);
    return dsc;
  }
  function getDynamicSamplingContextFromScope(client, scope) {
    const propagationContext = scope.getPropagationContext();
    return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
  }
  function getDynamicSamplingContextFromSpan(span) {
    const client = getClient();
    if (!client) {
      return {};
    }
    const rootSpan = getRootSpan(span);
    const rootSpanJson = spanToJSON(rootSpan);
    const rootSpanAttributes = rootSpanJson.data;
    const traceState = rootSpan.spanContext().traceState;
    const rootSpanSampleRate = (traceState === null || traceState === void 0 ? void 0 : traceState.get('sentry.sample_rate')) ?? rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE] ?? rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE];
    function applyLocalSampleRateToDsc(dsc) {
      if (typeof rootSpanSampleRate === 'number' || typeof rootSpanSampleRate === 'string') {
        dsc.sample_rate = `${rootSpanSampleRate}`;
      }
      return dsc;
    }
    const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
    if (frozenDsc) {
      return applyLocalSampleRateToDsc(frozenDsc);
    }
    const traceStateDsc = traceState === null || traceState === void 0 ? void 0 : traceState.get('sentry.dsc');
    const dscOnTraceState = traceStateDsc && baggageHeaderToDynamicSamplingContext(traceStateDsc);
    if (dscOnTraceState) {
      return applyLocalSampleRateToDsc(dscOnTraceState);
    }
    const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);
    const source = rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
    const name = rootSpanJson.description;
    if (source !== 'url' && name) {
      dsc.transaction = name;
    }
    if (hasSpansEnabled()) {
      var _getCapturedScopesOnS;
      dsc.sampled = String(spanIsSampled(rootSpan));
      dsc.sample_rand = (traceState === null || traceState === void 0 ? void 0 : traceState.get('sentry.sample_rand')) ?? ((_getCapturedScopesOnS = getCapturedScopesOnSpan(rootSpan).scope) === null || _getCapturedScopesOnS === void 0 ? void 0 : _getCapturedScopesOnS.getPropagationContext().sampleRand.toString());
    }
    applyLocalSampleRateToDsc(dsc);
    client.emit('createDsc', dsc, rootSpan);
    return dsc;
  }

  function normalize(input, depth = 100, maxProperties = +Infinity) {
    try {
      return visit('', input, depth, maxProperties);
    } catch (err) {
      return {
        ERROR: `**non-serializable** (${err})`
      };
    }
  }
  function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
    const normalized = normalize(object, depth);
    if (jsonSize(normalized) > maxSize) {
      return normalizeToSize(object, depth - 1, maxSize);
    }
    return normalized;
  }
  function visit(key, value, depth = +Infinity, maxProperties = +Infinity, memo = memoBuilder()) {
    const [memoize, unmemoize] = memo;
    if (value == null || ['boolean', 'string'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    const stringified = stringifyValue(key, value);
    if (!stringified.startsWith('[object ')) {
      return stringified;
    }
    if (value['__sentry_skip_normalization__']) {
      return value;
    }
    const remainingDepth = typeof value['__sentry_override_normalization_depth__'] === 'number' ? value['__sentry_override_normalization_depth__'] : depth;
    if (remainingDepth === 0) {
      return stringified.replace('object ', '');
    }
    if (memoize(value)) {
      return '[Circular ~]';
    }
    const valueWithToJSON = value;
    if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
      try {
        const jsonValue = valueWithToJSON.toJSON();
        return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
      } catch (err) {}
    }
    const normalized = Array.isArray(value) ? [] : {};
    let numAdded = 0;
    const visitable = convertToPlainObject(value);
    for (const visitKey in visitable) {
      if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
        continue;
      }
      if (numAdded >= maxProperties) {
        normalized[visitKey] = '[MaxProperties ~]';
        break;
      }
      const visitValue = visitable[visitKey];
      normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
      numAdded++;
    }
    unmemoize(value);
    return normalized;
  }
  function stringifyValue(key, value) {
    try {
      if (key === 'domain' && value && typeof value === 'object' && value._events) {
        return '[Domain]';
      }
      if (key === 'domainEmitter') {
        return '[DomainEmitter]';
      }
      if (typeof global !== 'undefined' && value === global) {
        return '[Global]';
      }
      if (typeof window !== 'undefined' && value === window) {
        return '[Window]';
      }
      if (typeof document !== 'undefined' && value === document) {
        return '[Document]';
      }
      if (isVueViewModel(value)) {
        return '[VueViewModel]';
      }
      if (isSyntheticEvent(value)) {
        return '[SyntheticEvent]';
      }
      if (typeof value === 'number' && !Number.isFinite(value)) {
        return `[${value}]`;
      }
      if (typeof value === 'function') {
        return `[Function: ${getFunctionName(value)}]`;
      }
      if (typeof value === 'symbol') {
        return `[${String(value)}]`;
      }
      if (typeof value === 'bigint') {
        return `[BigInt: ${String(value)}]`;
      }
      const objName = getConstructorName(value);
      if (/^HTML(\w*)Element$/.test(objName)) {
        return `[HTMLElement: ${objName}]`;
      }
      return `[object ${objName}]`;
    } catch (err) {
      return `**non-serializable** (${err})`;
    }
  }
  function getConstructorName(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype !== null && prototype !== void 0 && prototype.constructor ? prototype.constructor.name : 'null prototype';
  }
  function utf8Length(value) {
    return ~-encodeURI(value).split(/%..|./).length;
  }
  function jsonSize(value) {
    return utf8Length(JSON.stringify(value));
  }
  function memoBuilder() {
    const inner = new WeakSet();
    function memoize(obj) {
      if (inner.has(obj)) {
        return true;
      }
      inner.add(obj);
      return false;
    }
    function unmemoize(obj) {
      inner.delete(obj);
    }
    return [memoize, unmemoize];
  }

  function createEnvelope(headers, items = []) {
    return [headers, items];
  }
  function addItemToEnvelope(envelope, newItem) {
    const [headers, items] = envelope;
    return [headers, [...items, newItem]];
  }
  function forEachEnvelopeItem(envelope, callback) {
    const envelopeItems = envelope[1];
    for (const envelopeItem of envelopeItems) {
      const envelopeItemType = envelopeItem[0].type;
      const result = callback(envelopeItem, envelopeItemType);
      if (result) {
        return true;
      }
    }
    return false;
  }
  function encodeUTF8(input) {
    const carrier = getSentryCarrier(GLOBAL_OBJ);
    return carrier.encodePolyfill ? carrier.encodePolyfill(input) : new TextEncoder().encode(input);
  }
  function serializeEnvelope(envelope) {
    const [envHeaders, items] = envelope;
    let parts = JSON.stringify(envHeaders);
    function append(next) {
      if (typeof parts === 'string') {
        parts = typeof next === 'string' ? parts + next : [encodeUTF8(parts), next];
      } else {
        parts.push(typeof next === 'string' ? encodeUTF8(next) : next);
      }
    }
    for (const item of items) {
      const [itemHeaders, payload] = item;
      append(`\n${JSON.stringify(itemHeaders)}\n`);
      if (typeof payload === 'string' || payload instanceof Uint8Array) {
        append(payload);
      } else {
        let stringifiedPayload;
        try {
          stringifiedPayload = JSON.stringify(payload);
        } catch (e) {
          stringifiedPayload = JSON.stringify(normalize(payload));
        }
        append(stringifiedPayload);
      }
    }
    return typeof parts === 'string' ? parts : concatBuffers(parts);
  }
  function concatBuffers(buffers) {
    const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of buffers) {
      merged.set(buffer, offset);
      offset += buffer.length;
    }
    return merged;
  }
  function createAttachmentEnvelopeItem(attachment) {
    const buffer = typeof attachment.data === 'string' ? encodeUTF8(attachment.data) : attachment.data;
    return [{
      type: 'attachment',
      length: buffer.length,
      filename: attachment.filename,
      content_type: attachment.contentType,
      attachment_type: attachment.attachmentType
    }, buffer];
  }
  const ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
    session: 'session',
    sessions: 'session',
    attachment: 'attachment',
    transaction: 'transaction',
    event: 'error',
    client_report: 'internal',
    user_report: 'default',
    profile: 'profile',
    profile_chunk: 'profile',
    replay_event: 'replay',
    replay_recording: 'replay',
    check_in: 'monitor',
    feedback: 'feedback',
    span: 'span',
    raw_security: 'security',
    log: 'log_item'
  };
  function envelopeItemTypeToDataCategory(type) {
    return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
  }
  function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
    if (!(metadataOrEvent !== null && metadataOrEvent !== void 0 && metadataOrEvent.sdk)) {
      return;
    }
    const {
      name,
      version
    } = metadataOrEvent.sdk;
    return {
      name,
      version
    };
  }
  function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
    var _event$sdkProcessingM;
    const dynamicSamplingContext = (_event$sdkProcessingM = event.sdkProcessingMetadata) === null || _event$sdkProcessingM === void 0 ? void 0 : _event$sdkProcessingM.dynamicSamplingContext;
    return {
      event_id: event.event_id,
      sent_at: new Date().toISOString(),
      ...(sdkInfo && {
        sdk: sdkInfo
      }),
      ...(!!tunnel && dsn && {
        dsn: dsnToString(dsn)
      }),
      ...(dynamicSamplingContext && {
        trace: dynamicSamplingContext
      })
    };
  }

  function enhanceEventWithSdkInfo(event, sdkInfo) {
    if (!sdkInfo) {
      return event;
    }
    event.sdk = event.sdk || {};
    event.sdk.name = event.sdk.name || sdkInfo.name;
    event.sdk.version = event.sdk.version || sdkInfo.version;
    event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
    event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
    return event;
  }
  function createSessionEnvelope(session, dsn, metadata, tunnel) {
    const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
    const envelopeHeaders = {
      sent_at: new Date().toISOString(),
      ...(sdkInfo && {
        sdk: sdkInfo
      }),
      ...(!!tunnel && dsn && {
        dsn: dsnToString(dsn)
      })
    };
    const envelopeItem = 'aggregates' in session ? [{
      type: 'sessions'
    }, session] : [{
      type: 'session'
    }, session.toJSON()];
    return createEnvelope(envelopeHeaders, [envelopeItem]);
  }
  function createEventEnvelope(event, dsn, metadata, tunnel) {
    const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
    const eventType = event.type && event.type !== 'replay_event' ? event.type : 'event';
    enhanceEventWithSdkInfo(event, metadata === null || metadata === void 0 ? void 0 : metadata.sdk);
    const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
    delete event.sdkProcessingMetadata;
    const eventItem = [{
      type: eventType
    }, event];
    return createEnvelope(envelopeHeaders, [eventItem]);
  }

  var States;
  (function (States) {
    const PENDING = 0;
    States[States["PENDING"] = PENDING] = "PENDING";
    const RESOLVED = 1;
    States[States["RESOLVED"] = RESOLVED] = "RESOLVED";
    const REJECTED = 2;
    States[States["REJECTED"] = REJECTED] = "REJECTED";
  })(States || (States = {}));
  function resolvedSyncPromise(value) {
    return new SyncPromise(resolve => {
      resolve(value);
    });
  }
  function rejectedSyncPromise(reason) {
    return new SyncPromise((_, reject) => {
      reject(reason);
    });
  }
  class SyncPromise {
    constructor(executor) {
      this._state = States.PENDING;
      this._handlers = [];
      this._runExecutor(executor);
    }
    then(onfulfilled, onrejected) {
      return new SyncPromise((resolve, reject) => {
        this._handlers.push([false, result => {
          if (!onfulfilled) {
            resolve(result);
          } else {
            try {
              resolve(onfulfilled(result));
            } catch (e) {
              reject(e);
            }
          }
        }, reason => {
          if (!onrejected) {
            reject(reason);
          } else {
            try {
              resolve(onrejected(reason));
            } catch (e) {
              reject(e);
            }
          }
        }]);
        this._executeHandlers();
      });
    }
    catch(onrejected) {
      return this.then(val => val, onrejected);
    }
    finally(onfinally) {
      return new SyncPromise((resolve, reject) => {
        let val;
        let isRejected;
        return this.then(value => {
          isRejected = false;
          val = value;
          if (onfinally) {
            onfinally();
          }
        }, reason => {
          isRejected = true;
          val = reason;
          if (onfinally) {
            onfinally();
          }
        }).then(() => {
          if (isRejected) {
            reject(val);
            return;
          }
          resolve(val);
        });
      });
    }
    _executeHandlers() {
      if (this._state === States.PENDING) {
        return;
      }
      const cachedHandlers = this._handlers.slice();
      this._handlers = [];
      cachedHandlers.forEach(handler => {
        if (handler[0]) {
          return;
        }
        if (this._state === States.RESOLVED) {
          handler[1](this._value);
        }
        if (this._state === States.REJECTED) {
          handler[2](this._value);
        }
        handler[0] = true;
      });
    }
    _runExecutor(executor) {
      const setResult = (state, value) => {
        if (this._state !== States.PENDING) {
          return;
        }
        if (isThenable(value)) {
          void value.then(resolve, reject);
          return;
        }
        this._state = state;
        this._value = value;
        this._executeHandlers();
      };
      const resolve = value => {
        setResult(States.RESOLVED, value);
      };
      const reject = reason => {
        setResult(States.REJECTED, reason);
      };
      try {
        executor(resolve, reject);
      } catch (e) {
        reject(e);
      }
    }
  }

  function notifyEventProcessors(processors, event, hint, index = 0) {
    return new SyncPromise((resolve, reject) => {
      const processor = processors[index];
      if (event === null || typeof processor !== 'function') {
        resolve(event);
      } else {
        const result = processor({
          ...event
        }, hint);
        DEBUG_BUILD && processor.id && result === null && logger.log(`Event processor "${processor.id}" dropped event`);
        if (isThenable(result)) {
          void result.then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve)).then(null, reject);
        } else {
          void notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
        }
      }
    });
  }

  let parsedStackResults;
  let lastKeysCount;
  let cachedFilenameDebugIds;
  function getFilenameToDebugIdMap(stackParser) {
    const debugIdMap = GLOBAL_OBJ._sentryDebugIds;
    if (!debugIdMap) {
      return {};
    }
    const debugIdKeys = Object.keys(debugIdMap);
    if (cachedFilenameDebugIds && debugIdKeys.length === lastKeysCount) {
      return cachedFilenameDebugIds;
    }
    lastKeysCount = debugIdKeys.length;
    cachedFilenameDebugIds = debugIdKeys.reduce((acc, stackKey) => {
      if (!parsedStackResults) {
        parsedStackResults = {};
      }
      const result = parsedStackResults[stackKey];
      if (result) {
        acc[result[0]] = result[1];
      } else {
        const parsedStack = stackParser(stackKey);
        for (let i = parsedStack.length - 1; i >= 0; i--) {
          const stackFrame = parsedStack[i];
          const filename = stackFrame === null || stackFrame === void 0 ? void 0 : stackFrame.filename;
          const debugId = debugIdMap[stackKey];
          if (filename && debugId) {
            acc[filename] = debugId;
            parsedStackResults[stackKey] = [filename, debugId];
            break;
          }
        }
      }
      return acc;
    }, {});
    return cachedFilenameDebugIds;
  }

  function applyScopeDataToEvent(event, data) {
    const {
      fingerprint,
      span,
      breadcrumbs,
      sdkProcessingMetadata
    } = data;
    applyDataToEvent(event, data);
    if (span) {
      applySpanToEvent(event, span);
    }
    applyFingerprintToEvent(event, fingerprint);
    applyBreadcrumbsToEvent(event, breadcrumbs);
    applySdkMetadataToEvent(event, sdkProcessingMetadata);
  }
  function mergeScopeData(data, mergeData) {
    const {
      extra,
      tags,
      user,
      contexts,
      level,
      sdkProcessingMetadata,
      breadcrumbs,
      fingerprint,
      eventProcessors,
      attachments,
      propagationContext,
      transactionName,
      span
    } = mergeData;
    mergeAndOverwriteScopeData(data, 'extra', extra);
    mergeAndOverwriteScopeData(data, 'tags', tags);
    mergeAndOverwriteScopeData(data, 'user', user);
    mergeAndOverwriteScopeData(data, 'contexts', contexts);
    data.sdkProcessingMetadata = merge(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
    if (level) {
      data.level = level;
    }
    if (transactionName) {
      data.transactionName = transactionName;
    }
    if (span) {
      data.span = span;
    }
    if (breadcrumbs.length) {
      data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
    }
    if (fingerprint.length) {
      data.fingerprint = [...data.fingerprint, ...fingerprint];
    }
    if (eventProcessors.length) {
      data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
    }
    if (attachments.length) {
      data.attachments = [...data.attachments, ...attachments];
    }
    data.propagationContext = {
      ...data.propagationContext,
      ...propagationContext
    };
  }
  function mergeAndOverwriteScopeData(data, prop, mergeVal) {
    data[prop] = merge(data[prop], mergeVal, 1);
  }
  function applyDataToEvent(event, data) {
    const {
      extra,
      tags,
      user,
      contexts,
      level,
      transactionName
    } = data;
    if (Object.keys(extra).length) {
      event.extra = {
        ...extra,
        ...event.extra
      };
    }
    if (Object.keys(tags).length) {
      event.tags = {
        ...tags,
        ...event.tags
      };
    }
    if (Object.keys(user).length) {
      event.user = {
        ...user,
        ...event.user
      };
    }
    if (Object.keys(contexts).length) {
      event.contexts = {
        ...contexts,
        ...event.contexts
      };
    }
    if (level) {
      event.level = level;
    }
    if (transactionName && event.type !== 'transaction') {
      event.transaction = transactionName;
    }
  }
  function applyBreadcrumbsToEvent(event, breadcrumbs) {
    const mergedBreadcrumbs = [...(event.breadcrumbs || []), ...breadcrumbs];
    event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
  }
  function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
    event.sdkProcessingMetadata = {
      ...event.sdkProcessingMetadata,
      ...sdkProcessingMetadata
    };
  }
  function applySpanToEvent(event, span) {
    event.contexts = {
      trace: spanToTraceContext(span),
      ...event.contexts
    };
    event.sdkProcessingMetadata = {
      dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
      ...event.sdkProcessingMetadata
    };
    const rootSpan = getRootSpan(span);
    const transactionName = spanToJSON(rootSpan).description;
    if (transactionName && !event.transaction && event.type === 'transaction') {
      event.transaction = transactionName;
    }
  }
  function applyFingerprintToEvent(event, fingerprint) {
    event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];
    if (fingerprint) {
      event.fingerprint = event.fingerprint.concat(fingerprint);
    }
    if (!event.fingerprint.length) {
      delete event.fingerprint;
    }
  }

  function prepareEvent(options, event, hint, scope, client, isolationScope) {
    const {
      normalizeDepth = 3,
      normalizeMaxBreadth = 1000
    } = options;
    const prepared = {
      ...event,
      event_id: event.event_id || hint.event_id || uuid4(),
      timestamp: event.timestamp || dateTimestampInSeconds()
    };
    const integrations = hint.integrations || options.integrations.map(i => i.name);
    applyClientOptions(prepared, options);
    applyIntegrationsMetadata(prepared, integrations);
    if (client) {
      client.emit('applyFrameMetadata', event);
    }
    if (event.type === undefined) {
      applyDebugIds(prepared, options.stackParser);
    }
    const finalScope = getFinalScope(scope, hint.captureContext);
    if (hint.mechanism) {
      addExceptionMechanism(prepared, hint.mechanism);
    }
    const clientEventProcessors = client ? client.getEventProcessors() : [];
    const data = getGlobalScope().getScopeData();
    if (isolationScope) {
      const isolationData = isolationScope.getScopeData();
      mergeScopeData(data, isolationData);
    }
    if (finalScope) {
      const finalScopeData = finalScope.getScopeData();
      mergeScopeData(data, finalScopeData);
    }
    const attachments = [...(hint.attachments || []), ...data.attachments];
    if (attachments.length) {
      hint.attachments = attachments;
    }
    applyScopeDataToEvent(prepared, data);
    const eventProcessors = [...clientEventProcessors, ...data.eventProcessors];
    const result = notifyEventProcessors(eventProcessors, prepared, hint);
    return result.then(evt => {
      if (evt) {
        applyDebugMeta(evt);
      }
      if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
        return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
      }
      return evt;
    });
  }
  function applyClientOptions(event, options) {
    const {
      environment,
      release,
      dist,
      maxValueLength = 250
    } = options;
    event.environment = event.environment || environment || DEFAULT_ENVIRONMENT;
    if (!event.release && release) {
      event.release = release;
    }
    if (!event.dist && dist) {
      event.dist = dist;
    }
    const request = event.request;
    if (request !== null && request !== void 0 && request.url) {
      request.url = truncate(request.url, maxValueLength);
    }
  }
  function applyDebugIds(event, stackParser) {
    var _event$exception, _event$exception$valu;
    const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
    (_event$exception = event.exception) === null || _event$exception === void 0 ? void 0 : (_event$exception$valu = _event$exception.values) === null || _event$exception$valu === void 0 ? void 0 : _event$exception$valu.forEach(exception => {
      var _exception$stacktrace, _exception$stacktrace2;
      (_exception$stacktrace = exception.stacktrace) === null || _exception$stacktrace === void 0 ? void 0 : (_exception$stacktrace2 = _exception$stacktrace.frames) === null || _exception$stacktrace2 === void 0 ? void 0 : _exception$stacktrace2.forEach(frame => {
        if (frame.filename) {
          frame.debug_id = filenameDebugIdMap[frame.filename];
        }
      });
    });
  }
  function applyDebugMeta(event) {
    var _event$exception2, _event$exception2$val;
    const filenameDebugIdMap = {};
    (_event$exception2 = event.exception) === null || _event$exception2 === void 0 ? void 0 : (_event$exception2$val = _event$exception2.values) === null || _event$exception2$val === void 0 ? void 0 : _event$exception2$val.forEach(exception => {
      var _exception$stacktrace3, _exception$stacktrace4;
      (_exception$stacktrace3 = exception.stacktrace) === null || _exception$stacktrace3 === void 0 ? void 0 : (_exception$stacktrace4 = _exception$stacktrace3.frames) === null || _exception$stacktrace4 === void 0 ? void 0 : _exception$stacktrace4.forEach(frame => {
        if (frame.debug_id) {
          if (frame.abs_path) {
            filenameDebugIdMap[frame.abs_path] = frame.debug_id;
          } else if (frame.filename) {
            filenameDebugIdMap[frame.filename] = frame.debug_id;
          }
          delete frame.debug_id;
        }
      });
    });
    if (Object.keys(filenameDebugIdMap).length === 0) {
      return;
    }
    event.debug_meta = event.debug_meta || {};
    event.debug_meta.images = event.debug_meta.images || [];
    const images = event.debug_meta.images;
    Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
      images.push({
        type: 'sourcemap',
        code_file: filename,
        debug_id
      });
    });
  }
  function applyIntegrationsMetadata(event, integrationNames) {
    if (integrationNames.length > 0) {
      event.sdk = event.sdk || {};
      event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames];
    }
  }
  function normalizeEvent(event, depth, maxBreadth) {
    var _event$contexts, _event$contexts2;
    if (!event) {
      return null;
    }
    const normalized = {
      ...event,
      ...(event.breadcrumbs && {
        breadcrumbs: event.breadcrumbs.map(b => ({
          ...b,
          ...(b.data && {
            data: normalize(b.data, depth, maxBreadth)
          })
        }))
      }),
      ...(event.user && {
        user: normalize(event.user, depth, maxBreadth)
      }),
      ...(event.contexts && {
        contexts: normalize(event.contexts, depth, maxBreadth)
      }),
      ...(event.extra && {
        extra: normalize(event.extra, depth, maxBreadth)
      })
    };
    if ((_event$contexts = event.contexts) !== null && _event$contexts !== void 0 && _event$contexts.trace && normalized.contexts) {
      normalized.contexts.trace = event.contexts.trace;
      if (event.contexts.trace.data) {
        normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
      }
    }
    if (event.spans) {
      normalized.spans = event.spans.map(span => {
        return {
          ...span,
          ...(span.data && {
            data: normalize(span.data, depth, maxBreadth)
          })
        };
      });
    }
    if ((_event$contexts2 = event.contexts) !== null && _event$contexts2 !== void 0 && _event$contexts2.flags && normalized.contexts) {
      normalized.contexts.flags = normalize(event.contexts.flags, 3, maxBreadth);
    }
    return normalized;
  }
  function getFinalScope(scope, captureContext) {
    if (!captureContext) {
      return scope;
    }
    const finalScope = scope ? scope.clone() : new Scope();
    finalScope.update(captureContext);
    return finalScope;
  }

  const SENTRY_API_VERSION = '7';
  function getBaseApiEndpoint(dsn) {
    const protocol = dsn.protocol ? `${dsn.protocol}:` : '';
    const port = dsn.port ? `:${dsn.port}` : '';
    return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ''}/api/`;
  }
  function _getIngestEndpoint(dsn) {
    return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
  }
  function _encodedAuth(dsn, sdkInfo) {
    const params = {
      sentry_version: SENTRY_API_VERSION
    };
    if (dsn.publicKey) {
      params.sentry_key = dsn.publicKey;
    }
    if (sdkInfo) {
      params.sentry_client = `${sdkInfo.name}/${sdkInfo.version}`;
    }
    return new URLSearchParams(params).toString();
  }
  function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
    return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
  }

  const installedIntegrations = [];
  function setupIntegrations(client, integrations) {
    const integrationIndex = {};
    integrations.forEach(integration => {
      if (integration) {
        setupIntegration(client, integration, integrationIndex);
      }
    });
    return integrationIndex;
  }
  function afterSetupIntegrations(client, integrations) {
    for (const integration of integrations) {
      if (integration !== null && integration !== void 0 && integration.afterAllSetup) {
        integration.afterAllSetup(client);
      }
    }
  }
  function setupIntegration(client, integration, integrationIndex) {
    if (integrationIndex[integration.name]) {
      DEBUG_BUILD && logger.log(`Integration skipped because it was already installed: ${integration.name}`);
      return;
    }
    integrationIndex[integration.name] = integration;
    if (installedIntegrations.indexOf(integration.name) === -1 && typeof integration.setupOnce === 'function') {
      integration.setupOnce();
      installedIntegrations.push(integration.name);
    }
    if (integration.setup && typeof integration.setup === 'function') {
      integration.setup(client);
    }
    if (typeof integration.preprocessEvent === 'function') {
      const callback = integration.preprocessEvent.bind(integration);
      client.on('preprocessEvent', (event, hint) => callback(event, hint, client));
    }
    if (typeof integration.processEvent === 'function') {
      const callback = integration.processEvent.bind(integration);
      const processor = Object.assign((event, hint) => callback(event, hint, client), {
        id: integration.name
      });
      client.addEventProcessor(processor);
    }
    DEBUG_BUILD && logger.log(`Integration installed: ${integration.name}`);
  }
  function defineIntegration(fn) {
    return fn;
  }

  function getPossibleEventMessages(event) {
    const possibleMessages = [];
    if (event.message) {
      possibleMessages.push(event.message);
    }
    try {
      const lastException = event.exception.values[event.exception.values.length - 1];
      if (lastException !== null && lastException !== void 0 && lastException.value) {
        possibleMessages.push(lastException.value);
        if (lastException.type) {
          possibleMessages.push(`${lastException.type}: ${lastException.value}`);
        }
      }
    } catch (e) {}
    return possibleMessages;
  }

  function convertTransactionEventToSpanJson(event) {
    var _event$contexts;
    const {
      trace_id,
      parent_span_id,
      span_id,
      status,
      origin,
      data,
      op
    } = ((_event$contexts = event.contexts) === null || _event$contexts === void 0 ? void 0 : _event$contexts.trace) ?? {};
    return {
      data: data ?? {},
      description: event.transaction,
      op,
      parent_span_id,
      span_id: span_id ?? '',
      start_timestamp: event.start_timestamp ?? 0,
      status,
      timestamp: event.timestamp,
      trace_id: trace_id ?? '',
      origin,
      profile_id: data === null || data === void 0 ? void 0 : data[SEMANTIC_ATTRIBUTE_PROFILE_ID],
      exclusive_time: data === null || data === void 0 ? void 0 : data[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
      measurements: event.measurements,
      is_segment: true
    };
  }
  function convertSpanJsonToTransactionEvent(span) {
    return {
      type: 'transaction',
      timestamp: span.timestamp,
      start_timestamp: span.start_timestamp,
      transaction: span.description,
      contexts: {
        trace: {
          trace_id: span.trace_id,
          span_id: span.span_id,
          parent_span_id: span.parent_span_id,
          op: span.op,
          status: span.status,
          origin: span.origin,
          data: {
            ...span.data,
            ...(span.profile_id && {
              [SEMANTIC_ATTRIBUTE_PROFILE_ID]: span.profile_id
            }),
            ...(span.exclusive_time && {
              [SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: span.exclusive_time
            })
          }
        }
      },
      measurements: span.measurements
    };
  }

  function createClientReportEnvelope(discarded_events, dsn, timestamp) {
    const clientReportItem = [{
      type: 'client_report'
    }, {
      timestamp: dateTimestampInSeconds(),
      discarded_events
    }];
    return createEnvelope(dsn ? {
      dsn
    } : {}, [clientReportItem]);
  }

  const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
  const MISSING_RELEASE_FOR_SESSION_ERROR = 'Discarded session because of missing or non-string release';
  const INTERNAL_ERROR_SYMBOL = Symbol.for('SentryInternalError');
  const DO_NOT_SEND_EVENT_SYMBOL = Symbol.for('SentryDoNotSendEventError');
  function _makeInternalError(message) {
    return {
      message,
      [INTERNAL_ERROR_SYMBOL]: true
    };
  }
  function _makeDoNotSendEventError(message) {
    return {
      message,
      [DO_NOT_SEND_EVENT_SYMBOL]: true
    };
  }
  function _isInternalError(error) {
    return !!error && typeof error === 'object' && INTERNAL_ERROR_SYMBOL in error;
  }
  function _isDoNotSendEventError(error) {
    return !!error && typeof error === 'object' && DO_NOT_SEND_EVENT_SYMBOL in error;
  }
  class Client {
    constructor(options) {
      this._options = options;
      this._integrations = {};
      this._numProcessing = 0;
      this._outcomes = {};
      this._hooks = {};
      this._eventProcessors = [];
      if (options.dsn) {
        this._dsn = makeDsn(options.dsn);
      } else {
        DEBUG_BUILD && logger.warn('No DSN provided, client will not send events.');
      }
      if (this._dsn) {
        const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : undefined);
        this._transport = options.transport({
          tunnel: this._options.tunnel,
          recordDroppedEvent: this.recordDroppedEvent.bind(this),
          ...options.transportOptions,
          url
        });
      }
    }
    captureException(exception, hint, scope) {
      const eventId = uuid4();
      if (checkOrSetAlreadyCaught(exception)) {
        DEBUG_BUILD && logger.log(ALREADY_SEEN_ERROR);
        return eventId;
      }
      const hintWithEventId = {
        event_id: eventId,
        ...hint
      };
      this._process(this.eventFromException(exception, hintWithEventId).then(event => this._captureEvent(event, hintWithEventId, scope)));
      return hintWithEventId.event_id;
    }
    captureMessage(message, level, hint, currentScope) {
      const hintWithEventId = {
        event_id: uuid4(),
        ...hint
      };
      const eventMessage = isParameterizedString(message) ? message : String(message);
      const promisedEvent = isPrimitive(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
      this._process(promisedEvent.then(event => this._captureEvent(event, hintWithEventId, currentScope)));
      return hintWithEventId.event_id;
    }
    captureEvent(event, hint, currentScope) {
      const eventId = uuid4();
      if (hint !== null && hint !== void 0 && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
        DEBUG_BUILD && logger.log(ALREADY_SEEN_ERROR);
        return eventId;
      }
      const hintWithEventId = {
        event_id: eventId,
        ...hint
      };
      const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
      const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
      const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
      this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope, capturedSpanIsolationScope));
      return hintWithEventId.event_id;
    }
    captureSession(session) {
      this.sendSession(session);
      updateSession(session, {
        init: false
      });
    }
    getDsn() {
      return this._dsn;
    }
    getOptions() {
      return this._options;
    }
    getSdkMetadata() {
      return this._options._metadata;
    }
    getTransport() {
      return this._transport;
    }
    flush(timeout) {
      const transport = this._transport;
      if (transport) {
        this.emit('flush');
        return this._isClientDoneProcessing(timeout).then(clientFinished => {
          return transport.flush(timeout).then(transportFlushed => clientFinished && transportFlushed);
        });
      } else {
        return resolvedSyncPromise(true);
      }
    }
    close(timeout) {
      return this.flush(timeout).then(result => {
        this.getOptions().enabled = false;
        this.emit('close');
        return result;
      });
    }
    getEventProcessors() {
      return this._eventProcessors;
    }
    addEventProcessor(eventProcessor) {
      this._eventProcessors.push(eventProcessor);
    }
    init() {
      if (this._isEnabled() || this._options.integrations.some(({
        name
      }) => name.startsWith('Spotlight'))) {
        this._setupIntegrations();
      }
    }
    getIntegrationByName(integrationName) {
      return this._integrations[integrationName];
    }
    addIntegration(integration) {
      const isAlreadyInstalled = this._integrations[integration.name];
      setupIntegration(this, integration, this._integrations);
      if (!isAlreadyInstalled) {
        afterSetupIntegrations(this, [integration]);
      }
    }
    sendEvent(event, hint = {}) {
      this.emit('beforeSendEvent', event, hint);
      let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
      for (const attachment of hint.attachments || []) {
        env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
      }
      const promise = this.sendEnvelope(env);
      if (promise) {
        promise.then(sendResponse => this.emit('afterSendEvent', event, sendResponse), null);
      }
    }
    sendSession(session) {
      const {
        release: clientReleaseOption,
        environment: clientEnvironmentOption = DEFAULT_ENVIRONMENT
      } = this._options;
      if ('aggregates' in session) {
        const sessionAttrs = session.attrs || {};
        if (!sessionAttrs.release && !clientReleaseOption) {
          DEBUG_BUILD && logger.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
          return;
        }
        sessionAttrs.release = sessionAttrs.release || clientReleaseOption;
        sessionAttrs.environment = sessionAttrs.environment || clientEnvironmentOption;
        session.attrs = sessionAttrs;
      } else {
        if (!session.release && !clientReleaseOption) {
          DEBUG_BUILD && logger.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
          return;
        }
        session.release = session.release || clientReleaseOption;
        session.environment = session.environment || clientEnvironmentOption;
      }
      this.emit('beforeSendSession', session);
      const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
      this.sendEnvelope(env);
    }
    recordDroppedEvent(reason, category, count = 1) {
      if (this._options.sendClientReports) {
        const key = `${reason}:${category}`;
        DEBUG_BUILD && logger.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ''}`);
        this._outcomes[key] = (this._outcomes[key] || 0) + count;
      }
    }
    on(hook, callback) {
      const hooks = this._hooks[hook] = this._hooks[hook] || [];
      hooks.push(callback);
      return () => {
        const cbIndex = hooks.indexOf(callback);
        if (cbIndex > -1) {
          hooks.splice(cbIndex, 1);
        }
      };
    }
    emit(hook, ...rest) {
      const callbacks = this._hooks[hook];
      if (callbacks) {
        callbacks.forEach(callback => callback(...rest));
      }
    }
    sendEnvelope(envelope) {
      this.emit('beforeEnvelope', envelope);
      if (this._isEnabled() && this._transport) {
        return this._transport.send(envelope).then(null, reason => {
          DEBUG_BUILD && logger.error('Error while sending envelope:', reason);
          return reason;
        });
      }
      DEBUG_BUILD && logger.error('Transport disabled');
      return resolvedSyncPromise({});
    }
    _setupIntegrations() {
      const {
        integrations
      } = this._options;
      this._integrations = setupIntegrations(this, integrations);
      afterSetupIntegrations(this, integrations);
    }
    _updateSessionFromEvent(session, event) {
      var _event$exception;
      let crashed = event.level === 'fatal';
      let errored = false;
      const exceptions = (_event$exception = event.exception) === null || _event$exception === void 0 ? void 0 : _event$exception.values;
      if (exceptions) {
        errored = true;
        for (const ex of exceptions) {
          const mechanism = ex.mechanism;
          if ((mechanism === null || mechanism === void 0 ? void 0 : mechanism.handled) === false) {
            crashed = true;
            break;
          }
        }
      }
      const sessionNonTerminal = session.status === 'ok';
      const shouldUpdateAndSend = sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed;
      if (shouldUpdateAndSend) {
        updateSession(session, {
          ...(crashed && {
            status: 'crashed'
          }),
          errors: session.errors || Number(errored || crashed)
        });
        this.captureSession(session);
      }
    }
    _isClientDoneProcessing(timeout) {
      return new SyncPromise(resolve => {
        let ticked = 0;
        const tick = 1;
        const interval = setInterval(() => {
          if (this._numProcessing == 0) {
            clearInterval(interval);
            resolve(true);
          } else {
            ticked += tick;
            if (timeout && ticked >= timeout) {
              clearInterval(interval);
              resolve(false);
            }
          }
        }, tick);
      });
    }
    _isEnabled() {
      return this.getOptions().enabled !== false && this._transport !== undefined;
    }
    _prepareEvent(event, hint, currentScope, isolationScope) {
      const options = this.getOptions();
      const integrations = Object.keys(this._integrations);
      if (!hint.integrations && integrations !== null && integrations !== void 0 && integrations.length) {
        hint.integrations = integrations;
      }
      this.emit('preprocessEvent', event, hint);
      if (!event.type) {
        isolationScope.setLastEventId(event.event_id || hint.event_id);
      }
      return prepareEvent(options, event, hint, currentScope, this, isolationScope).then(evt => {
        if (evt === null) {
          return evt;
        }
        this.emit('postprocessEvent', evt, hint);
        evt.contexts = {
          trace: getTraceContextFromScope(currentScope),
          ...evt.contexts
        };
        const dynamicSamplingContext = getDynamicSamplingContextFromScope(this, currentScope);
        evt.sdkProcessingMetadata = {
          dynamicSamplingContext,
          ...evt.sdkProcessingMetadata
        };
        return evt;
      });
    }
    _captureEvent(event, hint = {}, currentScope = getCurrentScope(), isolationScope = getIsolationScope()) {
      if (DEBUG_BUILD && isErrorEvent(event)) {
        logger.log(`Captured error event \`${getPossibleEventMessages(event)[0] || '<unknown>'}\``);
      }
      return this._processEvent(event, hint, currentScope, isolationScope).then(finalEvent => {
        return finalEvent.event_id;
      }, reason => {
        if (DEBUG_BUILD) {
          if (_isDoNotSendEventError(reason)) {
            logger.log(reason.message);
          } else if (_isInternalError(reason)) {
            logger.warn(reason.message);
          } else {
            logger.warn(reason);
          }
        }
        return undefined;
      });
    }
    _processEvent(event, hint, currentScope, isolationScope) {
      const options = this.getOptions();
      const {
        sampleRate
      } = options;
      const isTransaction = isTransactionEvent(event);
      const isError = isErrorEvent(event);
      const eventType = event.type || 'error';
      const beforeSendLabel = `before send for type \`${eventType}\``;
      const parsedSampleRate = typeof sampleRate === 'undefined' ? undefined : parseSampleRate(sampleRate);
      if (isError && typeof parsedSampleRate === 'number' && Math.random() > parsedSampleRate) {
        this.recordDroppedEvent('sample_rate', 'error');
        return rejectedSyncPromise(_makeDoNotSendEventError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`));
      }
      const dataCategory = eventType === 'replay_event' ? 'replay' : eventType;
      return this._prepareEvent(event, hint, currentScope, isolationScope).then(prepared => {
        if (prepared === null) {
          this.recordDroppedEvent('event_processor', dataCategory);
          throw _makeDoNotSendEventError('An event processor returned `null`, will not send event.');
        }
        const isInternalException = hint.data && hint.data.__sentry__ === true;
        if (isInternalException) {
          return prepared;
        }
        const result = processBeforeSend(this, options, prepared, hint);
        return _validateBeforeSendResult(result, beforeSendLabel);
      }).then(processedEvent => {
        if (processedEvent === null) {
          this.recordDroppedEvent('before_send', dataCategory);
          if (isTransaction) {
            const spans = event.spans || [];
            const spanCount = 1 + spans.length;
            this.recordDroppedEvent('before_send', 'span', spanCount);
          }
          throw _makeDoNotSendEventError(`${beforeSendLabel} returned \`null\`, will not send event.`);
        }
        const session = currentScope.getSession() || isolationScope.getSession();
        if (isError && session) {
          this._updateSessionFromEvent(session, processedEvent);
        }
        if (isTransaction) {
          var _processedEvent$sdkPr;
          const spanCountBefore = ((_processedEvent$sdkPr = processedEvent.sdkProcessingMetadata) === null || _processedEvent$sdkPr === void 0 ? void 0 : _processedEvent$sdkPr.spanCountBeforeProcessing) || 0;
          const spanCountAfter = processedEvent.spans ? processedEvent.spans.length : 0;
          const droppedSpanCount = spanCountBefore - spanCountAfter;
          if (droppedSpanCount > 0) {
            this.recordDroppedEvent('before_send', 'span', droppedSpanCount);
          }
        }
        const transactionInfo = processedEvent.transaction_info;
        if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
          const source = 'custom';
          processedEvent.transaction_info = {
            ...transactionInfo,
            source
          };
        }
        this.sendEvent(processedEvent, hint);
        return processedEvent;
      }).then(null, reason => {
        if (_isDoNotSendEventError(reason) || _isInternalError(reason)) {
          throw reason;
        }
        this.captureException(reason, {
          data: {
            __sentry__: true
          },
          originalException: reason
        });
        throw _makeInternalError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`);
      });
    }
    _process(promise) {
      this._numProcessing++;
      void promise.then(value => {
        this._numProcessing--;
        return value;
      }, reason => {
        this._numProcessing--;
        return reason;
      });
    }
    _clearOutcomes() {
      const outcomes = this._outcomes;
      this._outcomes = {};
      return Object.entries(outcomes).map(([key, quantity]) => {
        const [reason, category] = key.split(':');
        return {
          reason,
          category,
          quantity
        };
      });
    }
    _flushOutcomes() {
      DEBUG_BUILD && logger.log('Flushing outcomes...');
      const outcomes = this._clearOutcomes();
      if (outcomes.length === 0) {
        DEBUG_BUILD && logger.log('No outcomes to send');
        return;
      }
      if (!this._dsn) {
        DEBUG_BUILD && logger.log('No dsn provided, will not send outcomes');
        return;
      }
      DEBUG_BUILD && logger.log('Sending outcomes:', outcomes);
      const envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
      this.sendEnvelope(envelope);
    }
  }
  function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
    const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
    if (isThenable(beforeSendResult)) {
      return beforeSendResult.then(event => {
        if (!isPlainObject(event) && event !== null) {
          throw _makeInternalError(invalidValueError);
        }
        return event;
      }, e => {
        throw _makeInternalError(`${beforeSendLabel} rejected with ${e}`);
      });
    } else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) {
      throw _makeInternalError(invalidValueError);
    }
    return beforeSendResult;
  }
  function processBeforeSend(client, options, event, hint) {
    const {
      beforeSend,
      beforeSendTransaction,
      beforeSendSpan
    } = options;
    let processedEvent = event;
    if (isErrorEvent(processedEvent) && beforeSend) {
      return beforeSend(processedEvent, hint);
    }
    if (isTransactionEvent(processedEvent)) {
      if (beforeSendSpan) {
        const processedRootSpanJson = beforeSendSpan(convertTransactionEventToSpanJson(processedEvent));
        if (!processedRootSpanJson) {
          showSpanDropWarning();
        } else {
          processedEvent = merge(event, convertSpanJsonToTransactionEvent(processedRootSpanJson));
        }
        if (processedEvent.spans) {
          const processedSpans = [];
          for (const span of processedEvent.spans) {
            const processedSpan = beforeSendSpan(span);
            if (!processedSpan) {
              showSpanDropWarning();
              processedSpans.push(span);
            } else {
              processedSpans.push(processedSpan);
            }
          }
          processedEvent.spans = processedSpans;
        }
      }
      if (beforeSendTransaction) {
        if (processedEvent.spans) {
          const spanCountBefore = processedEvent.spans.length;
          processedEvent.sdkProcessingMetadata = {
            ...event.sdkProcessingMetadata,
            spanCountBeforeProcessing: spanCountBefore
          };
        }
        return beforeSendTransaction(processedEvent, hint);
      }
    }
    return processedEvent;
  }
  function isErrorEvent(event) {
    return event.type === undefined;
  }
  function isTransactionEvent(event) {
    return event.type === 'transaction';
  }

  function createLogContainerEnvelopeItem(items) {
    return [{
      type: 'log',
      item_count: items.length,
      content_type: 'application/vnd.sentry.items.log+json'
    }, {
      items
    }];
  }
  function createLogEnvelope(logs, metadata, tunnel, dsn) {
    const headers = {};
    if (metadata !== null && metadata !== void 0 && metadata.sdk) {
      headers.sdk = {
        name: metadata.sdk.name,
        version: metadata.sdk.version
      };
    }
    if (!!tunnel && !!dsn) {
      headers.dsn = dsnToString(dsn);
    }
    return createEnvelope(headers, [createLogContainerEnvelopeItem(logs)]);
  }

  GLOBAL_OBJ._sentryClientToLogBufferMap = new WeakMap();
  function _INTERNAL_flushLogsBuffer(client, maybeLogBuffer) {
    var _GLOBAL_OBJ$_sentryCl3;
    const logBuffer = _INTERNAL_getLogBuffer(client) ?? [];
    if (logBuffer.length === 0) {
      return;
    }
    const clientOptions = client.getOptions();
    const envelope = createLogEnvelope(logBuffer, clientOptions._metadata, clientOptions.tunnel, client.getDsn());
    (_GLOBAL_OBJ$_sentryCl3 = GLOBAL_OBJ._sentryClientToLogBufferMap) === null || _GLOBAL_OBJ$_sentryCl3 === void 0 ? void 0 : _GLOBAL_OBJ$_sentryCl3.set(client, []);
    client.emit('flushLogs');
    client.sendEnvelope(envelope);
  }
  function _INTERNAL_getLogBuffer(client) {
    var _GLOBAL_OBJ$_sentryCl4;
    return (_GLOBAL_OBJ$_sentryCl4 = GLOBAL_OBJ._sentryClientToLogBufferMap) === null || _GLOBAL_OBJ$_sentryCl4 === void 0 ? void 0 : _GLOBAL_OBJ$_sentryCl4.get(client);
  }

  const SENTRY_BUFFER_FULL_ERROR = Symbol.for('SentryBufferFullError');
  function makePromiseBuffer(limit) {
    const buffer = [];
    function isReady() {
      return limit === undefined || buffer.length < limit;
    }
    function remove(task) {
      return buffer.splice(buffer.indexOf(task), 1)[0] || Promise.resolve(undefined);
    }
    function add(taskProducer) {
      if (!isReady()) {
        return rejectedSyncPromise(SENTRY_BUFFER_FULL_ERROR);
      }
      const task = taskProducer();
      if (buffer.indexOf(task) === -1) {
        buffer.push(task);
      }
      void task.then(() => remove(task)).then(null, () => remove(task).then(null, () => {}));
      return task;
    }
    function drain(timeout) {
      return new SyncPromise((resolve, reject) => {
        let counter = buffer.length;
        if (!counter) {
          return resolve(true);
        }
        const capturedSetTimeout = setTimeout(() => {
          if (timeout && timeout > 0) {
            resolve(false);
          }
        }, timeout);
        buffer.forEach(item => {
          void resolvedSyncPromise(item).then(() => {
            if (! --counter) {
              clearTimeout(capturedSetTimeout);
              resolve(true);
            }
          }, reject);
        });
      });
    }
    return {
      $: buffer,
      add,
      drain
    };
  }

  const DEFAULT_RETRY_AFTER = 60 * 1000;
  function parseRetryAfterHeader(header, now = Date.now()) {
    const headerDelay = parseInt(`${header}`, 10);
    if (!isNaN(headerDelay)) {
      return headerDelay * 1000;
    }
    const headerDate = Date.parse(`${header}`);
    if (!isNaN(headerDate)) {
      return headerDate - now;
    }
    return DEFAULT_RETRY_AFTER;
  }
  function disabledUntil(limits, dataCategory) {
    return limits[dataCategory] || limits.all || 0;
  }
  function isRateLimited(limits, dataCategory, now = Date.now()) {
    return disabledUntil(limits, dataCategory) > now;
  }
  function updateRateLimits(limits, {
    statusCode,
    headers
  }, now = Date.now()) {
    const updatedRateLimits = {
      ...limits
    };
    const rateLimitHeader = headers === null || headers === void 0 ? void 0 : headers['x-sentry-rate-limits'];
    const retryAfterHeader = headers === null || headers === void 0 ? void 0 : headers['retry-after'];
    if (rateLimitHeader) {
      for (const limit of rateLimitHeader.trim().split(',')) {
        const [retryAfter, categories,,, namespaces] = limit.split(':', 5);
        const headerDelay = parseInt(retryAfter, 10);
        const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1000;
        if (!categories) {
          updatedRateLimits.all = now + delay;
        } else {
          for (const category of categories.split(';')) {
            if (category === 'metric_bucket') {
              if (!namespaces || namespaces.split(';').includes('custom')) {
                updatedRateLimits[category] = now + delay;
              }
            } else {
              updatedRateLimits[category] = now + delay;
            }
          }
        }
      }
    } else if (retryAfterHeader) {
      updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
    } else if (statusCode === 429) {
      updatedRateLimits.all = now + 60 * 1000;
    }
    return updatedRateLimits;
  }

  const DEFAULT_TRANSPORT_BUFFER_SIZE = 64;
  function createTransport(options, makeRequest, buffer = makePromiseBuffer(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE)) {
    let rateLimits = {};
    const flush = timeout => buffer.drain(timeout);
    function send(envelope) {
      const filteredEnvelopeItems = [];
      forEachEnvelopeItem(envelope, (item, type) => {
        const dataCategory = envelopeItemTypeToDataCategory(type);
        if (isRateLimited(rateLimits, dataCategory)) {
          options.recordDroppedEvent('ratelimit_backoff', dataCategory);
        } else {
          filteredEnvelopeItems.push(item);
        }
      });
      if (filteredEnvelopeItems.length === 0) {
        return resolvedSyncPromise({});
      }
      const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
      const recordEnvelopeLoss = reason => {
        forEachEnvelopeItem(filteredEnvelope, (item, type) => {
          options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type));
        });
      };
      const requestTask = () => makeRequest({
        body: serializeEnvelope(filteredEnvelope)
      }).then(response => {
        if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode >= 300)) {
          DEBUG_BUILD && logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
        }
        rateLimits = updateRateLimits(rateLimits, response);
        return response;
      }, error => {
        recordEnvelopeLoss('network_error');
        DEBUG_BUILD && logger.error('Encountered error running transport request:', error);
        throw error;
      });
      return buffer.add(requestTask).then(result => result, error => {
        if (error === SENTRY_BUFFER_FULL_ERROR) {
          DEBUG_BUILD && logger.error('Skipped sending event because buffer is full.');
          recordEnvelopeLoss('queue_overflow');
          return resolvedSyncPromise({});
        } else {
          throw error;
        }
      });
    }
    return {
      send,
      flush
    };
  }

  function addAutoIpAddressToUser(objWithMaybeUser) {
    var _objWithMaybeUser$use;
    if (((_objWithMaybeUser$use = objWithMaybeUser.user) === null || _objWithMaybeUser$use === void 0 ? void 0 : _objWithMaybeUser$use.ip_address) === undefined) {
      objWithMaybeUser.user = {
        ...objWithMaybeUser.user,
        ip_address: '{{auto}}'
      };
    }
  }
  function addAutoIpAddressToSession(session) {
    if ('aggregates' in session) {
      var _session$attrs;
      if (((_session$attrs = session.attrs) === null || _session$attrs === void 0 ? void 0 : _session$attrs['ip_address']) === undefined) {
        session.attrs = {
          ...session.attrs,
          ip_address: '{{auto}}'
        };
      }
    } else {
      if (session.ipAddress === undefined) {
        session.ipAddress = '{{auto}}';
      }
    }
  }

  function applySdkMetadata(options, name, names = [name], source = 'npm') {
    const metadata = options._metadata || {};
    if (!metadata.sdk) {
      metadata.sdk = {
        name: `sentry.javascript.${name}`,
        packages: names.map(name => ({
          name: `${source}:@sentry/${name}`,
          version: SDK_VERSION
        })),
        version: SDK_VERSION
      };
    }
    options._metadata = metadata;
  }

  let originalFunctionToString;
  const INTEGRATION_NAME$2 = 'FunctionToString';
  const SETUP_CLIENTS = new WeakMap();
  const _functionToStringIntegration = () => {
    return {
      name: INTEGRATION_NAME$2,
      setupOnce() {
        originalFunctionToString = Function.prototype.toString;
        try {
          Function.prototype.toString = function (...args) {
            const originalFunction = getOriginalFunction(this);
            const context = SETUP_CLIENTS.has(getClient()) && originalFunction !== undefined ? originalFunction : this;
            return originalFunctionToString.apply(context, args);
          };
        } catch {}
      },
      setup(client) {
        SETUP_CLIENTS.set(client, true);
      }
    };
  };
  const functionToStringIntegration = defineIntegration(_functionToStringIntegration);

  const INTEGRATION_NAME$1 = 'Dedupe';
  const _dedupeIntegration = () => {
    let previousEvent;
    return {
      name: INTEGRATION_NAME$1,
      processEvent(currentEvent) {
        if (currentEvent.type) {
          return currentEvent;
        }
        try {
          if (_shouldDropEvent(currentEvent, previousEvent)) {
            DEBUG_BUILD && logger.warn('Event dropped due to being a duplicate of previously captured event.');
            return null;
          }
        } catch (_oO) {}
        return previousEvent = currentEvent;
      }
    };
  };
  const dedupeIntegration = defineIntegration(_dedupeIntegration);
  function _shouldDropEvent(currentEvent, previousEvent) {
    if (!previousEvent) {
      return false;
    }
    if (_isSameMessageEvent(currentEvent, previousEvent)) {
      return true;
    }
    if (_isSameExceptionEvent(currentEvent, previousEvent)) {
      return true;
    }
    return false;
  }
  function _isSameMessageEvent(currentEvent, previousEvent) {
    const currentMessage = currentEvent.message;
    const previousMessage = previousEvent.message;
    if (!currentMessage && !previousMessage) {
      return false;
    }
    if (currentMessage && !previousMessage || !currentMessage && previousMessage) {
      return false;
    }
    if (currentMessage !== previousMessage) {
      return false;
    }
    if (!_isSameFingerprint(currentEvent, previousEvent)) {
      return false;
    }
    if (!_isSameStacktrace(currentEvent, previousEvent)) {
      return false;
    }
    return true;
  }
  function _isSameExceptionEvent(currentEvent, previousEvent) {
    const previousException = _getExceptionFromEvent(previousEvent);
    const currentException = _getExceptionFromEvent(currentEvent);
    if (!previousException || !currentException) {
      return false;
    }
    if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
      return false;
    }
    if (!_isSameFingerprint(currentEvent, previousEvent)) {
      return false;
    }
    if (!_isSameStacktrace(currentEvent, previousEvent)) {
      return false;
    }
    return true;
  }
  function _isSameStacktrace(currentEvent, previousEvent) {
    let currentFrames = getFramesFromEvent(currentEvent);
    let previousFrames = getFramesFromEvent(previousEvent);
    if (!currentFrames && !previousFrames) {
      return true;
    }
    if (currentFrames && !previousFrames || !currentFrames && previousFrames) {
      return false;
    }
    currentFrames = currentFrames;
    previousFrames = previousFrames;
    if (previousFrames.length !== currentFrames.length) {
      return false;
    }
    for (let i = 0; i < previousFrames.length; i++) {
      const frameA = previousFrames[i];
      const frameB = currentFrames[i];
      if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) {
        return false;
      }
    }
    return true;
  }
  function _isSameFingerprint(currentEvent, previousEvent) {
    let currentFingerprint = currentEvent.fingerprint;
    let previousFingerprint = previousEvent.fingerprint;
    if (!currentFingerprint && !previousFingerprint) {
      return true;
    }
    if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) {
      return false;
    }
    currentFingerprint = currentFingerprint;
    previousFingerprint = previousFingerprint;
    try {
      return !!(currentFingerprint.join('') === previousFingerprint.join(''));
    } catch (_oO) {
      return false;
    }
  }
  function _getExceptionFromEvent(event) {
    var _event$exception;
    return ((_event$exception = event.exception) === null || _event$exception === void 0 ? void 0 : _event$exception.values) && event.exception.values[0];
  }

  const INTEGRATION_NAME = 'ExtraErrorData';
  const _extraErrorDataIntegration = (options = {}) => {
    const {
      depth = 3,
      captureErrorCause = true
    } = options;
    return {
      name: INTEGRATION_NAME,
      processEvent(event, hint, client) {
        const {
          maxValueLength = 250
        } = client.getOptions();
        return _enhanceEventWithErrorData(event, hint, depth, captureErrorCause, maxValueLength);
      }
    };
  };
  const extraErrorDataIntegration = defineIntegration(_extraErrorDataIntegration);
  function _enhanceEventWithErrorData(event, hint = {}, depth, captureErrorCause, maxValueLength) {
    if (!hint.originalException || !isError(hint.originalException)) {
      return event;
    }
    const exceptionName = hint.originalException.name || hint.originalException.constructor.name;
    const errorData = _extractErrorData(hint.originalException, captureErrorCause, maxValueLength);
    if (errorData) {
      const contexts = {
        ...event.contexts
      };
      const normalizedErrorData = normalize(errorData, depth);
      if (isPlainObject(normalizedErrorData)) {
        addNonEnumerableProperty(normalizedErrorData, '__sentry_skip_normalization__', true);
        contexts[exceptionName] = normalizedErrorData;
      }
      return {
        ...event,
        contexts
      };
    }
    return event;
  }
  function _extractErrorData(error, captureErrorCause, maxValueLength) {
    try {
      const nativeKeys = ['name', 'message', 'stack', 'line', 'column', 'fileName', 'lineNumber', 'columnNumber', 'toJSON'];
      const extraErrorInfo = {};
      for (const key of Object.keys(error)) {
        if (nativeKeys.indexOf(key) !== -1) {
          continue;
        }
        const value = error[key];
        extraErrorInfo[key] = isError(value) || typeof value === 'string' ? truncate(`${value}`, maxValueLength) : value;
      }
      if (captureErrorCause && error.cause !== undefined) {
        extraErrorInfo.cause = isError(error.cause) ? error.cause.toString() : error.cause;
      }
      if (typeof error.toJSON === 'function') {
        const serializedError = error.toJSON();
        for (const key of Object.keys(serializedError)) {
          const value = serializedError[key];
          extraErrorInfo[key] = isError(value) ? value.toString() : value;
        }
      }
      return extraErrorInfo;
    } catch (oO) {
      DEBUG_BUILD && logger.error('Unable to extract extra data from the Error object:', oO);
    }
    return null;
  }

  function getSDKSource() {
    return 'npm';
  }

  const WINDOW = GLOBAL_OBJ;

  function exceptionFromError(stackParser, ex) {
    const frames = parseStackFrames(stackParser, ex);
    const exception = {
      type: extractType(ex),
      value: extractMessage(ex)
    };
    if (frames.length) {
      exception.stacktrace = {
        frames
      };
    }
    if (exception.type === undefined && exception.value === '') {
      exception.value = 'Unrecoverable error caught';
    }
    return exception;
  }
  function eventFromPlainObject(stackParser, exception, syntheticException, isUnhandledRejection) {
    const client = getClient();
    const normalizeDepth = client === null || client === void 0 ? void 0 : client.getOptions().normalizeDepth;
    const errorFromProp = getErrorPropertyFromObject(exception);
    const extra = {
      __serialized__: normalizeToSize(exception, normalizeDepth)
    };
    if (errorFromProp) {
      return {
        exception: {
          values: [exceptionFromError(stackParser, errorFromProp)]
        },
        extra
      };
    }
    const event = {
      exception: {
        values: [{
          type: isEvent(exception) ? exception.constructor.name : isUnhandledRejection ? 'UnhandledRejection' : 'Error',
          value: getNonErrorObjectExceptionValue(exception, {
            isUnhandledRejection
          })
        }]
      },
      extra
    };
    if (syntheticException) {
      const frames = parseStackFrames(stackParser, syntheticException);
      if (frames.length) {
        event.exception.values[0].stacktrace = {
          frames
        };
      }
    }
    return event;
  }
  function eventFromError(stackParser, ex) {
    return {
      exception: {
        values: [exceptionFromError(stackParser, ex)]
      }
    };
  }
  function parseStackFrames(stackParser, ex) {
    const stacktrace = ex.stacktrace || ex.stack || '';
    const skipLines = getSkipFirstStackStringLines(ex);
    const framesToPop = getPopFirstTopFrames(ex);
    try {
      return stackParser(stacktrace, skipLines, framesToPop);
    } catch (e) {}
    return [];
  }
  const reactMinifiedRegexp = /Minified React error #\d+;/i;
  function getSkipFirstStackStringLines(ex) {
    if (ex && reactMinifiedRegexp.test(ex.message)) {
      return 1;
    }
    return 0;
  }
  function getPopFirstTopFrames(ex) {
    if (typeof ex.framesToPop === 'number') {
      return ex.framesToPop;
    }
    return 0;
  }
  function isWebAssemblyException(exception) {
    if (typeof WebAssembly !== 'undefined' && typeof WebAssembly.Exception !== 'undefined') {
      return exception instanceof WebAssembly.Exception;
    } else {
      return false;
    }
  }
  function extractType(ex) {
    const name = ex === null || ex === void 0 ? void 0 : ex.name;
    if (!name && isWebAssemblyException(ex)) {
      const hasTypeInMessage = ex.message && Array.isArray(ex.message) && ex.message.length == 2;
      return hasTypeInMessage ? ex.message[0] : 'WebAssembly.Exception';
    }
    return name;
  }
  function extractMessage(ex) {
    const message = ex === null || ex === void 0 ? void 0 : ex.message;
    if (isWebAssemblyException(ex)) {
      if (Array.isArray(ex.message) && ex.message.length == 2) {
        return ex.message[1];
      }
      return 'wasm exception';
    }
    if (!message) {
      return 'No error message';
    }
    if (message.error && typeof message.error.message === 'string') {
      return message.error.message;
    }
    return message;
  }
  function eventFromException(stackParser, exception, hint, attachStacktrace) {
    const syntheticException = (hint === null || hint === void 0 ? void 0 : hint.syntheticException) || undefined;
    const event = eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace);
    addExceptionMechanism(event);
    event.level = 'error';
    if (hint !== null && hint !== void 0 && hint.event_id) {
      event.event_id = hint.event_id;
    }
    return resolvedSyncPromise(event);
  }
  function eventFromMessage(stackParser, message, level = 'info', hint, attachStacktrace) {
    const syntheticException = (hint === null || hint === void 0 ? void 0 : hint.syntheticException) || undefined;
    const event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
    event.level = level;
    if (hint !== null && hint !== void 0 && hint.event_id) {
      event.event_id = hint.event_id;
    }
    return resolvedSyncPromise(event);
  }
  function eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace, isUnhandledRejection) {
    let event;
    if (isErrorEvent$1(exception) && exception.error) {
      const errorEvent = exception;
      return eventFromError(stackParser, errorEvent.error);
    }
    if (isDOMError(exception) || isDOMException(exception)) {
      const domException = exception;
      if ('stack' in exception) {
        event = eventFromError(stackParser, exception);
      } else {
        const name = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
        const message = domException.message ? `${name}: ${domException.message}` : name;
        event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
        addExceptionTypeValue(event, message);
      }
      if ('code' in domException) {
        event.tags = {
          ...event.tags,
          'DOMException.code': `${domException.code}`
        };
      }
      return event;
    }
    if (isError(exception)) {
      return eventFromError(stackParser, exception);
    }
    if (isPlainObject(exception) || isEvent(exception)) {
      const objectException = exception;
      event = eventFromPlainObject(stackParser, objectException, syntheticException, isUnhandledRejection);
      addExceptionMechanism(event, {
        synthetic: true
      });
      return event;
    }
    event = eventFromString(stackParser, exception, syntheticException, attachStacktrace);
    addExceptionTypeValue(event, `${exception}`);
    addExceptionMechanism(event, {
      synthetic: true
    });
    return event;
  }
  function eventFromString(stackParser, message, syntheticException, attachStacktrace) {
    const event = {};
    if (attachStacktrace && syntheticException) {
      const frames = parseStackFrames(stackParser, syntheticException);
      if (frames.length) {
        event.exception = {
          values: [{
            value: message,
            stacktrace: {
              frames
            }
          }]
        };
      }
      addExceptionMechanism(event, {
        synthetic: true
      });
    }
    if (isParameterizedString(message)) {
      const {
        __sentry_template_string__,
        __sentry_template_values__
      } = message;
      event.logentry = {
        message: __sentry_template_string__,
        params: __sentry_template_values__
      };
      return event;
    }
    event.message = message;
    return event;
  }
  function getNonErrorObjectExceptionValue(exception, {
    isUnhandledRejection
  }) {
    const keys = extractExceptionKeysForMessage(exception);
    const captureType = 'exception';
    if (isErrorEvent$1(exception)) {
      return `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\``;
    }
    if (isEvent(exception)) {
      const className = getObjectClassName(exception);
      return `Event \`${className}\` (type=${exception.type}) captured as ${captureType}`;
    }
    return `Object captured as ${captureType} with keys: ${keys}`;
  }
  function getObjectClassName(obj) {
    try {
      const prototype = Object.getPrototypeOf(obj);
      return prototype ? prototype.constructor.name : undefined;
    } catch (e) {}
  }
  function getErrorPropertyFromObject(obj) {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        const value = obj[prop];
        if (value instanceof Error) {
          return value;
        }
      }
    }
    return undefined;
  }

  const DEFAULT_FLUSH_INTERVAL = 5000;
  class BrowserClient extends Client {
    constructor(options) {
      const opts = applyDefaultOptions(options);
      const sdkSource = WINDOW.SENTRY_SDK_SOURCE || getSDKSource();
      applySdkMetadata(opts, 'browser', ['browser'], sdkSource);
      super(opts);
      const {
        sendDefaultPii,
        sendClientReports,
        _experiments
      } = this._options;
      const enableLogs = _experiments === null || _experiments === void 0 ? void 0 : _experiments.enableLogs;
      if (WINDOW.document && (sendClientReports || enableLogs)) {
        WINDOW.document.addEventListener('visibilitychange', () => {
          if (WINDOW.document.visibilityState === 'hidden') {
            if (sendClientReports) {
              this._flushOutcomes();
            }
            if (enableLogs) {
              _INTERNAL_flushLogsBuffer(this);
            }
          }
        });
      }
      if (enableLogs) {
        this.on('flush', () => {
          _INTERNAL_flushLogsBuffer(this);
        });
        this.on('afterCaptureLog', () => {
          if (this._logFlushIdleTimeout) {
            clearTimeout(this._logFlushIdleTimeout);
          }
          this._logFlushIdleTimeout = setTimeout(() => {
            _INTERNAL_flushLogsBuffer(this);
          }, DEFAULT_FLUSH_INTERVAL);
        });
      }
      if (sendDefaultPii) {
        this.on('postprocessEvent', addAutoIpAddressToUser);
        this.on('beforeSendSession', addAutoIpAddressToSession);
      }
    }
    eventFromException(exception, hint) {
      return eventFromException(this._options.stackParser, exception, hint, this._options.attachStacktrace);
    }
    eventFromMessage(message, level = 'info', hint) {
      return eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
    }
    _prepareEvent(event, hint, currentScope, isolationScope) {
      event.platform = event.platform || 'javascript';
      return super._prepareEvent(event, hint, currentScope, isolationScope);
    }
  }
  function applyDefaultOptions(optionsArg) {
    var _WINDOW$SENTRY_RELEAS;
    return {
      release: typeof __SENTRY_RELEASE__ === 'string' ? __SENTRY_RELEASE__ : (_WINDOW$SENTRY_RELEAS = WINDOW.SENTRY_RELEASE) === null || _WINDOW$SENTRY_RELEAS === void 0 ? void 0 : _WINDOW$SENTRY_RELEAS.id,
      sendClientReports: true,
      parentSpanIsAlwaysRootSpan: true,
      ...optionsArg
    };
  }

  const CHROME_PRIORITY = 30;
  const GECKO_PRIORITY = 50;
  function createFrame(filename, func, lineno, colno) {
    const frame = {
      filename,
      function: func === '<anonymous>' ? UNKNOWN_FUNCTION : func,
      in_app: true
    };
    if (lineno !== undefined) {
      frame.lineno = lineno;
    }
    if (colno !== undefined) {
      frame.colno = colno;
    }
    return frame;
  }
  const chromeRegexNoFnName = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;
  const chromeRegex = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  const chromeStackParserFn = line => {
    const noFnParts = chromeRegexNoFnName.exec(line);
    if (noFnParts) {
      const [, filename, line, col] = noFnParts;
      return createFrame(filename, UNKNOWN_FUNCTION, +line, +col);
    }
    const parts = chromeRegex.exec(line);
    if (parts) {
      const isEval = parts[2] && parts[2].indexOf('eval') === 0;
      if (isEval) {
        const subMatch = chromeEvalRegex.exec(parts[2]);
        if (subMatch) {
          parts[2] = subMatch[1];
          parts[3] = subMatch[2];
          parts[4] = subMatch[3];
        }
      }
      const [func, filename] = extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]);
      return createFrame(filename, func, parts[3] ? +parts[3] : undefined, parts[4] ? +parts[4] : undefined);
    }
    return;
  };
  const chromeStackLineParser = [CHROME_PRIORITY, chromeStackParserFn];
  const geckoREgex = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
  const geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  const gecko = line => {
    const parts = geckoREgex.exec(line);
    if (parts) {
      const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
      if (isEval) {
        const subMatch = geckoEvalRegex.exec(parts[3]);
        if (subMatch) {
          parts[1] = parts[1] || 'eval';
          parts[3] = subMatch[1];
          parts[4] = subMatch[2];
          parts[5] = '';
        }
      }
      let filename = parts[3];
      let func = parts[1] || UNKNOWN_FUNCTION;
      [func, filename] = extractSafariExtensionDetails(func, filename);
      return createFrame(filename, func, parts[4] ? +parts[4] : undefined, parts[5] ? +parts[5] : undefined);
    }
    return;
  };
  const geckoStackLineParser = [GECKO_PRIORITY, gecko];
  const defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser];
  const defaultStackParser = createStackParser(...defaultStackLineParsers);
  const extractSafariExtensionDetails = (func, filename) => {
    const isSafariExtension = func.indexOf('safari-extension') !== -1;
    const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;
    return isSafariExtension || isSafariWebExtension ? [func.indexOf('@') !== -1 ? func.split('@')[0] : UNKNOWN_FUNCTION, isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`] : [func, filename];
  };

  const getOS = () => {
    try {
      const list = [{
        match: 'window',
        name: 'Windows'
      }, {
        match: 'mac',
        name: 'Mac'
      }, {
        match: 'cros',
        name: 'Chrome+OS'
      }, {
        match: 'ubuntu',
        name: 'Ubuntu+(Linux)'
      }, {
        match: 'android',
        name: 'Android'
      }, {
        match: 'ios',
        name: 'iOS'
      }, {
        match: 'x11',
        name: 'Linux'
      }];
      const ua = globalThis.navigator.userAgent;
      const os = list.find(os => ua.toLowerCase().indexOf(os.match) >= 0);
      return os ? os.name : '';
    } catch {
      return null;
    }
  };
  const browsersUAList = [{
    ua: 'Firefox',
    name: 'Firefox'
  }, {
    ua: 'OPR',
    name: 'Opera'
  }, {
    ua: 'Edg',
    name: 'Edge'
  }, {
    ua: 'Chrome',
    name: 'Chrome'
  }];
  const getBrowser = () => {
    try {
      const ua = globalThis.navigator.userAgent;
      const browser = browsersUAList.find(browser => ua.indexOf(browser.ua) >= 0);
      return browser ? browser.name : '';
    } catch {
      return null;
    }
  };
  const getBrowserVersion = () => {
    try {
      const browserName = getBrowser();
      const browserUA = browsersUAList.find(browser => browserName === browser.name).ua;
      const ua = globalThis.navigator.userAgent;
      const matches = ua.match(`${browserUA}/([0-9.]+)`);
      return matches.length === 2 ? matches[1] : ua;
    } catch {
      return null;
    }
  };
  const getVersion = () => {
    try {
      return (chrome.runtime.getManifest() || {}).version;
    } catch {
      return null;
    }
  };
  const getFeedbackFormLink = version => {
    version = version || getVersion() || '';
    const os = getOS() || '';
    const browser = getBrowser() || '';
    const browserVersion = getBrowserVersion();
    return `https://docs.google.com/forms/d/e/1FAIpQLSe5lenJCbDFgJKwYuK_7U_s5wN3D78CEP5LYf2lghWwoE9IyA/viewform?usp=pp_url&entry.1590539866=${version}&entry.1676661118=${os}&entry.964326861=${browser}&entry.908541589=${browserVersion}`;
  };

  const SettingsConfig = [{
    type: 'section',
    label: 'Settings',
    name: 'sectionSettingsCollapsed',
    default: true
  }, {
    name: 'advancedSettings',
    label: 'Advanced',
    type: 'checkbox',
    default: false
  }, {
    type: 'section',
    label: 'Stats',
    name: 'sectionStatsCollapsed',
    default: true,
    advanced: true
  }, {
    name: 'showFPS',
    label: 'Framerates',
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'showFrametimes',
    label: 'Frametimes graph',
    description: 'Uses: CPU power',
    questionMark: {
      title: 'The measured display framerate is not a reflection of the real performance.\nBecause the measurement uses an extra percentage of CPU usage.\nHowever, this statistic could be helpful to debug other issues.'
    },
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'showResolutions',
    label: 'Resolutions & drawtimes',
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'showBarDetectionStats',
    label: 'Bar detection',
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    type: 'section',
    label: 'Quality',
    name: 'sectionQualityPerformanceCollapsed',
    default: true
  }, {
    name: 'webGL',
    label: 'WebGL renderer (uses less power)',
    description: 'Changing this reloads the webpage',
    type: 'checkbox',
    default: true
  }, {
    name: 'resolution',
    label: 'Resolution',
    type: 'list',
    default: 100,
    unit: '%',
    valuePoints: (() => {
      const points = [6.25];
      while (points[points.length - 1] < 400) {
        points.push(points[points.length - 1] * 2);
      }
      return points;
    })(),
    manualinput: false
  }, {
    name: 'framerateLimit',
    label: 'Limit framerate (per second)',
    type: 'list',
    default: 60,
    min: 0,
    max: 60,
    step: 1
  }, {
    name: 'frameSync',
    label: 'Synchronization',
    questionMark: {
      title: 'How much energy will be spent on sychronising ambient light frames with video frames.\n\nDecoded framerate: Lowest CPU & GPU usage.\nMight result in dropped and delayed frames.\n\nDisplay framerate: Highest CPU & GPU usage.\nMight still result in delayed frames on high refreshrate monitors (120hz and higher) and higher than 1080p videos.\n\nVideo framerate: Lowest CPU & GPU usage.\nUses the newest browser technology to always keep the frames in sync.'
    },
    type: 'list',
    default: 2,
    min: 0,
    max: 2,
    step: 1,
    snapPoints: [{
      value: 0,
      label: 'Decoded'
    }, {
      value: 1,
      label: 'Display'
    }, {
      value: 2,
      label: 'Video'
    }],
    manualinput: false,
    advanced: true,
    experimental: true
  }, {
    name: 'energySaver',
    label: 'Save energy on static videos',
    questionMark: {
      title: 'Limits the framerate on videos with an (almost) static image\n\nStill image: 1 frame per 5 seconds\nSmall movements: 1 frame per second'
    },
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'prioritizePageLoadSpeed',
    label: 'Prioritize page load speed',
    description: 'Loads the ambient light after the page has loaded',
    type: 'checkbox',
    default: true
  }, {
    name: 'layoutPerformanceImprovements',
    label: 'YouTube responsiveness fixes',
    description: 'Improves the responsiveness of the webpage',
    questionMark: {
      title: `Some of the improvements on the /watch page include:
- Faster webpage resizing and scrolling (Most noticeable after you've loaded in more than 100 comments)
- Faster loadingtimes for comments and/or related videos
- Smoother timeline scrubbing (Most noticeable after you've loaded in more than 100 comments or with a livestream chat window open)
- Smoother livestream chat scrolling (and new messages will be appended quicker to the chat)
- Smoother playlist scrolling (Most noticeable in a playlist with more than 25 videos)
- Smoother dragging/re-ordering videos in a playlist (Most noticeable in a playlist with more than 25 videos)`
    },
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    name: 'debandingBlendMode',
    label: 'Optimize debanding for',
    questionMark: {
      title: "The normal blend mode is usefull to fix banding in dark colors on LCD's.\nBut on OLED's it's better to use the \"overlay\" blend mode to retain pure blacks."
    },
    type: 'list',
    default: 0,
    min: 0,
    max: 1,
    step: 1,
    snapPoints: [{
      value: 0,
      label: 'LCD (normal)'
    }, {
      value: 1,
      label: 'OLED (overlay)'
    }],
    manualinput: false,
    advanced: true,
    new: true
  }, {
    type: 'section',
    label: 'Page header',
    name: 'sectionOtherPageHeaderCollapsed',
    default: true
  }, {
    name: 'headerShadowSize',
    label: 'Shadows size',
    type: 'list',
    default: 0,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'headerShadowOpacity',
    label: 'Shadows opacity',
    type: 'list',
    default: 30,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'headerImagesOpacity',
    label: 'Images opacity',
    type: 'list',
    default: 100,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'headerFillOpacity',
    label: 'Background opacity',
    description: 'Only applies when scrolled down',
    type: 'list',
    default: 100,
    min: -100,
    max: 100,
    step: 0.1,
    advanced: true
  }, {
    type: 'section',
    label: 'Page content',
    name: 'sectionOtherPageContentCollapsed',
    default: true
  }, {
    name: 'surroundingContentShadowSize',
    label: 'Shadows size',
    type: 'list',
    default: 15,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'surroundingContentShadowOpacity',
    label: 'Shadows opacity',
    type: 'list',
    default: 30,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'surroundingContentTextAndBtnOnly',
    label: 'Shadows on texts and buttons only',
    description: 'Decreases scrolling & video stutter',
    type: 'checkbox',
    advanced: true,
    default: true
  }, {
    name: 'surroundingContentImagesOpacity',
    label: 'Images opacity',
    type: 'list',
    default: 100,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'surroundingContentFillOpacity',
    label: 'Buttons & boxes background opacity',
    type: 'list',
    default: 10,
    min: -100,
    max: 100,
    step: 0.1
  }, {
    name: 'pageBackgroundGreyness',
    label: 'Background greyness',
    type: 'list',
    default: 0,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'immersiveTheaterView',
    label: 'Hide everything in theater mode',
    type: 'checkbox',
    default: false
  }, {
    name: 'relatedScrollbar',
    label: 'Related videos as scrollable list',
    description: 'Also improves scrolling through comments',
    type: 'checkbox',
    advanced: true,
    default: false
  }, {
    name: 'hideScrollbar',
    label: 'Hide scrollbar',
    type: 'checkbox',
    advanced: true,
    default: false
  }, {
    type: 'section',
    label: 'Video',
    name: 'sectionVideoResizingCollapsed',
    default: true
  }, {
    name: 'videoScale.SMALL',
    label: 'Size (in small view)',
    type: 'list',
    default: 100,
    min: 25,
    max: 200,
    step: 0.1,
    new: true
  }, {
    name: 'videoScale.THEATER',
    label: 'Size (in theater view)',
    type: 'list',
    default: 100,
    min: 25,
    max: 200,
    step: 0.1,
    new: true
  }, {
    name: 'videoScale.FULLSCREEN',
    label: 'Size (in fullscreen)',
    type: 'list',
    default: 100,
    min: 25,
    max: 200,
    step: 0.1,
    new: true
  }, {
    name: 'videoShadowSize',
    label: 'Shadow size',
    type: 'list',
    default: 0,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'videoShadowOpacity',
    label: 'Shadow opacity',
    type: 'list',
    default: 50,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'videoDebandingStrength',
    label: 'Debanding (noise)',
    questionMark: {
      title: 'Click for more information about debanding (noise /dithering).\nTip: Change the "Quality > Optimize debanding for" setting to "OLED" to retain pure blacks on OLED displays.',
      href: 'https://www.lifewire.com/what-is-dithering-4686105'
    },
    type: 'list',
    default: 0,
    min: 0,
    max: 100,
    step: 1,
    advanced: true
  }, {
    name: 'videoOverlayEnabled',
    label: 'Sync video with ambient light',
    questionMark: {
      title: 'Delays the video frames according to the ambient light frametimes.\nThis makes sure that that the ambient light is never out of sync with the video,\nbut it can introduce stuttering and/or dropped frames.'
    },
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'videoOverlaySyncThreshold',
    label: 'Sync video disable threshold',
    description: 'Disable when dropping % of frames',
    type: 'list',
    default: 5,
    min: 1,
    max: 100,
    step: 1,
    advanced: true
  }, {
    name: 'chromiumBugVideoJitterWorkaround',
    label: 'Video jitter workaround',
    description: 'Uses: CPU & GPU power',
    questionMark: {
      title: 'Chromium has a bug that jitters the video playback when your display \nhas a higher framerate than 60Hz. This workaround prevents the jittering \nby forcing the browser to run at the framerate of your display instead. \nClick the questionmark for more information about this bug in Chromium browsers.',
      href: 'https://github.com/WesselKroos/youtube-ambilight/issues/166'
    },
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'chromiumDirectVideoOverlayWorkaround',
    label: 'Video artifacts workaround',
    description: 'This workaround must be disabled for \nNVidia RTX Virtual Super Resolution (VSR)',
    questionMark: {
      title: `This workaround can fix several artifacts/bugs,
when videos are in hardware accelerated overlays (MPO).
Examples are: random black/white squares, flickering or a squeezed video.

Click on the questionmark for more and updated information about these artifacts/bugs.`,
      href: 'https://github.com/WesselKroos/youtube-ambilight/blob/master/TROUBLESHOOT.md#3-nvidia-rtx-video-super-resolution-vsr--nvidia-rtx-video-hdr-does-not-work'
    },
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    type: 'section',
    label: 'Remove black & colored bars',
    name: 'sectionHorizontalBarsCollapsed',
    default: true
  }, {
    name: 'detectHorizontalBarSizeEnabled',
    label: 'Remove black bars',
    description: 'Uses: CPU power',
    type: 'checkbox',
    default: false,
    defaultKey: 'B'
  }, {
    name: 'detectVerticalBarSizeEnabled',
    label: 'Remove black sidebars',
    description: 'Uses: CPU power',
    type: 'checkbox',
    default: false,
    defaultKey: 'V'
  }, {
    name: 'detectColoredHorizontalBarSizeEnabled',
    label: 'Detection: Remove colored bars',
    type: 'checkbox',
    default: false
  }, {
    name: 'detectHorizontalBarSizeOffsetPercentage',
    label: 'Detection: Offset',
    type: 'list',
    default: 0,
    min: -5,
    max: 5,
    step: 0.1,
    advanced: true
  }, {
    name: 'barSizeDetectionAverageHistorySize',
    label: 'Detection: Frames average',
    questionMark: {
      title: 'The amount of video frames to detect an average bar size from. \nA lower amount of frames results in a faster detection, \nbut does also increase the amount of inaccurate detections.'
    },
    type: 'list',
    default: 4,
    min: 1,
    max: 30,
    step: 1,
    advanced: true
  }, {
    name: 'barSizeDetectionAllowedElementsPercentage',
    label: 'Detection: Certainty threshold',
    questionMark: {
      title: 'At 10% only clear bars are removed.\nA higher percentage can also remove bars with some elements.\nAnd an even higher percentage can crop to a squared element in the center.'
    },
    type: 'list',
    default: 20,
    min: 10,
    max: 90,
    step: 10
  }, {
    name: 'barSizeDetectionAllowedUnevenBarsPercentage',
    label: 'Detection: Uneven threshold',
    questionMark: {
      title: 'Higher percentages detect a more uneven bar.\nFor example: A bar is uneven when the top bar is smaller than the bottem bar.\nBut with a high percentage you also increase the risk that straight objects or lines are seen as bars.'
    },
    type: 'list',
    default: 10,
    min: 1,
    max: 50,
    step: 1,
    advanced: true,
    new: true
  }, {
    name: 'horizontalBarsClipPercentage',
    label: 'Bar size',
    type: 'list',
    default: 0,
    min: 0,
    max: 40,
    step: 0.1,
    snapPoints: [{
      value: 8.7,
      label: 8
    }, {
      value: 12.3,
      label: 12,
      flip: true
    }, {
      value: 13.5,
      label: 13
    }],
    advanced: true
  }, {
    name: 'verticalBarsClipPercentage',
    label: 'Sidebars size',
    type: 'list',
    default: 0,
    min: 0,
    max: 40,
    step: 0.1,
    advanced: true
  }, {
    name: 'horizontalBarsClipPercentageReset',
    label: 'Reset bars next video',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    name: 'detectVideoFillScaleEnabled',
    label: 'Fill video to removed bars',
    type: 'checkbox',
    default: false,
    defaultKey: 'H'
  }, {
    type: 'section',
    label: 'Filters',
    name: 'sectionImageAdjustmentCollapsed',
    default: true
  }, {
    name: 'brightness',
    label: 'Brightness',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 1
  }, {
    name: 'contrast',
    label: 'Contrast',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 1,
    advanced: true
  }, {
    name: 'vibrance',
    label: 'Colors',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 0.1
  }, {
    name: 'saturation',
    label: 'Saturation',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 1
  }, {
    type: 'section',
    label: 'HDR Filters',
    name: 'sectionHdrImageAdjustmentCollapsed',
    default: false,
    hdr: true
  }, {
    name: 'hdrBrightness',
    label: 'Brightness',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 1,
    hdr: true
  }, {
    name: 'hdrContrast',
    label: 'Contrast',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 1,
    hdr: true
  }, {
    name: 'hdrSaturation',
    label: 'Saturation',
    type: 'list',
    default: 100,
    min: 0,
    max: 200,
    step: 1,
    hdr: true
  }, {
    type: 'section',
    label: 'Directions',
    name: 'sectionDirectionsCollapsed',
    default: true,
    advanced: true
  }, {
    name: 'directionTopEnabled',
    label: 'Top',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    name: 'directionRightEnabled',
    label: 'Right',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    name: 'directionBottomEnabled',
    label: 'Bottom',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    name: 'directionLeftEnabled',
    label: 'Left',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    type: 'section',
    label: 'Ambient light',
    name: 'sectionAmbientlightCollapsed',
    default: false
  }, {
    name: 'blur2',
    label: 'Blur',
    description: 'Uses: GPU memory',
    type: 'list',
    default: 30,
    min: 0,
    max: 100,
    step: 0.1
  }, {
    name: 'edge',
    label: 'Edge size',
    description: 'To better see what changes: Turn the blur to 0%',
    type: 'list',
    default: 12,
    min: 2,
    max: 50,
    step: 0.1,
    advanced: true
  }, {
    name: 'spread',
    label: 'Spread',
    description: 'Uses: GPU power',
    type: 'list',
    default: 17,
    min: 0,
    max: 400,
    step: 0.1
  }, {
    name: 'spreadFadeStart',
    label: 'Spread fade start',
    type: 'list',
    default: 15,
    min: -50,
    max: 100,
    step: 0.1,
    advanced: true
  }, {
    name: 'spreadFadeCurve',
    label: 'Spread fade curve',
    description: 'To better see what changes: Turn the blur to 0%',
    type: 'list',
    default: 35,
    min: 1,
    max: 100,
    step: 1,
    advanced: true
  }, {
    name: 'debandingStrength',
    label: 'Debanding (noise)',
    questionMark: {
      title: 'Click for more information about (noise /dithering).\nTip: Change the "Quality > Optimize debanding for" setting to "OLED" to retain pure blacks on OLED displays.',
      href: 'https://www.lifewire.com/what-is-dithering-4686105'
    },
    type: 'list',
    default: 0,
    min: 0,
    max: 100,
    step: 1,
    advanced: true
  }, {
    name: 'frameFading',
    label: 'Fade in duration',
    description: 'Uses: GPU memory',
    questionMark: {
      title: 'Fading between changes in the ambient light'
    },
    type: 'list',
    default: 0,
    min: 0,
    max: 21.2,
    step: 0.02,
    manualinput: false
  }, {
    name: 'flickerReduction',
    label: 'Flicker reduction',
    questionMark: {
      title: 'Reduces flickering by limiting the speed at which brightness changes in the ambient light'
    },
    type: 'list',
    default: 0,
    min: 0,
    max: 100,
    step: 1,
    manualinput: false,
    advanced: true
  }, {
    name: 'frameBlending',
    label: 'Smooth motion (frame blending)',
    questionMark: {
      title: 'Click for more information about Frame blending',
      href: 'https://www.youtube.com/watch?v=m_wfO4fvH8M&t=81s'
    },
    description: 'Uses: GPU power. Also works with "Sync video"',
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'frameBlendingSmoothness',
    label: 'Smooth motion strength',
    type: 'list',
    default: 80,
    min: 0,
    max: 100,
    step: 1,
    advanced: true
  }, {
    name: 'fixedPosition',
    label: 'Fixed position',
    description: 'Ignores the scroll position of the page',
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    type: 'section',
    label: 'View modes',
    name: 'sectionViewsCollapsed',
    default: false
  }, {
    name: 'enableInViews',
    label: 'Enable in layouts',
    type: 'list',
    manualinput: false,
    default: 0,
    min: 0,
    max: 5,
    step: 1,
    snapPoints: [{
      value: 0,
      label: 'All'
    }, {
      value: 1,
      label: 'Small'
    }, {
      value: 2,
      hiddenLabel: 'Small & Theater'
    }, {
      value: 3,
      label: 'Theater'
    }, {
      value: 4,
      hiddenLabel: 'Theater & Fullscreen'
    }, {
      value: 5,
      label: 'Fullscreen'
    }]
  }, {
    name: 'enableInPictureInPicture',
    label: 'Picture in picture',
    type: 'checkbox',
    default: false,
    advanced: true
  }, {
    name: 'enableInEmbed',
    label: 'Embedded videos',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    name: 'enableInVRVideos',
    label: 'VR/360 videos',
    type: 'checkbox',
    default: true,
    advanced: true
  }, {
    type: 'section',
    label: 'General',
    name: 'sectionGeneralCollapsed',
    default: false
  }, {
    name: 'theme',
    label: 'Appearance (theme)',
    type: 'list',
    manualinput: false,
    default: 1,
    min: -1,
    max: 1,
    step: 1,
    snapPoints: [{
      value: -1,
      label: 'Light'
    }, {
      value: 0,
      label: 'Default'
    }, {
      value: 1,
      label: 'Dark'
    }]
  }, {
    name: 'enabled',
    label: 'Enabled',
    type: 'checkbox',
    default: true,
    defaultKey: 'G'
  }];
  const WebGLOnlySettings = ['resolution', 'vibrance', 'frameFading', 'flickerReduction', 'fixedPosition', 'chromiumBugVideoJitterWorkaround'];
  let prepared = false;
  const prepareSettingsConfigOnce = () => {
    if (prepared) return;
    const settingsToRemove = [];
    for (const setting of SettingsConfig) {
      if (supportsWebGL()) {
        if (setting.name === 'resolution' && getBrowser() === 'Firefox') {
          setting.default = 50;
        }
      } else {
        if (WebGLOnlySettings.includes(setting.name)) {
          settingsToRemove.push(setting.name);
        }
        if (['webGL'].includes(setting.name)) {
          setting.default = false;
          setting.disabled = 'You have disabled WebGL in your browser.';
        }
      }
      if (setting.name === 'frameSync') {
        if (!HTMLVideoElement.prototype.requestVideoFrameCallback) {
          setting.max = 1;
          setting.default = 0;
        } else if (getBrowser() === 'Firefox') {
          setting.default = 0;
        }
      }
    }
    if (getBrowser() === 'Firefox') {
      settingsToRemove.push('enableInVRVideos');
    }
    if (!supportsColorMix()) {
      settingsToRemove.push('pageBackgroundGreyness');
    }
    for (const settingName of settingsToRemove) {
      const settingIndex = SettingsConfig.findIndex(setting => setting.name === settingName);
      SettingsConfig.splice(settingIndex, 1);
    }
    prepared = true;
  };

  class Storage {
    constructor() {
      this.onChangedListeners = [];
    }
    async set(nameOrNamesAndValues, value = undefined, throwOnUninstalled = false) {
      try {
        const multiple = typeof nameOrNamesAndValues !== 'string';
        const namesAndValues = multiple ? nameOrNamesAndValues : {
          [nameOrNamesAndValues]: value
        };
        const stack = new Error().stack;
        return await new Promise(function storageSet(resolve, reject) {
          try {
            var _chrome, _chrome$runtime;
            if (!((_chrome = chrome) !== null && _chrome !== void 0 && (_chrome$runtime = _chrome.runtime) !== null && _chrome$runtime !== void 0 && _chrome$runtime.id)) throw new Error('uninstalled');
            const setCallback = () => {
              try {
                if (chrome.runtime.lastError) throw chrome.runtime.lastError;
                resolve();
              } catch (ex) {
                var _chrome2, _chrome2$runtime;
                if (!((_chrome2 = chrome) !== null && _chrome2 !== void 0 && (_chrome2$runtime = _chrome2.runtime) !== null && _chrome2$runtime !== void 0 && _chrome2$runtime.id)) return reject(new Error('uninstalled'));
                appendErrorStack(stack, ex);
                reject(ex);
              }
            };
            if (!multiple && value === undefined) {
              chrome.storage.local.remove([nameOrNamesAndValues], setCallback);
            } else {
              chrome.storage.local.set(namesAndValues, setCallback);
            }
          } catch (ex) {
            var _chrome3, _chrome3$runtime;
            if (!((_chrome3 = chrome) !== null && _chrome3 !== void 0 && (_chrome3$runtime = _chrome3.runtime) !== null && _chrome3$runtime !== void 0 && _chrome3$runtime.id)) return reject(new Error('uninstalled'));
            appendErrorStack(stack, ex);
            reject(ex);
          }
        });
      } catch (ex) {
        var _ex$message;
        if (ex && (throwOnUninstalled || !(ex.message === 'uninstalled' || (_ex$message = ex.message) !== null && _ex$message !== void 0 && _ex$message.includes('QuotaExceededError')))) throw ex;
      }
    }
    async get(nameOrNames, throwOnUninstalled = false) {
      try {
        const multiple = typeof nameOrNames !== 'string';
        const names = multiple ? nameOrNames : [nameOrNames];
        const stack = new Error().stack;
        return await new Promise(function storageGet(resolve, reject) {
          try {
            var _chrome4, _chrome4$runtime;
            if (!((_chrome4 = chrome) !== null && _chrome4 !== void 0 && (_chrome4$runtime = _chrome4.runtime) !== null && _chrome4$runtime !== void 0 && _chrome4$runtime.id)) throw new Error('uninstalled');
            chrome.storage.local.get(names, function getCallback(result) {
              try {
                if (chrome.runtime.lastError) throw chrome.runtime.lastError;
                resolve(multiple ? result : result[nameOrNames] === undefined ? null : result[nameOrNames]);
              } catch (ex) {
                var _chrome5, _chrome5$runtime;
                if (!((_chrome5 = chrome) !== null && _chrome5 !== void 0 && (_chrome5$runtime = _chrome5.runtime) !== null && _chrome5$runtime !== void 0 && _chrome5$runtime.id)) return reject(new Error('uninstalled'));
                appendErrorStack(stack, ex);
                reject(ex);
              }
            });
          } catch (ex) {
            var _chrome6, _chrome6$runtime;
            if (!((_chrome6 = chrome) !== null && _chrome6 !== void 0 && (_chrome6$runtime = _chrome6.runtime) !== null && _chrome6$runtime !== void 0 && _chrome6$runtime.id)) return reject(new Error('uninstalled'));
            appendErrorStack(stack, ex);
            reject(ex);
          }
        });
      } catch (ex) {
        var _ex$message2;
        if (ex && (throwOnUninstalled || !(ex.message === 'uninstalled' || (_ex$message2 = ex.message) !== null && _ex$message2 !== void 0 && _ex$message2.includes('QuotaExceededError')))) throw ex;
      }
    }
    addListener(handler) {
      try {
        const wrappedHandler = wrapErrorHandler(handler, true);
        chrome.storage.local.onChanged.addListener(wrappedHandler);
        this.onChangedListeners.push({
          handler,
          wrappedHandler
        });
      } catch (ex) {
        console.warn("Failed to listen to storage changes. If any setting changes you'll have to manually refresh the page to update them.");
        console.debug(ex);
      }
    }
    removeListener(handler) {
      try {
        const entry = this.onChangedListeners.find(entry => entry.handler === handler);
        if (!entry) throw new Error('Cannot remove a storage.local.onChange listener that has never been added');
        chrome.storage.local.onChanged.removeListener(entry.wrappedHandler);
        this.onChangedListeners.splice(this.onChangedListeners.indexOf(entry), 1);
      } catch {
        console.warn("Failed to listen to storage changes. If any setting changes you'll have to manually refresh the page to update them.");
      }
    }
  }
  const storage = new Storage();
  const defaultCrashOptions = {
    video: false,
    technical: true,
    crash: true
  };

  let settings;
  const parseSettingsToSentry = newSettings => {
    settings = newSettings;
  };
  let version$1 = '';
  const setVersion = newVersion => {
    version$1 = newVersion;
  };
  let crashOptions = null;
  const setCrashOptions = newCrashOptions => {
    crashOptions = newCrashOptions;
  };
  let scope;
  function initClientAndScope() {
    function makeFetchTransport(options) {
      function makeRequest(request) {
        const requestOptions = {
          body: request.body,
          method: 'POST',
          referrerPolicy: 'origin',
          headers: options.headers,
          ...options.fetchOptions
        };
        return fetch(options.url, requestOptions).then(response => {
          return {
            statusCode: response.status,
            headers: {
              'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
              'retry-after': response.headers.get('Retry-After')
            }
          };
        });
      }
      return createTransport(options, makeRequest);
    }
    const client = new BrowserClient({
      enabled: true,
      dsn: 'https://a3d06857fc2d401690381d0878ce3bc3@o288593.ingest.us.sentry.io/1524536',
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      integrations: [dedupeIntegration(), functionToStringIntegration(), extraErrorDataIntegration()],
      release: version$1 || 'pending',
      attachStacktrace: true,
      maxValueLength: 500,
      normalizeDepth: 5,
      beforeSend: event => {
        try {
          var _crashOptions, _crashOptions2;
          event.request = {};
          if (navigator.doNotTrack !== '1' && (_crashOptions = crashOptions) !== null && _crashOptions !== void 0 && _crashOptions.video) {
            var _globalThis$window, _globalThis$window$do;
            event.request.url = location.href;
            event.request.headers = {
              Referer: (_globalThis$window = globalThis.window) === null || _globalThis$window === void 0 ? void 0 : (_globalThis$window$do = _globalThis$window.document) === null || _globalThis$window$do === void 0 ? void 0 : _globalThis$window$do.referrer
            };
          }
          if ((_crashOptions2 = crashOptions) !== null && _crashOptions2 !== void 0 && _crashOptions2.technical) {
            event.request.headers = {
              ...(event.request.headers || {}),
              'User-Agent': navigator.userAgent
            };
          }
          for (const value of event.exception.values) {
            if (value.stacktrace && value.stacktrace.frames) {
              for (const frame of value.stacktrace.frames) {
                frame.filename = frame.filename.replace(/[a-z]+?-extension:\/\/[a-z|0-9|-]+?\//g, 'app:///');
                frame.filename = frame.filename.replace(/\/[a-z|0-9]+?\/jsbin\//g, '/_hash_/jsbin/');
                frame.filename = frame.filename.replace(/\/s\/player\/[a-z|0-9]+?\//g, '/s/player/_hash_/');
              }
            }
          }
        } catch (ex) {
          console.warn(ex);
        }
        return event;
      }
    });
    scope = new Scope();
    scope.setClient(client);
    client.init();
  }
  let userId;
  let reports;
  const initializeStorageEntries = (async () => {
    try {
      const entries = (await storage.get(['reports', 'crash-reporter-id'])) || {};
      userId = entries['crash-reporter-id'];
      reports = JSON.parse(entries.reports || '[]');
      if (!userId) {
        userId = uuidv4();
        await storage.set('crash-reporter-id', userId);
      }
    } catch (ex) {
      console.warn(ex);
    }
  })();
  let sessionId;
  class SentryReporter {
    static async captureException(ex) {
      try {
        var _ex, _ex$message, _ex$message$includes, _crashOptions3, _crashOptions4, _crashOptions5;
        if ((_ex = ex) !== null && _ex !== void 0 && (_ex$message = _ex.message) !== null && _ex$message !== void 0 && (_ex$message$includes = _ex$message.includes) !== null && _ex$message$includes !== void 0 && _ex$message$includes.call(_ex$message, `can't access dead object`)) return;
        this.overflowProtection++;
        if (this.overflowProtection > 3) {
          return;
        }
        try {
          if (ex.stack && (Object.prototype.toString.call(ex) === '[object DOMException]' || Object.prototype.toString.call(ex) === '[object DOMError]')) {
            const exWithStack = new Error(ex.message);
            exWithStack.code = ex.code;
            exWithStack.stack = ex.stack;
            exWithStack.name = ex.name;
            ex = exWithStack;
          }
        } catch (ex) {
          console.warn(ex);
        }
        if (ex.details) {
          console.error(ex, ex.details);
        } else {
          console.error(ex);
        }
        if (this.overflowProtection === 3) {
          console.warn('Exception overflow protection enabled');
        }
        if (!((_crashOptions3 = crashOptions) !== null && _crashOptions3 !== void 0 && _crashOptions3.crash)) {
          console.warn('Crash reporting is disabled. If you want this error to be fixed, open the extension options to enable crash reporting. Then refresh the page and reproduce the error again to send a crash report.');
          return;
        }
        try {
          await initializeStorageEntries;
        } catch (ex) {
          console.warn(ex);
        }
        try {
          if (reports) {
            const dayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            reports = reports.filter(report => !version$1 || report.version === version$1);
            const reportsToday = reports.filter(report => report.time > dayAgo);
            const reportsThisWeek = reports.filter(report => report.time > weekAgo);
            if (reportsToday.length < 4 && reportsThisWeek.length < 5) {
              reportsThisWeek.push({
                time: Date.now(),
                error: ex.message,
                version: version$1 || 'pending'
              });
            } else {
              console.warn('Dropped error report because too many reports has been sent today or in the last 7 days');
              return;
            }
            await storage.set('reports', JSON.stringify(reportsThisWeek));
          }
        } catch (ex) {
          console.warn(ex);
          return;
        }
        if (!scope) initClientAndScope();
        scope.clear();
        try {
          scope.setUser({
            id: userId
          });
        } catch {
          console.warn(ex);
        }
        try {
          if (!sessionId) {
            sessionId = uuidv4();
          }
          scope.setTag('session', sessionId);
        } catch {
          console.warn(ex);
        }
        const setExtra = (name, value) => {
          try {
            scope.setExtra(name, value === undefined ? null : value);
          } catch (ex) {
            console.warn(ex);
          }
        };
        try {
          setExtra('CrashOptions', crashOptions);
        } catch (ex) {
          setExtra('CrashOptions (exception)', ex);
        }
        try {
          setExtra('Script', this.script);
        } catch (ex) {
          setExtra('Script (exception)', ex);
        }
        try {
          if (globalThis.yt) {
            const ambientlightExtra = {
              initialized: typeof ambientlight !== 'undefined'
            };
            if (ambientlightExtra.initialized) {
              ambientlightExtra.now = performance.now();
              const propertyNames = ['initializedTime', 'ambientlightFrameCount', 'ambientlightFrameRate', 'displayFrameCount', 'displayFrameRate', 'videoFrameCount', 'videoFrameRate', 'ambientlightVideoDroppedFrameCount', 'droppedVideoFramesCorrection', 'averageVideoFramesDifference', 'previousDrawTime', 'previousFrameTime', 'buffersCleared', 'canvassesInvalidated', 'sizesInvalidated', 'sizesChanged', 'delayedUpdateSizesChanged', 'requestVideoFrameCallbackId', 'videoFrameCallbackReceived', 'scheduledNextFrame', 'view', 'isOnVideoPage', 'atTop', 'isFillingFullscreen', 'isHidden', 'isAmbientlightHiddenOnWatchPage', 'videoIsHidden', 'videoIsPictureInPicture', 'isVideoHiddenOnWatchPage', 'isPageHidden', 'pageHiddenTime', 'pageHiddenClearTime', 'pageShownTime', 'clearTime', 'isVrVideo', 'srcVideoOffset.top', 'srcVideoOffset.width', 'srcVideoOffset.height', 'videoOffset.left', 'videoOffset.top', 'videoOffset.width', 'videoOffset.height', 'p.w', 'p.h', 'levels', 'enableMozillaBugReadPixelsWorkaround', 'enableMozillaBug1606251Workaround', 'enableChromiumBug1142112Workaround', 'enableChromiumBug1123708Workaround', 'enableChromiumBug1092080Workaround', 'enableChromiumBugDirectVideoOverlayWorkaround', 'enableChromiumBugVideoJitterWorkaround', 'getImageDataAllowed', 'projectorBuffer.elem.width', 'projectorBuffer.elem.height', 'projectorBuffer.ctx.initializedTime', 'projectorBuffer.ctx.lost', 'projectorBuffer.ctx.lostCount', 'projectorBuffer.ctx.webGLVersion', 'projectorBuffer.ctx.webglcontextcreationerrors', 'projectorBuffer.ctx.ctx.drawingBufferColorSpace', 'projectorBuffer.ctx.ctx.unpackColorSpace', 'projector.initializedTime', 'projector.type', 'projector.webGLVersion', 'projector.width', 'projector.height', 'projector.blurBound', 'projector.projectors.length', 'projector.scale.x', 'projector.scale.y', 'projector.lost', 'projector.lostCount', 'projector.blurLost', 'projector.blurLostCount', 'projector.majorPerformanceCaveat', 'projector.webglcontextcreationerrors', 'projector.ctx.drawingBufferColorSpace', 'projector.ctx.unpackColorSpace'];
              for (const propertyName of propertyNames) {
                try {
                  let value = ambientlight;
                  const propertyPath = propertyName.split('.');
                  for (const propertyName of propertyPath) {
                    value = value ? value[propertyName] : undefined;
                  }
                  ambientlightExtra[propertyName] = value;
                } catch {}
              }
            }
            setExtra('Ambientlight', ambientlightExtra);
          }
        } catch (ex) {
          setExtra('Ambientlight (exception)', ex);
        }
        try {
          if (settings) {
            const settingsExtra = {};
            for (const setting of SettingsConfig) {
              if (!setting || !setting.name) continue;
              settingsExtra[setting.name] = settings[setting.name];
              if (!setting.key) continue;
              settingsExtra[`${setting.name}-key`] = setting.key;
            }
            settingsExtra.webGLCrashDate = settings.webGLCrashDate;
            settingsExtra.webGLCrashVersion = settings.webGLCrashVersion;
            setExtra('Settings', settingsExtra);
          }
        } catch (ex) {
          setExtra('Settings (exception)', ex);
        }
        if ((_crashOptions4 = crashOptions) !== null && _crashOptions4 !== void 0 && _crashOptions4.technical) {
          try {
            if (ex && ex.details) {
              setExtra('Details', ex.details);
            }
          } catch (ex) {
            setExtra('Details (exception)', ex);
          }
          try {
            var _document$documentEle, _document$documentEle2, _globalThis$yt, _globalThis$yt$config;
            setExtra('YouTube', {
              dark: !!((_document$documentEle = document.documentElement) !== null && _document$documentEle !== void 0 && (_document$documentEle2 = _document$documentEle.attributes) !== null && _document$documentEle2 !== void 0 && _document$documentEle2.dark),
              loggedIn: globalThis.yt ? !!((_globalThis$yt = globalThis.yt) !== null && _globalThis$yt !== void 0 && (_globalThis$yt$config = _globalThis$yt.config_) !== null && _globalThis$yt$config !== void 0 && _globalThis$yt$config.LOGGED_IN) : document.querySelector('ytd-topbar-menu-button-renderer') ? !!document.querySelector('#avatar-btn') : undefined
            });
          } catch (ex) {
            setExtra('YouTube (exception)', ex);
          }
          const pageExtra = {};
          try {
            pageExtra.isVideo = location.pathname == '/watch';
          } catch (ex) {
            setExtra('Page .isVideo (exception)', ex);
          }
          try {
            pageExtra.isEmbed = isEmbedPageUrl();
          } catch (ex) {
            setExtra('Page .isEmbed (exception)', ex);
          }
          try {
            pageExtra.isYtdApp = !!document.querySelector('ytd-app');
          } catch (ex) {
            setExtra('Page .isYtdApp (exception)', ex);
          }
          setExtra('Page', pageExtra);
          try {
            setExtra('Video elements', document.querySelectorAll('video').length);
          } catch (ex) {
            setExtra('Video elements (exception)', ex);
          }
          try {
            var _globalThis$ambientli;
            const videoElem = (_globalThis$ambientli = globalThis.ambientlight) === null || _globalThis$ambientli === void 0 ? void 0 : _globalThis$ambientli.videoElem;
            if (videoElem) {
              setExtra('Video state', {
                mediaError: videoElem.error ? {
                  code: mediaErrorToString(videoElem.error.code),
                  message: videoElem.error.message || 'Unknown'
                } : undefined,
                networkState: networkStateToString(videoElem === null || videoElem === void 0 ? void 0 : videoElem.networkState),
                readyState: readyStateToString(videoElem === null || videoElem === void 0 ? void 0 : videoElem.readyState)
              });
            }
          } catch (ex) {
            setExtra('Video state (exception)', ex);
          }
          try {
            if (globalThis.window) {
              try {
                setExtra('Window', {
                  width: window.innerWidth,
                  height: window.innerHeight,
                  scrollY: window.scrollY,
                  devicePixelRatio: window.devicePixelRatio,
                  fullscreen: document.fullscreen
                });
              } catch (ex) {
                setExtra('Window (exception)', ex);
              }
              try {
                if (window.screen) {
                  setExtra('Screen', {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                  });
                }
              } catch (ex) {
                setExtra('Screen (exception)', ex);
              }
            }
          } catch (ex) {
            setExtra('Window (exception)', ex);
          }
          try {
            const videoPlayerElem = document.querySelector('#movie_player, .html5-video-player');
            if (videoPlayerElem !== null && videoPlayerElem !== void 0 && videoPlayerElem.getStatsForNerds) {
              const stats = videoPlayerElem.getStatsForNerds();
              const relevantStats = ['codecs', 'color', 'dims_and_frames', 'drm', 'resolution'];
              for (const key of Object.keys(stats)) {
                if (!relevantStats.includes(key)) delete stats[key];
              }
              setExtra('Player', stats);
            }
          } catch (ex) {
            setExtra('Player (exception)', ex);
          }
          try {
            const ytdAppElem = document.querySelector('ytd-app');
            if (ytdAppElem) {
              var _document$documentEle3, _document$documentEle4;
              const elementFunctionNames = ['querySelector', 'querySelectorAll', 'closest', 'prepend', 'append', 'appendChild', 'contains'];
              const componentFunctionsAreNative = elementFunctionNames.reduce((list, name) => {
                list[name] = document.documentElement[name] === ytdAppElem[name];
                return list;
              }, {});
              componentFunctionsAreNative.example = (_document$documentEle3 = document.documentElement.closest) === null || _document$documentEle3 === void 0 ? void 0 : (_document$documentEle4 = _document$documentEle3.toString()) === null || _document$documentEle4 === void 0 ? void 0 : _document$documentEle4.substring(0, 36);
              setExtra('ComponentFunctionsAreNative', componentFunctionsAreNative);
            }
          } catch (ex) {
            setExtra('ComponentFunctionsAreNative (exception)', ex);
          }
        }
        if (navigator.doNotTrack !== '1' && (_crashOptions5 = crashOptions) !== null && _crashOptions5 !== void 0 && _crashOptions5.video) {
          try {
            const ytdWatchElem = document.querySelector(`${watchSelectors.join(', ')}, .ytd-page-manager`);
            if (ytdWatchElem) {
              const videoId = ytdWatchElem === null || ytdWatchElem === void 0 ? void 0 : ytdWatchElem.getAttribute('video-id');
              setExtra('ytd-watch-...[video-id]', videoId);
            }
          } catch (ex) {
            setExtra('ytd-watch-...[video-id] (exception)', ex);
          }
        }
        scope.captureException(ex);
        scope.clear();
      } catch (ex) {
        console.error(ex);
      }
    }
  }
  SentryReporter.script = globalThis.yt ? 'injected' : 'content';
  SentryReporter.overflowProtection = 0;

  class AmbientlightError extends Error {
    constructor(message, details) {
      super(message);
      this.details = details;
    }
  }

  class ErrorEvents {
    constructor() {
      this.list = [];
      this.send = (message, force) => {
        const lastEvent = this.list[this.list.length - 1];
        const lastTime = lastEvent.time;
        const firstTime = this.list[0].firstTime || this.list[0].time;
        if (!force && lastTime - firstTime < 5) {
          return;
        }
        const firstEvent = this.list.splice(0, 1);
        const details = {
          firstEvent,
          events: this.list.reverse()
        };
        this.list = [];
        SentryReporter.captureException(new AmbientlightError(message ?? 'Closed or hid the page with pending errors', details));
      };
      this.add = (type, details = {}) => {
        if (!(crashOptions !== null && crashOptions !== void 0 && crashOptions.technical)) {
          details = undefined;
        }
        const time = Math.round(performance.now()) / 1000;
        if (this.list.length) {
          const last = this.list.slice(-1)[0];
          const {
            count: lastCount,
            time: lastTime,
            firstTime,
            type: lastType,
            ...lastDetails
          } = last;
          if (lastType === type && JSON.stringify(lastDetails) === JSON.stringify(details)) {
            last.count = lastCount ? lastCount + 1 : 2;
            last.time = time;
            last.firstTime = firstTime || lastTime;
            return;
          }
        }
        let event = {
          type,
          time,
          ...details
        };
        event.time = time;
        this.list.push(event);
      };
      on(window, 'beforeunload', () => {
        if (!this.list.length) return;
        this.add('tab beforeunload');
        this.send();
      }, false);
      on(window, 'pagehide', () => {
        if (!this.list.length) return;
        this.add('tab pagehide');
      }, false);
      on(document, 'visibilitychange', () => {
        if (document.visibilityState !== 'hidden') return;
        if (!this.list.length) return;
        this.add('tab visibilitychange hidden');
        this.send();
      }, false);
    }
  }

  const getNodeSelector = elem => {
    var _elem$classList;
    if (!elem.tagName) return elem.nodeName;
    const idSelector = elem.id ? `#${elem.id}` : '';
    const classSelector = (_elem$classList = elem.classList) !== null && _elem$classList !== void 0 && _elem$classList.length ? `.${Array.from(elem.classList).sort().join('.')}` : '';
    return `${elem.tagName.toLowerCase()}${idSelector}${classSelector}`;
  };
  const getNodeTree = elem => {
    if (!elem) return [];
    const tree = [];
    tree.push(elem);
    while (elem.parentNode && elem.parentNode.tagName) {
      tree.unshift(elem.parentNode);
      elem = elem.parentNode;
    }
    return tree;
  };
  const getNodeTreeString = elem => getNodeTree(elem).map((node, i) => `${' '.repeat(i)}${getNodeSelector(node)}`).join('\n');
  const createNodeEntry = (node, level) => ({
    level,
    node,
    children: []
  });
  const nodeEntryToString = entry => {
    let lines = [`${' '.repeat(entry.level)}${getNodeSelector(entry.node)}`];
    for (const childEntry of entry.children) {
      lines.push(nodeEntryToString(childEntry));
    }
    return lines.join('\n');
  };
  const getSelectorTreeString = selector => {
    const trees = Array.from(document.querySelectorAll(selector)).map(elem => getNodeTree(elem));
    const documentTrees = [];
    for (const nodeTree of trees) {
      let documentTree;
      let previousEntry;
      for (const node of nodeTree) {
        if (!previousEntry) {
          documentTree = documentTrees.find(dt => dt.node === node);
          if (!documentTree) {
            documentTree = createNodeEntry(node, 0);
            documentTrees.push(documentTree);
          }
          previousEntry = documentTree;
          continue;
        }
        const existingEntry = previousEntry.children.find(entry => entry.node === node);
        if (existingEntry) {
          previousEntry = existingEntry;
          continue;
        }
        const entry = createNodeEntry(node, previousEntry.level + 1);
        previousEntry.children.push(entry);
        previousEntry = entry;
      }
    }
    return documentTrees.map(documentTree => documentTree ? nodeEntryToString(documentTree) : `No nodes found for selector: '${selector}'`).join('\n');
  };
  const getOtherUnknownAppElems = () => {
    var _document$body;
    return Array.from(((_document$body = document.body) === null || _document$body === void 0 ? void 0 : _document$body.children) ?? []).filter(elem => elem.tagName.endsWith('-APP') && !['YTD-APP', 'YTVP-APP', 'YTCP-APP', 'YTLR-APP', 'DAILY-COMPANION-APP'].includes(elem.tagName));
  };
  const getPageElems = () => {
    const allSelector = 'html, body, ytd-app, #content.ytd-app, ytd-watch-flexy, ytd-watch-fixie, ytd-watch-grid, #player-container, ytd-player, #container.ytd-player, .html5-video-player, .html5-video-container, video, .video-stream, .html5-main-video';
    const otherAppElems = getOtherUnknownAppElems();
    return {
      counts: allSelector.split(',').reduce((counts, selector) => {
        selector = selector.trim();
        counts[selector] = document.querySelectorAll(selector).length;
        return counts;
      }, {}),
      otherApps: otherAppElems.map(elem => elem.tagName),
      otherAppsTree: otherAppElems.length > 0 ? getSelectorTreeString(otherAppElems.map(elem => elem.tagName).join(',')) : undefined,
      ΩTree: getSelectorTreeString(allSelector)
    };
  };

  const workerFromCode = async func => {
    try {
      if (typeof OffscreenCanvas === 'undefined') {
        throw new Error('OffscreenCanvas class is undefined');
      } else if (!OffscreenCanvas.prototype.transferToImageBitmap) {
        throw new Error('OffscreenCanvas.transferToImageBitmap is undefined');
      }
      let created = () => undefined;
      let timeout;
      try {
        const promise = new Promise((resolve, reject) => {
          created = error => {
            if (error) return reject(error);
            resolve();
          };
        });
        const worker = new Worker(URL.createObjectURL(new Blob(['(', func.toString(), ')()'], {
          type: 'text/javascript'
        })));
        worker.onerror = e => created(new Error((e === null || e === void 0 ? void 0 : e.message) ?? 'Worker creation failed probably because it violates the worker-src or script-src Content Security Policy'));
        worker.onmessage = e => {
          if (e.data === false) {
            created();
          }
        };
        worker.postMessage(false);
        timeout = setTimeout(() => created(new Error('Worker creation timed-out after 5 seconds')), 5000);
        await promise;
        worker.onerror = undefined;
        worker.onmessage = undefined;
        return worker;
      } finally {
        clearTimeout(timeout);
        created = undefined;
      }
    } catch (error) {
      console.warn(`Failed to create a native worker. Creating a fallback worker on the main thread instead (${error.message})`);
      class FallbackWorker {
        constructor(func) {
          this.isFallbackWorker = true;
          this.onerror = error => {
            console.error(error);
          };
          this.postMessage = data => {
            try {
              this.globalScope.onmessage({
                data
              });
            } catch (error) {
              this.onerror(error);
            }
          };
          const globalScope = this.globalScope = {
            postMessage: data => {
              if (this.onmessage) this.onmessage({
                data
              });
            },
            onmessage: () => console.error('onmessage not implemented'),
            isFallbackWorker: true
          };
          func.bind(globalScope)();
        }
      }
      return new FallbackWorker(func);
    }
  };

  const workerCode$1 = function () {
    class ImageHelper {
      constructor() {
        this.imageData = void 0;
        this.channels = 4;
      }
      get width() {
        var _this$imageData;
        return ((_this$imageData = this.imageData) === null || _this$imageData === void 0 ? void 0 : _this$imageData.width) ?? 0;
      }
      get height() {
        var _this$imageData2;
        return ((_this$imageData2 = this.imageData) === null || _this$imageData2 === void 0 ? void 0 : _this$imageData2.height) ?? 0;
      }
      getDataOffset(x, y) {
        return (y * this.width + x) * this.channels;
      }
      getPixel(x, y, data, dataOffset, alpha = true) {
        var _this$imageData3, _this$imageData3$data;
        let returnValue = !data;
        if (returnValue) data = new Uint8Array(4);
        if (!dataOffset) dataOffset = 0;
        const offset = this.getDataOffset(x, y);
        if (offset < 0 || offset > (((_this$imageData3 = this.imageData) === null || _this$imageData3 === void 0 ? void 0 : (_this$imageData3$data = _this$imageData3.data) === null || _this$imageData3$data === void 0 ? void 0 : _this$imageData3$data.length) ?? 0)) {
          data[dataOffset + 0] = 0;
          data[dataOffset + 1] = 0;
          data[dataOffset + 2] = 0;
          if (alpha) data[dataOffset + 3] = 0;
        } else {
          var _this$imageData4, _this$imageData4$data, _this$imageData5, _this$imageData5$data, _this$imageData6, _this$imageData6$data, _this$imageData7, _this$imageData7$data;
          data[dataOffset + 0] = (_this$imageData4 = this.imageData) === null || _this$imageData4 === void 0 ? void 0 : (_this$imageData4$data = _this$imageData4.data) === null || _this$imageData4$data === void 0 ? void 0 : _this$imageData4$data[offset];
          data[dataOffset + 1] = (_this$imageData5 = this.imageData) === null || _this$imageData5 === void 0 ? void 0 : (_this$imageData5$data = _this$imageData5.data) === null || _this$imageData5$data === void 0 ? void 0 : _this$imageData5$data[offset + 1];
          data[dataOffset + 2] = (_this$imageData6 = this.imageData) === null || _this$imageData6 === void 0 ? void 0 : (_this$imageData6$data = _this$imageData6.data) === null || _this$imageData6$data === void 0 ? void 0 : _this$imageData6$data[offset + 2];
          if (alpha) data[dataOffset + 3] = (_this$imageData7 = this.imageData) === null || _this$imageData7 === void 0 ? void 0 : (_this$imageData7$data = _this$imageData7.data) === null || _this$imageData7$data === void 0 ? void 0 : _this$imageData7$data[offset + 3];
        }
        if (returnValue) return data;
      }
    }
    let catchedWorkerCreationError = false;
    let canvas;
    let canvasIsCreatedInWorker = false;
    let ctx;
    let globalRunId = 0;
    let globalXOffsetIndex = 0;
    let image = new ImageHelper();
    const scanlinesAmount = 5;
    const postError = ex => {
      if (!catchedWorkerCreationError) {
        catchedWorkerCreationError = true;
        this.postMessage({
          id: -1,
          error: ex
        });
      }
    };
    const sortSizes = averageSize => (a, b) => {
      const aGap = Math.abs(averageSize - a.yIndex);
      const bGap = Math.abs(averageSize - b.yIndex);
      return aGap === bGap ? 0 : aGap > bGap ? 1 : -1;
    };
    const colorChannels = image.channels - 1;
    const colorsLength = 116;
    const averageColorColorsData = new Uint8Array(colorsLength * colorChannels);
    const averageColorsIndexes = new Uint8Array(colorsLength);
    const averageColorsIndexesDiffs = new Uint16Array(colorsLength);
    const averageColorsLength = Math.floor(colorsLength * 0.25);
    const averageColor = new Uint32Array(colorChannels);
    function sortAverageColors(ai, bi) {
      return averageColorsIndexesDiffs[ai] - averageColorsIndexesDiffs[bi];
    }
    function getAverageColor(yAxis) {
      const colors = averageColorColorsData;
      const colorsIndexes = averageColorsIndexes;
      const colorsIndexesDiffs = averageColorsIndexesDiffs;
      for (let i = 0, yMax = image[yAxis], linesY = [2, 4, yMax - 4, yMax - 2], xStep = 16, offset = xStep * 2, xMax = image[yAxis === 'height' ? 'width' : 'height'], colorsOffset = 0; i < linesY.length; i++) {
        for (let x = offset, y = linesY[i]; x <= xMax - offset; x += xStep) {
          if (yAxis === 'height') {
            image.getPixel(x, y, colors, colorsOffset, false);
          } else {
            image.getPixel(y, x, colors, colorsOffset, false);
          }
          colorsOffset += colorChannels;
        }
      }
      for (let i = 0; i < colorsIndexes.length; i++) {
        colorsIndexes[i] = i;
      }
      const shrinkBy = Math.floor(averageColorsLength / 2);
      for (let includedColorsLength = colorsLength; includedColorsLength >= averageColorsLength; includedColorsLength -= shrinkBy) {
        for (let iRGB = 0; iRGB < colorChannels; iRGB++) {
          averageColor[iRGB] = 0;
          for (let i = 0; i < includedColorsLength; i++) {
            const colorsIndex = colorsIndexes[i];
            const colorOffset = colorsIndex * colorChannels + iRGB;
            averageColor[iRGB] += colors[colorOffset];
          }
          averageColor[iRGB] = Math.round(averageColor[iRGB] / includedColorsLength);
        }
        if (includedColorsLength - shrinkBy < averageColorsLength) break;
        for (let i = 0; i < colorsIndexesDiffs.length; i++) {
          const colorsIndex = colorsIndexes[i];
          if (i < includedColorsLength) {
            const pixelOffset = colorsIndex * colorChannels;
            const diff = Math.abs(averageColor[0] - colors[pixelOffset]) + Math.abs(averageColor[1] - colors[pixelOffset + 1]) + Math.abs(averageColor[2] - colors[pixelOffset + 2]);
            colorsIndexesDiffs[colorsIndex] = diff;
          } else {
            colorsIndexesDiffs[colorsIndex] += 1000;
          }
        }
        colorsIndexes.sort(sortAverageColors);
      }
      return Array.from(averageColor);
    }
    function getHueDeviation(a, b) {
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    }
    function getBrightnessDeviation(a, b) {
      return Math.abs(a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
    }
    const maxBlackDeviation = {
      hue: 16,
      brightness: 8,
      sum: 20,
      score: 155 * 3 + 155 * 3
    };
    const maxDarkDeviation = {
      hue: 22,
      brightness: 22,
      sum: 36,
      score: 155 * 3 + 155 * 3
    };
    const maxLightDeviation = {
      hue: 32,
      brightness: 64,
      sum: 86,
      score: 255 * 3 + 255 * 3
    };
    function getMaxDeviationLimits(color) {
      const brightness = color[0] + color[1] + color[2];
      return brightness > 500 ? maxLightDeviation : brightness > 20 ? maxDarkDeviation : maxBlackDeviation;
    }
    function isColorWithinMaxDeviation(currentColor, referenceColor) {
      const hueDeviation = getHueDeviation(currentColor, referenceColor);
      const brightnessDeviation = getBrightnessDeviation(currentColor, referenceColor);
      const maxDeviation = getMaxDeviationLimits(referenceColor);
      return hueDeviation <= maxDeviation.hue && brightnessDeviation <= maxDeviation.brightness && hueDeviation + brightnessDeviation <= maxDeviation.sum;
    }
    const minDeviationScore = 0.25 ;
    const edgePointXRange = 32;
    const edgePointYRange = 8 ;
    const edgePointYCenter = 2 / edgePointYRange;
    const easeInOutQuad = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const getCertaintyColorData = new Uint8Array(4);
    const getCertainty = (pointX, pointY, yAxis, yDirection, color) => {
      const x = pointX - (edgePointXRange );
      const y = pointY - edgePointYRange * 2 * (yDirection === 1 ? edgePointYCenter : 1 - edgePointYCenter);
      const xLength = 1 + (edgePointXRange * 2 );
      const yLength = 1 + edgePointYRange * 2;
      let score = 0;
      for (let dx = 0; dx < xLength; dx += 2) {
        for (let dy = 0; dy < yLength; dy += 2) {
          const dy2 = yDirection === 1 ? dy : yLength - 1 - dy;
          let iColor = getCertaintyColorData;
          if (yAxis === 'height') {
            image.getPixel(x + dx, y + dy2, iColor);
          } else {
            image.getPixel(y + dy2, x + dx, iColor);
          }
          if (iColor[3] === 0) iColor = color;
          const expectWithinDeviation = dy < Math.floor(1 + edgePointYRange * 2 * edgePointYCenter);
          if (!expectWithinDeviation) {
            const maxDeviation = getMaxDeviationLimits(color);
            const hueDeviation = getHueDeviation(iColor, color);
            const brightnessDeviation = getBrightnessDeviation(iColor, color);
            const deviationScore = Math.max(0, Math.min(1 - minDeviationScore, (hueDeviation + brightnessDeviation) / maxDeviation.score / 0.05));
            score += minDeviationScore + deviationScore;
          } else {
            const within = isColorWithinMaxDeviation(iColor, color);
            if (within) score += 1;
          }
        }
      }
      const length = (1 + (xLength - 1) / 2) * (1 + (yLength - 1) / 2);
      const certainty = (score - length / 2) / (length / 2);
      return easeInOutQuad(certainty);
    };
    const largeStep = 4;
    const ignoreEdge = 2;
    const middleYOffset = 10;
    const minCertainty = 0.65;
    const maxCertaintyChecks = 3 ;
    const sureCertainty = 0.65 ;
    const getAverageLineColorRange = 9;
    const getAverageLineColorRangeOffset = (getAverageLineColorRange - 1) / 2;
    const getAverageLineColorData = new Uint8Array(4 * getAverageLineColorRange);
    function getAverageLineColor(x, y, yAxis, iColor) {
      const iColors = getAverageLineColorData;
      const range = getAverageLineColorRange;
      const rangeOffset = getAverageLineColorRangeOffset;
      for (let i = 0; i < range; i++) {
        const x2 = x + (i - rangeOffset) * 2;
        const iColorsOffset = i * 4;
        if (yAxis === 'height') {
          image.getPixel(x2, y, iColors, iColorsOffset);
        } else {
          image.getPixel(y, x2, iColors, iColorsOffset);
        }
      }
      for (let i = 0; i < 4; i++) {
        let sum = 0;
        for (let j = 0; j < range; j++) {
          sum += iColors[j * 4 + i];
        }
        iColor[i] = Math.round(sum / range);
      }
    }
    const detectEdgesColorData = new Uint8Array(4);
    function detectEdges(linesX, color, yAxis) {
      const maxY = image[yAxis];
      const middleY = maxY / 2;
      const topEdges = [];
      const bottomEdges = [];
      const iColor = detectEdgesColorData;
      for (const x of linesX) {
        let step = largeStep;
        let wasDeviating = false;
        let wasUncertain = false;
        let mostCertainEdge;
        let detectedEdges = 0;
        for (let y = ignoreEdge; y < maxY; y += step) {
          if (wasUncertain) {
            wasUncertain = false;
            step = 1;
          }
          getAverageLineColor(x, y, yAxis, iColor);
          const limitNotReached = y < middleY - middleYOffset - 1;
          if (!limitNotReached || detectedEdges > maxCertaintyChecks) {
            var _mostCertainEdge;
            if (((_mostCertainEdge = mostCertainEdge) === null || _mostCertainEdge === void 0 ? void 0 : _mostCertainEdge.certainty) > minCertainty) {
              topEdges.find(edge => x === edge.xIndex && mostCertainEdge.yIndex === edge.yIndex).deviates = false;
            } else {
              topEdges.push({
                xIndex: x,
                yIndex: 0,
                certainty: 0,
                deviates: true
              });
            }
            break;
          }
          const isDeviating = !isColorWithinMaxDeviation(iColor, color);
          if (limitNotReached && wasDeviating && !isDeviating) {
            wasDeviating = false;
            continue;
          }
          if (limitNotReached && wasDeviating === isDeviating) continue;
          if (y !== 0 && step === largeStep) {
            y = Math.max(-1, y - 1 * step);
            step = Math.ceil(1, Math.floor(step / 2));
            continue;
          }
          const certainty = getCertainty(x, y / 1, yAxis, 1, color);
          detectedEdges++;
          if (limitNotReached && certainty < sureCertainty) {
            var _mostCertainEdge2;
            wasUncertain = true;
            wasDeviating = true;
            if (!(((_mostCertainEdge2 = mostCertainEdge) === null || _mostCertainEdge2 === void 0 ? void 0 : _mostCertainEdge2.certainty) >= certainty)) {
              mostCertainEdge = {
                yIndex: y,
                certainty
              };
            }
            topEdges.push({
              xIndex: x,
              yIndex: y,
              certainty: certainty,
              deviates: true
            });
            continue;
          }
          topEdges.push({
            xIndex: x,
            yIndex: y,
            certainty
          });
          break;
        }
        step = largeStep;
        wasDeviating = false;
        wasUncertain = false;
        mostCertainEdge = undefined;
        detectedEdges = 0;
        for (let y = maxY - 1 + ignoreEdge; y >= 0; y -= step) {
          if (wasUncertain) {
            wasUncertain = false;
            step = 1;
          }
          getAverageLineColor(x, y, yAxis, iColor);
          const limitNotReached = y > middleY + middleYOffset;
          if (!limitNotReached || detectedEdges > maxCertaintyChecks) {
            var _mostCertainEdge3;
            if (((_mostCertainEdge3 = mostCertainEdge) === null || _mostCertainEdge3 === void 0 ? void 0 : _mostCertainEdge3.certainty) > minCertainty) {
              bottomEdges.find(edge => x === edge.xIndex && mostCertainEdge.yIndex === edge.yIndex).deviates = false;
            } else {
              bottomEdges.push({
                xIndex: x,
                yIndex: 0,
                certainty: 0,
                deviates: true
              });
            }
            break;
          }
          const isDeviating = !isColorWithinMaxDeviation(iColor, color);
          if (limitNotReached && wasDeviating && !isDeviating) {
            wasDeviating = false;
            continue;
          }
          if (limitNotReached && wasDeviating === isDeviating) continue;
          if (y !== maxY - 1 && step === largeStep) {
            y = Math.min(maxY - 1, y + step);
            step = Math.ceil(1, Math.floor(step / 2));
            continue;
          }
          const certainty = getCertainty(x, y, yAxis, -1, color);
          detectedEdges++;
          if (limitNotReached && certainty < sureCertainty) {
            var _mostCertainEdge4;
            wasUncertain = true;
            wasDeviating = true;
            if (!(((_mostCertainEdge4 = mostCertainEdge) === null || _mostCertainEdge4 === void 0 ? void 0 : _mostCertainEdge4.certainty) >= certainty)) {
              mostCertainEdge = {
                yIndex: maxY - y,
                certainty
              };
            }
            bottomEdges.push({
              xIndex: x,
              yIndex: maxY - y,
              certainty: certainty,
              deviates: true
            });
            continue;
          }
          bottomEdges.push({
            xIndex: x,
            yIndex: maxY - y,
            certainty
          });
          break;
        }
      }
      return {
        topEdges,
        bottomEdges
      };
    }
    const reduceAverageSize = edges => edges.reduce((sum, edge) => sum + edge.yIndex, 0) / edges.length;
    function getExceedsDeviationLimit(edges, topEdges, bottomEdges, linesX, maxSize, scale, allowedAnomaliesPercentage, allowedUnevenBarsPercentage) {
      if (!topEdges.filter(e => !e.deviates).length || !bottomEdges.filter(e => !e.deviates).length) {
        return true;
      }
      const threshold = linesX.length * 2 * (1 - (allowedAnomaliesPercentage - 10) / 100);
      if (edges.filter(e => !e.deviates).length < threshold) {
        return true;
      }
      while (edges.filter(e => !e.deviates).length > threshold) {
        const nonDeviatingEdges = edges.filter(e => !e.deviates);
        const averageSize = reduceAverageSize(nonDeviatingEdges);
        nonDeviatingEdges.sort(sortSizes(averageSize));
        const deviatingEdge = nonDeviatingEdges[nonDeviatingEdges.length - 1];
        deviatingEdge.deviates = true;
      }
      const maxAllowedSideDeviation = maxSize * (0.008 * scale);
      const nonDeviatingTopEdges = topEdges.filter(e => !e.deviates && !e.deviatesTop);
      const maxTopDeviation = Math.abs(Math.max(...nonDeviatingTopEdges.map(e => e.yIndex)) - Math.min(...nonDeviatingTopEdges.map(e => e.yIndex)));
      const topDeviationIsAllowed = maxTopDeviation <= maxAllowedSideDeviation;
      const nonDeviatingBottomEdges = bottomEdges.filter(e => !e.deviates && !e.deviatesBottom);
      const maxBottomDeviation = Math.abs(Math.max(...nonDeviatingBottomEdges.map(e => e.yIndex)) - Math.min(...nonDeviatingBottomEdges.map(e => e.yIndex)));
      const bottomDeviationIsAllowed = maxBottomDeviation <= maxAllowedSideDeviation;
      if (!topDeviationIsAllowed && !bottomDeviationIsAllowed) {
        return true;
      }
      const averageTopSize = reduceAverageSize(nonDeviatingTopEdges);
      const averageBottomSize = reduceAverageSize(nonDeviatingBottomEdges);
      const sidesDeviation = Math.abs(averageTopSize - averageBottomSize);
      const maxAllowedDeviation = maxSize * (0.003 + allowedUnevenBarsPercentage * 0.0008) * scale;
      const minMaxAllowedSideDeviation = maxSize * (0.016 * scale);
      let maxAllowedSidesDeviation = maxAllowedDeviation;
      if (averageTopSize < minMaxAllowedSideDeviation || averageBottomSize < minMaxAllowedSideDeviation) {
        maxAllowedSidesDeviation = 2;
      }
      if (sidesDeviation > maxAllowedSidesDeviation) {
        return true;
      }
      const nonDeviatingEdgeSizes = edges.filter(e => !e.deviates).map(e => e.yIndex);
      const maxDeviation = Math.abs(Math.max(...nonDeviatingEdgeSizes) - Math.min(...nonDeviatingEdgeSizes));
      if (maxDeviation > maxAllowedDeviation) {
        return true;
      }
    }
    function getPercentage(exceedsDeviationLimit, maxSize, scale, edges, linesX, currentPercentage = 0, offsetPercentage = 0) {
      const lowerSizeThreshold = maxSize * ((currentPercentage - 2) / 100);
      const baseOffsetPercentage = 0.3 * ((1 + scale) / 2);
      let certainty = 1;
      let size;
      if (exceedsDeviationLimit) {
        const uncertainLowerEdges = edges.filter(e => e.certainty > 0.02 && e.yIndex < lowerSizeThreshold);
        if (uncertainLowerEdges.length / (linesX.length * 2) < 0.3) return {
          percentage: undefined,
          certainty: 0
        };
        certainty = uncertainLowerEdges.reduce((sum, edge) => sum + edge.certainty, 0) / uncertainLowerEdges.length;
        const lowestEdge = uncertainLowerEdges.sort((a, b) => a.yIndex - b.yIndex)[0];
        size = lowestEdge.yIndex;
        if (size < 0) {
          size = 0;
        } else {
          size += maxSize * (offsetPercentage / 100);
        }
      } else {
        const sortedEdges = edges.filter(e => !e.deviates).sort(sortSizes(0));
        size = reduceAverageSize(sortedEdges.slice(Math.floor(sortedEdges.length / 2)));
        if (size < 0) {
          size = 0;
        } else {
          size += maxSize * ((baseOffsetPercentage + offsetPercentage) / 100);
        }
      }
      let percentage = Math.round(size / maxSize * 10000) / 100;
      const maxPercentage = 38;
      percentage = Math.min(percentage, maxPercentage);
      return {
        percentage,
        certainty
      };
    }
    const workerDetectBarSizeLinesX = new Uint16Array(5);
    try {
      const workerDetectBarSize = (id, xLength, yAxis, scale, detectColored, offsetPercentage, currentPercentage, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, xOffset) => {
        const partSizeBorderMultiplier = -0.1 + 2 * allowedAnomaliesPercentage / 100;
        const partSize = Math.floor(canvas[xLength] / (scanlinesAmount + partSizeBorderMultiplier * 2));
        const linesX = workerDetectBarSizeLinesX;
        let linesXIndex = 0;
        for (let index = Math.ceil(partSize / 2) - 1 + partSizeBorderMultiplier * partSize; index < canvas[xLength] - partSizeBorderMultiplier * partSize; index += partSize) {
          const xIndex = Math.min(Math.max(0, Math.round(index + Math.round(xOffset * (partSize / 2) - partSize / 4))), canvas[xLength] - 1);
          linesX[linesXIndex] = xIndex;
          linesXIndex++;
        }
        const color = getAverageColor(yAxis);
        if (!detectColored && (color[0] + color[1] + color[2] > 16 || Math.abs(color[0] - color[1]) > 3 || Math.abs(color[1] - color[2]) > 3 || Math.abs(color[2] - color[0]) > 3)) {
          const topEdges = linesX.map(x => ({
            xIndex: x,
            yIndex: 0,
            deviates: true
          }));
          const bottomEdges = linesX.map(x => ({
            xIndex: x,
            yIndex: 0,
            deviates: true
          }));
          return {
            percentage: 0,
            topEdges,
            bottomEdges,
            color
          };
        }
        const {
          topEdges,
          bottomEdges
        } = detectEdges(linesX, color, yAxis);
        const maxSize = image[yAxis];
        const edges = topEdges.concat(bottomEdges);
        const exceedsDeviationLimit = getExceedsDeviationLimit(edges, topEdges, bottomEdges, linesX, maxSize, scale, allowedAnomaliesPercentage, allowedUnevenBarsPercentage);
        const {
          percentage,
          certainty
        } = getPercentage(exceedsDeviationLimit, maxSize, scale, edges, linesX, currentPercentage, offsetPercentage);
        if (!(percentage < currentPercentage) && edges.filter(edge => !edge.deviates).length / (linesX.length * 2) < (100 - allowedAnomaliesPercentage) / 100) {
          for (const edge of topEdges) {
            edge.deviates = true;
          }
          for (const edge of bottomEdges) {
            edge.deviates = true;
          }
          return {
            topEdges,
            bottomEdges,
            color
          };
        }
        return {
          percentage,
          certainty,
          topEdges,
          bottomEdges,
          color
        };
      };
      const createContext = () => {
        ctx = canvas.getContext('2d', {
          desynchronized: true,
          willReadFrequently: true
        });
        ctx.imageSmoothingEnabled = false;
      };
      const createCanvas = (width, height) => {
        canvas = new OffscreenCanvas(width, height);
        canvas.addEventListener('contextlost', () => {
          try {
            canvas.width = 1;
            canvas.height = 1;
          } catch (ex) {
            postError(ex);
          }
        });
        canvas.addEventListener('contextrestored', () => {
          try {
            canvas.width = 1;
            canvas.height = 1;
          } catch (ex) {
            postError(ex);
          }
        });
        canvasIsCreatedInWorker = true;
        createContext();
      };
      this.onmessage = async e => {
        if (e.data === false) {
          this.postMessage(false);
          return;
        }
        const id = e.data.id;
        globalRunId = id;
        try {
          if (e.data.type === 'cancellation') {
            globalXOffsetIndex = 0;
            return;
          }
          if (e.data.type === 'clear') {
            globalXOffsetIndex = 0;
            if (canvas && canvasIsCreatedInWorker && canvas.width !== 1 && canvas.height !== 1) createCanvas(1, 1);
            return;
          }
          const {
            detectColored,
            detectHorizontal,
            detectVertical,
            offsetPercentage,
            currentHorizontalPercentage,
            currentVerticalPercentage,
            allowedAnomaliesPercentage,
            allowedUnevenBarsPercentage,
            canvasInfo,
            xOffsetSize
          } = e.data;
          if (canvasInfo.bitmap) {
            const bitmap = canvasInfo.bitmap;
            if (!canvas) {
              createCanvas(512, 512);
            } else if (canvas.width !== 512 || canvas.height !== 512) {
              canvas.width = 512;
              canvas.height = 512;
              createContext();
            }
            ctx.drawImage(bitmap, 0, 0, 512, 512);
            bitmap.close();
          } else {
            canvas = canvasInfo.canvas;
            canvasIsCreatedInWorker = false;
            ctx = canvasInfo.ctx;
          }
          image.imageData = ctx.getImageData(0, 0, 512, 512);
          globalXOffsetIndex++;
          if (globalXOffsetIndex >= xOffsetSize) globalXOffsetIndex = 0;
          const xOffset = xOffsetSize === 1 ? 0.5 : xOffsetSize === 2 ? globalXOffsetIndex : (Math.ceil(globalXOffsetIndex / 2) + globalXOffsetIndex % 2) / (xOffsetSize - 1);
          let horizontalBarSizeInfo = detectHorizontal ? await workerDetectBarSize(id, 'width', 'height', 1, detectColored, offsetPercentage, currentHorizontalPercentage, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, xOffset) : undefined;
          let verticalBarSizeInfo = detectVertical ? await workerDetectBarSize(id, 'height', 'width', 1, detectColored, offsetPercentage, currentVerticalPercentage, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, xOffset) : undefined;
          if (id !== globalRunId) {
            return;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.postMessage({
            id,
            horizontalBarSizeInfo,
            verticalBarSizeInfo
          });
        } catch (ex) {
          if (id === globalRunId) {
            var _ctx, _ctx$clearRect, _canvas, _canvas2;
            (_ctx = ctx) === null || _ctx === void 0 ? void 0 : (_ctx$clearRect = _ctx.clearRect) === null || _ctx$clearRect === void 0 ? void 0 : _ctx$clearRect.call(_ctx, 0, 0, ((_canvas = canvas) === null || _canvas === void 0 ? void 0 : _canvas.width) ?? 0, ((_canvas2 = canvas) === null || _canvas2 === void 0 ? void 0 : _canvas2.height) ?? 0);
          }
          this.postMessage({
            id,
            error: ex
          });
        }
      };
    } catch (ex) {
      postError(ex);
    }
  };
  class BarDetection {
    constructor(ambientlight) {
      this.worker = void 0;
      this.runId = 0;
      this.canvas = void 0;
      this.ctx = void 0;
      this.catchedDetectBarSizeError = false;
      this.changes = [];
      this.history = {
        horizontal: [],
        vertical: []
      };
      this.current = {
        horizontal: undefined,
        vertical: undefined
      };
      this.reset = () => {
        this.clear();
        this.history = {
          horizontal: [],
          vertical: []
        };
        this.current = {
          horizontal: undefined,
          vertical: undefined
        };
        this.changes = [];
      };
      this.clear = () => {
        this.runId++;
        if (this.worker) {
          this.worker.postMessage({
            id: this.runId,
            type: 'clear'
          });
        }
        this.running = false;
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }
      };
      this.cancel = () => {
        this.runId++;
        if (this.worker) {
          this.worker.postMessage({
            id: this.runId,
            type: 'cancellation'
          });
        }
        this.running = false;
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }
      };
      this.detect = async (buffer, detectColored, offsetPercentage, detectHorizontal, currentHorizontalPercentage, detectVertical, currentVerticalPercentage, ratio, allowedToTransfer, averageHistorySize, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, callback) => {
        if (this.running) {
          return;
        }
        this.runId++;
        const runId = this.runId;
        this.running = true;
        if (!this.worker) {
          this.worker = await workerFromCode(workerCode$1);
          const stack = new Error().stack;
          this.worker.onmessage = e => {
            if (this.onWorkerMessageListener) {
              return this.onWorkerMessageListener(e);
            }
            if (e.data.id !== -1) {
              return;
            }
            if (e.data.error) {
              appendErrorStack(stack, e.data.error);
              SentryReporter.captureException(e.data.error);
            }
          };
          this.worker.onerror = err => {
            if (!(err instanceof Error)) {
              const details = err;
              err = new Error(`bar-detection-worker.js: ${err.message ?? 'Unknown error'}`);
              err.details = details;
            }
            if (this.onWorkerRejectListener) {
              return this.onWorkerRejectListener(err);
            }
            SentryReporter.captureException(err);
          };
        }
        if (this.history.horizontal.length === 0) currentHorizontalPercentage = undefined;
        if (this.history.vertical.length === 0) currentVerticalPercentage = undefined;
        requestIdleCallback(async function detectIdleCallback() {
          await this.idleHandler(runId, buffer, detectColored, offsetPercentage, detectHorizontal, currentHorizontalPercentage, detectVertical, currentVerticalPercentage, ratio, allowedToTransfer, averageHistorySize, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, callback);
        }.bind(this), {
          timeout: 1
        }, true);
      };
      this.maxDivergencePercentage = 0.75;
      this.groupByPercentage = 0.5;
      this.idleHandler = async (runId, buffer, detectColored, offsetPercentage, detectHorizontal, currentHorizontalPercentage, detectVertical, currentVerticalPercentage, ratio, allowedToTransfer, averageHistorySize, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, callback) => {
        if (this.runId !== runId) return;
        let canvasInfo;
        let bufferCtx;
        try {
          const start = performance.now();
          if (this.worker.isFallbackWorker || !allowedToTransfer || !buffer.transferToImageBitmap || !buffer.getContext) {
            var _this$ctx;
            if (!this.canvas) {
              this.canvas = new SafeOffscreenCanvas(512, 512);
              this.ctx = undefined;
            }
            if (!this.ctx || (_this$ctx = this.ctx) !== null && _this$ctx !== void 0 && _this$ctx.isContextLost && this.ctx.isContextLost()) {
              this.ctx = this.canvas.getContext('2d', {
                desynchronized: true
              });
              this.ctx.imageSmoothingEnabled = true;
            }
            this.ctx.drawImage(buffer, 0, 0, this.canvas.width, this.canvas.height);
            canvasInfo = this.worker.isFallbackWorker || !this.canvas.transferToImageBitmap ? {
              canvas: this.canvas,
              ctx: this.ctx
            } : {
              bitmap: this.canvas.transferToImageBitmap()
            };
          } else {
            bufferCtx = buffer.getContext('2d');
            if (bufferCtx instanceof Promise) bufferCtx = await bufferCtx;
            if (bufferCtx && (!bufferCtx.isContextLost || !bufferCtx.isContextLost())) {
              canvasInfo = {
                bitmap: buffer.transferToImageBitmap()
              };
            }
          }
          if (this.runId !== runId) {
            var _canvasInfo;
            if ((_canvasInfo = canvasInfo) !== null && _canvasInfo !== void 0 && _canvasInfo.bitmap) {
              canvasInfo.bitmap.close();
            }
            return;
          }
          if (!canvasInfo) {
            this.running = false;
            return;
          }
          this.ambientlight.stats.updateBarDetectionImage(canvasInfo.bitmap ?? canvasInfo.canvas);
          const stack = new Error().stack;
          const onMessagePromise = new Promise(function onMessagePromise(resolve, reject) {
            this.onWorkerRejectListener = err => reject(err);
            this.onWorkerMessageListener = async e => {
              try {
                if (e.data.id !== this.runId) {
                  resolve();
                  return;
                }
                if (e.data.error) {
                  var _error$stack;
                  const error = e.data.error;
                  error.stack = (_error$stack = error.stack) === null || _error$stack === void 0 ? void 0 : _error$stack.replace(/blob:.+?:\/.+?:/g, 'extension://scripts/bar-detection-worker.js:');
                  appendErrorStack(stack, error);
                  throw error;
                }
                const minPercentage = 1.25 + offsetPercentage;
                const {
                  horizontalBarSizeInfo = {},
                  verticalBarSizeInfo = {}
                } = e.data;
                const firstDetection = this.history.horizontal.length === 0 && this.history.vertical.length === 0;
                let horizontalPercentage = this.averagePercentage(horizontalBarSizeInfo, this.current.horizontal, minPercentage, this.history.horizontal, averageHistorySize);
                let verticalPercentage = this.averagePercentage(verticalBarSizeInfo, this.current.vertical, minPercentage, this.history.vertical, averageHistorySize);
                let barsFound = horizontalPercentage !== undefined || verticalPercentage !== undefined;
                await this.ambientlight.stats.updateBarDetectionResult(barsFound, horizontalBarSizeInfo, verticalBarSizeInfo, horizontalPercentage ?? currentHorizontalPercentage ?? 0, verticalPercentage ?? currentVerticalPercentage ?? 0);
                if (e.data.id !== this.runId) {
                  resolve();
                  return;
                }
                if (firstDetection) {
                  if (horizontalPercentage === undefined) horizontalPercentage = 0;
                  if (verticalPercentage === undefined) verticalPercentage = 0;
                  barsFound = true;
                }
                const barsChanged = barsFound && horizontalPercentage !== undefined && horizontalPercentage !== currentHorizontalPercentage || verticalPercentage !== undefined && verticalPercentage !== currentVerticalPercentage;
                const detectedLargeChange = horizontalBarSizeInfo.percentage > minPercentage && Math.abs(horizontalBarSizeInfo.percentage - (currentHorizontalPercentage || 0)) > 0.5 || verticalBarSizeInfo.percentage > minPercentage && Math.abs(verticalBarSizeInfo.percentage - (currentVerticalPercentage || 0)) > 0.5;
                if (barsChanged || detectedLargeChange) {
                  const now = performance.now();
                  if (barsChanged || this.changes[this.changes.length - 1] < now - 3000) {
                    this.changes.push(now);
                  }
                }
                if (horizontalPercentage !== undefined) {
                  this.current.horizontal = {
                    percentage: horizontalPercentage,
                    color: horizontalBarSizeInfo.color
                  };
                }
                if (verticalPercentage !== undefined) {
                  this.current.vertical = {
                    percentage: verticalPercentage,
                    color: verticalBarSizeInfo.color
                  };
                }
                if (barsChanged) {
                  callback(horizontalPercentage, verticalPercentage);
                }
                resolve();
              } catch (ex) {
                reject(ex);
              }
            };
          }.bind(this));
          this.worker.postMessage({
            id: runId,
            canvasInfo,
            detectColored,
            offsetPercentage,
            detectHorizontal,
            currentHorizontalPercentage,
            detectVertical,
            currentVerticalPercentage,
            ratio,
            allowedAnomaliesPercentage,
            allowedUnevenBarsPercentage,
            xOffsetSize: averageHistorySize
          }, canvasInfo.bitmap ? [canvasInfo.bitmap] : undefined);
          await onMessagePromise;
          if (this.runId !== runId) return;
          const now = performance.now();
          const duration = now - start;
          this.ambientlight.stats.addBarDetectionDuration(duration);
          if (this.changes.length > 1) {
            const minuteAgo = performance.now() - 60000;
            this.changes = this.changes.filter(change => change > minuteAgo);
          } else if (!this.changes.length) {
            this.changes.push(now - 3001);
          }
          let minThrottle;
          const lastChange = this.changes[this.changes.length - 1];
          if (this.changes.length >= 5) {
            minThrottle = lastChange + 60000 < now ? 1000 : lastChange + 8000 < now ? 500 : 0;
          } else {
            minThrottle = lastChange + 15000 < now ? 1000 : lastChange + 3000 < now ? 500 : 0;
          }
          const throttle = Math.max(minThrottle, Math.min(5000, Math.pow(duration, 1.2) - 250));
          this.ambientlight.stats.updateBarDetectionInfo(throttle, this.changes[this.changes.length - 1]);
          this.timeout = setTimeout(wrapErrorHandler(() => {
            this.timeout = undefined;
            if (this.runId !== runId) return;
            this.running = false;
          }), throttle);
        } catch (ex) {
          var _ex$message;
          const isKnownError = ((_ex$message = ex.message) === null || _ex$message === void 0 ? void 0 : _ex$message.includes('ImageBitmap construction failed')) || ex.name === 'DataCloneError';
          if (!isKnownError) {
            var _buffer$ctx, _buffer$ctx$construct, _buffer$constructor, _bufferCtx, _bufferCtx$constructo, _canvasInfo2, _canvasInfo$canvas$co, _canvasInfo$ctx, _canvasInfo$ctx$const, _canvasInfo3, _canvasInfo$bitmap$co;
            ex.details = {
              ...(ex.details ? {
                details: ex.details
              } : {}),
              detectColored,
              offsetPercentage,
              detectHorizontal,
              currentHorizontalPercentage,
              detectVertical,
              currentVerticalPercentage,
              ratio,
              allowedToTransfer,
              buffer: buffer ? {
                width: buffer.width,
                height: buffer.height,
                ctx: (_buffer$ctx = buffer.ctx) === null || _buffer$ctx === void 0 ? void 0 : (_buffer$ctx$construct = _buffer$ctx.constructor) === null || _buffer$ctx$construct === void 0 ? void 0 : _buffer$ctx$construct.name,
                type: (_buffer$constructor = buffer.constructor) === null || _buffer$constructor === void 0 ? void 0 : _buffer$constructor.name
              } : undefined,
              bufferCtx: (_bufferCtx = bufferCtx) === null || _bufferCtx === void 0 ? void 0 : (_bufferCtx$constructo = _bufferCtx.constructor) === null || _bufferCtx$constructo === void 0 ? void 0 : _bufferCtx$constructo.name,
              canvasInfo: canvasInfo ? {
                canvas: (_canvasInfo2 = canvasInfo) !== null && _canvasInfo2 !== void 0 && _canvasInfo2.canvas ? {
                  width: canvasInfo.canvas.width,
                  height: canvasInfo.canvas.height,
                  type: (_canvasInfo$canvas$co = canvasInfo.canvas.constructor) === null || _canvasInfo$canvas$co === void 0 ? void 0 : _canvasInfo$canvas$co.name
                } : undefined,
                ctx: (_canvasInfo$ctx = canvasInfo.ctx) === null || _canvasInfo$ctx === void 0 ? void 0 : (_canvasInfo$ctx$const = _canvasInfo$ctx.constructor) === null || _canvasInfo$ctx$const === void 0 ? void 0 : _canvasInfo$ctx$const.name,
                bitmap: (_canvasInfo3 = canvasInfo) !== null && _canvasInfo3 !== void 0 && _canvasInfo3.bitmap ? {
                  width: canvasInfo.bitmap.width,
                  height: canvasInfo.bitmap.height,
                  type: (_canvasInfo$bitmap$co = canvasInfo.bitmap.constructor) === null || _canvasInfo$bitmap$co === void 0 ? void 0 : _canvasInfo$bitmap$co.name
                } : undefined
              } : undefined
            };
          }
          if (this.runId === runId) {
            var _canvasInfo4;
            if ((_canvasInfo4 = canvasInfo) !== null && _canvasInfo4 !== void 0 && _canvasInfo4.bitmap) {
              canvasInfo.bitmap.close();
            }
            this.running = false;
          }
          if (this.catchedDetectBarSizeError || isKnownError) return;
          this.catchedDetectBarSizeError = true;
          throw ex;
        }
      };
      this.ambientlight = ambientlight;
    }
    averagePercentage(barSizeInfo = {}, currentInfo = {}, minPercentage, history, averageHistorySize) {
      let {
        percentage,
        color,
        certainty
      } = barSizeInfo;
      let {
        percentage: currentPercentage,
        color: currentColor
      } = currentInfo;
      let colorChanged = false;
      if (currentColor && color) {
        if (Math.abs(currentColor[0] - color[0]) + Math.abs(currentColor[1] - color[1]) + Math.abs(currentColor[2] - color[2]) > 50) {
          if (percentage === undefined || certainty < 0.8) percentage = 0;
          certainty = 1;
          colorChanged = true;
        }
      }
      if (percentage === undefined) {
        if (!history.length && !currentPercentage) {
          history.push({
            percentage: 0,
            certainty: 1,
            color
          });
          return 0;
        }
        return;
      }
      const detectedPercentage = percentage;
      let percentages = [...history, {
        percentage: detectedPercentage,
        certainty,
        color
      }];
      for (const info of percentages) {
        info.occurrences = percentages.filter(({
          percentage
        }) => Math.abs(info.percentage - percentage) < this.groupByPercentage).length;
      }
      if (!colorChanged) {
        var _percentages$find, _percentages$find2;
        percentage = parseFloat(percentages.reduce((a, b) => a.occurrences > b.occurrences ? a : b).percentage);
        if (percentage !== currentPercentage && (((_percentages$find = percentages.find(info => info.percentage === percentage)) === null || _percentages$find === void 0 ? void 0 : _percentages$find.occurrences) ?? 0) - (((_percentages$find2 = percentages.find(info => info.percentage === currentPercentage)) === null || _percentages$find2 === void 0 ? void 0 : _percentages$find2.occurrences) ?? 0) <= history.length / 2) {
          percentage = currentPercentage;
        }
      }
      let adjustment = percentage - currentPercentage;
      if (percentage !== 0 && adjustment > -this.maxDivergencePercentage && adjustment <= 0) {
        adjustment = detectedPercentage - currentPercentage;
        if (adjustment > -this.maxDivergencePercentage && adjustment <= 0) {
          percentage = undefined;
        } else {
          percentage = currentPercentage;
        }
      }
      const ignoreRecurringLowerPercentage = percentage < currentPercentage && history.some(({
        percentage: previousPercentage
      }) => Math.abs(currentPercentage - previousPercentage) < this.groupByPercentage) && history.some(({
        percentage: previousPercentage
      }) => Math.abs(detectedPercentage - previousPercentage) < this.groupByPercentage);
      if (colorChanged && percentage !== currentPercentage) {
        const nonDeviatingPercentages = history.filter(info => Math.abs(info.percentage - percentage) < this.maxDivergencePercentage);
        if (history.length !== nonDeviatingPercentages.length) {
          history.splice(0, history.length);
          history.push(...nonDeviatingPercentages);
        }
      }
      history.push({
        percentage: detectedPercentage,
        certainty,
        color
      });
      if (history.length > averageHistorySize) history.splice(0, history.length - averageHistorySize);
      if (ignoreRecurringLowerPercentage) {
        return;
      }
      return percentage < minPercentage ? 0 : percentage;
    }
  }

  const FRAMESYNC_DECODEDFRAMES = 0;
  const FRAMESYNC_DISPLAYFRAMES = 1;
  const FRAMESYNC_VIDEOFRAMES = 2;
  const DEBANDING_BLEND_MODE_LCD = 0;
  const DEBANDING_BLEND_MODE_OLED = 1;
  const feedbackFormLink = getFeedbackFormLink();
  const baseUrl$1 = chrome.runtime.getURL('') || '';
  const version = getVersion();
  const getSettingQuerySelector = name => `#setting-${name.replace(/\./g, '\\.')}`;
  class Settings {
    constructor(ambientlight, menuBtnParent, menuElemParent) {
      this.saveStorageEntryTimeout = {};
      this.handleWebGLCrash = async () => {
        this.webGLCrashDate = new Date();
        this.saveStorageEntry('webGLCrash', +this.webGLCrashDate);
        this.saveStorageEntry('webGLCrashVersion', version);
        this.set('webGL', false, true, true);
        this.updateVisibility();
        this.saveStorageEntry('flickerReduction', undefined);
        this.saveStorageEntry('frameFading', undefined);
        this.saveStorageEntry('resolution', undefined);
        SettingsConfig.find(setting => setting.name === 'spread').max = 200;
        if (this.spread > 200) this.set('spread', 200, true, false);
        const spreadRangeInputElem = this.menuElem.querySelector(`#setting-spread-range`);
        if (spreadRangeInputElem) spreadRangeInputElem.max = 200;
        await this.flushPendingStorageEntries();
        this.updateWebGLCrashDescription();
      };
      this.updateWebGLCrashDescription = () => {
        const disabledText = SettingsConfig.find(setting => setting.name === 'webGL').disabled || '';
        const labelElem = this.menuElem.querySelector('#setting-webGL .ytp-menuitem-label');
        let descriptionElem = this.menuElem.querySelector('#setting-webGL .ytp-menuitem-label .ytpa-menuitem-description');
        if (!descriptionElem) {
          descriptionElem = document.createElement('span');
          descriptionElem.className = 'ytpa-menuitem-description';
          labelElem.appendChild(descriptionElem);
        }
        descriptionElem.classList.add('ytpa-menuitem-description--warning');
        let descriptionText = disabledText;
        if (this.webGLCrashDate) {
          descriptionText += `${disabledText ? '\r\nAnd the WebGL renderer previously failed' : 'Failed to load'} at ${this.webGLCrashDate.toLocaleTimeString()} ${this.webGLCrashDate.toLocaleDateString()}`;
          descriptionText += `\r\n\r\nCheck the Hardware acceleration and WebGL settings in your browser or click on the link "troubleshoot performance problems" at the top of this menu to troubleshoot this problem.`;
          if (!disabledText) descriptionText += `\r\n\r\nNote: You can re-enable this setting to try it again. In case the WebGL renderer fails again we will update the time at which it failed.`;
        }
        descriptionElem.textContent = descriptionText;
      };
      this.menuOnCloseScrollBottom = -1;
      this.menuOnCloseScrollHeight = 1;
      this.onSettingsBtnClicked = async () => {
        const isOpen = this.menuElem.classList.contains('is-visible') || this.menuElem.classList.contains('fade-out');
        if (isOpen) return;
        while (!this.ambientlight.initializedTime) {
          await new Promise(resolve => setTimeout$1(resolve, 500));
        }
        this.menuElem.classList.remove('fade-out');
        this.menuElem.classList.add('is-visible');
        if (this.menuOnCloseScrollBottom !== -1) {
          const percentage = this.menuElem.scrollHeight / this.menuOnCloseScrollHeight;
          this.menuElem.scrollTop = this.menuElem.scrollHeight - this.menuElem.offsetHeight - this.menuOnCloseScrollBottom * percentage;
        }
        this.menuBtn.setAttribute('aria-expanded', true);
        if (this.ambientlight.videoPlayerElem) {
          this.ambientlight.videoPlayerElem.classList.add('ytp-ambientlight-settings-shown');
        }
        on(document.body, 'click', this.onCloseMenu, {
          capture: true
        });
        setTimeout$1(() => {
          this.scrollToWarning();
        }, 100);
      };
      this.onCloseMenu = e => {
        const isOpen = this.menuElem.classList.contains('is-visible') || this.menuElem.classList.contains('fade-out');
        if (!isOpen) return;
        if (this.menuElem === e.target || this.menuElem.contains(e.target)) return;
        e.stopPropagation();
        this.menuOnCloseScrollBottom = !this.menuElem.scrollTop ? -1 : this.menuElem.scrollHeight - this.menuElem.offsetHeight - this.menuElem.scrollTop;
        this.menuOnCloseScrollHeight = this.menuElem.scrollHeight;
        on(this.menuElem, 'animationend', this.onSettingsFadeOutEnd);
        this.onSettingsFadeOutEndTimeout = setTimeout$1(() => {
          if (!this.onSettingsFadeOutEndTimeout) return;
          this.onSettingsFadeOutEndTimeout = undefined;
          this.onSettingsFadeOutEnd();
        }, 500);
        this.menuElem.classList.add('fade-out');
        this.menuBtn.setAttribute('aria-expanded', false);
        if (this.ambientlight.videoPlayerElem) {
          this.ambientlight.videoPlayerElem.classList.remove('ytp-ambientlight-settings-shown');
        }
        off(document.body, 'click', this.onCloseMenu);
        this.hideUpdatesBadge();
      };
      this.onSettingsFadeOutEnd = () => {
        off(this.menuElem, 'animationend', this.onSettingsFadeOutEnd);
        if (this.onSettingsFadeOutEndTimeout) {
          clearTimeout(this.onSettingsFadeOutEndTimeout);
          this.onSettingsFadeOutEndTimeout = undefined;
        }
        this.menuElem.classList.remove('fade-out', 'is-visible');
      };
      this.onLoaded = () => {
        if (!this.menuBtn.classList.contains('is-loading')) return;
        this.menuBtn.classList.remove('is-loading');
        this.settingsMenuBtnTooltipText.textContent = 'Ambient light settings';
        this.showUpdatesMessage();
      };
      this.onError = ex => {
        var _this$menuBtn, _this$menuBtn$classLi, _this$menuBtn$classLi2;
        const message = (ex === null || ex === void 0 ? void 0 : ex.message) ?? typeof ex;
        if ((_this$menuBtn = this.menuBtn) !== null && _this$menuBtn !== void 0 && (_this$menuBtn$classLi = _this$menuBtn.classList) !== null && _this$menuBtn$classLi !== void 0 && (_this$menuBtn$classLi2 = _this$menuBtn$classLi.contains) !== null && _this$menuBtn$classLi2 !== void 0 && _this$menuBtn$classLi2.call(_this$menuBtn$classLi, 'is-loading')) {
          this.menuBtn.classList.add('has-warning');
          this.settingsMenuBtnTooltipText.textContent = `Ambient light failed to load:\n${message}`;
        } else {
          this.setWarning(`An error occured:\n${message}`, true);
        }
      };
      this.controlledSettings = [{
        name: 'horizontalBarsClipPercentage',
        controllers: ['detectHorizontalBarSizeEnabled']
      }, {
        name: 'verticalBarsClipPercentage',
        controllers: ['detectVerticalBarSizeEnabled']
      }, {
        name: 'framerateLimit',
        controllers: ['frameBlending', 'frameFading']
      }, {
        name: 'frameBlending',
        controllers: ['frameFading']
      }, {
        name: 'frameFading',
        controllers: ['frameBlending']
      }];
      this.optionalSettings = [{
        names: ['detectHorizontalBarSizeEnabled', 'detectVerticalBarSizeEnabled'],
        visible: () => this.ambientlight.getImageDataAllowed
      }, {
        names: ['detectColoredHorizontalBarSizeEnabled', 'barSizeDetectionAverageHistorySize', 'detectHorizontalBarSizeOffsetPercentage', 'barSizeDetectionAllowedElementsPercentage', 'barSizeDetectionAllowedUnevenBarsPercentage'],
        visible: () => this.ambientlight.getImageDataAllowed && (this.detectHorizontalBarSizeEnabled || this.detectVerticalBarSizeEnabled)
      }, {
        names: ['frameBlending'],
        visible: () => this.frameSync !== 1
      }, {
        names: ['frameBlendingSmoothness'],
        visible: () => this.frameBlending && this.frameSync !== 1
      }, {
        names: ['chromiumBugVideoJitterWorkaround'],
        visible: () => this.ambientlight.enableChromiumBugVideoJitterWorkaround && this.webGL
      }, {
        names: ['videoOverlaySyncThreshold'],
        visible: () => this.videoOverlayEnabled
      }, {
        names: ['headerShadowOpacity'],
        visible: () => this.headerShadowSize
      }, {
        names: ['surroundingContentShadowOpacity'],
        visible: () => this.surroundingContentShadowSize
      }, {
        names: ['surroundingContentTextAndBtnOnly'],
        visible: () => this.surroundingContentShadowSize && this.surroundingContentShadowOpacity || this.headerShadowSize && this.headerShadowOpacity
      }, {
        names: ['videoShadowOpacity'],
        visible: () => this.videoShadowSize
      }, {
        names: ['resolution', 'vibrance', 'frameFading', 'flickerReduction', 'fixedPosition'],
        visible: () => this.webGL
      }, {
        names: ['chromiumDirectVideoOverlayWorkaround'],
        visible: () => this.ambientlight.enableChromiumBugDirectVideoOverlayWorkaround
      }, {
        names: ['framerateLimit'],
        visible: () => !this.ambientlight.isVrVideo
      }, {
        names: ['showBarDetectionStats'],
        visible: () => this.detectHorizontalBarSizeEnabled || this.detectVerticalBarSizeEnabled
      }, {
        names: [`webGL`],
        visible: () => this.advancedSettings || !this.webGL
      }, {
        names: [`videoScale.${VIEW_SMALL}`],
        visible: () => this.ambientlight.view === VIEW_SMALL
      }, {
        names: [`videoScale.${VIEW_THEATER}`],
        visible: () => this.ambientlight.view === VIEW_THEATER
      }, {
        names: [`videoScale.${VIEW_FULLSCREEN}`],
        visible: () => this.ambientlight.view === VIEW_FULLSCREEN
      }];
      this.pendingStorageEntries = {};
      this.getKeys = () => ({
        enabled: SettingsConfig.find(setting => setting.name === 'enabled').key,
        detectHorizontalBarSizeEnabled: SettingsConfig.find(setting => setting.name === 'detectHorizontalBarSizeEnabled').key,
        detectVerticalBarSizeEnabled: SettingsConfig.find(setting => setting.name === 'detectVerticalBarSizeEnabled').key,
        detectVideoFillScaleEnabled: SettingsConfig.find(setting => setting.name === 'detectVideoFillScaleEnabled').key
      });
      this.onBezelElemAnimationEnd = () => {
        off(this.bezelElem, 'animationend', this.onBezelElemAnimationEnd);
        if (this.onBezelElemAnimationEndTimeout) {
          clearTimeout(this.onBezelElemAnimationEndTimeout);
          this.onBezelElemAnimationEndTimeout = undefined;
        }
        this.bezelElem.classList.add('ytal-bezel--no-animation');
      };
      this.updateAverageVideoFramesDifferenceInfo = () => {
        if (!this.menuElem) return;
        let message = '';
        if (this.energySaver) {
          if (this.ambientlight.averageVideoFramesDifference < 0.002) {
            message = 'Detected a still image as video\nThe framerate has been limited to: 0.2 fps\n\nLimited by the advanced setting:\nQuality > Save energy on static videos';
          } else if (this.ambientlight.averageVideoFramesDifference < 0.0175) {
            message = 'Detected only small movements in the video\nThe framerate has been limited to: 1 fps\n\nLimited by the advanced setting:\nQuality > Save energy on static videos';
          }
        }
        this.infoElem.textContent = message;
        this.infoItemElem.style.display = message ? '' : 'none';
      };
      this.showUpdatesMessage = async () => {
        try {
          if (!version) return;
          let entries;
          try {
            entries = (await storage.get(['shown-version-updates'], true)) || {};
          } catch (ex) {
            console.log(ex);
            return;
          }
          const installedVersion = entries['shown-version-updates'];
          if (installedVersion === version) return;
          if (!this.updateItemElem) return;
          this.updateItemElem.style.display = '';
          this.menuBtn.classList.toggle('has-updates', true);
          this.menuBtn.title = "Ambient light has been updated with new settings\nClick to see what's new";
          this.showingUpdatesMessage = true;
        } catch (ex) {
          SentryReporter.captureException(ex);
        }
      };
      this.hideUpdatesMessage = () => {
        if (this.updateItemElem.style.display === 'none') return;
        this.updateItemElem.style.display = 'none';
        this.showingUpdatesMessage = undefined;
        this.hideUpdatesBadge();
      };
      this.hideUpdatesBadge = () => {
        if (!this.menuBtn.classList.contains('has-updates')) return;
        this.menuBtn.classList.toggle('has-updates', false);
        this.menuBtn.title = '';
        storage.set('shown-version-updates', version);
      };
      this.handleDocumentVisibilityChange = () => {
        const isPageHidden = document.visibilityState === 'hidden';
        if (isPageHidden) return;
        setTimeout$1(() => {
          if (!this.pendingWarning) return;
          this.pendingWarning();
        }, 1);
      };
      this.setWarning = (message, optional = false, icon = true, type = undefined) => {
        if (!this.menuElem || this.ambientlight.isPageHidden) {
          this.pendingWarning = () => this.setWarning(message, optional, icon, type);
          return;
        } else {
          this.pendingWarning = undefined;
        }
        if (optional && this.warningElem.textContent.length) return;
        if (this.warningElem.textContent === message) return;
        if (!message && type && this.warningType !== type) return;
        this.warningItemElem.style.display = message ? '' : 'none';
        this.warningElem.textContent = message;
        this.warningType = type;
        this.menuBtn.classList.toggle('has-warning', icon && !!message);
        this.scrollToWarningQueued = !!message;
        if (!message) return;
        this.scrollToWarning();
      };
      return async function settingsConstructor() {
        this.ambientlight = ambientlight;
        this.menuBtnParent = menuBtnParent;
        this.menuElemParent = menuElemParent;
        await this.getAll();
        this.initMenu();
        if (this.webGLCrashDate) this.updateWebGLCrashDescription();
        if (this.pendingWarning) this.pendingWarning();
        return this;
      }.bind(this)();
    }
    async getAll() {
      let storedSettings = {};
      try {
        storedSettings = await Settings.getStoredSettingsCached();
      } catch {
        this.setWarning('Your previous settings cannot be loaded because the extension could have been updated.\nRefresh the page to retry again.');
      }
      const webGLCrash = storedSettings['setting-webGLCrash'];
      const webGLCrashVersion = storedSettings['setting-webGLCrashVersion'];
      if (webGLCrash && webGLCrashVersion === version) {
        this.webGLCrashDate = new Date(webGLCrash);
        this.webGLCrashVersion = webGLCrashVersion;
      }
      for (const setting of SettingsConfig) {
        const value = storedSettings[`setting-${setting.name}`];
        this[setting.name] = this.processStorageEntry(setting.name, value);
        if (setting.defaultKey !== undefined) {
          let key = storedSettings[`setting-${setting.name}-key`];
          if (key == null) key = setting.defaultKey;
          setting.key = key;
        }
      }
      this.migrate(storedSettings);
      if (this.frameBlending && this.framerateLimit !== 0) {
        this.set('framerateLimit', 0);
      }
      await this.flushPendingStorageEntries();
      if (this.enabled) document.documentElement.toggleAttribute('data-ambientlight-hide-scrollbar', this.hideScrollbar);
    }
    migrate(storedSettings) {
      const surroundingContentImagesTransparency = storedSettings['setting-surroundingContentImagesTransparency'];
      if (typeof surroundingContentImagesTransparency === 'number') {
        const opacity = 100 - surroundingContentImagesTransparency;
        this.set('surroundingContentImagesOpacity', opacity);
        this['surroundingContentImagesOpacity'] = opacity;
        this.saveStorageEntry('surroundingContentImagesTransparency', undefined);
      }
    }
    createMenuElement() {
      const elem = document.createElement('div');
      elem.className = `ytp-popup ytp-settings-menu ytp-rounded-menu ytpa-ambientlight-settings-menu ${this.advancedSettings ? 'ytpa-ambientlight-settings-menu--advanced' : ''}`;
      elem.id = 'ytp-id-190';
      const panel = document.createElement('div');
      panel.className = 'ytp-panel';
      elem.appendChild(panel);
      const menu = document.createElement('div');
      menu.className = 'ytp-panel-menu';
      menu.role = 'menu';
      panel.appendChild(menu);
      const warning = document.createElement('div');
      warning.className = 'ytp-menuitem ytpa-menuitem--warning';
      warning.style.display = 'none';
      menu.appendChild(warning);
      const warningLabel = document.createElement('div');
      warningLabel.className = 'ytp-menuitem-label';
      warningLabel.rowspan = '2';
      warning.appendChild(warningLabel);
      const warningSpan = document.createElement('span');
      warningSpan.className = 'ytpa-warning';
      warningSpan.rowspan = '2';
      warningLabel.appendChild(warningSpan);
      const warningCloseButton = document.createElement('button');
      warningCloseButton.className = 'ytpa-warning-close-btn';
      warningCloseButton.title = 'Close warning';
      warning.appendChild(warningCloseButton);
      const info = document.createElement('div');
      info.className = 'ytp-menuitem ytpa-menuitem--info';
      info.style.display = 'none';
      menu.appendChild(info);
      const infoLabel = document.createElement('div');
      infoLabel.className = 'ytp-menuitem-label';
      infoLabel.rowspan = '2';
      info.appendChild(infoLabel);
      const infoSpan = document.createElement('span');
      infoSpan.className = 'ytpa-info';
      infoSpan.rowspan = '2';
      infoLabel.appendChild(infoSpan);
      const header1 = document.createElement('div');
      header1.className = 'ytp-menuitem ytpa-menuitem--header';
      menu.appendChild(header1);
      const header1Label = document.createElement('div');
      header1Label.className = 'ytp-menuitem-label';
      header1.appendChild(header1Label);
      const header1Content = document.createElement('div');
      header1Content.className = 'ytp-menuitem-content';
      header1.appendChild(header1Content);
      const troubleshootLink = document.createElement('a');
      troubleshootLink.className = 'ytpa-feedback-link';
      troubleshootLink.href = 'https://github.com/WesselKroos/youtube-ambilight/blob/master/TROUBLESHOOT.md';
      troubleshootLink.target = '_blank';
      troubleshootLink.rel = 'noopener';
      header1Label.appendChild(troubleshootLink);
      const troubleshootLinkText = document.createElement('span');
      troubleshootLinkText.className = 'ytpa-feedback-link__text';
      troubleshootLinkText.textContent = 'Troubleshoot performance problems';
      troubleshootLink.appendChild(troubleshootLinkText);
      const toolbar = document.createElement('div');
      toolbar.className = 'ytpa-settings-toolbar';
      header1Content.appendChild(toolbar);
      const importBtn = document.createElement('button');
      importBtn.className = 'ytpa-export-import-settings-btn';
      importBtn.type = 'button';
      toolbar.appendChild(importBtn);
      const importTooltip = document.createElement('span');
      importTooltip.className = 'ytpa-export-import-settings-btn__tooltip';
      importTooltip.textContent = `How to export or import settings: 
1. Click on the extension icon to open the option. 
2. Scroll down to "Import / Export settings"`;
      importBtn.appendChild(importTooltip);
      const resetBtn = document.createElement('button');
      resetBtn.className = 'ytpa-reset-settings-btn';
      resetBtn.type = 'button';
      resetBtn.title = 'Reset all settings';
      toolbar.appendChild(resetBtn);
      const header2 = document.createElement('div');
      header2.className = 'ytp-menuitem ytpa-menuitem--header';
      menu.appendChild(header2);
      const header2Label = document.createElement('div');
      header2Label.className = 'ytp-menuitem-label';
      header2.appendChild(header2Label);
      const header2Content = document.createElement('div');
      header2Content.className = 'ytp-menuitem-content';
      header2.appendChild(header2Content);
      const feedbackLink = document.createElement('a');
      feedbackLink.className = 'ytpa-feedback-link';
      feedbackLink.href = feedbackFormLink;
      feedbackLink.target = '_blank';
      feedbackLink.rel = 'noopener';
      header2Label.appendChild(feedbackLink);
      const feedbackLinkText = document.createElement('span');
      feedbackLinkText.className = 'ytpa-feedback-link__text';
      feedbackLinkText.textContent = 'Give feedback or a rating';
      feedbackLink.appendChild(feedbackLinkText);
      const donateLink = document.createElement('a');
      donateLink.className = 'ytpa-donate-link';
      donateLink.href = 'https://ko-fi.com/G2G59EK8L';
      donateLink.target = '_blank';
      donateLink.rel = 'noopener';
      header2Content.appendChild(donateLink);
      const donateLinkImage = document.createElement('img');
      donateLinkImage.className = 'ytpa-donate-link__image';
      donateLinkImage.alt = 'Support me via a donation';
      donateLinkImage.title = 'Support me via a donation';
      donateLinkImage.src = `${baseUrl$1}images/donate.svg`;
      donateLinkImage.height = '23';
      donateLink.appendChild(donateLinkImage);
      let sectionContent;
      for (const i in SettingsConfig) {
        const setting = SettingsConfig[i];
        const value = this[setting.name];
        let classes = 'ytp-menuitem';
        if (setting.advanced) classes += ' ytpa-menuitem--advanced';
        if (setting.hdr) classes += ' ytpa-menuitem--hdr';
        if (setting.new) classes += ' ytpa-menuitem--new';
        if (setting.experimental) classes += ' ytpa-menuitem--experimental';
        const labelElems = [];
        labelElems.push(document.createTextNode(setting.label));
        if (setting.key) {
          labelElems.push(document.createTextNode('['));
          const labelKey = document.createElement('span');
          labelKey.contentEditable = true;
          labelKey.className = 'ytpa-menuitem-key';
          labelKey.title = 'Click here and press a key to change the hotkey\n(Or press the escape key to disable this hotkey)';
          labelKey.textContent = setting.key;
          labelElems.push(labelKey);
          labelElems.push(document.createTextNode(']'));
        }
        if (setting.questionMark) {
          const questionMark = document.createElement('a');
          questionMark.title = setting.questionMark.title;
          questionMark.style.padding = '0 5px';
          questionMark.textContent = '?';
          if (setting.questionMark.href) {
            questionMark.href = setting.questionMark.href;
            questionMark.target = '_blank';
            questionMark.rel = 'noopener';
          } else {
            questionMark.href = '#';
            questionMark.addEventListener('click', () => false);
          }
          labelElems.push(questionMark);
        }
        if (setting.description) {
          labelElems.push(document.createElement('br'));
          const labelDescription = document.createElement('span');
          labelDescription.className = 'ytpa-menuitem-description';
          labelDescription.textContent = setting.description;
          labelElems.push(labelDescription);
        }
        if (setting.type === 'section') {
          const section = document.createElement('div');
          section.className = `ytpa-section ${value ? 'is-collapsed' : ''} ${setting.advanced ? 'ytpa-section--advanced' : ''} ${setting.hdr ? 'ytpa-section--hdr' : ''}`;
          section.dataset.name = setting.name;
          menu.appendChild(section);
          const cell1 = document.createElement('div');
          cell1.className = 'ytpa-section__cell';
          section.appendChild(cell1);
          const label = document.createElement('div');
          label.className = 'ytpa-section__label';
          label.replaceChildren(...labelElems);
          cell1.appendChild(label);
          const cell2 = document.createElement('div');
          cell2.className = 'ytpa-section__cell';
          section.appendChild(cell2);
          const fill = document.createElement('div');
          fill.className = 'ytpa-section__fill';
          fill.textContent = '-';
          cell2.appendChild(fill);
          sectionContent = document.createElement('div');
          sectionContent.className = 'ytpa-section-content';
          menu.appendChild(sectionContent);
        }
        if (setting.type === 'checkbox') {
          const checkbox = document.createElement('div');
          checkbox.id = `setting-${setting.name}`;
          checkbox.className = classes;
          checkbox.role = 'menuitemcheckbox';
          checkbox.ariaChecked = value ? 'true' : 'false';
          if (setting.disabled) {
            checkbox.ariaDisabled = 'true';
            checkbox.title = 'This setting is unavailable';
          } else {
            checkbox.title = 'Right click to reset';
            checkbox.tabindex = '0';
          }
          sectionContent.appendChild(checkbox);
          const label = document.createElement('div');
          label.className = 'ytp-menuitem-label';
          checkbox.appendChild(label);
          label.replaceChildren(...labelElems);
          if (setting.disabled) {
            const description = document.createElement('span');
            description.className = 'ytpa-menuitem-description';
            description.style.color = '#fa0';
            description.textContent = setting.disabled;
            label.appendChild(description);
          }
          const content = document.createElement('div');
          content.className = 'ytp-menuitem-content';
          checkbox.appendChild(content);
          const toggle = document.createElement('div');
          toggle.className = 'ytp-menuitem-toggle-checkbox';
          content.appendChild(toggle);
        }
        if (setting.type === 'list') {
          const wrapper = document.createElement('div');
          wrapper.id = `setting-${setting.name}`;
          wrapper.className = 'ytp-menuitem-range-wrapper';
          sectionContent.appendChild(wrapper);
          const list = document.createElement('div');
          list.className = classes;
          list.ariaHasPopup = 'false';
          list.role = 'menuitemrange';
          list.tabIndex = 0;
          wrapper.appendChild(list);
          const label = document.createElement('div');
          label.className = 'ytp-menuitem-label';
          label.replaceChildren(...labelElems);
          list.appendChild(label);
          const content = document.createElement('div');
          content.className = 'ytp-menuitem-content';
          list.appendChild(content);
          if (setting.manualinput !== false) {
            const manualInput = document.createElement('input');
            manualInput.id = `setting-${setting.name}-manualinput`;
            manualInput.className = 'ytpa-menuitem-input';
            manualInput.type = 'text';
            manualInput.value = value;
            content.appendChild(manualInput);
          }
          const valueElem = document.createElement('div');
          valueElem.id = `setting-${setting.name}-value`;
          valueElem.className = 'ytp-menuitem-value';
          valueElem.textContent = this.getSettingListDisplayText(setting);
          content.appendChild(valueElem);
          const range = document.createElement('div');
          range.className = `ytp-menuitem-range ${setting.snapPoints ? 'ytp-menuitem-range--has-snap-points' : ''}`;
          range.setAttribute('rowspan', '2');
          range.title = 'Right click to reset';
          wrapper.appendChild(range);
          const input = document.createElement('input');
          input.id = `setting-${setting.name}-range`;
          input.type = 'range';
          input.setAttribute('colspan', '2');
          if (setting.min !== undefined) input.min = setting.min.toString();
          if (setting.max !== undefined) input.max = setting.max.toString();
          if (setting.valuePoints) {
            input.min = '0';
            input.max = (setting.valuePoints.length - 1).toString();
          }
          if (setting.step || setting.valuePoints) input.step = setting.step || 1;
          input.value = this.getInputRangeValue(setting.name);
          range.appendChild(input);
          if (setting.snapPoints) {
            const datalist = document.createElement('datalist');
            datalist.className = 'setting-range-datalist';
            datalist.id = `snap-points-${setting.name}`;
            wrapper.appendChild(datalist);
            for (const {
              label,
              hiddenLabel,
              value,
              flip
            } of setting.snapPoints) {
              const option = document.createElement('option');
              option.className = `setting-range-datalist__label ${flip ? 'setting-range-datalist__label--flip' : ''}`;
              option.title = `Set to ${hiddenLabel || label}`;
              option.style.marginLeft = `${(value + -setting.min) * (100 / (setting.max - setting.min))}%`;
              option.value = value.toString();
              option.label = label || '';
              option.textContent = option.label;
              datalist.appendChild(option);
            }
          }
        }
      }
      return elem;
    }
    initMenu() {
      this.menuBtn = this.createMenuButton();
      on(this.menuBtn, 'click', this.onSettingsBtnClicked);
      const settingsMenuBtnTooltip = document.createElement('div');
      settingsMenuBtnTooltip.className = 'ytp-tooltip ytp-bottom ytp-ambientlight-settings-button-tooltip';
      settingsMenuBtnTooltip.setAttribute('aria-live', 'polite');
      settingsMenuBtnTooltip.style.opacity = 0;
      const settingsMenuBtnTooltipTextWrapper = document.createElement('div');
      settingsMenuBtnTooltipTextWrapper.className = 'ytp-tooltip-text-wrapper';
      settingsMenuBtnTooltip.prepend(settingsMenuBtnTooltipTextWrapper);
      this.settingsMenuBtnTooltipText = document.createElement('span');
      this.settingsMenuBtnTooltipText.className = 'ytp-tooltip-bottom-text';
      this.settingsMenuBtnTooltipText.appendChild(document.createTextNode('Ambient light loading is paused.'));
      this.settingsMenuBtnTooltipText.appendChild(document.createElement('br'));
      this.settingsMenuBtnTooltipText.appendChild(document.createTextNode('Waiting for the video and page to be loaded first...'));
      settingsMenuBtnTooltipTextWrapper.prepend(this.settingsMenuBtnTooltipText);
      this.menuBtn.prepend(settingsMenuBtnTooltip);
      const ytSettingsBtn = document.querySelector('ytd-player [data-tooltip-target-id="ytp-autonav-toggle-button"]');
      if (ytSettingsBtn) {
        ytSettingsBtn.parentNode.insertBefore(this.menuBtn, ytSettingsBtn);
      } else {
        this.menuBtnParent.prepend(this.menuBtn);
      }
      setDisplayErrorHandler(this.onError);
      this.menuElem = this.createMenuElement();
      this.updateItemElem = this.menuElem.querySelector('.ytpa-menuitem--updates');
      if (this.updateItemElem) {
        on(this.updateItemElem, 'click', this.hideUpdatesMessage);
      }
      this.warningItemElem = this.menuElem.querySelector('.ytpa-menuitem--warning');
      this.warningElem = this.warningItemElem.querySelector('.ytpa-warning');
      this.warningCloseBtn = this.warningItemElem.querySelector('.ytpa-warning-close-btn');
      if (this.warningCloseBtn) {
        on(this.warningCloseBtn, 'click', () => this.setWarning());
      }
      this.infoItemElem = this.menuElem.querySelector('.ytpa-menuitem--info');
      this.infoElem = this.infoItemElem.querySelector('.ytpa-info');
      const resetSettingsBtnElem = this.menuElem.querySelector('.ytpa-reset-settings-btn');
      on(resetSettingsBtnElem, 'click', async () => {
        if (!confirm('Are you sure you want to reset ALL the settings and reload the watch page?')) return;
        for (const setting of SettingsConfig) {
          this.saveStorageEntry(setting.name, undefined);
          if (setting.defaultKey) {
            this.saveStorageEntry(`${setting.name}-key`, undefined);
          }
        }
        await this.flushPendingStorageEntries();
        await new Promise(resolve => setTimeout$1(resolve, 1000));
        this.reloadPage();
      });
      for (const label of this.menuElem.querySelectorAll('.setting-range-datalist__label')) {
        on(label, 'click', e => {
          const value = e.target.value;
          const name = e.target.parentNode.id.replace('snap-points-', '');
          const inputElem = this.menuElem.querySelector(`${getSettingQuerySelector(name)}-range`);
          inputElem.value = value;
          inputElem.dispatchEvent(new Event('change', {
            bubbles: true
          }));
        });
      }
      for (const section of this.menuElem.querySelectorAll('.ytpa-section')) {
        on(section, 'click', async () => {
          const name = section.getAttribute('data-name');
          const value = !this[name];
          this.set(name, value);
          if (!value) {
            section.classList.remove('is-collapsed');
          }
          const sectionContent = section.nextElementSibling;
          sectionContent.style.opacity = '';
          let startHeight = value ? sectionContent.clientHeight ?? 0 : 0;
          let endHeight = value ? 0 : sectionContent.clientHeight ?? 0;
          sectionContent.style.opacity = '';
          sectionContent.style.height = `${startHeight}px`;
          sectionContent.style.marginBottom = value ? '0' : '-5px';
          sectionContent.style.paddingBottom = value ? '5px' : '0';
          sectionContent.style.overflow = 'hidden';
          sectionContent.style.position = 'relative';
          await new Promise(resolve => setTimeout$1(resolve, 1));
          section.classList.add('is-collapsed-transition');
          sectionContent.style.transition = 'height .4s ease-in-out, margin-bottom .4s ease-in-out, padding-bottom .4s ease-in-out';
          sectionContent.style.height = `${endHeight}px`;
          sectionContent.style.marginBottom = value ? '-5px' : '0';
          sectionContent.style.paddingBottom = value ? '0' : '5px';
          await new Promise(resolve => setTimeout$1(resolve, 400));
          section.classList.remove('is-collapsed-transition');
          sectionContent.style.transition = '';
          sectionContent.style.height = '';
          sectionContent.style.marginBottom = '';
          sectionContent.style.paddingBottom = '';
          sectionContent.style.overflow = '';
          sectionContent.style.position = '';
          if (value) {
            section.classList.add('is-collapsed');
          }
        });
      }
      on(this.menuElem, 'mousemove click dblclick contextmenu touchstart touchmove touchend', e => {
        e.stopPropagation();
      });
      on(this.menuElem, 'contextmenu', e => {
        e.preventDefault();
      });
      this.menuElemParent.prepend(this.menuElem);
      this.bezelElem = this.createBezelElem();
      this.bezelTextElem = this.bezelElem.querySelector('text');
      this.menuElemParent.prepend(this.bezelElem);
      for (const setting of SettingsConfig) {
        const settingElem = this.menuElem.querySelector(getSettingQuerySelector(setting.name));
        if (!settingElem) continue;
        const keyElem = settingElem.querySelector('.ytpa-menuitem-key');
        if (keyElem) {
          on(keyElem, 'click', e => {
            e.stopPropagation();
            e.preventDefault();
          });
          on(keyElem, 'focus', () => {
            const range = document.createRange();
            range.selectNodeContents(keyElem);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          });
          on(keyElem, 'keydown keyup keypress', e => {
            var _e$key;
            e.stopPropagation();
            e.preventDefault();
            keyElem.blur();
            const key = e.key.length === 1 ? (_e$key = e.key) === null || _e$key === void 0 ? void 0 : _e$key.toUpperCase() : ' ';
            if (keyElem.textContent === key) return;
            keyElem.textContent = key;
            this.setKey(setting.name, key);
          });
          on(keyElem, 'blur', () => {
            const sel = window.getSelection();
            sel.removeAllRanges();
          });
        }
        if (setting.type === 'list') {
          const inputElem = this.menuElem.querySelector(`${getSettingQuerySelector(setting.name)}-range`);
          const valueElem = this.menuElem.querySelector(`${getSettingQuerySelector(setting.name)}-value`);
          const manualInputElem = this.menuElem.querySelector(`${getSettingQuerySelector(setting.name)}-manualinput`);
          if (manualInputElem) {
            on(manualInputElem, 'keydown keyup keypress', e => {
              e.stopPropagation();
            });
            const onChange = () => {
              if (inputElem.value === manualInputElem.value) return;
              inputElem.value = manualInputElem.value;
              inputElem.dispatchEvent(new Event('change'));
            };
            on(manualInputElem, 'change', onChange);
            on(manualInputElem, 'blur', onChange);
            on(manualInputElem, 'keypress', e => {
              if (e.key !== 'Enter') return;
              manualInputElem.blur();
            });
          }
          on(inputElem, 'change mousemove dblclick contextmenu touchmove', async e => {
            if (e.type === 'mousemove' && e.buttons === 0) return;
            let value = parseFloat(inputElem.value);
            if (e.type === 'dblclick' || e.type === 'contextmenu') {
              value = SettingsConfig.find(s => s.name === setting.name).default;
              if (setting.valuePoints) {
                value = setting.valuePoints.indexOf(value);
              }
            } else if (inputElem.value === inputElem.getAttribute('data-previous-value')) {
              return;
            }
            inputElem.value = value;
            inputElem.setAttribute('data-previous-value', value);
            if (manualInputElem) {
              manualInputElem.value = inputElem.value;
            }
            if (setting.valuePoints) {
              value = setting.valuePoints[value];
            }
            if (this[setting.name] === value) return;
            this.set(setting.name, value);
            valueElem.textContent = this.getSettingListDisplayText(setting);
            if (setting.name === 'theme') {
              this.ambientlight.theming.updateTheme(true);
              return;
            }
            if (!this.advancedSettings) {
              if (setting.name === 'blur2') {
                const edgeValue = value <= 5 ? 2 : value >= 42.5 ? 17 : value / 2.5;
                const edgeSetting = SettingsConfig.find(setting => setting.name === 'edge');
                const edgeInputElem = this.menuElem.querySelector(`#setting-${edgeSetting.name}-range`);
                edgeInputElem.value = edgeValue;
                edgeInputElem.dispatchEvent(new Event('change', {
                  bubbles: true
                }));
              }
            }
            if (['horizontalBarsClipPercentage', 'verticalBarsClipPercentage'].some(name => name === setting.name)) {
              if (!inputElem.dontResetControllerSetting) {
                const controllerSetting = {
                  horizontalBarsClipPercentage: 'detectHorizontalBarSizeEnabled',
                  verticalBarsClipPercentage: 'detectVerticalBarSizeEnabled'
                }[setting.name];
                if (this[controllerSetting]) {
                  const controllerInput = this.menuElem.querySelector(`#setting-${controllerSetting}`);
                  controllerInput.dontResetControlledSetting = true;
                  controllerInput.click();
                  return;
                }
              } else {
                inputElem.dontResetControllerSetting = false;
              }
              this.updateVisibility();
              this.ambientlight.barDetection.reset();
              if (this.enabled && this.webGL) {
                this.ambientlight.buffersCleared = true;
              }
            }
            if ((this.detectHorizontalBarSizeEnabled || this.detectVerticalBarSizeEnabled) && ['detectColoredHorizontalBarSizeEnabled', 'barSizeDetectionAverageHistorySize', 'detectHorizontalBarSizeOffsetPercentage', 'barSizeDetectionAllowedElementsPercentage', 'barSizeDetectionAllowedUnevenBarsPercentage'].includes(setting.name)) {
              this.ambientlight.barDetection.reset();
              if (this.enabled && this.webGL) {
                this.ambientlight.buffersCleared = true;
              }
            }
            if (['headerShadowSize', 'headerShadowOpacity', 'headerFillOpacity', 'headerImagesOpacity', 'surroundingContentShadowSize', 'surroundingContentShadowOpacity', 'surroundingContentFillOpacity', 'surroundingContentImagesOpacity', 'pageBackgroundGreyness', 'videoDebandingStrength', 'debandingStrength', 'debandingBlendMode', 'videoShadowSize', 'videoShadowOpacity'].some(name => name === setting.name) || setting.name.startsWith('videoScale.')) {
              this.ambientlight.updateStyles();
            }
            if (['frameFading'].some(name => name === setting.name)) {
              if (value > 0) {
                if (this['framerateLimit'] !== 30) {
                  this.set('framerateLimit', 30, true);
                }
                if (this['frameBlending']) {
                  this.set('frameBlending', false, true);
                }
              } else {
                const defaultValue = SettingsConfig.find(s => s.name === 'framerateLimit').default;
                if (this['framerateLimit'] !== defaultValue) {
                  this.set('framerateLimit', defaultValue, true);
                }
              }
              await this.updateProjectorWebGLCtx();
              this.updateVisibility();
            }
            if (['flickerReduction'].some(name => name === setting.name)) {
              await this.updateBufferProjectorWebGLCtx();
              this.ambientlight.buffersCleared = true;
            }
            if (['framerateLimit'].some(name => name === setting.name)) {
              if (this['frameBlending']) {
                this.set('frameBlending', false, true);
              }
              this.resetFrameFading();
              this.updateVisibility();
            }
            if (setting.name === 'vibrance' || setting.name === 'spread' || setting.name === 'edge') {
              this.ambientlight.canvassesInvalidated = true;
            }
            if (setting.name === 'spread' || setting.name === 'blur2') {
              var _this$ambientlight$ch;
              if ((_this$ambientlight$ch = this.ambientlight.chromiumBugVideoJitterWorkaround) !== null && _this$ambientlight$ch !== void 0 && _this$ambientlight$ch.update) this.ambientlight.chromiumBugVideoJitterWorkaround.update();
            }
            if (setting.name === 'vibrance') {
              try {
                if (!(await this.ambientlight.projector.updateVibrance())) return;
                this.setWarning('');
              } catch (ex) {
                this.ambientlight.projector.setWebGLWarning('change');
                throw ex;
              }
            }
            if (['frameSync', 'headerShadowSize', 'headerShadowOpacity', 'surroundingContentShadowSize', 'surroundingContentShadowOpacity', 'videoShadowSize'].some(name => name === setting.name)) {
              this.updateVisibility();
            }
            this.ambientlight.sizesChanged = true;
            await this.ambientlight.optionalFrame(true);
          });
        } else if (setting.type === 'checkbox') {
          on(settingElem, 'dblclick contextmenu click', async e => {
            if (setting.disabled) {
              e.stopPropagation();
              e.preventDefault();
              return;
            }
            let value = !this[setting.name];
            if (e.type === 'dblclick' || e.type === 'contextmenu') {
              value = SettingsConfig.find(s => s.name === setting.name).default;
              if (value === this[setting.name]) return;
            }
            if (['energySaver', 'videoOverlayEnabled', 'frameBlending', 'fixedPosition', 'showFPS', 'showFrametimes', 'showResolutions', 'showBarDetectionStats', 'chromiumDirectVideoOverlayWorkaround', 'chromiumBugVideoJitterWorkaround', 'surroundingContentTextAndBtnOnly', 'headerTransparentEnabled', 'horizontalBarsClipPercentageReset', 'detectHorizontalBarSizeEnabled', 'detectColoredHorizontalBarSizeEnabled', 'detectVerticalBarSizeEnabled', 'detectVideoFillScaleEnabled', 'directionTopEnabled', 'directionRightEnabled', 'directionBottomEnabled', 'directionLeftEnabled', 'advancedSettings', 'relatedScrollbar', 'hideScrollbar', 'immersiveTheaterView', 'webGL', 'layoutPerformanceImprovements', 'prioritizePageLoadSpeed', 'enableInPictureInPicture', 'enableInEmbed', 'enableInVRVideos'].some(name => name === setting.name)) {
              if (setting.name !== 'webGL') this.set(setting.name, value);
              this.menuElem.querySelector(getSettingQuerySelector(setting.name)).setAttribute('aria-checked', value);
            }
            if (['chromiumBugVideoJitterWorkaround'].some(name => name === setting.name)) {
              this.ambientlight.applyChromiumBugVideoJitterWorkaround();
            }
            if (['chromiumDirectVideoOverlayWorkaround'].some(name => name === setting.name)) {
              this.ambientlight.applyChromiumBugDirectVideoOverlayWorkaround();
            }
            if (['detectVideoFillScaleEnabled'].some(name => name === setting.name)) {
              this.displayBezel(setting.key, !value);
            }
            if (['detectHorizontalBarSizeEnabled', 'detectVerticalBarSizeEnabled'].some(name => name === setting.name)) {
              this.displayBezel(setting.key, !value);
              if (!settingElem.dontResetControlledSetting) {
                const controlledSettingName = {
                  detectHorizontalBarSizeEnabled: 'horizontalBarsClipPercentage',
                  detectVerticalBarSizeEnabled: 'verticalBarsClipPercentage'
                }[setting.name];
                const percentageSetting = SettingsConfig.find(setting => setting.name === controlledSettingName);
                const percentageInputElem = this.menuElem.querySelector(`#setting-${percentageSetting.name}-range`);
                if (percentageInputElem.value != percentageSetting.default) {
                  percentageInputElem.dontResetControllerSetting = true;
                  percentageInputElem.value = percentageSetting.default;
                  percentageInputElem.dispatchEvent(new Event('change', {
                    bubbles: true
                  }));
                  return;
                }
              } else {
                settingElem.dontResetControlledSetting = false;
              }
            }
            if (setting.name === 'enabled') {
              this.ambientlight.toggleEnabled(value);
            }
            if (setting.name === 'layoutPerformanceImprovements' && this.enabled) {
              this.ambientlight.updateLayoutPerformanceImprovements();
            }
            const html = document.documentElement;
            if (setting.name === 'relatedScrollbar' && this.enabled) {
              if (value) html.setAttribute('data-ambientlight-related-scrollbar', true);else html.removeAttribute('data-ambientlight-related-scrollbar');
            }
            if (setting.name === 'hideScrollbar' && this.enabled) {
              if (value) html.setAttribute('data-ambientlight-hide-scrollbar', true);else html.removeAttribute('data-ambientlight-hide-scrollbar');
              this.ambientlight.updateVideoPlayerSize();
            }
            if (setting.name === 'immersiveTheaterView' && this.enabled) {
              await this.ambientlight.updateImmersiveMode();
            }
            if (setting.name === 'frameBlending') {
              if (value) {
                if (this['framerateLimit'] !== 0) {
                  this.set('framerateLimit', 0, true);
                }
                this.resetFrameFading();
              } else {
                const defaultValue = SettingsConfig.find(s => s.name === 'framerateLimit').default;
                if (this['framerateLimit'] !== defaultValue) {
                  this.set('framerateLimit', defaultValue, true);
                }
              }
              this.ambientlight.sizesChanged = true;
              this.updateVisibility();
            }
            if (['energySaver'].includes(setting.name)) {
              if (value) {
                this.ambientlight.calculateAverageVideoFramesDifference();
              } else {
                this.ambientlight.resetAverageVideoFramesDifference();
              }
            }
            if (['videoOverlayEnabled', 'detectVideoFillScaleEnabled', 'directionTopEnabled', 'directionRightEnabled', 'directionBottomEnabled', 'directionLeftEnabled'].includes(setting.name)) {
              this.updateVisibility();
              this.ambientlight.sizesChanged = true;
            }
            if (['detectHorizontalBarSizeEnabled', 'detectVerticalBarSizeEnabled', 'detectColoredHorizontalBarSizeEnabled'].some(name => name === setting.name)) {
              this.ambientlight.barDetection.reset();
              if (this.enabled && this.webGL) {
                this.ambientlight.buffersCleared = true;
              }
              this.ambientlight.sizesChanged = true;
              this.updateVisibility();
            }
            if (setting.name === 'advancedSettings') {
              if (value) {
                this.menuElem.classList.add('ytpa-ambientlight-settings-menu--advanced');
              } else {
                this.menuElem.classList.remove('ytpa-ambientlight-settings-menu--advanced');
              }
              this.updateVisibility();
            }
            if (['showFPS', 'showFrametimes', 'showResolutions', 'showBarDetectionStats', 'detectHorizontalBarSizeEnabled', 'detectVerticalBarSizeEnabled'].some(name => name === setting.name)) {
              if (value) {
                this.ambientlight.stats.update();
              } else {
                this.ambientlight.stats.hide(true);
              }
            }
            if (['surroundingContentTextAndBtnOnly', 'fixedPosition'].some(name => name === setting.name)) {
              this.ambientlight.updateStyles();
              await this.ambientlight.optionalFrame(true);
              return;
            }
            if (setting.name === 'webGL') {
              this.saveStorageEntry('webGL', value);
              await this.flushPendingStorageEntries();
              await new Promise(resolve => setTimeout$1(resolve, 1000));
              this.reloadPage();
              return;
            }
            this.ambientlight.sizesInvalidated = true;
            await this.ambientlight.optionalFrame(true);
          });
        }
      }
      this.updateVisibility();
      on(document, 'visibilitychange', this.handleDocumentVisibilityChange, false);
    }
    createBezelElem() {
      const elem = document.createElement('div');
      elem.className = 'ytal-bezel ytp-bezel ytal-bezel--no-animation';
      elem.setAttribute('role', 'status');
      const iconElem = document.createElement('div');
      iconElem.className = 'ytp-bezel-icon';
      const xmlns = 'http://www.w3.org/2000/svg';
      const svgElem = document.createElementNS(xmlns, 'svg');
      svgElem.setAttributeNS(null, 'height', '100%');
      svgElem.setAttributeNS(null, 'width', '100%');
      svgElem.setAttributeNS(null, 'version', '1.1');
      svgElem.setAttributeNS(null, 'viewBox', '0 0 36 36');
      const textElem = document.createElementNS(xmlns, 'text');
      textElem.setAttributeNS(null, 'class', 'ytp-svg-fill');
      textElem.setAttributeNS(null, 'x', '50%');
      textElem.setAttributeNS(null, 'y', '59%');
      textElem.setAttributeNS(null, 'dominant-baseline', 'middle');
      textElem.setAttributeNS(null, 'text-anchor', 'middle');
      svgElem.appendChild(textElem);
      iconElem.appendChild(svgElem);
      elem.appendChild(iconElem);
      return elem;
    }
    createMenuButton() {
      const elem = document.createElement('button');
      elem.className = 'ytp-button ytp-ambientlight-settings-button is-loading';
      elem.setAttribute('aria-owns', 'ytp-id-190');
      const xmlns = 'http://www.w3.org/2000/svg';
      const is2020PlayerUI = !!document.querySelector('.ytp-settings-button svg[viewBox="0 0 36 36"]');
      const is2025PlayerUI = !!document.querySelector('.ytp-settings-button svg[viewBox="0 0 24 24"]');
      if (!is2020PlayerUI && !is2025PlayerUI) {
        var _document$querySelect;
        const error = new AmbientlightError('Updated player (controls) UI');
        const settingsMenuBtnParentSelector = ['.html5-video-player .ytp-right-controls', '.html5-video-player .ytp-chrome-controls > *:last-child'].join(', ');
        error.details = {
          controlsHTML: (_document$querySelect = document.querySelector(settingsMenuBtnParentSelector)) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.outerHTML
        };
        SentryReporter.captureException(error);
      }
      const svgElem = document.createElementNS(xmlns, 'svg');
      svgElem.setAttributeNS(null, 'viewBox', is2025PlayerUI ? '0 0 24 24' : '0 0 36 36');
      svgElem.setAttributeNS(null, 'height', is2025PlayerUI ? '24' : '100%');
      svgElem.setAttributeNS(null, 'width', is2025PlayerUI ? '24' : '100%');
      if (is2025PlayerUI) {
        svgElem.setAttributeNS(null, 'version', '1.1');
      } else {
        svgElem.setAttributeNS(null, 'fill', 'none');
      }
      if (!is2025PlayerUI) {
        const useElem = document.createElementNS(xmlns, 'use');
        useElem.setAttributeNS(null, 'class', 'ytp-svg-shadow');
        useElem.setAttributeNS(null, 'href', '#ytp-ambientlight-btn-icon');
        svgElem.appendChild(useElem);
      }
      const pathElem = document.createElementNS(xmlns, 'path');
      pathElem.setAttributeNS(null, 'id', 'ytp-ambientlight-btn-icon');
      pathElem.setAttributeNS(null, 'fill', '#fff');
      pathElem.setAttributeNS(null, 'd', is2025PlayerUI ? 'M12.84 1H11.15C10.72 .99 10.30 1.14 9.95 1.40C9.60 1.66 9.35 2.02 9.23 2.44L9.19 2.61C9.11 3.00 8.96 3.38 8.73 3.71C8.51 4.04 8.22 4.33 7.89 4.55L7.75 4.64C7.37 4.85 6.96 4.98 6.53 5.02C6.11 5.06 5.68 5.01 5.27 4.87C4.86 4.73 4.42 4.73 4.00 4.86C3.59 5.00 3.23 5.26 2.99 5.62L2.89 5.77L2.05 7.23C1.82 7.63 1.73 8.10 1.81 8.55C1.88 9.01 2.12 9.43 2.47 9.73L2.58 9.84C3.15 10.39 3.50 11.15 3.50 12L3.49 12.16C3.47 12.56 3.37 12.95 3.19 13.31C3.01 13.67 2.77 13.99 2.47 14.26C2.12 14.56 1.88 14.98 1.81 15.43C1.73 15.89 1.82 16.36 2.05 16.76L2.89 18.22L2.99 18.37C3.24 18.73 3.59 18.99 4.01 19.13C4.42 19.26 4.86 19.26 5.27 19.12L5.42 19.07C5.81 18.96 6.21 18.93 6.61 18.98C7.01 19.03 7.40 19.15 7.75 19.36L7.89 19.44C8.22 19.66 8.51 19.95 8.73 20.28C8.96 20.61 9.11 20.99 9.19 21.38C9.28 21.84 9.52 22.24 9.88 22.54C10.24 22.83 10.69 23.00 11.15 23H12.84C13.30 23.00 13.75 22.83 14.11 22.54C14.47 22.24 14.71 21.84 14.80 21.38C14.89 20.96 15.06 20.56 15.31 20.21C15.55 19.86 15.88 19.57 16.25 19.36L16.39 19.28C16.75 19.10 17.14 18.99 17.54 18.96C17.94 18.94 18.34 18.99 18.72 19.12L18.89 19.17C19.31 19.27 19.75 19.24 20.15 19.07C20.55 18.90 20.88 18.60 21.10 18.23L21.95 16.76C22.18 16.36 22.26 15.89 22.19 15.43C22.11 14.98 21.88 14.56 21.53 14.26C21.23 13.99 20.98 13.67 20.80 13.31C20.63 12.95 20.52 12.56 20.50 12.16L20.50 12C20.50 11.57 20.59 11.14 20.77 10.75C20.94 10.36 21.20 10.01 21.53 9.73C21.88 9.43 22.11 9.01 22.19 8.55C22.26 8.10 22.18 7.63 21.95 7.23L21.10 5.76C20.88 5.39 20.55 5.09 20.15 4.92C19.76 4.75 19.31 4.72 18.89 4.82L18.72 4.87C18.34 5.00 17.94 5.05 17.54 5.03C17.14 5.00 16.75 4.89 16.4 4.71L16.25 4.63C15.88 4.42 15.56 4.13 15.31 3.78C15.06 3.43 14.89 3.03 14.80 2.61C14.71 2.15 14.47 1.74 14.11 1.45C13.75 1.16 13.30 .99 12.84 1ZM11.15 3H12.84C12.98 3.70 13.26 4.36 13.68 4.94C14.09 5.52 14.63 6.01 15.25 6.37C15.87 6.72 16.55 6.94 17.26 7.01C17.97 7.08 18.69 6.99 19.37 6.76L20.21 8.23C19.67 8.69 19.24 9.27 18.94 9.92C18.65 10.57 18.50 11.28 18.5 12C18.50 12.71 18.65 13.42 18.95 14.07C19.24 14.72 19.67 15.29 20.21 15.76L19.37 17.23C18.69 16.99 17.97 16.91 17.26 16.98C16.55 17.05 15.86 17.27 15.25 17.63C14.63 17.98 14.09 18.47 13.68 19.05C13.26 19.63 12.98 20.29 12.84 21H11.15C11.01 20.29 10.73 19.63 10.31 19.05C9.90 18.47 9.36 17.98 8.75 17.62C8.13 17.27 7.44 17.05 6.73 16.98C6.02 16.91 5.30 16.99 4.62 17.23L3.78 15.76C4.32 15.29 4.75 14.71 5.05 14.06C5.34 13.41 5.49 12.71 5.5 12C5.50 11.28 5.34 10.57 5.05 9.92C4.75 9.27 4.32 8.69 3.78 8.23L4.62 6.76C5.30 7.00 6.02 7.08 6.73 7.01C7.44 6.94 8.13 6.72 8.75 6.37C9.36 6.01 9.90 5.52 10.31 4.94C10.73 4.36 11.01 3.70 11.15 3ZM12.00 8C10.94 8 9.92 8.42 9.17 9.17C8.42 9.92 8.00 10.93 8.00 12C8.00 13.06 8.42 14.07 9.17 14.82C9.92 15.57 10.94 16 12.00 16C13.06 16 14.08 15.57 14.83 14.82C15.58 14.07 16.00 13.06 16.00 12C16.00 10.93 15.58 9.92 14.83 9.17C14.08 8.42 13.06 8 12.00 8ZM12.00 10H12L12.20 10.01C12.69 10.06 13.15 10.29 13.48 10.65C13.81 11.02 14.00 11.50 14 12L13.99 12.20C13.95 12.58 13.80 12.95 13.55 13.25C13.31 13.55 12.98 13.78 12.62 13.90C12.25 14.02 11.85 14.03 11.48 13.93C11.11 13.83 10.77 13.62 10.51 13.34C10.25 13.05 10.08 12.69 10.02 12.31C9.96 11.93 10.01 11.54 10.17 11.18C10.32 10.83 10.58 10.53 10.91 10.32C11.23 10.11 11.61 10.00 12 10' : 'm 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z');
      svgElem.appendChild(pathElem);
      elem.appendChild(svgElem);
      return elem;
    }
    async updateBufferProjectorWebGLCtx() {
      var _this$ambientlight$pr, _this$ambientlight$pr2;
      if (!((_this$ambientlight$pr = this.ambientlight.projectorBuffer) !== null && _this$ambientlight$pr !== void 0 && (_this$ambientlight$pr2 = _this$ambientlight$pr.ctx) !== null && _this$ambientlight$pr2 !== void 0 && _this$ambientlight$pr2.initCtx)) return;
      try {
        var _this$ambientlight$pr3, _this$ambientlight$pr4;
        await new Promise(resolve => setTimeout$1(resolve, 0));
        if (!((_this$ambientlight$pr3 = this.ambientlight.projectorBuffer) !== null && _this$ambientlight$pr3 !== void 0 && (_this$ambientlight$pr4 = _this$ambientlight$pr3.ctx) !== null && _this$ambientlight$pr4 !== void 0 && _this$ambientlight$pr4.initCtx)) return;
        if (!(await this.ambientlight.projectorBuffer.ctx.initCtx(true))) return;
        this.setWarning('');
      } catch (ex) {
        this.ambientlight.projectorBuffer.ctx.setWebGLWarning('change');
        throw ex;
      }
    }
    resetFrameFading() {
      var _SettingsConfig$find;
      const frameFadingDefaultValue = (_SettingsConfig$find = SettingsConfig.find(s => s.name === 'frameFading')) === null || _SettingsConfig$find === void 0 ? void 0 : _SettingsConfig$find.default;
      if (this['frameFading'] === frameFadingDefaultValue) return;
      this.set('frameFading', frameFadingDefaultValue, true);
      this.updateProjectorWebGLCtx();
    }
    async updateProjectorWebGLCtx() {
      var _this$ambientlight$pr5;
      if (!((_this$ambientlight$pr5 = this.ambientlight.projector) !== null && _this$ambientlight$pr5 !== void 0 && _this$ambientlight$pr5.initCtx)) return;
      try {
        var _this$ambientlight$pr6;
        await new Promise(resolve => setTimeout$1(resolve, 0));
        if (!((_this$ambientlight$pr6 = this.ambientlight.projector) !== null && _this$ambientlight$pr6 !== void 0 && _this$ambientlight$pr6.initCtx)) return;
        if (!(await this.ambientlight.projector.initCtx(true))) return;
        this.setWarning('');
      } catch (ex) {
        this.ambientlight.projector.setWebGLWarning('change');
        throw ex;
      }
    }
    reloadPage() {
      var _this$ambientlight$vi;
      const search = new URLSearchParams(location.search);
      const time = Math.max(0, Math.floor(((_this$ambientlight$vi = this.ambientlight.videoElem) === null || _this$ambientlight$vi === void 0 ? void 0 : _this$ambientlight$vi.currentTime) || 0) - 2);
      time ? search.set('t', time) : search.delete('t');
      history.replaceState(null, null, `${location.pathname}?${search.toString()}`);
      location.reload();
    }
    frameFadingValueToDuration(value) {
      if (!value) return 'Off';
      const frames = Math.pow(value, 2);
      const seconds = frames / 30;
      if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
      return `${Math.round(seconds * 10) / 10} seconds`;
    }
    getSettingListDisplayText(setting) {
      const value = this[setting.name];
      if (setting.name === 'frameSync') {
        return {
          [FRAMESYNC_DECODEDFRAMES]: 'Decoded framerate',
          [FRAMESYNC_DISPLAYFRAMES]: 'Display framerate',
          [FRAMESYNC_VIDEOFRAMES]: 'Video framerate'
        }[value];
      }
      if (setting.name === 'debandingBlendMode') {
        return {
          [DEBANDING_BLEND_MODE_LCD]: 'LCD',
          [DEBANDING_BLEND_MODE_OLED]: 'OLED'
        }[value];
      }
      if (setting.name === 'barSizeDetectionAverageHistorySize') {
        return this.barSizeDetectionAverageHistorySize == 1 ? `1 frame` : `${value} frames`;
      }
      if (setting.name === 'framerateLimit') {
        return this.framerateLimit == 0 ? 'max fps' : `${value} fps`;
      }
      if (setting.name === 'frameFading') {
        return this.frameFadingValueToDuration(value);
      }
      if (setting.name === 'theme' || setting.name === 'enableInViews') {
        const snapPoint = setting.snapPoints.find(point => point.value === value);
        return (snapPoint === null || snapPoint === void 0 ? void 0 : snapPoint.hiddenLabel) || (snapPoint === null || snapPoint === void 0 ? void 0 : snapPoint.label);
      }
      return `${value}${setting.unit || '%'}`;
    }
    updateVisibility() {
      for (const setting of this.controlledSettings) {
        var _SettingsConfig$find2;
        if (!SettingsConfig.find(settingConfig => settingConfig.name === setting.name)) continue;
        const valueElem = this.menuElem.querySelector(`${getSettingQuerySelector(setting.name)}.ytp-menuitem, ${getSettingQuerySelector(setting.name)} .ytp-menuitem`);
        const controlledByName = setting.controllers.find(name => this[name]);
        const controlledByLabel = (_SettingsConfig$find2 = SettingsConfig.find(setting => setting.name === controlledByName && (this.advancedSettings || !setting.advanced))) === null || _SettingsConfig$find2 === void 0 ? void 0 : _SettingsConfig$find2.label;
        if (controlledByLabel) {
          valueElem.classList.add('is-controlled-by-setting');
          valueElem.setAttribute('title', `Controlled by the "${controlledByLabel}" setting.\nManually adjusting this setting will turn off "${controlledByLabel}"`);
        } else {
          valueElem.classList.remove('is-controlled-by-setting');
          valueElem.setAttribute('title', '');
        }
      }
      const isMenuOpen = this.menuElem.classList.contains('is-visible');
      for (const optionalGroup of this.optionalSettings) {
        const optionalSettings = optionalGroup.names.map(name => this.menuElem.querySelector(getSettingQuerySelector(name))).filter(setting => setting);
        const visible = optionalGroup.visible();
        for (const optionalSetting of optionalSettings) {
          if (!optionalSetting.animationTimeout && optionalSetting.style.display === (visible ? '' : 'none')) continue;
          if (optionalSetting.animationTimeout) {
            clearTimeout(optionalSetting.animationTimeout);
          }
          if (!isMenuOpen) {
            optionalSetting.style.display = visible ? '' : 'none';
          } else {
            this.fadeSettingElement(optionalSetting, visible);
          }
        }
      }
    }
    async fadeSettingElement(elem, visible) {
      await new Promise(resolve => {
        elem.style.display = elem.classList.contains('ytp-menuitem') ? 'flex' : 'block';
        const height = elem.clientHeight ?? 0;
        elem.style.marginBottom = visible ? `-${height}px` : '0px';
        elem.style.transformOrigin = '0% 0%';
        elem.style.transform = visible ? 'scaleY(0%)' : 'scaleY(100%)';
        elem.animationTimeout = raf(() => {
          elem.style.transition = 'transform .3s ease-in-out, margin-bottom .3s ease-in-out';
          elem.style.willChange = 'transform';
          elem.style.transform = visible ? 'scaleY(100%)' : 'scaleY(0%)';
          elem.style.marginBottom = visible ? '0px' : `-${height}px`;
          let timeout = setTimeout$1(() => {
            timeout = undefined;
            resolve();
          }, 500);
          elem.animationTimeout = setTimeout$1(() => {
            elem.animationTimeout = undefined;
            if (elem.style.transition === '') return;
            elem.style.display = visible ? '' : 'none';
            elem.style.transition = '';
            elem.style.transformOrigin = '';
            elem.style.transform = '';
            elem.style.marginBottom = '';
            elem.style.willChange = '';
            if (timeout) clearTimeout(timeout);
            resolve();
          }, 300);
        });
      });
    }
    setKey(name, key) {
      const setting = SettingsConfig.find(setting => setting.name === name) || {};
      const clear = key === undefined;
      if (clear) key = setting.defaultKey;
      setting.key = key;
      this.saveStorageEntry(`${setting.name}-key`, clear ? undefined : key);
    }
    set(name, value, updateUI, dontSave = false) {
      var _SettingsConfig$find3;
      const clear = value === undefined;
      if (clear) value = (_SettingsConfig$find3 = SettingsConfig.find(setting => setting.name === name)) === null || _SettingsConfig$find3 === void 0 ? void 0 : _SettingsConfig$find3.defaultValue;
      const changed = this[name] !== value;
      this[name] = value;
      if (name === 'blur') value = Math.round((value - 30) * 10) / 10;
      if (name === 'bloom') value = Math.round((value - 7) * 10) / 10;
      if (!dontSave && (clear || changed)) {
        this.saveStorageEntry(name, clear ? undefined : value);
      }
      if (updateUI) {
        this.updateUI(name);
      }
    }
    updateUI(name) {
      const setting = SettingsConfig.find(setting => setting.name === name) || {};
      if (setting.type === 'checkbox') {
        const checkboxInput = this.menuElem.querySelector(getSettingQuerySelector(name));
        if (checkboxInput) {
          checkboxInput.setAttribute('aria-checked', this[name] ? 'true' : 'false');
        }
      } else if (setting.type === 'list') {
        const rangeInput = this.menuElem.querySelector(`${getSettingQuerySelector(name)}-range`);
        if (rangeInput) {
          rangeInput.value = this.getInputRangeValue(name);
          rangeInput.setAttribute('data-previous-value', rangeInput.value);
          this.menuElem.querySelector(`${getSettingQuerySelector(name)}-value`).textContent = this.getSettingListDisplayText(setting);
          const manualInput = this.menuElem.querySelector(`${getSettingQuerySelector(name)}-manualinput`);
          if (manualInput) {
            manualInput.value = rangeInput.value;
          }
        }
      }
    }
    getInputRangeValue(name) {
      const setting = SettingsConfig.find(setting => setting.name === name) || {};
      if (setting.valuePoints) {
        return setting.valuePoints.indexOf(this[name]);
      } else {
        return this[name];
      }
    }
    clickUI(name) {
      this.menuElem.querySelector(getSettingQuerySelector(name)).click();
    }
    processStorageEntry(name, value) {
      const setting = SettingsConfig.find(setting => setting.name === name) || {};
      if (value == null) {
        value = setting.default;
      } else if (setting.type === 'checkbox' || setting.type === 'section') {
        value = value === 'true' || value === true;
      } else if (setting.type === 'list') {
        value = parseFloat(value);
        if (name === 'blur') value = Math.round((value + 30) * 10) / 10;
        if (name === 'bloom') value = Math.round((value + 7) * 10) / 10;
        if (name === 'frameSync' && value >= 50) {
          value = {
            50: FRAMESYNC_DECODEDFRAMES,
            100: FRAMESYNC_DISPLAYFRAMES,
            150: FRAMESYNC_VIDEOFRAMES
          }[value];
        }
      }
      return value;
    }
    saveStorageEntry(name, value) {
      this.pendingStorageEntries[name] = value;
      if (this.saveStorageEntryTimeout) clearTimeout(this.saveStorageEntryTimeout);
      this.saveStorageEntryTimeout = setTimeout$1(function saveStorageEntryTimeout() {
        delete this.saveStorageEntryTimeout;
        this.flushPendingStorageEntries();
      }.bind(this), 500);
    }
    async flushPendingStorageEntries() {
      try {
        if (this.saveStorageEntryTimeout) clearTimeout(this.saveStorageEntryTimeout);
        const names = Object.keys(this.pendingStorageEntries);
        for (const name of names) {
          await storage.set(`setting-${name}`, this.pendingStorageEntries[name], true);
          delete this.pendingStorageEntries[name];
        }
      } catch (ex) {
        if (ex.message.includes('QuotaExceededError')) {
          this.setWarning('The changes could not be saved because the settings have changed too often.\nWait a few seconds...');
          return;
        }
        if (ex.message === 'uninstalled') {
          this.setWarning('The changes could not be saved because the extension has been updated.\nRefresh the webpage to reload the updated extension.');
          return;
        }
        if (ex.message !== 'An unexpected error occurred') SentryReporter.captureException(ex);
        this.logStorageWarningOnce(`Failed to save settings ${JSON.stringify(this.pendingStorageEntries)}: ${ex.message}`);
      }
    }
    logStorageWarningOnce(...args) {
      if (this.loggedStorageWarning) return;
      console.warn(...args);
      this.loggedStorageWarning = true;
    }
    displayBezelForSetting(name) {
      const key = SettingsConfig.find(setting => setting.name === name).key;
      const strike = !this[name];
      this.displayBezel(key, strike);
    }
    displayBezel(text, strike = false) {
      if (this.onBezelElemAnimationEndTimeout) {
        this.onBezelElemAnimationEnd();
      }
      this.bezelElem.classList.add('ytal-bezel--no-animation');
      setTimeout$1(() => {
        this.bezelElem.classList.toggle('ytal-bezel--strike', strike);
        this.bezelTextElem.textContent = text;
        on(this.bezelElem, 'animationend', this.onBezelElemAnimationEnd);
        this.onBezelElemAnimationEndTimeout = setTimeout$1(() => {
          this.onBezelElemAnimationEndTimeout = undefined;
          this.onBezelElemAnimationEnd();
        }, 1000);
        this.bezelElem.classList.remove('ytal-bezel--no-animation');
      }, 1);
    }
    updateHdr() {
      if (this.ambientlight.isHdr) {
        this.menuElem.classList.add('ytpa-ambientlight-settings-menu--hdr');
      } else {
        this.menuElem.classList.remove('ytpa-ambientlight-settings-menu--hdr');
      }
    }
    scrollToWarning() {
      if (!this.warningElem.textContent || !this.scrollToWarningQueued) return;
      this.scrollToWarningQueued = false;
      this.menuElem.scrollTo({
        behavior: 'smooth',
        top: 0
      });
    }
  }
  Settings.getStoredSettingsCached = async () => {
    if (Settings.storedSettingsCached) {
      return Settings.storedSettingsCached;
    }
    prepareSettingsConfigOnce();
    const names = [];
    for (const setting of SettingsConfig) {
      names.push(`setting-${setting.name}`);
      if (setting.defaultKey !== undefined) {
        names.push(`setting-${setting.name}-key`);
      }
    }
    names.push('setting-webGLCrash');
    names.push('setting-webGLCrashVersion');
    names.push('setting-surroundingContentImagesTransparency');
    names.push('setting-blur');
    names.push('setting-bloom');
    names.push('setting-fadeOutEasing');
    const warningTimeout = setTimeout$1(() => setWarning(`It is taking more than 5 seconds to load your previous settings.
If this is your first warning and it does not disappear, then the extension might have updated. 
You can reload the webpage to complete the update.

But if this happens frequently, here are some possible causes:
- Another extension is blocking code execution on this webpage for a long duration.
  Disable other extensions temporarely to find out which one it is.
- If your computer is very slow or frequently freezing in other applications as well,
  there could be a problem with your hardware, likely the memory (DDR).`), 5000);
    try {
      Settings.storedSettingsCached = (await storage.get(names, true)) || {};
    } catch (ex) {
      clearTimeout(warningTimeout);
      throw ex;
    }
    clearTimeout(warningTimeout);
    setWarning();
    if (Settings.storedSettingsCached['setting-blur'] != null) {
      const value = Math.round(Settings.storedSettingsCached['setting-blur'] + 30) * 10 / 10;
      delete Settings.storedSettingsCached['setting-blur'];
      await storage.set('setting-blur', undefined);
      Settings.storedSettingsCached['setting-blur2'] = value;
      await storage.set('setting-blur2', value);
    }
    if (Settings.storedSettingsCached['setting-bloom'] != null) {
      const value = Math.round((Settings.storedSettingsCached['setting-bloom'] + 7) * 10) / 10;
      delete Settings.storedSettingsCached['setting-bloom'];
      await storage.set('setting-bloom', undefined);
      Settings.storedSettingsCached['setting-spreadFadeStart'] = value;
      await storage.set('setting-spreadFadeStart', value);
    }
    if (Settings.storedSettingsCached['setting-fadeOutEasing'] != null) {
      Settings.storedSettingsCached['setting-spreadFadeCurve'] = Settings.storedSettingsCached['setting-fadeOutEasing'];
      delete Settings.storedSettingsCached['setting-fadeOutEasing'];
      await storage.set('setting-fadeOutEasing', undefined);
    }
    if (Settings.storedSettingsCached['setting-frameFading'] != null) {
      const value = Settings.storedSettingsCached['setting-frameFading'];
      const max = SettingsConfig.find(setting => setting.name === 'frameFading').max;
      if (value > max) {
        const newValue = Math.min(max, Math.round(Math.sqrt(value) * 50) / 50);
        Settings.storedSettingsCached['setting-frameFading'] = newValue;
        await storage.set('setting-frameFading', newValue);
      }
    }
    const webGLEnabled = Settings.storedSettingsCached['setting-webGL'] === true || Settings.storedSettingsCached['setting-webGL'] == null && supportsWebGL();
    if (webGLEnabled) {
      if (!supportsWebGL()) {
        Settings.storedSettingsCached['setting-webGL'] = null;
        SettingsConfig.find(setting => setting.name === 'spread').max = 200;
      } else {
        SettingsConfig.find(setting => setting.name === 'saturation').advanced = true;
      }
    } else {
      SettingsConfig.find(setting => setting.name === 'spread').max = 200;
      for (const settingName of WebGLOnlySettings) {
        if (Settings.storedSettingsCached[`setting-${settingName}`] !== undefined) delete Settings.storedSettingsCached[`setting-${settingName}`];
      }
      if (Settings.storedSettingsCached['setting-spread'] > 200) Settings.storedSettingsCached['setting-spread'] = 200;
    }
    return Settings.storedSettingsCached;
  };

  const WIDTH = 512;
  const HEIGHT = 512;
  class ProjectorShadow {
    constructor(offscreen = true) {
      this.plotKeyframes = (length, powerOf, darkest) => {
        const keyframes = [];
        for (let i = 1; i < length; i++) {
          keyframes.push({
            p: i / length,
            o: Math.pow(i / length, powerOf) * darkest
          });
        }
        return keyframes.map(({
          p,
          o
        }) => ({
          p: Math.round(p * 10000) / 10000,
          o: Math.round(o * 10000) / 10000
        }));
      };
      this.drawGradient = (...args) => {
        const [size, edge, keyframes, fadeOutFrom, darkest, horizontal] = args;
        const points = [0, ...keyframes.map(e => Math.max(0, edge - edge * e.p - edge * fadeOutFrom * (1 - e.p))), edge - edge * fadeOutFrom, edge + size + edge * fadeOutFrom, ...keyframes.reverse().map(e => Math.min(edge + size + edge, edge + size + edge * e.p + edge * fadeOutFrom * (1 - e.p))), edge + size + edge];
        const pointMax = points[points.length - 1];
        let gradientStops = [];
        gradientStops.push([Math.min(1, points[0] / pointMax), `rgba(0,0,0,${darkest})`]);
        for (let i = 0; i < keyframes.length; i++) {
          const e = keyframes[i];
          gradientStops.push([Math.min(1, points[0 + keyframes.length - i] / pointMax), `rgba(0,0,0,${e.o})`, i, e]);
        }
        gradientStops.push([Math.min(1, points[1 + keyframes.length] / pointMax), `rgba(0,0,0,0)`]);
        gradientStops.push([Math.min(1, points[2 + keyframes.length] / pointMax), `rgba(0,0,0,0)`]);
        keyframes.reverse();
        for (let i = 0; i < keyframes.length; i++) {
          const e = keyframes[i];
          gradientStops.push([Math.min(1, points[2 + keyframes.length * 2 - i] / pointMax), `rgba(0,0,0,${e.o})`, i, e]);
        }
        gradientStops.push([Math.min(1, points[3 + keyframes.length * 2] / pointMax), `rgba(0,0,0,${darkest})`]);
        gradientStops = gradientStops.map(args => {
          var _args$, _args$2;
          return [Math.round(args[0] * 10000) / 10000, args[1], args[2], (_args$ = args[3]) === null || _args$ === void 0 ? void 0 : _args$.p, (_args$2 = args[3]) === null || _args$2 === void 0 ? void 0 : _args$2.o];
        });
        const gradient = this.ctx.createLinearGradient(0, 0, horizontal ? WIDTH : 0, !horizontal ? HEIGHT : 0);
        for (let i = 0; i < gradientStops.length; i++) {
          const gs = gradientStops[i];
          try {
            gradient.addColorStop(...gs);
          } catch (ex) {
            ex.details = {
              i,
              gs,
              size,
              edge,
              fadeOutFrom,
              darkest,
              horizontal,
              Ωpoints: JSON.parse(JSON.stringify(points)),
              Ωkeyframes: JSON.parse(JSON.stringify(keyframes)),
              ΩgradientStops: JSON.parse(JSON.stringify(gradientStops))
            };
            throw ex;
          }
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
      };
      this.elem = offscreen ? new SafeOffscreenCanvas(512, 512, true) : new Canvas(512, 512);
      this.ctx = this.elem.getContext('2d', {
        ...ctxOptions,
        alpha: true
      });
    }
    rescale(scale, projectorSize, settings) {
      if (this.elem.style) {
        this.elem.style.transform = `scale(${scale.x + 0.01}, ${scale.y + 0.01})`;
      }
      const {
        spreadFadeCurve,
        spreadFadeStart,
        directionTopEnabled,
        directionRightEnabled,
        directionBottomEnabled,
        directionLeftEnabled
      } = settings;
      const cacheKey = JSON.stringify({
        scale,
        projectorSize,
        spreadFadeCurve,
        spreadFadeStart,
        directionTopEnabled,
        directionRightEnabled,
        directionBottomEnabled,
        directionLeftEnabled
      });
      if (this.elem.width !== WIDTH || this.elem.height !== HEIGHT) {
        this.elem.width = WIDTH;
        this.elem.height = HEIGHT;
      } else if (this.cacheKey !== cacheKey) {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      } else {
        return;
      }
      const edge = {
        w: (projectorSize.w * scale.x - projectorSize.w) / 2 / scale.x,
        h: (projectorSize.h * scale.y - projectorSize.h) / 2 / scale.y
      };
      const video = {
        w: projectorSize.w / scale.x,
        h: projectorSize.h / scale.y
      };
      const darkest = 1;
      const easing = 16 / (spreadFadeCurve * 0.64);
      const keyframes = this.plotKeyframes(256, easing, darkest);
      let fadeOutFrom = spreadFadeStart / 100;
      const fadeOutMinH = -(video.h / 2 / edge.h);
      const fadeOutMinW = -(video.w / 2 / edge.w);
      fadeOutFrom = Math.max(fadeOutFrom, fadeOutMinH, fadeOutMinW);
      try {
        this.drawGradient(video.h, edge.h, keyframes, fadeOutFrom, darkest, false);
        this.drawGradient(video.w, edge.w, keyframes, fadeOutFrom, darkest, true);
      } catch (ex) {
        ex.details = {
          ...ex.details,
          scale: {
            ...scale
          },
          projectorSize: {
            ...projectorSize
          },
          easing
        };
        throw ex;
      }
      const scaleW = WIDTH / (video.w + edge.w + edge.w);
      const scaleH = HEIGHT / (video.h + edge.h + edge.h);
      this.ctx.fillStyle = '#000000';
      if (!directionTopEnabled) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(scaleW * edge.w, scaleH * edge.h);
        this.ctx.lineTo(scaleW * (edge.w + video.w / 2), scaleH * (edge.h + video.h / 2));
        this.ctx.lineTo(scaleW * (edge.w + video.w), scaleH * edge.h);
        this.ctx.lineTo(scaleW * (edge.w + video.w + edge.w), 0);
        this.ctx.fill();
      }
      if (!directionRightEnabled) {
        this.ctx.beginPath();
        this.ctx.lineTo(scaleW * (edge.w + video.w + edge.w), 0);
        this.ctx.lineTo(scaleW * (edge.w + video.w), scaleH * edge.h);
        this.ctx.lineTo(scaleW * (edge.w + video.w / 2), scaleH * (edge.h + video.h / 2));
        this.ctx.lineTo(scaleW * (edge.w + video.w), scaleH * (edge.h + video.h));
        this.ctx.lineTo(scaleW * (edge.w + video.w + edge.w), scaleH * (edge.h + video.h + edge.h));
        this.ctx.fill();
      }
      if (!directionBottomEnabled) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, scaleH * (edge.h + video.h + edge.h));
        this.ctx.lineTo(scaleW * edge.w, scaleH * (edge.h + video.h));
        this.ctx.lineTo(scaleW * (edge.w + video.w / 2), scaleH * (edge.h + video.h / 2));
        this.ctx.lineTo(scaleW * (edge.w + video.w), scaleH * (edge.h + video.h));
        this.ctx.lineTo(scaleW * (edge.w + video.w + edge.w), scaleH * (edge.h + video.h + edge.h));
        this.ctx.fill();
      }
      if (!directionLeftEnabled) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(scaleW * edge.w, scaleH * edge.h);
        this.ctx.lineTo(scaleW * (edge.w + video.w / 2), scaleH * (edge.h + video.h / 2));
        this.ctx.lineTo(scaleW * edge.w, scaleH * (edge.h + video.h));
        this.ctx.lineTo(0, scaleH * (edge.h + video.h + edge.h));
        this.ctx.fill();
      }
      this.cacheKey = cacheKey;
    }
  }

  class Projector2d {
    constructor(ambientlight, containerElem, initProjectorListeners, settings) {
      this.type = 'Projector2d';
      this.width = 1;
      this.height = 1;
      this.lostCount = 0;
      this.onProjectorCtxLost = () => {
        var _this$shadow;
        console.warn('Lost 2d projector');
        this.lostCount++;
        if ((_this$shadow = this.shadow) !== null && _this$shadow !== void 0 && _this$shadow.elem) {
          this.shadow.elem.width = 1;
        }
        this.settings.setWarning(`Failed to restore the renderer from a GPU crash.${canvas2DCrashTips}`);
      };
      this.onProjectorCtxRestored = event => {
        if (this.lostCount >= 3 * this.projectors.length) {
          console.error('Projector2D context restore failed 3 times');
          this.settings.setWarning(`Failed to restore 3 times the renderer from a GPU crash.${canvas2DCrashTips}`);
          return;
        }
        console.warn('Restored 2d projector');
        const projectorElem = event.currentTarget;
        projectorElem.width = 1;
        this.ambientlight.buffersCleared = true;
        this.ambientlight.sizesChanged = true;
        this.ambientlight.barDetection.clear();
        if (this.scheduledRedrawAfterRestoreId) cancelAnimationFrame(this.scheduledRedrawAfterRestoreId);
        this.scheduledRedrawAfterRestoreId = raf(async () => {
          this.scheduledRedrawAfterRestoreId = undefined;
          await this.ambientlight.optionalFrame();
          this.initProjectorListeners();
          this.settings.setWarning('');
        });
      };
      this.ambientlight = ambientlight;
      this.containerElem = containerElem;
      this.initProjectorListeners = initProjectorListeners;
      this.settings = settings;
      this.shadow = new ProjectorShadow(false);
      this.shadow.elem.classList.add('ambientlight__shadow');
      this.containerElem.appendChild(this.shadow.elem);
      this.boundaryElem = this.shadow.elem;
    }
    remove() {
      this.containerElem.remove(this.projectorListElem);
    }
    recreate(levels) {
      this.levels = levels;
      if (!this.projectors) {
        this.projectors = [];
      }
      this.projectors = this.projectors.filter(function removeExcessProjector(projector, i) {
        if (i >= levels) {
          projector.elem.remove();
          return false;
        }
        return true;
      });
      for (let i = this.projectors.length; i < levels; i++) {
        const projectorElem = new Canvas(this.width, this.height);
        projectorElem.classList.add('ambientlight__projector');
        on(projectorElem, 'contextlost', this.onProjectorCtxLost);
        on(projectorElem, 'contextrestored', this.onProjectorCtxRestored);
        const projectorCtx = projectorElem.getContext('2d', ctxOptions);
        this.containerElem.prepend(projectorElem);
        this.projectors.push({
          elem: projectorElem,
          ctx: projectorCtx
        });
      }
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
      for (const projector of this.projectors) {
        if (projector.elem.width !== width) projector.elem.width = width;
        if (projector.elem.height !== height) projector.elem.height = height;
      }
    }
    rescale(scales, lastScale, projectorSize, crop, settings) {
      this.crop = crop;
      for (let i = 0; i < scales.length; i++) {
        this.projectors[i].elem.style.transform = `scale(${scales[i].x}, ${scales[i].y})`;
      }
      this.shadow.rescale(lastScale, projectorSize, settings);
    }
    draw(src) {
      const srcWidth = src.videoWidth || src.width;
      const srcHeight = src.videoHeight || src.height;
      const croppedSrcX = srcWidth * this.crop[0];
      const croppedSrcY = srcHeight * this.crop[1];
      const croppedSrcWidth = srcWidth * (1 - this.crop[0] * 2);
      const croppedSrcHeight = srcHeight * (1 - this.crop[1] * 2);
      for (const projector of this.projectors) {
        projector.ctx.drawImage(src, croppedSrcX, croppedSrcY, croppedSrcWidth, croppedSrcHeight, 0, 0, projector.elem.width, projector.elem.height);
      }
    }
    clearRect() {
      for (const projector of this.projectors) {
        projector.ctx.clearRect(0, 0, projector.elem.width, projector.elem.height);
      }
    }
  }

  class ProjectorWebGL {
    constructor(ambientlight, containerElem, initProjectorListeners, settings) {
      this.type = 'ProjectorWebGL';
      this.lostCount = 0;
      this.blurLostCount = 0;
      this.scales = [{
        x: 1,
        y: 1
      }];
      this.projectors = [];
      this.atTop = true;
      this.handleWindowResize = async () => {
        if (this.ambientlight.isPageHidden) return;
        this.updateCrop();
        await this.ambientlight.optionalFrame();
      };
      this.handleAtTopChange = async atTop => {
        this.atTop = atTop;
        if (this.ambientlight.isPageHidden) return;
        this.updateCrop();
        this.ambientlight.buffersCleared = true;
        await this.ambientlight.optionalFrame();
      };
      this.drawIndex = 0;
      this.drawBorder = 0;
      this.drawTextureSize = {
        width: 0,
        height: 0
      };
      this.draw = src => {
        var _src$ctx, _this$fTextureOpacity;
        if (!this.ctx || this.ctxIsInvalid || (_src$ctx = src.ctx) !== null && _src$ctx !== void 0 && _src$ctx.ctxIsInvalid || this.lost || !this.viewport) return;
        if (this.projectorsCount > 1 && this.projectorsCount !== ((_this$fTextureOpacity = this.fTextureOpacity) === null || _this$fTextureOpacity === void 0 ? void 0 : _this$fTextureOpacity.length)) return;
        if (!this.cropped) this.updateCrop();
        const srcWidth = src.videoWidth || src.width;
        const srcHeight = src.videoHeight || src.height;
        const textureMipmapLevel = Math.max(0, Math.log(srcHeight / this.height) / Math.log(2) - 0);
        if (textureMipmapLevel !== this.fTextureMipmapLevel) {
          this.fTextureMipmapLevel = textureMipmapLevel;
          this.ctx.uniform1f(this.fTextureMipmapLevelLoc, textureMipmapLevel);
        }
        const subProjectorsDimensionMultiplier = Math.sqrt(this.subProjectorsCount);
        const textureSize = this.projectorsCount > 1 ? {
          width: (srcWidth + this.drawBorder) * subProjectorsDimensionMultiplier,
          height: (srcHeight + this.drawBorder) * subProjectorsDimensionMultiplier
        } : {
          width: srcWidth,
          height: srcHeight
        };
        const updateTextureSize = this.drawTextureSize.width !== textureSize.width || this.drawTextureSize.height !== textureSize.height;
        const blurCanvasBound = Math.floor(this.blurBound / this.blurCanvasScale);
        const blurCanvasWidthMinBounds = this.blurCanvas.width - blurCanvasBound * 2;
        const blurCanvasHeightMinBounds = this.blurCanvas.height - blurCanvasBound * 2;
        const internalFormat = this.ctx.RGBA;
        const format = this.ctx.RGBA;
        const formatType = this.ctx.UNSIGNED_BYTE;
        let start = this.settings.showResolutions ? performance.now() : undefined;
        if (this.projectorsCount > 1) {
          if (updateTextureSize) {
            this.drawInitial = true;
            this.drawIndex = 0;
          }
          const filledOpacities = this.fTextureOpacity.slice(this.projectorsCount - 1 - this.drawIndex);
          const emptyOpacities = this.fTextureOpacity.slice(0, this.projectorsCount - 1 - this.drawIndex);
          const opacities = [...(this.drawInitial ? filledOpacities.map((o, i) => i === 0 ? emptyOpacities.reduce((s, o) => s + o, o) : o) : filledOpacities), ...(this.drawInitial ? emptyOpacities.map(() => 0) : emptyOpacities)];
          const textureIndex = Math.floor(this.drawIndex / this.subProjectorsCount);
          const previousTextureIndex = Math.floor((this.drawIndex - 1) / this.subProjectorsCount);
          const isNewTexture = textureIndex !== previousTextureIndex;
          const drawInitialAndIsNewTexture = this.drawInitial && isNewTexture;
          const subIndex = this.drawIndex % this.subProjectorsCount;
          const xIndex = subIndex % subProjectorsDimensionMultiplier;
          const yIndex = Math.floor(subIndex / subProjectorsDimensionMultiplier) % subProjectorsDimensionMultiplier;
          const x = (srcWidth + this.drawBorder) * xIndex;
          const y = (srcHeight + this.drawBorder) * yIndex;
          if (this.drawInitial) {
            const isLastSubTexture = this.drawIndex == this.projectorsCount - 1;
            if (isLastSubTexture) this.drawInitial = false;
          }
          this.ctx.uniform1fv(this.fTextureOpacityLoc, new Float32Array(opacities));
          this.ctx.activeTexture(this.ctx[`TEXTURE${textureIndex + 1}`]);
          if (drawInitialAndIsNewTexture) {
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, internalFormat, textureSize.width, textureSize.height, 0, format, formatType, null);
          }
          this.ctx.texSubImage2D(this.ctx.TEXTURE_2D, 0, x, y, format, formatType, src);
          this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        } else {
          if (updateTextureSize) {
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, internalFormat, format, formatType, src);
          } else {
            this.ctx.texSubImage2D(this.ctx.TEXTURE_2D, 0, 0, 0, format, formatType, src);
          }
          this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        }
        if (this.settings.showResolutions) this.loadTime = performance.now() - start;
        if (this.settings.showResolutions) start = performance.now();
        this.ctx.drawArrays(this.ctx.TRIANGLES, 0, this.vPosition.length / 2);
        const isNewTextureUpload = this.drawTextureSize.width === 0 && this.drawTextureSize.height === 0;
        if (isNewTextureUpload) {
          this.checkForDrawErrors();
        }
        if (this.settings.showResolutions) this.drawTime = performance.now() - start;
        if (this.settings.showResolutions) start = performance.now();
        this.blurCtx.clearRect(0, 0, this.blurCanvas.width, this.blurCanvas.height);
        if (this.settings.showResolutions) {
          this.blurClearTime = performance.now() - start;
          start = performance.now();
        }
        this.blurCtx.drawImage(this.elem, blurCanvasBound, blurCanvasBound, blurCanvasWidthMinBounds, blurCanvasHeightMinBounds);
        if (this.settings.showResolutions) this.blurDrawTime = performance.now() - start;
        if (updateTextureSize) {
          this.drawTextureSize = textureSize;
        }
        this.drawIndex = (this.drawIndex + 1 + Math.round(Math.random() * 0.5)) % this.projectorsCount;
      };
      this.drawErrors = [];
      this.checkForDrawErrors = () => {
        var _this$program;
        const webGLError = this.ctx.getError();
        if (webGLError === this.ctx.NO_ERROR) {
          this.drawErrors.length = 0;
          this.setWarning('');
          return;
        }
        this.drawInitial = true;
        const error = new AmbientlightError(`WebGL error: ${webGLErrorToString(webGLError)}`, {
          program: (_this$program = this.program) === null || _this$program === void 0 ? void 0 : _this$program.toString(),
          webGLVersion: this.webGLVersion,
          majorPerformanceCaveat: this.majorPerformanceCaveat,
          ctxOptions: this.ctxOptions
        });
        error.name = 'ProjectorWebGLDrawError';
        this.drawErrors.push(error);
        if (this.drawErrors.length < 3) {
          console.warn(error);
          this.ambientlight.setDrawWarning(error);
          return;
        }
        error.details.previousErrors = this.drawErrors.slice(0, -1);
        throw error;
      };
      this.onBlurCtxLost = wrapErrorHandler(function wrappedOnBlurCtxLost(event) {
        var _this$shadow;
        event.preventDefault();
        this.blurLost = true;
        this.blurLostCount++;
        this.invalidateShaderCache();
        if ((_this$shadow = this.shadow) !== null && _this$shadow !== void 0 && _this$shadow.elem) {
          this.shadow.elem.width = 1;
        }
        console.log(`ProjectorWebGL blur context lost (${this.blurLostCount})`);
        this.setWebGLWarning('restore');
        this.ambientlight.barDetection.clear();
      }.bind(this));
      this.onBlurCtxRestored = wrapErrorHandler(async function wrappedOnBlurCtxRestored() {
        console.log(`ProjectorWebGL blur context restored (${this.blurLostCount})`);
        if (this.blurLostCount >= 3) {
          console.error('ProjectorWebGL blur context was lost 3 times. The current restoration has been aborted to prevent an infinite restore loop.');
          this.setWebGLWarning('3 times restore');
          return;
        }
        await new Promise(resolve => requestAnimationFrame(resolve));
        this.initBlurCtx();
        if (this.blurCtx && (!this.blurCtx.isContextLost || !this.blurCtx.isContextLost())) {
          if (!this.ctxIsInvalid) {
            var _this$ambientlight$pr;
            this.initProjectorListeners();
            this.blurLost = false;
            if (!this.lost && !((_this$ambientlight$pr = this.ambientlight.projectorBuffer) !== null && _this$ambientlight$pr !== void 0 && _this$ambientlight$pr.lost)) this.setWarning('');
            this.ambientlight.barDetection.clear();
          }
        } else {
          console.error(`ProjectorWebGL blur context restore failed (${this.blurLostCount})`);
          this.setWebGLWarning('restore');
        }
      }.bind(this));
      this.onCtxLost = wrapErrorHandler(function projectorCtxLost(event) {
        event.preventDefault();
        this.lost = true;
        this.lostCount++;
        this.program = undefined;
        this.invalidateShaderCache();
        console.log(`ProjectorWebGL context lost (${this.lostCount})`);
        this.setWebGLWarning('restore');
      }.bind(this));
      this.onCtxRestored = wrapErrorHandler(async function projectorCtxRestored() {
        if (this.lostCount >= 3) {
          console.error('ProjectorWebGL context restore failed 3 times');
          this.setWebGLWarning('3 times restore');
          return;
        }
        try {
          await new Promise(resolve => requestAnimationFrame(resolve));
          if (!(await this.initCtx())) return;
        } catch (ex) {
          this.setWebGLWarning();
          throw ex;
        }
        this.initShadow();
        this.initBlurCtx();
        if (this.ctx) {
          if (!this.ctxIsInvalid) {
            var _this$ambientlight$pr2;
            this.initProjectorListeners();
            this.lost = false;
            if (!this.blurLost && !((_this$ambientlight$pr2 = this.ambientlight.projectorBuffer) !== null && _this$ambientlight$pr2 !== void 0 && _this$ambientlight$pr2.lost)) this.setWarning('');
          }
        } else {
          console.error(`ProjectorWebGL context restore failed (${this.lostCount})`);
          this.setWebGLWarning('restore');
          return;
        }
        if (this.handleRestored) this.handleRestored();
      }.bind(this));
      this.webglcontextcreationerrors = [];
      this.onCtxCreationError = wrapErrorHandler(function projectorCtxCreationError(e) {
        this.webglcontextcreationerrors.push({
          webGLVersion: this.webGLVersion,
          failIfMajorPerformanceCaveat: this.ctxOptions.failIfMajorPerformanceCaveat,
          message: e.statusMessage || '?',
          time: performance.now()
        });
      }.bind(this));
      return async function ProjectorWebGLConstructor() {
        this.ambientlight = ambientlight;
        this.atTop = ambientlight.atTop;
        this.containerElem = containerElem;
        this.initProjectorListeners = initProjectorListeners;
        this.settings = settings;
        this.setWarning = settings.setWarning;
        this.initShadow();
        this.initBlurCtx();
        const initialized = await this.initCtx();
        if (!initialized) this.setWebGLWarning('create');
        this.initializedTime = performance.now();
        return this;
      }.bind(this)();
    }
    invalidateShaderCache() {
      this.viewport = undefined;
      this.fVibrance = undefined;
      this.vPosition = undefined;
      this.vUV = undefined;
      this.cropped = undefined;
      this.fScale = undefined;
      this.fScaleStep = undefined;
      this.fScalesLength = undefined;
      this.fCrop = undefined;
      this.fTextureMipmapLevel = undefined;
      this.fTextureOpacity = undefined;
      this.drawTextureSize = {
        width: 0,
        height: 0
      };
    }
    remove() {
      this.containerElem.remove(this.elem);
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
    }
    initShadow() {
      this.shadow = new ProjectorShadow();
      this.projectors[2] = {
        elem: this.shadow.elem,
        ctx: this.blurCtx
      };
    }
    setWebGLWarning(action = 'restore') {
      this.setWarning(`Failed to ${action} the WebGL renderer from a GPU crash.${canvasWebGLCrashTips}`);
    }
    initBlurCtx() {
      if (this.blurCanvas) {
        this.containerElem.removeChild(this.blurCanvas);
        if (this.blurCtx) {
          this.blurCanvas.removeEventListener('contextlost', this.onBlurCtxLost);
          this.blurCanvas.removeEventListener('contextrestored', this.onBlurCtxRestored);
        }
      }
      this.blurCanvas = document.createElement('canvas');
      this.blurCanvas.classList.add('ambientlight__projector');
      this.containerElem.prepend(this.blurCanvas);
      this.boundaryElem = this.blurCanvas;
      this.blurCanvas.addEventListener('contextlost', this.onBlurCtxLost);
      this.blurCanvas.addEventListener('contextrestored', this.onBlurCtxRestored);
      this.blurCtx = this.blurCanvas.getContext('2d', {
        ...ctxOptions,
        alpha: true,
        desynchronized: false
      });
      if (!this.blurCtx) {
        throw new Error('ProjectorWebGL blur context creation failed');
      }
      this.projectors[0] = {
        elem: this.blurCanvas,
        ctx: this.blurCtx
      };
      if (this.blurLost) {
        this.blurLost = false;
      }
    }
    async getMajorPerformanceCaveatDetected() {
      try {
        return (await storage.get('majorPerformanceCaveatDetected')) || false;
      } catch (ex) {
        SentryReporter.captureException(ex);
      }
    }
    async majorPerformanceCaveatDetected() {
      this.majorPerformanceCaveat = true;
      const detected = await this.getMajorPerformanceCaveatDetected();
      if (detected) return;
      const message = 'The browser warned that this is a slow device. If you have a graphics card, make sure to enable hardware acceleration in the browser.\n(The resolution setting has been turned down to 25% for better performance)';
      this.setWarning(message, true);
      this.settings.set('resolution', 25, true);
      await storage.set('majorPerformanceCaveatDetected', true);
    }
    async noMajorPerformanceCaveatDetected() {
      this.majorPerformanceCaveat = false;
      const detected = await this.getMajorPerformanceCaveatDetected();
      if (detected === false) return;
      await storage.set('majorPerformanceCaveatDetected', false);
    }
    async initCtx(syncCompilation = false) {
      if (this.cancelCompilation) return false;
      if (this.compilationPromise) {
        this.cancelCompilation = true;
        await this.compilationPromise;
        this.cancelCompilation = undefined;
      }
      if ((this.webGLVersion === 2 || this.webGLVersion === 1) && !this.ctx && this.elem) {
        this.elem.removeEventListener('contextlost', this.onCtxLost);
        this.elem.removeEventListener('contextrestored', this.onCtxRestored);
        this.elem.removeEventListener('webglcontextcreationerror', this.onCtxCreationError);
        this.elem = undefined;
        this.webGLVersion = undefined;
      }
      if (!this.elem) {
        this.elem = new SafeOffscreenCanvas(1, 1);
        this.elem.addEventListener('webglcontextlost', this.onCtxLost, false);
        this.elem.addEventListener('webglcontextrestored', this.onCtxRestored, false);
        this.elem.addEventListener('webglcontextcreationerror', this.onCtxCreationError, false);
      }
      if (!this.ctx) {
        this.ctxOptions = {
          failIfMajorPerformanceCaveat: true,
          preserveDrawingBuffer: false,
          premultipliedAlpha: false,
          alpha: true,
          depth: false,
          antialias: false,
          desynchronized: false
        };
        this.webGLVersion = 2;
        this.ctx = this.elem.getContext('webgl2', this.ctxOptions);
        if (this.ctx) {
          this.noMajorPerformanceCaveatDetected();
        } else {
          this.webGLVersion = 1;
          this.ctx = this.elem.getContext('webgl', this.ctxOptions);
          if (this.ctx) {
            this.noMajorPerformanceCaveatDetected();
          } else {
            this.ctxOptions.failIfMajorPerformanceCaveat = false;
            this.webGLVersion = 2;
            this.ctx = this.elem.getContext('webgl2', this.ctxOptions);
            if (this.ctx) {
              this.majorPerformanceCaveatDetected();
            } else {
              this.webGLVersion = 1;
              this.ctx = this.elem.getContext('webgl', this.ctxOptions);
              if (this.ctx) {
                this.majorPerformanceCaveatDetected();
              } else {
                this.webGLVersion = undefined;
                await new Promise(resolve => setTimeout(resolve, 1000));
                const errors = this.webglcontextcreationerrors;
                this.webglcontextcreationerrors = [];
                let lastErrorMessage = '';
                for (const error of errors) {
                  const duplicate = error.message === lastErrorMessage;
                  lastErrorMessage = error.message;
                  if (duplicate) error.message = '"';
                }
                throw new AmbientlightError(`ProjectorWebGL context creation failed: ${lastErrorMessage}`, errors);
              }
            }
          }
        }
      }
      if (!this.ctx || this.ctx.isContextLost()) return;
      if ('drawingBufferColorSpace' in this.ctx && 'unpackColorSpace' in this.ctx) {
        this.ctx.drawingBufferColorSpace = ctxOptions.colorSpace;
        this.ctx.unpackColorSpace = ctxOptions.colorSpace;
      }
      this.projectors[1] = {
        elem: this.elem,
        ctx: this
      };
      const program = this.ctx.createProgram();
      this.ctx.hint(this.ctx.GENERATE_MIPMAP_HINT, this.ctx.NICEST);
      const tfaExt = this.ctx.getExtension('EXT_texture_filter_anisotropic') || this.ctx.getExtension('MOZ_EXT_texture_filter_anisotropic') || this.ctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
      const maxAnisotropy = tfaExt ? Math.min(16, this.ctx.getParameter(tfaExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1) : 0;
      this.shadowTexture = this.ctx.createTexture();
      this.ctx.activeTexture(this.ctx.TEXTURE0);
      this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.shadowTexture);
      this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
      this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
      this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
      this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
      this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
      this.projectorsTexture = [];
      const maxTextures = Math.min(this.ctx.getParameter(this.ctx.MAX_TEXTURE_IMAGE_UNITS) || 8, 16);
      const maxProjectorTextures = maxTextures - 1;
      ProjectorWebGL.subProjectorDimensionMax = this.webGLVersion === 2 ? 3 : 2;
      this.subProjectorsCount = 1;
      const frameFading = Math.round(Math.pow(this.settings.frameFading, 2));
      for (let i = 1; i < ProjectorWebGL.subProjectorDimensionMax && frameFading + 1 > maxProjectorTextures * Math.pow(i, 2); i++) {
        this.subProjectorsCount = Math.pow(i + 1, 2);
      }
      this.projectorsCount = Math.min(frameFading + 1, maxProjectorTextures * this.subProjectorsCount);
      const projectorsTextureCount = Math.ceil(this.projectorsCount / this.subProjectorsCount);
      for (let i = 0; i < projectorsTextureCount; i++) {
        this.projectorsTexture[i] = this.ctx.createTexture();
        this.ctx.activeTexture(this.ctx[`TEXTURE${i + 1}`]);
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.projectorsTexture[i]);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR_MIPMAP_LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        if (this.webGLVersion !== 1) {
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAX_LEVEL, 16);
        }
        if (maxAnisotropy) {
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, tfaExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
        }
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
      }
      const vertexShaderSrc = `
      precision lowp float;

      attribute vec2 vPosition;

      attribute vec2 vUV;
      varying vec2 fUV;
      
      void main(void) {
        fUV = vUV;
        gl_Position = vec4(vPosition, 0, 1);
      }
    `.replace(/\n {6}/g, '\n').replace(/ +\n/g, '').replace(/\n+/g, '\n').trim();
      const vertexShader = this.ctx.createShader(this.ctx.VERTEX_SHADER);
      this.ctx.shaderSource(vertexShader, vertexShaderSrc);
      this.ctx.compileShader(vertexShader);
      this.ctx.attachShader(program, vertexShader);
      const fragmentShaderSrc = `
      precision lowp float;
      varying vec2 fUV;
      uniform sampler2D textureSampler[${this.projectorsTexture.length}];
      uniform float fTextureMipmapLevel;
      ${this.projectorsCount > 1 ? `uniform float fTextureOpacity[${this.projectorsCount}];` : ''}
      uniform vec2 fCropOffsetUV;
      uniform vec2 fCropScaleUV;
      uniform sampler2D shadowSampler;
      uniform vec2 fScale;
      uniform vec2 fScaleStep;
      ${this.settings.vibrance !== 100 ? 'uniform float fVibrance;' : ''}

      vec4 multiTexture() {
        vec2 direction = ceil(fUV * 2.) - 1.;
        vec2 iUV = ((direction - fUV) * fScale) / ((direction - .5) * fScaleStep);
        int impreciseI = int(min(iUV[0], iUV[1]));
        for (int preciseI = 0; preciseI < 200; preciseI++) {
          if (preciseI < impreciseI) continue;
          int i = ${this.webGLVersion === 1 ? 'impreciseI' : 'preciseI'};
          vec2 scaledUV = (fUV - .5) * (fScale / (fScale - fScaleStep * vec2(i)));
          vec2 croppedUV = fCropOffsetUV + (scaledUV / fCropScaleUV);
          
          ${(() => {
      if (this.projectorsCount > 1) {
        const subProjectorsDimensionMultiplier = Math.sqrt(this.subProjectorsCount);
        const croppedUvScale = (1 / subProjectorsDimensionMultiplier).toString().padEnd(2, '.');
        return `${new Array(this.subProjectorsCount).fill(undefined).map((_, i) => {
          if (i === 0) return `vec2 uv0 = ${croppedUvScale !== '1.' ? `(croppedUV * ${croppedUvScale})` : 'croppedUV'};`;
          const xIndex = i % subProjectorsDimensionMultiplier;
          const yIndex = Math.floor(i / subProjectorsDimensionMultiplier) % subProjectorsDimensionMultiplier;
          const offsetUVx = (1 / subProjectorsDimensionMultiplier * xIndex).toString().padEnd(2, '.');
          const offsetUVy = (1 / subProjectorsDimensionMultiplier * yIndex).toString().padEnd(2, '.');
          return `vec2 uv${i} = uv0${offsetUVx !== '0.' || offsetUVy !== '0.' ? ` + vec2(${offsetUVx},${offsetUVy})` : ''};`;
        }).join('\n')}`;
      } else {
        return ``;
      }
    })()}

          return ${(() => {
      if (this.projectorsCount > 1) {
        return `${new Array(this.projectorsCount).fill(undefined).map((_, i) => {
          const projectorIndex = Math.floor(i / this.subProjectorsCount);
          const subIndex = i % this.subProjectorsCount;
          return `(fTextureOpacity[${i}] * texture2D(textureSampler[${projectorIndex}], uv${subIndex}, fTextureMipmapLevel))`;
        }).join('\n+ ')};`;
      } else {
        return `texture2D(textureSampler[0], croppedUV, fTextureMipmapLevel);`;
      }
    })()}
        }
        return vec4(0.0, 0.0, 0.0, 1.0);
      }
      
      ${this.settings.vibrance !== 100 ? `
      vec3 rgb2hsv(vec3 c)
      {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      vec3 hsv2rgb(vec3 c)
      {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      float saturate(float c, float v) {
        float x = c;
        if(v < 0.) {
          x = 1. - c;
        }

        float a = 1. + 5. * (1. - abs(v));
        float y = a * a - x * ( (a * a - 1.) / (a * a) ) - (a - x / a) * (a - x / a);
        float d = y - x;
        y = min(1., x + d * 5.);

        if(v >= 0.) {
          return y;
        } else {
          return 1. - y;
        }
      }
      ` : ''}

      void main(void) {
        vec3 ambientlight = multiTexture().rgb;
        float shadowAlpha = texture2D(shadowSampler, fUV).a;
        ${this.settings.vibrance !== 100 ? `
          if(fVibrance != 0.) {
            vec3 ambientlightHSV = rgb2hsv(ambientlight);
            ambientlightHSV[1] = saturate(ambientlightHSV[1], fVibrance);
            ambientlight = hsv2rgb(ambientlightHSV);
          }
        ` : ''}
        gl_FragColor = vec4(ambientlight, 1. - shadowAlpha);
      }
    `.replace(/\n {6}/g, '\n').replace(/ +\n/g, '').replace(/\n+/g, '\n').trim();
      const fragmentShader = this.ctx.createShader(this.ctx.FRAGMENT_SHADER);
      this.ctx.shaderSource(fragmentShader, fragmentShaderSrc);
      this.ctx.compileShader(fragmentShader);
      this.ctx.attachShader(program, fragmentShader);
      if (this.program) {
        try {
          this.ctx.finish();
          this.ctx.deleteProgram(this.program);
        } catch (ex) {
          console.warn('Failed to delete previous ProjectorWebGL program', ex);
        }
        this.program = undefined;
        this.invalidateShaderCache();
      }
      this.ctx.linkProgram(program);
      const parallelShaderCompileExt = syncCompilation ? undefined : this.ctx.getExtension('KHR_parallel_shader_compile');
      if (parallelShaderCompileExt !== null && parallelShaderCompileExt !== void 0 && parallelShaderCompileExt.COMPLETION_STATUS_KHR) {
        let resolveCompilationPromise;
        this.compilationPromise = new Promise(resolve => resolveCompilationPromise = async () => {
          resolveCompilationPromise = undefined;
          await new Promise(resolve => setTimeout(resolve, 0));
          this.compilationPromise = undefined;
          resolve();
        });
        this.ctx.getProgramParameter(program, parallelShaderCompileExt.COMPLETION_STATUS_KHR);
        await new Promise(resolve => requestAnimationFrame(resolve));
        try {
          let compiled = false;
          while (!compiled) {
            const completionStatus = this.ctx.getProgramParameter(program, parallelShaderCompileExt.COMPLETION_STATUS_KHR);
            if (completionStatus === false) {
              await new Promise(resolve => requestIdleCallback(resolve, {
                timeout: 200
              }));
              await new Promise(resolve => requestAnimationFrame(resolve));
            } else {
              compiled = true;
            }
          }
          if (this.cancelCompilation && compiled) {
            try {
              compiled = false;
              this.ctx.deleteProgram(program);
            } catch (ex) {
              console.warn('Failed to delete new ProjectorWebGL program', ex);
            }
          }
          resolveCompilationPromise();
          if (!compiled) return false;
        } catch (ex) {
          try {
            ex.details = {
              program: program === null || program === void 0 ? void 0 : program.toString(),
              webGLVersion: this.webGLVersion,
              majorPerformanceCaveat: this.majorPerformanceCaveat,
              ctxOptions: this.ctxOptions
            };
          } catch (ex) {
            ex.details = {
              detailsException: ex
            };
          }
          resolveCompilationPromise();
          throw ex;
        }
      }
      const vertexShaderCompiled = this.ctx.getShaderParameter(vertexShader, this.ctx.COMPILE_STATUS);
      const fragmentShaderCompiled = this.ctx.getShaderParameter(fragmentShader, this.ctx.COMPILE_STATUS);
      const programLinked = this.ctx.getProgramParameter(program, this.ctx.LINK_STATUS);
      if (!vertexShaderCompiled || !fragmentShaderCompiled || !programLinked) {
        var _programCompilationEr, _programCompilationEr2, _programCompilationEr3, _programCompilationEr4;
        const programCompilationError = new Error('Program compilation failed');
        programCompilationError.name = 'WebGLError';
        programCompilationError.details = {
          webGLVersion: this.webGLVersion,
          ctxOptions: this.ctxOptions
        };
        try {
          programCompilationError.details = {
            ...programCompilationError.details,
            vertexShaderCompiled,
            vertexShaderInfoLog: this.ctx.getShaderInfoLog(vertexShader),
            fragmentShaderCompiled,
            fragmentShaderInfoLog: this.ctx.getShaderInfoLog(fragmentShader),
            programLinked,
            programInfoLog: this.ctx.getProgramInfoLog(program)
          };
        } catch (ex) {
          programCompilationError.details.getCompiledAndLinkedInfoLogsError = ex;
        }
        try {
          this.ctx.validateProgram(program);
          programCompilationError.details.programValidated = this.ctx.getProgramParameter(program, this.ctx.VALIDATE_STATUS);
          programCompilationError.details.programValidationInfoLog = this.ctx.getProgramInfoLog(program);
        } catch (ex) {
          programCompilationError.details.validateProgramError = ex;
        }
        try {
          const ext = this.ctx.getExtension('WEBGL_debug_shaders');
          if (ext) {
            programCompilationError.details.Ωsources = {
              vertexShader: ext.getTranslatedShaderSource(vertexShader),
              fragmentShader: ext.getTranslatedShaderSource(fragmentShader)
            };
            if (!programCompilationError.details.Ωsources.vertexShader) {
              programCompilationError.details.Ωsources.vertexShaderCode = vertexShaderSrc;
            }
            if (!programCompilationError.details.Ωsources.fragmentShader) {
              programCompilationError.details.Ωsources.fragmentShaderCode = fragmentShaderSrc;
            }
          }
        } catch (ex) {
          programCompilationError.details.debugShadersError = ex;
        }
        try {
          const debugRendererInfo = this.ctx.getExtension('WEBGL_debug_renderer_info');
          programCompilationError.details.gpuVendor = debugRendererInfo !== null && debugRendererInfo !== void 0 && debugRendererInfo.UNMASKED_VENDOR_WEBGL ? this.ctx.getParameter(debugRendererInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
          programCompilationError.details.gpuRenderer = debugRendererInfo !== null && debugRendererInfo !== void 0 && debugRendererInfo.UNMASKED_RENDERER_WEBGL ? this.ctx.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        } catch (ex) {
          programCompilationError.details.gpuError = ex;
        }
        if (programCompilationError.details.vertexShaderInfoLog || programCompilationError.details.fragmentShaderInfoLog || programCompilationError.details.getCompiledAndLinkedInfoLogsError || programCompilationError.details.programValidationInfoLog || programCompilationError.details.validateProgramError || (_programCompilationEr = programCompilationError.details.Ωsources) !== null && _programCompilationEr !== void 0 && _programCompilationEr.vertexShader || (_programCompilationEr2 = programCompilationError.details.Ωsources) !== null && _programCompilationEr2 !== void 0 && _programCompilationEr2.vertexShaderCode || (_programCompilationEr3 = programCompilationError.details.Ωsources) !== null && _programCompilationEr3 !== void 0 && _programCompilationEr3.fragmentShader || (_programCompilationEr4 = programCompilationError.details.Ωsources) !== null && _programCompilationEr4 !== void 0 && _programCompilationEr4.fragmentShaderCode || programCompilationError.details.debugShadersError) {
          programCompilationError.name = 'WebGLErrorWithInfoLog';
        }
        throw programCompilationError;
      }
      this.ctx.useProgram(program);
      this.program = program;
      const vUVLoc = this.ctx.getAttribLocation(this.program, 'vUV');
      this.vUVBuffer = this.ctx.createBuffer();
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vUVBuffer);
      this.ctx.vertexAttribPointer(vUVLoc, 2, this.ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      this.ctx.enableVertexAttribArray(vUVLoc);
      const vPositionLoc = this.ctx.getAttribLocation(this.program, 'vPosition');
      this.vPositionBuffer = this.ctx.createBuffer();
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vPositionBuffer);
      this.ctx.vertexAttribPointer(vPositionLoc, 2, this.ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      this.ctx.enableVertexAttribArray(vPositionLoc);
      const shadowSamplerLoc = this.ctx.getUniformLocation(this.program, 'shadowSampler');
      this.ctx.uniform1i(shadowSamplerLoc, 0);
      const textureSamplerLoc = this.ctx.getUniformLocation(this.program, 'textureSampler');
      this.ctx.uniform1iv(textureSamplerLoc, this.projectorsTexture.map((_, i) => 1 + i));
      this.fTextureMipmapLevelLoc = this.ctx.getUniformLocation(this.program, 'fTextureMipmapLevel');
      this.ctx.uniform1f(this.fTextureMipmapLevelLoc, 0);
      if (this.settings.vibrance !== 100) {
        this.fVibranceLoc = this.ctx.getUniformLocation(this.program, 'fVibrance');
        this.ctx.uniform1f(this.fVibranceLoc, 0);
      }
      this.fScaleLoc = this.ctx.getUniformLocation(this.program, 'fScale');
      this.ctx.uniform2fv(this.fScaleLoc, new Float32Array([1, 1]));
      this.fScaleStepLoc = this.ctx.getUniformLocation(this.program, 'fScaleStep');
      this.ctx.uniform2fv(this.fScaleStepLoc, new Float32Array([1, 1]));
      this.fCropOffsetUVLoc = this.ctx.getUniformLocation(this.program, 'fCropOffsetUV');
      this.ctx.uniform2fv(this.fCropOffsetUVLoc, new Float32Array([0, 0]));
      this.fCropScaleUVLoc = this.ctx.getUniformLocation(this.program, 'fCropScaleUV');
      this.ctx.uniform2fv(this.fCropScaleUVLoc, new Float32Array([0, 0]));
      if (this.projectorsCount > 1) {
        this.fTextureOpacityLoc = this.ctx.getUniformLocation(this.program, 'fTextureOpacity');
        this.ctx.uniform1fv(this.fTextureOpacityLoc, new Float32Array(Array(this.projectorsCount).fill(0)));
      }
      this.invalidateShaderCache();
      this.updateCtx();
      return true;
    }
    rescale(scales, lastScale, projectorSize, crop, settings) {
      var _scales$, _scales$2, _scales$3, _scales$4;
      if (this.shadow) {
        this.shadow.rescale(lastScale, projectorSize, settings);
      }
      this.scaleStep = {
        x: ((_scales$ = scales[2]) === null || _scales$ === void 0 ? void 0 : _scales$.x) - ((_scales$2 = scales[1]) === null || _scales$2 === void 0 ? void 0 : _scales$2.x),
        y: ((_scales$3 = scales[2]) === null || _scales$3 === void 0 ? void 0 : _scales$3.y) - ((_scales$4 = scales[1]) === null || _scales$4 === void 0 ? void 0 : _scales$4.y)
      };
      this.scale = lastScale;
      this.scalesLength = scales.length;
      this.crop = crop;
      const width = Math.floor(projectorSize.w * this.scale.x);
      const height = Math.floor(projectorSize.h * this.scale.y);
      if (this.elem) {
        this.elem.width = width;
        this.elem.height = height;
      }
      this.blurCanvasScale = settings.blur2 > 1 ? 2 : 1;
      const blurPx = settings.blur2 * (this.height / 512) * 1.275;
      const blurRadius = 2.64;
      this.blurBound = Math.max(1, Math.ceil(blurPx * blurRadius));
      if (this.blurCanvas) {
        const blurCanvasWidth = width + this.blurBound * 2;
        const blurCanvasHeight = height + this.blurBound * 2;
        const scaledWidth = Math.floor(blurCanvasWidth / this.blurCanvasScale);
        const scaledHeight = Math.floor(blurCanvasHeight / this.blurCanvasScale);
        if (this.blurCanvas.width !== scaledWidth) this.blurCanvas.width = scaledWidth;
        if (this.blurCanvas.height !== scaledHeight) this.blurCanvas.height = scaledHeight;
        this.blurCanvas.style.transform = `scale(${this.scale.x + this.blurBound * 2 / projectorSize.w}, ${this.scale.y + this.blurBound * 2 / projectorSize.h})`;
      }
      if (this.blurCtx) {
        this.blurCtx.filter = `blur(${blurPx / this.blurCanvasScale}px)`;
      }
      this.updateCtx();
    }
    async updateVibrance() {
      const hadVibranceFilter = this.fVibrance !== undefined;
      const hasVibranceFilter = this.settings.vibrance !== 100;
      if (hasVibranceFilter === hadVibranceFilter) return true;
      return await this.initCtx();
    }
    updateCtx() {
      var _this$fScale, _this$scale, _this$fScale2, _this$scale2, _this$fScaleStep, _this$scaleStep, _this$fScaleStep2, _this$scaleStep2;
      if (this.ctxIsInvalid || this.lost) return;
      if (this.settings.vibrance !== 100) {
        let vibrance = this.settings.vibrance / 100 - 1;
        vibrance = (vibrance < 0 ? -1 : 1) * (1 - Math.pow(1 - Math.abs(vibrance), 3));
        const fVibranceChanged = this.fVibrance !== vibrance;
        if (fVibranceChanged) {
          this.fVibrance = vibrance;
          this.ctx.uniform1f(this.fVibranceLoc, this.fVibrance);
        }
      }
      const fScaleChanged = ((_this$fScale = this.fScale) === null || _this$fScale === void 0 ? void 0 : _this$fScale.x) !== ((_this$scale = this.scale) === null || _this$scale === void 0 ? void 0 : _this$scale.x) || ((_this$fScale2 = this.fScale) === null || _this$fScale2 === void 0 ? void 0 : _this$fScale2.y) !== ((_this$scale2 = this.scale) === null || _this$scale2 === void 0 ? void 0 : _this$scale2.y);
      if (fScaleChanged) {
        var _this$fScale3, _this$fScale4;
        this.fScale = this.scale;
        this.ctx.uniform2fv(this.fScaleLoc, new Float32Array([(_this$fScale3 = this.fScale) === null || _this$fScale3 === void 0 ? void 0 : _this$fScale3.x, (_this$fScale4 = this.fScale) === null || _this$fScale4 === void 0 ? void 0 : _this$fScale4.y]));
      }
      const fScaleStepChanged = ((_this$fScaleStep = this.fScaleStep) === null || _this$fScaleStep === void 0 ? void 0 : _this$fScaleStep.x) !== ((_this$scaleStep = this.scaleStep) === null || _this$scaleStep === void 0 ? void 0 : _this$scaleStep.x) || ((_this$fScaleStep2 = this.fScaleStep) === null || _this$fScaleStep2 === void 0 ? void 0 : _this$fScaleStep2.y) !== ((_this$scaleStep2 = this.scaleStep) === null || _this$scaleStep2 === void 0 ? void 0 : _this$scaleStep2.y);
      if (fScaleStepChanged) {
        var _this$fScaleStep3, _this$fScaleStep4;
        this.fScaleStep = this.scaleStep;
        this.ctx.uniform2fv(this.fScaleStepLoc, new Float32Array([(_this$fScaleStep3 = this.fScaleStep) === null || _this$fScaleStep3 === void 0 ? void 0 : _this$fScaleStep3.x, (_this$fScaleStep4 = this.fScaleStep) === null || _this$fScaleStep4 === void 0 ? void 0 : _this$fScaleStep4.y]));
      }
      const crop = this.crop || [0, 0];
      const fCropChanged = crop.some((crop, i) => crop !== (this.fCrop || [undefined, undefined])[i]);
      if (fCropChanged) {
        this.fCrop = crop;
        const fCropScaleUV = crop.map(crop => 1 / (1 - crop * 2));
        const fCropOffsetUV = fCropScaleUV.map((cropScale, i) => crop[i] + 1 / (cropScale * 2));
        this.ctx.uniform2fv(this.fCropOffsetUVLoc, new Float32Array(fCropOffsetUV));
        this.ctx.uniform2fv(this.fCropScaleUVLoc, new Float32Array(fCropScaleUV));
      }
      if (this.projectorsCount > 1) {
        var _this$fTextureOpacity2;
        const fTextureOpacityChanged = this.projectorsCount > 1 && !(((_this$fTextureOpacity2 = this.fTextureOpacity) === null || _this$fTextureOpacity2 === void 0 ? void 0 : _this$fTextureOpacity2.length) === this.projectorsCount);
        if (fTextureOpacityChanged) {
          const easing = x => x * x;
          this.fTextureOpacity = new Array(this.projectorsCount).fill(undefined).map((_, i) => easing((i + 1) / this.projectorsCount)).map((e, i, list) => !i ? e : e - list[i - 1]);
        }
      }
      this.ctx.activeTexture(this.ctx.TEXTURE0);
      this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.ALPHA, this.ctx.ALPHA, this.ctx.UNSIGNED_BYTE, this.shadow.elem);
      this.ctx.activeTexture(this.ctx.TEXTURE1);
      if (!this.viewport || this.viewport.width !== this.ctx.drawingBufferWidth || this.viewport.height !== this.ctx.drawingBufferHeight) {
        this.viewport = {
          width: this.ctx.drawingBufferWidth,
          height: this.ctx.drawingBufferHeight
        };
        this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight);
      }
      if (!this.cropped) {
        this.updateCrop();
      }
      if (!this.vPosition || !this.vUV) {
        this.updatePositionAndUvCoordinates();
      }
    }
    updateCrop() {
      var _this$ambientlight, _videoRect, _videoRect2;
      if (this.ctxIsInvalid || this.lost || !this.blurCanvas || !((_this$ambientlight = this.ambientlight) !== null && _this$ambientlight !== void 0 && _this$ambientlight.videoContainerElem)) return;
      const videoBoundingElem = this.ambientlight.shouldStyleVideoParentElem ? this.ambientlight.videoContainerElem : this.ambientlight.videoElem;
      if (!videoBoundingElem) return;
      let videoRect = videoBoundingElem.getBoundingClientRect();
      if (!((_videoRect = videoRect) !== null && _videoRect !== void 0 && _videoRect.width) || !((_videoRect2 = videoRect) !== null && _videoRect2 !== void 0 && _videoRect2.height)) return;
      const canvasRect = this.blurCanvas.getBoundingClientRect();
      if (!(canvasRect !== null && canvasRect !== void 0 && canvasRect.width) || !(canvasRect !== null && canvasRect !== void 0 && canvasRect.height)) return;
      const blurScale = canvasRect.height / this.blurCanvas.height;
      const blurSize = this.blurBound * blurScale;
      const windowRect = {
        left: -blurSize,
        top: -window.scrollY - blurSize,
        right: window.innerWidth + blurSize,
        bottom: window.innerHeight + blurSize
      };
      const canvasRectCenter = {
        x: canvasRect.left + canvasRect.width / 2,
        y: canvasRect.top + canvasRect.height / 2
      };
      const cropRect = {
        left: Math.max(canvasRect.left, windowRect.left),
        top: Math.max(canvasRect.top, windowRect.top),
        right: Math.min(canvasRect.right, windowRect.right),
        bottom: Math.min(canvasRect.bottom, windowRect.bottom + (this.settings.fixedPosition ? 0 : 100))
      };
      const cropPerc = {
        left: (canvasRectCenter.x - cropRect.left) / (canvasRectCenter.x - canvasRect.left),
        top: (canvasRectCenter.y - cropRect.top) / (canvasRectCenter.y - canvasRect.top),
        right: (cropRect.right - canvasRectCenter.x) / (canvasRect.right - canvasRectCenter.x),
        bottom: this.atTop || this.settings.fixedPosition ? (cropRect.bottom - canvasRectCenter.y) / (canvasRect.bottom - canvasRectCenter.y) : 1
      };
      const crop = {
        t: Math.max(0, cropPerc.top.toFixed(4)),
        r: Math.max(0, cropPerc.right.toFixed(4)),
        b: -Math.max(0, cropPerc.bottom.toFixed(4)),
        l: -Math.max(0, cropPerc.left.toFixed(4))
      };
      videoRect = this.settings.fixedPosition && !this.atTop ? {
        left: canvasRectCenter.x,
        top: canvasRectCenter.y,
        right: canvasRectCenter.x,
        bottom: canvasRectCenter.y
      } : {
        left: videoRect.left + blurSize,
        top: videoRect.top + blurSize,
        right: videoRect.right - blurSize,
        bottom: videoRect.bottom - blurSize
      };
      const cutPerc = {
        left: (canvasRectCenter.x - videoRect.left) / (canvasRectCenter.x - canvasRect.left),
        top: (canvasRectCenter.y - videoRect.top) / (canvasRectCenter.y - canvasRect.top),
        right: (videoRect.right - canvasRectCenter.x) / (canvasRect.right - canvasRectCenter.x),
        bottom: (videoRect.bottom - canvasRectCenter.y) / (canvasRect.bottom - canvasRectCenter.y)
      };
      const cut = {
        t: Math.min(Math.max(0, cutPerc.top.toFixed(4)), crop.t),
        r: Math.min(Math.max(0, cutPerc.right.toFixed(4)), crop.r),
        b: -Math.min(Math.max(0, cutPerc.bottom.toFixed(4)), -crop.b),
        l: -Math.min(Math.max(0, cutPerc.left.toFixed(4)), -crop.l)
      };
      this.updatePositionAndUvCoordinates(crop, cut);
      this.cropped = true;
    }
    updatePositionAndUvCoordinates(crop = {
      t: 1,
      r: 1,
      b: -1,
      l: -1
    }, cut = {
      t: 0,
      r: 0,
      b: 0,
      l: 0
    }) {
      const vPosition = [crop.l, crop.b, crop.r, crop.b, cut.r, cut.b, crop.l, crop.b, cut.r, cut.b, cut.l, cut.b, crop.r, crop.t, crop.r, crop.b, cut.r, cut.t, crop.r, crop.b, cut.r, cut.b, cut.r, cut.t, crop.l, crop.t, cut.r, cut.t, cut.l, cut.t, crop.l, crop.t, crop.r, crop.t, cut.r, cut.t, crop.l, crop.t, crop.l, crop.b, cut.l, cut.t, crop.l, crop.b, cut.l, cut.b, cut.l, cut.t];
      if (JSON.stringify(this.vPosition) === JSON.stringify(vPosition)) return;
      this.vPosition = vPosition;
      this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vPositionBuffer);
      this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(this.vPosition), this.ctx.STATIC_DRAW);
      this.vUV = this.vPosition.map((p, i) => ((i % 2 == 0 ? p : -p) + 1) / 2);
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vUVBuffer);
      this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(this.vUV), this.ctx.STATIC_DRAW);
    }
    clearRect() {
      var _this$shadow2;
      this.invalidateShaderCache();
      if ((_this$shadow2 = this.shadow) !== null && _this$shadow2 !== void 0 && _this$shadow2.elem) {
        this.shadow.elem.width = 1;
      }
      if (this.ctx && !this.ctx.isContextLost() && this.program) {
        this.ctx.activeTexture(this.ctx.TEXTURE0);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        for (let i = 0; i < this.projectorsTexture.length; i++) {
          this.ctx.activeTexture(this.ctx[`TEXTURE${i + 1}`]);
          this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
          this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        }
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
      }
      if (this.blurCtx && (!this.blurCtx.isContextLost || !this.blurCtx.isContextLost())) {
        this.blurCtx.clearRect(0, 0, this.blurCanvas.width, this.blurCanvas.height);
      }
    }
    get ctxIsInvalid() {
      const invalid = !this.ctx || this.ctx.isContextLost() || !this.program || !this.blurCtx || this.blurCtx.isContextLost && this.blurCtx.isContextLost();
      if (invalid && !this.ctxIsInvalidWarned && !this.program) {
        this.ctxIsInvalidWarned = true;
        console.log(`ProjectorWebGL context is lost`);
      }
      return invalid;
    }
  }
  ProjectorWebGL.subProjectorDimensionMax = 3;

  class WebGLOffscreenCanvas {
    constructor(width, height, ambientlight, settings) {
      if (typeof OffscreenCanvas !== 'undefined') {
        this.canvas = new OffscreenCanvas(width, height);
      } else {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
      }
      this.canvas._getContext = this.canvas.getContext;
      this.canvas.getContext = async (type, options = {}) => {
        if (type === '2d') {
          this.canvas.ctx = this.ctx = this.canvas.ctx || (await new WebGLContext(this.canvas, type, options, ambientlight, settings));
        } else {
          this.canvas.ctx = this.ctx = this.canvas._getContext(type, options);
        }
        return this.ctx;
      };
      return this.canvas;
    }
  }
  class WebGLContext {
    constructor(canvas, type, options, ambientlight, settings) {
      this.lostCount = 0;
      this.webglcontextcreationerrors = [];
      this.clearRect = () => {
        if (this.ctxIsInvalid || this.lost) return;
        this.ctx.activeTexture(this.ctx['TEXTURE0']);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
        this.clearPreviousRect();
      };
      this.clearPreviousRect = () => {
        if (!this.settings.flickerReduction || !this.fPreviousClearedLoc || this.fPreviousCleared === 1) return;
        this.ctx.activeTexture(this.ctx['TEXTURE1']);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        this.ctx.activeTexture(this.ctx['TEXTURE0']);
        this.ctx.uniform1f(this.fPreviousClearedLoc, 1);
        this.fPreviousCleared = 1;
      };
      this.defaultScale = new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]);
      this._cachedScale = new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]);
      this._cachedScaleX = 1;
      this._cachedScaleY = 1;
      this.drawImage = (src, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight) => {
        if (this.ctxIsInvalid || this.lost) return;
        const internalFormat = this.ctx.RGBA;
        const format = this.ctx.RGBA;
        const formatType = this.ctx.UNSIGNED_BYTE;
        if (destX === undefined) {
          destX = srcX;
          destWidth = srcWidth;
          destHeight = srcHeight;
          srcX = 0;
          srcY = 0;
          srcWidth = undefined;
          srcHeight = undefined;
        }
        srcWidth = srcWidth || src.videoWidth || src.width;
        srcHeight = srcHeight || src.videoHeight || src.height;
        destWidth = destWidth || this.ctx.drawingBufferWidth;
        destHeight = destHeight || this.ctx.drawingBufferHeight;
        const scaleX = 1 + srcX / srcWidth * 2;
        const scaleY = 1 + srcY / srcHeight * 2;
        if (scaleX !== this.scaleX || scaleY !== this.scaleY) {
          this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.getCachedScale(scaleX, scaleY), this.ctx.STATIC_DRAW);
          this.scaleX = scaleX;
          this.scaleY = scaleY;
        }
        const resolutionChanged = !this.viewport || this.viewport.width !== destWidth || this.viewport.height !== destHeight;
        if (resolutionChanged) {
          this.ctx.viewport(0, 0, destWidth, destHeight);
          this.viewport = {
            width: destWidth,
            height: destHeight
          };
        }
        const mipmapLevel = 1;
        if (mipmapLevel !== this.fMipmapLevel) {
          this.fMipmapLevel = mipmapLevel;
          this.ctx.uniform1f(this.fMipmapLevelLoc, mipmapLevel);
        }
        let start = this.settings.showResolutions ? performance.now() : undefined;
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, internalFormat, format, formatType, src);
        if (this.webGLVersion !== 1) {
          this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        }
        if (this.settings.showResolutions) this.loadTime = performance.now() - start;
        if (this.settings.showResolutions) start = performance.now();
        this.ctx.drawArrays(this.ctx.TRIANGLE_FAN, 0, 4);
        if (this.settings.flickerReduction && this.fPreviousClearedLoc && this.fPreviousCleared === 1) {
          this.fPreviousCleared = 0;
          this.ctx.uniform1f(this.fPreviousClearedLoc, 0);
        }
        if (this.settings.flickerReduction) {
          this.ctx.activeTexture(this.ctx['TEXTURE1']);
          this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, internalFormat, format, formatType, this.canvas);
          if (this.webGLVersion !== 1) {
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
          }
          this.ctx.activeTexture(this.ctx['TEXTURE0']);
        }
        if (resolutionChanged) {
          this.checkForDrawErrors();
        }
        if (this.settings.showResolutions) this.drawTime = performance.now() - start;
      };
      this.drawErrors = [];
      this.checkForDrawErrors = () => {
        var _this$program;
        const webGLError = this.ctx.getError();
        if (webGLError === this.ctx.NO_ERROR) {
          this.drawErrors.length = 0;
          this.setWarning('');
          return;
        }
        this.viewport = undefined;
        const error = new AmbientlightError(`WebGL error: ${webGLErrorToString(webGLError)}`, {
          program: (_this$program = this.program) === null || _this$program === void 0 ? void 0 : _this$program.toString(),
          webGLVersion: this.webGLVersion,
          ctxOptions: this.ctxOptions
        });
        error.name = 'WebGLDrawError';
        this.drawErrors.push(error);
        if (this.drawErrors.length < 3) {
          console.warn(error);
          this.ambientlight.setDrawWarning(error);
          return;
        }
        error.details.previousErrors = this.drawErrors.slice(0, -1);
        throw error;
      };
      this.getImageDataBuffers = [];
      this.getImageDataBuffersIndex = 0;
      this.getImageData = (x = 0, y = 0, width = this.ctx.drawingBufferWidth, height = this.ctx.drawingBufferHeight) => {
        if (this.ctxIsInvalid || this.lost) return;
        if (this.getImageDataBuffersIndex > 9) {
          this.getImageDataBuffersIndex = 0;
        } else {
          this.getImageDataBuffersIndex++;
        }
        let buffer = this.getImageDataBuffers[this.getImageDataBuffersIndex];
        const bufferLength = width * height * 4;
        if (!buffer) {
          this.getImageDataBuffers[this.getImageDataBuffersIndex] = buffer = {
            data: new Uint8Array(bufferLength)
          };
        } else if (buffer.data.length !== bufferLength) {
          buffer.data = new Uint8Array(bufferLength);
        }
        buffer.width = width - x;
        buffer.height = height - y;
        this.ctx.readPixels(x, y, width, height, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, buffer.data);
        return buffer;
      };
      this.isContextLost = () => {
        return !this.ctx || this.ctx.isContextLost();
      };
      return async function WebGLContextConstructor() {
        this.ambientlight = ambientlight;
        this.settings = settings;
        this.setWarning = settings.setWarning;
        this.canvas = canvas;
        this.canvas.addEventListener('webglcontextlost', wrapErrorHandler(function webGLContextLost(event) {
          event.preventDefault();
          this.lost = true;
          this.lostCount++;
          this.viewport = undefined;
          this.scaleX = undefined;
          this.scaleY = undefined;
          this.program = undefined;
          console.log(`WebGLContext lost (${this.lostCount})`);
          this.setWebGLWarning('restore');
        }.bind(this)), false);
        this.canvas.addEventListener('webglcontextrestored', wrapErrorHandler(async function webGLContextRestored() {
          if (this.lostCount >= 3) {
            console.error('WebGLContext was lost 3 times. The current restoration has been aborted to prevent an infinite restore loop.');
            this.setWebGLWarning('3 times restore');
            return;
          }
          await new Promise(resolve => requestAnimationFrame(resolve));
          if (!(await this.initCtx())) return;
          if (this.ctx && !this.ctx.isContextLost()) {
            var _this$ambientlight$pr, _this$ambientlight$pr2;
            this.lost = false;
            if (!((_this$ambientlight$pr = this.ambientlight.projector) !== null && _this$ambientlight$pr !== void 0 && _this$ambientlight$pr.lost) && !((_this$ambientlight$pr2 = this.ambientlight.projector) !== null && _this$ambientlight$pr2 !== void 0 && _this$ambientlight$pr2.blurLost)) this.setWarning('');
          } else {
            console.error(`WebGLContext restore failed (${this.lostCount})`);
            this.setWebGLWarning('restore');
          }
        }.bind(this)), false);
        this.canvas.addEventListener('webglcontextcreationerror', wrapErrorHandler(function webGLContextCreationError(e) {
          this.webglcontextcreationerrors.push({
            message: e.statusMessage || '?',
            time: performance.now(),
            webGLVersion: this.webGLVersion
          });
        }.bind(this)), false);
        this.options = options;
        await this.initCtx();
        this.initializedTime = performance.now();
        return this;
      }.bind(this)();
    }
    setWebGLWarning(action = 'restore') {
      this.setWarning(`Failed to ${action} the WebGL renderer from a GPU crash.${canvasWebGLCrashTips}`);
    }
    async initCtx(syncCompilation = false) {
      if (this.program) {
        try {
          this.ctx.finish();
          this.ctx.deleteProgram(this.program);
        } catch (ex) {
          console.warn('Failed to delete previous WebGLContext program', ex);
        }
        this.program = undefined;
      }
      if (!this.ctx) {
        this.ctxOptions = {
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          depth: false,
          antialias: false,
          desynchronized: true,
          ...this.options
        };
        this.webGLVersion = 2;
        this.ctx = await this.canvas.getContext('webgl2', this.ctxOptions);
        if (!this.ctx) {
          this.webGLVersion = 1;
          this.ctx = await this.canvas.getContext('webgl', this.ctxOptions);
          if (!this.ctx) {
            this.webGLVersion = undefined;
            await new Promise(resolve => setTimeout(resolve, 1000));
            const errors = this.webglcontextcreationerrors;
            this.webglcontextcreationerrors = [];
            let lastErrorMessage = '';
            for (const error of errors) {
              const duplicate = error.message === lastErrorMessage;
              lastErrorMessage = error.message;
              if (duplicate) error.message = '"';
            }
            throw new AmbientlightError(`WebGLContext creation failed: ${lastErrorMessage}`, errors);
          }
        }
      }
      if (this.isContextLost()) return;
      if ('drawingBufferColorSpace' in this.ctx && 'unpackColorSpace' in this.ctx) {
        this.ctx.drawingBufferColorSpace = ctxOptions.colorSpace;
      }
      let flickerReductionDifference;
      if (this.settings.flickerReduction) {
        flickerReductionDifference = (118 - this.settings.flickerReduction) / 118;
      }
      const vertexShaderSrc = `
      precision lowp float;
      attribute vec2 vPosition;
      attribute vec2 vUV;
      varying vec2 fUV;
      
      void main(void) {
        fUV = vUV;
        gl_Position = vec4(vPosition, 0, 1);
      }
    `.replace(/\n {6}/g, '\n').replace(/ +\n/g, '').replace(/\n+/g, '\n').trim();
      const fragmentShaderSrc = `
      precision lowp float;
      varying vec2 fUV;
      uniform sampler2D textureSampler[${this.settings.flickerReduction ? 2 : 1}];
      uniform float fMipmapLevel;
      ${this.settings.flickerReduction ? 'uniform float fPreviousCleared;' : ''}
      
      void main(void) {
        ${this.settings.flickerReduction ? `
        vec4 currentColor = texture2D(textureSampler[0], fUV${this.webGLVersion !== 1 ? ', fMipmapLevel' : ''});
        if(fPreviousCleared < .5) {
          vec4 previousColor = texture2D(textureSampler[1], fUV${this.webGLVersion !== 1 ? ', fMipmapLevel' : ''});
          
          float difference = abs(
            (currentColor.r * .213 + currentColor.g * .715 + currentColor.b * .072) - 
            (previousColor.r * .213 + previousColor.g * .715 + previousColor.b * .072)
          );
          float percentage = 1.;
          percentage = min(1., (1. - (difference * difference * difference)) * ${flickerReductionDifference.toFixed(3)});
          gl_FragColor = currentColor * percentage + previousColor * (1. - percentage);
          return;
        }
        ` : ''}
        gl_FragColor = texture2D(textureSampler[0], fUV${this.webGLVersion !== 1 ? ', fMipmapLevel' : ''});
      }
    `.replace(/\n {6}/g, '\n').replace(/ +\n/g, '').replace(/\n+/g, '\n').trim();
      const vertexShader = this.ctx.createShader(this.ctx.VERTEX_SHADER);
      const fragmentShader = this.ctx.createShader(this.ctx.FRAGMENT_SHADER);
      this.ctx.shaderSource(vertexShader, vertexShaderSrc);
      this.ctx.shaderSource(fragmentShader, fragmentShaderSrc);
      this.ctx.compileShader(vertexShader);
      this.ctx.compileShader(fragmentShader);
      const program = this.ctx.createProgram();
      this.ctx.attachShader(program, vertexShader);
      this.ctx.attachShader(program, fragmentShader);
      this.ctx.linkProgram(program);
      const parallelShaderCompileExt = syncCompilation ? undefined : this.ctx.getExtension('KHR_parallel_shader_compile');
      if (parallelShaderCompileExt !== null && parallelShaderCompileExt !== void 0 && parallelShaderCompileExt.COMPLETION_STATUS_KHR) {
        this.ctx.getProgramParameter(program, parallelShaderCompileExt.COMPLETION_STATUS_KHR);
        await new Promise(resolve => requestAnimationFrame(resolve));
        try {
          let compiled = false;
          while (!compiled) {
            const completionStatus = this.ctx.getProgramParameter(program, parallelShaderCompileExt.COMPLETION_STATUS_KHR);
            if (completionStatus === false) {
              await new Promise(resolve => requestIdleCallback(resolve, {
                timeout: 200
              }));
              await new Promise(resolve => requestAnimationFrame(resolve));
            } else {
              compiled = true;
            }
          }
          if (!compiled) return;
        } catch (ex) {
          ex.details = {};
          try {
            ex.details = {
              program: program === null || program === void 0 ? void 0 : program.toString(),
              webGLVersion: this.webGLVersion,
              ctxOptions: this.ctxOptions
            };
          } catch (ex) {
            ex.details = {
              detailsException: ex
            };
          }
          throw ex;
        }
      }
      const vertexShaderCompiled = this.ctx.getShaderParameter(vertexShader, this.ctx.COMPILE_STATUS);
      const fragmentShaderCompiled = this.ctx.getShaderParameter(fragmentShader, this.ctx.COMPILE_STATUS);
      const programLinked = this.ctx.getProgramParameter(program, this.ctx.LINK_STATUS);
      if (!vertexShaderCompiled || !fragmentShaderCompiled || !programLinked) {
        var _programCompilationEr, _programCompilationEr2, _programCompilationEr3, _programCompilationEr4;
        const programCompilationError = new Error('Program compilation failed');
        programCompilationError.name = 'WebGLError';
        programCompilationError.details = {
          webGLVersion: this.webGLVersion,
          ctxOptions: this.ctxOptions
        };
        try {
          programCompilationError.details = {
            ...programCompilationError.details,
            vertexShaderCompiled,
            vertexShaderInfoLog: this.ctx.getShaderInfoLog(vertexShader),
            fragmentShaderCompiled,
            fragmentShaderInfoLog: this.ctx.getShaderInfoLog(fragmentShader),
            programLinked,
            programInfoLog: this.ctx.getProgramInfoLog(program)
          };
        } catch (ex) {
          programCompilationError.details.getCompiledAndLinkedInfoLogsError = ex;
        }
        try {
          this.ctx.validateProgram(program);
          programCompilationError.details.programValidated = this.ctx.getProgramParameter(program, this.ctx.VALIDATE_STATUS);
          programCompilationError.details.programValidationInfoLog = this.ctx.getProgramInfoLog(program);
        } catch (ex) {
          programCompilationError.details.validateProgramError = ex;
        }
        try {
          const ext = this.ctx.getExtension('WEBGL_debug_shaders');
          if (ext) {
            programCompilationError.details.Ωsources = {
              vertexShader: ext.getTranslatedShaderSource(vertexShader),
              fragmentShader: ext.getTranslatedShaderSource(fragmentShader)
            };
            if (!programCompilationError.details.Ωsources.vertexShader) {
              programCompilationError.details.Ωsources.vertexShaderCode = vertexShaderSrc;
            }
            if (!programCompilationError.details.Ωsources.fragmentShader) {
              programCompilationError.details.Ωsources.fragmentShaderCode = fragmentShaderSrc;
            }
          }
        } catch (ex) {
          programCompilationError.details.debugShadersError = ex;
        }
        try {
          const debugRendererInfo = this.ctx.getExtension('WEBGL_debug_renderer_info');
          programCompilationError.details.gpuVendor = debugRendererInfo !== null && debugRendererInfo !== void 0 && debugRendererInfo.UNMASKED_VENDOR_WEBGL ? this.ctx.getParameter(debugRendererInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
          programCompilationError.details.gpuRenderer = debugRendererInfo !== null && debugRendererInfo !== void 0 && debugRendererInfo.UNMASKED_RENDERER_WEBGL ? this.ctx.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        } catch (ex) {
          programCompilationError.details.gpuError = ex;
        }
        if (programCompilationError.details.vertexShaderInfoLog || programCompilationError.details.fragmentShaderInfoLog || programCompilationError.details.getCompiledAndLinkedInfoLogsError || programCompilationError.details.programValidationInfoLog || programCompilationError.details.validateProgramError || (_programCompilationEr = programCompilationError.details.Ωsources) !== null && _programCompilationEr !== void 0 && _programCompilationEr.vertexShader || (_programCompilationEr2 = programCompilationError.details.Ωsources) !== null && _programCompilationEr2 !== void 0 && _programCompilationEr2.vertexShaderCode || (_programCompilationEr3 = programCompilationError.details.Ωsources) !== null && _programCompilationEr3 !== void 0 && _programCompilationEr3.fragmentShader || (_programCompilationEr4 = programCompilationError.details.Ωsources) !== null && _programCompilationEr4 !== void 0 && _programCompilationEr4.fragmentShaderCode || programCompilationError.details.debugShadersError) {
          programCompilationError.name = 'WebGLErrorWithInfoLog';
        }
        throw programCompilationError;
      }
      this.ctx.useProgram(program);
      this.program = program;
      this.fMipmapLevelLoc = this.ctx.getUniformLocation(this.program, 'fMipmapLevel');
      const vUVBuffer = this.ctx.createBuffer();
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, vUVBuffer);
      this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), this.ctx.STATIC_DRAW);
      const vUVLoc = this.ctx.getAttribLocation(this.program, 'vUV');
      this.ctx.vertexAttribPointer(vUVLoc, 2, this.ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      this.ctx.enableVertexAttribArray(vUVLoc);
      const vPositionBuffer = this.ctx.createBuffer();
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, vPositionBuffer);
      this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), this.ctx.STATIC_DRAW);
      const vPositionLoc = this.ctx.getAttribLocation(this.program, 'vPosition');
      this.ctx.vertexAttribPointer(vPositionLoc, 2, this.ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      this.ctx.enableVertexAttribArray(vPositionLoc);
      this.textures = [];
      for (let i = 0; i < (this.settings.flickerReduction ? 2 : 1); i++) {
        const texture = this.ctx.createTexture();
        this.ctx.activeTexture(this.ctx[`TEXTURE${i}`]);
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
        if (this.webGLVersion == 1) {
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        } else {
          this.ctx.hint(this.ctx.GENERATE_MIPMAP_HINT, this.ctx.NICEST);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAX_LEVEL, 8);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR_MIPMAP_LINEAR);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.MIRRORED_REPEAT);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.MIRRORED_REPEAT);
        }
        const tfaExt = this.ctx.getExtension('EXT_texture_filter_anisotropic') || this.ctx.getExtension('MOZ_EXT_texture_filter_anisotropic') || this.ctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (tfaExt) {
          const max = this.ctx.getParameter(tfaExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1;
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, tfaExt.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, max));
        }
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        this.textures.push(texture);
      }
      this.ctx.activeTexture(this.ctx['TEXTURE0']);
      const textureSamplerLoc = this.ctx.getUniformLocation(this.program, 'textureSampler');
      this.ctx.uniform1iv(textureSamplerLoc, this.textures.map((_, i) => i));
      if (this.settings.flickerReduction) {
        this.fPreviousClearedLoc = this.ctx.getUniformLocation(this.program, 'fPreviousCleared');
        this.ctx.uniform1f(this.fPreviousClearedLoc, 1);
        this.fPreviousCleared = 1;
      } else {
        this.fPreviousClearedLoc = undefined;
        this.fPreviousCleared = undefined;
      }
      return true;
    }
    getCachedScale(x, y) {
      if (this._cachedScaleX !== x || this._cachedScaleY !== y) {
        this._cachedScale = new Float32Array([-x, y, -x, -y, x, -y, x, y]);
        this._cachedScaleX = x;
        this._cachedScaleY = y;
      }
      return this._cachedScale;
    }
    get ctxIsInvalid() {
      const invalid = this.isContextLost() || !this.program;
      if (invalid && !this.ctxIsInvalidWarned && !this.program) {
        this.ctxIsInvalidWarned = true;
        console.log('WebGLContext is lost');
      }
      return invalid;
    }
  }

  const workerCode = function () {
    class SafeOffscreenCanvas {
      constructor(width, height, pixelated) {
        if (typeof OffscreenCanvas !== 'undefined') {
          return new OffscreenCanvas(width, height);
        } else {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          if (pixelated) {
            canvas.style.imageRendering = 'pixelated';
          }
          return canvas;
        }
      }
    }
    let canvas;
    let ctx;
    const getStoryboardPageImageDatas = async (storyboard, page) => {
      const url = storyboard.baseUrl.replace('$M', page);
      const response = await fetch(url);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      if (!canvas) {
        canvas = new SafeOffscreenCanvas(bitmap.width, bitmap.height);
        ctx = canvas.getContext('2d', {
          willReadFrequently: true
        });
      } else if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
      }
      ctx.drawImage(bitmap, 0, 0);
      const imageDatas = [];
      for (let yi = 0; yi < storyboard.y; yi++) {
        for (let xi = 0; xi < storyboard.x; xi++) {
          const i = storyboard.x * storyboard.y * page + storyboard.x * yi + xi;
          if (i >= storyboard.images) break;
          imageDatas.push(ctx.getImageData(xi * storyboard.width, yi * storyboard.height, storyboard.width, storyboard.height));
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return imageDatas;
    };
    const getImageDataDifference = (image1, image2) => {
      const diffs = [];
      for (let i = 0; i < image1.data.length; i += 4) {
        diffs.push(0.2126 * Math.max(0, Math.abs(image1.data[i] / 255 - image2.data[i] / 255) - 0.03) + 0.7152 * Math.max(0, Math.abs(image1.data[i + 1] / 255 - image2.data[i + 1] / 255) - 0.03) + 0.0722 * Math.max(0, Math.abs(image1.data[i + 2] / 255 - image2.data[i + 2] / 255) - 0.03));
      }
      let diffSum = 0;
      for (let diff of diffs) {
        diffSum += diff;
      }
      const diff = diffSum / diffs.length;
      return diff;
    };
    const getStoryboardPageDifferences = imageDatas => {
      const diffs = [];
      for (let i = 1; i < imageDatas.length; i++) {
        diffs.push(getImageDataDifference(imageDatas[i - 1], imageDatas[i]));
      }
      return diffs;
    };
    const getAverageVideoFramesDifference = async storyboard => {
      let pages = (storyboard.images - 1) / (storyboard.x * storyboard.y);
      if (pages > 3) {
        if (pages % Math.floor(pages) >= 0.67) pages -= 1;
        pages = Math.floor(pages);
      } else {
        pages = Math.ceil(pages);
      }
      const secondPage = pages > 3 ? Math.min(1, pages) : 0;
      const middlePage = Math.floor((pages - 1) / 2);
      const secondlastPage = pages > 4 ? pages - 2 : pages - 1;
      const secondPageImageDatasPromise = getStoryboardPageImageDatas(storyboard, secondPage);
      const middlePageImageDatasPromise = middlePage > secondPage && middlePage < secondlastPage ? getStoryboardPageImageDatas(storyboard, middlePage) : [];
      const secondlastPageImageDatasPromise = secondlastPage >= middlePage ? getStoryboardPageImageDatas(storyboard, secondlastPage) : [];
      const secondPageImageDatas = await secondPageImageDatasPromise;
      const middlePageImageDatas = await middlePageImageDatasPromise;
      const secondlastPageImageDatas = await secondlastPageImageDatasPromise;
      const imageDatas = [...secondPageImageDatas, ...middlePageImageDatas, ...secondlastPageImageDatas];
      const differences = getStoryboardPageDifferences(imageDatas);
      const averageDifference = differences.reduce((diffs, diff) => diffs + diff, 0) / differences.length;
      return averageDifference;
    };
    this.onmessage = async e => {
      if (e.data === false) {
        this.postMessage(false);
        return;
      }
      const id = e.data.id;
      const baseUrl = e.data.storyboard.baseUrl;
      try {
        const difference = await getAverageVideoFramesDifference(e.data.storyboard);
        this.postMessage({
          id,
          baseUrl,
          difference
        });
      } catch (ex) {
        this.postMessage({
          id,
          baseUrl,
          error: ex
        });
      }
    };
  };
  const getStoryboard = format => {
    const [baseUrl, _1, _2, sb] = format.split('|').map(i => i === null || i === void 0 ? void 0 : i.split('#'));
    if (!(baseUrl !== null && baseUrl !== void 0 && baseUrl.length) || !((sb === null || sb === void 0 ? void 0 : sb.length) > 7)) return;
    const decodedBaseUrl = `${baseUrl[0].replace('$L', '2').replace('$N', sb[6])}&sigh=${decodeURIComponent(sb[7])}`;
    const width = Math.round(parseInt(sb[0], 10) / 10) * 10;
    const height = Math.round(parseInt(sb[1], 10) / 10) * 10;
    return {
      baseUrl: decodedBaseUrl,
      width,
      height,
      images: parseInt(sb[2], 10),
      x: parseInt(sb[3], 10),
      y: parseInt(sb[4], 10)
    };
  };
  let worker;
  let workerMessageId = 0;
  let lastDifference = {
    baseUrl: undefined,
    value: 1
  };
  let onMessagePromise;
  let nextGetIsWaiting = false;
  const getAverageVideoFramesDifference = async format => {
    if (onMessagePromise) {
      nextGetIsWaiting = true;
      while (onMessagePromise) {
        await onMessagePromise;
      }
      nextGetIsWaiting = false;
    }
    const storyboard = await getStoryboard(format);
    if (!storyboard) return;
    const alreadyCalculated = lastDifference.baseUrl === storyboard.baseUrl;
    if (alreadyCalculated) return lastDifference.value;
    if (!worker) {
      worker = await workerFromCode(workerCode);
    }
    workerMessageId++;
    const id = workerMessageId;
    const stack = new Error().stack;
    onMessagePromise = new Promise(function onMessagePromise(resolve, reject) {
      worker.onerror = err => {
        if (!(err instanceof Error)) {
          const details = err;
          err = new Error(`static-image-detection-worker.js: ${err.message ?? 'Unknown error'}`);
          err.details = details;
        }
        reject(err);
      };
      worker.onmessage = function onMessage(e) {
        try {
          if (e.data.id !== workerMessageId) return;
          if (e.data.error) {
            var _e$data$error$stack;
            if ((_e$data$error$stack = e.data.error.stack) !== null && _e$data$error$stack !== void 0 && _e$data$error$stack.replace) {
              var _e$data$error$stack2;
              e.data.error.stack = (_e$data$error$stack2 = e.data.error.stack) === null || _e$data$error$stack2 === void 0 ? void 0 : _e$data$error$stack2.replace(/blob:.+?:\/.+?:/g, 'extension://scripts/static-image-detection-worker.js:');
            }
            appendErrorStack(stack, e.data.error);
            throw e.data.error;
          }
          lastDifference = {
            baseUrl: e.data.baseUrl,
            value: e.data.difference
          };
          resolve(e.data.difference);
        } catch (ex) {
          reject(ex);
        }
      }.bind(this);
    }.bind(window));
    worker.postMessage({
      id,
      storyboard
    });
    const difference = await onMessagePromise;
    onMessagePromise = undefined;
    return nextGetIsWaiting ? undefined : difference;
  };
  const cancelGetAverageVideoFramesDifference = () => {
    workerMessageId++;
  };

  const origin = 'https://www.youtube.com';
  const extensionId = 'youtube-ambient-light-extension';
  const isSameWindowMessage = event => event.source === window && event.origin === origin;

  class InjectedScript {
    constructor() {
      this.globalListener = void 0;
      this.listeners = [];
      this.addMessageListener = (type, handler) => {
        if (!this.globalListener) {
          this.globalListener = wrapErrorHandler(function injectedScriptMessageListenerGlobal(event) {
            if (!event.detail || typeof event.detail !== 'string') return;
            const detail = JSON.parse(event.detail);
            if (!isSameWindowMessage || (detail === null || detail === void 0 ? void 0 : detail.injectedScript) !== extensionId || !(detail !== null && detail !== void 0 && detail.type)) return;
            for (const listener of this.listeners) {
              listener(detail);
            }
          }.bind(this), true);
          document.addEventListener('ytal-message', this.globalListener);
        }
        const listener = wrapErrorHandler(function injectedScriptMessageListener(detail) {
          if (detail.type !== type) return;
          handler(detail === null || detail === void 0 ? void 0 : detail.message);
        }.bind(this), true);
        this.listeners.push(listener);
        return listener;
      };
      this.removeMessageListener = listener => {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
        if (this.globalListener && this.listeners.length === 0) {
          document.removeEventListener('ytal-message', this.globalListener);
          this.globalListener = undefined;
        }
      };
      this.receiveMessage = (type, timeout = 3000) => new Promise(function receiveMessagePromise(resolve, reject) {
        try {
          const receivedMessage = function reveicedMessage(message) {
            clearTimeout(timeoutId);
            injectedScript.removeMessageListener(changedListener);
            resolve(message);
          }.bind(this);
          const receiveMessageTimeout = function receiveMessageTimeout() {
            console.warn(`Never received a response message for "${type}" after ${timeout}ms`);
            receivedMessage();
          }.bind(this);
          const timeoutId = setTimeout(receiveMessageTimeout, timeout);
          const changedListener = injectedScript.addMessageListener(type, receivedMessage);
        } catch (ex) {
          reject(ex);
        }
      });
      this.postAndReceiveMessage = async (type, message, timeout) => {
        const receiveMessagePromise = this.receiveMessage(type, timeout);
        this.postMessage(type, message);
        return await receiveMessagePromise;
      };
    }
    postMessage(type, message) {
      const event = new CustomEvent('ytal-message', {
        detail: JSON.stringify({
          type,
          message,
          contentScript: extensionId
        })
      });
      return document.dispatchEvent(event);
    }
  }
  const injectedScript = new InjectedScript();

  const THEME_LIGHT = -1;
  const THEME_DEFAULT = 0;
  const THEME_DARK = 1;
  class Theming {
    constructor(ambientlight) {
      this.prefCookieToTheme = async cookieValue => {
        var _URLSearchParams;
        if (!cookieValue) {
          var _await$getCookie;
          cookieValue = ((_await$getCookie = await getCookie('PREF')) === null || _await$getCookie === void 0 ? void 0 : _await$getCookie.value) || '';
        }
        let f6 = ((_URLSearchParams = new URLSearchParams(cookieValue)) === null || _URLSearchParams === void 0 ? void 0 : _URLSearchParams.get('f6')) || null;
        if (f6 != null && /^[A-Fa-f0-9]+$/.test(f6)) {
          f6 = parseInt(f6, 16);
        }
        f6 = f6 || 0;
        if (f6 & 1 << 165 % 31) return THEME_DARK;
        if (f6 & 1 << 174 % 31) return THEME_LIGHT;
        if (matchMedia('(prefers-color-scheme: dark)').matches) return THEME_DARK;
        return THEME_LIGHT;
      };
      this.isDarkTheme = () => document.documentElement.getAttribute('dark') != null;
      this.shouldBeDarkTheme = enabledAndVisible => {
        const enabled = enabledAndVisible === undefined ? !this.settings.enabled || this.ambientlight.isHidden : !enabledAndVisible;
        const toTheme = enabled || this.settings.theme === THEME_DEFAULT ? this.youtubeTheme : this.settings.theme;
        return toTheme === THEME_DARK;
      };
      this.shouldToggleTheme = () => {
        const toDark = this.shouldBeDarkTheme();
        return !(this.isDarkTheme() === toDark || toDark && !isWatchPageUrl());
      };
      this.updateTheme = wrapErrorHandler(async function updateTheme(fromSettings = false) {
        if (this.updatingTheme || !fromSettings && this.settings.theme === THEME_DEFAULT || !this.shouldToggleTheme()) return;
        this.updatingTheme = true;
        if (this.themeToggleFailed !== false) {
          const lastFailedThemeToggle = await new Promise(async (resolve, reject) => {
            try {
              let timeout = setTimeout(() => {
                timeout = undefined;
                resolve();
              }, 5000);
              const result = await storage.get('last-failed-theme-toggle');
              if (!timeout) return;
              clearTimeout(timeout);
              resolve(result);
            } catch (ex) {
              reject(ex);
            }
          });
          if (lastFailedThemeToggle) {
            const now = new Date().getTime();
            const withinThresshold = now - 10000 < lastFailedThemeToggle;
            if (withinThresshold) {
              this.settings.setWarning(`Because the previous attempt failed and to prevent repeated page refreshes we temporarily disabled the automatic toggle to the ${this.isDarkTheme() ? 'light' : 'dark'} appearance for 10 seconds.\n\nSet the "Appearance (theme)" setting to "Default" to disable the automatic appearance toggle permanently if it keeps on failing.\n(And let me know via the feedback form that it failed so that I can fix it in the next version of the extension)`);
              this.updatingTheme = false;
              return;
            }
            storage.set('last-failed-theme-toggle', undefined);
          }
          if (this.themeToggleFailed) {
            this.settings.setWarning('');
            this.themeToggleFailed = false;
          }
          if (!this.shouldToggleTheme()) {
            this.updatingTheme = false;
            return;
          }
        }
        await this.toggleDarkTheme();
        this.updatingTheme = false;
      }.bind(this), true);
      this.initLiveChat = () => {
        this.initLiveChatSecondaryElem();
        if (this.secondaryElem) return;
        const observer = new MutationObserver(wrapErrorHandler(function initLiveChatMutation() {
          this.initLiveChatSecondaryElem();
          if (!this.secondaryElem) return;
          observer.disconnect();
        }.bind(this), true));
        observer.observe(this.ambientlight.ytdAppElem, {
          childList: true,
          subtree: true
        });
      };
      this.initLiveChatSecondaryElem = () => {
        this.secondaryElem = document.querySelector('#secondary');
        if (!this.secondaryElem) return;
        this.initLiveChatElem();
        const observer = new MutationObserver(wrapErrorHandler(this.initLiveChatElem));
        observer.observe(this.secondaryElem, {
          childList: true
        });
      };
      this.initLiveChatElem = () => {
        const liveChatElem = document.querySelector('ytd-app ytd-live-chat-frame');
        if (!liveChatElem || this.liveChatElem === liveChatElem) return;
        liveChatElem.dataset.ytalElem = 'live-chat';
        this.liveChatElem = liveChatElem;
        this.initLiveChatIframe();
        const observer = new MutationObserver(wrapErrorHandler(this.initLiveChatIframe));
        observer.observe(liveChatElem, {
          childList: true
        });
      };
      this.initLiveChatIframe = () => {
        const iframeElem = document.querySelector('ytd-app ytd-live-chat-frame iframe');
        if (!iframeElem || this.liveChatIframeElem === iframeElem) return;
        this.liveChatIframeElem = iframeElem;
        this.updateLiveChatTheme();
        on(iframeElem, 'load', () => {
          this.ambientlight.updateLayoutPerformanceImprovements();
          this.updateLiveChatTheme();
        });
      };
      this.updateLiveChatThemeThrottle = {};
      this.updateLiveChatTheme = () => {
        if (!this.liveChatElem || !this.liveChatIframeElem) this.initLiveChatElem();
        if (!this.liveChatElem || !this.liveChatIframeElem) return;
        if (this.updateLiveChatThemeThrottle.timeout) return;
        const update = function updateLiveChatThemeUpdate() {
          this.updateLiveChatThemeThrottle.updateTime = performance.now();
          if (!this.ambientlight.isOnVideoPage) return;
          const toDark = this.shouldBeDarkTheme();
          injectedScript.postMessage('set-live-chat-theme', toDark);
        }.bind(this);
        if (this.updateLiveChatThemeThrottle.updateTime > performance.now() - 500) {
          this.updateLiveChatThemeThrottle.timeout = setTimeout(() => {
            update();
            this.updateLiveChatThemeThrottle.timeout = undefined;
          }, 500);
        } else {
          update();
        }
      };
      this.ambientlight = ambientlight;
      this.settings = ambientlight.settings;
    }
    initListeners() {
      this.youtubeTheme = this.isDarkTheme() ? 1 : -1;
      on(document, 'yt-action', async e => {
        var _e$detail;
        if (!this.settings.enabled) return;
        const name = e === null || e === void 0 ? void 0 : (_e$detail = e.detail) === null || _e$detail === void 0 ? void 0 : _e$detail.actionName;
        if (name === 'yt-signal-action-toggle-dark-theme-off') {
          this.youtubeTheme = await this.prefCookieToTheme();
          this.updateTheme();
        } else if (name === 'yt-signal-action-toggle-dark-theme-on') {
          this.youtubeTheme = await this.prefCookieToTheme();
          this.updateTheme();
        } else if (name === 'yt-signal-action-toggle-dark-theme-device') {
          this.youtubeTheme = await this.prefCookieToTheme();
          this.updateTheme();
        } else if (name === 'yt-forward-redux-action-to-live-chat-iframe') {
          requestIdleCallback(function forwardReduxActionToLiveChatIframe() {
            var _e$detail$args, _e$detail$args$;
            if (!this.ambientlight.isOnVideoPage) return;
            if (((_e$detail$args = e.detail.args) === null || _e$detail$args === void 0 ? void 0 : (_e$detail$args$ = _e$detail$args[0]) === null || _e$detail$args$ === void 0 ? void 0 : _e$detail$args$.type) === 'SET_WATCH_SCROLL_TOP') return;
            this.updateLiveChatTheme();
          }.bind(this), {
            timeout: 1
          });
        }
      }, undefined, true);
      try {
        var _globalThis$cookieSto;
        if ((_globalThis$cookieSto = globalThis.cookieStore) !== null && _globalThis$cookieSto !== void 0 && _globalThis$cookieSto.addEventListener) {
          cookieStore.addEventListener('change', wrapErrorHandler(async e => {
            for (const change of e.changed) {
              if (change.name !== 'PREF') continue;
              this.youtubeTheme = await this.prefCookieToTheme(change.value);
              this.updateTheme();
            }
          }, true));
        }
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', wrapErrorHandler(async () => {
          this.youtubeTheme = await this.prefCookieToTheme();
          this.updateTheme();
        }, true));
      } catch (ex) {
        SentryReporter.captureException(ex);
      }
      let themeCorrections = 0;
      this.themeObserver = new MutationObserver(wrapErrorHandler(function themeMutation() {
        if (!this.shouldToggleTheme()) return;
        themeCorrections++;
        this.updateTheme();
        if (themeCorrections === 5) this.themeObserver.disconnect();
      }.bind(this), true));
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['dark']
      });
      if (isEmbedPageUrl()) return;
      this.initLiveChat();
    }
    async updateDocumentTheme(toDark) {
      await injectedScript.postAndReceiveMessage('update-theme', toDark);
    }
    async toggleDarkTheme() {
      const wasDark = this.isDarkTheme();
      await this.updateDocumentTheme(!wasDark);
      if (!isEmbedPageUrl()) {
        this.updateLiveChatTheme();
      }
      const isDark = this.isDarkTheme();
      if (wasDark !== isDark) return;
      this.themeToggleFailed = true;
      await storage.set('last-failed-theme-toggle', new Date().getTime());
      this.settings.setWarning(`Failed to toggle the page theme to from ${wasDark ? 'dark' : 'light'} to ${isDark ? 'dark' : 'light'} mode.\n\nSet the "Appearance (theme)" setting to "Default" to disable the automatic appearance toggle permanently if it keeps on failing.\n(And let me know via the feedback form that it failed so that I can fix it in the next version of the extension)`);
    }
  }

  class Stats {
    constructor(ambientlight) {
      this.frametimesHistoryMax = 120;
      this.barDetectionDurationsMax = 5;
      this.videoFrameTimes = [];
      this.frameTimes = [];
      this.receiveAnimationFrametimes = (compose, presentedFrames) => {
        this.receiveVideoFrametimes(compose, {
          presentedFrames,
          presentationTime: compose,
          processingDuration: this.previousPresentedFrames === presentedFrames ? 0 : 0.125 / Math.max(24, this.ambientlight.displayFrameRate),
          expectedDisplayTime: compose + 1000 / Math.max(24, this.ambientlight.displayFrameRate)
        });
      };
      this.receiveVideoFrametimes = (compose, info) => {
        if (!this.settings.showFrametimes) return;
        const now = performance.now();
        if (this.previousPresentedFrames) {
          const skippedFrames = info.presentedFrames - this.previousPresentedFrames - 1;
          for (let i = 0; i < skippedFrames; i++) {
            this.videoFrameTimes.push({});
          }
        }
        this.videoFrameTimes.push({
          decode: info.presentationTime - info.processingDuration * 1000,
          present: info.presentationTime,
          compose,
          receive: now,
          display: info.expectedDisplayTime
        });
        this.previousPresentedFrames = info.presentedFrames;
      };
      this.addVideoFrametimes = (frameTimes, compose) => {
        frameTimes.video = this.videoFrameTimes[this.videoFrameTimes.length - 1] || {
          compose,
          receive: performance.now()
        };
      };
      this.addAmbientFrametimes = frameTimes => {
        if (!this.settings.showFrametimes) return;
        frameTimes.frameEnd = performance.now();
        const droppedVideoFrameTimes = this.videoFrameTimes.splice(0, this.videoFrameTimes.indexOf(frameTimes.video) + 1);
        droppedVideoFrameTimes.pop();
        for (const video of droppedVideoFrameTimes) {
          this.frameTimes.push({
            video
          });
        }
        this.frameTimes.push(frameTimes);
        requestIdleCallback(function addAmbientDisplayFrametime() {
          frameTimes.display = performance.now();
        }.bind(this), {
          timeout: 1
        });
        requestIdleCallback(function addAmbientDisplayComplete() {
          frameTimes.complete = performance.now();
        }.bind(this));
      };
      this.updateFrameTimes = () => {
        var _this$frameTimesCanva2;
        if (!this.settings.showFrametimes || !this.frameTimes.length) {
          var _this$frameTimesCanva;
          if ((_this$frameTimesCanva = this.frameTimesCanvas) !== null && _this$frameTimesCanva !== void 0 && _this$frameTimesCanva.parentNode) {
            if (this.frameTimesCtx) this.frameTimesCtx.clearRect(0, 0, this.frameTimesCanvas.width, this.frameTimesCanvas.height);
            this.ambientlightFTElem.removeChild(this.frameTimesCanvas);
            this.ambientlightFTLegendElem.childNodes[0].nodeValue = '';
            this.ambientlightFTElem.style.display = 'none';
          }
          return;
        }
        let frameTimes = this.frameTimes;
        this.frameTimes = this.frameTimes.slice(-this.frametimesHistoryMax);
        frameTimes.pop();
        frameTimes = frameTimes.slice(-this.frametimesHistoryMax);
        const videoProcessingRange = this.getRange(frameTimes.filter(ft => {
          var _ft$video, _ft$video2;
          return ((_ft$video = ft.video) === null || _ft$video === void 0 ? void 0 : _ft$video.present) && ((_ft$video2 = ft.video) === null || _ft$video2 === void 0 ? void 0 : _ft$video2.decode);
        }).map(ft => ft.video.present - ft.video.decode).filter(x => x != 0));
        const ambientProcessingRange = this.getRange(frameTimes.filter(ft => {
          var _ft$video3;
          return ft.display && ((_ft$video3 = ft.video) === null || _ft$video3 === void 0 ? void 0 : _ft$video3.receive);
        }).map(ft => ft.display - ft.video.receive).filter(x => x != 0));
        const compositorProcessingRange = this.getRange(frameTimes.filter(ft => ft.complete && ft.display).map(ft => ft.complete - ft.display).filter(x => x != 0));
        const ambientlightBudgetRange = this.getRange(frameTimes.filter(ft => {
          var _ft$video4, _ft$video5;
          return ((_ft$video4 = ft.video) === null || _ft$video4 === void 0 ? void 0 : _ft$video4.display) && ((_ft$video5 = ft.video) === null || _ft$video5 === void 0 ? void 0 : _ft$video5.receive);
        }).map(ft => ft.video.display - ft.video.receive).filter(x => x != 0));
        const delayedFrames = frameTimes.filter(ft => {
          var _ft$video6;
          return ft.drawEnd && ((_ft$video6 = ft.video) === null || _ft$video6 === void 0 ? void 0 : _ft$video6.display) && ft.drawEnd > ft.video.display;
        }).length;
        const skippedFrames = frameTimes.filter(ft => {
          var _ft$video7;
          return !((_ft$video7 = ft.video) !== null && _ft$video7 !== void 0 && _ft$video7.decode) || !ft.drawEnd;
        }).length;
        const legend = `               VERTICAL BARS             MIN        MAX
BLUE         | Video decoding:    ${videoProcessingRange[0]}ms ${videoProcessingRange[1]}ms
GREEN/YELLOW | Ambient rendering: ${ambientProcessingRange[0]}ms ${ambientProcessingRange[1]}ms
GRAY         | Compositing:       ${compositorProcessingRange[0]}ms ${compositorProcessingRange[1]}ms
ORANGE       | Compositing delay 
RED          | Skipped video frames

               DOTTED LINES
WHITE        | when the next video frame will be displayed
GRAY         | when the next video frame will decoded
GREEN        | when the video frame will be displayed

STATS
Frames on time: ${(frameTimes.length - delayedFrames - skippedFrames).toString().padStart(3, ' ')} | Delayed: ${delayedFrames.toString().padStart(3, ' ')} | Skipped: ${skippedFrames.toString().padStart(3, ' ')}
Ambient rendering budget: ${ambientlightBudgetRange[0]}ms to ${ambientlightBudgetRange[1]}ms`;
        this.ambientlightFTLegendElem.childNodes[0].nodeValue = legend;
        const xSize = 3;
        const width = frameTimes.length * xSize;
        const height = 270;
        if (!this.frameTimesCanvas) {
          this.frameTimesCanvas = new Canvas(width, height);
          this.frameTimesCanvas.setAttribute('title', 'Click to toggle legend');
          on(this.frameTimesCanvas, 'click', e => {
            e.preventDefault();
            this.ambientlightFTElem.toggleAttribute('legend');
          }, {
            capture: true
          });
          on(this.frameTimesCanvas, 'mousedown', e => {
            e.preventDefault();
          }, {
            capture: true
          });
          this.ambientlightFTElem.appendChild(this.frameTimesCanvas);
          this.ambientlightFTElem.style.display = '';
          this.frameTimesCtx = this.frameTimesCanvas.getContext('2d', {
            alpha: true
          });
        } else if (this.frameTimesCanvas.width !== width || this.frameTimesCanvas.height !== height) {
          this.frameTimesCanvas.width = width;
          this.frameTimesCanvas.height = height;
        } else {
          this.frameTimesCtx.clearRect(0, 0, width, height);
        }
        if (!((_this$frameTimesCanva2 = this.frameTimesCanvas) !== null && _this$frameTimesCanva2 !== void 0 && _this$frameTimesCanva2.parentNode)) {
          this.ambientlightFTElem.appendChild(this.frameTimesCanvas);
          this.ambientlightFTElem.style.display = '';
        }
        const displayFrameDuration = 1000 / Math.max(24, this.ambientlight.displayFrameRate);
        const offsettedFrameTimes = frameTimes.map((ft, i) => {
          var _ft$video8, _ft$video9, _ft$video10, _ft$video11, _ft$video12, _ft$video13, _ft$video14, _frameTimes$video, _frameTimes$video2;
          const offset = ((_ft$video8 = ft.video) === null || _ft$video8 === void 0 ? void 0 : _ft$video8.display) ?? ((_ft$video9 = ft.video) === null || _ft$video9 === void 0 ? void 0 : _ft$video9.compose) + displayFrameDuration;
          return {
            video: ft.video ? {
              decode: ((_ft$video10 = ft.video) === null || _ft$video10 === void 0 ? void 0 : _ft$video10.decode) - offset,
              present: ((_ft$video11 = ft.video) === null || _ft$video11 === void 0 ? void 0 : _ft$video11.present) - offset,
              compose: ((_ft$video12 = ft.video) === null || _ft$video12 === void 0 ? void 0 : _ft$video12.compose) - offset,
              receive: ((_ft$video13 = ft.video) === null || _ft$video13 === void 0 ? void 0 : _ft$video13.receive) - offset,
              display: ((_ft$video14 = ft.video) === null || _ft$video14 === void 0 ? void 0 : _ft$video14.display) - offset
            } : undefined,
            drawStart: ft.drawStart - offset,
            drawEnd: ft.drawEnd - offset,
            display: ft.display - offset,
            complete: ft.complete - offset,
            nextCompose: i < frameTimes.length - 1 ? ((_frameTimes$video = frameTimes[i + 1].video) === null || _frameTimes$video === void 0 ? void 0 : _frameTimes$video.compose) - offset : undefined,
            nextDisplay: i < frameTimes.length - 1 ? ((_frameTimes$video2 = frameTimes[i + 1].video) === null || _frameTimes$video2 === void 0 ? void 0 : _frameTimes$video2.display) - offset : undefined
          };
        });
        const frameDurations = offsettedFrameTimes.map(ft => {
          var _ft$video15, _ft$video16, _ft$video17, _ft$video18, _ft$video19, _ft$video20, _ft$video21, _ft$video22, _ft$video23, _ft$video24, _ft$video25, _ft$video26, _ft$video27, _ft$video28;
          return {
            decodeToPresent: [(_ft$video15 = ft.video) === null || _ft$video15 === void 0 ? void 0 : _ft$video15.decode, ((_ft$video16 = ft.video) === null || _ft$video16 === void 0 ? void 0 : _ft$video16.present) - ((_ft$video17 = ft.video) === null || _ft$video17 === void 0 ? void 0 : _ft$video17.decode)],
            composeToReceive: [(_ft$video18 = ft.video) === null || _ft$video18 === void 0 ? void 0 : _ft$video18.compose, ((_ft$video19 = ft.video) === null || _ft$video19 === void 0 ? void 0 : _ft$video19.receive) - ((_ft$video20 = ft.video) === null || _ft$video20 === void 0 ? void 0 : _ft$video20.compose)],
            presentToCompose: [(_ft$video21 = ft.video) === null || _ft$video21 === void 0 ? void 0 : _ft$video21.present, Math.max(0, ((_ft$video22 = ft.video) === null || _ft$video22 === void 0 ? void 0 : _ft$video22.compose) - ((_ft$video23 = ft.video) === null || _ft$video23 === void 0 ? void 0 : _ft$video23.present))],
            receiveToDrawStart: [(_ft$video24 = ft.video) === null || _ft$video24 === void 0 ? void 0 : _ft$video24.receive, ft.drawStart - ((_ft$video25 = ft.video) === null || _ft$video25 === void 0 ? void 0 : _ft$video25.receive)],
            drawStartTodrawEnd: [ft.drawStart, ft.drawEnd - ft.drawStart],
            drawEndToDisplay: [ft.drawEnd, ft.display - ft.drawEnd],
            videoDisplay: (_ft$video26 = ft.video) === null || _ft$video26 === void 0 ? void 0 : _ft$video26.display,
            isDrawnBeforeVideoDisplay: !isFinite((_ft$video27 = ft.video) === null || _ft$video27 === void 0 ? void 0 : _ft$video27.display) || ft.drawEnd <= ((_ft$video28 = ft.video) === null || _ft$video28 === void 0 ? void 0 : _ft$video28.display),
            nextCompose: ft.nextCompose,
            isDrawnBeforeNextCompose: !isFinite(ft.nextCompose) || ft.drawEnd <= ft.nextCompose,
            nextDisplay: ft.nextDisplay,
            isDrawnBeforeNextDisplay: !isFinite(ft.nextDisplay) || ft.drawEnd <= ft.nextDisplay,
            isDrawn: isFinite(ft.drawEnd)
          };
        });
        let averageMinTimes = offsettedFrameTimes.map(ft => {
          var _ft$video29, _ft$video30;
          return Math.min(...[(_ft$video29 = ft.video) === null || _ft$video29 === void 0 ? void 0 : _ft$video29.decode, (_ft$video30 = ft.video) === null || _ft$video30 === void 0 ? void 0 : _ft$video30.compose].filter(t => isFinite(t)));
        }).filter(t => isFinite(t)).sort((a, b) => a - b);
        const minPercentile90Length = Math.floor(averageMinTimes.length * 0.9);
        const averageMinTimesPercentile90 = averageMinTimes.slice(averageMinTimes.length - minPercentile90Length, minPercentile90Length);
        const min = Math.round(Math.min(...averageMinTimesPercentile90) / displayFrameDuration) * displayFrameDuration;
        let averageMaxTimes = offsettedFrameTimes.map(ft => {
          var _ft$video31;
          return Math.max(...[(_ft$video31 = ft.video) === null || _ft$video31 === void 0 ? void 0 : _ft$video31.display, ft.drawEnd, ft.nextCompose, ft.nextDisplay].filter(t => isFinite(t)));
        }).filter(t => isFinite(t)).sort((a, b) => a - b);
        const maxPercentile90Length = Math.floor(averageMaxTimes.length * 0.9);
        const averageMaxTimesPercentile90 = averageMaxTimes.slice(0, maxPercentile90Length);
        const max = Math.round(Math.max(...averageMaxTimesPercentile90) / displayFrameDuration) * displayFrameDuration;
        this.ambientlightFTAxisLegendTopElem.childNodes[0].nodeValue = `${max.toFixed(1)}ms`;
        this.ambientlightFTAxisLegendBottomElem.childNodes[0].nodeValue = `${min.toFixed(1)}ms`;
        const range = max - min + displayFrameDuration;
        const yScale = height / range;
        const yLine = 1 / yScale;
        const framerateLimit = this.ambientlight.getRealFramerateLimit();
        const frameRects = frameDurations.map(fd => [...(framerateLimit || fd.isDrawn ? [] : [['#800', xSize, min - displayFrameDuration / 2, range]]), ['#06f', xSize, ...fd.decodeToPresent], ['#666', 1, ...fd.composeToReceive], ['#f80', 1, ...fd.presentToCompose], ['#a0b', 1, ...fd.drawEndToDisplay], [fd.isDrawnBeforeVideoDisplay ? '#0b0' : '#db0', xSize, ...fd.receiveToDrawStart], [fd.isDrawnBeforeVideoDisplay ? '#0f0' : '#ff0', xSize, ...fd.drawStartTodrawEnd], [fd.isDrawnBeforeNextCompose ? '#666' : '#666', 1, fd.nextCompose, yLine], [fd.isDrawnBeforeNextDisplay ? '#fff' : '#fff', 1, fd.nextDisplay, yLine], [fd.isDrawnBeforeVideoDisplay ? '#0f0' : '#0f0', 1, fd.videoDisplay, yLine], ...(framerateLimit && !fd.isDrawn ? [['#000000bb', xSize, min - displayFrameDuration / 2, range]] : [])]);
        const offset = min - displayFrameDuration / 2;
        let rects = [];
        for (let i = 0; i < frameRects.length; i++) {
          const frameRectLines = frameRects[i];
          const x = i * xSize;
          if (frameRectLines !== undefined) {
            for (const [color, xFrameSize, y, ySize] of frameRectLines) {
              if (isNaN(y) || isNaN(ySize) || ySize === 0) continue;
              rects.push([color, x + Math.round(xSize / 2 - xFrameSize / 2), Math.round((y - offset) * yScale), xFrameSize, Math.max(1, Math.round(ySize * yScale))]);
            }
          } else if (!framerateLimit) {
            rects.push(['#f00', x, 0, xSize, height]);
          }
        }
        for (const rect of rects) {
          this.frameTimesCtx.fillStyle = rect[0];
          this.frameTimesCtx.fillRect(rect[1], rect[2], rect[3], rect[4]);
        }
      };
      this.getRange = list => {
        list = list.filter(value => value !== undefined);
        if (!list.length) return ['?', '?'].map(value => value.padStart(8, ' '));
        const sortedList = list.sort((a, b) => a - b);
        return [sortedList[0], sortedList[sortedList.length - 1]].map(value => (value === undefined ? '?' : value.toFixed(1)).padStart(8, ' '));
      };
      this.barDetectionDurations = [];
      this.addBarDetectionDuration = duration => {
        if (!this.settings.showBarDetectionStats) return;
        this.barDetectionDurations.push(duration);
      };
      this.updateBarDetectionDurations = () => {
        if (!this.settings.showBarDetectionStats || !this.settings.detectHorizontalBarSizeEnabled && !this.settings.detectVerticalBarSizeEnabled) {
          var _this$barDetectionDur, _this$barDetectionHor, _this$barDetectionVer, _this$barDetectionFPS, _this$barDetectionCan;
          if ((_this$barDetectionDur = this.barDetectionDurationElem) !== null && _this$barDetectionDur !== void 0 && _this$barDetectionDur.parentNode) {
            this.barDetectionDurationElem.childNodes[0].nodeValue = '';
            this.barDetectionDurationElem.style.color = '';
          }
          if ((_this$barDetectionHor = this.barDetectionHorizontalResultElem) !== null && _this$barDetectionHor !== void 0 && _this$barDetectionHor.parentNode) {
            this.barDetectionHorizontalResultElem.childNodes[0].nodeValue = '';
            this.barDetectionHorizontalResultElem.style.color = '';
          }
          if ((_this$barDetectionVer = this.barDetectionVerticalResultElem) !== null && _this$barDetectionVer !== void 0 && _this$barDetectionVer.parentNode) {
            this.barDetectionVerticalResultElem.childNodes[0].nodeValue = '';
            this.barDetectionVerticalResultElem.style.color = '';
          }
          if ((_this$barDetectionFPS = this.barDetectionFPSElem) !== null && _this$barDetectionFPS !== void 0 && _this$barDetectionFPS.parentNode) {
            this.barDetectionFPSElem.childNodes[0].nodeValue = '';
            this.barDetectionFPSElem.style.color = '';
          }
          if ((_this$barDetectionCan = this.barDetectionCanvas) !== null && _this$barDetectionCan !== void 0 && _this$barDetectionCan.parentNode) {
            if (this.barDetectionCtx) {
              this.barDetectionCtx.clearRect(0, 0, this.barDetectionCanvas.width, this.barDetectionCanvas.height);
              this.barDetectionCanvas.width = 1;
              this.barDetectionCanvas.height = 1;
            }
            if (this.barDetectionBufferCtx) {
              this.barDetectionBufferCtx.clearRect(0, 0, this.barDetectionBufferCanvas.width, this.barDetectionBufferCanvas.height);
              this.barDetectionBufferCanvas.width = 1;
              this.barDetectionBufferCanvas.height = 1;
            }
            this.barDetectionGraphElem.removeChild(this.barDetectionCanvas);
            this.barDetectionGraphElem.style.display = 'none';
          }
          return;
        }
        const durations = this.barDetectionDurations.slice(-this.barDetectionDurationsMax);
        this.barDetectionDurations = durations;
        const duration = durations.length ? Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length).toFixed(1) : undefined;
        this.barDetectionDurationElem.childNodes[0].nodeValue = duration ? ` SEARCH DURATION: ${duration}ms` : '';
        this.barDetectionDurationElem.style.color = '#fff';
      };
      this.updateBarDetectionInfo = (throttle, lastChange) => {
        if (!this.settings.showBarDetectionStats) return;
        const barDetectionFPS = throttle ? `${Math.round(1000 / throttle).toFixed(2)} (${(throttle / 1000).toFixed(1)}s)` : 'VIDEO FPS';
        const barDetectionLastChange = lastChange ? `${((performance.now() - lastChange) / 1000).toFixed(1)}s ago` : '';
        this.barDetectionFPSElem.childNodes[0].nodeValue = `BAR DETECTION: ${barDetectionFPS} / ${barDetectionLastChange}`;
        this.barDetectionFPSElem.style.color = '#fff';
      };
      this.updateBarDetectionImage = image => {
        var _this$barDetectionCan2;
        if (!image) return;
        if (!this.settings.showBarDetectionStats) return;
        const width = 512;
        const height = 512;
        if (!this.barDetectionCanvas) {
          this.barDetectionCanvas = new Canvas(width, height);
          this.barDetectionCtx = this.barDetectionCanvas.getContext('2d', {
            alpha: true
          });
          this.barDetectionCanvas.setAttribute('title', `LINES \nBlue:        Detected bar\nGreen:     Detected edge \nOrange:  Diverging edge \nGray:       Ignored edge \nRed:        Scanline`);
          on(this.barDetectionCanvas, 'click', e => {
            e.preventDefault();
            this.barDetectionGraphElem.toggleAttribute('legend');
          }, {
            capture: true
          });
          on(this.barDetectionCanvas, 'mousedown', e => {
            e.preventDefault();
          }, {
            capture: true
          });
          this.barDetectionGraphElem.appendChild(this.barDetectionCanvas);
          this.barDetectionGraphElem.style.display = '';
          this.barDetectionBufferCanvas = new SafeOffscreenCanvas(width, height);
          this.barDetectionBufferCtx = this.barDetectionBufferCanvas.getContext('2d', {
            alpha: true
          });
        } else if (this.barDetectionCanvas.width !== width || this.barDetectionCanvas.height !== height) {
          this.barDetectionCanvas.width = width;
          this.barDetectionCanvas.height = height;
          this.barDetectionBufferCanvas.width = width;
          this.barDetectionBufferCanvas.height = height;
        } else ;
        if (!((_this$barDetectionCan2 = this.barDetectionCanvas) !== null && _this$barDetectionCan2 !== void 0 && _this$barDetectionCan2.parentNode)) {
          this.barDetectionGraphElem.appendChild(this.barDetectionCanvas);
          this.barDetectionGraphElem.style.display = '';
        }
        this.barDetectionBufferCtx.drawImage(image, 0, 0, this.barDetectionBufferCanvas.width, this.barDetectionBufferCanvas.height);
      };
      this.updateBarDetectionResult = (barsFound, horizontalBarSizeInfo, verticalBarSizeInfo, horizontalPercentage, verticalPercentage) => {
        var _horizontalBarSizeInf, _horizontalBarSizeInf2, _verticalBarSizeInfo$, _verticalBarSizeInfo$2;
        if (!this.settings.showBarDetectionStats || !this.barDetectionCtx) return;
        this.barDetectionHorizontalResultElem.childNodes[0].nodeValue = `${[this.settings.detectHorizontalBarSizeEnabled ? ` HORIZONTAL: ${horizontalBarSizeInfo.percentage !== undefined ? `${horizontalBarSizeInfo.percentage.toFixed(2).padStart(5, ' ')}` : '  #.##'}%  ➜ ${horizontalPercentage.toFixed(2).padStart(5, ' ')}%` : '', this.settings.detectHorizontalBarSizeEnabled ? ` COLOR (rgb):       ${(_horizontalBarSizeInf = horizontalBarSizeInfo.color) === null || _horizontalBarSizeInf === void 0 ? void 0 : (_horizontalBarSizeInf2 = _horizontalBarSizeInf.map(c => Math.round(c).toString().padStart(3, ' '))) === null || _horizontalBarSizeInf2 === void 0 ? void 0 : _horizontalBarSizeInf2.join(' ')}` : ''].filter(s => s).join('\n')}`;
        this.barDetectionHorizontalResultElem.style.color = horizontalBarSizeInfo.percentage !== undefined ? barsFound ? '#0f0' : '#f80' : '#fff';
        this.barDetectionVerticalResultElem.childNodes[0].nodeValue = `${[this.settings.detectVerticalBarSizeEnabled ? ` VERTICAL:     ${verticalBarSizeInfo.percentage !== undefined ? `${verticalBarSizeInfo.percentage.toFixed(2).padStart(5, ' ')}` : '  #.##'}%  ➜ ${verticalPercentage.toFixed(2).padStart(5, ' ')}%` : '', this.settings.detectVerticalBarSizeEnabled ? ` COLOR (rgb):       ${(_verticalBarSizeInfo$ = verticalBarSizeInfo.color) === null || _verticalBarSizeInfo$ === void 0 ? void 0 : (_verticalBarSizeInfo$2 = _verticalBarSizeInfo$.map(c => Math.round(c).toString().padStart(3, ' '))) === null || _verticalBarSizeInfo$2 === void 0 ? void 0 : _verticalBarSizeInfo$2.join(' ')}` : ''].filter(s => s).join('\n')}`;
        this.barDetectionVerticalResultElem.style.color = verticalBarSizeInfo.percentage !== undefined ? barsFound ? '#0f0' : '#f80' : '#fff';
        const width = this.barDetectionCanvas.width;
        const height = this.barDetectionCanvas.height;
        this.barDetectionCtx.clearRect(0, 0, this.barDetectionCanvas.width, this.barDetectionCanvas.height);
        this.barDetectionCtx.drawImage(this.barDetectionBufferCanvas, 0, 0);
        this.barDetectionCtx.strokeStyle = '#00000077';
        const rects = [];
        const fillRects = [];
        if (horizontalBarSizeInfo.percentage !== undefined) {
          const xIndex = Math.floor(height * (horizontalBarSizeInfo.percentage / 100));
          rects.push(['#0af', 0, xIndex, width, 1]);
          rects.push(['#0af', 0, height - xIndex - 1, width, 1]);
        }
        if (verticalBarSizeInfo.percentage !== undefined) {
          const yIndex = Math.floor(width * (verticalBarSizeInfo.percentage / 100));
          rects.push(['#0af', yIndex, 0, 1, height]);
          rects.push(['#0af', width - yIndex - 1, 0, 1, height]);
        }
        const certaintySize = 32;
        const getEdgeSizes = (yIndex, certainty) => {
          const length = Math.floor(yIndex - 1);
          return {
            length: length < 3 ? 0 : length,
            radius: Math.floor(certaintySize * certainty),
            thickness: length < 3 ? 1 : 2
          };
        };
        const getEdgeColor = (deviates, percentage) => deviates ? '#555' : percentage === undefined ? '#f80' : '#0c0';
        if (!this.dotsPattern) {
          const dotsCanvas = new SafeOffscreenCanvas(2, 2);
          const dotsCtx = dotsCanvas.getContext('2d', {
            alpha: true
          });
          dotsCtx.fillStyle = 'rgba(255, 50, 50, 255)';
          dotsCtx.fillRect(0, 0, 1, 1);
          dotsCtx.fillRect(1, 1, 1, 1);
          dotsCtx.fillStyle = 'rgba(0, 0, 255, 100)';
          dotsCtx.fillRect(0, 1, 1, 1);
          dotsCtx.fillRect(1, 0, 1, 1);
          this.dotsPattern = dotsCanvas.transferToImageBitmap();
          this.barDetectionDotsPattern = this.barDetectionCtx.createPattern(this.dotsPattern, 'repeat');
        }
        if (horizontalBarSizeInfo.topEdges && horizontalBarSizeInfo.bottomEdges) {
          for (const {
            xIndex,
            yIndex,
            deviates,
            deviatesTop,
            certainty
          } of horizontalBarSizeInfo.topEdges) {
            const {
              length,
              radius,
              thickness
            } = getEdgeSizes(yIndex, certainty);
            fillRects.push([this.barDetectionDotsPattern, xIndex, 0, 1, length]);
            rects.push([getEdgeColor(deviates || deviatesTop, horizontalBarSizeInfo.percentage), xIndex - radius, length, 1 + radius * 2, thickness]);
          }
          for (const {
            xIndex,
            yIndex,
            deviates,
            deviatesBottom,
            certainty
          } of horizontalBarSizeInfo.bottomEdges) {
            const {
              length,
              radius,
              thickness
            } = getEdgeSizes(yIndex, certainty);
            fillRects.push([this.barDetectionDotsPattern, xIndex, height - length, 1, length]);
            rects.push([getEdgeColor(deviates || deviatesBottom, horizontalBarSizeInfo.percentage), xIndex - radius, height - length - thickness, 1 + radius * 2, thickness]);
          }
        }
        if (verticalBarSizeInfo.topEdges && verticalBarSizeInfo.bottomEdges) {
          for (const {
            xIndex,
            yIndex,
            deviates,
            deviatesTop,
            certainty
          } of verticalBarSizeInfo.topEdges) {
            const {
              length,
              radius,
              thickness
            } = getEdgeSizes(yIndex, certainty);
            fillRects.push([this.barDetectionDotsPattern, 0, xIndex, length, 1]);
            rects.push([getEdgeColor(deviates || deviatesTop, verticalBarSizeInfo.percentage), length, xIndex - radius, thickness, 1 + radius * 2]);
          }
          for (const {
            xIndex,
            yIndex,
            deviates,
            deviatesBottom,
            certainty
          } of verticalBarSizeInfo.bottomEdges) {
            const {
              length,
              radius,
              thickness
            } = getEdgeSizes(yIndex, certainty);
            fillRects.push([this.barDetectionDotsPattern, width - length, xIndex, length, 1]);
            rects.push([getEdgeColor(deviates || deviatesBottom, verticalBarSizeInfo.percentage), width - length - thickness, xIndex - radius, thickness, 1 + radius * 2]);
          }
        }
        for (const rect of fillRects) {
          this.barDetectionCtx.fillStyle = rect[0];
          this.barDetectionCtx.fillRect(rect[1], rect[2], rect[3], rect[4]);
        }
        for (const rect of rects) {
          this.barDetectionCtx.strokeRect(rect[1] - 0.5, rect[2] - 0.5, rect[3] + 1, rect[4] + 1);
        }
        for (const rect of rects) {
          this.barDetectionCtx.fillStyle = rect[0];
          this.barDetectionCtx.fillRect(rect[1], rect[2], rect[3], rect[4]);
        }
      };
      this.ambientlight = ambientlight;
      this.settings = ambientlight.settings;
    }
    initElems() {
      if (this.FPSListElem) return;
      this.FPSListElem = document.createElement('div');
      this.FPSListElem.classList.add('ambientlight__fps-list');
      this.ambientlightFTElem = document.createElement('div');
      this.ambientlightFTElem.classList.add('ambientlight__ambientlight-ft');
      this.ambientlightFTElem.style.display = 'none';
      this.ambientlightFTLegendElem = document.createElement('div');
      this.ambientlightFTLegendElem.classList.add('ambientlight__ambientlight-ft-legend');
      const ambientlightFTLegendElemNode = document.createTextNode('');
      this.ambientlightFTLegendElem.appendChild(ambientlightFTLegendElemNode);
      this.ambientlightFTElem.append(this.ambientlightFTLegendElem);
      this.ambientlightFTAxisLegendsElem = document.createElement('div');
      this.ambientlightFTAxisLegendsElem.classList.add('ambientlight__ambientlight-ft-axis-legends');
      this.ambientlightFTAxisLegendTopElem = document.createElement('div');
      this.ambientlightFTAxisLegendTopElem.classList.add('ambientlight__ambientlight-ft-axis-legend', 'ambientlight__ambientlight-ft-axis-legend--top');
      const ambientlightFTAxisLegendTopElemNode = document.createTextNode('');
      this.ambientlightFTAxisLegendTopElem.appendChild(ambientlightFTAxisLegendTopElemNode);
      this.ambientlightFTAxisLegendsElem.append(this.ambientlightFTAxisLegendTopElem);
      this.ambientlightFTAxisLegendBottomElem = document.createElement('div');
      this.ambientlightFTAxisLegendBottomElem.classList.add('ambientlight__ambientlight-ft-axis-legend', 'ambientlight__ambientlight-ft-axis-legend--bottom');
      const ambientlightFTAxisLegendBottomElemNode = document.createTextNode('');
      this.ambientlightFTAxisLegendBottomElem.appendChild(ambientlightFTAxisLegendBottomElemNode);
      this.ambientlightFTAxisLegendsElem.append(this.ambientlightFTAxisLegendBottomElem);
      this.ambientlightFTElem.append(this.ambientlightFTAxisLegendsElem);
      this.FPSListElem.append(this.ambientlightFTElem);
      const appendFPSItem = className => {
        const elem = document.createElement('div');
        elem.classList.add(className);
        const textNode = document.createTextNode('');
        elem.appendChild(textNode);
        this.FPSListElem.append(elem);
        return elem;
      };
      this.displayFPSElem = appendFPSItem('ambientlight__display-fps');
      this.videoFPSElem = appendFPSItem('ambientlight__video-fps');
      this.videoDroppedFramesElem = appendFPSItem('ambientlight__video-dropped-frames');
      this.videoSyncedElem = appendFPSItem('ambientlight__video-synced');
      this.ambientlightFPSElem = appendFPSItem('ambientlight__ambientlight-fps');
      this.ambientlightDroppedFramesElem = appendFPSItem('ambientlight__ambientlight-dropped-frames');
      this.videoResolutionElem = appendFPSItem('ambientlight__video-resolution');
      this.videoSyncedResolutionElem = appendFPSItem('ambientlight__video-synced-resolution');
      if (!this.ambientlight.shouldDrawDirectlyFromVideoElem()) this.videoBufferResolutionElem = appendFPSItem('ambientlight__video-buffer-resolution');
      this.projectorBufferResolutionElem = appendFPSItem('ambientlight__projector-buffer-resolution');
      this.projectorResolutionElem = appendFPSItem('ambientlight__projector-resolution');
      this.barDetectionFPSElem = appendFPSItem('ambientlight__ambientlight-bar-detection-fps');
      this.barDetectionDurationElem = appendFPSItem('ambientlight__ambientlight-bar-detection-duration');
      this.barDetectionHorizontalResultElem = appendFPSItem('ambientlight__ambientlight-bar-detection-horizontal-result');
      this.barDetectionVerticalResultElem = appendFPSItem('ambientlight__ambientlight-bar-detection-vertical-result');
      this.barDetectionGraphElem = appendFPSItem('ambientlight__ambientlight-bar-detection-graph');
      this.barDetectionGraphElem.style.height = '256px';
      this.barDetectionGraphElem.style.display = 'none';
    }
    hide(onlyDisabled = false) {
      var _this$FPSListElem;
      if (!onlyDisabled || !this.settings.showResolutions) {
        this.videoResolutionElem.childNodes[0].nodeValue = '';
        this.videoSyncedResolutionElem.childNodes[0].nodeValue = '';
        if (this.videoBufferResolutionElem) this.videoBufferResolutionElem.childNodes[0].nodeValue = '';
        this.projectorBufferResolutionElem.childNodes[0].nodeValue = '';
        this.projectorResolutionElem.childNodes[0].nodeValue = '';
      }
      if (!onlyDisabled || !this.settings.showFPS) {
        this.videoFPSElem.childNodes[0].nodeValue = '';
        this.videoDroppedFramesElem.childNodes[0].nodeValue = '';
        this.videoSyncedElem.childNodes[0].nodeValue = '';
        this.ambientlightFPSElem.childNodes[0].nodeValue = '';
        this.ambientlightDroppedFramesElem.childNodes[0].nodeValue = '';
      }
      if (!onlyDisabled || !this.settings.showBarDetectionStats || !this.settings.detectHorizontalBarSizeEnabled) {
        this.barDetectionHorizontalResultElem.childNodes[0].nodeValue = '';
      }
      if (!onlyDisabled || !this.settings.showBarDetectionStats || !this.settings.detectVerticalBarSizeEnabled) {
        this.barDetectionVerticalResultElem.childNodes[0].nodeValue = '';
      }
      if (!onlyDisabled || !this.settings.showBarDetectionStats || !this.settings.detectHorizontalBarSizeEnabled && !this.settings.detectVerticalBarSizeEnabled) {
        var _this$barDetectionCan3;
        this.barDetectionDurations = [];
        this.barDetectionDurationElem.childNodes[0].nodeValue = '';
        this.barDetectionFPSElem.childNodes[0].nodeValue = '';
        if ((_this$barDetectionCan3 = this.barDetectionCanvas) !== null && _this$barDetectionCan3 !== void 0 && _this$barDetectionCan3.parentNode) {
          if (this.barDetectionCtx) {
            this.barDetectionCtx.clearRect(0, 0, this.barDetectionCanvas.width, this.barDetectionCanvas.height);
            this.barDetectionCanvas.width = 1;
            this.barDetectionCanvas.height = 1;
          }
          if (this.barDetectionBufferCtx) {
            this.barDetectionBufferCtx.clearRect(0, 0, this.barDetectionBufferCanvas.width, this.barDetectionBufferCanvas.height);
            this.barDetectionBufferCanvas.width = 1;
            this.barDetectionBufferCanvas.height = 1;
          }
          this.barDetectionGraphElem.removeChild(this.barDetectionCanvas);
          this.barDetectionGraphElem.style.display = 'none';
        }
      }
      if (!onlyDisabled || !this.settings.showFPS || !this.settings.showFrametimes) {
        this.displayFPSElem.childNodes[0].nodeValue = '';
      }
      if (!onlyDisabled || !this.settings.showFrametimes) {
        var _this$frameTimesCanva3;
        this.ambientlightFTLegendElem.childNodes[0].nodeValue = '';
        if ((_this$frameTimesCanva3 = this.frameTimesCanvas) !== null && _this$frameTimesCanva3 !== void 0 && _this$frameTimesCanva3.parentNode) {
          if (this.frameTimesCtx) this.frameTimesCtx.clearRect(0, 0, this.frameTimesCanvas.width, this.frameTimesCanvas.height);
          this.ambientlightFTElem.removeChild(this.frameTimesCanvas);
          this.ambientlightFTElem.style.display = 'none';
        }
      }
      if ((_this$FPSListElem = this.FPSListElem) !== null && _this$FPSListElem !== void 0 && _this$FPSListElem.isConnected && (!onlyDisabled || !this.settings.showBarDetectionStats && !this.settings.showResolutions && !this.settings.showFPS && !this.settings.showFrametimes)) {
        this.FPSListElem.remove();
      }
    }
    update() {
      var _this$FPSListElem2;
      if (this.ambientlight.isHidden) return;
      if (this.settings.showResolutions) {
        var _this$ambientlight$vi, _this$ambientlight$vi2, _this$ambientlight$vi3, _this$ambientlight$vi4, _this$ambientlight$vi5, _this$ambientlight$vi6, _projector$elem, _projector$elem2, _projector$blurCanvas, _projector$blurCanvas2, _projector$projectors, _projector$projectors2, _projector$projectors3, _projector$projectors4, _projector$projectors5;
        const videoResolution = `VIDEO: ${((_this$ambientlight$vi = this.ambientlight.videoElem) === null || _this$ambientlight$vi === void 0 ? void 0 : _this$ambientlight$vi.videoWidth) ?? '?'}x${((_this$ambientlight$vi2 = this.ambientlight.videoElem) === null || _this$ambientlight$vi2 === void 0 ? void 0 : _this$ambientlight$vi2.videoHeight) ?? '?'}`;
        const videoSyncedResolution = this.settings.videoOverlayEnabled ? `VIDEO SYNCED: ${((_this$ambientlight$vi3 = this.ambientlight.videoOverlay) === null || _this$ambientlight$vi3 === void 0 ? void 0 : (_this$ambientlight$vi4 = _this$ambientlight$vi3.elem) === null || _this$ambientlight$vi4 === void 0 ? void 0 : _this$ambientlight$vi4.width) ?? '?'}x${((_this$ambientlight$vi5 = this.ambientlight.videoOverlay) === null || _this$ambientlight$vi5 === void 0 ? void 0 : (_this$ambientlight$vi6 = _this$ambientlight$vi5.elem) === null || _this$ambientlight$vi6 === void 0 ? void 0 : _this$ambientlight$vi6.height) ?? '?'}` : '';
        const projector = this.ambientlight.projector;
        const projectorBufferResolution = this.settings.webGL ? `AMBIENT BUFFER: ${(projector === null || projector === void 0 ? void 0 : (_projector$elem = projector.elem) === null || _projector$elem === void 0 ? void 0 : _projector$elem.width) ?? '?'}x${(projector === null || projector === void 0 ? void 0 : (_projector$elem2 = projector.elem) === null || _projector$elem2 === void 0 ? void 0 : _projector$elem2.height) ?? '?'} 
         [ load: ${((projector === null || projector === void 0 ? void 0 : projector.loadTime) ?? 0).toFixed(1)}ms
          | draw: ${((projector === null || projector === void 0 ? void 0 : projector.drawTime) ?? 0).toFixed(1)}ms]` : '';
        const projectorResolution = `AMBIENT: ${this.settings.webGL ? `${(projector === null || projector === void 0 ? void 0 : (_projector$blurCanvas = projector.blurCanvas) === null || _projector$blurCanvas === void 0 ? void 0 : _projector$blurCanvas.width) ?? '?'}x${(projector === null || projector === void 0 ? void 0 : (_projector$blurCanvas2 = projector.blurCanvas) === null || _projector$blurCanvas2 === void 0 ? void 0 : _projector$blurCanvas2.height) ?? '?'} 
          [ clear: ${((projector === null || projector === void 0 ? void 0 : projector.blurClearTime) ?? 0).toFixed(1)}ms
          | draw: ${((projector === null || projector === void 0 ? void 0 : projector.blurDrawTime) ?? 0).toFixed(1)}ms]` : projector !== null && projector !== void 0 && (_projector$projectors = projector.projectors) !== null && _projector$projectors !== void 0 && _projector$projectors.length ? `${(projector === null || projector === void 0 ? void 0 : (_projector$projectors2 = projector.projectors[0]) === null || _projector$projectors2 === void 0 ? void 0 : (_projector$projectors3 = _projector$projectors2.elem) === null || _projector$projectors3 === void 0 ? void 0 : _projector$projectors3.width) ?? '?'}x${(projector === null || projector === void 0 ? void 0 : (_projector$projectors4 = projector.projectors[0]) === null || _projector$projectors4 === void 0 ? void 0 : (_projector$projectors5 = _projector$projectors4.elem) === null || _projector$projectors5 === void 0 ? void 0 : _projector$projectors5.height) ?? '?'}` : `?x?`}`;
        this.videoResolutionElem.childNodes[0].nodeValue = videoResolution;
        this.videoSyncedResolutionElem.childNodes[0].nodeValue = videoSyncedResolution;
        this.projectorBufferResolutionElem.childNodes[0].nodeValue = projectorBufferResolution;
        this.projectorResolutionElem.childNodes[0].nodeValue = projectorResolution;
        if (this.videoBufferResolutionElem) {
          var _projectorBuffer$elem, _projectorBuffer$elem2, _projectorBuffer$ctx, _projectorBuffer$ctx2, _projectorBuffer$ctx3;
          const projectorBuffer = this.ambientlight.projectorBuffer;
          const videoBufferResolution = `
          VIDEO BUFFER: ${(projectorBuffer === null || projectorBuffer === void 0 ? void 0 : (_projectorBuffer$elem = projectorBuffer.elem) === null || _projectorBuffer$elem === void 0 ? void 0 : _projectorBuffer$elem.width) ?? '?'}x${(projectorBuffer === null || projectorBuffer === void 0 ? void 0 : (_projectorBuffer$elem2 = projectorBuffer.elem) === null || _projectorBuffer$elem2 === void 0 ? void 0 : _projectorBuffer$elem2.height) ?? '?'}${(projectorBuffer === null || projectorBuffer === void 0 ? void 0 : (_projectorBuffer$ctx = projectorBuffer.ctx) === null || _projectorBuffer$ctx === void 0 ? void 0 : _projectorBuffer$ctx.loadTime) === undefined ? '' : `
          [ load: ${((projectorBuffer === null || projectorBuffer === void 0 ? void 0 : (_projectorBuffer$ctx2 = projectorBuffer.ctx) === null || _projectorBuffer$ctx2 === void 0 ? void 0 : _projectorBuffer$ctx2.loadTime) ?? 0).toFixed(1)}ms
          | draw: ${((projectorBuffer === null || projectorBuffer === void 0 ? void 0 : (_projectorBuffer$ctx3 = projectorBuffer.ctx) === null || _projectorBuffer$ctx3 === void 0 ? void 0 : _projectorBuffer$ctx3.drawTime) ?? 0).toFixed(1)}ms]`}`;
          this.videoBufferResolutionElem.childNodes[0].nodeValue = videoBufferResolution;
        }
      }
      if (this.settings.showFPS) {
        const videoFrameRate = this.ambientlight.videoFrameRate;
        const videoFPSText = `VIDEO: ${videoFrameRate.toFixed(2)} ${videoFrameRate ? `(${(1000 / videoFrameRate).toFixed(1)}ms)` : ''}`;
        const videoDroppedFrameCount = this.ambientlight.getVideoDroppedFrameCount();
        const videoDroppedFramesText = `VIDEO DROPPED: ${videoDroppedFrameCount}`;
        const videoDroppedFramesColor = videoDroppedFrameCount > 0 ? '#ff3' : '#7f7';
        let videoSyncedText = '';
        let videoSyncedColor = '#f55';
        if (this.settings.videoOverlayEnabled) {
          const videoOverlay = this.ambientlight.videoOverlay;
          videoSyncedText = `VIDEO SYNCED: ${videoOverlay !== null && videoOverlay !== void 0 && videoOverlay.isHidden ? 'NO' : 'YES'}`;
          videoSyncedColor = videoOverlay !== null && videoOverlay !== void 0 && videoOverlay.isHidden ? '#f55' : '#7f7';
        }
        const ambientlightFrameRate = this.ambientlight.ambientlightFrameRate;
        const framerateLimit = this.ambientlight.getRealFramerateLimit();
        const ambientlightFPSText = `AMBIENT: ${ambientlightFrameRate.toFixed(2)} ${ambientlightFrameRate ? `(${(1000 / ambientlightFrameRate).toFixed(1)}ms)${framerateLimit ? ` LIMITED TO: ${framerateLimit.toFixed(2)}` : ''}` : ''}`;
        const ambientlightFrameRateTarget = framerateLimit ? Math.min(videoFrameRate, framerateLimit) : videoFrameRate;
        const ambientlightFPSColor = ambientlightFrameRate < ambientlightFrameRateTarget * 0.9 ? '#f55' : ambientlightFrameRate < ambientlightFrameRateTarget - 0.2 ? '#ff3' : '#7f7';
        const ambientlightDroppedFramesText = `AMBIENT DROPPED: ${this.ambientlight.ambientlightVideoDroppedFrameCount}`;
        const ambientlightDroppedFramesColor = this.ambientlight.ambientlightVideoDroppedFrameCount > 0 ? '#ff3' : '#7f7';
        this.videoFPSElem.childNodes[0].nodeValue = videoFPSText;
        this.videoDroppedFramesElem.childNodes[0].nodeValue = videoDroppedFramesText;
        this.videoDroppedFramesElem.style.color = videoDroppedFramesColor;
        this.videoSyncedElem.childNodes[0].nodeValue = videoSyncedText;
        this.videoSyncedElem.style.color = videoSyncedColor;
        this.ambientlightFPSElem.childNodes[0].nodeValue = ambientlightFPSText;
        this.ambientlightFPSElem.style.color = ambientlightFPSColor;
        this.ambientlightDroppedFramesElem.childNodes[0].nodeValue = ambientlightDroppedFramesText;
        this.ambientlightDroppedFramesElem.style.color = ambientlightDroppedFramesColor;
      }
      if (this.settings.showFrametimes && this.settings.showFPS) {
        const displayFrameRate = Math.max(24, this.ambientlight.displayFrameRate);
        const videoFrameRate = this.ambientlight.videoFrameRate;
        const displayFPSText = `DISPLAY: ${displayFrameRate.toFixed(2)} ${displayFrameRate ? `(${(1000 / displayFrameRate).toFixed(1)}ms)` : ''}`;
        const displayFPSColor = displayFrameRate < videoFrameRate - 1 ? '#f55' : displayFrameRate < videoFrameRate - 0.2 ? '#ff3' : '#7f7';
        this.displayFPSElem.childNodes[0].nodeValue = displayFPSText;
        this.displayFPSElem.style.color = displayFPSColor;
      } else if (this.displayFPSElem.childNodes[0].nodeValue !== '') {
        this.displayFPSElem.childNodes[0].nodeValue = '';
      }
      this.updateFrameTimes();
      this.updateBarDetectionDurations();
      if ((this.settings.showBarDetectionStats || this.settings.showFPS || this.settings.showResolutions || this.settings.showFrametimes) && ((_this$FPSListElem2 = this.FPSListElem) === null || _this$FPSListElem2 === void 0 ? void 0 : _this$FPSListElem2.isConnected) === false) {
        var _this$ambientlight$vi7;
        (_this$ambientlight$vi7 = this.ambientlight.videoPlayerElem) === null || _this$ambientlight$vi7 === void 0 ? void 0 : _this$ambientlight$vi7.prepend(this.FPSListElem);
      }
    }
  }

  const baseUrl = chrome.runtime.getURL('') || '';
  class Ambientlight {
    constructor(videoElem, ytdAppElem, ytdWatchElem, mastheadElem) {
      this.innerStrength = 2;
      this.lastUpdateSizesChanged = 0;
      this.averageVideoFramesDifference = 1;
      this.videoOffset = {};
      this.srcVideoOffset = {};
      this.videoScale = 100;
      this.isHidden = true;
      this.isOnVideoPage = true;
      this.showedCompareWarning = false;
      this.getImageDataAllowed = true;
      this.catchedErrors = [];
      this.atTop = true;
      this.p = null;
      this.view = undefined;
      this.immersiveTheater = false;
      this.isFullscreen = false;
      this.isFillingFullscreen = false;
      this.isVideoHiddenOnWatchPage = false;
      this.isVrVideo = false;
      this.isHdr = false;
      this.isControlledByAnotherExtension = false;
      this.lastUpdateStatsTime = 0;
      this.updateStatsInterval = 1000;
      this.frameCountHistory = 4000;
      this.videoFrameCount = 0;
      this.displayFrameRate = 0;
      this.videoFrameRate = 0;
      this.ambientlightFrameCount = 0;
      this.ambientlightFrameRate = 0;
      this.ambientlightVideoDroppedFrameCount = 0;
      this.previousFrameTime = 0;
      this.previousDrawTime = 0;
      this.clearTime = 0;
      this.shouldDrawDirectlyFromVideoElem = () => this.enableMozillaBugReadPixelsWorkaround && this.projector.webGLVersion === 2;
      this.waitForPageload = async () => {
        if (this.settings.enabled && !this.settings.prioritizePageLoadSpeed || !this.videoElem || !isWatchPageUrl()) return;
        if (this.videoElem.readyState < 3) {
          await new Promise(resolve => {
            if (!(this.videoElem.readyState < 3)) {
              resolve();
              return;
            }
            const handleCanPlay = () => {
              off(this.videoElem, 'canplay', handleCanPlay);
              resolve();
            };
            on(this.videoElem, 'canplay', handleCanPlay);
          });
          await new Promise(resolve => requestIdleCallback(resolve, {
            timeout: 1000
          }));
        } else {
          await new Promise(resolve => requestIdleCallback(resolve, {
            timeout: 2000
          }));
        }
        if (document.visibilityState === 'hidden') {
          await new Promise(resolve => raf(resolve));
        }
      };
      this.lastVideoElemSrc = '';
      this.initVideoIfSrcChanged = async () => {
        if (this.lastVideoElemSrc === this.videoElem.src) {
          return false;
        }
        this.lastVideoElemSrc = this.videoElem.src;
        await this.start();
        return true;
      };
      this.resetAverageVideoFramesDifference = () => {
        var _this$chromiumBugVide;
        cancelGetAverageVideoFramesDifference();
        this.averageVideoFramesDifference = 1;
        this.settings.updateAverageVideoFramesDifferenceInfo();
        if ((_this$chromiumBugVide = this.chromiumBugVideoJitterWorkaround) !== null && _this$chromiumBugVide !== void 0 && _this$chromiumBugVide.update) this.chromiumBugVideoJitterWorkaround.update();
      };
      this.calculateAverageVideoFramesDifference = async () => {
        if (!this.settings.energySaver || !this.videoPlayerElem) return;
        try {
          var _this$chromiumBugVide2;
          const format = await injectedScript.postAndReceiveMessage('player-storyboard-format');
          if (!format) return;
          const difference = await getAverageVideoFramesDifference(format);
          if (difference === undefined) return;
          this.averageVideoFramesDifference = difference;
          this.settings.updateAverageVideoFramesDifferenceInfo();
          if ((_this$chromiumBugVide2 = this.chromiumBugVideoJitterWorkaround) !== null && _this$chromiumBugVide2 !== void 0 && _this$chromiumBugVide2.update) this.chromiumBugVideoJitterWorkaround.update();
        } catch (ex) {
          if (!['InvalidStateError', 'SecurityError'].includes(ex === null || ex === void 0 ? void 0 : ex.name) && !isNetworkError(ex)) {
            SentryReporter.captureException(ex);
          }
        }
      };
      this.handleVideoError = () => {
        this.handleVideoErrorTimeout = undefined;
        this.initVideoListeners();
        if (!this.videoElem.paused) {
          this.videoListeners.playing();
        }
      };
      this.ytScalingBaseKeywords = ['yt:crop=', 'yt:stretch='];
      this.updateKeywordsToPreventTheaterScaling = () => {
        try {
          var _document$head$queryS;
          let keywords = ((_document$head$queryS = document.head.querySelector('meta[name="keywords"]')) === null || _document$head$queryS === void 0 ? void 0 : _document$head$queryS.content) ?? '';
          if (!this.ytScalingBaseKeywords.some(baseKeyword => keywords.includes(baseKeyword))) return;
          keywords = keywords.split(', ');
          if (this.settings.enabled) {
            keywords = keywords.filter(keyword => !this.ytScalingBaseKeywords.some(baseKeyword => keyword.startsWith(baseKeyword)));
          }
          keywords = keywords.join(',');
          injectedScript.postMessage('video-player-update-video-data-keywords', keywords);
        } catch (ex) {
          SentryReporter.captureException(ex);
        }
      };
      this.updateVideoPlayerSize = async () => {
        if (this.videoPlayerSetSizePromise) {
          await this.videoPlayerSetSizePromise;
          return;
        }
        await injectedScript.postAndReceiveMessage('video-player-set-size');
      };
      this.updateIsVideoHiddenOnWatchPage = () => {
        var _this$thumbnailOverla, _this$thumbnailOverla2;
        const classList = this.videoPlayerElem.classList;
        const hidden = classList.contains('ended-mode') || classList.contains('unstarted-mode') && !(((_this$thumbnailOverla = this.thumbnailOverlayElem) === null || _this$thumbnailOverla === void 0 ? void 0 : (_this$thumbnailOverla2 = _this$thumbnailOverla.style) === null || _this$thumbnailOverla2 === void 0 ? void 0 : _this$thumbnailOverla2.display) !== '');
        if (this.isVideoHiddenOnWatchPage === hidden) return false;
        this.isVideoHiddenOnWatchPage = hidden;
        this.sizesInvalidated = true;
        return true;
      };
      this.delayResizes = true;
      this.resizeDurationThreshold = 300;
      this.resizeDurations = [this.resizeDurationThreshold, this.resizeDurationThreshold, this.resizeDurationThreshold, this.resizeDurationThreshold];
      this.resizeAfterFrames = 0;
      this.resize = wrapErrorHandler(async (afterFrames = 0) => {
        if (!this.settings.enabled || !this.isOnVideoPage || this.pendingStart) {
          this.resizeAfterFrames = 0;
          if (this.scheduledResize) cancelAnimationFrame(this.scheduledResize);
          this.scheduledResize = undefined;
          return;
        }
        this.delayResizes = this.delayResizes || this.videoPlayerResizeFromFullscreen || this.videoPlayerResizeToFullscreen;
        this.resizeAfterFrames = this.delayResizes ? Math.max(this.resizeAfterFrames, afterFrames) : 0;
        if (this.scheduledResize) return;
        if (this.resizeAfterFrames === 0) {
          this.sizesInvalidated = true;
          const start = performance.now();
          await this.optionalFrame();
          requestIdleCallback(() => this.measureResizeDuration(start), {
            timeout: 1000
          });
        }
        this.scheduledResize = raf(() => {
          this.scheduledResize = undefined;
          if (this.resizeAfterFrames === 0) return;
          this.resizeAfterFrames--;
          this.resize();
        });
      });
      this.measureResizeDuration = start => {
        const duration = Math.min(1000, performance.now() - start);
        this.resizeDurations.push(duration);
        if (this.resizeDurations.length > 4) this.resizeDurations.splice(0, 1);
        const averageDuration = this.resizeDurations.reduce((a, b) => a + b) / this.resizeDurations.length;
        this.delayResizes = averageDuration >= this.resizeDurationThreshold;
      };
      this.handleDocumentVisibilityChange = async () => {
        if (this.handlePageVisibilityTimeout) {
          clearTimeout(this.handlePageVisibilityTimeout);
          this.handlePageVisibilityTimeout = undefined;
        }
        if (!this.settings.enabled || !this.isOnVideoPage) return;
        const isPageHidden = document.visibilityState === 'hidden';
        if (this.isPageHidden === isPageHidden) return;
        this.isPageHidden = isPageHidden;
        if (isPageHidden) {
          this.pageHiddenTime = performance.now();
          this.checkIfNeedToHideVideoOverlay();
          this.buffersCleared = true;
          this.sizesChanged = true;
          this.handlePageVisibilityTimeout = setTimeout$1(function handlePageVisibility() {
            this.handlePageVisibilityTimeout = undefined;
            this.pageHiddenClearTime = performance.now();
            this.clear();
          }.bind(this), 3000);
        } else {
          this.pageShownTime = performance.now();
          await this.theming.updateTheme();
          await this.optionalFrame();
        }
      };
      this.handleKeyDown = async e => {
        var _e$key;
        if (!this.isOnVideoPage) return;
        if (document.activeElement) {
          const el = document.activeElement;
          const tag = el.tagName;
          const inputs = ['INPUT', 'SELECT', 'TEXTAREA'];
          if (inputs.indexOf(tag) !== -1 || el.getAttribute('contenteditable') != null && el.getAttribute('contenteditable') !== 'false') {
            return;
          }
        }
        if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
        await this.onKeyPressed((_e$key = e.key) === null || _e$key === void 0 ? void 0 : _e$key.toUpperCase());
      };
      this.handleVideoFocus = () => {
        if (!this.settings.enabled || !this.isOnVideoPage || !this.ytdAppElem) return;
        const startTop = this.view === VIEW_FULLSCREEN ? this.ytdAppElem.scrollTop : window.scrollY;
        raf(function handleVideoFocusRaf() {
          const endTop = this.ytdAppElem.scrollTop ;
          if (startTop === endTop) return;
          if (this.view === VIEW_FULLSCREEN) {
            this.ytdAppElem.scrollTop = startTop;
          } else {
            window.scrollTo(window.scrollX, startTop);
          }
        }.bind(this));
      };
      this.onKeyPressed = async key => {
        if (key === ' ') return;
        const keys = this.settings.getKeys();
        if (key === keys.detectHorizontalBarSizeEnabled) this.settings.clickUI('detectHorizontalBarSizeEnabled');
        if (key === keys.detectVerticalBarSizeEnabled) this.settings.clickUI('detectVerticalBarSizeEnabled');
        if (key === keys.detectVideoFillScaleEnabled) this.settings.clickUI('detectVideoFillScaleEnabled');
        if (key === keys.enabled) await this.toggleEnabled();
      };
      this.getContentElem = () => this.ytdAppElem ? this.ytdAppElem.querySelector('#content.ytd-app') : this.videoPlayerElem;
      this.initProjector = async () => {
        if (this.settings.webGL) {
          try {
            this.projector = await new ProjectorWebGL(this, this.projectorListElem, this.initProjectorListeners, this.settings);
          } catch (ex) {
            this.projector = undefined;
            if (!this.settings.webGLCrashDate) {
              SentryReporter.captureException(ex);
            } else {
              console.log(ex);
              if (ex !== null && ex !== void 0 && ex.details) console.log(ex.details);
            }
            this.settings.handleWebGLCrash();
          }
        }
        if (!this.projector) {
          this.projector = new Projector2d(this, this.projectorListElem, this.initProjectorListeners, this.settings);
        }
        this.initProjectorListeners();
      };
      this.initProjectorListeners = () => {
        this.isAmbientlightHiddenOnWatchPage = false;
        if (this.ambientlightObserver) {
          this.ambientlightObserver.disconnect();
        }
        if (!this.ambientlightObserver) {
          this.ambientlightObserver = new IntersectionObserver(wrapErrorHandler(async entries => {
            for (const entry of entries) {
              this.isAmbientlightHiddenOnWatchPage = entry.intersectionRatio === 0;
              if (this.isAmbientlightHiddenOnWatchPage) continue;
              await this.optionalFrame();
            }
          }, true), {
            threshold: 0.0001
          });
        }
        this.ambientlightObserver.observe(this.projector.boundaryElem);
      };
      this.getView = () => {
        if (!this.settings.enabled) return VIEW_DISABLED;
        if (!document.contains(this.videoPlayerElem)) return VIEW_DETACHED;
        if (document.fullscreenElement || this.videoPlayerElem.classList.contains('ytp-fullscreen')) return VIEW_FULLSCREEN;
        if (this.videoPlayerElem.classList.contains('ytp-player-minimized')) return VIEW_POPUP;
        if (this.ytdWatchElemFromVideo ? this.ytdWatchElemFromVideo.getAttribute('theater') != null : this.playerTheaterContainerElemFromVideo) {
          return VIEW_THEATER;
        }
        return VIEW_SMALL;
      };
      this.initVR = () => {
        if (getBrowser() === 'Firefox') {
          this.settings.setWarning('Ambient light does not support VR videos', false, false);
        } else {
          this.vrVideoElem = this.videoPlayerElem.querySelector('.webgl canvas');
          this.vrVideoElem.dataset.ytalElem = 'vr-video';
          this.nextVrFrameListener = injectedScript.addMessageListener('next-vr-frame', this.drawVR);
          injectedScript.postMessage('init-vr-video');
        }
        this.settings.updateVisibility();
      };
      this.disposeVR = () => {
        if (this.nextVrFrameListener) {
          injectedScript.removeMessageListener(this.nextVrFrameListener);
          this.nextVrFrameListener = undefined;
        }
        injectedScript.postMessage('dispose-vr-video');
        this.vrVideoElem = undefined;
        if (getBrowser() === 'Firefox') {
          this.settings.setWarning();
        }
        this.settings.updateVisibility();
      };
      this.drawVR = () => {
        this.nextFrame();
      };
      this.updateView = async (skipUpdateImmersiveMode = false) => {
        var _this$videoPlayerElem, _this$videoPlayerElem2, _this$videoElem;
        const isVrVideo = (_this$videoPlayerElem = this.videoPlayerElem) === null || _this$videoPlayerElem === void 0 ? void 0 : (_this$videoPlayerElem2 = _this$videoPlayerElem.classList) === null || _this$videoPlayerElem2 === void 0 ? void 0 : _this$videoPlayerElem2.contains('ytp-webgl-spherical');
        if (isVrVideo != this.isVrVideo) {
          this.isVrVideo = isVrVideo;
          this.sizesChanged = true;
        }
        if (!isVrVideo && this.vrVideoElem) this.disposeVR();
        const wasControlledByAnotherExtension = this.isControlledByAnotherExtension;
        this.isControlledByAnotherExtension = document.body.classList.contains('efyt-mini-player') || ((_this$videoElem = this.videoElem) === null || _this$videoElem === void 0 ? void 0 : _this$videoElem.classList.contains('stefanvdvideotop'));
        if (wasControlledByAnotherExtension !== this.isControlledByAnotherExtension) {
          this.sizesChanged = true;
        }
        const view = this.getView();
        if (this.view === view) return false;
        this.view = view;
        if (!skipUpdateImmersiveMode) await this.updateImmersiveMode();
        const isFullscreen = view == VIEW_FULLSCREEN;
        const fullscreenChanged = isFullscreen !== this.isFullscreen;
        this.isFullscreen = isFullscreen;
        this.updateFixedStyle();
        this.settings.updateVisibility();
        if (fullscreenChanged && this.settings.enabled && this.isOnVideoPage) {
          this.videoPlayerResizeFromFullscreen = !this.isFullscreen;
          this.videoPlayerResizeToFullscreen = this.isFullscreen;
        }
        const fullscreenElemChanged = document.fullscreenElement !== this.fullscreenElem;
        this.fullscreenElem = document.fullscreenElement;
        if (fullscreenChanged || fullscreenElemChanged) {
          if (this.isFullscreen) {
            this.appendElemToFullscreenElem();
          } else {
            this.appendElemToContentElem();
          }
        }
        if (!skipUpdateImmersiveMode) {
          raf(() => this.updateVideoPlayerSize());
        }
        return true;
      };
      this.isInEnabledView = () => {
        const enableInViews = this.settings.enableInViews;
        const enabledInView = {
          [VIEW_SMALL]: enableInViews <= 2,
          [VIEW_THEATER]: enableInViews === 0 || enableInViews >= 2 && enableInViews <= 4,
          [VIEW_FULLSCREEN]: enableInViews === 0 || enableInViews >= 4
        }[this.view] || false;
        if (isEmbedPageUrl()) {
          return this.settings.enableInEmbed && (this.view !== VIEW_FULLSCREEN || enabledInView);
        }
        const enabledInPictureInPicture = this.settings.enableInPictureInPicture || !this.videoIsPictureInPicture;
        return enabledInView && enabledInPictureInPicture;
      };
      this.updatedSizesChanged = false;
      this.onNextFrame = async function onNextFrame(compose) {
        if (!this.scheduledNextFrame) return;
        this.scheduledNextFrame = false;
        if (this.videoElem.ended) return;
        this.displayFrameTime = compose;
        this.displayFrameCount++;
        if (this.settings.showFrametimes && this.settings.frameSync !== FRAMESYNC_VIDEOFRAMES) {
          const presentedFrames = this.getVideoFrameCount();
          if (this.settings.frameSync === FRAMESYNC_DISPLAYFRAMES || this.settings.frameBlending || this.previousPresentedFrames !== presentedFrames) {
            this.stats.receiveAnimationFrametimes(compose, presentedFrames);
          }
          this.previousPresentedFrames = presentedFrames;
        }
        if (this.settings.framerateLimit || this.limitFramerateToSaveEnergy()) {
          await this.onNextLimitedFrame(compose);
        } else {
          await this.nextFrame(compose);
          this.nextFrameTime = undefined;
        }
      }.bind(this);
      this.onNextFrameWrapped = wrapErrorHandler(this.onNextFrame);
      this.scheduleNextFrameDelayed = () => requestAnimationFrame(this.onNextFrameWrapped);
      this.onNextLimitedFrame = async compose => {
        const time = performance.now();
        if (this.nextFrameTime && !this.buffersCleared && !this.sizesChanged && !this.sizesInvalidated) {
          if (this.settings.frameSync === FRAMESYNC_VIDEOFRAMES && !this.videoIsHidden) {
            if (this.nextFrameTime > time && this.videoFrameCallbackReceived) {
              this.videoFrameCallbackReceived = false;
            }
            if (!this.videoFrameCallbackReceived) {
              this.scheduleNextFrame();
              return;
            }
          } else if (this.nextFrameTime > time) {
            this.scheduleNextFrame();
            return;
          }
        }
        const ambientlightFrameCount = this.ambientlightFrameCount;
        await this.nextFrame(compose);
        if (this.ambientlightFrameCount <= ambientlightFrameCount) {
          return;
        }
        const realFramerateLimit = this.getRealFramerateLimit();
        this.nextFrameTime = Math.max((this.nextFrameTime || time) + 1000 / realFramerateLimit, time);
      };
      this.averageVideoFramesDifference5SecondsThreshold = 0.002;
      this.averageVideoFramesDifference1SecondThreshold = 0.0175;
      this.getRealFramerateLimit = () => {
        if (this.limitFramerateToSaveEnergy()) {
          if (this.averageVideoFramesDifference < this.averageVideoFramesDifference5SecondsThreshold) return 0.2;
          if (this.averageVideoFramesDifference < this.averageVideoFramesDifference1SecondThreshold) return 1;
        }
        const frameFading = this.settings.frameFading ? Math.round(Math.pow(this.settings.frameFading, 2)) : 0;
        const frameFadingMax = 15 * Math.pow(ProjectorWebGL.subProjectorDimensionMax, 2) - 1;
        const realFramerateLimit = this.settings.webGL && frameFading > frameFadingMax ? Math.max(1, frameFadingMax / (frameFading || 1) * this.settings.framerateLimit) : this.settings.framerateLimit;
        return realFramerateLimit;
      };
      this.limitFramerateToSaveEnergy = () => this.averageVideoFramesDifference < this.averageVideoFramesDifference1SecondThreshold && !this.sizesInvalidated && !this.buffersCleared && this.videoElem.currentTime > 5 && this.videoElem.currentTime < this.videoElem.duration - 5;
      this.canScheduleNextFrame = () => !(!this.settings.enabled || !this.isOnVideoPage || this.isVrVideo && this.vrVideoElem || this.pendingStart || this.videoElem.ended || this.videoElem.paused || this.videoElem.seeking || this.isVideoHiddenOnWatchPage || this.isAmbientlightHiddenOnWatchPage);
      this.optionalFrame = async (fromSettingChange = false) => {
        if (!this.initializedTime || !this.settings.enabled || !this.isOnVideoPage || this.pendingStart || this.resizeAfterFrames > 0 || this.videoElem.ended || !this.videoElem.paused && !this.videoElem.seeking && this.scheduledNextFrame || !fromSettingChange && this.isVrVideo && this.vrVideoElem) return;
        await this.nextFrame();
      };
      this.nextFrame = async compose => {
        try {
          var _results, _results2;
          const frameTimes = this.settings.showFrametimes ? {
            frameStart: performance.now()
          } : {};
          this.delayedUpdateSizesChanged = false;
          if (this.p && this.sizesInvalidated) {
            this.updateSizesChanged();
          }
          if (!this.p || this.sizesChanged) {
            if (!(await this.updateSizes())) return;
          } else {
            this.delayedUpdateSizesChanged = true;
          }
          let results = {};
          if (this.settings.showFrametimes) {
            this.stats.addVideoFrametimes(frameTimes, compose);
            frameTimes.drawStart = performance.now();
          }
          if (!this.settings.webGL || this.getImageDataAllowed) {
            results = (await this.drawAmbientlight(compose)) || {};
          }
          if (this.settings.showFrametimes) frameTimes.drawEnd = performance.now();
          this.scheduleNextFrame();
          if ((_results = results) !== null && _results !== void 0 && _results.detectBarSize) {
            await this.scheduleBarSizeDetection();
          }
          if (this.settings.frameSync === FRAMESYNC_DISPLAYFRAMES || (_results2 = results) !== null && _results2 !== void 0 && _results2.hasNewFrame || this.settings.frameBlending) {
            this.stats.addAmbientFrametimes(frameTimes);
          }
          if (this.afterNextFrameIdleCallback || !this.settings.videoOverlayEnabled && !(this.delayedUpdateSizesChanged && performance.now() - this.lastUpdateSizesChanged > 2000) && !(performance.now() - this.lastUpdateStatsTime > this.updateStatsInterval)) return;
          this.afterNextFrameIdleCallback = requestIdleCallback(this.afterNextFrame, {
            timeout: 1000 / 30
          });
        } catch (ex) {
          this.setDrawWarning(ex);
          if (this.catchedErrors[ex.name]) {
            console.error(ex);
            return;
          }
          this.catchedErrors[ex.name] = true;
          if (['SecurityError', 'NS_ERROR_NOT_AVAILABLE', 'NS_ERROR_OUT_OF_MEMORY'].includes(ex.name)) {
            console.warn('Failed to display the ambient light');
            console.error(ex);
            return;
          }
          throw ex;
        }
      };
      this.setDrawWarning = ex => {
        const message = ex.name === 'SecurityError' ? 'A refresh could help, but it is most likely that your browser does not allow the ambient light to read the video pixels of this specific YouTube video. You can probably watch other YouTube videos without this problem.' : `A refresh of the page might help. If not, there could be a specific problem with this YouTube video. Or searching the error message below might help.\n\nError: ${ex.name}\nReason: ${ex.message}`;
        this.settings.setWarning(`Failed to display the ambient light\n\n${message}`);
      };
      this.afterNextFrame = async function afterNextFrame() {
        try {
          this.afterNextFrameIdleCallback = undefined;
          if (this.settings.videoOverlayEnabled) {
            this.detectFrameRates();
            this.checkIfNeedToHideVideoOverlay();
          }
          if (this.delayedUpdateSizesChanged && performance.now() - this.lastUpdateSizesChanged > 2000) {
            this.updateSizesChanged(true);
            if (this.sizesChanged) {
              await this.optionalFrame();
            }
          }
          if (performance.now() - this.lastUpdateStatsTime > this.updateStatsInterval) {
            this.lastUpdateStatsTime = performance.now();
            requestIdleCallback(function afterNextFrameUpdateStats() {
              if (!this.settings.videoOverlayEnabled) {
                this.detectFrameRates();
              }
              this.stats.update();
            }.bind(this), {
              timeout: 100
            });
          }
        } catch (ex) {
          if (this.scheduledNextFrame) {
            cancelAnimationFrame(this.scheduledNextFrame);
            this.scheduledNextFrame = undefined;
          }
          throw ex;
        }
      }.bind(this);
      this.videoFrameCounts = [];
      this.displayFrameCounts = [];
      this.displayFrameCount = 0;
      this.detectDisplayFrameRate = update => {
        this.displayFrameRate = this.detectFrameRate(this.displayFrameCounts, this.displayFrameCount, this.displayFrameRate, this.displayFrameTime, update);
        this.displayFrameTime = undefined;
      };
      this.ambientlightFrameCounts = [];
      this.shouldShow = () => this.settings.enabled && this.isOnVideoPage && !(this.isVrVideo && !this.settings.enableInVRVideos) && this.isInEnabledView();
      this.scheduleBarSizeDetection = async () => {
        try {
          this.checkGetImageDataAllowed();
          if (!this.getImageDataAllowed) return;
          await this.barDetection.detect(this.shouldDrawDirectlyFromVideoElem() || (this.projectorBuffer.elem.height < 256 || this.projectorBuffer.elem.width < 256) && this.projectorBuffer.elem.height < this.videoElem.videoHeight ? this.videoElem : this.projectorBuffer.elem, this.settings.detectColoredHorizontalBarSizeEnabled, this.settings.detectHorizontalBarSizeOffsetPercentage, this.settings.detectHorizontalBarSizeEnabled, this.settings.horizontalBarsClipPercentage, this.settings.detectVerticalBarSizeEnabled, this.settings.verticalBarsClipPercentage, this.p ? this.p.h / this.p.w : 1, !this.settings.frameBlending, this.settings.barSizeDetectionAverageHistorySize || 1, this.settings.barSizeDetectionAllowedElementsPercentage || 20, this.settings.barSizeDetectionAllowedUnevenBarsPercentage || 20, wrapErrorHandler(this.scheduleBarSizeDetectionCallback));
        } catch (ex) {
          if (!this.showedDetectBarSizeWarning) {
            this.showedDetectBarSizeWarning = true;
            throw ex;
          }
        }
      };
      this.scheduleBarSizeDetectionCallback = async (horizontalPercentage, verticalPercentage) => {
        const horizontalBarChanged = this.settings.detectHorizontalBarSizeEnabled && horizontalPercentage !== undefined && this.setHorizontalBars(horizontalPercentage);
        const verticalBarChanged = this.settings.detectVerticalBarSizeEnabled && verticalPercentage !== undefined && this.setVerticalBars(verticalPercentage);
        if (!horizontalBarChanged && !verticalBarChanged) return;
        this.sizesChanged = true;
        await this.optionalFrame();
      };
      this.start = async (initial = false) => {
        if (!this.isOnVideoPage || !this.settings.enabled || this.pendingStart) return;
        await this.updateHdr();
        this.showedCompareWarning = false;
        this.showedDetectBarSizeWarning = false;
        this.nextFrameTime = undefined;
        this.ambientlightVideoDroppedFrameCount = 0;
        this.buffersCleared = true;
        this.barDetection.reset();
        this.checkGetImageDataAllowed();
        await this.resetSettingsIfNeeded();
        this.updateKeywordsToPreventTheaterScaling();
        await this.updateView(true);
        this.pendingStart = true;
        if (initial) {
          if (document.visibilityState === 'hidden') {
            await new Promise(resolve => raf(resolve));
          }
        }
        this.pendingStart = undefined;
        if (this.shouldShow()) await this.show();
        if (!this.settings.enabled || !this.isOnVideoPage) return;
        this.calculateAverageVideoFramesDifference();
        this.lastUpdateStatsTime = performance.now() + this.updateStatsInterval;
        await this.nextFrame();
      };
      this.updateHdr = wrapErrorHandler(async function updateHdr() {
        var _this$videoElem2;
        if (!this.settings.webGL || !(((_this$videoElem2 = this.videoElem) === null || _this$videoElem2 === void 0 ? void 0 : _this$videoElem2.readyState) > 1)) return;
        try {
          let isHdr;
          if (typeof VideoFrame !== 'undefined') {
            var _videoFrame$colorSpac;
            const videoFrame = new VideoFrame(this.videoElem, {
              timestamp: 0
            });
            isHdr = (videoFrame === null || videoFrame === void 0 ? void 0 : (_videoFrame$colorSpac = videoFrame.colorSpace) === null || _videoFrame$colorSpac === void 0 ? void 0 : _videoFrame$colorSpac.primaries) === 'bt2020';
            videoFrame.close();
          } else {
            isHdr = await injectedScript.postAndReceiveMessage('is-hdr-video');
          }
          if (this.isHdr === isHdr) return;
          this.isHdr = isHdr;
          if (isHdr) {
            this.initWebGLHdrProjectorBuffer();
            this.projectorBuffer = this.hdrProjectorBuffer;
          } else if (this.hdrProjectorBuffer) {
            this.projectorBuffer = this.nonHdrProjectorBuffer;
          }
          this.sizesChanged = true;
        } catch (ex) {
          var _this$videoElem3;
          if ((ex === null || ex === void 0 ? void 0 : ex.name) === 'InvalidStateError') return;
          console.warn(`Failed to detect video color space:\n${ex.message}\n${''}(ReadyState: ${readyStateToString((_this$videoElem3 = this.videoElem) === null || _this$videoElem3 === void 0 ? void 0 : _this$videoElem3.readyState)})`);
        }
      }.bind(this), true);
      this.cancelScheduledRequestVideoFrame = () => {
        var _this$videoElem4;
        if (!this.requestVideoFrameCallbackId) return;
        if ((_this$videoElem4 = this.videoElem) !== null && _this$videoElem4 !== void 0 && _this$videoElem4.cancelVideoFrameCallback) {
          try {
            this.videoElem.cancelVideoFrameCallback(this.requestVideoFrameCallbackId);
          } catch {
            console.warn(`Failed to cancel current requested videoFrameCallback: ${this.requestVideoFrameCallbackId}`);
          }
        }
        this.requestVideoFrameCallbackId = undefined;
      };
      this.scheduleRequestVideoFrame = () => {
        if (this.requestVideoFrameCallbackId || this.settings.frameSync != FRAMESYNC_VIDEOFRAMES || this.videoIsHidden || !this.canScheduleNextFrame()) return;
        this.requestVideoFrameCallbackId = this.videoElem.requestVideoFrameCallback(this.onVideoFrame);
      };
      this.onVideoFrame = wrapErrorHandler(async function onVideoFrame(compose, info) {
        if (!this.requestVideoFrameCallbackId) {
          console.warn(`Old rvfc fired. Ignoring a possible duplicate. ${this.requestVideoFrameCallbackId} | ${compose} | ${info}`);
          return;
        }
        this.videoElem.requestVideoFrameCallback(function prescheduledVFC() {});
        this.stats.receiveVideoFrametimes(compose, info);
        this.requestVideoFrameCallbackId = undefined;
        this.videoFrameCallbackReceived = true;
        this.videoPresentedFrames = (info === null || info === void 0 ? void 0 : info.presentedFrames) || 0;
        this.videoFrameTime = compose;
        if (this.scheduledNextFrame) return;
        this.scheduledNextFrame = true;
        await this.onNextFrame();
      }.bind(this), true);
      this.updateLayoutPerformanceImprovements = wrapErrorHandler(() => {
        var _this$theming$liveCha, _this$theming$liveCha2;
        const html = document.documentElement;
        const liveChatHtml = (_this$theming$liveCha = this.theming.liveChatIframe) === null || _this$theming$liveCha === void 0 ? void 0 : (_this$theming$liveCha2 = _this$theming$liveCha.contentDocument) === null || _this$theming$liveCha2 === void 0 ? void 0 : _this$theming$liveCha2.documentElement;
        const enabled = this.settings.enabled && !this.isHidden && this.settings.layoutPerformanceImprovements;
        if (enabled) {
          html.setAttribute('data-ambientlight-layout-performance-improvements', true);
          if (liveChatHtml) liveChatHtml.setAttribute('data-ambientlight-layout-performance-improvements', true);
        } else {
          html.removeAttribute('data-ambientlight-layout-performance-improvements');
          if (liveChatHtml) liveChatHtml.removeAttribute('data-ambientlight-layout-performance-improvements');
        }
      }, true);
      this.updateAtTop = async () => {
        if (this.mastheadElem) this.mastheadElem.classList.toggle('at-top', this.atTop);
        if (this.settings.webGL) await this.projector.handleAtTopChange(this.atTop);
      };
      this.shouldEnableImmersiveMode = () => this.settings.immersiveTheaterView && this.view === VIEW_THEATER;
      return async function AmbientlightConstructor() {
        if (ytdAppElem) ytdAppElem.dataset.ytalElem = 'ytd-app';
        this.ytdAppElem = ytdAppElem;
        if (ytdWatchElem) ytdWatchElem.dataset.ytalElem = 'ytd-watch';
        this.ytdWatchElem = ytdWatchElem;
        if (mastheadElem) mastheadElem.dataset.ytalElem = 'masthead';
        this.mastheadElem = mastheadElem;
        this.detectChromiumBug1142112Workaround();
        this.detectChromiumBugDirectVideoOverlayWorkaround();
        this.detectMozillaBug1606251Workaround();
        this.detectMozillaBugSlowCanvas2DReadPixelsWorkaround();
        this.detectChromiumBug1092080Workaround();
        this.initElems(videoElem);
        await this.initSettings();
        this.applyChromiumBugDirectVideoOverlayWorkaround();
        await this.waitForPageload();
        this.theming = new Theming(this);
        this.stats = new Stats(this);
        this.barDetection = new BarDetection(this);
        this.detectChromiumBug1123708Workaround();
        this.detectChromiumBugVideoJitterWorkaround();
        if (document.visibilityState === 'hidden') {
          await new Promise(resolve => raf(resolve));
        }
        await this.initAmbientlightElems();
        this.initBuffersWrapper();
        await this.initProjectorBuffers();
        this.recreateProjectors();
        this.stats.initElems();
        this.initStyles();
        this.updateStyles();
        this.checkGetImageDataAllowed();
        await this.initListeners();
        new Promise(resolve => wrapErrorHandler(() => {
          this.initializedTime = performance.now();
          this.settings.onLoaded();
          resolve();
        })());
        if (this.settings.enabled) {
          await wrapErrorHandler(async () => {
            await this.enable(true);
          })();
        }
        return this;
      }.bind(this)();
    }
    get playerSmallContainerElem() {
      return document.querySelector(watchSelectors.map(selector => `${selector} #player-container-inner`).join(', '));
    }
    get playerTheaterContainerElem() {
      return document.querySelector(watchSelectors.map(selector => `${selector} #full-bleed-container`).join(', '));
    }
    get playerTheaterContainerElemFromVideo() {
      var _this$videoElem5;
      return (_this$videoElem5 = this.videoElem) === null || _this$videoElem5 === void 0 ? void 0 : _this$videoElem5.closest('#full-bleed-container');
    }
    get ytdWatchElemFromVideo() {
      var _this$videoElem6;
      return (_this$videoElem6 = this.videoElem) === null || _this$videoElem6 === void 0 ? void 0 : _this$videoElem6.closest(watchSelectors.join(', '));
    }
    get thumbnailOverlayElem() {
      if (!this._thumbnailOverlayElem) this._thumbnailOverlayElem = document.querySelector(watchSelectors.map(selector => `${selector} .ytp-cued-thumbnail-overlay`).join(', '));
      return this._thumbnailOverlayElem;
    }
    initElems(videoElem) {
      this.videoPlayerElem = videoElem.closest('.html5-video-player');
      if (!this.videoPlayerElem) {
        const error = new Error('Cannot find videoPlayerElem: .html5-video-player');
        error.details = getPageElems();
        error.details.videoIsInDocument = document.contains(videoElem);
        error.details.videoIsInBody = document.body.contains(videoElem);
        error.details.videoTree = getNodeTreeString(videoElem);
        setWarning(`Failed to load.\n${error.message}`);
        throw error;
      }
      this.videoPlayerElem.dataset.ytalElem = 'video-player';
      this.ytdPlayerElem = videoElem.closest('ytd-player');
      this.videoContainerElem = videoElem.closest('.html5-video-container');
      this.settingsMenuBtnParent = this.videoPlayerElem.querySelector('.ytp-right-controls, .ytp-chrome-controls > *:last-child');
      if (!this.settingsMenuBtnParent) {
        const error = new Error('Cannot find settingsMenuBtnParent: .ytp-right-controls, .ytp-chrome-controls > *:last-child');
        error.details = getPageElems();
        setWarning(`Failed to load.\n${error.message}`);
        throw error;
      }
      this.initVideoElem(videoElem, false);
    }
    initVideoElem(videoElem, initListeners = true) {
      this.cancelScheduledRequestVideoFrame();
      videoElem.dataset.ytalElem = 'video';
      this.videoElem = videoElem;
      this.applyChromiumBugDirectVideoOverlayWorkaround();
      if (initListeners) this.initVideoListeners();
    }
    detectMozillaBugSlowCanvas2DReadPixelsWorkaround() {
      const match = navigator.userAgent.match(/Firefox\/((?:\.|[0-9])+)/);
      const version = (match === null || match === void 0 ? void 0 : match.length) > 1 ? parseFloat(match[1]) : null;
      if (version && (version < 123 || version > 124)) {
        this.enableMozillaBugReadPixelsWorkaround = true;
      }
    }
    detectMozillaBug1606251Workaround() {
      const match = navigator.userAgent.match(/Firefox\/((?:\.|[0-9])+)/);
      const version = (match === null || match === void 0 ? void 0 : match.length) > 1 ? parseFloat(match[1]) : null;
      if (version && version < 74) {
        this.enableMozillaBug1606251Workaround = true;
      }
    }
    detectChromiumBug1142112Workaround() {
      const match = navigator.userAgent.match(/Chrome\/((?:\.|[0-9])+)/);
      const version = (match === null || match === void 0 ? void 0 : match.length) > 1 ? parseFloat(match[1]) : null;
      if (version && HTMLVideoElement.prototype.requestVideoFrameCallback) {
        this.enableChromiumBug1142112Workaround = true;
      }
    }
    applyChromiumBug1142112Workaround() {
      if (!this.enableChromiumBug1142112Workaround) return;
      injectedScript.postMessage('apply-chromium-bug-1142112-workaround');
    }
    detectChromiumBug1123708Workaround() {
      if (this.settings.webGL) return;
      const match = navigator.userAgent.match(/Chrome\/((?:\.|[0-9])+)/);
      const version = (match === null || match === void 0 ? void 0 : match.length) > 1 ? parseFloat(match[1]) : null;
      if (version && version >= 85) {
        this.enableChromiumBug1123708Workaround = true;
      }
    }
    detectChromiumBug1092080Workaround() {
      const match = navigator.userAgent.match(/Chrome\/((?:\.|[0-9])+)/);
      const version = (match === null || match === void 0 ? void 0 : match.length) > 1 ? parseFloat(match[1]) : null;
      if (version && version >= 82 && version < 88) {
        this.enableChromiumBug1092080Workaround = true;
      }
    }
    detectChromiumBugVideoJitterWorkaround() {
      if (!this.settings.webGL) return;
      const match = navigator.userAgent.match(/Chrome\/((?:\.|[0-9])+)/);
      const version = (match === null || match === void 0 ? void 0 : match.length) > 1 ? parseFloat(match[1]) : null;
      if (version) {
        this.enableChromiumBugVideoJitterWorkaround = true;
        this.settings.updateVisibility();
      }
    }
    detectChromiumBugDirectVideoOverlayWorkaround() {
      const match = navigator.userAgent.match(/Windows/);
      if ((match === null || match === void 0 ? void 0 : match.length) > 0) {
        this.enableChromiumBugDirectVideoOverlayWorkaround = true;
      }
    }
    applyChromiumBugDirectVideoOverlayWorkaround() {
      if (!this.videoElem || !this.settings) return;
      this.videoElem.classList.toggle('ambientlight__chromium-bug-direct-video-overlay-workaround', this.enableChromiumBugDirectVideoOverlayWorkaround && this.settings.chromiumDirectVideoOverlayWorkaround);
    }
    applyChromiumBugVideoJitterWorkaround() {
      try {
        if (!this.enableChromiumBugVideoJitterWorkaround) return;
        if (!this.settings.chromiumBugVideoJitterWorkaround) {
          if (this.chromiumBugVideoJitterWorkaround) {
            const {
              elem,
              observer
            } = this.chromiumBugVideoJitterWorkaround;
            observer.disconnect();
            if (elem.parentElement) elem.parentElement.removeChild(elem);
            this.chromiumBugVideoJitterWorkaround = undefined;
          }
          return;
        }
        if (this.chromiumBugVideoJitterWorkaround) return;
        const elem = document.createElement('div');
        elem.classList.add('ambientlight__chromium-bug-video-jitter-workaround');
        const update = wrapErrorHandler(function chromiumBugVideoJitterWorkaroundUpdate(isPlaying) {
          if (isPlaying === undefined) {
            isPlaying = this.videoPlayerElem.classList.contains('playing-mode');
          }
          const enable = this.averageVideoFramesDifference >= this.averageVideoFramesDifference1SecondThreshold && isPlaying && !this.isHidden && !this.videoIsHidden && !(this.settings.spread === 0 && this.settings.blur2 === 0);
          if (enable && elem.parentElement !== this.containerElem) {
            this.containerElem.appendChild(elem);
          } else if (!enable && elem.parentElement) {
            elem.parentElement.removeChild(elem);
          }
        }.bind(this), true);
        const observer = new MutationObserver(wrapErrorHandler(function chromiumBugVideoJitterWorkaroundMutation(mutations) {
          if (!this.chromiumBugVideoJitterWorkaround) return;
          for (const mutation of mutations) {
            const wasPlaying = mutation.oldValue.split(' ').includes('playing-mode');
            const isPlaying = mutation.target.classList.contains('playing-mode');
            if (wasPlaying === isPlaying) continue;
            update(isPlaying);
          }
        }.bind(this), true));
        observer.observe(this.videoPlayerElem, {
          attributes: true,
          attributeFilter: ['class'],
          attributeOldValue: true
        });
        this.chromiumBugVideoJitterWorkaround = {
          elem,
          observer,
          update
        };
        update(this.videoPlayerElem.classList.contains('playing-mode'));
      } catch (ex) {
        console.warn('applyChromiumBugVideoJitterWorkaround error. Continuing ambientlight initialization...');
        SentryReporter.captureException(ex);
        this.enableChromiumBugVideoJitterWorkaround = false;
      }
    }
    initStyles() {
      this.styleElem = document.createElement('style');
      this.styleElem.appendChild(document.createTextNode(''));
      document.head.appendChild(this.styleElem);
    }
    initAverageVideoFramesDifferenceListeners() {
      if (!this.ytdWatchElem) return;
      try {
        on(this.ytdWatchElem, 'yt-page-data-will-update', () => {
          if (this.averageVideoFramesDifference === 1) return;
          this.resetAverageVideoFramesDifference();
        }, undefined, true);
        on(document, 'yt-page-data-updated', () => {
          if (!this.settings.enabled || !this.isOnVideoPage) return;
          this.calculateAverageVideoFramesDifference();
        }, undefined, true);
      } catch (ex) {
        SentryReporter.captureException(ex);
      }
    }
    initVideoListeners() {
      this.videoListeners = this.videoListeners || {
        seeked: async () => {
          var _this$projectorBuffer, _this$projectorBuffer2;
          if (!this.settings.enabled || !this.isOnVideoPage) return;
          if ((_this$projectorBuffer = this.projectorBuffer) !== null && _this$projectorBuffer !== void 0 && (_this$projectorBuffer2 = _this$projectorBuffer.ctx) !== null && _this$projectorBuffer2 !== void 0 && _this$projectorBuffer2.clearPreviousRect) {
            this.projectorBuffer.ctx.clearPreviousRect();
          }
          if (await this.initVideoIfSrcChanged()) return;
          this.previousPresentedFrames = 0;
          this.videoFrameCounts = [];
          this.videoPresentedFrames = 0;
          this.displayFrameCounts = [];
          this.ambientlightFrameCounts = [];
          this.lastUpdateStatsTime = performance.now();
          this.barDetection.cancel();
          this.buffersCleared = true;
          if (this.settings.webGL && (this.settings.frameFading || this.settings.frameBlending)) {
            this.projector.drawTextureSize = {
              width: 0,
              height: 0
            };
          }
          await this.optionalFrame();
        },
        loadstart: () => {
          this.settings.setWarning(undefined, undefined, undefined, 'encrypted');
        },
        encrypted: () => {
          this.settings.setWarning('Unable to display an ambient light because YouTube has applied DRM protection to this video', true, true, 'encrypted');
        },
        loadeddata: async () => {
          var _this$projectorBuffer3, _this$projectorBuffer4;
          if (!this.settings.enabled || !this.isOnVideoPage) return;
          this.sizesChanged = true;
          this.buffersCleared = true;
          if ((_this$projectorBuffer3 = this.projectorBuffer) !== null && _this$projectorBuffer3 !== void 0 && (_this$projectorBuffer4 = _this$projectorBuffer3.ctx) !== null && _this$projectorBuffer4 !== void 0 && _this$projectorBuffer4.clearPreviousRect) {
            this.projectorBuffer.ctx.clearPreviousRect();
          }
          this.checkGetImageDataAllowed();
          await this.updateHdr();
          await this.initVideoIfSrcChanged();
        },
        playing: async () => {
          if (!this.settings.enabled || !this.isOnVideoPage) return;
          if (this.videoElem.paused) return;
          await this.optionalFrame();
        },
        ended: () => {
          if (!this.settings.enabled || !this.isOnVideoPage) return;
          if (this.clearTime < performance.now() - 500) this.clear();
          this.stats.hide();
          this.scheduledNextFrame = false;
          this.resetVideoParentElemStyle();
        },
        emptied: () => {
          if (!this.settings.enabled || !this.isOnVideoPage) return;
          if (this.clearTime < performance.now() - 500) this.clear();
          this.scheduledNextFrame = false;
        },
        error: ex => {
          const videoElem = ex === null || ex === void 0 ? void 0 : ex.target;
          const error = videoElem === null || videoElem === void 0 ? void 0 : videoElem.error;
          console.log(`Restoring the ambient light after a video error...
Video error: ${mediaErrorToString(error === null || error === void 0 ? void 0 : error.code)} ${error !== null && error !== void 0 && error.message ? `(${error === null || error === void 0 ? void 0 : error.message})` : ''}
Video network state: ${networkStateToString(videoElem === null || videoElem === void 0 ? void 0 : videoElem.networkState)}
Video ready state: ${readyStateToString(videoElem === null || videoElem === void 0 ? void 0 : videoElem.readyState)}`);
          if (this.clearTime < performance.now() - 500) this.clear();
          this.cancelScheduledRequestVideoFrame();
          if (this.handleVideoErrorTimeout) return;
          this.handleVideoErrorTimeout = setTimeout$1(this.handleVideoError, 1000);
        },
        click: this.settings.onCloseMenu,
        enterpictureinpicture: async () => {
          this.videoIsPictureInPicture = true;
          await this.optionalFrame();
        },
        leavepictureinpicture: async () => {
          this.videoIsPictureInPicture = false;
          await this.optionalFrame();
        }
      };
      for (const name in this.videoListeners) {
        off(this.videoElem, name, this.videoListeners[name]);
        on(this.videoElem, name, this.videoListeners[name]);
      }
      if (this.ytdWatchElem) {
        this.playerListeners = this.playerListeners || {
          'yt-autonav-pause-player-ended': this.videoListeners.ended
        };
        for (const name in this.playerListeners) {
          off(this.ytdWatchElem, name, this.playerListeners[name]);
          on(this.ytdWatchElem, name, this.playerListeners[name]);
        }
      }
      if (this.videoObserver) {
        this.videoObserver.disconnect();
      }
      this.videoIsHidden = false;
      if (!this.videoObserver) {
        this.videoObserver = new IntersectionObserver(wrapErrorHandler((entries, observer) => {
          var _this$chromiumBugVide3;
          if (!window.ambientlight) return;
          if (window.ambientlight !== this) {
            observer.disconnect();
            return;
          }
          for (const entry of entries) {
            if (this.videoElem !== entry.target) {
              this.videoObserver.unobserve(entry.target);
              continue;
            }
            this.videoIsHidden = entry.intersectionRatio === 0;
            this.videoVisibilityChangeTime = performance.now();
          }
          if ((_this$chromiumBugVide3 = this.chromiumBugVideoJitterWorkaround) !== null && _this$chromiumBugVide3 !== void 0 && _this$chromiumBugVide3.update) this.chromiumBugVideoJitterWorkaround.update();
        }, true), {
          rootMargin: '-70px 0px 0px 0px',
          threshold: 0.0001
        });
      }
      this.videoObserver.observe(this.videoElem);
      this.applyChromiumBug1142112Workaround();
      this.applyChromiumBugVideoJitterWorkaround();
    }
    async initListeners() {
      this.initVideoListeners();
      if (this.settings.webGL) {
        this.projector.handleRestored = async () => {
          this.buffersCleared = true;
          this.sizesChanged = true;
          this.cancelScheduledRequestVideoFrame();
          this.videoElem.currentTime = this.videoElem.currentTime;
          await this.optionalFrame();
        };
      }
      on(document, 'visibilitychange', this.handleDocumentVisibilityChange, false);
      on(document, 'fullscreenchange', async function fullscreenchange() {
        await this.updateSizes();
      }.bind(this), false);
      on(document, 'keydown', this.handleKeyDown);
      if (this.topElem) {
        this.topElemObserver = new IntersectionObserver(wrapErrorHandler(async entries => {
          let atTop = true;
          for (const entry of entries) {
            atTop = entry.intersectionRatio !== 0;
          }
          if (this.atTop === atTop) return;
          this.atTop = atTop;
          await this.updateAtTop();
          if (this.isFillingFullscreen && !this.atTop) {
            this.buffersCleared = true;
            await this.optionalFrame();
          }
        }, true), {
          threshold: 0.0001
        });
        this.topElemObserver.observe(this.topElem);
        this.atTop = window.scrollY === 0;
        await this.updateAtTop();
      }
      if (this.settings.webGL) on(window, 'resize', this.projector.handleWindowResize, false);
      const resizeTooSmall = (pRect, rect) => Math.abs(rect.x - ((pRect === null || pRect === void 0 ? void 0 : pRect.x) || 0)) <= 2 && Math.abs(rect.y - ((pRect === null || pRect === void 0 ? void 0 : pRect.y) || 0)) <= 2 && Math.abs(rect.width - ((pRect === null || pRect === void 0 ? void 0 : pRect.width) || 0)) <= 2 && Math.abs(rect.height - ((pRect === null || pRect === void 0 ? void 0 : pRect.height) || 0)) <= 2;
      let previousHtmlRect;
      this.htmlResizeObserver = new ResizeObserver(wrapErrorHandler(function htmlResize(e) {
        if (!this.settings.enabled || !this.isOnVideoPage) return;
        const rect = e[0].contentRect;
        if (resizeTooSmall(previousHtmlRect, rect)) return;
        previousHtmlRect = rect;
        this.resize();
      }.bind(this), true));
      this.htmlResizeObserver.observe(document.documentElement);
      let previousVideoPlayerRect;
      this.videoPlayerResizeObserver = new ResizeObserver(wrapErrorHandler(function videoPlayerResize(e) {
        if (!this.settings.enabled || !this.isOnVideoPage) {
          previousVideoPlayerRect = undefined;
          return;
        }
        const rect = e[0].contentRect;
        if (resizeTooSmall(previousVideoPlayerRect, rect)) return;
        if (!this.settings.enabled) return;
        previousVideoPlayerRect = rect;
        this.resize(this.videoPlayerResizeToFullscreen ? 0 : this.videoPlayerResizeFromFullscreen ? 0 : 0);
        this.videoPlayerResizeFromFullscreen = false;
        this.videoPlayerResizeToFullscreen = false;
      }.bind(this), true));
      this.videoPlayerResizeObserver.observe(this.videoPlayerElem);
      let previousVideoRect;
      this.videoResizeObserver = new ResizeObserver(wrapErrorHandler(function videoResize(e) {
        if (!this.settings.enabled || !this.isOnVideoPage) {
          previousVideoRect = undefined;
          return;
        }
        const rect = e[0].contentRect;
        if (resizeTooSmall(previousVideoRect, rect)) {
          return;
        }
        previousVideoRect = rect;
        this.resize();
      }.bind(this), true));
      this.videoResizeObserver.observe(this.videoElem);
      injectedScript.addMessageListener('sizes-changed', () => {
        this.sizesChanged = true;
      });
      on(this.videoElem, 'focus', this.handleVideoFocus, true);
      this.theming.initListeners();
      this.initAverageVideoFramesDifferenceListeners();
      const videoPlayerObserver = new MutationObserver(wrapErrorHandler(async function videoPlayerMutation() {
        const viewChanged = await this.updateView();
        const videoHiddenChanged = this.updateIsVideoHiddenOnWatchPage();
        if (!viewChanged && !videoHiddenChanged) return;
        if (videoHiddenChanged && this.isVideoHiddenOnWatchPage) {
          if (this.clearTime < performance.now() - 500) this.clear();
          this.resetVideoParentElemStyle();
          return;
        }
        if (viewChanged || videoHiddenChanged && !this.isVideoHiddenOnWatchPage) {
          await this.optionalFrame();
        }
      }.bind(this), true));
      this.updateIsVideoHiddenOnWatchPage();
      videoPlayerObserver.observe(this.videoPlayerElem, {
        attributes: true,
        attributeFilter: ['class']
      });
      if (this.thumbnailOverlayElem) {
        videoPlayerObserver.observe(this.thumbnailOverlayElem, {
          attributes: true,
          attributeFilter: ['style']
        });
      }
      const playerContainersObserver = new MutationObserver(wrapErrorHandler(async function playerContainerMutation() {
        await this.updateView();
        await this.optionalFrame();
      }.bind(this), true));
      const playerContainersObserverOptions = {
        childList: true
      };
      const playerTheaterContainerElem = this.playerTheaterContainerElem;
      if (playerTheaterContainerElem) {
        playerContainersObserver.observe(playerTheaterContainerElem, playerContainersObserverOptions);
      }
      const playerSmallContainerElem = this.playerSmallContainerElem;
      if (playerSmallContainerElem) {
        playerContainersObserver.observe(playerSmallContainerElem, playerContainersObserverOptions);
      }
      await this.updateView();
    }
    async toggleEnabled(enabled) {
      if (this.pendingStart) return;
      enabled = enabled !== undefined ? enabled : !this.settings.enabled;
      if (enabled) {
        await this.enable();
      } else {
        await this.disable();
      }
      this.settings.displayBezelForSetting('enabled');
    }
    async checkGetImageDataAllowed() {
      const isSameOriginVideo = !!this.videoElem.src && this.videoElem.src.indexOf(location.origin) !== -1;
      const getImageDataAllowed = !window.chrome || isSameOriginVideo || !isSameOriginVideo && this.videoElem.crossOrigin;
      if (this.videoElem.src && !getImageDataAllowed && !this.crossOriginApplied) {
        console.warn(`Detected cross origin video. Applying workaround... ${this.videoElem.src}, ${this.videoElem.crossOrigin}`);
        this.crossOriginApplied = true;
        try {
          const currentTime = this.videoElem.currentTime;
          this.videoElem.crossOrigin = 'use-credentials';
          await injectedScript.postAndReceiveMessage('video-player-reload-video-by-id');
          this.videoElem.currentTime = currentTime;
        } catch {
          console.warn(`Detected cross origin video. Failed to apply workaround...  ${this.videoElem.src}, ${this.videoElem.crossOrigin}`);
        }
      }
      if (this.getImageDataAllowed === getImageDataAllowed) return;
      this.getImageDataAllowed = getImageDataAllowed;
      this.settings.updateVisibility();
    }
    async initAmbientlightElems() {
      this.elem = document.createElement('div');
      this.elem.classList.add('ambientlight');
      this.containerElem = document.createElement('div');
      this.containerElem.classList.add('ambientlight__container');
      this.containerElem.style.position = 'absolute';
      this.elem.prepend(this.containerElem);
      if (this.mastheadElem) {
        this.topElem = document.createElement('div');
        this.topElem.classList.add('ambientlight__top');
        this.elem.prepend(this.topElem);
      }
      this.clearfixElem = document.createElement('div');
      this.clearfixElem.classList.add('ambientlight__clearfix');
      this.elem.prepend(this.clearfixElem);
      this.videoShadowElem = document.createElement('div');
      this.videoShadowElem.classList.add('ambientlight__video-shadow');
      this.containerElem.prepend(this.videoShadowElem);
      this.filterElem = document.createElement('div');
      this.filterElem.classList.add('ambientlight__filter');
      this.containerElem.prepend(this.filterElem);
      if (this.enableChromiumBug1123708Workaround) {
        this.chromiumBug1123708WorkaroundElem = new Canvas(1, 1, true);
        this.chromiumBug1123708WorkaroundElem.classList.add('ambientlight__chromium-bug-1123708-workaround');
        this.filterElem.prepend(this.chromiumBug1123708WorkaroundElem);
      }
      this.clipElem = document.createElement('div');
      this.clipElem.classList.add('ambientlight__clip');
      this.filterElem.prepend(this.clipElem);
      this.projectorsElem = document.createElement('div');
      this.projectorsElem.classList.add('ambientlight__projectors');
      this.clipElem.prepend(this.projectorsElem);
      this.projectorListElem = document.createElement('div');
      this.projectorListElem.classList.add('ambientlight__projector-list');
      this.projectorsElem.prepend(this.projectorListElem);
      this.appendElemToContentElem();
      await this.initProjector();
    }
    getFullscreenContentElem() {
      let elem = this.getContentElem();
      if (document.fullscreenElement) {
        if (!document.fullscreenElement.contains(elem)) {
          elem = document.fullscreenElement;
        }
      }
      return elem;
    }
    appendElemToContentElem() {
      const contentElem = this.getContentElem();
      if (this.elem.parentElement === contentElem) return;
      contentElem.prepend(this.elem);
    }
    appendElemToFullscreenElem() {
      const fullscreenContentElem = this.getFullscreenContentElem();
      if (this.elem.parentElement === fullscreenContentElem) return;
      fullscreenContentElem.prepend(this.elem);
    }
    initBuffersWrapper() {
      this.buffersWrapperElem = document.createElement('div');
      this.buffersWrapperElem.classList.add('ambientlight__buffers-wrapper');
      this.containerElem.appendChild(this.buffersWrapperElem);
    }
    async initProjectorBuffers() {
      let projectorsBufferElem;
      let projectorsBufferCtx;
      if (this.settings.webGL) {
        try {
          projectorsBufferElem = new WebGLOffscreenCanvas(1, 1, this, this.settings);
          projectorsBufferCtx = await projectorsBufferElem.getContext('2d', ctxOptions);
          if (this.settings.webGLCrashDate) {
            this.settings.webGLCrashDate = undefined;
            this.settings.webGLCrashVersion = undefined;
            this.settings.saveStorageEntry('webGLCrash', undefined);
            this.settings.saveStorageEntry('webGLCrashVersion', undefined);
            this.settings.updateWebGLCrashDescription();
          }
        } catch (ex) {
          projectorsBufferCtx = undefined;
          if (!this.settings.webGLCrashDate) {
            SentryReporter.captureException(ex);
          } else {
            console.log(ex);
            if (ex !== null && ex !== void 0 && ex.details) console.log(ex.details);
          }
          this.settings.handleWebGLCrash();
        }
      }
      if (!projectorsBufferCtx) {
        projectorsBufferElem = new SafeOffscreenCanvas(1, 1, true);
        projectorsBufferCtx = projectorsBufferElem.getContext('2d', ctxOptions);
      }
      if (projectorsBufferElem.tagName === 'CANVAS') {
        this.buffersWrapperElem.appendChild(projectorsBufferElem);
      }
      this.nonHdrProjectorBuffer = {
        elem: projectorsBufferElem,
        ctx: projectorsBufferCtx
      };
      this.projectorBuffer = this.nonHdrProjectorBuffer;
    }
    initWebGLHdrProjectorBuffer() {
      if (this.hdrProjectorBuffer) return;
      const hdrProjectorsBufferElem = new SafeOffscreenCanvas(1, 1, true);
      const hdrProjectorsBufferCtx = hdrProjectorsBufferElem.getContext('2d', ctxOptions);
      if (hdrProjectorsBufferElem.tagName === 'CANVAS') {
        this.buffersWrapperElem.appendChild(hdrProjectorsBufferElem);
      }
      this.hdrProjectorBuffer = {
        elem: hdrProjectorsBufferElem,
        ctx: hdrProjectorsBufferCtx
      };
    }
    async initSettings() {
      this.settings = await new Settings(this, this.settingsMenuBtnParent, this.videoPlayerElem);
      parseSettingsToSentry(this.settings);
    }
    initVideoOverlay() {
      const videoOverlayElem = new Canvas(1, 1);
      videoOverlayElem.classList.add('ambientlight__video-overlay');
      this.videoOverlay = {
        elem: videoOverlayElem,
        ctx: videoOverlayElem.getContext('2d', {
          ...ctxOptions,
          alpha: true
        }),
        isHiddenChangeTimestamp: 0
      };
    }
    initFrameBlending() {
      const previousProjectorsBufferElem = new Canvas(this.projectorBuffer.elem.width, this.projectorBuffer.elem.height, true);
      if (previousProjectorsBufferElem.tagName === 'CANVAS') {
        this.buffersWrapperElem.appendChild(previousProjectorsBufferElem);
      }
      this.previousProjectorBuffer = {
        elem: previousProjectorsBufferElem,
        ctx: previousProjectorsBufferElem.getContext('2d', ctxOptions)
      };
      const blendedProjectorsBufferElem = new Canvas(this.projectorBuffer.elem.width, this.projectorBuffer.elem.height, true);
      if (blendedProjectorsBufferElem.tagName === 'CANVAS') {
        this.buffersWrapperElem.appendChild(blendedProjectorsBufferElem);
      }
      this.blendedProjectorBuffer = {
        elem: blendedProjectorsBufferElem,
        ctx: blendedProjectorsBufferElem.getContext('2d', ctxOptions)
      };
    }
    initVideoOverlayWithFrameBlending() {
      const videoOverlayBufferElem = new Canvas(this.srcVideoOffset.width, this.srcVideoOffset.height, true);
      if (videoOverlayBufferElem.tagName === 'CANVAS') {
        this.buffersWrapperElem.appendChild(videoOverlayBufferElem);
      }
      this.videoOverlayBuffer = {
        elem: videoOverlayBufferElem,
        ctx: videoOverlayBufferElem.getContext('2d', ctxOptions)
      };
      const previousVideoOverlayBufferElem = new Canvas(this.srcVideoOffset.width, this.srcVideoOffset.height, true);
      if (previousVideoOverlayBufferElem.tagName === 'CANVAS') {
        this.buffersWrapperElem.appendChild(previousVideoOverlayBufferElem);
      }
      this.previousVideoOverlayBuffer = {
        elem: previousVideoOverlayBufferElem,
        ctx: previousVideoOverlayBufferElem.getContext('2d', ctxOptions)
      };
    }
    async resetSettingsIfNeeded() {
      const videoPath = location.search;
      if (!this.prevVideoPath || videoPath !== this.prevVideoPath) {
        if (this.settings.horizontalBarsClipPercentageReset) {
          const horizontalBarChanged = this.setHorizontalBars(0);
          const verticalBarChanged = this.setVerticalBars(0);
          if (horizontalBarChanged || verticalBarChanged) {
            this.sizesChanged = true;
            await this.optionalFrame();
          }
        }
      }
      this.prevVideoPath = videoPath;
      await this.settings.updateHdr();
    }
    setHorizontalBars(percentage) {
      if (this.settings.horizontalBarsClipPercentage === percentage) return false;
      this.settings.set('horizontalBarsClipPercentage', percentage, true);
      return true;
    }
    setVerticalBars(percentage) {
      if (this.settings.verticalBarsClipPercentage === percentage) return false;
      this.settings.set('verticalBarsClipPercentage', percentage, true);
      return true;
    }
    recreateProjectors() {
      this.levels = Math.max(2, Math.round(this.settings.spread / this.settings.edge) + this.innerStrength + 1);
      if (this.projector.recreate) {
        this.projector.recreate(this.levels);
      }
    }
    clear() {
      this.clearTime = performance.now();
      this.barDetection.clear();
      const canvasses = [];
      if (this.projector) {
        canvasses.push({
          ctx: this.projector
        });
      }
      if (this.projectorBuffer) {
        canvasses.push(this.projectorBuffer);
      }
      if (this.previousProjectorBuffer) {
        canvasses.push(this.previousProjectorBuffer);
        canvasses.push(this.blendedProjectorBuffer);
      }
      if (this.videoOverlay) {
        canvasses.push(this.videoOverlay);
        if (this.videoOverlayBuffer) {
          canvasses.push(this.videoOverlayBuffer);
          canvasses.push(this.previousVideoOverlayBuffer);
        }
      }
      for (const canvas of canvasses) {
        var _canvas$ctx;
        if ((_canvas$ctx = canvas.ctx) !== null && _canvas$ctx !== void 0 && _canvas$ctx.clearRect) {
          if (!canvas.ctx.isContextLost || !canvas.ctx.isContextLost()) {
            if (canvas.elem) {
              canvas.ctx.clearRect(0, 0, canvas.elem.width, canvas.elem.height);
            } else {
              canvas.ctx.clearRect();
            }
          }
        } else if (canvas.elem) {
          canvas.elem.width = 1;
        }
      }
      this.buffersCleared = true;
      this.sizesChanged = true;
      this.checkIfNeedToHideVideoOverlay();
      this.scheduleNextFrame();
    }
    updateVideoScale() {
      var _this$videoElem7, _this$videoElem8, _this$videoPlayerElem3, _this$videoPlayerElem4;
      let videoScale = this.isVrVideo ? 100 : this.settings[`videoScale.${this.view}`] ?? 100;
      if (this.settings.detectVideoFillScaleEnabled && (_this$videoElem7 = this.videoElem) !== null && _this$videoElem7 !== void 0 && _this$videoElem7.offsetWidth && (_this$videoElem8 = this.videoElem) !== null && _this$videoElem8 !== void 0 && _this$videoElem8.offsetHeight && (_this$videoPlayerElem3 = this.videoPlayerElem) !== null && _this$videoPlayerElem3 !== void 0 && _this$videoPlayerElem3.offsetWidth && (_this$videoPlayerElem4 = this.videoPlayerElem) !== null && _this$videoPlayerElem4 !== void 0 && _this$videoPlayerElem4.offsetHeight) {
        const barScaleX = this.isVrVideo ? 1 : (100 - this.settings.verticalBarsClipPercentage * 2) / 100;
        const barScaleY = this.isVrVideo ? 1 : (100 - this.settings.horizontalBarsClipPercentage * 2) / 100;
        const barScaledVideoWidth = this.videoElem.offsetWidth * barScaleX;
        const barScaledVideoHeight = this.videoElem.offsetHeight * barScaleY;
        const containerWidth = this.videoPlayerElem.offsetWidth * (videoScale / 100);
        const containerHeight = this.videoPlayerElem.offsetHeight * (videoScale / 100);
        const filledVideoScaleX = containerWidth / barScaledVideoWidth;
        const filledVideoScaleY = containerHeight / barScaledVideoHeight;
        const filledVideoScale = Math.round(Math.min(filledVideoScaleX, filledVideoScaleY) * 10000) / 100;
        if (!isNaN(filledVideoScale) && !(filledVideoScale > 100 && filledVideoScale < 100.5)) {
          videoScale = filledVideoScale;
        }
      }
      this.videoScale = videoScale;
      setStyleProperty(document.body, '--ytal-html5-video-player-overflow', this.videoScale > 100 ? 'visible' : '');
    }
    async updateSizes() {
      var _this$ytdWatchElem, _this$vrVideoElem, _this$vrVideoElem2, _this$p, _this$p2;
      await this.updateView();
      this.updateVideoScale();
      const noClipOrScale = this.isVrVideo || this.settings.horizontalBarsClipPercentage == 0 && this.settings.verticalBarsClipPercentage == 0 && this.videoScale == 100;
      const videoParentElem = this.videoElem.parentElement;
      const notVisible = !this.settings.enabled || this.isVrVideo && !this.settings.enableInVRVideos || !videoParentElem || !this.videoPlayerElem || !this.isInEnabledView();
      if (notVisible || noClipOrScale) {
        this.resetVideoParentElemStyle();
      }
      this.lastUpdateSizesChanged = performance.now();
      if (notVisible) {
        await this.hide();
        return false;
      }
      this.barsClip = [this.isVrVideo ? 0 : this.settings.verticalBarsClipPercentage, this.isVrVideo ? 0 : this.settings.horizontalBarsClipPercentage].map(percentage => percentage / 100);
      this.clippedVideoScale = this.barsClip.map(clip => 1 - clip * 2);
      this.shouldStyleVideoParentElem = this.isOnVideoPage && !this.isVideoHiddenOnWatchPage && !this.videoElem.ended && !noClipOrScale && !this.isControlledByAnotherExtension;
      if (this.shouldStyleVideoParentElem) {
        const top = Math.max(0, parseInt(this.videoElem.style.top) || 0);
        const left = Math.max(0, parseInt(this.videoElem.style.left) || 0);
        const width = Math.max(0, parseInt(this.videoElem.style.width) || 0);
        videoParentElem.style.width = `${width}px`;
        videoParentElem.style.height = this.videoElem.style.height || '100%';
        videoParentElem.style.marginBottom = `${-this.videoElem.offsetHeight}px`;
        videoParentElem.style.overflow = 'hidden';
        videoParentElem.style.transform = `
        translate(${left}px, ${top}px)
        scale(${this.videoScale / 100}) 
        scale(${this.clippedVideoScale[0]}, ${this.clippedVideoScale[1]})
      `;
        const videoClipScale = this.clippedVideoScale.map(scale => Math.round(1000 * (1 / scale)) / 1000);
        setStyleProperty(videoParentElem, '--video-transform', `translate(${-left}px, ${-top}px) scale(${videoClipScale[0]}, ${videoClipScale[1]})`);
      } else {
        this.resetVideoParentElemStyle();
      }
      if (this.isVrVideo !== !!this.vrVideoElem) {
        if (this.isVrVideo) {
          this.initVR();
        } else {
          this.disposeVR();
        }
      }
      this.videoOffset = this.getElemRect(this.isVrVideo ? this.vrVideoElem : this.videoElem);
      this.isFillingFullscreen = this.isFullscreen && Math.abs(this.videoOffset.width - window.innerWidth) < 10 && Math.abs(this.videoOffset.height - window.innerHeight) < 10 && noClipOrScale;
      if (this.videoOffset.top === undefined || !this.videoOffset.width || !this.videoOffset.height || !this.videoElem.videoWidth || !this.videoElem.videoHeight) return false;
      const unscaledWidth = Math.round(this.videoOffset.width / (this.videoScale / 100));
      const unscaledHeight = Math.round(this.videoOffset.height / (this.videoScale / 100));
      const unscaledLeft = Math.round(this.videoOffset.left + window.scrollX - (unscaledWidth - this.videoOffset.width) / 2);
      const scrollYCorrection = ((_this$ytdWatchElem = this.ytdWatchElem) === null || _this$ytdWatchElem === void 0 ? void 0 : _this$ytdWatchElem.tagName) === 'YTD-WATCH-FIXIE' && this.view === VIEW_SMALL ? window.scrollY : 0;
      const unscaledTop = Math.round(this.videoOffset.top - scrollYCorrection - (unscaledHeight - this.videoOffset.height) / 2);
      this.projectorsElem.style.left = `${unscaledLeft}px`;
      this.projectorsElem.style.top = `${unscaledTop - 1}px`;
      this.projectorsElem.style.width = `${unscaledWidth}px`;
      this.projectorsElem.style.height = `${unscaledHeight}px`;
      this.projectorsElem.style.transform = `
      scale(${this.videoScale / 100}) 
      scale(${this.clippedVideoScale[0]}, ${this.clippedVideoScale[1]})
    `;
      if (this.settings.webGL) this.projector.cropped = false;
      if (this.settings.videoShadowOpacity != 0 && this.settings.videoShadowSize != 0) {
        this.videoShadowElem.style.display = 'block';
        this.videoShadowElem.style.left = `${unscaledLeft}px`;
        this.videoShadowElem.style.top = `${unscaledTop}px`;
        this.videoShadowElem.style.width = `${unscaledWidth * this.clippedVideoScale[0]}px`;
        this.videoShadowElem.style.height = `${unscaledHeight * this.clippedVideoScale[1]}px`;
        this.videoShadowElem.style.transform = `
        translate3d(0,0,0)
        translate(${unscaledWidth * this.barsClip[0]}px, ${unscaledHeight * this.barsClip[1]}px)
        scale(${this.videoScale / 100})
      `;
        this.videoShadowElem.style.borderRadius = this.ytdPlayerElem ? getComputedStyle(this.ytdPlayerElem).borderRadius ?? '' : '';
      } else {
        this.videoShadowElem.style.display = '';
      }
      const contrast = this.settings.contrast + (this.isHdr ? this.settings.hdrContrast - 100 : 0);
      const brightness = this.settings.brightness + (this.isHdr ? this.settings.hdrBrightness - 100 : 0);
      const saturation = this.settings.saturation + (this.isHdr ? this.settings.hdrSaturation - 100 : 0);
      this.filterElem.style.filter = `
      ${!this.settings.webGL && blur != 0 ? `blur(${Math.round(this.videoOffset.height * 0.0025 * this.settings.blur2)}px)` : ''}
      ${contrast != 100 ? `contrast(${contrast}%)` : ''}
      ${brightness != 100 ? `brightness(${brightness}%)` : ''}
      ${saturation != 100 ? `saturate(${saturation}%)` : ''}
    `.trim();
      this.srcVideoOffset = {
        top: this.videoOffset.top,
        width: ((_this$vrVideoElem = this.vrVideoElem) === null || _this$vrVideoElem === void 0 ? void 0 : _this$vrVideoElem.width) ?? this.videoElem.videoWidth,
        height: ((_this$vrVideoElem2 = this.vrVideoElem) === null || _this$vrVideoElem2 === void 0 ? void 0 : _this$vrVideoElem2.height) ?? this.videoElem.videoHeight
      };
      this.vrVideoSrcOffset = {
        width: this.videoElem.videoWidth,
        height: this.videoElem.videoHeight
      };
      let pScale;
      if (this.settings.webGL) {
        const relativeBlur = this.settings.resolution / 100 * (this.isHdr ? 0 : this.settings.blur2);
        let pMinSize = this.settings.resolution / 100 * (this.isHdr ? 2 : 1) * (this.settings.detectHorizontalBarSizeEnabled || this.settings.detectVerticalBarSizeEnabled ? 256 : relativeBlur >= 20 ? 128 : relativeBlur >= 10 ? 192 : 256);
        if (this.settings.spread > 200) pMinSize = pMinSize / 2;
        pScale = Math.min(0.5, Math.max(pMinSize / this.srcVideoOffset.width, pMinSize / this.srcVideoOffset.height), Math.min(1024 / this.srcVideoOffset.width, 1024 / this.srcVideoOffset.height));
      } else {
        const pMinSize = Math.max(257, Math.min(512, this.srcVideoOffset.width, this.srcVideoOffset.height));
        pScale = Math.max(pMinSize / this.srcVideoOffset.width, pMinSize / this.srcVideoOffset.height);
      }
      const p = {
        w: Math.ceil(this.srcVideoOffset.width * pScale),
        h: Math.ceil(this.srcVideoOffset.height * pScale)
      };
      if (((_this$p = this.p) === null || _this$p === void 0 ? void 0 : _this$p.w) !== p.w || ((_this$p2 = this.p) === null || _this$p2 === void 0 ? void 0 : _this$p2.h) !== p.h) {
        this.p = p;
      }
      this.projector.resize(this.p.w, this.p.h);
      if (this.projector.webGLVersion === 1) {
        const pbSize = Math.min(512, Math.max(this.srcVideoOffset.width, this.srcVideoOffset.height));
        const pbSizePowerOf2 = Math.pow(2, 1 + Math.ceil(Math.log(pbSize / 2) / Math.log(2)));
        this.projectorBuffer.elem.width = pbSizePowerOf2;
        this.projectorBuffer.elem.height = pbSizePowerOf2;
      } else if (this.projector.webGLVersion === 2) {
        const projectorBufferWidth = this.p.w * 2;
        const projectorBufferHeight = this.p.h * 2;
        if (this.projectorBuffer.elem.width !== projectorBufferWidth || this.projectorBuffer.elem.height !== projectorBufferHeight) {
          this.projectorBuffer.elem.width = projectorBufferWidth;
          this.projectorBuffer.elem.height = projectorBufferHeight;
        }
      } else {
        this.projectorBuffer.elem.width = this.p.w;
        this.projectorBuffer.elem.height = this.p.h;
      }
      const frameBlending = this.settings.frameBlending;
      if (frameBlending) {
        if (!this.previousProjectorBuffer || !this.blendedProjectorBuffer) {
          this.initFrameBlending();
        }
        this.previousProjectorBuffer.elem.width = this.projectorBuffer.elem.width;
        this.previousProjectorBuffer.elem.height = this.projectorBuffer.elem.height;
        this.blendedProjectorBuffer.elem.width = this.projectorBuffer.elem.width;
        this.blendedProjectorBuffer.elem.height = this.projectorBuffer.elem.height;
      }
      const videoOverlayEnabled = this.settings.videoOverlayEnabled;
      const videoOverlay = this.videoOverlay;
      if (videoOverlayEnabled && !videoOverlay) {
        this.initVideoOverlay();
      }
      if (videoOverlayEnabled && frameBlending && !this.previousVideoOverlayBuffer) {
        this.initVideoOverlayWithFrameBlending();
      }
      if (videoOverlayEnabled) this.checkIfNeedToHideVideoOverlay();
      if (videoOverlayEnabled && videoOverlay && !videoOverlay.elem.parentNode) {
        if (this.videoElem) {
          this.videoElem.after(videoOverlay.elem);
        } else {
          if (!this.videoContainerElemMissingThrown) {
            SentryReporter.captureException(new Error('VideoOverlayEnabled but the .html5-video-container element does not exist'));
            this.videoContainerElemMissingThrown = true;
          }
          this.videoContainerElemMissingWarning = true;
          this.settings.setWarning('Unable to sync the video with the ambient light. The html5-video-container element does not exist on the page. This is likely due to a update of the YouTube design. This will probably soon be fixed in a new version.');
        }
      } else if (!videoOverlayEnabled && videoOverlay && videoOverlay.elem.parentNode) {
        videoOverlay.elem.parentNode.removeChild(videoOverlay.elem);
      } else if (this.videoContainerElemMissingWarning) {
        this.settings.setWarning('');
        this.videoContainerElemMissingWarning = false;
      }
      const videoElemStyle = this.videoElem.getAttribute('style') || '';
      if (this.videoDebandingElem) {
        if (this.videoDebandingElem.getAttribute('style') !== videoElemStyle) {
          this.videoDebandingElem.setAttribute('style', videoElemStyle);
        }
        if (!this.videoDebandingElem.isConnected) {
          this.videoContainerElem.appendChild(this.videoDebandingElem);
        }
      }
      if (videoOverlayEnabled && videoOverlay) {
        if (videoOverlay.elem.getAttribute('style') !== videoElemStyle) {
          videoOverlay.elem.setAttribute('style', videoElemStyle);
        }
        let videoOverlayWidth = this.srcVideoOffset.width;
        let videoOverlayHeight = this.srcVideoOffset.height;
        if (this.videoElem.style.width && this.videoElem.style.height) {
          try {
            videoOverlayWidth = Math.min(this.srcVideoOffset.width, Math.round(parseInt(this.videoElem.style.width) * window.devicePixelRatio) || this.videoElem.clientWidth);
            videoOverlayHeight = Math.min(this.srcVideoOffset.height, Math.round(parseInt(this.videoElem.style.height) * window.devicePixelRatio) || this.videoElem.clientHeight);
          } catch {}
          this.videoOverlay.elem.width = videoOverlayWidth;
          this.videoOverlay.elem.height = videoOverlayHeight;
        }
        if (frameBlending) {
          this.videoOverlayBuffer.elem.width = videoOverlayWidth;
          this.videoOverlayBuffer.elem.height = videoOverlayHeight;
          this.previousVideoOverlayBuffer.elem.width = videoOverlayWidth;
          this.previousVideoOverlayBuffer.elem.height = videoOverlayHeight;
        }
      }
      this.resizeCanvasses();
      this.stats.initElems();
      this.sizesChanged = false;
      this.buffersCleared = true;
      return true;
    }
    resetVideoParentElemStyle() {
      this.shouldStyleVideoParentElem = false;
      const videoParentElem = this.videoElem.parentElement;
      if (videoParentElem) {
        videoParentElem.style.transform = '';
        videoParentElem.style.overflow = '';
        videoParentElem.style.height = '';
        videoParentElem.style.marginBottom = '';
        setStyleProperty(videoParentElem, '--video-transform', '');
      }
    }
    updateFixedStyle() {
      var _this$ytdWatchElem2;
      const fixedLayout = ((_this$ytdWatchElem2 = this.ytdWatchElem) === null || _this$ytdWatchElem2 === void 0 ? void 0 : _this$ytdWatchElem2.tagName) === 'YTD-WATCH-FIXIE' && this.view === VIEW_SMALL;
      const enable = this.settings.fixedPosition || fixedLayout;
      document.body.toggleAttribute('data-ambientlight-fixed', enable);
    }
    updateStyles() {
      this.updateFixedStyle();
      let pageBackgroundGreyness = this.settings.pageBackgroundGreyness;
      pageBackgroundGreyness = pageBackgroundGreyness ? `${pageBackgroundGreyness}%` : '';
      setStyleProperty(document.body, '--ytal-page-background-greyness', pageBackgroundGreyness);
      let fillOpacity = this.settings.surroundingContentFillOpacity;
      fillOpacity = fillOpacity !== 10 ? (fillOpacity + 100) / 200 : '';
      setStyleProperty(document.body, '--ytal-fill-opacity', fillOpacity);
      if (this.mastheadElem) {
        let headerFillOpacity = this.settings.headerFillOpacity;
        headerFillOpacity = headerFillOpacity !== 100 ? (headerFillOpacity + 100) / 200 : '';
        setStyleProperty(this.mastheadElem, '--ytal-fill-opacity', headerFillOpacity);
        this.mastheadElem.classList.toggle('ytal-header-transparent', headerFillOpacity !== '');
      }
      let imageOpacity = this.settings.surroundingContentImagesOpacity;
      imageOpacity = imageOpacity !== 100 ? imageOpacity / 100 : '';
      setStyleProperty(document.body, '--ytal-image-opacity', imageOpacity);
      if (this.mastheadElem) {
        let headerImageOpacity = this.settings.headerImagesOpacity;
        headerImageOpacity = imageOpacity !== 100 ? headerImageOpacity / 100 : '';
        setStyleProperty(this.mastheadElem, '--ytal-image-opacity', headerImageOpacity);
      }
      const textAndBtnOnly = this.settings.surroundingContentTextAndBtnOnly;
      const getFilterShadow = (color, size, opacity) => size && opacity ? opacity > 0.5 ? `
          drop-shadow(0 0 ${size}px rgba(${color},${opacity})) 
          drop-shadow(0 0 ${size}px rgba(${color},${opacity}))
        ` : `drop-shadow(0 0 ${size}px rgba(${color},${opacity * 2}))` : '';
      const getTextShadow = (color, size, opacity) => size && opacity ? `
        rgba(${color},${opacity}) 0 0 ${size * 2}px,
        rgba(${color},${opacity}) 0 0 ${size * 2}px
      ` : '';
      if (this.mastheadElem) {
        const headerShadowSize = this.settings.headerShadowSize / 5;
        const headerShadowOpacity = this.settings.headerShadowOpacity / 100;
        this.mastheadElem.classList.toggle('ytal-header-shadow', headerShadowSize && headerShadowOpacity);
        const getHeaderFilterShadow = color => getFilterShadow(color, headerShadowSize, headerShadowOpacity);
        const getHeaderTextShadow = color => getTextShadow(color, headerShadowSize, headerShadowOpacity);
        setStyleProperty(this.mastheadElem, `--ytal-filter-shadow`, !textAndBtnOnly ? getHeaderFilterShadow('0,0,0') : '');
        setStyleProperty(this.mastheadElem, `--ytal-filter-shadow-inverted`, !textAndBtnOnly ? getHeaderFilterShadow('255,255,255') : '');
        setStyleProperty(this.mastheadElem, `--ytal-button-shadow`, textAndBtnOnly ? getHeaderFilterShadow('0,0,0') : '');
        setStyleProperty(this.mastheadElem, `--ytal-button-shadow-inverted`, textAndBtnOnly ? getHeaderFilterShadow('255,255,255') : '');
        setStyleProperty(this.mastheadElem, '--ytal-text-shadow', textAndBtnOnly ? getHeaderTextShadow('0,0,0') : '');
        setStyleProperty(this.mastheadElem, '--ytal-text-shadow-inverted', textAndBtnOnly ? getHeaderTextShadow('255,255,255') : '');
        this.mastheadElem.toggleAttribute('data-ambientlight-text-shadow', textAndBtnOnly);
      }
      const contentShadowSize = this.settings.surroundingContentShadowSize / 5;
      const contentShadowOpacity = this.settings.surroundingContentShadowOpacity / 100;
      const getContentFilterShadow = color => getFilterShadow(color, contentShadowSize, contentShadowOpacity);
      const getContentTextShadow = color => getTextShadow(color, contentShadowSize, contentShadowOpacity);
      setStyleProperty(document.body, `--ytal-filter-shadow`, !textAndBtnOnly ? getContentFilterShadow('0,0,0') : '');
      setStyleProperty(document.body, `--ytal-filter-shadow-inverted`, !textAndBtnOnly ? getContentFilterShadow('255,255,255') : '');
      setStyleProperty(document.body, `--ytal-button-shadow`, textAndBtnOnly ? getContentFilterShadow('0,0,0') : '');
      setStyleProperty(document.body, `--ytal-button-shadow-inverted`, textAndBtnOnly ? getContentFilterShadow('255,255,255') : '');
      setStyleProperty(document.body, '--ytal-text-shadow', textAndBtnOnly ? getContentTextShadow('0,0,0') : '');
      setStyleProperty(document.body, '--ytal-text-shadow-inverted', textAndBtnOnly ? getContentTextShadow('255,255,255') : '');
      document.body.toggleAttribute('data-ambientlight-text-shadow', textAndBtnOnly);
      const videoShadowSize = parseFloat(this.settings.videoShadowSize, 10) / 2 + Math.pow(this.settings.videoShadowSize / 5, 1.77);
      const videoShadowOpacity = this.settings.videoShadowOpacity / 100;
      setStyleProperty(document.body, '--ytal-video-shadow-background', videoShadowSize && videoShadowOpacity ? `rgba(0,0,0,${videoShadowOpacity})` : '');
      setStyleProperty(document.body, '--ytal-video-shadow-box-shadow', videoShadowSize && videoShadowOpacity ? `
          rgba(0,0,0,${videoShadowOpacity}) 0 0 ${videoShadowSize}px,
          rgba(0,0,0,${videoShadowOpacity}) 0 0 ${videoShadowSize}px
        ` : '');
      const videoDebandingStrength = parseFloat(this.settings.videoDebandingStrength);
      if (videoDebandingStrength) {
        if (!this.videoDebandingElem) {
          this.videoDebandingElem = document.createElement('div');
          this.videoDebandingElem.classList.add('ambientlight__video-debanding');
        }
        this.videoDebandingElem.setAttribute('style', this.videoElem.getAttribute('style') || '');
        if (!this.videoDebandingElem.isConnected) {
          this.videoContainerElem.appendChild(this.videoDebandingElem);
        }
      } else if (this.videoDebandingElem) {
        this.videoDebandingElem.remove();
        this.videoDebandingElem = undefined;
      }
      const videoNoiseImageIndex = videoDebandingStrength > 75 ? 3 : videoDebandingStrength > 50 ? 2 : 1;
      const videoNoiseOpacity = videoDebandingStrength / (videoDebandingStrength > 75 ? 100 : videoDebandingStrength > 50 ? 75 : 50);
      setStyleProperty(document.body, '--ytal-video-debanding-background', videoDebandingStrength ? `url('${baseUrl}images/noise-${videoNoiseImageIndex}.png')` : '');
      setStyleProperty(document.body, '--ytal-video-debanding-opacity', videoDebandingStrength ? videoNoiseOpacity : '');
      const debandingStrength = parseFloat(this.settings.debandingStrength);
      const noiseImageIndex = debandingStrength > 75 ? 3 : debandingStrength > 50 ? 2 : 1;
      const noiseOpacity = debandingStrength / (debandingStrength > 75 ? 100 : debandingStrength > 50 ? 75 : 50);
      setStyleProperty(document.body, '--ytal-debanding-content', debandingStrength ? `''` : '');
      setStyleProperty(document.body, '--ytal-debanding-background', debandingStrength ? `url('${baseUrl}images/noise-${noiseImageIndex}.png')` : '');
      setStyleProperty(document.body, '--ytal-debanding-opacity', debandingStrength ? noiseOpacity : '');
      setStyleProperty(document.body, '--ytal-debanding-blend-mode', {
        [DEBANDING_BLEND_MODE_LCD]: '',
        [DEBANDING_BLEND_MODE_OLED]: 'overlay'
      }[this.settings.debandingBlendMode]);
    }
    resizeCanvasses() {
      if (this.canvassesInvalidated) {
        this.recreateProjectors();
        this.canvassesInvalidated = false;
      }
      const projectorSize = {
        w: Math.round(this.p.w * this.clippedVideoScale[0]),
        h: Math.round(this.p.h * this.clippedVideoScale[1])
      };
      const ratio = this.p.w > this.p.h ? {
        x: this.p.w / projectorSize.w,
        y: this.p.w / projectorSize.w * (projectorSize.w / projectorSize.h)
      } : {
        x: this.p.h / projectorSize.h * (projectorSize.h / projectorSize.w),
        y: this.p.h / projectorSize.h
      };
      const lastScale = {
        x: 1,
        y: 1
      };
      const minScale = {
        x: 1 / projectorSize.w,
        y: 1 / projectorSize.h
      };
      const scaleStep = this.settings.edge / 100;
      const scales = [];
      for (let i = 0; i < this.levels; i++) {
        const pos = i - this.innerStrength;
        let scaleX = 1;
        let scaleY = 1;
        if (pos > 0) {
          scaleX = 1 + scaleStep * ratio.x * pos;
          scaleY = 1 + scaleStep * ratio.y * pos;
        }
        if (pos < 0) {
          scaleX = 1 - scaleStep * ratio.x * -pos;
          scaleY = 1 - scaleStep * ratio.y * -pos;
          if (scaleX < 0) scaleX = 0;
          if (scaleY < 0) scaleY = 0;
        }
        lastScale.x = scaleX;
        lastScale.y = scaleY;
        scales.push({
          x: Math.max(minScale.x, scaleX),
          y: Math.max(minScale.y, scaleY)
        });
      }
      this.projector.rescale(scales, lastScale, projectorSize, this.barsClip, this.settings);
    }
    updateSizesChanged(checkPosition) {
      if (this.updatedSizesChanged) {
        return;
      }
      this.sizesChanged = this.sizesChanged || this.getSizesChanged(checkPosition);
      this.lastUpdateSizesChanged = performance.now();
      this.sizesInvalidated = false;
      this.updatedSizesChanged = true;
      raf(() => {
        this.updatedSizesChanged = false;
      });
    }
    getSizesChanged(checkPosition = true) {
      var _this$vrVideoElem3, _this$vrVideoElem4, _this$vrVideoSrcOffse, _this$vrVideoSrcOffse2;
      if (this.previousEnabled !== this.settings.enabled) {
        this.previousEnabled = this.settings.enabled;
        return true;
      }
      if (this.srcVideoOffset.width !== (((_this$vrVideoElem3 = this.vrVideoElem) === null || _this$vrVideoElem3 === void 0 ? void 0 : _this$vrVideoElem3.width) ?? this.videoElem.videoWidth) || this.srcVideoOffset.height !== (((_this$vrVideoElem4 = this.vrVideoElem) === null || _this$vrVideoElem4 === void 0 ? void 0 : _this$vrVideoElem4.height) ?? this.videoElem.videoHeight)) {
        return true;
      }
      if (this.isVrVideo && (((_this$vrVideoSrcOffse = this.vrVideoSrcOffset) === null || _this$vrVideoSrcOffse === void 0 ? void 0 : _this$vrVideoSrcOffse.width) !== this.videoElem.videoWidth || ((_this$vrVideoSrcOffse2 = this.vrVideoSrcOffset) === null || _this$vrVideoSrcOffse2 === void 0 ? void 0 : _this$vrVideoSrcOffse2.height) !== this.videoElem.videoHeight)) {
        return true;
      }
      if (this.settings.videoOverlayEnabled && this.videoOverlay && this.videoElem.getAttribute('style') !== this.videoOverlay.elem.getAttribute('style')) {
        return true;
      }
      const noClipOrScale = this.isVrVideo || this.settings.horizontalBarsClipPercentage == 0 && this.settings.verticalBarsClipPercentage == 0 && this.videoScale == 100;
      if (!noClipOrScale) {
        const videoParentElem = this.videoElem.parentElement;
        if (videoParentElem) {
          const videoTransform = videoParentElem.style.getPropertyValue('--video-transform');
          const left = Math.max(0, parseInt(this.videoElem.style.left) || 0);
          const top = Math.max(0, parseInt(this.videoElem.style.top) || 0);
          const scaleX = Math.round(1000 * (1 / this.clippedVideoScale[0])) / 1000;
          const scaleY = Math.round(1000 * (1 / this.clippedVideoScale[1])) / 1000;
          if (videoTransform.indexOf(`translate(${-left}px, ${-top}px)`) === -1 || videoTransform.indexOf(`scale(${scaleX}, ${scaleY})`) === -1) {
            return true;
          }
        }
      }
      if (checkPosition) {
        const projectorsElemRect = this.getElemRect(this.projectorsElem);
        const videoElemRect = this.getElemRect(this.vrVideoElem || this.videoElem);
        const topExtraOffset = !this.isVrVideo && this.settings.horizontalBarsClipPercentage ? videoElemRect.height * (this.settings.horizontalBarsClipPercentage / 100) : 0;
        const leftExtraOffset = !this.isVrVideo && this.settings.verticalBarsClipPercentage ? videoElemRect.width * (this.settings.verticalBarsClipPercentage / 100) : 0;
        const expectedProjectorsRect = {
          width: videoElemRect.width - leftExtraOffset * 2,
          height: videoElemRect.height - topExtraOffset * 2,
          top: videoElemRect.top + topExtraOffset,
          left: videoElemRect.left + leftExtraOffset
        };
        if (Math.abs(projectorsElemRect.height - expectedProjectorsRect.height) > 1 || Math.abs(projectorsElemRect.width - expectedProjectorsRect.width) > 1 || Math.abs(projectorsElemRect.top - expectedProjectorsRect.top) > 2 || Math.abs(projectorsElemRect.left - expectedProjectorsRect.left) > 2) {
          return true;
        }
      }
      return false;
    }
    getElemRect(elem) {
      const scrollableRect = (this.clearfixElem.offsetParent || (this.isFullscreen ? document.fullscreenElement || document.body : document.body)).getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();
      return {
        top: elemRect.top - scrollableRect.top,
        left: elemRect.left - scrollableRect.left,
        width: elemRect.width,
        height: elemRect.height
      };
    }
    scheduleNextFrame() {
      if (this.scheduledNextFrame || !this.canScheduleNextFrame()) return;
      this.scheduleRequestVideoFrame();
      if (this.settings.frameSync == FRAMESYNC_VIDEOFRAMES && this.requestVideoFrameCallbackId && !this.videoIsHidden && !this.settings.frameBlending && !this.settings.frameFading && !this.settings.showFrametimes) return;
      this.scheduledNextFrame = true;
      if (!this.videoIsHidden) {
        requestAnimationFrame(this.onNextFrameWrapped);
      } else {
        const realFramerateLimit = this.getRealFramerateLimit();
        const frameRate = Math.min(Math.max(this.videoFrameRate || 30), realFramerateLimit);
        setTimeout$1(this.scheduleNextFrameDelayed, frameRate);
      }
    }
    detectFrameRate(list, count, currentFrameRate, currentFrameTime, update) {
      const time = currentFrameTime || performance.now();
      let fps = 0;
      if (list.length) {
        if (count < list[0].count) {
          list.splice(0, list.length);
        } else {
          const previous = list[0];
          fps = Math.max(0, (count - previous.count) / ((time - previous.time) / 1000));
        }
      }
      list.push({
        count,
        time,
        fps
      });
      if (!update) return currentFrameRate;
      if (list.length < 2) return 0;
      const thresholdTime = time - this.frameCountHistory;
      const thresholdIndex = list.findIndex(i => i.time >= thresholdTime);
      if (thresholdIndex > 0) list.splice(0, thresholdIndex - 1);
      const aligableList = list.filter(i => i.fps);
      if (!aligableList.length) return 0;
      aligableList.sort((a, b) => a.fps - b.fps);
      if (aligableList.length > 10) {
        const bound = Math.floor(aligableList.length / 16);
        aligableList.splice(0, bound);
        aligableList.splice(aligableList.length - bound, bound);
      }
      const difference = Math.min(5, aligableList[aligableList.length - 1].fps - aligableList[0].fps);
      const deleteCount = Math.min(aligableList.length - 2, Math.max(0, Math.floor(aligableList.length * (difference / 5) - 2)));
      if (deleteCount) {
        aligableList.sort((a, b) => a.time - b.time);
        aligableList.splice(0, deleteCount);
      }
      const average = aligableList.reduce((sum, i) => sum + i.fps, 0) / aligableList.length;
      return average;
    }
    detectFrameRates() {
      var _this$chromiumBugVide4;
      const update = performance.now() > (this.previousUpdate || 0) + this.updateStatsInterval;
      if (update) this.previousUpdate = performance.now();
      this.detectDisplayFrameRate(update);
      this.detectAmbientlightFrameRate(update);
      this.detectVideoFrameRate(update);
      if ((_this$chromiumBugVide4 = this.chromiumBugVideoJitterWorkaround) !== null && _this$chromiumBugVide4 !== void 0 && _this$chromiumBugVide4.update) this.chromiumBugVideoJitterWorkaround.update();
    }
    detectVideoFrameRate(update) {
      this.videoFrameRate = this.detectFrameRate(this.videoFrameCounts, this.getVideoFrameCount(), this.videoFrameRate, this.videoFrameTime, update);
      this.videoFrameTime = undefined;
    }
    detectAmbientlightFrameRate(update) {
      this.ambientlightFrameRate = this.detectFrameRate(this.ambientlightFrameCounts, this.ambientlightFrameCount, this.ambientlightFrameRate, this.ambientlightFrameTime, update);
      this.ambientlightFrameTime = undefined;
    }
    getVideoDroppedFrameCount() {
      var _this$videoElem$getVi;
      if (!this.videoElem) return 0;
      return ((_this$videoElem$getVi = this.videoElem.getVideoPlaybackQuality()) === null || _this$videoElem$getVi === void 0 ? void 0 : _this$videoElem$getVi.droppedVideoFrames) || 0;
    }
    getVideoFrameCount() {
      var _this$videoElem$getVi2;
      if (!this.videoElem) return 0;
      const videoPresentedFrames = this.settings.frameSync === FRAMESYNC_VIDEOFRAMES && this.videoPresentedFrames ? this.videoPresentedFrames : 0;
      const totalVideoFrames = ((_this$videoElem$getVi2 = this.videoElem.getVideoPlaybackQuality()) === null || _this$videoElem$getVi2 === void 0 ? void 0 : _this$videoElem$getVi2.totalVideoFrames) || 0;
      return Math.max(videoPresentedFrames, totalVideoFrames);
    }
    async drawAmbientlight(compose) {
      const shouldShow = this.shouldShow();
      if (!shouldShow) {
        if (!this.isHidden) await this.hide();
        return;
      }
      const drawTime = performance.now();
      if (this.isHidden) this.show();
      if (this.atTop && this.isFillingFullscreen && !this.settings.detectHorizontalBarSizeEnabled && !this.settings.detectVerticalBarSizeEnabled && !this.settings.frameBlending && !this.settings.videoOverlayEnabled || this.isControlledByAnotherExtension || this.isVideoHiddenOnWatchPage || this.videoElem.ended || this.videoElem.readyState === 0 || this.videoElem.readyState === 1) return;
      let newVideoFrameCount = this.getVideoFrameCount();
      let hasNewFrame = false;
      if (this.settings.frameSync == FRAMESYNC_VIDEOFRAMES) {
        if (this.videoIsHidden) {
          hasNewFrame = this.previousFrameTime < drawTime - 1000 / Math.max(24, this.videoFrameRate);
        } else {
          if (this.videoFrameCallbackReceived && this.videoFrameCount == newVideoFrameCount) {
            newVideoFrameCount++;
          }
          hasNewFrame = this.videoFrameCallbackReceived;
          this.videoFrameCallbackReceived = false;
          if (!hasNewFrame) {
            hasNewFrame = this.videoFrameCount < newVideoFrameCount;
          }
        }
      } else if (this.settings.frameSync == FRAMESYNC_DECODEDFRAMES) {
        hasNewFrame = this.videoFrameCount < newVideoFrameCount;
      } else if (this.settings.frameSync == FRAMESYNC_DISPLAYFRAMES) {
        hasNewFrame = true;
      }
      hasNewFrame = hasNewFrame || this.buffersCleared || this.isVrVideo;
      const droppedFrames = this.videoFrameCount > 120 && this.videoFrameCount < newVideoFrameCount - 1;
      if (droppedFrames && !this.buffersCleared) {
        this.ambientlightVideoDroppedFrameCount += newVideoFrameCount - (this.videoFrameCount + 1);
      }
      if (newVideoFrameCount > this.videoFrameCount || newVideoFrameCount < this.videoFrameCount - 60) {
        this.videoFrameCount = newVideoFrameCount;
      }
      const detectBarSize = hasNewFrame && (this.settings.detectHorizontalBarSizeEnabled || this.settings.detectVerticalBarSizeEnabled) && !this.isVrVideo;
      const dontDrawAmbientlight = this.atTop && this.isFillingFullscreen || this.settings.spread === 0 && this.settings.blur2 === 0;
      const dontDrawBuffer = dontDrawAmbientlight && !detectBarSize;
      if (this.settings.frameBlending && this.settings.frameBlendingSmoothness) {
        if (!this.previousProjectorBuffer) {
          this.initFrameBlending();
        }
        if (this.settings.videoOverlayEnabled && !this.previousVideoOverlayBuffer) {
          this.initVideoOverlayWithFrameBlending();
        }
        if (hasNewFrame || this.buffersCleared || !this.previousDrawFullAlpha) {
          if (hasNewFrame || this.buffersCleared) {
            if (this.settings.videoOverlayEnabled) {
              this.previousVideoOverlayBuffer.ctx.drawImage(this.videoOverlayBuffer.elem, 0, 0);
              this.videoOverlayBuffer.ctx.drawImage(this.vrVideoElem ?? this.videoElem, 0, 0, this.videoOverlayBuffer.elem.width, this.videoOverlayBuffer.elem.height);
              if (this.buffersCleared) {
                this.previousVideoOverlayBuffer.ctx.drawImage(this.videoOverlayBuffer.elem, 0, 0);
              }
            }
            if (!dontDrawBuffer) {
              if (!this.buffersCleared) {
                this.previousProjectorBuffer.ctx.drawImage(this.projectorBuffer.elem, 0, 0);
              }
              this.projectorBuffer.ctx.clearRect(0, 0, this.projectorBuffer.elem.width, this.projectorBuffer.elem.height);
              this.projectorBuffer.ctx.drawImage(this.vrVideoElem ?? this.videoElem, 0, 0, this.projectorBuffer.elem.width, this.projectorBuffer.elem.height);
              if (this.buffersCleared) {
                this.previousProjectorBuffer.ctx.drawImage(this.projectorBuffer.elem, 0, 0);
              }
            }
          }
          let alpha = 1;
          const ambientlightFrameDuration = 1000 / this.ambientlightFrameRate;
          if (hasNewFrame) {
            this.frameBlendingFrameTimeStart = drawTime - ambientlightFrameDuration / 2;
          }
          if (this.displayFrameRate >= this.videoFrameRate * 1.33) {
            if (hasNewFrame && !this.previousDrawFullAlpha) {
              alpha = 0;
            } else {
              const videoFrameDuration = 1000 / this.videoFrameRate;
              const frameToDrawDuration = drawTime - this.frameBlendingFrameTimeStart;
              const frameToDrawDurationThresshold = (frameToDrawDuration + ambientlightFrameDuration / 2) / (this.settings.frameBlendingSmoothness / 100);
              if (frameToDrawDurationThresshold < videoFrameDuration) {
                alpha = Math.min(1, frameToDrawDuration / (1000 / (this.videoFrameRate / (this.settings.frameBlendingSmoothness / 100) || 1)));
              }
            }
          }
          if (alpha === 1) {
            this.previousDrawFullAlpha = true;
          } else {
            this.previousDrawFullAlpha = false;
          }
          if (this.settings.videoOverlayEnabled && this.videoOverlay && !this.videoOverlay.isHidden) {
            if (alpha !== 1) {
              if (this.videoOverlay.ctx.globalAlpha !== 1) {
                this.videoOverlay.ctx.globalAlpha = 1;
              }
              this.videoOverlay.ctx.drawImage(this.previousVideoOverlayBuffer.elem, 0, 0);
            }
            if (alpha > 0.005) {
              this.videoOverlay.ctx.globalAlpha = alpha;
              this.videoOverlay.ctx.drawImage(this.videoOverlayBuffer.elem, 0, 0);
            }
            this.videoOverlay.ctx.globalAlpha = 1;
          }
          if (!dontDrawAmbientlight) {
            if (alpha !== 1) {
              if (this.blendedProjectorBuffer.ctx.globalAlpha !== 1) this.blendedProjectorBuffer.ctx.globalAlpha = 1;
              this.blendedProjectorBuffer.ctx.drawImage(this.previousProjectorBuffer.elem, 0, 0);
            }
            if (alpha > 0.005) {
              this.blendedProjectorBuffer.ctx.globalAlpha = alpha;
              this.blendedProjectorBuffer.ctx.drawImage(this.projectorBuffer.elem, 0, 0);
            }
            this.blendedProjectorBuffer.ctx.globalAlpha = 1;
            this.projector.draw(this.blendedProjectorBuffer.elem);
          }
        }
      } else {
        if (!hasNewFrame && !this.settings.frameFading) return;
        if (this.settings.videoOverlayEnabled && this.videoOverlay && !this.videoOverlay.isHidden) {
          if (this.enableChromiumBug1092080Workaround) {
            this.videoOverlay.ctx.clearRect(0, 0, this.videoOverlay.elem.width, this.videoOverlay.elem.height);
          }
          this.videoOverlay.ctx.drawImage(this.vrVideoElem ?? this.videoElem, 0, 0, this.videoOverlay.elem.width, this.videoOverlay.elem.height);
        }
        const shouldDrawDirectlyFromVideoElem = this.shouldDrawDirectlyFromVideoElem();
        if (!dontDrawBuffer) {
          if (!shouldDrawDirectlyFromVideoElem) {
            this.projectorBuffer.ctx.drawImage(this.vrVideoElem ?? this.videoElem, 0, 0, this.projectorBuffer.elem.width, this.projectorBuffer.elem.height);
          }
          if (!dontDrawAmbientlight) {
            if (!shouldDrawDirectlyFromVideoElem) {
              this.projector.draw(this.projectorBuffer.elem);
            } else {
              this.projector.draw(this.vrVideoElem ?? this.videoElem);
            }
          }
        }
      }
      this.buffersCleared = false;
      if (!dontDrawBuffer || this.settings.videoOverlayEnabled) {
        this.ambientlightFrameCount++;
        this.ambientlightFrameTime = compose;
      }
      this.previousDrawTime = drawTime;
      if (hasNewFrame) {
        this.previousFrameTime = drawTime;
      }
      if (this.enableMozillaBug1606251Workaround) {
        this.containerElem.style.transform = `translateZ(${this.ambientlightFrameCount % 10}px)`;
      }
      return {
        hasNewFrame,
        detectBarSize
      };
    }
    checkIfNeedToHideVideoOverlay() {
      if (!this.videoOverlay) return;
      if (!this.hideVideoOverlayCache) {
        this.hideVideoOverlayCache = {
          prevAmbientlightVideoDroppedFrameCount: this.ambientlightVideoDroppedFrameCount,
          framesInfo: [],
          isHiddenChangeTimestamp: 0
        };
      }
      let {
        prevAmbientlightVideoDroppedFrameCount,
        framesInfo,
        isHiddenChangeTimestamp
      } = this.hideVideoOverlayCache;
      const newFramesDropped = Math.max(0, this.ambientlightVideoDroppedFrameCount - prevAmbientlightVideoDroppedFrameCount);
      this.hideVideoOverlayCache.prevAmbientlightVideoDroppedFrameCount = this.ambientlightVideoDroppedFrameCount;
      framesInfo.push({
        time: performance.now(),
        framesDropped: newFramesDropped
      });
      const frameDropTimeLimit = performance.now() - 2000;
      framesInfo = framesInfo.filter(info => info.time > frameDropTimeLimit);
      this.hideVideoOverlayCache.framesInfo = framesInfo;
      let hide = this.videoElem.paused || this.videoElem.seeking || this.videoIsHidden || this.isFillingFullscreen && this.atTop && !this.settings.frameBlending;
      const syncThreshold = this.settings.videoOverlaySyncThreshold;
      if (!hide && syncThreshold !== 100) {
        if (framesInfo.length < 5) {
          hide = true;
        } else {
          const droppedFramesCount = framesInfo.reduce((sum, info) => sum + info.framesDropped, 0);
          const droppedFramesThreshold = this.videoFrameRate * 2 * (syncThreshold / 100);
          hide = droppedFramesCount > droppedFramesThreshold;
        }
      }
      if (hide) {
        if (!this.videoOverlay.isHidden) {
          this.videoOverlay.elem.classList.add('ambientlight__video-overlay--hide');
          this.videoOverlay.isHidden = true;
          this.hideVideoOverlayCache.isHiddenChangeTimestamp = performance.now();
          this.stats.update();
        }
      } else if (syncThreshold == 100 || isHiddenChangeTimestamp + 2000 < performance.now()) {
        if (this.videoOverlay.isHidden) {
          this.videoOverlay.elem.classList.remove('ambientlight__video-overlay--hide');
          this.videoOverlay.isHidden = false;
          this.hideVideoOverlayCache.isHiddenChangeTimestamp = performance.now();
          this.stats.update();
        }
      }
    }
    async enable(initial = false) {
      if (!initial) {
        this.settings.set('enabled', true, true);
      }
      await this.start(initial);
    }
    async disable() {
      if (this.pendingStart) return;
      this.settings.set('enabled', false, true);
      this.updateKeywordsToPreventTheaterScaling();
      await this.hide();
    }
    async hide() {
      var _this$chromiumBugVide5, _this$videoOverlay, _this$videoOverlay$el, _this$videoDebandingE;
      if (this.isHidden) return;
      this.isHidden = true;
      if ((_this$chromiumBugVide5 = this.chromiumBugVideoJitterWorkaround) !== null && _this$chromiumBugVide5 !== void 0 && _this$chromiumBugVide5.update) this.chromiumBugVideoJitterWorkaround.update();
      const toDark = this.theming.shouldBeDarkTheme(false);
      await injectedScript.postAndReceiveMessage('hide', {
        toDark,
        ytdAppElemBackground: toDark ? '#000' : '#fff'
      });
      await this.theming.updateTheme();
      if (this.isVrVideo) this.disposeVR();
      if ((_this$videoOverlay = this.videoOverlay) !== null && _this$videoOverlay !== void 0 && (_this$videoOverlay$el = _this$videoOverlay.elem) !== null && _this$videoOverlay$el !== void 0 && _this$videoOverlay$el.isConnected) {
        this.videoOverlay.elem.remove();
      }
      if ((_this$videoDebandingE = this.videoDebandingElem) !== null && _this$videoDebandingE !== void 0 && _this$videoDebandingE.isConnected) {
        this.videoDebandingElem.remove();
      }
      this.resetVideoParentElemStyle();
      this.clear();
      this.stats.hide();
      this.updateLayoutPerformanceImprovements();
      await this.updateSizes();
    }
    async show() {
      if (!this.isHidden) return;
      this.isHidden = false;
      const toDark = this.theming.shouldBeDarkTheme(true);
      await injectedScript.postAndReceiveMessage('show', {
        toDark,
        ytdAppElemBackground: toDark ? '#000' : '#fff',
        hideScrollbar: this.settings.hideScrollbar,
        relatedScrollbar: this.settings.relatedScrollbar,
        immersiveMode: this.shouldEnableImmersiveMode()
      });
      wrapErrorHandler(async function afterShow() {
        var _this$chromiumBugVide6;
        if (this.settings.layoutPerformanceImprovements) this.updateLayoutPerformanceImprovements();
        const updateDocument = this.handleDocumentVisibilityChange();
        await this.theming.updateTheme();
        await updateDocument;
        try {
          await new Promise(resolve => raf(resolve));
          const menu = document.querySelector('ytd-menu-renderer[has-flexible-items]');
          if (menu !== null && menu !== void 0 && menu.onStamperFinished) {
            menu.onStamperFinished();
          }
        } catch {}
        if ((_this$chromiumBugVide6 = this.chromiumBugVideoJitterWorkaround) !== null && _this$chromiumBugVide6 !== void 0 && _this$chromiumBugVide6.update) this.chromiumBugVideoJitterWorkaround.update();
      }.bind(this))();
    }
    async updateImmersiveMode() {
      const html = document.documentElement;
      const enabled = html.getAttribute('data-ambientlight-immersive') != null;
      const enable = this.shouldEnableImmersiveMode();
      if (enabled === enable) return;
      await injectedScript.postAndReceiveMessage('update-immersive-mode', enable);
    }
  }

  class ContentScript {
    constructor() {
      this.globalListener = void 0;
      this.listeners = [];
      this.addMessageListener = (type, handler) => {
        if (!this.globalListener) {
          this.globalListener = wrapErrorHandler(function contentScriptMessageListenerGlobal(event) {
            if (!event.detail || typeof event.detail !== 'string') return;
            const detail = JSON.parse(event.detail);
            if (!isSameWindowMessage || (detail === null || detail === void 0 ? void 0 : detail.contentScript) !== extensionId || !(detail !== null && detail !== void 0 && detail.type)) return;
            for (const listener of this.listeners) {
              listener(detail);
            }
          }.bind(this), true);
          document.addEventListener('ytal-message', this.globalListener);
        }
        const listener = wrapErrorHandler(function contentScriptMessageListener(detail) {
          if (detail.type !== type) return;
          handler(detail === null || detail === void 0 ? void 0 : detail.message);
        }.bind(this), true);
        this.listeners.push(listener);
        return listener;
      };
      this.removeMessageListener = listener => {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
        if (this.globalListener && this.listeners.length === 0) {
          document.removeEventListener('ytal-message', this.globalListener, true);
          this.globalListener = undefined;
        }
      };
      this.postMessage = (type, message) => {
        const event = new CustomEvent('ytal-message', {
          detail: JSON.stringify({
            type,
            message,
            injectedScript: extensionId
          })
        });
        return document.dispatchEvent(event);
      };
    }
  }
  const contentScript = new ContentScript();

  setErrorHandler(ex => SentryReporter.captureException(ex));
  wrapErrorHandler(async function initVersionAndCrashOptions() {
    const version = getVersion();
    setVersion(version);
    const crashOptions = (await storage.get('crashOptions')) || defaultCrashOptions;
    setCrashOptions(crashOptions);
    contentScript.addMessageListener('crashOptions', newCrashOptions => {
      setCrashOptions(newCrashOptions);
    });
    storage.addListener(function storageListener(changes) {
      var _changes$crashOptions;
      if (!((_changes$crashOptions = changes.crashOptions) !== null && _changes$crashOptions !== void 0 && _changes$crashOptions.newValue)) return;
      const crashOptions = changes.crashOptions.newValue;
      setCrashOptions(crashOptions);
    });
  })();
  let errorEvents;
  wrapErrorHandler(function initErrorEvents() {
    errorEvents = new ErrorEvents();
  })();
  const logErrorEventWithPageTrees = (message, details = {}) => {
    if (!isWatchPageUrl()) return;
    if (isVideoInKnownInvalidLocation()) return;
    details = {
      ...details,
      ...getPageElems()
    };
    errorEvents.add(message, details);
  };
  const isVideoInKnownInvalidLocation = () => {
    const ytdAppPlayerVideoElem = () => document.querySelector('ytd-app > #container.ytd-player video.html5-main-video');
    const playerApiVideoElem = () => document.querySelector('#player-api video.html5-main-video');
    const ytPlayerManagerVideoElem = () => document.querySelector('yt-player-manager video.html5-main-video');
    const ytdInlinePreviewPlayerVideoElem = () => document.querySelector('#inline-preview-player video.html5-main-video');
    const ytdBrowseVideoElem = () => document.querySelector('ytd-browse video.html5-main-video');
    const ytdMiniplayerVideoElem = () => document.querySelector('ytd-miniplayer video.html5-main-video');
    const channelPlayerVideoElem = () => document.querySelector('ytd-channel-video-player-renderer video.html5-main-video');
    const isInShorts = () => document.querySelector('ytd-shorts video.html5-main-video');
    const isControlledByAnotherExtension = () => document.querySelector('.html5-video-container video.stefanvdvideotop');
    const outsideYtdAppVideoElem = () => document.querySelector('html > *:not(body) video.html5-main-video, body > *:not(ytd-app) video.html5-main-video, body > video.html5-main-video');
    return !!(ytdAppPlayerVideoElem() || playerApiVideoElem() || ytPlayerManagerVideoElem() || ytdInlinePreviewPlayerVideoElem() || ytdBrowseVideoElem() || ytdMiniplayerVideoElem() || channelPlayerVideoElem() || isInShorts() || isControlledByAnotherExtension() || outsideYtdAppVideoElem());
  };
  const detectDetachedVideo = () => {
    const observer = new MutationObserver(wrapErrorHandler(function detectDetachedVideo() {
      if (!isWatchPageUrl()) return;
      const videoElem = ambientlight.videoElem;
      const ytdAppElem = ambientlight.ytdAppElem ?? document.body;
      const isDetached = !videoElem || !(ytdAppElem !== null && ytdAppElem !== void 0 && ytdAppElem.contains(videoElem)) || !document.contains(ytdAppElem);
      if (!isDetached) {
        if (errorEvents.list.length) {
          errorEvents.list = [];
        }
        return;
      }
      if (!document.querySelector('video')) return;
      const newVideoElem = document.body !== ytdAppElem ? document.querySelector(watchSelectors.map(selector => `ytd-app #content.ytd-app ${selector} video.html5-main-video`).join(', ')) : ytdAppElem.querySelector('video.html5-main-video');
      if (!newVideoElem) {
        logErrorEventWithPageTrees('detectDetachedVideo');
        return;
      }
      if (document.body !== ytdAppElem) {
        const newYtdAppElem = newVideoElem.closest('ytd-app');
        if (newYtdAppElem !== ytdAppElem) {
          var _document$documentEle, _document$documentEle2;
          const details = {
            documentHasOldVideo: document.contains(videoElem),
            documentHasOldYtdApp: document.contains(ytdAppElem),
            htmlHasOldVideo: (_document$documentEle = document.documentElement) === null || _document$documentEle === void 0 ? void 0 : _document$documentEle.contains(videoElem),
            htmlHasOldYtdApp: (_document$documentEle2 = document.documentElement) === null || _document$documentEle2 === void 0 ? void 0 : _document$documentEle2.contains(ytdAppElem),
            newYtdAppHasOldVideo: newYtdAppElem === null || newYtdAppElem === void 0 ? void 0 : newYtdAppElem.contains(videoElem),
            oldYtdAppHasOldVideo: ytdAppElem === null || ytdAppElem === void 0 ? void 0 : ytdAppElem.contains(videoElem),
            oldYtdAppTree: getNodeTreeString(ytdAppElem),
            oldVideoTree: getNodeTreeString(videoElem)
          };
          logErrorEventWithPageTrees('detectDetachedYtdApp', details);
          return;
        }
      }
      if (videoElem !== newVideoElem) {
        ambientlight.initVideoElem(newVideoElem);
      }
      ambientlight.start();
      if (errorEvents.list.length) {
        errorEvents.list = [];
      }
    }, true));
    observer.observe(document, {
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true
    });
  };
  const waitForVideoInteraction = async videoElem => {
    if (videoElem.readyState > 2 && !videoElem.paused && !videoElem.ended) return;
    await new Promise((resolve, reject) => {
      try {
        const onInteraction = () => {
          off(videoElem, 'playing', onInteraction);
          off(window, 'click', onInteraction);
          resolve();
        };
        on(videoElem, 'playing', onInteraction, {
          once: true
        });
        on(window, 'click', onInteraction, {
          once: true
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };
  const tryInitAmbientlight = async () => {
    if (window.ambientlight) return true;
    if (!isWatchPageUrl()) return;
    if (!document.querySelector('video')) return;
    const settingsMenuBtnParentSelector = ['.html5-video-player .ytp-right-controls', '.html5-video-player .ytp-chrome-controls > *:last-child'].join(', ');
    const hasSettingsMenuBtnParent = !!document.querySelector(settingsMenuBtnParentSelector);
    if (!hasSettingsMenuBtnParent) {
      logErrorEventWithPageTrees(`initialize - not found yet: ${settingsMenuBtnParentSelector}`);
      return;
    }
    if (isEmbedPageUrl()) {
      var _document$body;
      const videoElem = document.querySelector('#player .html5-video-player .html5-video-container video.html5-main-video');
      if (!videoElem) {
        logErrorEventWithPageTrees('initialize - not found yet: #player .html5-video-player .html5-video-container video.html5-main-video');
        return;
      }
      await waitForVideoInteraction(videoElem);
      if (!((_document$body = document.body) !== null && _document$body !== void 0 && _document$body.contains(videoElem))) return;
      window.ambientlight = await new Ambientlight(videoElem);
      errorEvents.list = [];
      detectDetachedVideo();
      return true;
    }
    const videoElem = document.querySelector(watchSelectors.map(selector => `ytd-app #content.ytd-app ${selector} .html5-video-player .html5-video-container video.html5-main-video`).join(', '));
    if (!videoElem) {
      logErrorEventWithPageTrees('initialize - not found yet: ytd-app ytd-watch-... .html5-video-player .html5-video-container video.html5-main-video');
      return;
    }
    const ytdAppElem = document.querySelector('ytd-app');
    if (!ytdAppElem) {
      logErrorEventWithPageTrees('initialize - not found yet: ytd-app');
      return;
    }
    const contentElem = document.querySelector('#content.ytd-app');
    if (!contentElem) {
      logErrorEventWithPageTrees('initialize - not found yet: #content.ytd-app');
      return;
    }
    const ytdWatchElem = document.querySelector(watchSelectors.map(selector => `ytd-app ${selector}`).join(', '));
    if (!ytdWatchElem) {
      logErrorEventWithPageTrees(`initialize - not found yet: ytd-app ytd-watch-...`);
      return;
    }
    const mastheadElem = document.querySelector('ytd-app #masthead-container');
    if (!mastheadElem) {
      logErrorEventWithPageTrees('initialize - not found yet: #masthead-container');
      return;
    }
    window.ambientlight = await new Ambientlight(videoElem, ytdAppElem, ytdWatchElem, mastheadElem);
    errorEvents.list = [];
    detectDetachedVideo();
    detectPageTransitions(ytdAppElem);
    if (!window.ambientlight.isOnVideoPage) {
      detectWatchPageVideo(ytdAppElem);
    }
    return true;
  };
  const getWatchPageViewObserver = function initGetWatchPageViewObserver() {
    let observer;
    return function getWatchPageViewObserver() {
      if (!observer) {
        observer = new MutationObserver(wrapErrorHandler(function watchPageViewObserved() {
          startIfWatchPageHasVideo();
        }, true));
      }
      return observer;
    };
  }();
  const detectWatchPageVideo = ytdAppElem => {
    getWatchPageViewObserver().observe(ytdAppElem, {
      childList: true,
      subtree: true
    });
  };
  const startIfWatchPageHasVideo = () => {
    if (!isWatchPageUrl() || window.ambientlight.isOnVideoPage) {
      getWatchPageViewObserver().disconnect();
      return;
    }
    const videoElem = document.querySelector(watchSelectors.map(selector => `ytd-app ${selector} video.html5-main-video`).join(', '));
    if (!videoElem) return;
    getWatchPageViewObserver().disconnect();
    window.ambientlight.isOnVideoPage = true;
    window.ambientlight.start();
  };
  const detectPageTransitions = ytdAppElem => {
    on(document, 'yt-navigate-finish', async function onYtNavigateFinish() {
      getWatchPageViewObserver().disconnect();
      if (isWatchPageUrl()) {
        startIfWatchPageHasVideo();
        if (!window.ambientlight.isOnVideoPage) {
          detectWatchPageVideo(ytdAppElem);
        }
      } else {
        if (window.ambientlight.isOnVideoPage) {
          window.ambientlight.isOnVideoPage = false;
          await window.ambientlight.hide();
        }
      }
    }, undefined, true);
  };
  const loadAmbientlight = async () => {
    if (document.querySelector('#player-control-container')) return;
    let observerTarget = document.querySelector('ytd-app');
    if (!observerTarget) {
      if (isEmbedPageUrl()) {
        observerTarget = document.documentElement;
      } else {
        const otherAppElems = getOtherUnknownAppElems();
        if (otherAppElems.length) {
          const selectorTree = getSelectorTreeString(otherAppElems.map(elem => elem.tagName).join(','));
          throw new AmbientlightError('Found one or more *-app elements but cannot find desktop app element: ytd-app', selectorTree);
        }
        return;
      }
    }
    if (await tryInitAmbientlight()) return;
    try {
      await Settings.getStoredSettingsCached();
    } catch (ex) {
      var _ex$message;
      setWarning(`Your previous settings cannot be loaded. Refresh the webpage to try it again. ${'\n'}This can happen after you have updated the extension. ${'\n\n'}${ex === null || ex === void 0 ? void 0 : ex.toString()}`);
      if (!(ex.message === 'uninstalled' || (_ex$message = ex.message) !== null && _ex$message !== void 0 && _ex$message.includes('QuotaExceededError'))) {
        console.error(ex);
      }
    }
    let initializing = false;
    let tryAgain = true;
    const observer = new MutationObserver(wrapErrorHandler(async function ytdAppObserved(mutationsList, observer) {
      if (initializing) {
        tryAgain = true;
        return;
      }
      if (window.ambientlight) {
        observer.disconnect();
        return;
      }
      initializing = true;
      try {
        if (await tryInitAmbientlight()) {
          observer.disconnect();
        } else {
          while (tryAgain && !window.ambientlight) {
            tryAgain = false;
            if (await tryInitAmbientlight()) {
              observer.disconnect();
              tryAgain = false;
            }
          }
          initializing = false;
        }
      } catch (ex) {
        observer.disconnect();
        throw ex;
      }
    }, true));
    observer.observe(observerTarget, {
      childList: true,
      subtree: true
    });
  };
  const onLoad = wrapErrorHandler(async function onLoadCallback() {
    if (window.ambientlight !== undefined) return;
    window.ambientlight = false;
    await loadAmbientlight();
  });
  (function setup() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onLoad, {
          once: true
        });
      } else {
        onLoad();
      }
    } catch (ex) {
      SentryReporter.captureException(ex);
    }
  })();

})();
//# sourceMappingURL=content-main.js.map

//# debugId=1db415dd-6d6b-568a-9fb0-f2ed9faa3620
