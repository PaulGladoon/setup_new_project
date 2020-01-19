import {ElementFinder, $, browser, ExpectedConditions as EC} from 'protractor'
import {step} from '../../helpers'

class BasePage {
  private logo: ElementFinder

  constructor() {
    this.logo = $('.navbar-brand')
  }

  @step('Open main page')
  public async start() {
    await browser.get('/')
    await browser.wait(EC.visibilityOf(this.logo), 5000, 'Jenkins logo should be visible')
  }
}

export {BasePage}
