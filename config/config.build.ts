import * as argsParser from 'minimist'
import {Logger} from 'protractor/built/logger'
import {envToBrowser} from './shared.config'

const ENV_ARGS = argsParser(process.argv.slice(2))

/* tslint:disable:no-unused-expression */
!ENV_ARGS.l && (Logger.prototype.info = () => ({}))

const envToSpecs = () => {
  const specsMap = {
    smoke: ['./specs/smoke/*.ts'],
    regression: ['./specs/regression/*.ts'],
    all: ['./specs/**/*.ts']
  }

  const suits = process.env.RUN_SUITS || 'all'
  return process.env.SPECS_PATH || specsMap[suits]
}

function protractorConfigBuild() {
  const baseUrl = process.env.RUN_ENV || 'https://jenkins.io/'

  const mochaOpts = {
    timeout: 350 * 1000,
    fullTrace: true,
    reporter: ENV_ARGS.l ? 'spec' : 'mocha-allure-reporter'
  }
  const multiCapabilities = envToBrowser()
  const specs = envToSpecs()

  return {
    framework: 'mocha',
    specs,
    mochaOpts,
    baseUrl,
    multiCapabilities
  }
}

export {protractorConfigBuild}
