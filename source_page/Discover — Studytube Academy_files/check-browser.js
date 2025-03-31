// TODO: Make the scripts directory shared across all projects
(function (w) {
  let UA = window.navigator.userAgent;

  function getBrowserSpec() {
    let browser = [];
    let Firefox = UA.match(/Firefox\/\w+\.\w+/i);
    let Chrome = UA.match(/Chrome\/\w+\.\w+/i);
    let Safari = UA.match(/Version\/\w+\.\w+/i);
    let SafariVersion = UA.match(/Safari\/\w+\.\w+/i);
    let IE = UA.match(/MSIE *\d+\.\w+/i);
    let Edge = UA.match(/Edge\/[\d.]+/i);
    let Opera = UA.match(/OPR\/[\d]+/i);
    let Trident = UA.match(/Trident\/\w+\.\w+/i);

    if (Opera) {
      browser = Opera[0].replace('OPR', 'Opera');
    } else if (Trident) {
      // Trident should be checked before IE to ignore Compatibility mode
      browser = Trident[0];
    } else if (IE) {
      browser = IE[0];
    } else if (Edge) {
      browser = Edge[0];
    } else if (Firefox) {
      browser = Firefox[0];
    } else if (Chrome) {
      browser = Chrome[0];
    } else if (Safari && SafariVersion) {
      browser = Safari[0].replace('Version', 'Safari');
    }

    browser = browser.split(/[ /.]/i);
    return browser;
  }

  function isMobile() {
    return (
      UA.match(/Android/i) ||
      UA.match(/webOS/i) ||
      UA.match(/iPhone/i) ||
      UA.match(/iPad/i) ||
      UA.match(/iPod/i) ||
      UA.match(/BlackBerry/i) ||
      UA.match(/Windows Phone/i)
    );
  }

  function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split('&');

    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');

      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  function getBrowseDesktopRequirements() {
    return {
      Chrome: 48,
      Safari: 10,
      Firefox: 51,
      Trident: 8, // for new IE - https://msdn.microsoft.com/en-us/library/ms537503%28v=vs.85%29.aspx#TriToken
      Edge: 14,
      Opera: 40,
    };
  }

  function getBrowserMobileRequirements() {
    return {
      Chrome: 38,
      Firefox: 5,
      Opera: Infinity,
      Safari: 10,
    };
  }

  function redirectIfOld(url) {
    let browser = getBrowserSpec();
    let browserName = browser[0];
    let browserVersion = browser[1];

    let requirements = isMobile() ? getBrowserMobileRequirements() : getBrowseDesktopRequirements();

    if (
      browser &&
      browserVersion &&
      requirements[browserName] &&
      browserVersion < requirements[browserName]
    ) {
      window.location.href = url;
    }
  }

  w.redirectIfOld = redirectIfOld;
  w.getBrowserSpec = getBrowserSpec;
  w.getQueryVariable = getQueryVariable;
  w.getBrowserRequirements = isMobile()
    ? getBrowserMobileRequirements
    : getBrowseDesktopRequirements;
})(window);
