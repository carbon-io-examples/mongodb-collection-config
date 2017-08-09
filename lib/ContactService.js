var carbon = require('carbon-io')
var __  = carbon.fibers.__(module)
var _o  = carbon.bond._o(module)
var o   = carbon.atom.o(module).main // Note the .main here since this is the main application

/***************************************************************************************************
 * ContactService
 */
__(function() {
  module.exports = o({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.Service,

    /***************************************************************************
     * description
     */
    description: "A public API for managing Contacts",

    /***************************************************************************
     * environmentVariables
     */
    environmentVariables: {
      DB_URI: {
        help: "URI for the MongoDB database to connect to. Defaults to 'mongodb://localhost:27017/contacts'",
        required: false
      },
    },

    /***************************************************************************
     * port
     */
    port: 9900,

    /***************************************************************************
     * authenticator
     */
    authenticator: o({
      _type: carbon.carbond.security.MongoDBHttpBasicAuthenticator,

      passwordHashFn: carbon.carbond.security.BcryptHasher,
      userCollection: "users",
      usernameField: "email",
      passwordField: "password"
    }),

    /***************************************************************************
     * dbUri
     */
    dbUri: _o('env:DB_URI') || 'mongodb://localhost:27017/contacts',

    /***************************************************************************
     * endpoints
     *
     * The URL structure for this API will be:
     *
     * /users
     * /users/:user
     * /users/:user/contacts
     * /users/:user/contacts/:contact
     * /me
     *
     * The ContactsEndpoint is registered as a child endpoint of the
     * UsersEndpoint in UsersEndpoint.js.
     */
    endpoints : {
      users: _o('./UsersEndpoint'),
      me: _o('./MeEndpoint')
    }
  })
})





