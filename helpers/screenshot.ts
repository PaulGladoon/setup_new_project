import {browser} from 'protractor'
import * as argsParser from 'minimist'

const ENV_ARGS = argsParser(process.argv.slice(2))

declare const allure: any

export const takeScreenshot = ENV_ARGS.local ? takeScreenshotStub : takeScreenshotAllure

async function takeScreenshotStub(title = 'Stub') {
  return
}

async function takeScreenshotAllure(title = 'Screenshot') {
  try {
    const png = await browser.takeScreenshot()
    return allure.createAttachment(title, new Buffer(png, 'base64'), 'image/png')
  } catch (error) {
    if (error.toString().includes('window was already closed')) {
      return
    }
  }
}
