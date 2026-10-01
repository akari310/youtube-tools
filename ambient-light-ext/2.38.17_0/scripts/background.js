
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="bda5df42-6f59-5366-ab7a-14567ab60645")}catch(e){}}();
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

  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason !== 'install' && details.reason !== 'update') return;
    if (chrome.runtime.setUninstallURL) {
      chrome.runtime.setUninstallURL(getFeedbackFormLink());
    }
    if (details.reason === 'install' && getBrowser() === 'Firefox') {
      chrome.runtime.openOptionsPage();
    }
  });
  chrome.action.onClicked.addListener(function () {
    chrome.runtime.openOptionsPage();
  });

})();
//# sourceMappingURL=background.js.map

//# debugId=bda5df42-6f59-5366-ab7a-14567ab60645
