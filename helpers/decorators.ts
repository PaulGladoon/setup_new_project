import {takeScreenshot} from './screenshot'
import * as argsParser from 'minimist'
import {ElementFinder, browser} from 'protractor'

declare const allure: any
declare const __globalLogger: any

const ENV_ARGS = argsParser(process.argv.slice(2))
const step = ENV_ARGS.l ? stepStub : stepAllure

function stepStub(smg, lowPriority = false) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args) {
      const assertObject = (argAssert) => argAssert !== null && typeof argAssert === 'object'
      const assertNotElFinder = (argAssert) => !(argAssert instanceof ElementFinder)
      const itemContainsElementFinder = (paramToAssert) => {
        if (!assertObject(paramToAssert) || !assertNotElFinder(paramToAssert)) {return false}
        return Object.keys(paramToAssert).some((key) => {
          if (assertObject(paramToAssert[key]) && assertNotElFinder(paramToAssert[key])) {
            return itemContainsElementFinder(paramToAssert[key])
          }
          return paramToAssert[key] instanceof ElementFinder
        })
      }
      const argsWithoutElementFinder = args.filter((el) => !itemContainsElementFinder(el))

      __globalLogger.error('_________________ method name: ', method.name)
      __globalLogger.error('_________________ method args: ', JSON.stringify(argsWithoutElementFinder))
      __globalLogger.error('\n')
      __globalLogger.error('\n')

      try {
        return method.apply(this, args)
      } catch (error) {
        __globalLogger.error('_________________ method error: ', error.toString())
        throw error
      }
    }
    return descriptor
  }
}

function stepAllure(msg: string, lowPriority = false) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const reporter = allure._allure
    descriptor.value = async function(...args) {
      if (browser.__browserName === 'MicrosoftEdge') {await browser.sleep(500)}
      const originalArgs = args

      const argsWithoutElementFinder = args.filter((el) => !(el instanceof ElementFinder))

      allure.addEnvironment('Automation environment', process.env.RUN_ENV)
      allure.addEnvironment('Automation browsers', ENV_ARGS.browsers)
      allure.addEnvironment('Automation suit', process.env.RUN_SUITS)

      if (process.env.GREP_TEST && process.env.GREP_TEST.length) {
        allure.addEnvironment('Automation grep option', process.env.GREP_TEST)
      }
      allure.addEnvironment('Build number', process.env.BUILD_NUMBER)

      let result
      const objectArgs = args.filter((arg) => typeof arg === 'object')
      const notObjects = args.filter((arg) => typeof arg !== 'object')

      const params = notObjects.map((arg) => {
        if (arg != null) {
          return JSON.stringify(argsWithoutElementFinder)
        }
      }).join()
      const stepName = params.length ? `${msg}(${params})` : msg
      reporter.startStep(stepName, Date.now())
      objectArgs.forEach((arg, index) => {
        const assertObject = (argAssert) => argAssert !== null && typeof argAssert === 'object'
        const assertNotElFinder = (argAssert) => !(argAssert instanceof ElementFinder)
        const itemContainsElementFinder = (paramToAssert) => {
          if (!assertObject(paramToAssert) || !assertNotElFinder(paramToAssert)) {return false}
          return Object.keys(paramToAssert).some((key) => {
            if (assertObject(paramToAssert[key]) && assertNotElFinder(paramToAssert[key])) {
              return itemContainsElementFinder(paramToAssert[key])
            }
            return paramToAssert[key] instanceof ElementFinder
          })
        }

        if (assertObject(arg) && assertNotElFinder(arg) && !itemContainsElementFinder(arg)) {
          const param = JSON.stringify(arg, null, '\t')
          allure.createAttachment(`arg${index}`, param, 'application/json')
        }
      })
      try {
        result = await method.apply(this, originalArgs)
        /* tslint:disable:no-unused-expression */
        ENV_ARGS.s && !lowPriority && await takeScreenshot(stepName)
        reporter.endStep('passed', Date.now())
        return result
      } catch (e) {
        /* tslint:disable:no-unused-expression */
        allure.createAttachment('ERROR', e.toString(), 'text/plain')
        !lowPriority && await takeScreenshot('Error')
        if (e.toString().includes('AssertionError')) {
          reporter.endStep('failed', Date.now())
        } else {
          reporter.endStep('broken', Date.now())
        }
        throw e
      }
    }
    return descriptor
  }
}

const attachDataToReport = ENV_ARGS.l ? attachDataToReportStub : attachDataToReportAllure

function attachDataToReportStub(title, params, screen = false) {
  return title + params
}

async function attachDataToReportAllure(title, params, screen = false) {

  const reporter = allure._allure
  const paramsWithoutElementFinder = params
  reporter.startStep(title, Date.now())
  try {
    if (screen) {
      await takeScreenshot()
    }
    typeof params === 'object'
      ? allure.createAttachment(`${title}`, JSON.stringify(paramsWithoutElementFinder, null, '\t'), 'application/json')
      : allure.createAttachment(`${title}`, params, 'text/plain')
    reporter.endStep('passed', Date.now())
  } catch (error) {
    reporter.endStep('broken', Date.now())
  }
}

const reportStep = ENV_ARGS.l ? reportStepStub : reportStepAllure

async function reportStepStub(title, fn, screenshot = true) {
  await fn()
}
async function reportStepAllure(title, fn, screenshot = true) {
  const reporter = allure._allure
  try {
    reporter.startStep(title, Date.now())
    await fn()
    if (screenshot) {await takeScreenshot()}
    reporter.endStep('passed', Date.now())
  } catch (e) {
    console.log('ASSERTION ERROR')
    await takeScreenshot()
    reporter.endStep('failed', Date.now())
    throw e
  }
}

function wrappCB(fn): any {
  return async function() {
    try {
      await fn.call(this)
    } catch (e) {
      throw e
    }
  }
}

function wrappedIt(specTitle, specBodyCallback) {
  return it(specTitle,
    async function() {
      try {
        await specBodyCallback.call(this)
      } catch (err) {
        const error = new Error()
        error.name = err.name
        const isAssertionError = err.name === 'AssertionError' || err.code === 'ERR_ASSERTION'
        const stdOutTitle = `SPECTITLE:[${specTitle}${isAssertionError ? ' AssertionError' : ''}]`
        process.stdout.write(stdOutTitle)
        throw error
      }
    }
  )
}

export {reportStep, step, attachDataToReport, wrappCB, wrappedIt}
