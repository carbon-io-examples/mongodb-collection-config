var carbon = require('carbon-io')
var __     = carbon.fibers.__(module)
var _o     = carbon.bond._o(module)
var o      = carbon.atom.o(module).main // Note the .main here since this is the main application 

/***************************************************************************************************
 * MeEndpoint
 *
 */
__(function() {
  module.exports = o({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.Endpoint,

    /***************************************************************************
     * get
     */
    get: {
      responses: [
        {
          statusCode: 200,
          description: "Success",
          schema: {
            type: "object",
            properties: {
              _id: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: [ '_id', 'email' ],
            additionalProperties: false
          },
        }
      ],
      
      service: function(req) {
        var users = _o('./UsersEndpoint')
        return users.publicUserView(req.user)
      }
    },
  })
})
