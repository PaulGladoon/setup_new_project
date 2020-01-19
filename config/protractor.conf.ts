/* tslint:disable:object-literal-sort-keys */
import {browser, Config, ElementFinder, ExpectedConditions as EC} from 'protractor'
import {protractorConfigBuild} from './config.build'
import * as remote from 'selenium-webdriver/remote'
import {configure, getLogger} from 'log4js'
import {timeouts} from './timeouts'
import {clearEdgeSessionIfEgists} from '../helpers/msedge'
import * as AllureRuntime from 'allure-js-commons/runtime'
import * as Allure from 'allure-js-commons'
import {retry} from 'protractor-retry'

const runners = {
  mocha: protractorConfigBuild
}

configure({
  appenders: {out: {type: 'stdout', layout: {type: 'basic'}}},
  categories: {default: {appenders: ['out'], level: 'info'}}
})

const requiredRunner = process.env.REQUIRED_RUNNER || 'mocha'

declare const global: any
const globalLogger = getLogger('SICPA SVD AUTOMATION LOGGER')

global.__globalLogger = globalLogger

const conf: Config = {
  ...runners[requiredRunner](),
  // directConnect: true,
  // Connecting directly to ChromeDriverServer
  // restartBrowserBetweenTests: true,
  allScriptsTimeout: 30 * 1000,
  // remote windows run ci/cd build agent
  // seleniumAddress: process.env.REMOTE_URL ? `${process.env.REMOTE_URL}/wd/hub` : undefined,
  // remote windows machine windows
  // seleniumAddress: process.env.SELENIUM_ADDRESS || 'http://172.28.96.67:10260/wd/hub', // remote windows1 run
  // local run with selenium server
  seleniumAddress: process.env.SELENIUM_ADDRESS || 'http://localhost:4444/wd/hub', // local run
  // seleniumSessionId: process.env.SELENIUM_SESSION_ID,
  logLevel: 'ERROR',
  // Needed to make async/await work. Disables control flow.
  SELENIUM_PROMISE_MANAGER: false,

  onPrepare: async () => {
    retry.onPrepare()
    await browser.waitForAngularEnabled(false)
    await browser.manage().window().maximize()
    await browser.setFileDetector(new remote.FileDetector())

    // setting getData() for inputs, textareas and other ElementFinders
    ElementFinder.prototype.getData = async function() {
      await browser.wait(EC.visibilityOf(this), timeouts.xl,
        'Element should be visible for getting it\'s value (onPrepare property set)')
      const tag = await this.getTagName()
      if (tag === 'input' || tag === 'textarea') {
        return this.getAttribute('value')
      } else {
        return this.getText()
      }
    }

    // setting clickOn()
    ElementFinder.prototype.clickOn = async function() {
      await browser.wait(EC.visibilityOf(this), timeouts.xl,
        'Element should be visible for applying clickOn to it (onPrepare property set)')
      await browser.wait(EC.elementToBeClickable(this), timeouts.l,
        'Element should be clickable for applying clickOn to it (onPrepare property set)')
      const tagName = await this.getTagName()
      const clickTags = ['a', 'div', 'button', 'input', 'img', 'i', 'li', 'span']
      if (clickTags.includes(tagName)) {
        await this.click()
      }
    }
  },
  onComplete: async () => {
    const sessionId = (await browser.driver.getSession()).getId()
    const seleniumAddress = (await browser.getProcessedConfig()).seleniumAddress
    console.log(sessionId, seleniumAddress)
    await browser.close().catch(console.error)
  },
  beforeLaunch: async () => {
    if (process.env.RUN_BROWSER === 'edge') {
      await clearEdgeSessionIfEgists()
    }
  },
  onCleanUp: async (results) => {
    retry.onCleanUp(results)
    if (browser.___browserName === 'MicrosoftEdge') {
      await clearEdgeSessionIfEgists()
    }
  },
  afterLaunch: async () => {
    return retry.afterLaunch(2)
  }
}

exports.config = conf
