var carbon = require('carbon-io')
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)
var __     = carbon.fibers.__(module)

__(function() {
  module.exports = o.main({

    /***************************************************************************
     * _type
     */
    _type: carbon.testtube.Test,

    /***************************************************************************
     * name
     */
    name: "ContactServiceTestSuite",
    
    /***************************************************************************
     * tests
     */
    tests: [
      _o('./ContactServiceTest')
    ]
  })
})
