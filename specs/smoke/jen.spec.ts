import {browser, ExpectedConditions as EC, $} from 'protractor'
import {pages} from '../../page_objects'
import {expect} from 'chai'

const {basePage} = pages

describe('My first test suite', function() {
  it('My first tc', async function() {

    await basePage.start()
    await browser.wait(EC.visibilityOf($('.main')), 3000, 'Main error')

    expect(2).eq(3)
  })
})
