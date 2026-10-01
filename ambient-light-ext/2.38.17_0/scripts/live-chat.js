
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e08a0677-00b4-54b5-ad2f-8ef965e2ffd1")}catch(e){}}();
(function (exports) {
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


  const waitForDomElement = (check, container) => new Promise(resolve => {
    const elem = check();
    if (elem) {
      resolve(elem);
      return;
    }
    const observer = new MutationObserver(() => {
      const elem = check();
      if (!elem) return;
      observer.disconnect();
      resolve(elem);
    });
    observer.observe(container, {
      childList: true,
      subtree: true
    });
  });
  (async function setup() {
    const ytLiveChatAppElem = await waitForDomElement(() => document.querySelector('yt-live-chat-app'), document.documentElement);
    const documentObserver = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('dark') !== null;
      ytLiveChatAppElem.toggleAttribute('dark', isDark);
    });
    documentObserver.observe(document.documentElement, {
      attributes: true
    });
  })();

  exports.waitForDomElement = waitForDomElement;

  return exports;

})({});
//# sourceMappingURL=live-chat.js.map

//# debugId=e08a0677-00b4-54b5-ad2f-8ef965e2ffd1
