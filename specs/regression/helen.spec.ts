import {pages} from '../../page_objects'
import {expect} from 'chai'

const {basePage} = pages

describe('My second test suite', function() {
  it('My second tc', async function() {

    await basePage.start()

    // expect(5).eq(6)
  })
})
