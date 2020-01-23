const envToBrowser = () => {
  const browsersMap = {
    chrome: {
      browserName: 'chrome',
      maxInstances: 5,
      shardTestFiles: true,
      version: '79',
      chromeOptions: {
        args: [
          '--disable-gpu',
          '--disable-gpu-program-cache',
          '--disable-gpu-shader-disk-cache',
          '--process-per-tab',
          '--process-per-site'
        ],
        prefs: {
          'safebrowsing.enabled': true
        }
      }
    },
    ie: {
      /* tslint:disable:object-literal-key-quotes */
      browserName: 'internet explorer',
      version: '11',
      maxInstances: 1,
      // INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS: true,
      shardTestFiles: true,
      requireWindowFocus: true,
      unexpectedAlertBehaviour: 'dismiss',
      'ie.browserCommandLineSwitches': '-private',
      // 'ie.ignoreProtectedModeSettings': true,
      'ie.ensureCleanSession': true,
      // 'ie.forceCreateProcessApi': true
    },
    edge: {
      browserName: 'MicrosoftEdge',
      maxInstances: 5,
      shardTestFiles: true
    },
    firefox: {
      browserName: 'firefox',
      maxInstances: 8,
      shardTestFiles: true,
      'acceptInsecureCerts': true,
      version: '65',
      'moz:firefoxOptions': {
        prefs: {
          'browser.download.folderList': 2,
          'browser.download.manager.showWhenStarting': false,
          'browser.helperApps.alwaysAsk.force': false,
          'browser.download.manager.useWindow': false,
          /* tslint:disable */
          'browser.helperApps.neverAsk.saveToDisk': 'application/octet-stream, application/msword, application/json, text/comma-separated-values, text/csv, text/tab-delimited-values, application/csv, application/excel, application/vnd.ms-excel, application/vnd.msexcel, text/anytext, text/plaintext, application/x-www-form-urlencoded, application/xlsx, binary/octet-stream, text/binary, application/zip, application/rtf, application/pdf',
          'pdfjs.disabled': true
          /* tslint:enable */
        }
      }
    }
  }

  const envBrowserMap = {
    ie: ['ie'],
    all: ['ie', 'chrome', 'firefox'],
    edge: ['edge'],
    firefox: ['firefox'],
    chrome: ['chrome'],
    modern: ['chrome', 'firefox'],
    iefirefox: ['ie', 'firefox'],
    iechrome: ['ie', 'chrome']
  }

  const runBrowsers = process.env.RUN_BROWSER || 'edge'

  return envBrowserMap[runBrowsers.trim()].map((br) => browsersMap[br])
  /* tslint:enable:no-unused-expression */
}

export {envToBrowser}
