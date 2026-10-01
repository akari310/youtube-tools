
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c46e2379-9873-5d43-b2da-16a6ffc1dc27")}catch(e){}}();
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


  const getVersion = () => {
    try {
      return (chrome.runtime.getManifest() || {}).version;
    } catch {
      return null;
    }
  };

  const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  };
  let errorHandler = ex => {
    console.error(ex);
  };
  const setErrorHandler = handler => {
    errorHandler = handler;
  };
  const wrapErrorHandlerHandleError = (stack, ex, reportOnce, reported) => {
    if (reportOnce) {
      if (reported.includes(ex.message)) return;
      reported.push(ex.message);
    }
    appendErrorStack(stack, ex);
    if (errorHandler) errorHandler(ex);
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
  globalThis.matchMedia('(color-gamut: p3)').matches ? 'display-p3' : 'srgb';
  globalThis.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' : globalThis.matchMedia('(color-gamut: p3)').matches ? 'display-p3' : 'srgb';
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
  const isEmbedPageUrl = () => {
    var _location$pathname;
    return (_location$pathname = location.pathname) === null || _location$pathname === void 0 ? void 0 : _location$pathname.startsWith('/embed/');
  };
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

  let settings;
  let version = '';
  const setVersion = newVersion => {
    version = newVersion;
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
      release: version || 'pending',
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
            reports = reports.filter(report => !version || report.version === version);
            const reportsToday = reports.filter(report => report.time > dayAgo);
            const reportsThisWeek = reports.filter(report => report.time > weekAgo);
            if (reportsToday.length < 4 && reportsThisWeek.length < 5) {
              reportsThisWeek.push({
                time: Date.now(),
                error: ex.message,
                version: version || 'pending'
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
          if (settings) ;
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

  setErrorHandler(ex => SentryReporter.captureException(ex));
  injectedScript.addMessageListener('error', injectedEx => {
    const ex = new Error(injectedEx.message);
    ex.name = injectedEx.name;
    ex.stack = injectedEx.stack;
    if (injectedEx.details) ex.details = injectedEx.details;
    SentryReporter.captureException(ex);
  });
  const setResourceWarning = url => {
    setWarning(url ? `Failed to load a resource. Reload the webpage to try it again. 
This can happen after you have updated the extension. 

Or if this happens often, view the error in your browser's DevTools javascript console panel. 
Tip: Look for errors about this url: ${url}` : `Failed to load the extension on this webpage because it has been updated, reloaded or uninstalled. 
Reload the webpage to reload the extension.`);
  };
  const waitForHtmlElement = async () => {
    if (document.documentElement) return;
    const stack = new Error().stack;
    await new Promise((resolve, reject) => {
      try {
        const observer = new MutationObserver(wrapErrorHandler(function onHtmlElementMutation() {
          if (!document.documentElement) return;
          observer.disconnect();
          resolve();
        }.bind(window), true));
        observer.observe(document, {
          childList: true
        });
      } catch (ex) {
        appendErrorStack(stack, ex);
        reject(ex);
      }
    });
  };
  const waitForHeadElement = async () => {
    if (document.head) return;
    const stack = new Error().stack;
    await new Promise((resolve, reject) => {
      try {
        const observer = new MutationObserver(wrapErrorHandler(function onHeadElementMutation() {
          if (!document.head) return;
          observer.disconnect();
          resolve();
        }.bind(window), true));
        observer.observe(document.documentElement, {
          childList: true
        });
      } catch (ex) {
        appendErrorStack(stack, ex);
        reject(ex);
      }
    });
  };
  const captureResourceLoadingException = async (url, event) => {
    var _chrome, _chrome$runtime;
    if (!((_chrome = chrome) !== null && _chrome !== void 0 && (_chrome$runtime = _chrome.runtime) !== null && _chrome$runtime !== void 0 && _chrome$runtime.id)) {
      setResourceWarning();
      return;
    }
    let error;
    try {
      const stack = new Error().stack;
      await new Promise((resolve, reject) => {
        try {
          const req = new XMLHttpRequest();
          req.onreadystatechange = () => {
            try {
              if (req.readyState == XMLHttpRequest.DONE) {
                if (req.status !== 200) {
                  error = new Error(`Cannot load ${url} (Status: ${req.statusText} ${req.status})`);
                  appendErrorStack(stack, error);
                }
                resolve();
              }
            } catch (ex) {
              reject(ex);
            }
          };
          req.open('GET', url, true);
          req.send();
        } catch (ex) {
          appendErrorStack(stack, ex);
          reject(ex);
        }
      });
    } catch (ex) {
      error = ex;
    } finally {
      if (error) {
        error.details = event;
        SentryReporter.captureException(error);
      }
      setResourceWarning(url);
    }
  };
  wrapErrorHandler(async function loadContentScript() {
    var _chrome2, _chrome2$runtime, _chrome3, _chrome3$runtime, _chrome4, _chrome4$runtime;
    const version = getVersion();
    setVersion(version);
    let crashOptions = defaultCrashOptions;
    try {
      crashOptions = (await storage.get('crashOptions')) || defaultCrashOptions;
      setCrashOptions(crashOptions);
    } catch (ex) {
      SentryReporter.captureException(ex);
    }
    storage.addListener(function storageListener(changes) {
      var _changes$crashOptions;
      if (!((_changes$crashOptions = changes.crashOptions) !== null && _changes$crashOptions !== void 0 && _changes$crashOptions.newValue)) return;
      const crashOptions = changes.crashOptions.newValue;
      setCrashOptions(crashOptions);
    });
    await waitForHtmlElement();
    await waitForHeadElement();
    if (!((_chrome2 = chrome) !== null && _chrome2 !== void 0 && (_chrome2$runtime = _chrome2.runtime) !== null && _chrome2$runtime !== void 0 && _chrome2$runtime.id)) {
      setResourceWarning();
      return;
    }
    let loaded = await new Promise(resolve => {
      let url;
      try {
        url = chrome.runtime.getURL('styles/content.css');
      } catch {
        setResourceWarning();
        resolve(false);
        return;
      }
      if (document.head.querySelector(`link[href="${url}"]`)) {
        resolve(true);
        return;
      }
      const style = document.createElement('link');
      style.href = url;
      style.rel = 'stylesheet';
      style.addEventListener('error', async function injectStyleOnError(event) {
        await captureResourceLoadingException(style.href, event);
        resolve(false);
      }.bind(this));
      style.addEventListener('load', function injectStyleOnLoad() {
        resolve(true);
      }.bind(this));
      document.head.appendChild(style);
    });
    if (!((_chrome3 = chrome) !== null && _chrome3 !== void 0 && (_chrome3$runtime = _chrome3.runtime) !== null && _chrome3$runtime !== void 0 && _chrome3$runtime.id)) {
      setResourceWarning();
      return;
    }
    if (!loaded) return;
    loaded = await new Promise(resolve => {
      let url;
      try {
        url = chrome.runtime.getURL('scripts/injected.js');
      } catch {
        setResourceWarning();
        resolve(false);
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.setAttribute('data-crash-options', JSON.stringify(crashOptions));
      script.setAttribute('data-version', version);
      script.addEventListener('error', async function injectScriptOnError(event) {
        await captureResourceLoadingException(script.src, event);
        resolve(false);
      }.bind(this));
      script.addEventListener('load', function injectStyleOnLoad() {
        resolve(true);
      }.bind(this));
      document.head.appendChild(script);
    });
    if (!((_chrome4 = chrome) !== null && _chrome4 !== void 0 && (_chrome4$runtime = _chrome4.runtime) !== null && _chrome4$runtime !== void 0 && _chrome4$runtime.id)) {
      setResourceWarning();
      return;
    }
    if (!loaded) return;
    let scriptUrl;
    try {
      scriptUrl = chrome.runtime.getURL('scripts/content-main.js');
    } catch {
      setResourceWarning();
      return;
    }
    try {
      await import(scriptUrl);
    } catch (error) {
      await captureResourceLoadingException(scriptUrl, error);
    }
  })();

})();
//# sourceMappingURL=content.js.map

//# debugId=c46e2379-9873-5d43-b2da-16a6ffc1dc27
