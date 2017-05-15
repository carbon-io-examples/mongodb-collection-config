var assert = require('assert')

var carbon = require('carbon-io')
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)
var __     = carbon.fibers.__(module)

// XXX should we also do an admin user example?
// XXX should we also show examples of users not being able to see other users' stuff?

/***************************************************************************************************
 * TEST_EMAIL
 */
TEST_EMAIL = "bob@jones.com",

/***************************************************************************************************
 * TEST_PASSWORD
 */
TEST_PASSWORD = "rainbow",

/***************************************************************************************************
 * Test
 */
__(function() {
  module.exports = o.main({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.test.ServiceTest,

    /***************************************************************************
     * name
     */
    name: "ContactServiceTests",

    /***************************************************************************
     * service
     */
    service: _o('../lib/ContactService'),
  
    /***************************************************************************
     * setup
     */
    setup: function() {
      carbon.carbond.test.ServiceTest.prototype.setup.call(this)
      this.service.db.command({dropDatabase: 1})
    },

    /***************************************************************************
     * teardown
     */
    teardown: function() {
      this.service.db.command({dropDatabase: 1})
      carbon.carbond.test.ServiceTest.prototype.teardown.call(this)
    },

    /***************************************************************************
     * suppressServiceLogging
     */
    suppressServiceLogging: true,

    /***************************************************************************
     * tests
     */
    tests: [
      
      /*************************************************************************
       * POST /users
       *
       * Test adding a user.
       */
      {
        reqSpec: {
          url: '/users',
          method: "POST",
          body: {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
          }
        },
        resSpec: {
          statusCode: 201
        }
      },

      /*************************************************************************
       * GET /users/:_id
       * 
       * Test that we can lookup the user we just added.
       */
      {
        name: "GET /users/:_id",
        reqSpec: function(context) { // We need the previous response to get the _id
          return {
            url: context.httpHistory.getRes(0).headers.location,
            method: "GET",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 200,
          body: function(body, context) {
            assert(body.email === "bob@jones.com")
          }
        }
      },

      /*************************************************************************
       * GET /me
       *
       * Test the me endpoint returns what we just added when we auth as that 
       * user.
       */
      {
        name: "GET /me",
        reqSpec: function(context) {
          return {
            url: "/me",
            method: "GET",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 200,
          body: function(body, context) {
            assert.deepEqual(body, {
              _id: context.httpHistory.getRes(0).headers.location.substring("/users".length + 1),
              email: "bob@jones.com",
            })
          }
        }
      },
      
      /*************************************************************************
       * PATCH /users/:_id
       *
       * Test updating user.
       */
      {
        name: "PATCH /users/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(0).headers.location,
            method: "PATCH",
            headers: {
              Authorization: authorizationHeader(),
            },
            body: {
              email: "bobby@jones.com",
              password: "raindrop"
            }
          }
        },
        resSpec: {
          statusCode: 204 // This is the code for "No Content"
        },

        teardown: function(context) {
          // We changed the email address and password on the account
          // during this test so we need to make sure we set this back
          // to ensure our Http Basic auth header is correctly
          // generated for the rest of our tests.
          TEST_EMAIL = "bobby@jones.com"
          TEST_PASSWORD = "raindrop"
        }
      },

      /*************************************************************************
       * GET /users/:_id
       *
       * Test the previous update worked. 
       */
      {
        name: "GET /users/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(0).headers.location,
            method: "GET",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 200,
          body: function(body) {
            assert(body.email === "bobby@jones.com")
          }
        }
      },

      /*************************************************************************
       * POST /users/:user/contacts
       *
       * Test adding a new contact.
       */
      {  
        name: "POST /users/:user/contacts",
        reqSpec: function(context) {
          return {
            url: `${context.httpHistory.getRes(0).headers.location}/contacts`,
            method: "POST",
            headers: {
              Authorization: authorizationHeader(),
            },
            body: {
              firstName: "Mary",
              lastName: "Smith",
              email: "mary@smith.com",
              phoneNumbers: {
                mobile: "415-555-5555"
              }
            }
          }
        },
        resSpec: {
          statusCode: 201
        }
      },

      /*************************************************************************
       * GET /users/:user/contacts?query=mary@smith.com
       *
       * Test finding the previously added contact by email.
       */
      {
        name: "GET /users/:user/contacts?query=mary@smith.com",
        reqSpec: function(context) {
          return {
            url: `${context.httpHistory.getRes(0).headers.location}/contacts`,
            method: "GET",
            headers: {
              Authorization: authorizationHeader(),
            },
            parameters: {
              query: "mary@smith.com"
            }
          }
        },
        resSpec: {
          statusCode: 200, // XXX Want to test result?
        }
      },

      /*************************************************************************
       * GET /users/:user/contacts/:_id
       *
       * Test finding the previously added contact by _id.
       */
      {
        name: "GET /users/:user/contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-2).headers.location,
            method: "GET",
            headers: {
              Authorization: authorizationHeader()
            }
          }
        },
        resSpec: function(response, context) {
          var previousResponse = context.httpHistory.getRes(-1)
          assert.deepEqual(response.body, previousResponse.body[0])
        }
      },

      /*************************************************************************
       * PUT /users/:user/contacts/:_id
       *
       * Test saving changes to the contact via PUT. Here we are saving back the 
       * entire object. 
       */
      {
        name: "PUT /users/:user/contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-3).headers.location,
            method: "PUT",
            headers: {
              Authorization: authorizationHeader(),
            },
            body: {
              _id: context.httpHistory.getRes(-1).body._id,
              firstName: "Mary",
              lastName: "Smith",
              email: "mary.smith@gmail.com", // We are changing email
              phoneNumbers: {
                mobile: "415-555-5555"
              }
            }
          }
        },
        resSpec: {
          statusCode: 204
        }
      },

      /*************************************************************************
       * DELETE /users/:user/contacts/:_id
       *
       * Test removing the contact.
       */
      {
        name: "DELETE /users/:user/contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-4).headers.location,
            method: "DELETE",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 204
        }
      },

      /*************************************************************************
       * DELETE /users/:user/contacts/:_id
       *
       * Test that the contact is gone.
       */
      {
        name: "DELETE /users/:user/contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-5).headers.location,
            method: "DELETE",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 404 // We should get 404 since this contact is already removed. 
        }
      },

      /*************************************************************************
       * DELETE /users/:user/:_id
       *
       * Test removing the test user.
       */
      {
        name: "DELETE /users/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(0).headers.location,
            method: "DELETE",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 204 // XXX do we like 204?
        }
      },

      /*************************************************************************
       * DELETE /users/:user/:_id
       *
       * Test that the user is gone. 
       */
      {
        name: "GET /users/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(0).headers.location,
            method: "GET",
            headers: {
              Authorization: authorizationHeader(),
            }
          }
        },
        resSpec: {
          statusCode: 401 // Since user is gone we don't get a 404. We can't even authenticate so we get a 401!
        }
      }

    ]

  })
})

/***************************************************************************************************
 * makeBasicHeader
 */
function makeBasicHeader(username, password) {
  var s = new Buffer(`${username}:${password}`).toString('base64')
  return `Basic ${s}`
}

/***************************************************************************************************
 * authorizationHeader()
 */
function authorizationHeader() {
  return makeBasicHeader(TEST_EMAIL, TEST_PASSWORD)
}
